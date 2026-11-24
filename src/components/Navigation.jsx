// Barra inferior (móvil) y sidebar (desktop ≥ 1024px)
import { MODULES } from '../lib/modules.js'

const ICONS = {
  inicio: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
  planes: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  viajes: <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />,
  comida: <><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></>,
  habitos: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
}


function Icon({ id, active }) {
  return (
    <svg viewBox="0 0 24 24" className="size-[22px]" fill="none" stroke="currentColor" strokeWidth={active ? 2.25 : 1.75} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[id]}
    </svg>
  )
}

export function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-between border-t border-border bg-surface px-5 pt-2 pb-[calc(12px+env(safe-area-inset-bottom))] lg:hidden">
      {MODULES.map((m) => {
        const on = m.id === active
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={`flex min-w-11 flex-col items-center gap-1 px-1.5 ${on ? 'text-ink' : 'text-ink-muted'}`}
            aria-current={on ? 'page' : undefined}
          >
            <Icon id={m.id} active={on} />
            <span className={`text-caption ${on ? 'font-semibold' : ''}`}>{m.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export function Sidebar({ active, onChange, onQuickAdd }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-62 shrink-0 flex-col gap-1.5 border-r border-border bg-surface px-5 py-8 lg:flex">
      <p className="mb-5 text-display font-semibold">Nido</p>
      {MODULES.map((m) => {
        const on = m.id === active
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-etiqueta ${on ? 'bg-surface-alt font-semibold text-ink' : 'text-ink-muted'}`}
          >
            <Icon id={m.id} active={on} />
            {m.label}
          </button>
        )
      })}
      <button
        type="button"
        onClick={onQuickAdd}
        className="mt-4 flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-etiqueta font-semibold text-ink-inverse"
      >
        + Captura rápida <kbd className="opacity-60">N</kbd>
      </button>
    </aside>
  )
}
