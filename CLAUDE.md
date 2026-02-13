# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hotel Colina Campestre - A hotel management system built with React, TypeScript, and Supabase.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite (port 3000)
- **Backend/Database**: Supabase (PostgreSQL + Auth)
- **Data Fetching**: TanStack Query (React Query) v5
- **UI Components**: PrimeReact v10
- **Routing**: React Router v7
- **Forms**: React Hook Form
- **Styling**: Tailwind CSS (loaded via CDN in index.html)
- **Date Handling**: Day.js
- **Icons**: PrimeIcons

## Common Commands

```bash
# Install dependencies (uses pnpm-lock.yaml present)
pnpm install

# Development server (runs on http://localhost:3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Required in `.env`:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

Optional:
- `GEMINI_API_KEY` - For AI features (mapped to `process.env.GEMINI_API_KEY` in vite.config.ts)

## Project Structure

```
src/
├── pages/           # Route-level page components organized by feature
│   ├── auth/        # Login, RegisterAdmin
│   ├── calendar/    # CalendarView
│   ├── stays/       # CheckInPage, CheckOutPage, CancelReservationPage, MoveReservationPage
│   ├── rooms/       # RoomManagement, RoomFormPage, RoomHistoryPage
│   ├── payments/    # RoomPayments, PaymentsInvoice, InvoiceDetailPage
│   ├── guests/      # GuestManagement
│   ├── employees/   # EmployeeManagement
│   ├── logs/        # CleaningLogs, MaintenanceLogs, CleaningTaskPage, MaintenanceTaskPage
│   └── ...
├── components/      # Reusable components organized by domain
│   ├── calendar/    # CalendarGrid, CalendarHeader, CheckInModal, PaymentModal
│   ├── stays/       # Stay forms, guest forms, payment sections
│   ├── payments/    # Payment tables
│   ├── ui/          # LoadingState, ErrorState, EmptyState, GlobalBlockUI
│   └── layout/      # Layout component
├── hooks/           # Custom React hooks (TanStack Query patterns)
│   ├── useAuth.ts   # Authentication context and logic
│   ├── useGuests.ts # Guest data fetching
│   ├── useStays.ts  # Stay/reservation management
│   └── ...          # Other domain-specific hooks
├── services/        # API layer organized by domain
│   ├── stays/       # staysApi.ts - Stay CRUD operations
│   ├── guests/      # guestApi.ts - Guest operations
│   ├── rooms/       # roomsApi.ts - Room management
│   ├── payment/     # paymentsApi.ts - Payment processing
│   ├── auth/        # authApi.ts - Authentication
│   └── queryKeys/   # TanStack Query key definitions
├── types/           # TypeScript interfaces and enums
│   └── index.ts     # Main types: Stay, Room, Guest, Employee, Payment, etc.
├── config/          # Configuration files
│   ├── supabase.ts  # Supabase client initialization
│   └── locale.ts    # Day.js locale configuration
├── context/         # React Context providers
│   ├── BlockUIContext.tsx  # Global loading state management
│   └── ...
├── constants/       # Application constants
│   └── index.ts     # CATEGORIES, STATUS_MAP, DOC_TYPES
├── styles/          # CSS files
│   ├── animations.css
│   └── prime-react.css
└── util/            # Utility functions
```

## Architecture Patterns

### Three-Layer Architecture (Supabase Integration)

The project follows a strict three-layer architecture for data operations:

```
Component → Hook (TanStack Query) → Service (Supabase)
```

**Rule: Components NEVER call Supabase directly. Always use hooks.**

---

### Layer 1: Services (`/src/services/{table-name}/`)

Services contain direct Supabase operations. One file per table with the same name:

```typescript
// src/services/stays/staysApi.ts
import { supabase } from "@/config/supabase";
import { Stay } from "@/types";

export const StayCreateService = (stayData: Stay) => {
  return supabase.from("stays").insert(stayData).select().single();
};

export const cancelStay = async (params: CancelStayParams): Promise<void> => {
  // Direct Supabase operations
  const { error } = await supabase
    .from("stays")
    .update({ status: "Cancelled" })
    .eq("id", params.stayId);

  if (error) throw error;
};
```

**Naming conventions:**
- Folder: `src/services/{table-name}/` (e.g., `stays/`, `rooms/`, `guests/`)
- File: Same as table name (e.g., `staysApi.ts`, `roomsApi.ts`)
- Functions: Descriptive action names (e.g., `createStay`, `updateRoom`, `fetchGuestById`)

---

### Layer 2: Hooks (`/src/hooks/`)

Hooks wrap services with TanStack Query. File name matches the hook name:

```typescript
// src/hooks/useStays.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StayCreateService, cancelStay } from "@/services/stays/staysApi";

export const useStays = () => {
  const queryClient = useQueryClient();

  // Read operations use useQuery
  const staysQuery = useQuery({
    queryKey: ["stays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stays")
        .select("*, room:rooms(*), guest:guests(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Stay[];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Write operations use useMutation
  const cancelStayMutation = useMutation({
    mutationFn: cancelStay,  // Calls service function
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  return {
    staysQuery,
    cancelStay: cancelStayMutation,
  };
};
```

**Naming conventions:**
- File: `use{TableName}.ts` for queries, `use{Action}{Table}` for specific actions
- Examples: `useStays.ts`, `useMoveStay.ts`, `useCancelStay.ts`
- Returns: Object with `{table}Query` for reads, mutation functions for writes

---

### Layer 3: Components (`/src/pages/` and `/src/components/`)

Components only use hooks, never Supabase directly:

```typescript
// src/pages/stays/SomePage.tsx
import { useStays } from "@/hooks/useStays";
import { useMoveStay } from "@/hooks/useMoveStay";

const SomePage = () => {
  // Use hooks for data fetching
  const { staysQuery, cancelStay } = useStays();
  const moveStay = useMoveStay();

  const handleMove = async (data) => {
    // Call mutation from hook
    await moveStay.mutateAsync({
      stayId: data.stayId,
      newRoomId: data.newRoomId,
      // ...
    });
  };

  if (staysQuery.isLoading) return <Loading />;
  if (staysQuery.error) return <Error message={staysQuery.error.message} />;

  return <div>{/* Render staysQuery.data */}</div>;
};
```

---

### Complete Example Flow

**Scenario:** Moving a reservation to another room

1. **Service** (`src/services/stays/stayMovesApi.ts`):
```typescript
export const moveStay = async (params: MoveStayParams): Promise<void> => {
  // Direct Supabase operations
  const { error } = await supabase
    .from("stays")
    .update({ room_id: params.newRoomId })
    .eq("id", params.stayId);

  if (error) throw error;
};
```

2. **Hook** (`src/hooks/useMoveStay.ts`):
```typescript
export const useMoveStay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: MoveStayParams) => moveStay(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
};
```

3. **Component** (`src/pages/stays/MoveReservationPage.tsx`):
```typescript
const MoveReservationPage = () => {
  const moveStay = useMoveStay();

  const onSubmit = async (data) => {
    await moveStay.mutateAsync(data);
  };
};
```

### Authentication

Auth is handled via `useAuth` hook which combines:
- Supabase Auth for authentication state
- React Query for employee data fetching
- Role-based access control (Admin, Recepcionista, Limpieza, Mantenimiento)

### Routing

Routes are defined in `App.tsx` with role-based protection:
- Public: `/login`, `/register-admin`
- Protected: All other routes wrapped in Layout component
- Role checks use `employee?.role?.name` from auth context

### Global UI State

`BlockUIContext` provides global loading overlay state for blocking UI during operations.

### Forms with React Hook Form

All forms must use **React Hook Form** for state management and validation:

```typescript
import { useForm, Controller } from "react-hook-form";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";

interface FormData {
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
  observation: string;
}

const MyForm = () => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      roomId: "",
      checkInDate: null,
      checkOutDate: null,
      observation: "",
    },
  });

  const onSubmit = (data: FormData) => {
    // Handle submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Dropdown with error message */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-gray-700">
          Habitación <span className="text-amber-500">*</span>
        </label>
        <Controller
          name="roomId"
          control={control}
          rules={{ required: "Campo requerido" }}
          render={({ field }) => (
            <Dropdown
              {...field}
              options={roomOptions}
              placeholder="Seleccionar habitación"
              className={errors.roomId ? "p-invalid" : ""}
            />
          )}
        />
        {errors.roomId && (
          <p className="text-xs text-red-500">{errors.roomId.message}</p>
        )}
      </div>

      {/* Textarea with error message */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-gray-700">
          Observación <span className="text-amber-500">*</span>
        </label>
        <Controller
          name="observation"
          control={control}
          rules={{ required: "Campo requerido" }}
          render={({ field }) => (
            <InputTextarea
              {...field}
              placeholder="Ingrese la observación..."
              rows={3}
              className={`w-full border-gray-200 rounded-xl ${errors.observation ? "p-invalid" : ""}`}
            />
          )}
        />
        {errors.observation && (
          <p className="text-xs text-red-500">{errors.observation.message}</p>
        )}
      </div>

      {/* Submit button - no disabled state needed */}
      <Button
        type="submit"
        label="Guardar"
        className="bg-amber-500 hover:bg-amber-600 border-none text-white w-full py-4 text-lg font-black rounded-2xl"
      />
    </form>
  );
};
```

**Key patterns:**
- Use `Controller` for PrimeReact components (Dropdown, Calendar, InputText, etc.)
- Set `mode: "onChange"` for real-time validation
- Use `watch()` to react to field changes
- **Show error messages** using `errors.fieldName.message` - don't just disable the button
- Add `p-invalid` class to PrimeReact components when there's an error
- Mark required fields with `<span className="text-amber-500">*</span>`
- **Button should NOT be disabled** - let users see validation errors when they try to submit

## Key Domain Concepts

### Stay Lifecycle
- `Reserved` → `Active` (on check-in) → `Completed` (on check-out)
- Can be `Cancelled` at any point before completion

### Room Statuses
- `Disponible` (Available)
- `Ocupado` (Occupied)
- `Reservado` (Reserved)
- `Limpieza` (Cleaning)
- `Mantenimiento` (Maintenance)

### Accommodation Types
Room types are defined in `accommodation_types` table, replacing the legacy `category` field on rooms.

### Payment Types
- `ABONO_RESERVA` - Partial reservation payment
- `PAGO_COMPLETO_RESERVA` - Full reservation payment
- `PAGO_CHECKIN_DIRECTO` - Direct check-in payment
- `ANTICIPADO_COMPLETO` - Complete advance payment

## Path Aliases

`@/` maps to `./src/` (configured in vite.config.ts and tsconfig.json):
```typescript
import { supabase } from "@/config/supabase";
import { useAuth } from "@/hooks/useAuth";
```

## Important Notes

- **No test runner** is configured in this project (no jest, vitest, or similar)
- **No linting** configuration found (no eslint, prettier configs)
- Tailwind CSS is loaded via CDN in index.html (not a local build)
- The `rooms.category` field is legacy; use `rooms.accommodation_type_id` for new development
- Database schema is documented in `DATABASE.md`
