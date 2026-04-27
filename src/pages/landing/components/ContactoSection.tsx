import { MapContainer, TileLayer, Marker, Popup, Circle, ZoomControl } from "react-leaflet";
import { ContactContent } from "@/types/landingPage";
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

interface ContactoSectionProps {
  content?: ContactContent;
}

export const ContactoSection = ({ content }: ContactoSectionProps) => {
  if (!content) return null;

  const title = content.title || "Contacto";
  const description = content.description;
  const address = content.address;
  const phone1 = content.phone1;
  const phone2 = content.phone2;
  const email = content.email;
  const hours = content.hours;
  const hasMap =
    typeof content.map_lat === "number" &&
    typeof content.map_lng === "number" &&
    content.map_lat !== 0 &&
    content.map_lng !== 0;
  const coords: [number, number] = hasMap
    ? [content.map_lat, content.map_lng]
    : [4.7110, -74.0721];

  const socialLinks = content.social_links ?? [];
  const hasAnyContact = Boolean(phone1 || phone2 || email || hours || socialLinks.length > 0);

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
          className={`grid gap-6 ${hasMap && hasAnyContact ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}
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
                  <i className="pi pi-calendar text-2xl text-[#006948]" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1a1c1a]">Central de Reservas</h3>
                  {hours && <p className="text-sm text-[#4a4a4a]">{hours}</p>}
                </div>
              </div>

              <div className="space-y-4">
                {socialLinks.map((link) => {
                  const color = link.color;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        color
                          ? "flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:brightness-95"
                          : "flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100"
                      }
                      style={color ? { backgroundColor: `${color}1a` } : undefined}
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: color ? `${color}33` : "rgba(0,105,72,0.1)" }}
                      >
                        <i
                          className={`pi ${link.icon}`}
                          style={{ color: color ?? "#006948" }}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block font-medium break-all" style={{ color: color ?? "#1a1c1a" }}>
                          {link.label}
                        </span>
                        {link.subtitle && (
                          <span
                            className="text-xs"
                            style={{ color: color ? `${color}b3` : "#4a4a4a" }}
                          >
                            {link.subtitle}
                          </span>
                        )}
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
