import { ServicesContent, LandingPageImage } from "@/types/landingPage";
import { ServicesGrid } from "./ServicesGrid";

interface ServicesSectionProps {
  content?: ServicesContent;
  images?: LandingPageImage[];
}

export const ServicesSection = ({ content, images = [] }: ServicesSectionProps) => {
  if (!content) return null;

  const title = content.title;
  const description = content.description;
  const featuredImage = images.find((img) => img.slot === content.featured_image_slot)?.public_url ?? null;
  const featuredAlt = content.featured_alt;
  const items = content.items ?? [];

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
            <div className="relative h-80 overflow-hidden rounded-2xl shadow-xl lg:h-full lg:min-h-[420px]">
              <img
                src={featuredImage}
                alt={featuredAlt}
                className="absolute inset-0 h-full w-full object-cover"
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
