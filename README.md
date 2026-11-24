# Nido

Web app colaborativa en tiempo real para pareja: planes, viajes, comida y hábitos en un solo lugar.

- **Diseño:** [Figma — Nido](https://www.figma.com/design/gkBKuDvfp9f6zXI09ab70x)
- **Arquitectura:** [docs/arquitectura.md](docs/arquitectura.md)
- **Stack:** React 19 + Vite + Tailwind CSS v4 · Supabase (Postgres, Auth, Realtime) · TanStack Query · Netlify

## Arranque local

```bash
npm install
cp .env.example .env.local   # pon tu URL y publishable key de Supabase
npm run dev
```

## Base de datos y login

1. Crea un proyecto en [supabase.com](https://supabase.com) y copia **Project URL** y la **publishable key** (`sb_publishable_…`) a `.env.local`.
2. Aplica las migraciones:
   ```bash
   npx supabase link --project-ref <tu-proyecto>
   npx supabase db push         # aplica supabase/migrations/
   ```
3. En **Authentication → URL Configuration** agrega como Redirect URLs `http://localhost:5173` y la URL de Netlify.

Sin `.env.local` la app arranca en **modo demo** con datos de ejemplo.

### Primer ingreso
1. Entra con tu correo (enlace mágico).
2. Escribe tu nombre y **Crear hogar** → recibes un código de 6 dígitos (toca los avatares en Inicio para verlo).
3. Tu pareja entra con su correo, elige **Tengo un código** y lo escribe. Quien crea queda en coral, quien se une en verde azulado.

Cada cambio de esquema = una migración nueva: `npx supabase migration new <nombre>`.

## Estructura

```
docs/                  Arquitectura y decisiones
supabase/migrations/   Esquema versionado (tablas, RLS, Realtime)
src/
  components/          UI base (Avatar, Tag, Checkbox, Button, Card, Fab, navegación)
  features/            inicio · planes · viajes · comida · habitos · captura
  lib/supabase.js      Cliente y canal Realtime por hogar
  index.css            Tokens de diseño (@theme) espejo de Figma
```

## Tipografía

La app usa **CamingoCode**. Coloca `CamingoCode-Regular.woff2` y `CamingoCode-Bold.woff2` en `public/fonts/`. Si no están, se usa Fira Code automáticamente.

## Flujo de trabajo

1. Diseñar o ajustar la pantalla en Figma (frame `vN`).
2. Rama por cambio: `feat/<modulo>-<cambio>`.
3. PR hacia `main` con link al frame de Figma; Netlify genera preview.
4. Merge cuando ambas lo aprueben.

Commits: `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`.

## Deploy (Netlify)

Build `npm run build` · carpeta `dist` · variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.
