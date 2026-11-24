-- Nido · esquema inicial
-- Un hogar (households) = una pareja. Toda tabla de módulo lleva household_id para RLS y Realtime.

create extension if not exists pgcrypto;

-- ───────────── Enums ─────────────
create type persona_color  as enum ('persona_a', 'persona_b');
create type member_role    as enum ('owner', 'member');
create type place_category as enum ('cafe', 'restaurante', 'actividad', 'pelicula_serie', 'otro');
create type place_status   as enum ('pendiente', 'hecho');
create type trip_status    as enum ('idea', 'planeando', 'confirmado', 'realizado');
create type trip_item_kind as enum ('imperdible', 'tarea');
create type meal_slot      as enum ('desayuno', 'comida', 'cena', 'snack');
create type habit_scope    as enum ('individual', 'pareja');
create type habit_freq     as enum ('diaria', 'semanal');

-- ───────────── Núcleo ─────────────
create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  color        persona_color,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

create table households (
  id          uuid primary key default gen_random_uuid(),
  name        text not null default 'Nuestro nido',
  invite_code text not null unique default lpad((floor(random() * 1000000))::int::text, 6, '0'),
  created_at  timestamptz not null default now()
);

create table household_members (
  household_id uuid not null references households (id) on delete cascade,
  user_id      uuid not null references profiles (id) on delete cascade,
  role         member_role not null default 'member',
  joined_at    timestamptz not null default now(),
  primary key (household_id, user_id)
);

-- Helper para RLS: ¿el usuario actual pertenece al hogar?
create or replace function is_member(hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from household_members where household_id = hid and user_id = auth.uid());
$$;

-- ───────────── Módulos ─────────────
create table inbox_items (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  title        text not null,
  moved_to     text,          -- tabla destino al categorizar
  moved_id     uuid,
  processed_at timestamptz,
  created_by   uuid references profiles (id) default auth.uid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz,
  client_id    text
);

create table places (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  name         text not null,
  category     place_category not null default 'otro',
  location_url text,
  notes        text,
  status       place_status not null default 'pendiente',
  proposed_by  uuid references profiles (id) default auth.uid(),
  scheduled_at timestamptz,
  done_at      timestamptz,
  position     text,
  created_by   uuid references profiles (id) default auth.uid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz,
  client_id    text
);

create table trips (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  destination  text not null,
  status       trip_status not null default 'idea',
  date_from    date,
  date_to      date,
  date_note    text,          -- fecha tentativa libre: "Primavera 2028"
  budget_mxn   numeric(12, 2),
  notes        text,
  proposed_by  uuid references profiles (id) default auth.uid(),
  position     text,
  created_by   uuid references profiles (id) default auth.uid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz,
  client_id    text
);

create table trip_items (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  trip_id      uuid not null references trips (id) on delete cascade,
  title        text not null,
  kind         trip_item_kind not null default 'imperdible',
  done         boolean not null default false,
  done_by      uuid references profiles (id),
  position     text,
  created_by   uuid references profiles (id) default auth.uid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz,
  client_id    text
);

create table meal_plan (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  day          date not null,
  slot         meal_slot not null,
  dish         text not null,
  cook_id      uuid references profiles (id),
  notes        text,
  created_by   uuid references profiles (id) default auth.uid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz,
  client_id    text
);

create table shopping_items (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  name         text not null,
  qty          text,
  category     text,
  checked      boolean not null default false,
  checked_by   uuid references profiles (id),
  meal_id      uuid references meal_plan (id) on delete set null,
  position     text,
  created_by   uuid references profiles (id) default auth.uid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz,
  client_id    text
);

create table habits (
  id              uuid primary key default gen_random_uuid(),
  household_id    uuid not null references households (id) on delete cascade,
  name            text not null,
  scope           habit_scope not null default 'individual',
  frequency       habit_freq not null default 'diaria',
  target_per_week int not null default 7 check (target_per_week between 1 and 7),
  owner_id        uuid references profiles (id),  -- null = aplica a ambas
  archived_at     timestamptz,
  created_by      uuid references profiles (id) default auth.uid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  client_id       text
);

create table habit_logs (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  habit_id     uuid not null references habits (id) on delete cascade,
  user_id      uuid not null references profiles (id) default auth.uid(),
  day          date not null default current_date,
  done         boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  client_id    text,
  unique (habit_id, user_id, day)
);

create table activity (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  actor_id     uuid references profiles (id),
  entity       text not null,
  entity_id    uuid,
  verb         text not null,   -- crear | marcar | mover | editar
  summary      text,
  created_at   timestamptz not null default now()
);

-- ───────────── Índices ─────────────
create index on inbox_items    (household_id, updated_at);
create index on places         (household_id, updated_at);
create index on trips          (household_id, updated_at);
create index on trip_items     (trip_id);
create index on meal_plan      (household_id, day);
create index on shopping_items (household_id, updated_at);
create index on habits         (household_id, updated_at);
create index on habit_logs     (household_id, day);
create index on activity       (household_id, created_at desc);

-- ───────────── updated_at automático ─────────────
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

do $$
declare t text;
begin
  foreach t in array array['inbox_items','places','trips','trip_items','meal_plan','shopping_items','habits','habit_logs'] loop
    execute format('create trigger %I_touch before update on %I for each row execute function touch_updated_at()', t, t);
  end loop;
end $$;

-- ───────────── RLS ─────────────
alter table profiles          enable row level security;
alter table households        enable row level security;
alter table household_members enable row level security;

create policy "perfil propio o de la pareja" on profiles for select using (
  id = auth.uid() or exists (
    select 1 from household_members a join household_members b on a.household_id = b.household_id
    where a.user_id = auth.uid() and b.user_id = profiles.id)
);
create policy "editar perfil propio" on profiles for all using (id = auth.uid()) with check (id = auth.uid());

create policy "ver mi hogar"    on households for select using (is_member(id));
create policy "editar mi hogar" on households for update using (is_member(id));

create policy "ver miembros de mi hogar" on household_members for select using (is_member(household_id));

do $$
declare t text;
begin
  foreach t in array array['inbox_items','places','trips','trip_items','meal_plan','shopping_items','habits','habit_logs','activity'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "hogar" on %I for all using (is_member(household_id)) with check (is_member(household_id))', t);
  end loop;
end $$;

-- ───────────── Perfil automático al registrarse ─────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ───────────── Crear hogar / unirse con código ─────────────
create or replace function create_household(p_name text default 'Nuestro nido')
returns households language plpgsql security definer set search_path = public as $$
declare h households;
begin
  insert into households (name) values (p_name) returning * into h;
  insert into household_members (household_id, user_id, role) values (h.id, auth.uid(), 'owner');
  return h;
end $$;

create or replace function join_household(p_code text)
returns households language plpgsql security definer set search_path = public as $$
declare h households;
begin
  select * into h from households where invite_code = p_code;
  if h.id is null then raise exception 'Código inválido'; end if;
  if (select count(*) from household_members where household_id = h.id) >= 2 then
    raise exception 'Este hogar ya tiene dos personas';
  end if;
  insert into household_members (household_id, user_id) values (h.id, auth.uid())
    on conflict do nothing;
  return h;
end $$;

-- ───────────── Realtime ─────────────
alter publication supabase_realtime add table
  inbox_items, places, trips, trip_items, meal_plan, shopping_items, habits, habit_logs, activity;
