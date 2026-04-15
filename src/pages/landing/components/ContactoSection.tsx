import { MapContainer, TileLayer, Marker, Popup, Circle, ZoomControl } from "react-leaflet";
import { ContactContent } from "@/types/landingPage";
import { useScrollReveal } from "../hooks/useScrollReveal";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const hotelIcon = L.divIcon({
  html: `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 8px rgba(217,79,48,0.4));">
    <div style="
      background: #D94F30;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 21h18"/>
        <path d="M5 21V7l8-4v18"/>
        <path d="M19 21V11l-6-4"/>
        <path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/><path d="M9 18v.01"/>
      </svg>
    </div>
    <div style="
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 14px solid #D94F30;
      margin-top: -3px;
    "></div>
  </div>`,
  className: "",
  iconSize: [48, 62],
  iconAnchor: [24, 62],
  popupAnchor: [0, -62],
});

const DEFAULT_CONTACT: ContactContent = {
  title: "Contacto",
  description: "Estamos aquí para ayudarte. Contáctanos por cualquiera de nuestros canales.",
  address: "Vía Paipa - Tunja, Kilómetro 15",
  phone1: "+57 312 456 7890",
  phone2: "(608) 740 0000",
  email: "recepcion@hotelcolinacampestre.com",
  hours: "Atención personalizada todos los días de 7:00 AM a 9:00 PM",
  whatsapp: "+573124567890",
  map_lat: 4.820884414676493,
  map_lng: -73.16965643183725,
};

interface ContactoSectionProps {
  content?: ContactContent;
}

export const ContactoSection = ({ content }: ContactoSectionProps) => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  const isLoaded = content !== undefined;
  const source = isLoaded ? content! : DEFAULT_CONTACT;

  const title = source.title || "Contacto";
  const description = source.description;
  const address = source.address;
  const phone1 = source.phone1;
  const phone2 = source.phone2;
  const email = source.email;
  const hours = source.hours;
  const whatsapp = source.whatsapp;
  const hasMap = Boolean(source.map_lat && source.map_lng);
  const coords: [number, number] = [source.map_lat, source.map_lng];
  const whatsappNumber = whatsapp.replace(/\+/g, "");

  const hasAnyContact = Boolean(phone1 || phone2 || email || whatsapp || hours);

  if (!hasMap && !hasAnyContact && !address) return null;

  return (
    <section id="contacto" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-8">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-bold text-[#1a1c1a]">{title}</h2>
          <div className="mt-4 h-1 w-16 rounded-full bg-[#006948]" />
          {description && <p className="mt-4 text-[#4a4a4a]">{description}</p>}
        </div>

        <div
          ref={ref}
          className={`grid gap-6 ${hasMap && hasAnyContact ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          {hasMap && (
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <MapContainer
                center={coords}
                zoom={17}
                scrollWheelZoom={false}
                zoomControl={false}
                className="h-[400px] w-full md:h-[520px]"
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <ZoomControl position="bottomright" />
                <Circle
                  center={coords}
                  radius={80}
                  pathOptions={{
                    color: "#D94F30",
                    fillColor: "#D94F30",
                    fillOpacity: 0.1,
                    weight: 2,
                  }}
                />
                <Marker position={coords} icon={hotelIcon}>
                  <Popup>
                    <strong>Hotel Colina Campestre</strong>
                    {address && (
                      <>
                        <br />
                        {address}
                      </>
                    )}
                  </Popup>
                </Marker>
              </MapContainer>

              {address && (
                <div className="absolute bottom-4 left-4 z-[400] max-w-xs rounded-xl bg-white/95 p-4 shadow-lg backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-[#1a1c1a]">Hotel Colina Campestre</h3>
                  <div className="mt-2 flex items-start gap-2 text-sm text-[#4a4a4a]">
                    <i className="pi pi-map-marker mt-0.5 text-[#006948]" aria-hidden="true" />
                    <span>{address}</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#006948] hover:underline"
                  >
                    Cómo llegar
                    <i className="pi pi-arrow-right" aria-hidden="true" />
                  </a>
                </div>
              )}

              <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006948] text-white shadow-lg transition-colors hover:bg-[#00573d]"
                  aria-label="Cómo llegar"
                >
                  <i className="pi pi-directions text-sm" aria-hidden="true" />
                </a>
              </div>
            </div>
          )}

          {hasAnyContact && (
            <div className="h-fit rounded-2xl bg-[#f4f3f0] p-6 shadow-lg md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#006948]/10">
                  <i className="pi pi-phone text-2xl text-[#006948]" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1a1c1a]">Central de Reservas</h3>
                  {hours && <p className="text-sm text-[#4a4a4a]">{hours}</p>}
                </div>
              </div>

              <div className="space-y-4">
                {phone1 && (
                  <a
                    href={`tel:${phone1.replace(/\s/g, "")}`}
                    className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006948]/10">
                      <i className="pi pi-mobile text-[#006948]" aria-hidden="true" />
                    </div>
                    <span className="font-medium text-[#1a1c1a]">{phone1}</span>
                  </a>
                )}

                {phone2 && (
                  <a
                    href={`tel:${phone2.replace(/[()\s]/g, "")}`}
                    className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006948]/10">
                      <i className="pi pi-phone text-[#006948]" aria-hidden="true" />
                    </div>
                    <span className="font-medium text-[#1a1c1a]">{phone2}</span>
                  </a>
                )}

                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006948]/10">
                      <i className="pi pi-envelope text-[#006948]" aria-hidden="true" />
                    </div>
                    <span className="font-medium text-[#1a1c1a]">{email}</span>
                  </a>
                )}

                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl bg-[#25D366]/10 px-4 py-3 transition-colors hover:bg-[#25D366]/20"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]/20">
                      <i className="pi pi-whatsapp text-[#128C7E]" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="block font-medium text-[#128C7E]">WhatsApp</span>
                      <span className="text-xs text-[#128C7E]/70">Respuesta inmediata</span>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
