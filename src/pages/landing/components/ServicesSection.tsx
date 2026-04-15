import { ServicesContent, LandingPageImage, ServiceItem } from "@/types/landingPage";
import { ServicesGrid } from "./ServicesGrid";

interface ServicesSectionProps {
  content?: ServicesContent;
  images?: LandingPageImage[];
}

const DEFAULT_TITLE = "Servicios";
const DEFAULT_DESCRIPTION =
  "Todo lo que necesitas para una estancia cómoda y placentera en el Hotel Colina Campestre.";
const DEFAULT_FEATURED_IMAGE = "/image-comfaboy/comfaboy.jpeg";
const DEFAULT_FEATURED_ALT = "Convenio Comfaboy";

const DEFAULT_ITEMS: ServiceItem[] = [
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

export const ServicesSection = ({ content, images = [] }: ServicesSectionProps) => {
  const isLoaded = content !== undefined;

  const title = content?.title || DEFAULT_TITLE;
  const description = content?.description || DEFAULT_DESCRIPTION;

  const featuredImage = isLoaded
    ? (images.find((img) => img.slot === content?.featured_image_slot)?.public_url ?? null)
    : DEFAULT_FEATURED_IMAGE;
  const featuredAlt = content?.featured_alt || DEFAULT_FEATURED_ALT;

  const items: ServiceItem[] = isLoaded ? (content?.items ?? []) : DEFAULT_ITEMS;

  const hasFeaturedImage = Boolean(featuredImage);
  const hasItems = items.length > 0;

  if (!hasFeaturedImage && !hasItems) return null;

  return (
    <section id="servicios" className="bg-[#f4f3f0] py-16">
      <div className="mx-auto max-w-7xl px-8">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-bold text-[#1a1c1a]">{title}</h2>
          <div className="mt-4 h-1 w-16 rounded-full bg-[#006948]" />
          <p className="mt-4 text-[#4a4a4a]">{description}</p>
        </div>

        <div
          className={`grid gap-6 ${hasFeaturedImage && hasItems ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          {hasFeaturedImage && featuredImage && (
            <div className="overflow-hidden rounded-2xl shadow-xl">
              <img
                src={featuredImage}
                alt={featuredAlt}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          {hasItems && (
            <div className={hasFeaturedImage ? "lg:col-span-2" : ""}>
              <ServicesGrid services={items} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
