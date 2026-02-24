<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Hotel Colina Campestre

Un sistema de gestión hotelera construido con React, TypeScript y Supabase.

## 🛠️ Tecnologías

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Backend/Database**: Supabase (PostgreSQL + Auth)
- **Data Fetching**: TanStack Query (React Query) v5
- **UI Components**: PrimeReact v10
- **Enrutamiento**: React Router v7
- **Formularios**: React Hook Form
- **Estilos**: Tailwind CSS
- **Manejo de fechas**: Day.js

## 🚀 Instalación y ejecución local

### Requisitos previos
- Node.js
- pnpm (recomendado) o npm

### Pasos

1. **Clonar el repositorio e instalar dependencias:**
   ```bash
   pnpm install
   ```
   *(También puedes usar `npm install`)*

2. **Configurar variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto agregando las siguientes variables obligatorias:
   ```env
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```
   *Opcional para características de IA (también en `.env.local` si prefieres):*
   ```env
   GEMINI_API_KEY=tu_gemini_api_key
   ```

3. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`.

## 🏗️ Arquitectura

El proyecto sigue una arquitectura estricta de 3 capas para el manejo de datos:

1. **Servicios (`src/services/`)**: Operaciones directas con Supabase. Un archivo por tabla (ej. `staysApi.ts`).
2. **Hooks (`src/hooks/`)**: Wrappers de TanStack Query alrededor de los servicios para gestionar caché y mutaciones (ej. `useStays.ts`).
3. **Componentes (`src/components/`, `src/pages/`)**: Interfaz de usuario que consume los hooks. Los componentes **nunca** llaman a Supabase directamente.

## 👥 Roles de Usuario

El sistema cuenta con un control de acceso basado en roles (RBAC) gestionado a través de Supabase Auth:
- **Admin**: Acceso completo.
- **Recepcionista**: Gestión de reservas, huéspedes, pagos y habitaciones.
- **Limpieza**: Visualización de bitácoras de limpieza.
- **Mantenimiento**: Visualización de tareas de mantenimiento.

## 📦 Scripts disponibles

- `npm run dev` o `pnpm run dev`: Inicia el servidor de desarrollo local en el puerto 3000.
- `npm run build`: Construye la aplicación para producción.
- `npm run preview`: Previsualiza la build de producción localmente.

---
View your app in AI Studio: https://ai.studio/apps/drive/1Hudro_8XT1w2ghHoUini_iFaipeylIyn
