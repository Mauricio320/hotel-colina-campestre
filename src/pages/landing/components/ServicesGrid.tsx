import { ServiceItem } from "@/types/landingPage";

// Los 10 servicios del hotel
const allServices: ServiceItem[] = [
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

interface ServicesGridProps {
  services?: ServiceItem[];
}

export const ServicesGrid = ({ services }: ServicesGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {(services || allServices).map((service) => (
        <div
          key={service.id}
          className="flex flex-col items-center justify-center rounded-lg bg-white px-3 py-4 text-center shadow-[0px_2px_8px_rgba(0,0,0,0.06)] transition-transform hover:scale-[1.02]"
        >
          <i className={`pi ${service.icon} mb-2 text-xl text-[#006948]`}></i>
          <h3 className="text-xs font-semibold text-[#1a1c1a]">{service.title}</h3>
        </div>
      ))}
    </div>
  );
};
