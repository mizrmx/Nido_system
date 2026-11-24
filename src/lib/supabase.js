import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
// Publishable key (sb_publishable_…). La anon key queda como respaldo para proyectos viejos.
const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && anonKey ? createClient(url, anonKey) : null

if (!supabase) {
  console.warn('Supabase no configurado: crea .env.local a partir de .env.example')
}

/** Canal único por hogar: cambios de datos + presencia. */
export function householdChannel(householdId) {
  return supabase.channel(`household:${householdId}`, {
    config: { presence: { key: householdId } },
  })
}
