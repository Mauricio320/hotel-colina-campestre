import { Navigation } from "./components/Navigation";
import { HotelHeroSection } from "./components/HotelHeroSection";
import { HotelAboutSection } from "./components/HotelAboutSection";
import { ServicesSection } from "./components/ServicesSection";
import { TurismoSection } from "./components/TurismoSection";
import { FotosSection } from "./components/FotosSection";
import { ContactoSection } from "./components/ContactoSection";
import { Footer } from "./components/Footer";

// Default hotel content
const hotelHeroContent = {
  title: "Hotel ideal para familias, turistas y viajeros de negocios",
  subtitle:
    "Experimente la serenidad de nuestro refugio campestre con todas las comodidades de la ciudad.",
  background_image: "public/images-hotel/WhatsApp Image 2025-10-21 at 2.38.31 PM (2).jpeg",
  background_images: [
    "public/images-hotel/WhatsApp Image 2025-10-21 at 2.38.31 PM (2).jpeg",
    "/images-hotel/Sala principal.jpeg",
    "/images-hotel/Sala segudo piso.jpeg",
    "/images-hotel/WhatsApp Image 2025-10-21 at 2.38.25 PM (2).jpeg",
    "/images-hotel/WhatsApp Image 2025-10-21 at 2.38.25 PM.jpeg",
  ],
  cta_text: "Reservar ahora",
  cta_link: "/reservar",
};

// Servicios del hotel
const hotelServices = [
  { id: "1", icon: "pi-clock", title: "Recepción 24 horas" },
  { id: "2", icon: "pi-home", title: "Habitaciones equipadas" },
  { id: "3", icon: "pi-desktop", title: "TV Cable" },
  { id: "4", icon: "pi-cog", title: "Aire acondicionado" },
  { id: "5", icon: "pi-heart", title: "Bar" },
  { id: "6", icon: "pi-briefcase", title: "Guarda equipaje" },
  { id: "7", icon: "pi-star", title: "Zona de juegos" },
  { id: "8", icon: "pi-globe", title: "Zonas de aire libre" },
  { id: "9", icon: "pi-car", title: "Parqueadero gratuito" },
  { id: "10", icon: "pi-wifi", title: "Wifi" },
];

export const LandingPage = () => {
  return (
    <div id="inicio" className="min-h-screen bg-[#faf9f6]">
      <Navigation />

      <main>
        <HotelHeroSection content={hotelHeroContent} />
        <HotelAboutSection />
        <ServicesSection services={hotelServices} />
        <FotosSection />
        <TurismoSection />
        <ContactoSection />
      </main>
    </div>
  );
};

export default LandingPage;
