# AGENTS.md - Hotel Colina Campestre Development Guide

React 19 + TypeScript hotel management system with Supabase backend.

## 1. Build, Lint, and Test Commands

| Operation | Command | Notes |
| :--- | :--- | :--- |
| Start Dev Server | `yarn dev` | Runs on `0.0.0.0:3000` |
| Build for Prod | `yarn build` | Creates production artifacts |
| Preview Build | `yarn preview` | Serves production artifacts |
| Install Deps | `yarn install` | |
| **Lint Code** | `yarn lint` | **(Requires setup)** - Run style/syntax checks |
| **Run All Tests** | `vitest run` | **(Requires Vitest setup)** |
| **Run Single Test** | `vitest run src/hooks/useRooms.test.ts` | Use file path for specific testing |

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
- **Data Layer Separation:** **CRITICAL:** 
  - **NO direct Supabase calls** in components or hooks.
  - **All data interaction** must reside in service layer files (`src/services/{table}/...Api.ts`).
  - **Hooks (`src/hooks/use...`) MUST call services** - this is mandatory.
  - **Components MUST use hooks only** - never call services directly from components.
- **Mandatory Data Flow:** `Component → Hook → Service API → Supabase`
- **Component Location:** Page-specific components in `components/{page_name}/`. Reusable UI in `components/ui/`.
- **Date Handling:** Use `dayjs` exclusively.

### **UI/UX (Emerald Palette)**
- **Primary:** `emerald-900` (bg), `emerald-600` (active elements).
- **Secondary:** `emerald-100` (highlights), `emerald-50` (hover).
- **NEVER use indigo colors.**

## 3. Architecture Patterns

### **Data Flow (MANDATORY)**
```
Component → Hook → Service API → Supabase
Example: CalendarView → useRooms → roomsApi → supabase
```

**❌ NEVER call services directly from components:**
```typescript
// WRONG - Component calling service directly
import { fetchRooms } from '@/services/rooms/roomsApi';

const MyComponent = () => {
  useEffect(() => {
    fetchRooms(); // ❌ FORBIDDEN
  }, []);
};
```

**✅ ALWAYS use the hook in components:**
```typescript
// CORRECT - Component using hook
import { useRooms } from '@/hooks/useRooms';

const MyComponent = () => {
  const { data } = useRooms(); // ✅ CORRECT
  // ...
};
```

### **Service Layer Example**
```typescript
// src/services/rooms/roomsApi.ts
import { supabase } from "@/config/supabase";
import { Room } from "@/types";

export const fetchRoomById = async (id: string): Promise<Room> => {
  const { data, error } = await supabase
    .from("rooms")
    .select(`*, room_statuses(name, color)`)
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error) throw error;
  return data;
};
```

### **Hook Pattern with React Query**
```typescript
// src/hooks/useRooms.ts
export const useRooms = (category?: string) => {
  return useQuery({
    queryKey: ["rooms", category],
    queryFn: async ({ signal }) => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*, status:room_statuses(*), rates:room_rates(*)")
        .eq("is_active", true)
        .abortSignal(signal)
        .order("room_number");

      if (error) throw error;
      return data as Room[];
    },
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });
};
```

## 4. Supabase Query Patterns

### **Handling Foreign Key Relationships**
When querying tables with multiple relationships, explicitly specify the foreign key:

```typescript
// CORRECT - Explicit foreign key
const { data } = await supabase
  .from("rooms")
  .select(`
    *,
    stays!stays_room_id_fkey(
      *,
      guest:guests!stays_guest_id_fkey(*)
    )
  `)
  .eq("is_active", true);

// INCORRECT - Ambiguous, causes PGRST100 error
const { data } = await supabase
  .from("rooms")
  .select(`*, stays(*, guest:guests(*))`)
  .eq("is_active", true);
```

### **Common Error Codes**
- **PGRST100:** Parser error - usually from ambiguous foreign key relationships
- **PGRST116:** JWT expired - handle auth token refresh

## 5. Database & API Context (Supabase)

Use foreign keys. `rooms.category` is legacy. `accommodation_type_id` is the source of truth for room type.

**Key Tables:**
- `employees`, `guests`
- `rooms` (linked to `room_statuses`)
- `stays` (Core transaction, linked to `rooms`, `guests`, `employees`)
- `accommodation_types` (Defines rentable categories)
- `payments` (Transaction tracking)
- `room_history` (Audit log for room status changes)

## 6. Pre-Commit Checklist

Before committing code, verify:
- [ ] No `console.log` statements
- [ ] All functions under 30 lines
- [ ] Using `@/` alias for all internal imports
- [ ] No barrel exports (`index.ts`) for components
- [ ] **Components use hooks ONLY** (never call services directly from components)
- [ ] **Every service has its corresponding hook** (`src/services/x/xApi.ts` ↔ `src/hooks/useX.ts`)
- [ ] Error handling for Supabase calls
- [ ] Using `dayjs` for date operations
- [ ] UI blocking with BlockUIContext for async operations
- [ ] Colors use Emerald palette (never indigo)

## 7. External Rules

Additional rules from `.agent/rules/coding-standards.md`:
- **No Comments Policy:** Code must be self-explanatory. Use descriptive names instead of comments.
- **Single Responsibility:** Each function/component does one thing only.
- **English Names:** All variables, functions, and classes in English.
- **Avoid Magic Numbers:** Use constants with descriptive names.

No specific rules found in `.cursor/rules/` or `.github/copilot-instructions.md` yet. Adhere strictly to the guidelines above.
