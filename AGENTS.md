# AGENTS.md - Hotel Colina Campestre Development Guide

React 19 + TypeScript hotel management system with Supabase backend.

## Development Commands

```bash
# Development server (port 3000, host 0.0.0.0)
yarn dev

# Production build
yarn build

# Preview production build
yarn preview

# Install dependencies
yarn install
```

**No testing or linting tools currently configured.** To run tests, first configure Vitest:
- `yarn add -D vitest @testing-library/react @testing-library/jest-dom`
- Run single test: `vitest run <test-file>`
- Run tests in watch mode: `vitest`

## Code Structure

```
src/
├── components/          # Reusable components
├── config/             # Configuration files
├── context/            # React contexts
├── constants/          # Constants and enums
├── hooks/              # Custom React hooks
├── pages/              # Page components (route handlers)
├── services/           # API calls and data layer
├── types/              # TypeScript type definitions
└── util/               # Utility functions
```

## Import Patterns

**Always use absolute imports with `@/` alias:**
```typescript
import { supabase } from '@/config/supabase';
import { Employee } from '@/types';
import { useAuth } from '@/hooks/useAuth';
```

**Import order:** React → Third-party → Internal → @/ absolute imports

**CRITICAL: Component Export Rules**
- ❌ NEVER create barrel exports with `index.ts` for components
- ❌ NEVER use `import { Component } from '@/components/forms'`
- ✅ ALWAYS import components directly: `import GuestForm from '@/components/stays/GuestForm'`
- ✅ Index files allowed ONLY for type exports

## TypeScript Guidelines

- All interfaces/types in `src/types/index.ts`
- Use `interface` for object shapes, `type` for unions
- Enums for fixed value sets
- All components use `React.FC` with props interface

```typescript
interface Props { name: string; }
const Component: React.FC<Props> = ({ name }) => <div>{name}</div>;
```

## React Patterns

### Custom Hooks
- Place in `src/hooks/`, naming: `useXxx`
- Return consistent object with loading/error states

### REQUIRED: UI Blocking Pattern
Always use `@/context/BlockUIContext` for loading screens:

```typescript
const { showBlockUI, hideBlockUI } = useBlockUI();

const handleSubmit = async () => {
  showBlockUI("Procesando...");
  try {
    await operation();
    setTimeout(() => hideBlockUI(), 1500);
  } catch (error) {
    showBlockUI("Error: " + error.message);
    setTimeout(() => hideBlockUI(), 3000);
  }
};
```

## Database & API Patterns

- Use Supabase client from `@/config/supabase`
- Service layer: pure functions (no React hooks)
- React Query for data fetching/mutations with hierarchical keys
- Handle errors with specific codes (PGRST116, network errors, etc.)

### Query Development Structure

**When creating queries for any table:**
1. **Service Layer**: Create folder `src/services/{table_name}/` with `{table_name}Api.ts`
2. **Hook Layer**: Create `src/hooks/use{TableName}.ts` with React Query
3. **Naming**: Hooks follow `use{TableName}` pattern
4. **CRITICAL: Query Scope** - Only implement exactly what is requested. No additional fields, no extra functionality beyond the specific requirement.
   - If asked for "all data", return only the table's fields
   - If asked for "all data with joins", then include related data
   - Default: return table data only, no extra features

```typescript
// Service layer - src/services/employees/employeeApi.ts
export const employeeApi = {
  fetchAll: async () => {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        role:roles(name)
      `)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }
};

// Hook - src/hooks/useEmployees.ts
export const useEmployees = () => {
  return useQuery({
    queryKey: ['accommodation_types'],
    queryFn: () => accommodationTypesApi.fetchAll(),
    staleTime: 1000 * 60 * 5
  });
};
```

```typescript
// Service layer
export const fetchEmployee = async (id: string): Promise<Employee> => {
  const { data, error } = await supabase.from('employees').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
};

// Hook
export const useEmployee = (id: string) => useQuery({
  queryKey: ['employee', id],
  queryFn: () => fetchEmployee(id)
});
```

## UI/UX - Emerald Color System

**Primary:** emerald-900 (backgrounds), emerald-600 (buttons/active)
**Secondary:** emerald-100 (highlights), emerald-50 (hover states)
**Accents:** border-emerald-200, text-emerald-600/800/900
**Warnings:** bg-amber-500, **Success:** bg-green-500
**NEVER use indigo colors** - fully replaced with emerald system

## Code Quality

- Max 20-30 lines per function, avoid deep nesting (>3 levels)
- Remove all console.log statements
- Self-documenting code, comments only for complex logic
- Functions must not have comments - function names should be self-descriptive
- Comments only allowed for extremely complex functions that cannot be described by name
- React Query cache: 5min staleTime, proper error boundaries
- **Function completion**: Always report function name and parameters at end of response

## Security & Performance

- Use Supabase Row Level Security (RLS)
- Never expose secrets in client code
- Validate all user inputs
- Environment variables: `VITE_*` prefix in `.env`

## Naming Conventions

- Components: `PascalCase.tsx` (UserProfile.tsx)
- Hooks: `camelCase.ts` (useAuth.ts)
- Variables/Functions: camelCase
- Constants: UPPER_SNAKE_CASE

## Deployment

## DATABASE SCHEMA CONTEXT

### IMPORTANT RULES
- Use foreign keys, never text joins
- rooms.category is legacy (read-only)
- accommodation_type_id is the source of truth

---

### accommodation_type_price_history
- id (uuid)
- accommodation_type_id → accommodation_types.id
- employee_id → employees.id
- price
- created_at

---

### accommodation_types
- id (uuid)
- name (text)
- price
- is_rentable
- created_at

---

### employees
- id (uuid)
- auth_id (unique)
- doc_type (default: 'Cédula de Ciudadanía')
- doc_number (unique)
- first_name
- last_name
- phone
- city
- address
- email
- role_id → roles.id
- created_at
- active (default: true)

---

### guests
- id (uuid)
- doc_type
- doc_number (unique)
- first_name
- last_name
- phone
- city
- address
- email
- created_at

---

### payment_methods
- id (uuid)
- name (unique)

---

### payments
- id (uuid)
- stay_id → stays.id
- payment_method_id → payment_methods.id
- employee_id → employees.id
- amount
- payment_date
- observation
- payment_type ('ABONO_RESERVA' | 'PAGO_COMPLETO_RESERVA' | 'PAGO_CHECKIN_DIRECTO' | 'ANTICIPADO_COMPLETO')
- created_at

---

### roles
- id (uuid)
- name (unique)

---

### room_history
- id (uuid)
- room_id → rooms.id
- stay_id → stays.id
- previous_status_id → room_statuses.id
- new_status_id → room_statuses.id
- employee_id → employees.id
- action_type
- observation
- timestamp
- accommodation_type_id → accommodation_types.id

---

### room_rates
- id (uuid)
- room_id → rooms.id
- person_count
- rate

---

### room_statuses
- id (uuid)
- name (unique)
- color

---

### rooms
- id (uuid)
- room_number (unique)
- category ('Hotel' | 'Apartamento' | 'Casa 1' | 'Casa 2') - LEGACY
- beds_double (default: 0)
- beds_single (default: 0)
- observation
- status_id → room_statuses.id
- is_active (default: true)
- created_at
- status_date (default: CURRENT_DATE)
- accommodation_type_id → accommodation_types.id

---

### settings
- id (uuid)
- key (unique)
- value

---

### stays
- id (uuid)
- order_number (unique, auto-increment)
- room_id → rooms.id
- guest_id → guests.id
- employee_id → employees.id
- check_in_date
- check_out_date
- status ('Active' | 'Reserved' | 'Completed' | 'Cancelled' | 'Moved')
- total_price
- paid_amount (default: 0)
- payment_method_id → payment_methods.id
- has_extra_mattress (default: false)
- is_invoice_requested (default: false)
- iva_amount (default: 0)
- custom_rate_applied (default: false)
- observation
- created_at
- extra_mattress_price (default: 0)
- origin_was_reservation (default: false)
- iva_percentage (default: 19)
- person_count (default: 1)
- extra_mattress_count (default: 0)
- extra_mattress_unit_price (default: 0)
- accommodation_type_id → accommodation_types.id
- room_status_id → room_statuses.id

---

### DOMAIN LOGIC
- Price history tracked in accommodation_type_price_history
- Status changes → room_history
- Pricing per person via room_rates
- accommodation_types controls rentable categories
- rooms.category is legacy field, use accommodation_type_id

## Deployment

Vite-based deployment. Ensure environment variables configured in production.
