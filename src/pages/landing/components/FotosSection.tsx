/**
 * Fotos Section Component
 *
 * Bento-style gallery preview on the landing page with asymmetric grid
 * and a "Ver más" button linking to the full gallery at /galeria.
 */

import { Link } from "react-router-dom";
import { FotosContent } from "@/types/landingPage";
import { GALLERY_IMAGES } from "./gallery-data";

interface FotosSectionProps {
  content?: FotosContent;
}

export const FotosSection = ({ content }: FotosSectionProps) => {
  const { title } = content || {};

  // Select 7 featured images: 4 on top row, 3 on bottom row
  const topRowImages = [
    GALLERY_IMAGES[0], // Centro del hotel
    GALLERY_IMAGES[1], // Habitación
    GALLERY_IMAGES[6], // Paisaje
    GALLERY_IMAGES[13], // Zona de eventos
  ];

  const bottomRowImages = [
    GALLERY_IMAGES[25], // Espacio para familias
    GALLERY_IMAGES[2], // Habitación múltiple
    GALLERY_IMAGES[16], // Atardecer
  ];

  return (
    <section id="fotos" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-8">
        {/* Header */}
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-[#1a1c1a]">{title || "Galería de Fotos"}</h2>
            <div className="mt-4 h-1 w-16 rounded-full bg-[#006948]" />
            <p className="mt-4 text-[#4a4a4a]">
              Descubre los rincones y paisajes que hacen especial al Hotel Colina Campestre.
            </p>
          </div>
          <Link
            to="/galeria"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#006948] px-6 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-[#00573d] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006948]"
          >
            <i className="pi pi-images" aria-hidden="true" />
            Ver galería completa
          </Link>
        </div>

        {/* Grid Layout: 4 on top, 3 on bottom */}
        <div className="flex flex-col gap-4">
          {/* Top row - 4 images */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {topRowImages.map((image) => (
              <BentoCard key={image.src} image={image} />
            ))}
          </div>

          {/* Bottom row - 3 images: 1 wide + 2 normal */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <BentoCard image={bottomRowImages[0]} className="col-span-2" />
            <BentoCard image={bottomRowImages[1]} />
            <BentoCard image={bottomRowImages[2]} />
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── Bento Card Component ─────────────────────────────────────────── */

interface BentoCardProps {
  image: {
    src: string;
    alt: string;
    category: string;
    size?: string;
  };
  className?: string;
}

function BentoCard({ image, className = "" }: BentoCardProps) {
  return (
    <Link to="/galeria" className={`group relative block overflow-hidden rounded-2xl ${className}`}>
      <div className="relative h-56 w-full overflow-hidden md:h-72">
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          width={800}
          height={600}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Gradient overlay - always visible but intensifies on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <span className="mb-2 inline-block w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
            {image.category}
          </span>
          <h3 className="text-lg font-semibold text-white">{image.alt}</h3>
        </div>

        {/* Hover icon */}
        <div className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/0 text-white/0 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20 group-hover:text-white">
          <i className="pi pi-arrow-up-right" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}
