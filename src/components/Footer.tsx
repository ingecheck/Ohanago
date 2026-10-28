import React from 'react';
import { MapPin, Instagram, Clock, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer className="bg-black border-t border-neutral-900 text-neutral-400 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand Col */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-bebas text-3xl tracking-wider text-white">
              OHANA <span className="text-lime-400">GO</span>
            </span>
            <span className="bg-orange-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-sm font-marker">
              5K HALLOWEEN
            </span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            La carrera nocturna más esperada de Tarapoto. Deporte, disfraces, comunidad y sorteos en Entre Jarras.
          </p>
          <div className="text-xs text-neutral-400 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-lime-400 shrink-0" />
            <span>Tarapoto, San Martín • Perú</span>
          </div>
        </div>

        {/* Contact & Support */}
        <div className="space-y-3">
          <h4 className="font-bebas text-xl text-white uppercase tracking-wider flex items-center gap-2">
            <span>Contacto del Organizador</span>
            <span className="flex h-2 w-2 relative" title="Atención continua">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
            </span>
          </h4>

          {/* Instagram direct link - bien bacán */}
          <a
            href="https://www.instagram.com/ohanago.peru/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block p-3 rounded-2xl bg-gradient-to-r from-purple-950/80 via-pink-950/60 to-neutral-900 border border-pink-500/40 hover:border-pink-400 shadow-lg shadow-pink-500/10 hover:shadow-pink-500/25 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/30 group-hover:rotate-6 transition-transform">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white group-hover:text-pink-300 transition block">
                    @ohanago.peru
                  </span>
                  <span className="text-[11px] text-neutral-400 block group-hover:text-neutral-300">
                    Canal Oficial de Ohana Go
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-pink-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
          </a>

          <ul className="text-xs space-y-2 pt-1">
            {/* 24 Hours Schedule */}
            <li className="flex items-center gap-2 text-neutral-300 bg-neutral-900/90 px-3 py-2 rounded-xl border border-neutral-800">
              <Clock className="w-4 h-4 text-lime-400 shrink-0" />
              <div className="leading-tight">
                <span className="font-bold text-white block">Horario de atención: 24 horas</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Aliados Estratégicos */}
        <div className="space-y-2">
          <h4 className="font-bebas text-lg text-white uppercase tracking-wider">
            Aliados Estratégicos
          </h4>
          <ul className="text-xs space-y-1.5 text-neutral-400">
            <li>• <strong>Entre Jarras</strong> (Punto de llegada & Sorteos)</li>
            <li>• <strong>Agua Nativa</strong> (Hidratación Oficial)</li>
            <li>• <strong>Ohana Go Running Club</strong> (Organizador Técnico)</li>
            <li>• <strong>Municipalidad Provincial de San Martín</strong> (Permisos & Seguridad)</li>
          </ul>
        </div>

        {/* Quick Admin & Legal */}
        <div className="space-y-2">
          <h4 className="font-bebas text-lg text-white uppercase tracking-wider">
            Gestión
          </h4>
          <p className="text-xs text-neutral-500">
            ¿Eres parte de la organización de Ohana Go?
          </p>
          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold border border-neutral-800 transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
            Acceso Panel Organizador
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-neutral-900 text-center text-xs text-neutral-600 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© 2026 OHANA GO 5K Por Halloween - Tarapoto. Todos los derechos reservados.</p>
        <p className="flex items-center gap-1">
          Hecho con <Heart className="w-3.5 h-3.5 text-red-500 fill-current inline" /> para los corredores de la selva
        </p>
      </div>
    </footer>
  );
};
