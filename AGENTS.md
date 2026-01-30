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
- React Query cache: 5min staleTime, proper error boundaries

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

Vite-based deployment. Ensure environment variables configured in production.
