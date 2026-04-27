import { useState, useCallback, useEffect } from "react";
import { Button } from "primereact/button";

interface HeroSectionContent {
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  background_images: string[];
}

interface HotelHeroSectionProps {
  content: HeroSectionContent;
}

export const HotelHeroSection = ({ content }: HotelHeroSectionProps) => {
  const images = content?.background_images?.length ? content.background_images : [];

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

  useEffect(() => {
    if (images.length <= 1) return;
    let timer: number | undefined;

    const start = () => {
      if (timer) return;
      timer = window.setInterval(goToNext, 5000);
    };
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = undefined;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    start();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [goToNext, images.length]);

  return (
    <section
      id="hotel"
      className="relative flex min-h-[calc(100dvh-72px)] items-end overflow-hidden pt-20 pb-12"
    >
      <div className="absolute inset-0 z-0">
        {images.map((src, index) => (
          <img
            key={src}
            src={src}
            alt="Hotel Colina Campestre"
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "low"}
            decoding={index === 0 ? "sync" : "async"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-600 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative z-10 w-full px-4 md:pl-24 md:pr-0">
        <div className="mx-auto max-w-sm rounded-xl border border-white/10 bg-[#faf9f6]/10 p-6 backdrop-blur-md md:mx-0">
          {content?.title && (
            <h1 className="mb-3 text-2xl leading-tight font-extrabold tracking-tighter text-white md:text-3xl">
              {content.title}
            </h1>
          )}
          {content?.subtitle && (
            <p className="mb-5 text-sm font-light text-white/90">{content.subtitle}</p>
          )}
          {content?.cta_text && (
            <Button
              unstyled
              label={content.cta_text}
              icon="pi pi-arrow-right"
              className="flex items-center gap-2 rounded-full bg-[#006948] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90"
              onClick={() => {
                if (content.cta_link)
                  window.open(content.cta_link, "_blank", "noopener,noreferrer");
              }}
            />
          )}
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            disabled={isTransitioning}
            aria-label="Foto anterior"
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-none bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/40 disabled:opacity-50"
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
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-none bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/40 disabled:opacity-50"
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
