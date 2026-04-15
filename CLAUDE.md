# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos principales

```bash
npm run dev        # Servidor de desarrollo en http://localhost:3000
npm run build      # Build de producción con Vite
npm run preview    # Preview del build de producción
npm run format     # Formatear código con Prettier
npm run format:check  # Verificar formato sin modificar
```

No hay comandos de test configurados en este proyecto.

## Stack tecnológico

- **Framework**: React 19 + TypeScript, construido con Vite 6
- **Backend/DB**: Supabase (PostgreSQL + Auth)
- **Estado del servidor**: TanStack Query v5
- **Routing**: React Router v7
- **UI**: PrimeReact v10 + Tailwind CSS v4 (sin `tailwind.config.js` — usa el plugin de Vite directamente)

- **Formularios**: React Hook Form v7 + Zod v4
- **Alias de rutas**: `@/` apunta a `./src/`

## Arquitectura en 3 capas

El proyecto aplica una separación estricta — **no llamar a Supabase directamente desde componentes o páginas**:

1. **`src/services/`** — Operaciones directas contra Supabase. Un archivo por tabla/dominio. Las query keys viven en `src/services/queryKeys/`.
2. **`src/hooks/`** — Wrappers de TanStack Query sobre los servicios. Exportan queries (`useQuery`) y mutations (`useMutation`) por dominio (ej. `useStays.ts`, `useRooms.ts`).
3. **`src/pages/` y `src/components/`** — UI que solo consume hooks. Nunca importa servicios ni el cliente de Supabase directamente.

## Variables de entorno requeridas

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
GEMINI_API_KEY=...   # Opcional, para funciones de IA
```

El cliente de Supabase se inicializa en `src/config/supabase.ts`.

## Roles de usuario (RBAC)

El sistema tiene 4 roles gestionados via Supabase Auth + tabla `roles`:

- **Admin** — acceso total
- **Recepcionista** — reservas, huéspedes, pagos
- **Limpieza** — logs de limpieza y estado de habitaciones
- **Mantenimiento** — logs de mantenimiento

El hook `src/hooks/useAuth.ts` expone el rol actual y guards de acceso.

## Validación de formularios

Los esquemas Zod viven en `src/validation/`. Siempre usar React Hook Form + `zodResolver` para formularios — no validación manual.

## Estructura de carpetas relevante

```
src/
├── App.tsx              # Definición de rutas (React Router, lazy loading)
├── config/supabase.ts   # Instancia única del cliente Supabase
├── services/            # Capa de datos (Supabase)
├── hooks/               # Capa de estado (TanStack Query)
├── pages/               # Páginas por módulo (admin, bookings, rooms, stays, landing…)
├── components/          # Componentes reutilizables por dominio
├── types/               # Tipos TypeScript globales
├── validation/          # Esquemas Zod
└── util/                # Constantes, enums, helpers, mapas
```

## Documentación de la base de datos

`DATABASE.md` contiene el esquema completo de Supabase: tablas core (`employees`, `guests`, `rooms`, `stays`), tablas catálogo, tablas transaccionales y sus relaciones. Consultar antes de modificar la capa de servicios.

## Convenciones de código

- Formato con Prettier: punto y coma, comillas dobles, 2 espacios, trailing comma ES5, líneas de 100 chars.
- Las rutas usan `React.lazy` + `Suspense` para code splitting por ruta.
- El contexto `BlockUIContext` (`src/context/BlockUIContext.tsx`) gestiona el estado de bloqueo de UI durante operaciones async.
- **Sin comentarios en el código.** Funciones, variables y componentes deben nombrarse de forma suficientemente descriptiva para que el código se explique por sí solo. No agregar comentarios `//` ni `/* */` en ningún archivo `.ts` o `.tsx`.
