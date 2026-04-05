import { useState } from "react";
import { Button } from "primereact/button";

interface GalleryItem {
  image: string;
  badge: string;
  title: string;
  description: string;
}

const galleryItems: GalleryItem[] = [
  {
    image: "/images-hotel/Centro del hotel.jpeg",
    badge: "Apartamento 1",
    title: "Apartamento Familiar Grande",
    description:
      "Amplio apartamento con capacidad para 6 personas. Cuenta con 2 habitaciones, sala comedor, cocina equipada, baño privado y balcón con vista al paisaje campestre.",
  },
  {
    image: "/images-hotel/Sala principal.jpeg",
    badge: "Apartamento 2",
    title: "Apartamento Estándar",
    description:
      "Confortable apartamento para 4 personas con 1 habitación amplia, sala, cocina equipada y baño privado. Ideal para familias pequeñas o parejas.",
  },
  {
    image: "/images-hotel/Sala segudo piso.jpeg",
    badge: "Equipamiento",
    title: "Cocina Equipada",
    description:
      "Todas nuestras cocinas incluyen nevera, estufa, utensilios básicos y área de comedor para preparar sus alimentos.",
  },
  {
    image: "/images-hotel/WhatsApp Image 2025-10-21 at 2.38.25 PM.jpeg",
    badge: "Confort",
    title: "Sala de Estar",
    description:
      "Amplia sala con TV, sofá cómodo y espacio ideal para descansar después de un día de actividades.",
  },
  {
    image: "/images-hotel/WhatsApp Image 2025-10-21 at 2.38.25 PM (2).jpeg",
    badge: "Ideal",
    title: "Perfecto para Familias",
    description:
      "Espacios diseñados para el confort familiar, con zonas independientes y todo lo necesario para una estadía prolongada.",
  },
];

export const HotelAboutSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const currentItem = galleryItems[activeIndex];

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? galleryItems.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev === galleryItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="apartamentos" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <div className="order-2 lg:order-1">
            {/* Title */}
            <h2 className="text-3xl font-bold text-[#1a1c1a]">Nuestros Apartamentos</h2>
            <div className="mt-4 h-1 w-16 rounded-full bg-[#006948]" />

            {/* Description */}
            <p className="mb-8 text-base leading-relaxed text-[#3d4a42]">
              Contamos con 2 amplios apartamentos familiares equipados con todo lo necesario para
              que disfrute de una estadía cómoda y placentera. Perfectos para familias grandes o
              grupos que buscan espacio y privacidad.
            </p>

            {/* Features */}
            <div className="mb-8 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <i className="pi pi-check-circle text-[#006948]"></i>
                <span className="text-sm text-[#3d4a42]">Cocina equipada</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="pi pi-check-circle text-[#006948]"></i>
                <span className="text-sm text-[#3d4a42]">Sala de estar</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="pi pi-check-circle text-[#006948]"></i>
                <span className="text-sm text-[#3d4a42]">Baño privado</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="pi pi-check-circle text-[#006948]"></i>
                <span className="text-sm text-[#3d4a42]">TV Cable</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="pi pi-check-circle text-[#006948]"></i>
                <span className="text-sm text-[#3d4a42]">WiFi incluido</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="pi pi-check-circle text-[#006948]"></i>
                <span className="text-sm text-[#3d4a42]">Aire acondicionado</span>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              unstyled
              icon="pi pi-arrow-right"
              label="Reservar Apartamento"
              className="flex items-center gap-2 rounded-full bg-[#006948] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-[#00855c] hover:shadow-xl"
              onClick={() => window.open("/reservar", "_self")}
            />
          </div>

          {/* Right Image - Gallery */}
          <div className="relative order-1 lg:order-2">
            {/* Main Image */}
            <div className="relative h-[350px] overflow-hidden rounded-2xl shadow-2xl lg:h-[400px]">
              <img
                src={currentItem.image}
                alt={currentItem.title}
                className="h-full w-full object-cover transition-opacity duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = galleryItems[0].image;
                }}
              />

              {/* Navigation Arrows - Always visible */}
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <button
                  onClick={goToPrevious}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#c4c4b8]/90 shadow-lg backdrop-blur-md transition-all hover:scale-110"
                >
                  <i className="pi pi-chevron-left text-lg text-[#006948]"></i>
                </button>
                <button
                  onClick={goToNext}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#c4c4b8]/90 shadow-lg backdrop-blur-md transition-all hover:scale-110"
                >
                  <i className="pi pi-chevron-right text-lg text-[#006948]"></i>
                </button>
              </div>
            </div>

            {/* Floating Card - Changes with image - Compact */}
            <div className="absolute right-0 bottom-3 left-0 mx-auto w-[92%] rounded-2xl bg-[#c4c4b8]/90 p-3 shadow-2xl backdrop-blur-md">
              <span className="mb-1 block text-[10px] font-bold tracking-[0.2em] text-[#006948] uppercase">
                {currentItem.badge}
              </span>
              <h3 className="mb-1 text-base font-bold text-[#1a1c1a]">{currentItem.title}</h3>
              <p className="text-xs leading-snug text-[#4a4a42]">{currentItem.description}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
