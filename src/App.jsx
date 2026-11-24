import { useEffect, useState } from 'react'
import { BottomNav, Sidebar } from './components/Navigation.jsx'
import { Fab } from './components/ui.jsx'
import { MODULES } from './lib/modules.js'
import { useSession } from './lib/session.js'
import { useHousehold, useHouseholdRealtime } from './lib/household.js'
import { supabase } from './lib/supabase.js'
import Login from './features/auth/Login.jsx'
import Onboarding from './features/onboarding/Onboarding.jsx'
import HouseholdSheet from './features/hogar/HouseholdSheet.jsx'
import Inicio from './features/inicio/Inicio.jsx'
import QuickAdd from './features/captura/QuickAdd.jsx'

// Sin Supabase configurado la app corre en modo demo con datos de ejemplo.
const DEMO = {
  household: { id: 'demo', name: 'Nuestro nido (demo)', invite_code: '000000' },
  me: { id: 'demo-a', display_name: 'Mayra', color: 'persona_a' },
  partner: { id: 'demo-b', display_name: 'Pareja', color: 'persona_b' },
}
DEMO.members = [DEMO.me, DEMO.partner]

function Splash() {
  return <div className="grid min-h-dvh place-items-center text-etiqueta text-ink-muted">Cargando…</div>
}

export default function App() {
  const session = useSession()
  const userId = session?.user?.id
  const household = useHousehold(userId)

  if (!supabase) return <Shell data={DEMO} demo />
  if (session === undefined) return <Splash />
  if (!session) return <Login />
  if (household.isLoading) return <Splash />
  if (household.error) return <div className="p-6 text-cuerpo text-persona-a">Error: {household.error.message}</div>
  if (!household.data) return <Onboarding userId={userId} />
  return <Shell data={household.data} userId={userId} />
}

function Shell({ data, userId, demo = false }) {
  const [active, setActive] = useState('inicio')
  const [quickAdd, setQuickAdd] = useState(false)
  const [hogar, setHogar] = useState(false)
  const realtimeOnline = useHouseholdRealtime(demo ? null : data.household.id, userId)
  const online = demo ? [data.me.id] : realtimeOnline

  // Atajo de teclado N = captura rápida (desktop)
  useEffect(() => {
    const onKey = (e) => {
      const typing = ['INPUT', 'TEXTAREA'].includes(e.target.tagName)
      if (!typing && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        setQuickAdd(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const title = MODULES.find((m) => m.id === active)?.label

  return (
    <div className="flex min-h-dvh">
      <Sidebar active={active} onChange={setActive} onQuickAdd={() => setQuickAdd(true)} />
      <main className="mx-auto w-full max-w-5xl px-5 pt-14 pb-44 lg:px-10 lg:pt-10">
        {demo && (
          <p className="mb-4 rounded-sm bg-info-soft px-3 py-2 text-caption text-ink">
            Modo demo: crea <code>.env.local</code> con tus llaves de Supabase para iniciar sesión.
          </p>
        )}
        {active === 'inicio' ? (
          <Inicio me={data.me} partner={data.partner} online={online} onOpenHousehold={() => setHogar(true)} />
        ) : (
          <>
            <h1 className="text-display font-semibold">{title}</h1>
            <p className="mt-2 text-cuerpo text-ink-muted">Pantalla pendiente — ver Figma.</p>
          </>
        )}
      </main>
      <Fab onClick={() => setQuickAdd(true)} />
      <BottomNav active={active} onChange={setActive} />
      {quickAdd && <QuickAdd me={data.me} onClose={() => setQuickAdd(false)} />}
      {hogar && <HouseholdSheet data={data} online={online} onClose={() => setHogar(false)} />}
    </div>
  )
}
