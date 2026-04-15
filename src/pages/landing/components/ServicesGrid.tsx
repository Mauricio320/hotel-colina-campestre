import { ServiceItem } from "@/types/landingPage";

interface ServicesGridProps {
  services: ServiceItem[];
}

export const ServicesGrid = ({ services }: ServicesGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {services.map((service) => (
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
