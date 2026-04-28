import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { HeroEditor } from "./components/HeroEditor";
import { AboutEditor } from "./components/AboutEditor";
import { ServicesEditor } from "./components/ServicesEditor";
import { BalnearioEditor } from "./components/BalnearioEditor";
import { TourismEditor } from "./components/TourismEditor";
import { ContactEditor } from "./components/ContactEditor";
import { SectionType } from "@/types/landingPage";

type SectionTab = SectionType;

export const LandingPageAdmin = () => {
  const [activeTab, setActiveTab] = useState<SectionTab>("hero");

  const tabs: { label: string; icon: string; value: SectionTab }[] = [
    { label: "Hotel", icon: "pi pi-home", value: "hero" },
    { label: "Colina Suites", icon: "pi pi-building-columns", value: "about" },
    { label: "Arrayanes", icon: "pi pi-star", value: "services" },
    { label: "Balneario", icon: "pi pi-sun", value: "balneario" },
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
      case "balneario":
        return <BalnearioEditor />;
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

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={
                isActive
                  ? "flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors"
                  : "flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              }
            >
              <i className={`${tab.icon} text-sm`} aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div>{renderEditor()}</div>
    </div>
  );
};

export default LandingPageAdmin;
