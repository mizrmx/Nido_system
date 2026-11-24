import { useState } from 'react'
import { Avatar, Button, Tag } from '../../components/ui.jsx'

const CATEGORIAS = ['Plan', 'Viaje', 'Comida', 'Súper', 'Hábito']

// Captura rápida: solo el título es obligatorio. Sin categoría → bandeja "Por ordenar".
export default function QuickAdd({ onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [cat, setCat] = useState(null)

  const save = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave?.({ title: title.trim(), category: cat })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end bg-ink/40 lg:items-center lg:justify-center" onClick={onClose}>
      <form
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full flex-col gap-4 rounded-t-[28px] bg-surface px-5 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))] lg:max-w-md lg:rounded-lg lg:pt-5"
      >
        <span className="mx-auto h-1.5 w-10 rounded-full bg-border lg:hidden" />
        <div className="flex items-center justify-between">
          <h2 className="text-titulo font-semibold">Captura rápida</h2>
          <span className="flex items-center gap-1.5 text-caption text-ink-muted">
            como <Avatar persona="A" />
          </span>
        </div>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="¿Qué se te ocurrió?"
          className="rounded-sm border-[1.5px] border-persona-a bg-bg px-4 py-3.5 text-encabezado font-semibold outline-none placeholder:font-normal placeholder:text-ink-muted"
        />
        <p className="text-caption text-ink-muted">
          Solo escribe y guarda. La categoría es opcional; si no eliges, queda en “Por ordenar”.
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map((c) => (
            <Tag key={c} active={cat === c} onClick={() => setCat(cat === c ? null : c)}>
              {c}
            </Tag>
          ))}
        </div>
        <Button type="submit" className="w-full">
          Guardar
        </Button>
      </form>
    </div>
  )
}
