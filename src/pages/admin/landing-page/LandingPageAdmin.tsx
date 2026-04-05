/**
 * Landing Page Admin Layout
 *
 * Admin panel for editing landing page sections.
 */

import { useState } from "react";
import { TabMenu } from "primereact/tabmenu";
import { HotelEditor } from "./components/HotelEditor";
import { ComfaboyEditor } from "./components/ComfaboyEditor";
import { TurismoEditor } from "./components/TurismoEditor";
import { FotosEditor } from "./components/FotosEditor";
import { ContactoEditor } from "./components/ContactoEditor";

type SectionTab = "hotel" | "comfaboy" | "turismo" | "fotos" | "contacto";

export const LandingPageAdmin = () => {
  const [activeTab, setActiveTab] = useState<SectionTab>("hotel");

  const tabs = [
    { label: "Hotel", icon: "pi pi-home", value: "hotel" as SectionTab },
    { label: "Comfaboy", icon: "pi pi-users", value: "comfaboy" as SectionTab },
    { label: "Turismo", icon: "pi pi-map", value: "turismo" as SectionTab },
    { label: "Fotos", icon: "pi pi-images", value: "fotos" as SectionTab },
    { label: "Contacto", icon: "pi pi-envelope", value: "contacto" as SectionTab },
  ];

  const renderEditor = () => {
    switch (activeTab) {
      case "hotel":
        return <HotelEditor />;
      case "comfaboy":
        return <ComfaboyEditor />;
      case "turismo":
        return <TurismoEditor />;
      case "fotos":
        return <FotosEditor />;
      case "contacto":
        return <ContactoEditor />;
      default:
        return <HotelEditor />;
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-[#1a1c1a]">Configurar Landing Page</h1>

      <TabMenu
        model={tabs.map((tab) => ({
          label: tab.label,
          icon: tab.icon,
          command: () => setActiveTab(tab.value),
        }))}
        activeIndex={tabs.findIndex((t) => t.value === activeTab)}
      />

      <div className="mt-6">{renderEditor()}</div>
    </div>
  );
};

export default LandingPageAdmin;
