import React from 'react';
import { Phone, MapPin, Instagram, Facebook, ShieldCheck, Heart } from 'lucide-react';

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
              OHANA GO <span className="text-lime-400">&gt;</span>
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
        <div className="space-y-2">
          <h4 className="font-bebas text-lg text-white uppercase tracking-wider">
            Contacto del Organizador
          </h4>
          <ul className="text-xs space-y-2">
            <li>
              <a
                href="https://wa.me/51942851234?text=Hola,%20tengo%20una%20consulta%20sobre%20la%20inscripción%20OHANA%20GO%205K%20Halloween"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-emerald-400 hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                WhatsApp: +51 942 851 234
              </a>
            </li>
            <li className="text-neutral-500">
              Horario de atención: Lun a Sáb 9:00 AM - 8:00 PM
            </li>
            <li className="text-neutral-500">
              Meta y Sorteos: Entre Jarras (Jr. Lima cda. 13)
            </li>
          </ul>
        </div>

        {/* Auspiciadores & Locales */}
        <div className="space-y-2">
          <h4 className="font-bebas text-lg text-white uppercase tracking-wider">
            Auspiciadores & Puntos
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
