import { useState } from "react";
import { BalnearioContent, LandingPageImage } from "@/types/landingPage";
import { ServicesGrid } from "./ServicesGrid";

interface BalnearioSectionProps {
  content?: BalnearioContent;
  images?: LandingPageImage[];
}

export const BalnearioSection = ({ content, images = [] }: BalnearioSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!content) return null;

  const galleryImages = [...images].sort((a, b) => a.display_order - b.display_order);
  const items = content.items ?? [];

  const hasGallery = galleryImages.length > 0;
  const hasItems = items.length > 0;

  if (!hasGallery && !hasItems) return null;

  const goToPrev = () =>
    setCurrentIndex((i) => (i === 0 ? galleryImages.length - 1 : i - 1));

  const goToNext = () =>
    setCurrentIndex((i) => (i === galleryImages.length - 1 ? 0 : i + 1));

  return (
    <section id="balneario" className="bg-[#f4f3f0] py-16">
      <div className="mx-auto max-w-7xl px-8">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-bold text-[#1a1c1a]">{content.title}</h2>
          <div className="mt-4 h-1 w-16 rounded-full bg-[#006948]" />
          <p className="mt-4 text-[#4a4a4a]">{content.description}</p>
        </div>

        <div
          className={`grid gap-6 ${hasItems && hasGallery ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          {hasItems && (
            <div className={hasGallery ? "lg:col-span-2" : ""}>
              <ServicesGrid services={items} />
            </div>
          )}

          {hasGallery && (
            <div className="relative h-80 overflow-hidden rounded-2xl shadow-xl lg:h-full lg:min-h-[420px]">
              <img
                src={galleryImages[currentIndex].public_url}
                alt={galleryImages[currentIndex].alt_text ?? content.gallery_alt}
                className="absolute inset-0 h-full w-full object-cover"
              />

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goToPrev}
                    className="absolute top-1/2 left-3 -translate-y-1/2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/65"
                    aria-label="Imagen anterior"
                  >
                    <i className="pi pi-chevron-left text-sm" />
                  </button>

                  <button
                    type="button"
                    onClick={goToNext}
                    className="absolute top-1/2 right-3 -translate-y-1/2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/65"
                    aria-label="Imagen siguiente"
                  >
                    <i className="pi pi-chevron-right text-sm" />
                  </button>

                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {galleryImages.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentIndex(i)}
                        className={`h-1.5 cursor-pointer rounded-full transition-all ${
                          i === currentIndex ? "w-5 bg-white" : "w-1.5 bg-white/50"
                        }`}
                        aria-label={`Ir a imagen ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
