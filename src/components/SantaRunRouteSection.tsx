import React from 'react';
import { MapPin, Flag, Clock, Calendar, ShieldCheck, Camera, Droplets, Sparkles, Trophy } from 'lucide-react';

export const SantaRunRouteSection: React.FC = () => {
  return (
    <section id="ruta-santa-run" className="py-14 sm:py-20 px-4 max-w-6xl mx-auto w-full scroll-mt-20 border-t border-neutral-900">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
          <MapPin className="w-3.5 h-3.5 text-red-400" />
          <span>Circuito Nocturno Oficial</span>
        </div>
        <h2 className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white uppercase tracking-tight leading-none">
          RECORRIDO DE LA <span className="text-red-500 text-glow-red">SANTA RUN 2026</span>
        </h2>
        <p className="text-sm sm:text-base text-neutral-300 mt-3 leading-relaxed">
          Una ruta nocturna iluminada por las avenidas de Tarapoto, con seguridad vial, puntos de animación festiva y una llegada espectacular para celebrar con toda la familia runner.
        </p>
      </div>

      {/* Course Landmarks & Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Card 1: Partida */}
        <div className="p-6 rounded-3xl bg-neutral-950 border-2 border-red-500/40 space-y-3 relative overflow-hidden group hover:border-red-500 transition">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/40 flex items-center justify-center text-xl font-bold">
            <MapPin className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest block">
              Punto de Concentración & Partida
            </span>
            <h3 className="font-bebas text-2xl sm:text-3xl text-white uppercase tracking-wide mt-1">
              Parque de la Av. Aviación
            </h3>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Concentración desde las <strong>5:45 P.M.</strong> para entrega final de gorras navideñas, calentamiento guiado con música navideña y largada oficial puntual a las <strong>7:00 P.M.</strong>
          </p>
          <div className="pt-3 border-t border-neutral-900 text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-red-400" />
            <span>Largada: 7:00 P.M. puntual</span>
          </div>
        </div>

        {/* Card 2: En Ruta */}
        <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-3 relative overflow-hidden group hover:border-neutral-700 transition">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-amber-400 border border-neutral-800 flex items-center justify-center text-xl font-bold">
            <Droplets className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
              Durante la Carrera
            </span>
            <h3 className="font-bebas text-2xl sm:text-3xl text-white uppercase tracking-wide mt-1">
              Circuito Iluminado & Hidratación
            </h3>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Asfalto 100% señalizado con banderilleros, fotógrafos deportivos de Ohana Go en los puntos clave, escolta de seguridad y puesto de hidratación isotónica en el KM 2.5.
          </p>
          <div className="pt-3 border-t border-neutral-900 text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Fotografía profesional incluida</span>
          </div>
        </div>

        {/* Card 3: Llegada */}
        <div className="p-6 rounded-3xl bg-neutral-950 border-2 border-amber-500/40 space-y-3 relative overflow-hidden group hover:border-amber-400 transition">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-xl font-bold">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
              Arco de Meta & Gran Fiesta
            </span>
            <h3 className="font-bebas text-2xl sm:text-3xl text-white uppercase tracking-wide mt-1">
              Concha Acústica
            </h3>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Llegada triunfal con entrega de la <strong>Medalla Finisher Oficial</strong>, rehidratación, fruta y la realización del <strong>Gran Sorteo del Pavo Navideño</strong> en vivo en el escenario principal.
          </p>
          <div className="pt-3 border-t border-neutral-900 text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5 text-amber-400" />
            <span>Meta, Premiación & Sorteo Pavo</span>
          </div>
        </div>

      </div>
    </section>
  );
};
