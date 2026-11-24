-- Fase 1 · colores por persona y onboarding
-- Quien crea el hogar queda como persona_a; quien se une, persona_b (si no eligieron otro).

create or replace function create_household(p_name text default 'Nuestro nido')
returns households language plpgsql security definer set search_path = public as $$
declare h households;
begin
  if exists (select 1 from household_members where user_id = auth.uid()) then
    raise exception 'Ya perteneces a un hogar';
  end if;
  insert into households (name) values (p_name) returning * into h;
  insert into household_members (household_id, user_id, role) values (h.id, auth.uid(), 'owner');
  update profiles set color = coalesce(color, 'persona_a') where id = auth.uid();
  return h;
end $$;

create or replace function join_household(p_code text)
returns households language plpgsql security definer set search_path = public as $$
declare
  h households;
  taken persona_color;
begin
  select * into h from households where invite_code = trim(p_code);
  if h.id is null then raise exception 'Código inválido'; end if;
  if exists (select 1 from household_members where household_id = h.id and user_id = auth.uid()) then
    return h;
  end if;
  if exists (select 1 from household_members where user_id = auth.uid()) then
    raise exception 'Ya perteneces a un hogar';
  end if;
  if (select count(*) from household_members where household_id = h.id) >= 2 then
    raise exception 'Este hogar ya tiene dos personas';
  end if;
  insert into household_members (household_id, user_id) values (h.id, auth.uid());

  select p.color into taken
  from household_members m join profiles p on p.id = m.user_id
  where m.household_id = h.id and m.user_id <> auth.uid()
  limit 1;

  update profiles
  set color = case when taken = 'persona_a' then 'persona_b'::persona_color else 'persona_a'::persona_color end
  where id = auth.uid();
  return h;
end $$;

-- Un usuario pertenece como máximo a un hogar
create unique index if not exists household_members_one_per_user on household_members (user_id);

-- El cliente actualiza nombre propio desde el onboarding
grant execute on function create_household(text) to authenticated;
grant execute on function join_household(text) to authenticated;

-- Avisar en vivo cuando la pareja se une
alter publication supabase_realtime add table household_members;
