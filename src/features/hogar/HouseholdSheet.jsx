import { useState } from 'react'
import { Avatar, Button } from '../../components/ui.jsx'
import { signOut } from '../../lib/session.js'

// Hoja con datos del hogar: miembros, estado en línea y código de invitación.
export default function HouseholdSheet({ data, online, onClose }) {
  const { household, members, partner } = data
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard?.writeText(household.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end bg-ink/40 lg:items-center lg:justify-center" onClick={onClose}>
      <section
        onClick={(e) => e.stopPropagation()}
        className="flex w-full flex-col gap-5 rounded-t-[28px] bg-surface px-5 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))] lg:max-w-md lg:rounded-lg lg:pt-5"
      >
        <span className="mx-auto h-1.5 w-10 rounded-full bg-border lg:hidden" />
        <h2 className="text-titulo font-semibold">{household.name}</h2>

        <ul className="flex flex-col gap-3">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-3">
              <Avatar profile={m} />
              <span className="flex-1 text-cuerpo">{m.display_name}</span>
              <span className={`text-caption ${online.includes(m.id) ? 'text-success' : 'text-ink-muted'}`}>
                {online.includes(m.id) ? 'En línea' : 'Desconectada'}
              </span>
            </li>
          ))}
        </ul>

        {!partner && (
          <div className="rounded-md bg-juntas-soft p-4">
            <p className="text-etiqueta text-ink-muted">Comparte este código con tu pareja</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-display font-semibold tracking-[0.3em]">{household.invite_code}</span>
              <Button variant="secundario" onClick={copy}>{copied ? 'Copiado' : 'Copiar'}</Button>
            </div>
          </div>
        )}

        <Button variant="secundario" onClick={signOut} className="w-full">Cerrar sesión</Button>
      </section>
    </div>
  )
}
