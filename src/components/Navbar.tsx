import React, { useState } from 'react';
import { Menu, X, Shield, Search, Flame, Instagram, Sparkles, User } from 'lucide-react';

interface NavbarProps {
  onOpenAdmin: () => void;
  onOpenCompetitorLogin: () => void;
  onGoToSection: (sectionId: string) => void;
  loggedInCompetitorName?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAdmin,
  onOpenCompetitorLogin,
  onGoToSection,
  loggedInCompetitorName,
}) => {
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
                OHANA <span className="text-lime-400 font-extrabold">GO</span>
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 block -mt-0.5">
              Tarapoto • 31 Octubre 2026
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-5 text-xs font-bold uppercase tracking-wider text-neutral-300">
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
        <div className="hidden md:flex items-center gap-2.5">
          {/* Competitor Portal button */}
          <button
            onClick={onOpenCompetitorLogin}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-900/80 to-neutral-900 hover:from-purple-800 hover:to-neutral-800 border border-purple-500/40 text-purple-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02]"
            title="Acceso al Portal del Competidor y Minijuego Caldero"
          >
            <Sparkles className="w-3.5 h-3.5 text-lime-400" />
            <span>{loggedInCompetitorName ? `Mi Cuenta (${loggedInCompetitorName})` : 'Portal Competidor'}</span>
          </button>

          {/* Instagram Link Button */}
          <a
            href="https://www.instagram.com/ohanago.peru/"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram Oficial @ohanago.peru"
            className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white hover:opacity-90 shadow-md shadow-pink-500/20 transition hover:scale-105 flex items-center gap-1.5"
          >
            <Instagram className="w-4 h-4" />
            <span className="text-xs font-bold font-sans">@ohanago.peru</span>
          </a>

          {/* Register CTA */}
          <button
            onClick={() => handleNavClick('formulario-registro')}
            className="px-5 py-2.5 bg-lime-400 hover:bg-lime-300 text-black font-bebas text-lg tracking-wider uppercase rounded-xl transition shadow-lg shadow-lime-400/20 cursor-pointer"
          >
            Inscribirme
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenCompetitorLogin}
            className="p-2 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-200"
            title="Portal Competidor"
          >
            <Sparkles className="w-4 h-4 text-lime-400" />
          </button>

          <a
            href="https://www.instagram.com/ohanago.peru/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="p-2 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white"
          >
            <Instagram className="w-4 h-4" />
          </a>

          <button
            onClick={() => handleNavClick('formulario-registro')}
            className="px-3 py-1.5 bg-lime-400 text-black font-bebas text-sm uppercase rounded-lg tracking-wider"
          >
            Inscripción
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
            onClick={() => {
              onOpenCompetitorLogin();
              setMobileMenuOpen(false);
            }}
            className="w-full p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-left text-sm font-bold uppercase tracking-wider text-purple-200 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-lime-400" />
              Portal Competidor / Caldero de Pociones
            </span>
            <span className="text-[10px] bg-lime-400 text-black px-1.5 py-0.5 rounded font-black">
              Entrar
            </span>
          </button>

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

          <a
            href="https://www.instagram.com/ohanago.peru/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-2.5 rounded-xl bg-gradient-to-r from-purple-900/60 via-pink-900/40 to-neutral-900 border border-pink-500/40 text-white flex items-center justify-between text-xs font-bold"
          >
            <span className="flex items-center gap-2">
              <Instagram className="w-4 h-4 text-pink-400" /> Instagram: @ohanago.peru
            </span>
            <span className="text-[10px] text-pink-300 uppercase">Seguir</span>
          </a>

          <button
            onClick={() => {
              onOpenAdmin();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-xs text-neutral-500 flex items-center gap-1.5 pt-2 border-t border-neutral-900"
          >
            <Shield className="w-3.5 h-3.5" /> Acceso Organizador
          </button>
        </div>
      )}
    </nav>
  );
};
