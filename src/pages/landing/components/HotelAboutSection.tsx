import { useState } from "react";
import { Button } from "primereact/button";
import { AboutContent, AboutFeature, LandingPageImage } from "@/types/landingPage";

interface HotelAboutSectionProps {
  content?: AboutContent;
  images?: LandingPageImage[];
}

interface ResolvedGalleryItem {
  image: string;
  title: string;
  description: string;
}

const DEFAULT_LABEL = "Nuestra Esencia";
const DEFAULT_TITLE = "Nuestros Apartamentos";
const DEFAULT_DESCRIPTION =
  "Contamos con 2 amplios apartamentos familiares equipados con todo lo necesario para que disfrute de una estadía cómoda y placentera. Perfectos para familias grandes o grupos que buscan espacio y privacidad.";
const DEFAULT_CTA_TEXT = "Reservar Apartamento";
const DEFAULT_CTA_LINK = "/reservar";

const DEFAULT_FEATURES: AboutFeature[] = [
  { id: "1", icon: "pi-check-circle", label: "Cocina equipada" },
  { id: "2", icon: "pi-check-circle", label: "Sala de estar" },
  { id: "3", icon: "pi-check-circle", label: "Baño privado" },
  { id: "4", icon: "pi-check-circle", label: "TV Cable" },
  { id: "5", icon: "pi-check-circle", label: "WiFi incluido" },
  { id: "6", icon: "pi-check-circle", label: "Aire acondicionado" },
];

const DEFAULT_GALLERY: ResolvedGalleryItem[] = [
  {
    image: "/images-hotel/Centro del hotel.jpeg",
    title: "Apartamento Familiar Grande",
    description:
      "Amplio apartamento con capacidad para 6 personas. Cuenta con 2 habitaciones, sala comedor, cocina equipada, baño privado y balcón con vista al paisaje campestre.",
  },
  {
    image: "/images-hotel/Sala principal.jpeg",
    title: "Apartamento Estándar",
    description:
      "Confortable apartamento para 4 personas con 1 habitación amplia, sala, cocina equipada y baño privado. Ideal para familias pequeñas o parejas.",
  },
  {
    image: "/images-hotel/Sala segudo piso.jpeg",
    title: "Cocina Equipada",
    description:
      "Todas nuestras cocinas incluyen nevera, estufa, utensilios básicos y área de comedor para preparar sus alimentos.",
  },
  {
    image: "/images-hotel/WhatsApp Image 2025-10-21 at 2.38.25 PM.jpeg",
    title: "Sala de Estar",
    description:
      "Amplia sala con TV, sofá cómodo y espacio ideal para descansar después de un día de actividades.",
  },
  {
    image: "/images-hotel/WhatsApp Image 2025-10-21 at 2.38.25 PM (2).jpeg",
    title: "Perfecto para Familias",
    description:
      "Espacios diseñados para el confort familiar, con zonas independientes y todo lo necesario para una estadía prolongada.",
  },
];

export const HotelAboutSection = ({ content, images = [] }: HotelAboutSectionProps) => {
  const isLoaded = content !== undefined;

  const title = content?.title || DEFAULT_TITLE;
  const description = content?.description || DEFAULT_DESCRIPTION;
  const ctaText = content?.cta_text || DEFAULT_CTA_TEXT;
  const ctaLink = content?.cta_link || DEFAULT_CTA_LINK;

  const features: AboutFeature[] = isLoaded ? (content?.features ?? []) : DEFAULT_FEATURES;

  const galleryItems: ResolvedGalleryItem[] = isLoaded
    ? (content?.gallery_items ?? [])
        .map((item) => {
          const image = images.find((img) => img.slot === item.slot)?.public_url;
          if (!image) return null;
          return {
            image,
            title: item.title,
            description: item.description,
          };
        })
        .filter((item): item is ResolvedGalleryItem => item !== null)
    : DEFAULT_GALLERY;

  const [activeIndex, setActiveIndex] = useState(0);
  const hasGallery = galleryItems.length > 0;
  const currentItem = hasGallery ? galleryItems[activeIndex % galleryItems.length] : null;

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? galleryItems.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev === galleryItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="apartamentos" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-8">
        <div
          className={`grid items-center gap-12 ${hasGallery ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}
        >
          <div className={hasGallery ? "order-2 lg:order-1" : ""}>
            <h2 className="text-3xl font-bold text-[#1a1c1a]">{title}</h2>
            <div className="mt-4 h-1 w-16 rounded-full bg-[#006948]" />

            <p className="mt-4 mb-8 text-base leading-relaxed text-[#3d4a42]">{description}</p>

            {features.length > 0 && (
              <div className="mb-8 grid grid-cols-2 gap-4">
                {features.map((feature) => (
                  <div key={feature.id} className="flex items-center gap-2">
                    <i className={`pi ${feature.icon} text-[#006948]`}></i>
                    <span className="text-sm text-[#3d4a42]">{feature.label}</span>
                  </div>
                ))}
              </div>
            )}

            <Button
              unstyled
              icon="pi pi-arrow-right"
              label={ctaText}
              className="flex items-center gap-2 rounded-full bg-[#006948] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-[#00855c] hover:shadow-xl"
              onClick={() => window.open(ctaLink, "_blank", "noopener,noreferrer")}
            />
          </div>

          {hasGallery && currentItem && (
            <div className="relative order-1 lg:order-2">
              <div className="relative h-[350px] overflow-hidden rounded-2xl shadow-2xl lg:h-[400px]">
                <img
                  src={currentItem.image}
                  alt={currentItem.title}
                  className="h-full w-full object-cover transition-opacity duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = galleryItems[0].image;
                  }}
                />

                {galleryItems.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    <button
                      onClick={goToPrevious}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#faf9f6]/10 shadow-lg backdrop-blur-md transition-all hover:scale-110"
                    >
                      <i className="pi pi-chevron-left text-lg text-white"></i>
                    </button>
                    <button
                      onClick={goToNext}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#faf9f6]/10 shadow-lg backdrop-blur-md transition-all hover:scale-110"
                    >
                      <i className="pi pi-chevron-right text-lg text-white"></i>
                    </button>
                  </div>
                )}
              </div>

              <div className="absolute right-0 bottom-3 left-0 mx-auto w-[92%] rounded-2xl bg-[#faf9f6]/10 p-3 shadow-2xl backdrop-blur-md">
                <h3 className="mb-1 text-base font-bold text-white">{currentItem.title}</h3>
                <p className="text-xs leading-snug text-white/80">{currentItem.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
