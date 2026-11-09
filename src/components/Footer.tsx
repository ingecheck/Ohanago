import React from 'react';
import { Instagram, ExternalLink, ShieldCheck, MessageCircle, Handshake, Shield, MapPin, Award } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const allies = [
    {
      name: 'Entre Jarras',
      role: 'Punto Oficial de Celebración',
      tag: 'Hospitality Partner',
    },
    {
      name: 'Municipalidad Provincial',
      role: 'San Martín · Tarapoto',
      tag: 'Apoyo Institucional',
    },
    {
      name: 'Policía Nacional del Perú',
      role: 'División de Tránsito & Seguridad',
      tag: 'Seguridad Vial',
    },
    {
      name: 'Concha Acústica',
      role: 'Zona Oficial de Llegada & Podio',
      tag: 'Punto de Meta',
    },
    {
      name: 'Puntos de Hidratación',
      role: 'Abastecimiento en Circuito',
      tag: 'Hidratación Oficial',
    },
    {
      name: 'Ohana Run Club',
      role: 'Comunidad & Pacers Oficiales',
      tag: 'Comunidad Atlética',
    },
  ];

  return (
    <footer className="bg-black border-t border-red-950/40 text-neutral-400 py-14 px-4 relative z-30">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* SECTION: Aliados Estratégicos (Corporate Logo Cloud / Trusted-by Strip) */}
        <div className="rounded-3xl p-6 sm:p-8 bg-neutral-950/80 border border-neutral-900 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-900">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Handshake className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bebas text-xl text-white uppercase tracking-wider leading-none">
                  Aliados Estratégicos & Respaldo Institucional
                </h4>
                <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                  Organizaciones que hacen posible una ruta segura y festiva para Santa Run Tarapoto 2026
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold self-start sm:self-auto">
              Trusted by Sports Community
            </span>
          </div>

          {/* Corporate Monochromatic Grid with smooth hover recovery */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {allies.map((ally, idx) => (
              <div
                key={idx}
                className="group p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-red-500/40 transition-all duration-300 flex flex-col justify-between text-left opacity-75 hover:opacity-100 hover:shadow-lg hover:shadow-red-950/40 cursor-default"
              >
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500 block group-hover:text-amber-400 transition-colors">
                    {ally.tag}
                  </span>
                  <strong className="text-white font-sans text-xs sm:text-sm block mt-1 group-hover:text-red-300 transition-colors">
                    {ally.name}
                  </strong>
                </div>
                <span className="text-[10px] text-neutral-400 mt-2 block leading-tight">
                  {ally.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <BrandLogo size="md" showSubtitle={true} variant="crimson" className="items-start" />
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Plataforma oficial de <strong>OHANA GO</strong>. Social Run Club, carreras atléticas de alta energía y la nueva edición oficial <strong>SANTA RUN TARAPOTO 2026</strong>.
            </p>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="font-bebas text-xl text-white uppercase tracking-wider flex items-center gap-2">
              <span>Canales Oficiales</span>
              <span className="flex h-2 w-2 relative" title="Atención continua">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </h4>

            {/* Instagram direct link */}
            <a
              href="https://www.instagram.com/ohanago.peru/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block p-3 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-red-500/50 transition-all duration-300 backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white group-hover:text-red-300 transition block">
                      @ohanago.peru
                    </span>
                    <span className="text-[11px] text-neutral-400 block">
                      Instagram Oficial
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-red-400 opacity-70 group-hover:opacity-100 transition" />
              </div>
            </a>

            {/* WhatsApp Direct */}
            <a
              href="https://wa.me/51902227356"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-neutral-300 bg-neutral-950 px-3 py-2.5 rounded-xl border border-neutral-800 hover:border-red-500/50 transition backdrop-blur-md"
            >
              <MessageCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>WhatsApp Compras & Organización: +51 902 227 356</span>
            </a>
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
              <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
              Acceso Panel Organizador
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 text-center text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <p>© {new Date().getFullYear()} OHANA GO. Todos los derechos reservados · Santa Run Tarapoto 2026.</p>
          <span className="text-neutral-400">Corre y regala Sonrisas ❤️</span>
        </div>
      </div>
    </footer>
  );
};
