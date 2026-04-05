import { useState, useCallback, useEffect } from "react";
import { HotelContent } from "@/types/landingPage";
import { Button } from "primereact/button";

interface HotelHeroSectionProps {
  content: HotelContent["hero"];
}

export const HotelHeroSection = ({ content }: HotelHeroSectionProps) => {
  const images =
    content?.background_images && content.background_images.length > 0
      ? content.background_images
      : [
          content?.background_image ||
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920",
        ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [isTransitioning]
  );

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    goTo(newIndex);
  }, [currentIndex, images.length, goTo]);

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    goTo(newIndex);
  }, [currentIndex, images.length, goTo]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(goToNext, 5000);
    return () => clearInterval(timer);
  }, [goToNext, images.length]);

  return (
    <section
      id="hotel"
      className="relative flex min-h-[calc(100dvh-72px)] items-center overflow-hidden pt-20"
    >
      {/* Background Images */}
      <div className="absolute inset-0 z-0">
        {images.map((src, index) => (
          <img
            key={src}
            src={src}
            alt="Hotel Colina Campestre"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-600 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-8">
        <div className="max-w-2xl rounded-xl border border-white/10 bg-[#faf9f6]/10 p-10 backdrop-blur-md">
          <h1 className="mb-6 text-5xl leading-tight font-extrabold tracking-tighter text-white md:text-6xl">
            {content?.title || "Hotel ideal para familias, turistas y viajeros de negocios"}
          </h1>
          <p className="mb-8 text-lg font-light text-white/90">
            {content?.subtitle ||
              "Experimente la serenidad de nuestro refugio campestre con todas las comodidades de la ciudad."}
          </p>
          <Button
            unstyled
            label={content?.cta_text || "Reservar ahora"}
            icon="pi pi-arrow-right"
            className="flex items-center gap-2 rounded-full bg-[#006948] px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:opacity-90"
            onClick={() => (window.location.href = content?.cta_link || "/reservar")}
          />
        </div>
      </div>

      {/* Gallery Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            disabled={isTransitioning}
            aria-label="Foto anterior"
            className="absolute left-6 z-20 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-none bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/40 disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button
            onClick={goToNext}
            disabled={isTransitioning}
            aria-label="Siguiente foto"
            className="absolute right-6 z-20 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-none bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/40 disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </>
      )}
    </section>
  );
};
