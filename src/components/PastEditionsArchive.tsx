import React from 'react';
import { Trophy, CheckCircle2 } from 'lucide-react';
import { RunnerRegistration } from '../types/race';

interface PastEditionsArchiveProps {
  registrations: RunnerRegistration[];
}

export const PastEditionsArchive: React.FC<PastEditionsArchiveProps> = ({
  registrations,
}) => {
  return (
    <section id="edicion-halloween-archive" className="py-16 sm:py-24 px-4 max-w-7xl mx-auto w-full scroll-mt-20 border-t border-neutral-900 bg-black">
      
      {/* Imposing Charismatic Section Header */}
      <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono font-bold uppercase tracking-[0.2em] mb-4 shadow-sm shadow-red-500/15">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>LEGADO & RESULTADOS OFICIALES</span>
        </div>
        
        <h2 className="font-bebas text-5xl sm:text-7xl md:text-8xl text-white uppercase tracking-tight leading-none drop-shadow-2xl">
          EDICIONES QUE DEJARON <span className="text-red-500">HUELLA</span>
        </h2>
        
        <p className="text-sm sm:text-lg text-neutral-300 mt-4 leading-relaxed max-w-2xl mx-auto font-sans">
          Cada kilómetro recorrido forja nuestra historia. Revive la primera edición oficial donde más de un centenar de atletas demostraron que la pasión y la competencia sana unen a nuestra manada.
        </p>
      </div>

      {/* Cinematic Edition Showcase Stage (Full impact, no claustrophobic boxes) */}
      <div className="relative rounded-3xl bg-gradient-to-b from-neutral-950 via-black to-neutral-950 border border-neutral-800 p-6 sm:p-10 md:p-14 overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.9)]">
        {/* Powerful Ambient Glow & Speed Strip Texture (Balanced) */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-600/[0.04] rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-red-500/[0.02] rounded-full blur-[140px] pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
          
          {/* Left Column: Monumental Floating Physical Metal Medal */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
            <div className="relative group w-full flex items-center justify-center py-4">
              {/* Radial glow spotlight behind medal */}
              <div className="absolute inset-0 max-w-[320px] max-h-[320px] mx-auto bg-gradient-to-tr from-red-500/15 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
              
              <img
                src="/official-medal.png"
                alt="Medalla Oficial Halloween 5K 2026"
                className="w-56 h-56 sm:w-72 sm:h-72 md:w-84 md:h-84 lg:w-96 lg:h-96 object-contain relative z-10 drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)] transition-all duration-700 transform group-hover:scale-105 group-hover:rotate-1"
              />
            </div>

            <div className="mt-2">
              <span className="font-bebas text-2xl sm:text-3xl text-white uppercase tracking-wider block">
                Medalla Finisher Oficial
              </span>
            </div>
          </div>

          {/* Right Column: Charismatic Story, Huge Title & High-Contrast Stats */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Edition Flag */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-4 py-1.5 rounded-full bg-red-950/90 text-red-300 border border-red-500/50 text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-red-400" />
                Edición Fundacional Concluida
              </span>
              <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest font-semibold">
                31 de Octubre 2026
              </span>
            </div>

            {/* Imposing Charismatic Heading */}
            <div>
              <span className="text-xs sm:text-sm font-mono tracking-[0.25em] text-neutral-400 uppercase font-black block mb-1">
                PRIMERA CARRERA OFICIAL OHANA GO
              </span>
              <h3 className="font-bebas text-6xl sm:text-7xl md:text-8xl text-white tracking-tight uppercase leading-none drop-shadow-xl">
                HALLOWEEN <span className="text-red-500">5K 2026</span>
              </h3>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed mt-4 max-w-2xl font-sans">
                La noche en que la energía atlética conquistó Tarapoto. Más de un centenar de atletas vibraron por el asfalto nocturno con pulseras neón, hidratación en ruta y una llegada inolvidable en Entre Jarras para celebrar la entrega de medallas y la gran Ruleta de Premios.
              </p>
            </div>

            {/* High-Impact Athletic Stat Pillars (Natural, expansive, unboxed layout) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-neutral-900/90">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block font-bold">Finishers</span>
                <span className="font-bebas text-4xl sm:text-5xl text-white block leading-none font-black">{registrations.length}</span>
                <span className="text-[11px] text-neutral-400 font-sans">Atletas en meta</span>
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block font-bold">Distancia</span>
                <span className="font-bebas text-4xl sm:text-5xl text-red-400 block leading-none font-black">5.0 KM</span>
                <span className="text-[11px] text-neutral-400 font-sans">Circuito urbano</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block font-bold">Sorteos</span>
                <span className="font-bebas text-4xl sm:text-5xl text-white block leading-none font-black">25</span>
                <span className="text-[11px] text-neutral-400 font-sans">Premios en meta</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block font-bold">Espíritu</span>
                <span className="font-bebas text-4xl sm:text-5xl text-amber-400 block leading-none font-black">100%</span>
                <span className="text-[11px] text-neutral-400 font-sans">Competencia sana</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
