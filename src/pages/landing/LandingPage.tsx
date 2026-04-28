import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { BalnearioSection } from "./components/BalnearioSection";
import { HotelAboutSection } from "./components/HotelAboutSection";
import { HotelHeroSection } from "./components/HotelHeroSection";
import { Navigation } from "./components/Navigation";
import { ScrollReveal } from "./components/ScrollReveal";
import { ServicesSection } from "./components/ServicesSection";
import { TurismoSection } from "./components/TurismoSection";
import { ContactoSection } from "./components/ContactoSection";
import { useAllLandingSections, useAllLandingImages } from "@/hooks/useLandingPageCms";
import {
  HeroContent,
  AboutContent,
  ServicesContent,
  TourismContent,
  ContactContent,
  BalnearioContent,
  SectionContent,
} from "@/types/landingPage";

export const LandingPage = () => {
  const location = useLocation();

  const { data: sections = [], isLoading: sectionsLoading } = useAllLandingSections();
  const { data: imagesBySection, isLoading: imagesLoading } = useAllLandingImages();

  const sectionMap = useMemo(() => {
    const map = new Map<string, SectionContent>();
    for (const section of sections) {
      map.set(section.section.section_type, section);
    }
    return map;
  }, [sections]);

  const dbHero = sectionMap.get("hero")?.content as HeroContent | undefined;
  const aboutContent = sectionMap.get("about")?.content as AboutContent | undefined;
  const servicesContent = sectionMap.get("services")?.content as ServicesContent | undefined;
  const tourismContent = sectionMap.get("tourism")?.content as TourismContent | undefined;
  const contactContent = sectionMap.get("contact")?.content as ContactContent | undefined;
  const balnearioContent = sectionMap.get("balneario")?.content as BalnearioContent | undefined;

  const heroImages = imagesBySection?.hero ?? [];
  const aboutImages = imagesBySection?.about ?? [];
  const servicesImages = imagesBySection?.services ?? [];
  const tourismImages = imagesBySection?.tourism ?? [];
  const balnearioImages = imagesBySection?.balneario ?? [];

  const heroContent = {
    title: dbHero?.title ?? "",
    subtitle: dbHero?.subtitle ?? "",
    cta_text: dbHero?.cta_text ?? "",
    cta_link: dbHero?.cta_link ?? "",
    background_images: heroImages.map((img) => img.public_url),
  };

  const hasHeroContent = Boolean(dbHero?.title || dbHero?.subtitle || heroImages.length > 0);
  const heroReady = !sectionsLoading && !imagesLoading;

  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo) {
      const element = document.getElementById(state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div id="inicio" className="min-h-screen overflow-x-hidden bg-[#faf9f6]">
      <Navigation />

      <main className="main-lagingPage">
        {heroReady && hasHeroContent && <HotelHeroSection content={heroContent} />}

        <ScrollReveal variant="fade-up">
          <HotelAboutSection content={aboutContent} images={aboutImages} />
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={100}>
          <ServicesSection content={servicesContent} images={servicesImages} />
        </ScrollReveal>

        <ScrollReveal variant="fade-up">
          <BalnearioSection content={balnearioContent} images={balnearioImages} />
        </ScrollReveal>

        <ScrollReveal variant="slide-left">
          <TurismoSection content={tourismContent} images={tourismImages} />
        </ScrollReveal>

        <ScrollReveal variant="fade-up">
          <ContactoSection content={contactContent} />
        </ScrollReveal>
      </main>
    </div>
  );
};

export default LandingPage;
