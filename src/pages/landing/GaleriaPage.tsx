import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { ProgressSpinner } from "primereact/progressspinner";
import { useLandingImages } from "@/hooks/useLandingPageCms";
import { useLandingImageCategories } from "@/hooks/useLandingImageCategories";
import { LandingPageImage } from "@/types/landingPage";
import { useScrollReveal } from "./hooks/useScrollReveal";

interface GalleryCardImage {
  id: string;
  src: string;
  alt: string;
  category: string;
}

const ALL_CATEGORIES = "Todos";

function toCardImage(img: LandingPageImage, idx: number): GalleryCardImage {
  return {
    id: img.id,
    src: img.public_url,
    alt: img.alt_text || `Imagen ${idx + 1}`,
    category: img.category || "Sin categoría",
  };
}

export default function GaleriaPage() {
  const { data: rawImages = [], isLoading: loadingImages } = useLandingImages("gallery");
  const { data: categories = [] } = useLandingImageCategories();

  const galleryImages: GalleryCardImage[] = useMemo(
    () => rawImages.map(toCardImage),
    [rawImages]
  );

  const categoryTabs = useMemo(() => {
    const names = categories.map((c) => c.name);
    const orphanCategories = Array.from(
      new Set(
        galleryImages
          .map((img) => img.category)
          .filter((cat) => cat && cat !== "Sin categoría" && !names.includes(cat))
      )
    );
    return [ALL_CATEGORIES, ...names, ...orphanCategories];
  }, [categories, galleryImages]);

  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredImages =
    activeCategory === ALL_CATEGORIES
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory);

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
    document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };

    if (lightboxIndex !== null) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, closeLightbox, goNext, goPrev]);

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <header className="bg-[#006948] px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white">Galería de Fotos</h1>
            <span className="text-sm text-white/50">|</span>
            <span className="text-sm text-white/70">Hotel Colina Campestre</span>
          </div>
          <Link
            to="/"
            state={{ scrollTo: "fotos" }}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            <i className="pi pi-arrow-left text-xs" aria-hidden="true" />
            Volver
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-8 py-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-[#1a1c1a]">Galería de Fotos</h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#006948]" />
          <p className="mx-auto mt-4 max-w-2xl text-base text-[#4a4a4a]">
            Descubre los rincones y paisajes que hacen especial al Hotel Colina Campestre.
          </p>
        </div>

        {loadingImages ? (
          <div className="flex justify-center py-16">
            <ProgressSpinner style={{ width: "48px", height: "48px" }} />
          </div>
        ) : galleryImages.length === 0 ? (
          <div className="py-16 text-center">
            <i className="pi pi-images mb-4 text-5xl text-[#ccc]" aria-hidden="true" />
            <p className="text-[#888]">Aún no hay fotos en la galería</p>
          </div>
        ) : (
          <>
            <div
              className="mb-6 flex flex-wrap items-center justify-center gap-2"
              role="tablist"
              aria-label="Filtrar galería por categoría"
            >
              {categoryTabs.map((cat) => {
                const isActive = activeCategory === cat;
                const count =
                  cat === ALL_CATEGORIES
                    ? galleryImages.length
                    : galleryImages.filter((img) => img.category === cat).length;
                return (
                  <button
                    key={cat}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveCategory(cat)}
                    className={`cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006948] ${
                      isActive
                        ? "bg-[#006948] text-white shadow-md"
                        : "bg-white text-[#4a4a4a] shadow-sm hover:bg-[#006948]/10 hover:text-[#006948]"
                    }`}
                  >
                    {cat}
                    {cat !== ALL_CATEGORIES && <span className="ml-1.5 text-xs opacity-70">({count})</span>}
                  </button>
                );
              })}
            </div>

            <div
              className="columns-2 gap-4 md:columns-3 lg:columns-4"
              role="list"
              aria-label="Galería de fotos"
            >
              {filteredImages.map((image, index) => (
                <GalleryCard
                  key={image.id}
                  image={image}
                  index={index}
                  onClick={() => setLightboxIndex(index)}
                />
              ))}
            </div>

            {filteredImages.length === 0 && (
              <div className="py-16 text-center">
                <i className="pi pi-images mb-4 text-5xl text-[#ccc]" aria-hidden="true" />
                <p className="text-[#888]">No hay fotos en esta categoría</p>
              </div>
            )}

            {filteredImages.length > 0 && (
              <p className="mt-8 text-center text-sm text-[#888]">
                {filteredImages.length} {filteredImages.length === 1 ? "foto" : "fotos"}
              </p>
            )}
          </>
        )}
      </div>

      {lightboxIndex !== null && filteredImages[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overscroll-y-contain bg-black/95"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Visor de imagen"
        >
          <button
            className="absolute top-4 right-4 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={closeLightbox}
            aria-label="Cerrar visor"
          >
            <i className="pi pi-times text-lg" aria-hidden="true" />
          </button>

          <div className="absolute top-4 left-4 z-10 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
            {lightboxIndex + 1} / {filteredImages.length}
          </div>

          <button
            className="absolute left-4 z-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Foto anterior"
          >
            <i className="pi pi-chevron-left text-lg" aria-hidden="true" />
          </button>

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

          <button
            className="absolute right-4 z-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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

interface GalleryCardProps {
  image: GalleryCardImage;
  index: number;
  onClick: () => void;
}

function GalleryCard({ image, index, onClick }: GalleryCardProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const delay = (index % 8) * 60;

  const getAspectRatio = () => {
    const pattern = index % 6;
    switch (pattern) {
      case 0:
        return "1/1";
      case 2:
        return "3/4";
      case 4:
        return "4/3";
      default:
        return "4/3";
    }
  };

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
          className="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          style={{ aspectRatio: getAspectRatio() }}
        />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="w-full p-4">
            <p className="text-sm font-medium text-white">{image.alt}</p>
            {image.category && image.category !== "Sin categoría" && (
              <span className="mt-1 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs text-white/90 backdrop-blur-sm">
                {image.category}
              </span>
            )}
          </div>
        </div>
        <div className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/0 text-white/0 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20 group-hover:text-white">
          <i className="pi pi-search-plus" aria-hidden="true" />
        </div>
      </button>
    </div>
  );
}
