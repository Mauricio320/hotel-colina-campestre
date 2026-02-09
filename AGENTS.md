# AGENTS.md - Hotel Colina Campestre Development Guide

React 19 + TypeScript hotel management system with Supabase backend.

## 1. Build, Lint, and Test Commands

Assuming standard Vite/Yarn setup. Linting/Testing tools must be configured first (e.g., Vitest).

| Operation | Command | Notes |
| :--- | :--- | :--- |
| Start Dev Server | `yarn dev` | Runs on `0.0.0.0:3000` |
| Build for Prod | `yarn build` | Creates production artifacts |
| Preview Build | `yarn preview` | Serves production artifacts |
| Install Deps | `yarn install` | |
| **Lint Code** | `yarn lint` | **(Requires setup)** - Run style/syntax checks |
| **Run All Tests** | `vitest run` | **(Requires Vitest setup)** |
| **Run Single Test** | `vitest run <path/to/file.test.tsx>` | Use file path for specific testing |

## 2. Code Style and Quality Guidelines

### **General & Formatting**
- **Function Length:** Max 20-30 lines. Avoid nesting deeper than 3 levels.
- **Logging:** Remove all `console.log` statements before final commits.
- **Comments:** Use sparingly. Only comment on *why* complex logic is implemented, not *what* is happening. Functions must be self-documenting; do not comment functions themselves.
- **Error Handling:** Use React Query error boundaries. Handle known Supabase errors (e.g., PGRST116).

### **TypeScript & Naming**
- **Types:** Use `interface` for object shapes, `type` for unions. All interfaces/types in `src/types/index.ts`.
- **Components:** `PascalCase.tsx` (e.g., `UserProfile.tsx`).
- **Hooks:** `camelCase.ts` (e.g., `useAuth.ts`).
- **Variables/Functions:** `camelCase`.
- **Constants:** `UPPER_SNAKE_CASE`.

### **Imports**
- **Absolute Imports:** ALWAYS use `@/` alias: `import { supabase } from "@/config/supabase";`.
- **Order:** React imports → Third-party libs → Internal modules → `@/` absolute imports.
- **Component Exports:** ❌ NEVER use barrel exports (`index.ts`) for components. Import directly: `import GuestForm from '@/components/stays/GuestForm'`.

### **React & Architecture**
- **UI Blocking:** Use `@/context/BlockUIContext` (`showBlockUI`/`hideBlockUI`) for all async operations.
- **Data Layer Separation:** **CRITICAL:** No direct Supabase calls in components or hooks. All data interaction must reside in service layer files (`src/services/{table}/...Api.ts`). Hooks (`src/hooks/use...`) must call services.
- **Component Location:** Page-specific components in `components/{page_name}/`. Reusable UI in `components/ui/`.
- **Date Handling:** Use `dayjs` exclusively.

### **UI/UX (Emerald Palette)**
- **Primary:** `emerald-900` (bg), `emerald-600` (active elements).
- **Secondary:** `emerald-100` (highlights), `emerald-50` (hover).
- **NEVER use indigo colors.**

## 3. Database & API Context (Supabase)

Use foreign keys. `rooms.category` is legacy. `accommodation_type_id` is the source of truth for room type.

**Key Tables:**
- `employees`, `guests`
- `rooms` (linked to `room_statuses`)
- `stays` (Core transaction, linked to `rooms`, `guests`, `employees`)
- `accommodation_types` (Defines rentable categories)
- `payments` (Transaction tracking)
- `room_history` (Audit log for room status changes)

## 4. External Rules

No specific rules found in `.cursor/rules/` or `.github/copilot-instructions.md` yet. Adhere strictly to the guidelines above.
