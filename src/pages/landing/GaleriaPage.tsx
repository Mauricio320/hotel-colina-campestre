/**
 * Galeria Page
 *
 * Full gallery page showing all hotel photos with category filters
 * and a lightbox. Reached via "Ver todas las fotos" on the landing page.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  GALLERY_IMAGES,
  GALLERY_CATEGORIES,
  GalleryCategory,
  GalleryImage,
} from "@/pages/landing/components/gallery-data";

/* ── Intersection Observer hook for scroll animations ─────────────── */

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

/* ── Main component ──────────────────────────────────────────────── */

export default function GaleriaPage() {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("Todos");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredImages =
    activeCategory === "Todos"
      ? GALLERY_IMAGES
      : GALLERY_IMAGES.filter((img) => img.category === activeCategory);

  /* ── Lightbox keyboard navigation ──────────────────────────────── */

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filteredImages.length : null));
  }, [filteredImages.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + filteredImages.length) % filteredImages.length : null
    );
  }, [filteredImages.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, closeLightbox, goNext, goPrev]);

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="bg-[#006948] px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Galería de Fotos</h1>
            <p className="mt-1 text-sm text-white/70">Hotel Colina Campestre</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <i className="pi pi-arrow-left" aria-hidden="true" />
            Volver al inicio
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-8 py-12">
        {/* ── Category filter tabs ────────────────────────────────── */}
        <div
          className="mb-10 flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="Filtrar galería por categoría"
        >
          {GALLERY_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006948] ${
                  isActive
                    ? "bg-[#006948] text-white shadow-md"
                    : "bg-white text-[#4a4a4a] shadow-sm hover:bg-[#006948]/10 hover:text-[#006948]"
                }`}
              >
                {cat}
                {cat !== "Todos" && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({GALLERY_IMAGES.filter((img) => img.category === cat).length})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Masonry-style photo grid ────────────────────────────── */}
        <div
          className="columns-2 gap-4 md:columns-3 lg:columns-4"
          role="list"
          aria-label="Galería de fotos"
        >
          {filteredImages.map((image, index) => (
            <GalleryCard
              key={image.src}
              image={image}
              index={index}
              onClick={() => setLightboxIndex(index)}
            />
          ))}
        </div>

        {/* ── Empty state ─────────────────────────────────────────── */}
        {filteredImages.length === 0 && (
          <div className="py-16 text-center">
            <i className="pi pi-images mb-4 text-5xl text-[#ccc]" aria-hidden="true" />
            <p className="text-[#888]">No hay fotos en esta categoría</p>
          </div>
        )}

        {/* ── Photo counter ───────────────────────────────────────── */}
        {filteredImages.length > 0 && (
          <p className="mt-8 text-center text-sm text-[#888]">
            {filteredImages.length} {filteredImages.length === 1 ? "foto" : "fotos"}
          </p>
        )}
      </div>

      {/* ── Lightbox modal ────────────────────────────────────────── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overscroll-y-contain bg-black/95"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Visor de imagen"
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={closeLightbox}
            aria-label="Cerrar visor"
          >
            <i className="pi pi-times text-lg" aria-hidden="true" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 z-10 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
            {lightboxIndex + 1} / {filteredImages.length}
          </div>

          {/* Previous button */}
          <button
            className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Foto anterior"
          >
            <i className="pi pi-chevron-left text-lg" aria-hidden="true" />
          </button>

          {/* Image */}
          <figure
            className="flex max-h-[90vh] max-w-[90vw] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredImages[lightboxIndex].src}
              alt={filteredImages[lightboxIndex].alt}
              className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain"
            />
            <figcaption className="mt-4 text-center text-sm text-white/80">
              {filteredImages[lightboxIndex].alt}
            </figcaption>
          </figure>

          {/* Next button */}
          <button
            className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Foto siguiente"
          >
            <i className="pi pi-chevron-right text-lg" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Gallery Card ────────────────────────────────────────────────── */

interface GalleryCardProps {
  image: GalleryImage;
  index: number;
  onClick: () => void;
}

function GalleryCard({ image, index, onClick }: GalleryCardProps) {
  const { ref, isVisible } = useInView();
  const delay = (index % 8) * 60;

  return (
    <div
      ref={ref}
      role="listitem"
      className="mb-4 break-inside-avoid"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      <button
        onClick={onClick}
        className="group relative block w-full cursor-pointer overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006948]"
        aria-label={`Ver foto: ${image.alt}`}
      >
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          width={600}
          height={image.featured ? 800 : 450}
          className="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          style={{ aspectRatio: image.featured ? "3/4" : "4/3" }}
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="w-full p-4">
            <p className="text-sm font-medium text-white">{image.alt}</p>
            <span className="mt-1 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs text-white/90 backdrop-blur-sm">
              {image.category}
            </span>
          </div>
        </div>
        {/* Zoom icon on hover */}
        <div className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/0 text-white/0 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20 group-hover:text-white">
          <i className="pi pi-search-plus" aria-hidden="true" />
        </div>
      </button>
    </div>
  );
}
