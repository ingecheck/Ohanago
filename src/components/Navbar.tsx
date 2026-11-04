import React, { useState } from 'react';
import { Menu, X, Shield, Flame, Instagram, Sparkles, User } from 'lucide-react';
import { trackMiEspacioClick, trackSectionView } from '../utils/analytics';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  onOpenAdmin: () => void;
  onOpenCompetitorLogin?: () => void;
  onGoToSection: (sectionId: string) => void;
  loggedInCompetitorName?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAdmin,
  onGoToSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string, label: string) => {
    trackSectionView(id, label);
    onGoToSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Native Vector Brand Logo */}
        <div
          onClick={() => handleNavClick('inicio', 'Inicio')}
          className="flex items-center gap-2.5 cursor-pointer group hover:opacity-90 transition"
        >
          <BrandLogo size="sm" />
          <span className="hidden sm:inline-block text-[9px] tracking-widest font-black uppercase text-lime-400 border border-lime-400/30 px-2 py-0.5 rounded-md bg-lime-950/40 font-mono">
            RUN CLUB
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-neutral-300">
          <button
            onClick={() => handleNavClick('ediciones', 'Ediciones & Carreras')}
            className="hover:text-lime-400 transition cursor-pointer"
          >
            Carreras & Ediciones
          </button>
          <button
            onClick={() => handleNavClick('merch-oficial', 'Merch Oficial')}
            className="hover:text-lime-400 transition cursor-pointer"
          >
            Merch Oficial
          </button>
          <button
            onClick={() => handleNavClick('edicion-halloween-archive', 'Archivo Halloween 5K')}
            className="text-neutral-400 hover:text-white transition cursor-pointer flex items-center gap-1.5"
          >
            <span>🎃 Halloween 5K (Resultados)</span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Instagram Link Button */}
          <a
            href="https://www.instagram.com/ohanago.peru/"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram Oficial @ohanago.peru"
            className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-lime-400/50 text-white hover:text-lime-400 transition flex items-center gap-2 text-xs font-mono font-bold"
          >
            <Instagram className="w-4 h-4 text-lime-400" />
            <span>@ohanago.peru</span>
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <a
            href="https://www.instagram.com/ohanago.peru/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-lime-400"
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
            onClick={() => handleNavClick('ediciones', 'Ediciones & Carreras')}
            className="w-full text-left py-2.5 text-sm font-bold uppercase tracking-wider text-neutral-200 border-b border-neutral-900"
          >
            🏃 Carreras & Ediciones
          </button>
          <button
            onClick={() => handleNavClick('merch-oficial', 'Merch Oficial')}
            className="w-full text-left py-2.5 text-sm font-bold uppercase tracking-wider text-neutral-200 border-b border-neutral-900"
          >
            🎽 Merch & Indumentaria
          </button>
          <button
            onClick={() => handleNavClick('edicion-halloween-archive', 'Archivo Halloween 5K')}
            className="w-full text-left py-2.5 text-sm font-bold uppercase tracking-wider text-amber-400 border-b border-neutral-900 flex items-center justify-between"
          >
            <span>🎃 Halloween 5K (Resultados & Ruleta)</span>
            <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono">
              Finalizada
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
