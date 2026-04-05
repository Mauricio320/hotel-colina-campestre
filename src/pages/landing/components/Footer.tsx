/**
 * Footer Component
 *
 * Page footer with links and hotel information.
 */

export const Footer = () => {
  return (
    <footer className="w-full bg-[#FAF9F6] pt-16 pb-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-8 md:grid-cols-4">
        {/* Brand */}
        <div className="col-span-1 md:col-span-1">
          <div className="mb-6 text-lg font-bold text-[#006948]">Hotel Colina Campestre</div>
          <p className="text-sm leading-relaxed text-stone-500">
            Ubicación privilegiada en la zona campestre, combinando naturaleza y confort para una
            experiencia inolvidable.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="mb-6 font-bold text-[#1a1c1a]">Navegación</h4>
          <ul className="space-y-4 text-sm text-stone-500">
            <li>
              <a href="#inicio" className="transition-all hover:text-[#006948] hover:underline">
                Inicio
              </a>
            </li>
            <li>
              <a href="#hotel" className="transition-all hover:text-[#006948] hover:underline">
                El Hotel
              </a>
            </li>
            <li>
              <a href="#comfaboy" className="transition-all hover:text-[#006948] hover:underline">
                Comfaboy
              </a>
            </li>
            <li>
              <a href="#turismo" className="transition-all hover:text-[#006948] hover:underline">
                Turismo
              </a>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="mb-6 font-bold text-[#1a1c1a]">Legal</h4>
          <ul className="space-y-4 text-sm text-stone-500">
            <li>
              <a href="#" className="transition-all hover:text-[#006948] hover:underline">
                Política de Privacidad
              </a>
            </li>
            <li>
              <a href="#" className="transition-all hover:text-[#006948] hover:underline">
                Términos de Servicio
              </a>
            </li>
            <li>
              <a href="#" className="transition-all hover:text-[#006948] hover:underline">
                Guía Local
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="mb-6 font-bold text-[#1a1c1a]">Contacto</h4>
          <ul className="space-y-4 text-sm text-stone-500">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">location_on</span>
              Vía Principal Colina, Sector Campestre
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">mail</span>
              info@colinacampestre.com
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">call</span>
              +57 (8) 123-4567
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-7xl border-t border-[#bccac0]/20 px-8 pt-8">
        <p className="text-center text-sm text-stone-500">
          © {new Date().getFullYear()} Hotel Colina Campestre. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};
