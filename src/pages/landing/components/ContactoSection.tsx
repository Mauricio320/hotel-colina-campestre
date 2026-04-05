/**
 * Contacto Section Component
 *
 * Displays contact information with Leaflet map and contact cards.
 * Layout: Map on left, contact cards on right.
 */

import { useRef, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, ZoomControl } from "react-leaflet";
import { Link } from "react-router-dom";
import { ContactoContent } from "@/types/landingPage";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ── Custom hotel marker icon ──────────────────────────────────────── */
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

/* ── Hotel coordinates ──────────────────────────────────────────────── */
const HOTEL_COORDS: [number, number] = [4.820884414676493, -73.16965643183725];

/* ── Contact data ─────────────────────────────────────────────────── */
const CONTACT_DATA = {
  address: "Vía Paipa - Tunja, Kilómetro 15",
  phone1: "+57 312 456 7890",
  phone2: "(608) 740 0000",
  email: "recepcion@hotelcolinacampestre.com",
  hours: "Atención personalizada todos los días de 7:00 AM a 9:00 PM",
  whatsapp: "+573124567890",
};

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

interface ContactoSectionProps {
  content?: ContactoContent;
}

export const ContactoSection = ({ content }: ContactoSectionProps) => {
  const { title } = content || {};
  const { ref, isVisible } = useInView();

  return (
    <section id="contacto" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-8">
        {/* Header */}
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-bold text-[#1a1c1a]">{title || "Contacto"}</h2>
          <div className="mt-4 h-1 w-16 rounded-full bg-[#006948]" />
          <p className="mt-4 text-[#4a4a4a]">
            Estamos aquí para ayudarte. Contáctanos por cualquiera de nuestros canales.
          </p>
        </div>

        {/* Main grid: Map left, Cards right */}
        <div
          ref={ref}
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          {/* Left: Map */}
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            <MapContainer
              // @ts-ignore - react-leaflet types mismatch with React 19
              center={HOTEL_COORDS}
              zoom={17}
              scrollWheelZoom={false}
              zoomControl={false}
              className="h-[400px] w-full md:h-[520px]"
            >
              {/* CartoDB Voyager - colorful, readable tiles */}
              <TileLayer
                // @ts-ignore
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              <ZoomControl position="bottomright" />
              {/* Circle highlight around hotel */}
              <Circle
                // @ts-ignore - react-leaflet types mismatch with React 19
                center={HOTEL_COORDS}
                radius={80}
                pathOptions={{
                  color: "#D94F30",
                  fillColor: "#D94F30",
                  fillOpacity: 0.1,
                  weight: 2,
                }}
              />
              <Marker
                // @ts-ignore
                position={HOTEL_COORDS}
                icon={hotelIcon}
              >
                <Popup>
                  <strong>Hotel Colina Campestre</strong>
                  <br />
                  {CONTACT_DATA.address}
                </Popup>
              </Marker>
            </MapContainer>

            {/* Info overlay card */}
            <div className="absolute bottom-4 left-4 z-[400] max-w-xs rounded-xl bg-white/95 p-4 shadow-lg backdrop-blur-sm">
              <h3 className="text-lg font-bold text-[#1a1c1a]">Hotel Colina Campestre</h3>
              <div className="mt-2 flex items-start gap-2 text-sm text-[#4a4a4a]">
                <i className="pi pi-map-marker mt-0.5 text-[#006948]" aria-hidden="true" />
                <span>{CONTACT_DATA.address}</span>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${HOTEL_COORDS[0]},${HOTEL_COORDS[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#006948] hover:underline"
              >
                Cómo llegar
                <i className="pi pi-arrow-right" aria-hidden="true" />
              </a>
            </div>

            {/* Zoom controls hint */}
            <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${HOTEL_COORDS[0]},${HOTEL_COORDS[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006948] text-white shadow-lg transition-colors hover:bg-[#00573d]"
                aria-label="Cómo llegar"
              >
                <i className="pi pi-directions text-sm" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Right: Single Contact Card */}
          <div className="h-fit rounded-2xl bg-[#f4f3f0] p-6 shadow-lg md:p-8">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#006948]/10">
                <i className="pi pi-phone text-2xl text-[#006948]" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1a1c1a]">Central de Reservas</h3>
                <p className="text-sm text-[#4a4a4a]">{CONTACT_DATA.hours}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              {/* Phone 1 */}
              <a
                href={`tel:${CONTACT_DATA.phone1.replace(/\s/g, "")}`}
                className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006948]/10">
                  <i className="pi pi-mobile text-[#006948]" aria-hidden="true" />
                </div>
                <span className="font-medium text-[#1a1c1a]">{CONTACT_DATA.phone1}</span>
              </a>

              {/* Phone 2 */}
              <a
                href={`tel:${CONTACT_DATA.phone2.replace(/[()\s]/g, "")}`}
                className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006948]/10">
                  <i className="pi pi-phone text-[#006948]" aria-hidden="true" />
                </div>
                <span className="font-medium text-[#1a1c1a]">{CONTACT_DATA.phone2}</span>
              </a>

              {/* Divider */}
              <div className="my-4 h-px bg-gray-200" />

              {/* Email */}
              <a
                href={`mailto:${CONTACT_DATA.email}`}
                className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006948]/10">
                  <i className="pi pi-envelope text-[#006948]" aria-hidden="true" />
                </div>
                <span className="font-medium text-[#1a1c1a]">{CONTACT_DATA.email}</span>
              </a>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${CONTACT_DATA.whatsapp.replace(/\+/g, "")}`}
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
