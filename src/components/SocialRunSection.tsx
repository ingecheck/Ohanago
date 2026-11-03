import React from 'react';
import { Users, Calendar, MapPin, Zap, Heart, MessageCircle, CheckCircle2, Award } from 'lucide-react';

export const SocialRunSection: React.FC = () => {
  return (
    <section id="comunidad-social-run" className="py-12 sm:py-16 px-4 max-w-6xl mx-auto w-full scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-950/60 border border-lime-400/40 text-lime-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
          <Users className="w-3.5 h-3.5" />
          <span>Running Club Semanal • Asfalto & Trail</span>
        </div>
        <h2 className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white uppercase tracking-wide leading-tight">
          COMUNIDAD <span className="text-lime-400">SOCIAL RUN</span> CLUB
        </h2>
        <p className="text-sm sm:text-base text-neutral-300 mt-2 leading-relaxed">
          En <strong>OHANA GO</strong> nadie corre solo. Fomentamos la competencia sana a través de entrenamientos de running urbano nocturno y salidas de trail running por senderos de montaña para todos los ritmos.
        </p>
      </div>

      {/* Schedule & Pace Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Card 1: Horarios & Días */}
        <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-4 hover:border-lime-400/40 transition">
          <div className="w-12 h-12 rounded-2xl bg-lime-400/10 border border-lime-400/30 text-lime-400 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bebas text-2xl text-white uppercase tracking-wide">
              Días de Entrenamiento
            </h3>
            <p className="text-xs text-neutral-400 mt-1">Salidas fijas todas las semanas</p>
          </div>
          <ul className="space-y-3 text-xs text-neutral-300 pt-2 border-t border-neutral-800">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Martes • 6:30 PM</strong>
                <span>Trote social regenerativo (4K a 5K)</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Jueves • 6:30 PM</strong>
                <span>Fondo progresivo & activación (5K a 7K)</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Card 2: Punto de Encuentro */}
        <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-4 hover:border-lime-400/40 transition">
          <div className="w-12 h-12 rounded-2xl bg-lime-400/10 border border-lime-400/30 text-lime-400 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bebas text-2xl text-white uppercase tracking-wide">
              Punto de Encuentro
            </h3>
            <p className="text-xs text-neutral-400 mt-1">Lugar céntrico y seguro</p>
          </div>
          <div className="space-y-2 text-xs text-neutral-300 pt-2 border-t border-neutral-800">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <strong className="text-lime-400 font-bold block text-sm">Plaza Mayor de Tarapoto</strong>
              <span className="text-[11px] text-neutral-400">Frente a la pérgola central / Jr. San Martín</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Llegar 10 minutos antes para calentamiento articular guiado por nuestros capitanes de ruta.
            </p>
          </div>
        </div>

        {/* Card 3: Grupos de Ritmo */}
        <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-4 hover:border-lime-400/40 transition">
          <div className="w-12 h-12 rounded-2xl bg-lime-400/10 border border-lime-400/30 text-lime-400 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bebas text-2xl text-white uppercase tracking-wide">
              Ritmos Para Todos
            </h3>
            <p className="text-xs text-neutral-400 mt-1">Elige el grupo que mejor se adapte a ti</p>
          </div>
          <ul className="space-y-2.5 text-xs text-neutral-300 pt-2 border-t border-neutral-800">
            <li className="flex items-center justify-between p-2 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="font-bold text-white">Grupo Iniciación</span>
              <span className="font-mono text-lime-400 font-bold text-[11px]">6:45 - 7:15 min/km</span>
            </li>
            <li className="flex items-center justify-between p-2 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="font-bold text-white">Grupo Intermedio</span>
              <span className="font-mono text-lime-400 font-bold text-[11px]">5:50 - 6:20 min/km</span>
            </li>
            <li className="flex items-center justify-between p-2 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="font-bold text-white">Grupo Avanzado / Pacer</span>
              <span className="font-mono text-lime-400 font-bold text-[11px]">5:00 - 5:30 min/km</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Community Banner & WhatsApp Join */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-lime-400/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5 text-center sm:text-left">
          <span className="text-[10px] font-mono uppercase tracking-widest text-lime-400 font-bold">
            ¿Cómo ser parte del club?
          </span>
          <h3 className="font-bebas text-2xl sm:text-3xl text-white uppercase tracking-wide">
            Solo ven con tus zapatillas y únete al grupo de WhatsApp
          </h3>
          <p className="text-xs text-neutral-400 max-w-xl">
            Coordinamos rutas, fotos oficiales de cada noche, avisos de carreras y dinámicas especiales después del trote.
          </p>
        </div>

        <a
          href="https://wa.me/51957342934?text=%C2%A1Hola%20Ohana%20Go!%20Quiero%20unirme%20a%20los%20Social%20Runs%20semanales%20en%20Tarapoto."
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-black font-bebas text-xl uppercase tracking-wider transition font-black flex items-center gap-2 shadow-lg shadow-lime-400/20 shrink-0"
        >
          <MessageCircle className="w-5 h-5 text-black" />
          <span>Unirme al Grupo de Running</span>
        </a>
      </div>
    </section>
  );
};
