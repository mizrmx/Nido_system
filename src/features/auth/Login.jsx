import { useState } from 'react'
import { Button } from '../../components/ui.jsx'
import { signInWithEmail } from '../../lib/session.js'

export default function Login() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    const { error } = await signInWithEmail(email.trim())
    if (error) {
      setError(error.message)
      setStatus('error')
    } else setStatus('sent')
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-8 px-6">
      <header>
        <h1 className="text-display font-semibold">Nido</h1>
        <p className="mt-2 text-cuerpo text-ink-muted">Planes, viajes, comida y hábitos en un solo lugar, para las dos.</p>
      </header>

      {status === 'sent' ? (
        <section className="rounded-md bg-success-soft p-5">
          <p className="text-encabezado font-semibold">Revisa tu correo</p>
          <p className="mt-1 text-cuerpo text-ink-muted">
            Enviamos un enlace a <strong className="text-ink">{email}</strong>. Ábrelo en este mismo dispositivo.
          </p>
        </section>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label htmlFor="email" className="text-etiqueta text-ink-muted">
            Tu correo
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="rounded-sm border border-border bg-surface px-4 py-3.5 text-cuerpo outline-none focus:border-ink"
          />
          {status === 'error' && <p className="text-caption text-persona-a">{error}</p>}
          <Button type="submit" disabled={status === 'sending'} className="mt-2 w-full disabled:opacity-60">
            {status === 'sending' ? 'Enviando…' : 'Entrar con enlace mágico'}
          </Button>
          <p className="text-caption text-ink-muted">Sin contraseñas: te llega un enlace para entrar.</p>
        </form>
      )}
    </main>
  )
}
