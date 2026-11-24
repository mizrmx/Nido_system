// Componentes base — espejo de Figma (página 🎨 Fundamentos → Componentes)

const PERSONA = {
  A: { bg: 'bg-persona-a', label: 'M' },
  B: { bg: 'bg-persona-b', label: 'P' },
  Juntas: { bg: 'bg-juntas', label: 'MP' },
}

const COLOR_TO_PERSONA = { persona_a: 'A', persona_b: 'B' }

/** Avatar por persona ('A' | 'B' | 'Juntas') o a partir de un perfil de Supabase. */
export function Avatar({ persona = 'A', label, profile, online }) {
  const key = profile ? (COLOR_TO_PERSONA[profile.color] ?? 'A') : persona
  const p = PERSONA[key]
  const text = label ?? (profile?.display_name ? profile.display_name.trim().charAt(0).toUpperCase() : p.label)
  return (
    <span className="relative inline-grid shrink-0">
      <span
        title={profile?.display_name}
        className={`${p.bg} inline-grid size-7 place-items-center rounded-full text-[10px] font-bold text-ink-inverse ring-2 ring-surface`}
      >
        {text}
      </span>
      {online && <span className="absolute -right-0.5 -bottom-0.5 z-10 size-2.5 rounded-full bg-success ring-2 ring-surface" aria-label="En línea" />}
    </span>
  )
}

export function Tag({ children, active = false, ...props }) {
  return (
    <button
      type="button"
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-etiqueta font-medium transition ${
        active ? 'bg-ink text-ink-inverse' : 'border border-border bg-surface text-ink'
      }`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Checkbox({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange?.(!checked)}
      className={`grid size-6 shrink-0 place-items-center rounded-lg transition ${
        checked ? 'bg-success' : 'border-[1.5px] border-border bg-surface'
      }`}
    >
      {checked && (
        <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
    </button>
  )
}

export function Button({ children, variant = 'primario', className = '', ...props }) {
  const styles =
    variant === 'primario' ? 'bg-ink text-ink-inverse' : 'border border-border bg-surface text-ink'
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-encabezado font-semibold ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '' }) {
  return <section className={`rounded-md bg-surface p-[18px] shadow-suave ${className}`}>{children}</section>
}

export function Fab({ onClick }) {
  return (
    <button
      type="button"
      aria-label="Captura rápida"
      onClick={onClick}
      className="fixed right-5 bottom-[calc(92px+env(safe-area-inset-bottom))] grid size-15 place-items-center rounded-full bg-persona-a shadow-flotante lg:bottom-10 lg:right-10"
    >
      <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
        <path d="M5 12h14M12 5v14" />
      </svg>
    </button>
  )
}
