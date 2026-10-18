import React, { useState } from 'react';
import { Menu, X, Shield, Search, Flame } from 'lucide-react';

interface NavbarProps {
  onOpenAdmin: () => void;
  onGoToSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdmin, onGoToSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    onGoToSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('inicio')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-lime-400 text-black flex items-center justify-center font-black shadow-lg shadow-lime-400/20 group-hover:scale-105 transition">
            <Flame className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-1 leading-none">
              <span className="font-bebas text-2xl tracking-wider text-white">
                OHANA GO <span className="text-lime-400 font-extrabold">&gt;</span>
              </span>
              <span className="bg-orange-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm font-marker">
                5K
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 block -mt-0.5">
              Tarapoto • 31 Octubre 2026
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-neutral-300">
          <button
            onClick={() => handleNavClick('formulario-registro')}
            className="hover:text-lime-400 transition cursor-pointer"
          >
            Inscripción
          </button>
          <button
            onClick={() => handleNavClick('kit-evento')}
            className="hover:text-lime-400 transition cursor-pointer"
          >
            Medalla & Beneficios
          </button>
          <button
            onClick={() => handleNavClick('ruta-5k')}
            className="hover:text-lime-400 transition cursor-pointer"
          >
            Ruta 5K
          </button>
          <button
            onClick={() => handleNavClick('consultar-inscripcion')}
            className="hover:text-cyan-400 transition cursor-pointer flex items-center gap-1 text-cyan-400/90"
          >
            <Search className="w-3.5 h-3.5" />
            Consultar Mi Pase
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Register CTA */}
          <button
            onClick={() => handleNavClick('formulario-registro')}
            className="px-6 py-2.5 bg-lime-400 hover:bg-lime-300 text-black font-bebas text-lg tracking-wider uppercase rounded-xl transition shadow-lg shadow-lime-400/20 cursor-pointer"
          >
            Inscribirme
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => handleNavClick('formulario-registro')}
            className="px-3.5 py-1.5 bg-lime-400 text-black font-bebas text-base uppercase rounded-lg tracking-wider"
          >
            Inscribirme
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-400 hover:text-white rounded-lg bg-neutral-900 border border-neutral-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-950 border-b border-neutral-800 px-4 py-5 space-y-3">
          <button
            onClick={() => handleNavClick('formulario-registro')}
            className="w-full text-left py-2.5 text-sm font-bold uppercase tracking-wider text-lime-400 border-b border-neutral-900"
          >
            📝 Formulario de Inscripción
          </button>
          <button
            onClick={() => handleNavClick('kit-evento')}
            className="w-full text-left py-2.5 text-sm font-bold uppercase tracking-wider text-neutral-200 border-b border-neutral-900"
          >
            🏅 Medalla Finisher & Beneficios
          </button>
          <button
            onClick={() => handleNavClick('ruta-5k')}
            className="w-full text-left py-2.5 text-sm font-bold uppercase tracking-wider text-neutral-200 border-b border-neutral-900"
          >
            🗺️ Ruta Oficial 5K Tarapoto
          </button>
          <button
            onClick={() => handleNavClick('consultar-inscripcion')}
            className="w-full text-left py-2.5 text-sm font-bold uppercase tracking-wider text-cyan-400 border-b border-neutral-900 flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" /> Consultar Mi Pase
          </button>
        </div>
      )}
    </nav>
  );
};
