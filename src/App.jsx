import { useEffect, useState } from 'react'
import { BottomNav, Sidebar } from './components/Navigation.jsx'
import { MODULES } from './lib/modules.js'
import { Fab } from './components/ui.jsx'
import Inicio from './features/inicio/Inicio.jsx'
import QuickAdd from './features/captura/QuickAdd.jsx'

function Placeholder({ title }) {
  return (
    <>
      <h1 className="text-display font-semibold">{title}</h1>
      <p className="mt-2 text-cuerpo text-ink-muted">Pantalla pendiente — ver Figma.</p>
    </>
  )
}

export default function App() {
  const [active, setActive] = useState('inicio')
  const [quickAdd, setQuickAdd] = useState(false)

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
        {active === 'inicio' ? <Inicio /> : <Placeholder title={title} />}
      </main>
      <Fab onClick={() => setQuickAdd(true)} />
      <BottomNav active={active} onChange={setActive} />
      {quickAdd && <QuickAdd onClose={() => setQuickAdd(false)} />}
    </div>
  )
}
