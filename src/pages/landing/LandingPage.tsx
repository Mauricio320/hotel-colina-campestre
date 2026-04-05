import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ContactoSection } from "./components/ContactoSection";
import { FotosSection } from "./components/FotosSection";
import { HotelAboutSection } from "./components/HotelAboutSection";
import { HotelHeroSection } from "./components/HotelHeroSection";
import { Navigation } from "./components/Navigation";
import { ScrollReveal } from "./components/ScrollReveal";
import { ServicesSection } from "./components/ServicesSection";
import { TurismoSection } from "./components/TurismoSection";
import { hotelHeroContent, hotelServices } from "./landingData";

export const LandingPage = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if we should scroll to a specific section
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo) {
      const element = document.getElementById(state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
      // Clear the state to prevent scrolling on page refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div id="inicio" className="min-h-screen overflow-x-hidden bg-[#faf9f6]">
      <Navigation />

      <main>
        <HotelHeroSection content={hotelHeroContent} />

        <ScrollReveal variant="fade-up">
          <HotelAboutSection />
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={100}>
          <ServicesSection services={hotelServices} />
        </ScrollReveal>

        <ScrollReveal variant="fade-up">
          <FotosSection />
        </ScrollReveal>

        <ScrollReveal variant="slide-left">
          <TurismoSection />
        </ScrollReveal>

        <ScrollReveal variant="fade-up">
          <ContactoSection />
        </ScrollReveal>
      </main>
    </div>
  );
};

export default LandingPage;
