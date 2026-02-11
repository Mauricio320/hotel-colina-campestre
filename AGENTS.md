# AGENTS.md - Hotel Colina Campestre Development Guide

> **Language**: This project uses Spanish for UI text, comments, and documentation. Code identifiers (variables, functions, classes) use English.

---

## 1. Project Overview

**Hotel Colina Campestre** is a hotel management system for managing room inventory, reservations, check-ins/check-outs, payments, and guest/employee records.

### Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | React | 19.2.3 |
| Language | TypeScript | ~5.8.2 |
| Build Tool | Vite | ^6.2.0 |
| Backend | Supabase | ^2.45.4 |
| State Management | TanStack React Query | ^5.90.19 |
| UI Components | PrimeReact | ^10.9.7 |
| Styling | Tailwind CSS | (CDN) |
| Date Handling | dayjs | ^1.11.19 |
| Routing | react-router-dom | ^7.12.0 |
| Forms | react-hook-form | ^7.71.1 |
| Icons | PrimeIcons | ^7.0.0 |

---

## 2. Build, Lint, and Test Commands

| Operation | Command | Notes |
|-----------|---------|-------|
| Start Dev Server | `yarn dev` | Runs on `0.0.0.0:3000` |
| Build for Production | `yarn build` | Creates `dist/` folder |
| Preview Build | `yarn preview` | Serves production build locally |
| Install Dependencies | `yarn install` | Uses yarn (also supports pnpm/npm) |

---

## 3. Project Architecture

### 3.1 Directory Structure

```
src/
├── components/          # React components (by feature)
│   ├── calendar/       # Calendar view components
│   ├── forms/          # Reusable form components
│   ├── layout/         # Layout components
│   ├── payments/       # Payment-related components
│   ├── stays/          # Stay/Reservation components
│   ├── tasks/          # Task management components
│   └── ui/             # Generic UI components
├── pages/              # Page components (route handlers)
│   ├── auth/           # Login, Register
│   ├── bookings/       # Booking movements
│   ├── calendar/       # Calendar view
│   ├── dashboard/      # Main dashboard
│   ├── employees/      # Employee management
│   ├── guests/         # Guest management
│   ├── logs/           # Cleaning/Maintenance logs
│   ├── payments/       # Payment pages
│   ├── profile/        # User profile
│   ├── reports/        # Reports page
│   ├── rooms/          # Room management
│   └── stays/          # Check-in/Check-out pages
├── hooks/              # React Query hooks (MANDATORY)
│   ├── useRooms.ts     # Hook para habitaciones
│   ├── useGuests.ts    # Hook para huéspedes
│   ├── useStays.ts     # Hook para estancias
│   └── ...             # Un hook por cada servicio
├── services/           # API service layer (SOLO aquí se llama a Supabase)
│   ├── rooms/          # Servicios de habitaciones
│   │   └── roomsApi.ts
│   ├── guests/         # Servicios de huéspedes
│   │   └── guestsApi.ts
│   └── stays/          # Servicios de estancias
│       └── staysApi.ts
├── types/              # TypeScript type definitions
├── config/             # Configuration files
│   ├── supabase.ts     # Supabase client (configuración única)
│   └── locale.ts       # Localization setup
├── context/            # React contexts
│   ├── AuthContext.tsx # Authentication context
│   └── BlockUIContext.tsx # UI blocking context
├── constants/          # Application constants
├── styles/             # Global styles
└── util/               # Utility functions
```

### 3.2 Mandatory Data Flow Architecture

**CRITICAL**: The project enforces a strict 4-layer architecture:

```
Component → Hook → Service API → Supabase
```

| Capa | Responsabilidad | Ubicación |
|------|----------------|-----------|
| **Componente** | UI y lógica de presentación | `src/components/`, `src/pages/` |
| **Hook** | Data fetching, caching, mutations | `src/hooks/` |
| **Service API** | Llamadas a Supabase | `src/services/` |
| **Supabase** | Base de datos y auth | `src/config/supabase.ts` |

#### Reglas Fundamentales

1. **Toda interacción con Supabase va en `src/services/`** - Nunca en componentes ni hooks
2. **Cada servicio DEBE tener su hook correspondiente** en `src/hooks/`
3. **Los componentes SOLO usan hooks** - Nunca llaman servicios directamente

**❌ NEVER call services directly from components:**
```typescript
// WRONG - Direct service call in component
import { fetchRooms } from '@/services/rooms/roomsApi';

const MyComponent = () => {
  useEffect(() => {
    fetchRooms(); // ❌ FORBIDDEN
  }, []);
};
```

**✅ ALWAYS use the corresponding hook:**
```typescript
// CORRECT - Using hook in component
import { useRooms } from '@/hooks/useRooms';

const MyComponent = () => {
  const { data } = useRooms(); // ✅ CORRECT
  // ...
};
```

**Every service MUST have a corresponding hook.** The hook uses React Query for data fetching and caching.

> 📖 **Ver sección 7.5 para ejemplos completos y anti-patrones.**

---

## 4. Code Style Guidelines

### 4.1 General Rules

| Rule | Description |
|------|-------------|
| **Function Length** | Max 20-30 lines per function |
| **Nesting** | Avoid nesting deeper than 3 levels |
| **Logging** | Remove all `console.log` before commits |
| **Comments** | Use sparingly. Code must be self-documenting. Only comment *why* complex logic exists, not *what* it does |

### 4.2 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase | `useAuth.ts` |
| Variables/Functions | camelCase | `fetchRoomData` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Types/Interfaces | PascalCase | `interface RoomStatus` |

### 4.3 Import Rules

**ALWAYS use `@/` alias** for internal imports:
```typescript
// ✅ CORRECT
import { supabase } from "@/config/supabase";
import { Room } from "@/types";

// ❌ WRONG
import { supabase } from "../config/supabase";
```

**Import Order:**
1. React imports
2. Third-party libraries
3. Internal modules
4. `@/` absolute imports

### 4.4 Component Exports

**❌ NEVER use barrel exports (`index.ts`) for components:**
```typescript
// WRONG - Barrel export
export { default as GuestForm } from './GuestForm';
export { default as RoomCard } from './RoomCard';
```

**✅ Import components directly:**
```typescript
import GuestForm from '@/components/stays/GuestForm';
import RoomCard from '@/components/rooms/RoomCard';
```

---

## 5. TypeScript Guidelines

### 5.1 Type vs Interface

- Use `interface` for object shapes
- Use `type` for unions

```typescript
// Interface for objects
interface Room {
  id: string;
  room_number: string;
}

// Type for unions
type StayStatus = "Active" | "Completed" | "Cancelled" | "Reserved";
```

### 5.2 All Types in `src/types/index.ts`

All shared TypeScript interfaces and types must be defined in `src/types/index.ts`.

---

## 6. Styling Guidelines

### 6.1 Color Palette (Emerald Theme)

| Purpose | Color Class |
|---------|-------------|
| Primary Background | `emerald-900` |
| Primary Action | `emerald-600` |
| Highlight | `emerald-100` |
| Hover State | `emerald-50` |

**NEVER use indigo colors.** The project uses an Emerald color scheme.

### 6.2 Styling Stack

1. **Tailwind CSS** - Primary styling (loaded via CDN in `index.html`)
2. **PrimeReact Theme** - UI component theming (`lara-light-indigo` but customized)
3. **Custom CSS** - In `src/styles/prime-react.css` and `src/styles/animations.css`

### 6.3 CSS Variables (in `src/styles/prime-react.css`)

```css
:root {
  --hotel-primary: #059669;      /* Emerald for primary actions */
  --hotel-secondary: #f59e0b;    /* Amber for reservations */
  --hotel-danger: #ef4444;       /* Red for check-out/danger */
  --hotel-info: #3b82f6;         /* Blue for info */
  --hotel-border: #e7e4dd;       /* Border color */
  --hotel-border-radius: 0.75rem;
}
```

---

## 7. Supabase & Database

### 7.1 Configuration

Supabase client is configured in `src/config/supabase.ts`:
- URL: From `VITE_SUPABASE_URL` env variable
- Anon Key: From `VITE_SUPABASE_ANON_KEY` env variable

### 7.2 Key Tables

| Table | Purpose |
|-------|---------|
| `employees` | System users with authentication |
| `guests` | Hotel guests/clients |
| `rooms` | Physical rooms (use `accommodation_type_id`, not legacy `category`) |
| `stays` | Core transaction (reservations/active stays) |
| `accommodation_types` | Room type definitions |
| `room_statuses` | Room status catalog |
| `payments` | Payment records |
| `room_history` | Audit log for room changes |
| `room_rates` | Dynamic pricing per person count |

### 7.3 Foreign Key Relationship Queries

When querying tables with multiple relationships, **explicitly specify foreign keys**:

```typescript
// ✅ CORRECT - Explicit foreign key
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

// ❌ WRONG - Ambiguous, causes PGRST100 error
const { data } = await supabase
  .from("rooms")
  .select(`*, stays(*, guest:guests(*))`)
  .eq("is_active", true);
```

### 7.4 Common Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| PGRST100 | Parser error (ambiguous FK) | Explicitly specify foreign keys |
| PGRST116 | JWT expired | Handle auth token refresh |

### 7.5 Arquitectura de Servicios y Hooks (REGLA CRÍTICA)

**Toda interacción con Supabase DEBE seguir esta arquitectura estricta:**

```
Componente → Hook → Servicio → Supabase
```

#### Reglas Fundamentales

| Regla | Descripción |
|-------|-------------|
| **Supabase solo en Servicios** | NUNCA importes `supabase` directamente en componentes o hooks. Solo en archivos de `src/services/` |
| **Un servicio por dominio** | Cada tabla/entidad tiene su archivo de servicio (ej: `roomsApi.ts`, `guestsApi.ts`) |
| **Cada servicio tiene su hook** | Por cada `xxxApi.ts` DEBE existir un `useXxx.ts` en `src/hooks/` |
| **Hooks son la única interfaz** | Los componentes SOLO usan hooks, nunca llaman servicios directamente |

#### Ejemplo Completo de Flujo

**1. Servicio (`src/services/rooms/roomsApi.ts`):**
```typescript
import { supabase } from "@/config/supabase";
import { Room } from "@/types";

export const fetchRooms = async (): Promise<Room[]> => {
  const { data, error } = await supabase
    .from("rooms")
    .select("*, status:room_statuses(*)")
    .eq("is_active", true);

  if (error) throw error;
  return data || [];
};

export const createRoom = async (room: Partial<Room>): Promise<Room> => {
  const { data, error } = await supabase
    .from("rooms")
    .insert(room)
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

**2. Hook (`src/hooks/useRooms.ts`):**
```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchRooms, createRoom } from "@/services/rooms/roomsApi";
import { Room } from "@/types";

export const useRooms = () => {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
};
```

**3. Componente (`src/components/rooms/RoomList.tsx`):**
```typescript
import { useRooms, useCreateRoom } from "@/hooks/useRooms";

export const RoomList = () => {
  const { data: rooms, isLoading } = useRooms();
  const createRoom = useCreateRoom();

  const handleAddRoom = async (roomData: Partial<Room>) => {
    await createRoom.mutateAsync(roomData);
  };

  // ... render logic
};
```

#### ❌ ANTI-PATRONES PROHIBIDOS

```typescript
// ❌ PROHIBIDO: Llamar supabase directamente en un componente
const MyComponent = () => {
  useEffect(() => {
    supabase.from("rooms").select("*").then(...); // ❌ NUNCA
  }, []);
};

// ❌ PROHIBIDO: Llamar servicios directamente desde componentes
import { fetchRooms } from "@/services/rooms/roomsApi";
const MyComponent = () => {
  useEffect(() => {
    fetchRooms().then(...); // ❌ NUNCA
  }, []);
};

// ❌ PROHIBIDO: Crear un hook que no use React Query
const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  useEffect(() => {
    fetchRooms().then(setRooms); // ❌ No usar useState/useEffect manualmente
  }, []);
  return rooms;
};
```

#### ✅ PATRONES CORRECTOS

```typescript
// ✅ CORRECTO: Usar el hook correspondiente
import { useRooms } from "@/hooks/useRooms";
const MyComponent = () => {
  const { data } = useRooms(); // ✅ SIEMPRE usar hooks
  // ...
};

// ✅ CORRECTO: Hook usa React Query
export const useRooms = () => {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms, // El hook llama al servicio internamente
    // ...
  });
};
```

---

## 8. React Query Patterns

### 8.1 Hook Structure

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
        .abortSignal(signal) // Important for cancellation
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

### 8.2 Query Options Convention

```typescript
{
  refetchOnWindowFocus: false,  // Don't refetch on window focus
  staleTime: 0,                 // Data is stale immediately
  gcTime: 0,                    // Don't cache garbage data
  retry: 1,                     // Retry failed requests once
}
```

---

## 9. UI Blocking Pattern

Use `BlockUIContext` for all async operations to prevent user interaction during loading:

```typescript
import { useBlockUI } from "@/context/BlockUIContext";

const MyComponent = () => {
  const { showBlockUI, hideBlockUI } = useBlockUI();

  const handleSubmit = async () => {
    showBlockUI("Procesando...");
    try {
      await saveData();
    } finally {
      hideBlockUI();
    }
  };
};
```

---

## 10. Date Handling

**Always use `dayjs`** for date operations. Never use native Date directly.

```typescript
import dayjs from "dayjs";

// Format for display
dayjs(date).format("DD/MM/YYYY");

// Format for Supabase (ISO)
dayjs(date).format("YYYY-MM-DD");

// Date arithmetic
dayjs().add(1, "day");
dayjs().diff(otherDate, "day");
```

Locale is set to Spanish in `src/config/locale.ts`.

---

## 11. Authentication

Authentication uses Supabase Auth combined with an `employees` table for role management.

### 11.1 Auth Flow

1. User logs in with email/password via Supabase Auth
2. Auth state triggers `useEmployeeWithSync` hook
3. Employee data (including role) is fetched from `employees` table
4. Role-based access control in components

### 11.2 Roles

```typescript
enum Role {
  Admin = "Admin",
  Recepcionista = "Recepcionista",
  Limpieza = "Limpieza",
  Mantenimiento = "Mantenimiento",
}
```

---

## 12. Pre-Commit Checklist

Before committing code, verify:

- [ ] No `console.log` statements
- [ ] All functions under 30 lines
- [ ] Using `@/` alias for all internal imports
- [ ] No barrel exports (`index.ts`) for components
- [ ] **🔴 Components use hooks ONLY** (never call services directly) - *Ver sección 3.2 y 7.5*
- [ ] **🔴 Every service has its corresponding hook** - *Ver sección 7.5*
- [ ] **🔴 Supabase calls ONLY in services** (never in components/hooks) - *Ver sección 7.5*
- [ ] Error handling for Supabase calls
- [ ] Using `dayjs` for date operations
- [ ] UI blocking with BlockUIContext for async operations
- [ ] Colors use Emerald palette (never indigo)

---

## 13. External Rules

Additional rules from `.agent/rules/coding-standards.md`:

### 13.1 No Comments Policy
- Do NOT add comments to code (no `//` or `/* */`)
- Code must be self-explanatory
- **Exception**: Only if logic is extremely complex and cannot be described by function name

### 13.2 Descriptive Naming
- All variables, functions, classes in **English**
- Function names should clearly state purpose: `calculateStayTotalWithTaxes` instead of `calcTotal`

### 13.3 Single Responsibility
- Each function/component does one thing only
- Break down large functions into smaller, specialized functions

### 13.4 Clean Code
- Prioritize readability and simplicity
- Avoid "magic numbers" or strings; use constants with descriptive names

---

## 14. Deployment

### 14.1 Vercel Configuration (`vercel.json`)

```json
{
  "buildCommand": "yarn build",
  "outputDirectory": "dist",
  "installCommand": "yarn install",
  "framework": "vite"
}
```

### 14.2 SPA Routing

All routes redirect to `index.html` for client-side routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 15. Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `GEMINI_API_KEY` | (Optional) For AI features |

---

## 16. Database Schema Reference

See `DATABASE.md` for complete schema documentation including:
- All table definitions
- Column types and constraints
- Relationships between tables
- Enum values

**Key Migration Note**: The `rooms.category` field is legacy. Always use `rooms.accommodation_type_id` for new development.
