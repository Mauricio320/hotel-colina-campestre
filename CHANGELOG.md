# Changelog

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Added

- **Habitaciones**: funcionalidad para eliminar tarifas directamente desde el formulario de habitación
  - Nuevo servicio `roomRatesApi.ts` para operaciones CRUD de tarifas
  - Nuevo hook `useDeleteRoomRate.ts` siguiendo la arquitectura de 3 capas
  - Modal de confirmación personalizado antes de eliminar
  - Bloqueo de UI durante la operación de eliminación
  - Ordenamiento automático de tarifas por número de personas

### Changed

- **UI**: diseño mejorado del diálogo de confirmación (`ConfirmDialog`)
  - Header con gradiente amarillo/dorado
  - Iconos y colores consistentes con la identidad del hotel
  - Botones con estilos personalizados

### Fixed

- **Habitaciones**: corrección en la eliminación de tarifas cuando se ordenan por número de personas
  - Ahora se utiliza el índice correcto del array original al eliminar

## [1.0.0] - 2025-XX-XX

### Added

- Sistema de gestión de hotel completo
- Gestión de habitaciones, reservas y huéspedes
- Sistema de pagos y facturación
- Panel de calendario para visualización de ocupación
- Autenticación y roles de usuario
