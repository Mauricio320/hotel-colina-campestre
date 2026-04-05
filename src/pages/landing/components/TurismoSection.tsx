/**
 * Turismo Section Component
 *
 * Bento-style layout for tourist attractions with dynamic grid.
 * First item is featured (large), rest adapt in a 2-column grid.
 */

import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TurismoContent } from "@/types/landingPage";

/* ── Tourism data (hardcoded for now) ──────────────────────────────── */

interface TourismItem {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  distance_km: number;
}

const TOURISM_ITEMS: TourismItem[] = [
  {
    id: "1",
    name: "Villa de Leyva",
    description:
      "Explore la plaza empedrada más grande de Colombia y viaje en el tiempo entre fachadas blancas y balcones de madera.",
    category: "HISTORIA",
    image: "/image-turismo/portones-de-tontogue.jpg",
    distance_km: 45,
  },
  {
    id: "2",
    name: "Ruta de Artesanías",
    description: "Ráquira y Nobsa te esperan con su magia en barro y lana.",
    category: "CULTURA",
    image: "/image-turismo/images.jfif",
    distance_km: 30,
  },
  {
    id: "3",
    name: "Páramo de Iguaque",
    description: "Senderos ecológicos entre frailejones y lagunas sagradas.",
    category: "NATURALEZA",
    image:
      "/image-turismo/ecoturismo_apertura-turismo-ecologico-cuidado-planeta-medioambiente-sostenibilidad-viajes-excursiones--e1619178132829.avif",
    distance_km: 25,
  },
  {
    id: "4",
    name: "Gastronomía Local",
    description: "Sabores auténticos de la cocina boyacense.",
    category: "GASTRONOMÍA",
    image: "/image-turismo/view-of-the-lake-from.jpg",
    distance_km: 0,
  },
];

/* ── Intersection Observer hook ───────────────────────────────────── */

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

/* ── Component ────────────────────────────────────────────────────── */

interface TurismoSectionProps {
  content?: TurismoContent;
}

export const TurismoSection = ({ content }: TurismoSectionProps) => {
  const { title, subtitle } = content || {};
  const [featured, ...rest] = TOURISM_ITEMS;

  return (
    <section id="turismo" className="bg-[#f4f3f0] py-16">
      <div className="mx-auto max-w-7xl px-8">
        {/* Header */}
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-bold text-[#1a1c1a]">
            {title || "Experiencias Inolvidables de Turismo"}
          </h2>
          <div className="mt-4 h-1 w-16 rounded-full bg-[#006948]" />
          <p className="mt-4 text-[#4a4a4a]">
            {subtitle ||
              "Curamos las mejores rutas y actividades para que su estancia sea una inmersión total en la cultura boyacense."}
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-1">
          {/* Featured card - left side */}
          <div className="md:h-[520px]">
            <FeaturedCard item={featured} />
          </div>

          {/* Right side grid - fills the same height */}
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
        </div>
      </div>
    </section>
  );
};

/* ── Featured Card (Large, left side) ─────────────────────────────── */

interface FeaturedCardProps {
  item: TourismItem;
}

function FeaturedCard({ item }: FeaturedCardProps) {
  const { ref, isVisible } = useInView();

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
      <Link to="#" className="block h-full">
        <div className="relative h-96 w-full overflow-hidden md:h-full">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            width={800}
            height={600}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
            <span className="mb-2 w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-medium tracking-wider text-white backdrop-blur-sm">
              {item.category}
            </span>
            <h3 className="mb-2 text-2xl font-bold text-white md:text-3xl">{item.name}</h3>
            <p className="max-w-sm text-sm text-white/80">{item.description}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ── Tourism Card (Small, right side grid) ────────────────────────── */

interface TourismCardProps {
  item: TourismItem;
  index: number;
  className?: string;
}

function TourismCard({ item, index, className = "" }: TourismCardProps) {
  const { ref, isVisible } = useInView();
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
      <Link to="#" className="block h-full">
        <div className="relative h-56 w-full overflow-hidden md:h-full">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            width={600}
            height={400}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <span className="mb-1 w-fit rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium tracking-wider text-white/90 backdrop-blur-sm">
              {item.category}
            </span>
            <h3 className="text-lg font-bold text-white">{item.name}</h3>
            {!className && (
              <p className="mt-1 line-clamp-2 text-xs text-white/70">{item.description}</p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
