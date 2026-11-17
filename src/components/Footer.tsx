import React from 'react';
import { ShieldCheck, MessageCircle, Handshake } from 'lucide-react';
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
    <footer className="bg-black border-t border-red-950/40 text-neutral-400 py-8 sm:py-10 px-4 relative z-30">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* SECTION: Aliados Estratégicos (Corporate Logo Cloud / Trusted-by Strip) */}
        <div className="rounded-3xl p-5 sm:p-6 bg-neutral-950/80 border border-neutral-900 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-neutral-900">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {allies.map((ally, idx) => (
              <div
                key={idx}
                className="group p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-red-500/40 transition-all duration-300 flex flex-col justify-between text-left opacity-75 hover:opacity-100 hover:shadow-lg hover:shadow-red-950/40 cursor-default"
              >
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500 block group-hover:text-amber-400 transition-colors">
                    {ally.tag}
                  </span>
                  <strong className="text-white font-sans text-xs sm:text-sm block mt-1 group-hover:text-red-300 transition-colors">
                    {ally.name}
                  </strong>
                </div>
                <span className="text-[10px] text-neutral-400 mt-1.5 block leading-tight">
                  {ally.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Slim Compact Footer Strip: Logo + WhatsApp Compras & Organización + Admin */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-3.5 px-5 rounded-2xl bg-neutral-950/70 border border-neutral-900">
          <BrandLogo size="sm" showSubtitle={false} variant="crimson" className="items-center md:items-start" />

          <a
            href="https://wa.me/51902227356"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-200 bg-black px-4 py-2 rounded-xl border border-neutral-800 hover:border-red-500/50 hover:text-white transition"
          >
            <MessageCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>WhatsApp Compras & Organización: +51 902 227 356</span>
          </a>

          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold border border-neutral-800 transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
            <span>Panel Organizador</span>
          </button>
        </div>

        <div className="pt-3 border-t border-white/5 text-center text-[11px] text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono">
          <p>© {new Date().getFullYear()} OHANA GO. Todos los derechos reservados · Santa Run Tarapoto 2026</p>
          <span className="text-neutral-400">Corre y regala Sonrisas ❤️</span>
        </div>
      </div>
    </footer>
  );
};
