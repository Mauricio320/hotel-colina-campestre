/**
 * Comfaboy Section Component
 *
 * Displays Comfaboy partnership information.
 */

import { ComfaboyContent } from "@/types/landingPage";

interface ComfaboySectionProps {
  content?: ComfaboyContent;
}

export const ComfaboySection = ({ content }: ComfaboySectionProps) => {
  const { hero, description, benefits } = content || {};

  return (
    <section id="comfaboy" className="bg-[#faf9f6] py-24">
      {/* Hero */}
      <div className="relative mb-16 flex h-[400px] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={
              hero?.background_image ||
              "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1920"
            }
            alt="Comfaboy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center">
          <h2 className="text-5xl font-bold text-white md:text-6xl">
            {hero?.title || "Convenio Comfaboy"}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-8">
        <p className="mx-auto mb-16 max-w-3xl text-center text-lg leading-relaxed text-[#3d4a42]">
          {description ||
            "Hotel Colina Campestre tiene convenio con Comfaboy para brindar tarifas especiales a los afiliados y sus familias."}
        </p>

        {/* Benefits */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {(benefits || []).map((benefit) => (
            <div
              key={benefit.id}
              className="rounded-xl bg-white p-8 text-center shadow-[0px_20px_40px_rgba(0,0,0,0.06)]"
            >
              <span className="material-symbols-outlined mb-4 text-4xl text-[#006948]">
                {benefit.icon}
              </span>
              <h3 className="mb-2 text-lg font-bold text-[#1a1c1a]">{benefit.title}</h3>
              <p className="text-sm text-[#3d4a42]">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
