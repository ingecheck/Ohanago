import React from 'react';
import { MapPin, Instagram, Clock, ExternalLink, ShieldCheck, Heart, Sparkles, MessageCircle } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer className="bg-black border-t border-neutral-900 text-neutral-400 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand Col */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" showSubtitle={true} className="items-start" />
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Plataforma oficial de <strong>OHANA GO</strong>. Social Run Club, carreras atléticas multiedición y experiencias deportivas en Tarapoto, San Martín.
          </p>
          <div className="text-xs text-neutral-400 flex items-center gap-1.5 font-mono">
            <MapPin className="w-4 h-4 text-lime-400 shrink-0" />
            <span>Tarapoto, San Martín • Perú</span>
          </div>
        </div>

        {/* Contact & Support */}
        <div className="space-y-3">
          <h4 className="font-bebas text-xl text-white uppercase tracking-wider flex items-center gap-2">
            <span>Canales Oficiales</span>
            <span className="flex h-2 w-2 relative" title="Atención continua">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
            </span>
          </h4>

          {/* Instagram direct link */}
          <a
            href="https://www.instagram.com/ohanago.peru/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-lime-400/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white group-hover:text-lime-300 transition block">
                    @ohanago.peru
                  </span>
                  <span className="text-[11px] text-neutral-400 block">
                    Instagram Oficial
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-lime-400 opacity-70 group-hover:opacity-100 transition" />
            </div>
          </a>

          {/* WhatsApp Direct */}
          <a
            href="https://wa.me/51957342934"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-neutral-300 bg-neutral-900 px-3 py-2.5 rounded-xl border border-neutral-800 hover:border-lime-400/50 transition"
          >
            <MessageCircle className="w-4 h-4 text-lime-400 shrink-0" />
            <span>WhatsApp Organización: +51 957 342 934</span>
          </a>
        </div>

        {/* Comunidad & Aliados */}
        <div className="space-y-2">
          <h4 className="font-bebas text-lg text-white uppercase tracking-wider">
            Comunidad & Alianzas
          </h4>
          <ul className="text-xs space-y-1.5 text-neutral-400">
            <li>• <strong>Social Run Club</strong> (Martes y Jueves 6:30 PM)</li>
            <li>• <strong>Circuito Tarapoto</strong> (Plaza Mayor de Armas)</li>
            <li>• <strong>Entre Jarras</strong> (Punto de Encuentro Oficial)</li>
            <li>• <strong>Voluntariado & Staff</strong> (Convocatoria Abierta)</li>
          </ul>
        </div>

        {/* Admin Access */}
        <div className="space-y-2">
          <h4 className="font-bebas text-lg text-white uppercase tracking-wider">
            Administración
          </h4>
          <p className="text-xs text-neutral-500">
            Acceso restringido para el staff y cronometraje de Ohana Go.
          </p>
          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold border border-neutral-800 transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
            Acceso Panel Organizador
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-neutral-900 text-center text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} OHANA GO. Todos los derechos reservados.</p>
        <p className="flex items-center gap-1 text-neutral-400 font-mono">
          MÁS QUE CORRER, SOMOS FAMILIA
        </p>
      </div>
    </footer>
  );
};
