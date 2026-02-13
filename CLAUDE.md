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

### Data Fetching with TanStack Query

All server state is managed via TanStack Query hooks in `/src/hooks/`:

```typescript
// Pattern: useQuery for reads, useMutation for writes
export const useGuests = () => {
  const queryClient = useQueryClient();

  const guestsQuery = useQuery({
    queryKey: ['guests'],
    queryFn: () => guestApi.fetchAll(),
    staleTime: 1000 * 60 * 5
  });

  const upsertGuest = useMutation({
    mutationFn: (guestData: Partial<Guest>) => guestApi.upsert(guestData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  return { guestsQuery, upsertGuest };
};
```

### API Layer

Services in `/src/services/` use the Supabase client from `/src/config/supabase.ts`:

```typescript
import { supabase } from "@/config/supabase";

export const StayCreateService = (stayData: Stay) => {
  return supabase.from("stays").insert(stayData).select().single();
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
