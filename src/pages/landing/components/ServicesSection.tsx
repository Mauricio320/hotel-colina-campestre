import { ServiceItem } from "@/types/landingPage";
import { ServicesGrid } from "./ServicesGrid";

interface ServicesSectionProps {
  services?: ServiceItem[];
}

export const ServicesSection = ({ services }: ServicesSectionProps) => {
  return (
    <section id="servicios" className="bg-[#f4f3f0] py-16">
      <div className="mx-auto max-w-7xl px-8">
        {/* Header */}
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-bold text-[#1a1c1a]">Servicios</h2>
          <div className="mt-4 h-1 w-16 rounded-full bg-[#006948]" />
          <p className="mt-4 text-[#4a4a4a]">
            Todo lo que necesitas para una estancia cómoda y placentera en el Hotel Colina
            Campestre.
          </p>
        </div>

        {/* Grid: Comfaboy + 10 servicios al lado en 4 columnas */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            {/* Convenio Comfaboy - Card destacada más compacta */}
            <div className="flex flex-col justify-between rounded-2xl bg-linear-to-br from-[#006948] to-[#004d35] p-6 text-white shadow-xl">
              <div>
                <h3 className="mb-3 text-2xl font-bold">Convenio Comfaboy</h3>
                <p className="mb-6 text-sm leading-relaxed text-white/90">
                  Hotel Colina Campestre tiene convenio con Comfaboy para brindar tarifas especiales
                  a los afiliados y sus familias.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                  <i className="pi pi-check-circle text-base text-[#90EE90]"></i>
                  <span className="text-sm">Tarifas especiales para afiliados</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                  <i className="pi pi-check-circle text-base text-[#90EE90]"></i>
                  <span className="text-sm">Beneficios para familiares</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                  <i className="pi pi-check-circle text-base text-[#90EE90]"></i>
                  <span className="text-sm">Atención prioritaria</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <ServicesGrid services={services} />
          </div>
        </div>
      </div>
    </section>
  );
};
