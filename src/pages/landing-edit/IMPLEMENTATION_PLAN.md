# Plan de Implementación - Landing Editor

## Resumen
Replicar el ejemplo de Craft.js (`src/pages/craft-tutorial/example`) en `src/pages/landing-edit` con componentes adicionales.

## Estructura de Archivos a Crear

```
src/pages/landing-edit/
├── components/
│   ├── selectors/
│   │   ├── index.ts                    # Exporta todos los componentes
│   │   ├── Container/
│   │   │   ├── index.tsx               # Componente base contenedor
│   │   │   └── ContainerSettings.tsx   # Panel de configuración
│   │   ├── Text/
│   │   │   ├── index.tsx               # Texto editable
│   │   │   └── TextSettings.tsx
│   │   ├── Button/
│   │   │   ├── index.tsx               # Botón con estilos
│   │   │   └── ButtonSettings.tsx
│   │   ├── Video/
│   │   │   ├── index.tsx               # Video de YouTube
│   │   │   └── VideoSettings.tsx
│   │   ├── Image/
│   │   │   ├── index.tsx               # NUEVO: Imagen
│   │   │   └── ImageSettings.tsx
│   │   ├── Link/
│   │   │   ├── index.tsx               # NUEVO: Enlace
│   │   │   └── LinkSettings.tsx
│   │   ├── Map/
│   │   │   ├── index.tsx               # NUEVO: Mapa Google Maps
│   │   │   └── MapSettings.tsx
│   │   ├── Quote/
│   │   │   ├── index.tsx               # NUEVO: Cita/Blockquote
│   │   │   └── QuoteSettings.tsx
│   │   ├── TwoColumns/
│   │   │   ├── index.tsx               # NUEVO: 2 columnas 50/50
│   │   │   └── TwoColumnsSettings.tsx
│   │   ├── ThreeColumns/
│   │   │   ├── index.tsx               # NUEVO: 3 columnas 33/33/33
│   │   │   └── ThreeColumnsSettings.tsx
│   │   ├── TwoColumns37/
│   │   │   ├── index.tsx               # NUEVO: 2 columnas 30/70
│   │   │   └── TwoColumns37Settings.tsx
│   │   ├── Custom1/
│   │   │   └── index.tsx               # Solo acepta botones
│   │   ├── Custom2/
│   │   │   └── index.tsx               # Solo acepta videos
│   │   ├── Custom3/
│   │   │   └── index.tsx               # Debe tener al menos 1 botón
│   │   └── Resizer.tsx                 # Componente para redimensionar
│   ├── editor/
│   │   ├── index.ts                    # Exporta editor components
│   │   ├── RenderNode.tsx              # Controles flotantes al seleccionar
│   │   ├── Toolbar/
│   │   │   ├── index.tsx               # Panel de propiedades
│   │   │   ├── ToolbarItem.tsx
│   │   │   ├── ToolbarSection.tsx
│   │   │   ├── ToolbarDropdown.tsx
│   │   │   ├── ToolbarTextInput.tsx
│   │   │   └── ToolbarRadio.tsx
│   │   └── Viewport/
│   │       ├── index.tsx               # Layout principal
│   │       ├── Header.tsx              # Barra superior con undo/redo
│   │       ├── Toolbox.tsx             # Panel lateral izquierdo (drag)
│   │       └── Sidebar/
│   │           ├── index.tsx           # Panel lateral derecho
│   │           └── SidebarItem.tsx
│   └── utils/
│       └── numToMeasurement.ts         # Conversiones px/%
├── icons/                              # Iconos SVG para toolbox
│   ├── container.svg
│   ├── text.svg
│   ├── button.svg
│   ├── video.svg
│   ├── image.svg
│   ├── link.svg
│   ├── map.svg
│   ├── quote.svg
│   ├── two-columns.svg
│   ├── three-columns.svg
│   ├── two-columns-37.svg
│   ├── undo.svg
│   ├── redo.svg
│   ├── move.svg
│   ├── delete.svg
│   ├── arrow-up.svg
│   ├── arrow.svg
│   ├── customize.svg
│   └── layers.svg
├── LandingEditPage.tsx                 # Página principal
└── styles.css                          # Estilos adicionales
```

## Dependencias Adicionales Requeridas

```bash
npm install styled-components react-contenteditable react-youtube re-resizable clsx
npm install -D @types/styled-components
```

Notas:
- `@craftjs/layers` ya está disponible (usado en el ejemplo)
- `debounce` puede usar lodash.debounce o implementación propia

## Componentes Nuevos a Implementar

### Layout (Columnas)
1. **TwoColumns**: Grid de 2 columnas 50%/50%
2. **ThreeColumns**: Grid de 3 columnas 33%/33%/33%
3. **TwoColumns37**: Grid de 2 columnas 30%/70%

### Media
4. **Image**: `src`, `alt`, object-fit, bordes redondeados
5. **Video**: Video de YouTube (ya existe en ejemplo)

### Navigation
6. **Link**: Enlace `<a>` o componente Link con href, target, text
7. **Map**: Iframe de Google Maps con lat/lng o address

### Content
8. **Quote**: Blockquote con texto, autor, estilos

## Diseño del Toolbox (Wireframe Style)

```
┌─────────────────────────┐
│  LAYOUT                 │
├─────────────────────────┤
│ [□] [▭] [‖] [≡] [▯▮]   │
│  Con  2Col 3Col 2Col37  │
│  tain                   │
├─────────────────────────┤
│  BASICS                 │
├─────────────────────────┤
│ [Aa] [▭] [▭]           │
│ Text  But  Link         │
├─────────────────────────┤
│  MEDIA                  │
├─────────────────────────┤
│ [○] [▭] [▭]            │
│ Img  Vid  Map           │
├─────────────────────────┤
│  CONTENT                │
├─────────────────────────┤
│ ["]                    │
│ Quote                   │
└─────────────────────────┘

Fondo: #1a1a2e (oscuro)
Items: Iconos outline blancos/grises
Hover: Borde amber-500
Grid: 2 columnas
```

## Rutas a Modificar

En `src/App.tsx`, agregar:
```tsx
import { LandingEditPage } from '@/pages/landing-edit/LandingEditPage';

// En las rutas:
<Route path="/landing-edit" element={<LandingEditPage />} />
```

## Características del Editor

1. **Drag & Drop**: Desde Toolbox al canvas
2. **Selección**: Click para seleccionar, controles flotantes
3. **Propiedades**: Panel derecho Toolbar con settings
4. **Layers**: Panel de capas jerárquico
5. **Undo/Redo**: Historial de cambios
6. **Redimensionar**: Handles en componentes seleccionados

## Tiempo Estimado
Aproximadamente 2-3 horas para implementación completa.

## Procedo?
¿Confirmas para comenzar la implementación?
