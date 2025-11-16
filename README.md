# Abstractify — Frontend

Aplicación React + TypeScript + Vite para construir y renderizar interfaces (chat, diseño, código) con soporte de Firebase, websockets y Tailwind.

## Stack
- React 19, React Router 7
- TypeScript 5
- Vite 6
- Tailwind CSS 4 (`@tailwindcss/vite`)
- Radix UI / shadcn
- Firebase
- STOMP/SockJS, gRPC-web
- Zustand

## Requisitos
- Node 20+
- npm 10+

## Configuración

1. Instalar deps:
   ```bash
   npm i
   ```

2. Variables de entorno (`.env`):
   - Firebase keys (`VITE_FIREBASE_*`)
   - Endpoints backend (`VITE_API_BASE_URL`, `VITE_WS_URL`, etc.)

3. Desarrollo:
   ```bash
   npm run dev
   ```

4. Build y preview:
   ```bash
   npm run build
   npm run preview
   ```

## Scripts
- `dev`: arranca Vite
- `build`: `tsc -b && vite build`
- `preview`: sirve el build
-
- `lint`: ESLint con reglas type-aware

## Linting y estilo
- Config plano con `typescript-eslint` type-aware.
- Ejecutar `npm run lint` antes de abrir PR.

## Tailwind
- Integrado vía `@tailwindcss/vite` (Tailwind v4).
- Utilidades recomendadas: `clsx`, `tailwind-merge`.

## Estructura
- `src/components/*`: UI y módulos (auth, canvas, ui, skeletons)
- `src/pages/*`: rutas (dashboard, design, chat, code, auth)
- `src/services/*`: llamadas a API/Firebase
- `src/hooks/*`, `src/contexts/*`, `src/models/*`

## Flujo de trabajo
- Ramas: `feature/*`, `fix/*`, `chore/*`
- Commits: Conventional Commits (ej. `feat: ...`, `fix: ...`)
- PRs con descripción, screenshots si aplica y `npm run lint` en verde.

## Despliegue
- Firebase Hosting (ver `firebase.json`).
- Variables de entorno requeridas en el entorno de despliegue.

## Problemas comunes
- Polyfills: `vite` configurado con alias para `process` y `buffer`.
- Fast Refresh: regla `react-refresh/only-export-components` activa.
