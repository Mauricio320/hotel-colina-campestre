import { Link } from "react-router-dom";
import { GalleryContent, LandingPageImage } from "@/types/landingPage";

interface FotosSectionProps {
  content?: GalleryContent;
  images?: LandingPageImage[];
}

interface BentoImage {
  src: string;
  alt: string;
  category?: string;
}

const DEFAULT_TITLE = "Galería de Fotos";
const DEFAULT_DESCRIPTION =
  "Descubre los rincones y paisajes que hacen especial al Hotel Colina Campestre.";

export const FotosSection = ({ content, images = [] }: FotosSectionProps) => {
  const title = content?.title || DEFAULT_TITLE;
  const description = content?.description || DEFAULT_DESCRIPTION;

  const resolvedBento: BentoImage[] = (content?.featured_slots ?? [])
    .map((slot, idx): BentoImage | null => {
      const found = images.find((img) => img.slot === slot);
      if (!found) return null;
      return {
        src: found.public_url,
        alt: found.alt_text || `Imagen ${idx + 1}`,
        category: found.category || undefined,
      };
    })
    .filter((item): item is BentoImage => item !== null);

  if (resolvedBento.length === 0) return null;

  const count = resolvedBento.length;
  const isBento = count >= 7;
  const topRowImages = isBento ? resolvedBento.slice(0, 4) : resolvedBento;
  const bottomRowImages = isBento ? resolvedBento.slice(4, 7) : [];

  const adaptiveCols =
    count === 1
      ? "grid-cols-1"
      : count === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : count === 3
          ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
          : "grid-cols-2 md:grid-cols-4";

  return (
    <section id="fotos" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-8">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-[#1a1c1a]">{title}</h2>
            <div className="mt-4 h-1 w-16 rounded-full bg-[#006948]" />
            <p className="mt-4 text-[#4a4a4a]">{description}</p>
          </div>
          <Link
            to="/galeria"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#006948] px-6 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-[#00573d] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006948]"
          >
            <i className="pi pi-images" aria-hidden="true" />
            Ver galería completa
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <div className={`grid gap-4 ${adaptiveCols}`}>
            {topRowImages.map((image, idx) => (
              <BentoCard key={`top-${idx}`} image={image} />
            ))}
          </div>

          {isBento && bottomRowImages.length > 0 && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {bottomRowImages[0] && (
                <BentoCard image={bottomRowImages[0]} className="col-span-2" />
              )}
              {bottomRowImages[1] && <BentoCard image={bottomRowImages[1]} />}
              {bottomRowImages[2] && <BentoCard image={bottomRowImages[2]} />}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

interface BentoCardProps {
  image: BentoImage;
  className?: string;
}

function BentoCard({ image, className = "" }: BentoCardProps) {
  return (
    <Link to="/galeria" className={`group relative block overflow-hidden rounded-2xl ${className}`}>
      <div className="relative h-56 w-full overflow-hidden md:h-72">
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          width={800}
          height={600}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300" />

        <div className="absolute inset-0 flex flex-col justify-end p-5">
          {image.category && (
            <span className="mb-2 inline-block w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
              {image.category}
            </span>
          )}
          <h3 className="text-lg font-semibold text-white">{image.alt}</h3>
        </div>

        <div className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/0 text-white/0 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20 group-hover:text-white">
          <i className="pi pi-arrow-up-right" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}
