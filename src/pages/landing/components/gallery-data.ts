/**
 * Gallery image data — shared between FotosSection and GaleriaPage.
 */

export interface GalleryImage {
  src: string;
  alt: string;
  category: string;
  featured?: boolean;
}

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: "/image-galeria/Centro del hotel.jpeg",
    alt: "Centro del Hotel Colina Campestre",
    category: "Hotel",
    featured: true,
  },
  {
    src: "/image-galeria/Habitacion.jpeg",
    alt: "Habitación individual del hotel",
    category: "Habitaciones",
    featured: true,
  },
  {
    src: "/image-galeria/Habitacion multiple.jpeg",
    alt: "Habitación múltiple del hotel",
    category: "Habitaciones",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.23 PM.jpeg",
    alt: "Vista general del hotel",
    category: "Hotel",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.23 PM (1).jpeg",
    alt: "Área social del hotel",
    category: "Hotel",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.23 PM (2).jpeg",
    alt: "Zona de descanso",
    category: "Hotel",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.23 PM (3).jpeg",
    alt: "Paisaje del hotel",
    category: "Paisajes",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.23 PM (4).jpeg",
    alt: "Vista exterior",
    category: "Paisajes",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.24 PM.jpeg",
    alt: "Instalaciones del hotel",
    category: "Hotel",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.24 PM (1).jpeg",
    alt: "Área común",
    category: "Hotel",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.24 PM (2).jpeg",
    alt: "Detalle de decoración",
    category: "Hotel",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.24 PM (3).jpeg",
    alt: "Vista panorámica",
    category: "Paisajes",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.24 PM (4).jpeg",
    alt: "Jardines del hotel",
    category: "Paisajes",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.25 PM.jpeg",
    alt: "Zona de eventos",
    category: "Hotel",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.25 PM (1).jpeg",
    alt: "Espacio interior",
    category: "Hotel",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.25 PM (2).jpeg",
    alt: "Rodeado de naturaleza",
    category: "Paisajes",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.26 PM.jpeg",
    alt: "Atardecer en el hotel",
    category: "Paisajes",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.26 PM (3).jpeg",
    alt: "Detalle arquitectónico",
    category: "Hotel",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.27 PM.jpeg",
    alt: "Entrada principal",
    category: "Hotel",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.27 PM (1).jpeg",
    alt: "Camino del hotel",
    category: "Paisajes",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.27 PM (2).jpeg",
    alt: "Vista desde el hotel",
    category: "Paisajes",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.27 PM (3).jpeg",
    alt: "Área de recreación",
    category: "Hotel",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.28 PM.jpeg",
    alt: "Entorno natural",
    category: "Paisajes",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.28 PM (1).jpeg",
    alt: "Montañas alrededor",
    category: "Paisajes",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.30 PM.jpeg",
    alt: "Zona verde",
    category: "Paisajes",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.30 PM (1).jpeg",
    alt: "Espacio para familias",
    category: "Hotel",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.30 PM (2).jpeg",
    alt: "Vistas campestres",
    category: "Paisajes",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.30 PM (3).jpeg",
    alt: "Ambiente relajado",
    category: "Hotel",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.31 PM.jpeg",
    alt: "Rincón del hotel",
    category: "Hotel",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.31 PM (1).jpeg",
    alt: "Naturaleza exuberante",
    category: "Paisajes",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 2.38.31 PM (2).jpeg",
    alt: "Vista aérea del hotel",
    category: "Hotel",
  },
  {
    src: "/image-galeria/WhatsApp Image 2025-10-21 at 3.48.33 PM (3) (1).jpeg",
    alt: "Paisaje campestre",
    category: "Paisajes",
  },
];

export const GALLERY_CATEGORIES = ["Todos", "Hotel", "Habitaciones", "Paisajes"] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];
