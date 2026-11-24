# Nido — Arquitectura de información, datos y flujos

> Copia versionada del documento de arquitectura. Diseño: [Figma — Nido](https://www.figma.com/design/gkBKuDvfp9f6zXI09ab70x)

## Resumen

Nido es una PWA mobile-first para dos personas que comparten un solo espacio de datos ("hogar"), sincronizado en tiempo real con Supabase.

| Decisión | Elección | Por qué |
| --- | --- | --- |
| Frontend | React + Vite + Tailwind CSS v4, PWA instalable | Se instala en iPhone, Android, iPad y desktop sin tiendas |
| Backend | Supabase (Postgres + Auth + Realtime + RLS) | Realtime nativo sobre Postgres, sin servidor propio |
| Estado cliente | TanStack Query + suscripción Realtime por hogar | Caché, updates optimistas y reconciliación simples |
| Deploy | Netlify | Preview por rama/PR para revisar en ambos teléfonos |
| Tokens | Variables de Figma → bloque `@theme` en `src/index.css` | Un cambio en Figma se replica 1:1 en código |

Identidad visual: fondo crema, tarjetas blancas con radio 16 px y sombra suave; tipografía CamingoCode (Fira Code como respaldo). Persona A = coral, Persona B = verde azulado, Juntas = ámbar.

## Arquitectura de información

```mermaid
flowchart TD
  N[Nido · un hogar, dos personas] --> I[Inicio]
  N --> P[Planes]
  N --> V[Viajes]
  N --> C[Comida]
  N --> H[Hábitos]
  I --- I1[Hábitos de hoy · Comida de hoy · Próximo plan · Feed en vivo]
  P --- P1[Lista y filtros · Pendiente/Hecho · Elegir al azar · Detalle]
  V --- V1[Por estado · Detalle de viaje · Checklist · Kanban desktop]
  C --- C1[Menú semanal · Lista del súper · Pasar al súper]
  H --- H1[Resumen semanal · En pareja · Individuales · Rutina de hoy]
  Q[[Captura rápida · FAB o tecla N]] -.-> I & P & V & C & H
```

| Pantalla | Qué muestra | Acción principal |
| --- | --- | --- |
| Inicio | Hábitos de hoy, comida del día, próximo plan, feed de la pareja | Marcar hábito |
| Planes | Tarjetas por etiqueta (Cafés, Restaurantes, Actividades, Películas/Series, Otros) y estado | Elegir al azar / marcar Hecho |
| Viajes | Destinos por estado (Idea, Planeando, Confirmado, Realizado) | Abrir detalle y avanzar estado |
| Detalle de viaje | Fecha tentativa, presupuesto, notas, checklist de imperdibles | Marcar imperdible |
| Comida · Menú | Semana con desayuno, comida, cena y snacks; quién cocina | Asignar platillo |
| Comida · Súper | Lista por categoría con casillas en vivo | Marcar en tienda |
| Hábitos | % semanal por persona, racha en pareja, cuadrícula L–D | Marcar casilla propia |
| Captura rápida | Hoja inferior con un campo y categorías opcionales | Guardar en menos de 5 s |

## Esquema de base de datos

SQL completo: [`supabase/migrations/20261124000000_esquema_inicial.sql`](../supabase/migrations/20261124000000_esquema_inicial.sql)

```mermaid
erDiagram
  profiles ||--o{ household_members : ""
  households ||--o{ household_members : ""
  households ||--o{ inbox_items : ""
  households ||--o{ places : ""
  households ||--o{ trips : ""
  trips ||--o{ trip_items : ""
  households ||--o{ meal_plan : ""
  households ||--o{ shopping_items : ""
  meal_plan |o--o{ shopping_items : ""
  households ||--o{ habits : ""
  habits ||--o{ habit_logs : ""
  profiles ||--o{ habit_logs : ""
  households ||--o{ activity : ""
```

- Columnas comunes en tablas de módulo: `id, household_id, created_by, created_at, updated_at, deleted_at, client_id`.
- Hábitos: individual = una fila de `habit_logs` por persona y día; en pareja = cualquiera marca y cuenta para las dos.
- Rachas y % semanal: vista SQL (fase 4), no se guardan.
- Hogar: `create_household()` y `join_household(código)`; máximo 2 personas.

## Sincronización en tiempo real

| Pieza | Cómo se resuelve |
| --- | --- |
| Seguridad (RLS) | `is_member(household_id)` en todas las tablas de módulo |
| Cambios de datos | Canal `household:{id}` con `postgres_changes` filtrado por `household_id=eq.{id}` |
| Borrados | Soft delete (`deleted_at`): Realtime no filtra eventos DELETE |
| Presencia | Realtime Presence en el mismo canal: avatares "en línea" |
| Efectos efímeros | Broadcast: destello en la tarjeta que la otra está editando |
| Escritura optimista | TanStack Query `onMutate`; `client_id` para ignorar el propio eco |
| Conflictos | Last-write-wins por fila (`updated_at` por trigger) |
| Orden manual | Columna `position` texto con índice fraccional |
| Offline | Cola de mutaciones en IndexedDB; refetch al reconectar |

## Flujo principal: captura rápida

```mermaid
flowchart LR
  A[Toca + o tecla N] --> B[Escribe el título] --> D{¿Elige categoría?}
  D -- sí --> M[Se guarda en su módulo] --> R[La pareja lo ve en vivo]
  D -- no --> X[Bandeja Por ordenar] --> Y[Categorizar después] --> M
```

## Plan por fases

1. **Base:** Vite + Tailwind con tokens, Supabase Auth (magic link), hogar e invitación por código, layout con barra inferior y FAB.
2. **Captura rápida + Planes:** `inbox_items`, `places`, filtros, Pendiente/Hecho, Elegir al azar.
3. **Comida:** menú semanal, súper en tiempo real, pasar ingredientes al súper.
4. **Hábitos:** registro individual y en pareja, rachas y % semanal.
5. **Viajes:** tarjetas por estado, detalle con checklist, kanban con drag & drop en desktop.
6. **Pulido:** offline, notificaciones push (iOS 16.4+ instalada en inicio), modo oscuro.
