import { useState } from "react";
import { TabMenu } from "primereact/tabmenu";
import PageHeader from "@/components/ui/PageHeader";
import { HeroEditor } from "./components/HeroEditor";
import { AboutEditor } from "./components/AboutEditor";
import { ServicesEditor } from "./components/ServicesEditor";
import { GalleryEditor } from "./components/GalleryEditor";
import { TourismEditor } from "./components/TourismEditor";
import { ContactEditor } from "./components/ContactEditor";
import { SectionType } from "@/types/landingPage";

type SectionTab = SectionType;

export const LandingPageAdmin = () => {
  const [activeTab, setActiveTab] = useState<SectionTab>("hero");

  const tabs: { label: string; icon: string; value: SectionTab }[] = [
    { label: "Hotel", icon: "pi pi-home", value: "hero" },
    { label: "Colina Suites", icon: "pi pi-building-columns", value: "about" },
    { label: "Servicios", icon: "pi pi-star", value: "services" },
    { label: "Galería", icon: "pi pi-images", value: "gallery" },
    { label: "Turismo", icon: "pi pi-map", value: "tourism" },
    { label: "Contacto", icon: "pi pi-envelope", value: "contact" },
  ];

  const renderEditor = () => {
    switch (activeTab) {
      case "hero":
        return <HeroEditor />;
      case "about":
        return <AboutEditor />;
      case "services":
        return <ServicesEditor />;
      case "gallery":
        return <GalleryEditor />;
      case "tourism":
        return <TourismEditor />;
      case "contact":
        return <ContactEditor />;
      default:
        return <HeroEditor />;
    }
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6 p-6">
      <PageHeader
        variant="simple"
        title="Landing Page"
        subtitle="Configura el contenido público del sitio"
        icon="pi-globe"
        color="emerald"
      />

      <TabMenu
        model={tabs.map((tab) => ({
          label: tab.label,
          icon: tab.icon,
          command: () => setActiveTab(tab.value),
        }))}
        activeIndex={tabs.findIndex((t) => t.value === activeTab)}
      />

      <div>{renderEditor()}</div>
    </div>
  );
};

export default LandingPageAdmin;
