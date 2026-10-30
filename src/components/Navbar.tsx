import React, { useState } from 'react';
import { Menu, X, Shield, Flame, Instagram, Sparkles, User } from 'lucide-react';
import { trackMiEspacioClick, trackSectionView } from '../utils/analytics';

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

  const handleNavClick = (id: string, label: string) => {
    trackSectionView(id, label);
    onGoToSection(id);
    setMobileMenuOpen(false);
  };

  const handleMiEspacioClick = (source: string) => {
    trackMiEspacioClick(source);
    onOpenCompetitorLogin();
  };

  return (
    <nav className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('inicio', 'Inicio')}
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
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-neutral-300">
          <button
            onClick={() => handleNavClick('kit-evento', 'Medalla & Kit')}
            className="hover:text-lime-400 transition cursor-pointer"
          >
            Medalla & Kit
          </button>
          <button
            onClick={() => handleNavClick('ruta-5k', 'Ruta 5K')}
            className="hover:text-lime-400 transition cursor-pointer"
          >
            Ruta 5K
          </button>
          <button
            onClick={() => handleNavClick('ruleta-sorteo', 'Ruleta 266 Tickets')}
            className="text-amber-400 hover:text-amber-300 transition cursor-pointer flex items-center gap-1 font-black"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            🎡 Ruleta (266 Tickets)
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Competitor Portal button */}
          <button
            onClick={() => handleMiEspacioClick('Navbar Desktop')}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-900/80 to-neutral-900 hover:from-purple-800 hover:to-neutral-800 border border-purple-500/40 text-purple-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02]"
            title="Mi Espacio 🎒"
          >
            <Sparkles className="w-3.5 h-3.5 text-lime-400" />
            <span>{loggedInCompetitorName ? `Mi Espacio 🎒 (${loggedInCompetitorName})` : 'Mi Espacio 🎒'}</span>
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
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => handleMiEspacioClick('Navbar Mobile Top')}
            className="px-2.5 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition"
            title="Mi Espacio 🎒"
          >
            <Sparkles className="w-3.5 h-3.5 text-lime-400 shrink-0" />
            <span className="tracking-wide">Mi Espacio 🎒</span>
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
              handleMiEspacioClick('Navbar Mobile Drawer');
              setMobileMenuOpen(false);
            }}
            className="w-full p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-left text-sm font-bold uppercase tracking-wider text-purple-200 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-lime-400" />
              Mi Espacio 🎒
            </span>
            <span className="text-[10px] bg-lime-400 text-black px-1.5 py-0.5 rounded font-black">
              Entrar
            </span>
          </button>

          <button
            onClick={() => handleNavClick('kit-evento', 'Medalla & Beneficios')}
            className="w-full text-left py-2.5 text-sm font-bold uppercase tracking-wider text-neutral-200 border-b border-neutral-900"
          >
            🏅 Medalla Finisher & Beneficios
          </button>
          <button
            onClick={() => handleNavClick('ruta-5k', 'Ruta Oficial 5K')}
            className="w-full text-left py-2.5 text-sm font-bold uppercase tracking-wider text-neutral-200 border-b border-neutral-900"
          >
            🗺️ Ruta Oficial 5K Tarapoto
          </button>
          <button
            onClick={() => handleNavClick('ruleta-sorteo', 'Ruleta 266 Tickets')}
            className="w-full text-left py-2.5 text-sm font-bold uppercase tracking-wider text-amber-400 border-b border-neutral-900 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span>🎡 Ruleta Oficial (266 Tickets)</span>
            </span>
            <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black animate-pulse">
              EN VIVO
            </span>
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
