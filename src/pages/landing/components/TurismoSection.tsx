import { ReactNode } from "react";
import { TourismContent, AttractionItem, LandingPageImage } from "@/types/landingPage";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface ResolvedAttraction extends AttractionItem {
  image: string;
}

interface TurismoSectionProps {
  content?: TourismContent;
  images?: LandingPageImage[];
}

export const TurismoSection = ({ content, images = [] }: TurismoSectionProps) => {
  if (!content) return null;

  const title = content.title;
  const subtitle = content.subtitle;

  const resolvedAttractions: ResolvedAttraction[] = (content.attractions ?? [])
    .map((item) => {
      const image = images.find((img) => img.slot === item.slot)?.public_url;
      if (!image) return null;
      return { ...item, image };
    })
    .filter((item): item is ResolvedAttraction => item !== null);

  if (resolvedAttractions.length === 0) return null;

  const [featured, ...rest] = resolvedAttractions;

  return (
    <section id="turismo" className="bg-[#f4f3f0] py-16">
      <div className="mx-auto max-w-7xl px-8">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-bold text-[#1a1c1a]">{title}</h2>
          <div className="mt-4 h-1 w-16 rounded-full bg-[#006948]" />
          <p className="mt-4 text-[#4a4a4a]">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-1">
          <div className="md:h-[520px]">
            <FeaturedCard item={featured} />
          </div>

          {rest.length > 0 && (
            <div className="grid h-auto grid-cols-2 gap-4 md:h-[520px] md:grid-rows-2">
              {rest.map((item, index) => (
                <TourismCard
                  key={item.id}
                  item={item}
                  index={index}
                  className={rest.length % 2 === 1 && index === rest.length - 1 ? "col-span-2" : ""}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

interface FeaturedCardProps {
  item: ResolvedAttraction;
}

function CardLinkWrapper({ href, children }: { href?: string; children: ReactNode }) {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full cursor-pointer"
      >
        {children}
      </a>
    );
  }
  return <div className="block h-full">{children}</div>;
}

function FeaturedCard({ item }: FeaturedCardProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className="group relative h-full overflow-hidden rounded-2xl"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      <CardLinkWrapper href={item.cta_link}>
        <div className="relative h-96 w-full overflow-hidden md:h-full">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              width={800}
              height={600}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200">
              <i className="pi pi-image text-5xl text-gray-400"></i>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
            {item.category && (
              <span className="mb-2 w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-medium tracking-wider text-white backdrop-blur-sm">
                {item.category}
              </span>
            )}
            <h3 className="mb-2 text-2xl font-bold text-white md:text-3xl">{item.name}</h3>
            <p className="max-w-sm text-sm text-white/80">{item.description}</p>
          </div>
        </div>
      </CardLinkWrapper>
    </div>
  );
}

interface TourismCardProps {
  item: ResolvedAttraction;
  index: number;
  className?: string;
}

function TourismCard({ item, index, className = "" }: TourismCardProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const delay = index * 100;

  return (
    <div
      ref={ref}
      className={`group relative h-full overflow-hidden rounded-2xl ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      <CardLinkWrapper href={item.cta_link}>
        <div className="relative h-56 w-full overflow-hidden md:h-full">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              width={600}
              height={400}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200">
              <i className="pi pi-image text-4xl text-gray-400"></i>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end p-4">
            {item.category && (
              <span className="mb-1 w-fit rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium tracking-wider text-white/90 backdrop-blur-sm">
                {item.category}
              </span>
            )}
            <h3 className="text-lg font-bold text-white">{item.name}</h3>
            {item.description && (
              <p className="mt-1 line-clamp-2 text-xs text-white/70">{item.description}</p>
            )}
          </div>
        </div>
      </CardLinkWrapper>
    </div>
  );
}
