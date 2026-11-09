import React, { useState } from 'react';
import { Menu, X, Shield, Instagram, Sparkles, User, Gift } from 'lucide-react';
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

  const handleMiEspacioClick = () => {
    trackMiEspacioClick('Navbar Button');
    if (onOpenCompetitorLogin) {
      onOpenCompetitorLogin();
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#070D14]/90 backdrop-blur-md border-b border-red-950/40 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Native Vector Brand Logo */}
        <div
          onClick={() => handleNavClick('inicio', 'Inicio')}
          className="flex items-center gap-2.5 cursor-pointer group hover:opacity-90 transition"
        >
          <BrandLogo size="sm" variant="crimson" />
          <span className="hidden sm:inline-block text-[9px] tracking-widest font-black uppercase text-red-400 border border-red-500/40 px-2 py-0.5 rounded-md bg-red-950/60 font-mono shadow-sm">
            SANTA RUN 2026
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-neutral-300">
          <button
            onClick={() => handleNavClick('inicio', 'Santa Run 2026')}
            className="hover:text-red-400 transition cursor-pointer flex items-center gap-1.5"
          >
            <span>🎅 Santa Run 2026</span>
          </button>
          <button
            onClick={() => handleNavClick('ediciones', 'Kit & Precios')}
            className="hover:text-red-400 transition cursor-pointer flex items-center gap-1"
          >
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            <span>Kit & Precios</span>
          </button>
          <button
            onClick={() => handleNavClick('formulario-registro', 'Inscripción')}
            className="text-red-400 hover:text-red-300 transition cursor-pointer font-black"
          >
            Inscríbete (S/ 70)
          </button>
          <button
            onClick={() => handleNavClick('merch-oficial', 'Merch Oficial')}
            className="hover:text-red-400 transition cursor-pointer"
          >
            Merch Oficial
          </button>
          <button
            onClick={() => handleNavClick('edicion-halloween-archive', 'Archivo Halloween 5K')}
            className="text-neutral-500 hover:text-neutral-300 transition cursor-pointer text-[11px]"
          >
            <span>Ediciones Anteriores</span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Mi Espacio Competitor Access Button */}
          {onOpenCompetitorLogin && (
            <button
              onClick={handleMiEspacioClick}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-red-500/40 hover:border-red-400 text-white hover:text-red-300 transition flex items-center gap-2 text-xs font-mono font-bold cursor-pointer shadow-sm hover:shadow-red-950/50"
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>{loggedInCompetitorName ? `Mi Espacio (${loggedInCompetitorName.split(' ')[0]})` : 'Mi Espacio 🎒'}</span>
            </button>
          )}

          {/* Instagram Link Button */}
          <a
            href="https://www.instagram.com/ohanago.peru/"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram Oficial @ohanago.peru"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-red-400/50 text-white hover:text-red-400 transition flex items-center gap-2 text-xs font-mono font-bold"
          >
            <Instagram className="w-4 h-4 text-rose-400" />
            <span>@ohanago.peru</span>
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          {onOpenCompetitorLogin && (
            <button
              onClick={handleMiEspacioClick}
              className="px-2.5 py-1.5 rounded-lg bg-red-950/80 border border-red-500/40 text-red-200 text-xs font-mono font-bold flex items-center gap-1"
            >
              <span>🎒 Mi Espacio</span>
            </button>
          )}

          <a
            href="https://www.instagram.com/ohanago.peru/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="p-2 rounded-lg bg-slate-900 border border-white/10 text-rose-400"
          >
            <Instagram className="w-4 h-4" />
          </a>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-400 hover:text-white rounded-lg bg-slate-900 border border-white/10"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#070D14] border-b border-red-950/60 px-4 py-5 space-y-3">
          <button
            onClick={() => handleNavClick('inicio', 'Santa Run 2026')}
            className="w-full text-left py-2.5 text-sm font-bold uppercase tracking-wider text-neutral-200 border-b border-white/5 flex items-center justify-between"
          >
            <span>🎅 Santa Run Tarapoto 2026</span>
            <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-500/40 font-mono">19 DIC</span>
          </button>

          <button
            onClick={() => handleNavClick('ediciones', 'Kit & Precios')}
            className="w-full text-left py-2.5 text-sm font-bold uppercase tracking-wider text-neutral-200 border-b border-white/5"
          >
            🎁 Kit Oficial & S/ 70.00
          </button>

          <button
            onClick={() => handleNavClick('formulario-registro', 'Inscripción')}
            className="w-full text-left py-2.5 text-sm font-bold uppercase tracking-wider text-red-400 border-b border-white/5 font-black"
          >
            ⚡ Inscríbete Ahora (15% OFF Anteriores)
          </button>

          <button
            onClick={() => handleNavClick('merch-oficial', 'Merch Oficial')}
            className="w-full text-left py-2.5 text-sm font-bold uppercase tracking-wider text-neutral-200 border-b border-white/5"
          >
            🎽 Merch & Indumentaria
          </button>

          <button
            onClick={() => handleNavClick('edicion-halloween-archive', 'Archivo Halloween 5K')}
            className="w-full text-left py-2.5 text-sm font-bold uppercase tracking-wider text-neutral-400 border-b border-white/5"
          >
            🎃 Archivo Halloween 5K
          </button>

          {onOpenCompetitorLogin && (
            <button
              onClick={handleMiEspacioClick}
              className="w-full text-left py-2.5 text-sm font-bold uppercase tracking-wider text-amber-300 border-b border-white/5 flex items-center gap-2"
            >
              <span>🎒 Mi Espacio / Consultar Pase Digital</span>
            </button>
          )}

          <a
            href="https://www.instagram.com/ohanago.peru/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-2.5 rounded-xl bg-gradient-to-r from-red-950/60 via-slate-900 to-[#070D14] border border-red-500/30 text-white flex items-center justify-between text-xs font-bold"
          >
            <span className="flex items-center gap-2">
              <Instagram className="w-4 h-4 text-rose-400" /> Instagram: @ohanago.peru
            </span>
            <span className="text-[10px] text-red-300 uppercase">Seguir</span>
          </a>

          <button
            onClick={() => {
              onOpenAdmin();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-xs text-neutral-500 flex items-center gap-1.5 pt-2 border-t border-white/5"
          >
            <Shield className="w-3.5 h-3.5" /> Acceso Organizador
          </button>
        </div>
      )}
    </nav>
  );
};
