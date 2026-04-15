import { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import type { Menu as MenuType } from "primereact/menu";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "Hotel", href: "#hotel" },
  { label: "Apartamentos", href: "#apartamentos" },
  { label: "Servicios", href: "#servicios" },
  { label: "Fotos", href: "#fotos" },
  { label: "Turismo", href: "#turismo" },
  { label: "Contacto", href: "#contacto" },
];

export const Navigation = () => {
  const [activeSection, setActiveSection] = useState("hotel");
  const menuRef = useRef<MenuType>(null);

  useEffect(() => {
    const handleScroll = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 10;
      if (atBottom) {
        setActiveSection(navLinks[navLinks.length - 1].href.replace("#", ""));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sectionIds = navLinks.map((link) => link.href.replace("#", ""));
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const ratioMap = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratioMap.set(entry.target.id, entry.intersectionRatio);
        }

        let maxRatio = 0;
        let maxId = sectionIds[0];
        for (const [id, ratio] of ratioMap) {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            maxId = id;
          }
        }

        if (maxRatio > 0) {
          setActiveSection(maxId);
        }
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: "-72px 0px 0px 0px",
      }
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (href: string) => {
    const targetId = href.replace("#", "");

    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(targetId);
    }
  };

  const mobileMenuItems = navLinks.map((link) => ({
    label: link.label,
    command: () => scrollToSection(link.href),
  }));

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 bg-[#FAF9F6] shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a
          href="#hotel"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("#hotel");
          }}
          className="text-xl font-bold tracking-tighter text-[#006948] transition-opacity hover:opacity-80"
        >
          Hotel Colina Campestre
        </a>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.replace("#", "");
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className={`border-b-2 pb-1 text-sm font-medium tracking-wide transition-colors ${
                  isActive
                    ? "border-[#006948] text-[#006948]"
                    : "border-transparent text-stone-600 hover:border-[#006948]/30 hover:text-[#006948]"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* Login Button (Desktop) */}
        <div className="hidden md:block">
          <Button
            unstyled
            icon="pi pi-sign-in"
            label="Login"
            className="flex items-center gap-2 rounded-full bg-[#006948] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#00855c] hover:shadow-lg active:scale-95"
            onClick={() => (window.location.href = "/login")}
          />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Menu model={mobileMenuItems} popup ref={menuRef} />
          <Button
            icon="pi pi-bars"
            className="p-button-text text-[#006948]"
            onClick={(e) => menuRef.current?.toggle(e)}
            aria-label="Menú"
          />
        </div>
      </div>
    </nav>
  );
};
