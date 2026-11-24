import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

/** Sesión actual de Supabase Auth. `undefined` = cargando, `null` = sin sesión. */
export function useSession() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  return supabase ? session : null
}

export function signInWithEmail(email) {
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  })
}

export function signOut() {
  return supabase.auth.signOut()
}
