# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a hotel management system for "Hotel Colina Campestre" built with React + TypeScript + Vite. The application uses Supabase for authentication and database operations, and includes features for room management, guest management, booking, check-in/check-out, payments, and reports.

## Development Commands

- `npm install` or `yarn install` - Install dependencies
- `npm run dev` or `yarn dev` - Start development server on port 3000
- `npm run build` or `yarn build` - Build for production
- `npm run preview` or `yarn preview` - Preview production build

## Architecture

### Technology Stack
- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **UI Library**: PrimeReact with custom CSS
- **State Management**: React Context + React Query (TanStack Query)
- **Database/Backend**: Supabase
- **Routing**: React Router DOM
- **Styling**: Sass + PrimeReact CSS

### Project Structure
- **`src/`** - Main source code
  - **`components/`** - Reusable UI components
    - `layout/` - Layout components (headers, sidebars)
    - `ui/` - UI components (form fields, modals)
    - `stays/` - Stay-related components
    - `tasks/` - Task management components
    - `calendar/` - Calendar components
  - **`pages/`** - Page components (routes)
    - `auth/` - Authentication pages
    - `dashboard/` - Dashboard
    - `rooms/`, `guests/`, `employees/` - Management pages
    - `stays/` - Booking/check-in/check-out pages
    - `payments/` - Payment management
    - `calendar/` - Calendar view
    - `reports/` - Reports
    - `logs/` - Cleaning/maintenance logs
    - `settings/` - Settings
    - `profile/` - User profile
  - **`hooks/`** - Custom React hooks
    - `useAuth.ts` - Authentication logic
    - `useEmployees.ts`, `useRooms.ts`, `useGuests.ts` - Data fetching hooks
    - `useStays.ts`, `usePayments.ts` - Business logic hooks
  - **`services/`** - API layer
    - `auth/` - Authentication API calls
    - `payment/` - Payment API calls
    - `queryKeys/` - React Query query keys
  - **`context/`** - React context providers
    - `BlockUIContext.tsx` - Loading/blocking UI
  - **`types/`** - TypeScript type definitions
  - **`constants/`** - App constants
  - **`config/`** - Configuration files
    - `supabase.ts` - Supabase client setup
    - `locale.ts` - Localization setup
  - **`util/`** - Utility functions
  - **`styles/`** - Global styles

### Key Patterns

#### Authentication Flow
- Uses Supabase authentication with React Query integration
- Automatic employee data synchronization when user logs in
- Role-based access control (Admin, Recepcionista, Limpieza, Mantenimiento)

#### Data Management
- React Query for server state management
- Custom hooks encapsulating API calls and business logic
- Optimistic updates for better UX

#### UI Components
- PrimeReact components with custom styling
- Consistent layout with sidebar navigation
- Role-based UI element visibility

### Database Schema Highlights
- **Employees**: User management with roles
- **Rooms**: Room management with status tracking
- **Guests**: Guest information
- **Stays**: Booking/check-in/check-out records
- **Payments**: Payment processing
- **Room History**: Audit trail for room status changes

### Environment Configuration
- Uses environment variables for Supabase configuration
- Stored in `.env` file (`.env.local` should exist locally)
- Required variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### Development Notes
- Uses path aliases (`@/` maps to `src/`)
- No strict mode to avoid request cancellations
- Spanish language throughout the application
- Error handling with specific error types (database not ready, invalid credentials, etc.)
- Room status management with visual calendar integration
- Payment system with various payment types and IVA support