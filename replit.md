# JAC Hub

Panel de gestión para estudio indie de videojuegos — todo en español latinoamericano con estética cyberpunk oscura y acentos neón verde/azul.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — servidor API (puerto 8080)
- `pnpm --filter @workspace/jac-hub run dev` — frontend (puerto 19610)
- `pnpm run typecheck` — typecheck completo en todos los paquetes
- `pnpm run build` — typecheck + build todos los paquetes
- `pnpm --filter @workspace/api-spec run codegen` — regenerar hooks y schemas Zod desde OpenAPI
- `pnpm --filter @workspace/db run push` — push de cambios en schema DB (solo dev)
- Env requerido: `DATABASE_URL` — string de conexión Postgres

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Wouter (routing), Recharts, Framer Motion
- API: Express 5 + cookie-parser (sesión por cookie)
- DB: PostgreSQL + Drizzle ORM
- Validación: Zod (zod/v4), drizzle-zod
- Codegen: Orval (desde spec OpenAPI)
- Build: esbuild (bundle CJS)

## Where things live

- `lib/api-spec/openapi.yaml` — spec OpenAPI (fuente de verdad del contrato API)
- `lib/db/src/schema/` — tablas Drizzle: usuarios, miembros, proyectos, tareas, bugs, builds, notificaciones, actividad
- `artifacts/api-server/src/routes/` — auth, proyectos, tareas, bugs, equipo, builds, notificaciones, dashboard
- `artifacts/jac-hub/src/pages/` — login, dashboard, proyectos, proyecto-detalle, tareas, bugs, equipo, builds, notificaciones, configuracion
- `artifacts/jac-hub/src/components/layout/AppLayout.tsx` — sidebar + topbar compartidos
- `artifacts/jac-hub/src/index.css` — paleta cyberpunk (fondo oscuro, neón verde/azul)

## Architecture decisions

- Auth por cookie `session_usuario_id` (sin JWT, sin bcrypt — simple para demo)
- Credenciales demo: `gael@jac.dev` / `jac2024` o `admin@jac.dev` / `admin123`
- Dashboard stats calculadas en tiempo real (agregaciones SQL en cada request)
- Actividad semanal del dashboard es generada con valores aleatorios por request (no persistida)
- Drag-and-drop en Kanban implementado con eventos mouse nativos (sin librería externa)

## Product

JAC Hub es el panel de control del estudio JAC — gestiona proyectos de videojuegos (CodeQuest, PixelWars, NeonRunner), tareas en tablero Kanban, seguimiento de bugs, miembros del equipo, builds con changelogs, y notificaciones en tiempo real. Interfaz completamente en español latinoamericano con estética cyberpunk.

## User preferences

- Todo el UI en español latinoamericano (Latin American Spanish)
- Estilo: dark futurista, neón verde (#00ff88) + azul (#00d4ff)

## Gotchas

- La cookie `session_usuario_id` tiene `httpOnly: true` — no accesible desde JS
- Las fechas timestamp se convierten a `.toISOString()` antes de pasar por Zod (Drizzle retorna objetos Date, OpenAPI espera strings)
- `fechaLimite` y `fechaResolucion` se convierten a `new Date()` antes de insertar en Drizzle
- Correr `pnpm run typecheck:libs` después de agregar schemas nuevos al DB para rebuild

## Pointers

- Ver skill `pnpm-workspace` para estructura del workspace, setup TypeScript y detalles de paquetes
