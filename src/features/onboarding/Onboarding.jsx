import { useState } from 'react'
import { Button, Tag } from '../../components/ui.jsx'
import { useCreateHousehold, useJoinHousehold } from '../../lib/household.js'
import { signOut } from '../../lib/session.js'

// Primer ingreso: tu nombre + crear un hogar nuevo o unirte con el código de tu pareja.
export default function Onboarding({ userId }) {
  const [mode, setMode] = useState('crear') // crear | unirme
  const [displayName, setDisplayName] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const create = useCreateHousehold(userId)
  const join = useJoinHousehold(userId)
  const pending = create.isPending || join.isPending
  const error = create.error?.message || join.error?.message

  const submit = (e) => {
    e.preventDefault()
    if (mode === 'crear') create.mutate({ displayName, name })
    else join.mutate({ displayName, code })
  }

  const input = 'rounded-sm border border-border bg-surface px-4 py-3.5 text-cuerpo outline-none focus:border-ink'

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
      <header>
        <h1 className="text-display font-semibold">Bienvenida a Nido</h1>
        <p className="mt-2 text-cuerpo text-ink-muted">Un hogar = dos personas. Crea uno o únete al de tu pareja.</p>
      </header>

      <div className="flex gap-2">
        <Tag active={mode === 'crear'} onClick={() => setMode('crear')}>Crear hogar</Tag>
        <Tag active={mode === 'unirme'} onClick={() => setMode('unirme')}>Tengo un código</Tag>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <label className="text-etiqueta text-ink-muted" htmlFor="nombre">¿Cómo te llamamos?</label>
        <input id="nombre" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Tu nombre" className={input} />

        {mode === 'crear' ? (
          <>
            <label className="text-etiqueta text-ink-muted" htmlFor="hogar">Nombre del hogar (opcional)</label>
            <input id="hogar" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nuestro nido" className={input} />
          </>
        ) : (
          <>
            <label className="text-etiqueta text-ink-muted" htmlFor="codigo">Código de 6 dígitos</label>
            <input
              id="codigo"
              required
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className={`${input} text-center text-titulo tracking-[0.4em]`}
            />
          </>
        )}

        {error && <p className="text-caption text-persona-a">{error}</p>}
        <Button type="submit" disabled={pending} className="mt-2 w-full disabled:opacity-60">
          {pending ? 'Guardando…' : mode === 'crear' ? 'Crear hogar' : 'Unirme'}
        </Button>
      </form>

      <button type="button" onClick={signOut} className="text-caption text-ink-muted underline">
        Salir
      </button>
    </main>
  )
}
