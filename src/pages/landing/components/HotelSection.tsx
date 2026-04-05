import { HotelContent } from "@/types/landingPage";
import { HotelHeroSection } from "./HotelHeroSection";
import { HotelAboutSection } from "./HotelAboutSection";
import { ServicesSection } from "./ServicesSection";

interface HotelSectionProps {
  content: HotelContent;
}

export const HotelSection = ({ content }: HotelSectionProps) => {
  const { hero, about, services } = content;

  return (
    <>
      {/* Hero Section */}
      {/* <HotelHeroSection content={hero} /> */}

      {/* About Section */}
      <HotelAboutSection content={about} />

      {/* Services Section */}
      <ServicesSection services={services?.items} />
    </>
  );
};
