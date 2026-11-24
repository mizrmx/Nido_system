import { useState } from 'react'
import { Avatar, Card, Checkbox } from '../../components/ui.jsx'

// Datos de ejemplo — se reemplazan por consultas a Supabase en la fase 1
const HABITOS = [
  { id: 1, name: 'Tomar 2 L de agua', scope: 'individual', a: true, b: true },
  { id: 2, name: 'Caminar 30 min', scope: 'pareja', a: true },
  { id: 3, name: 'Leer 15 páginas', scope: 'individual', a: false, b: true },
]
const COMIDA = [
  ['Desayuno', 'Avena con plátano'],
  ['Comida', 'Pollo al limón + ensalada'],
  ['Cena', 'Tacos de pescado'],
  ['Snack', 'Yogurt con granola'],
]

const fecha = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

export default function Inicio() {
  const [habitos, setHabitos] = useState(HABITOS)
  const toggle = (id, who) => setHabitos((hs) => hs.map((h) => (h.id === id ? { ...h, [who]: !h[who] } : h)))
  const total = habitos.reduce((n, h) => n + (h.scope === 'pareja' ? 1 : 2), 0)
  const hechos = habitos.reduce((n, h) => n + (h.a ? 1 : 0) + (h.scope === 'individual' && h.b ? 1 : 0), 0)

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-etiqueta text-ink-muted first-letter:uppercase">{fecha}</p>
          <h1 className="text-display font-semibold">Hola, Mayra</h1>
        </div>
        <div className="flex -space-x-1.5">
          <Avatar persona="A" />
          <Avatar persona="B" />
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-encabezado font-semibold">Hábitos de hoy</h2>
            <span className="text-etiqueta text-ink-muted">{hechos} de {total}</span>
          </div>
          <div className="mt-3.5 h-2 rounded-full bg-surface-alt">
            <div className="h-2 rounded-full bg-success transition-all" style={{ width: `${(hechos / total) * 100}%` }} />
          </div>
          <ul className="mt-3.5 flex flex-col gap-3.5">
            {habitos.map((h) => (
              <li key={h.id} className="flex items-center gap-2.5">
                <div className="flex-1">
                  <p className="text-cuerpo">{h.name}</p>
                  <p className="text-caption text-ink-muted">{h.scope === 'pareja' ? 'En pareja' : 'Individual'}</p>
                </div>
                {h.scope === 'pareja' ? (
                  <>
                    <Avatar persona="Juntas" />
                    <Checkbox checked={h.a} onChange={() => toggle(h.id, 'a')} label={`${h.name} juntas`} />
                  </>
                ) : (
                  <>
                    <Avatar persona="A" />
                    <Checkbox checked={h.a} onChange={() => toggle(h.id, 'a')} label={`${h.name} Mayra`} />
                    <Avatar persona="B" />
                    <Checkbox checked={h.b} onChange={() => toggle(h.id, 'b')} label={`${h.name} pareja`} />
                  </>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-encabezado font-semibold">Comida de hoy</h2>
            <span className="text-etiqueta text-ink-muted">Ver semana</span>
          </div>
          <dl className="mt-3.5 grid grid-cols-[84px_1fr] gap-x-3 gap-y-3">
            {COMIDA.map(([m, d]) => (
              <div key={m} className="contents">
                <dt className="text-etiqueta text-ink-muted">{m}</dt>
                <dd className="text-cuerpo">{d}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <h2 className="text-encabezado font-semibold">Próximo plan</h2>
          <div className="mt-3.5 flex items-center gap-3.5">
            <div className="flex flex-col items-center rounded-sm bg-juntas-soft px-3 py-2">
              <span className="text-caption text-ink-muted">SÁB</span>
              <span className="text-titulo font-semibold">28</span>
            </div>
            <div className="flex-1">
              <p className="text-encabezado font-semibold">Cena en La Chocita</p>
              <p className="text-caption text-ink-muted">7:00 pm · Restaurantes</p>
            </div>
            <Avatar persona="A" />
          </div>
        </Card>
      </div>
    </div>
  )
}
