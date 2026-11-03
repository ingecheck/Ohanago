import React, { useState } from 'react';
import { Trophy, CheckCircle2, Users, Flame, Award, Sparkles, ChevronRight, Search } from 'lucide-react';
import { RunnerRegistration } from '../types/race';

interface PastEditionsArchiveProps {
  registrations: RunnerRegistration[];
}

export const PastEditionsArchive: React.FC<PastEditionsArchiveProps> = ({
  registrations,
}) => {
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [searchRoster, setSearchRoster] = useState('');

  const filtered = registrations.filter((r) => {
    const q = searchRoster.toLowerCase().trim();
    if (!q) return true;
    return (
      r.firstName.toLowerCase().includes(q) ||
      r.lastName.toLowerCase().includes(q)
    );
  });

  return (
    <section id="edicion-halloween-archive" className="py-16 sm:py-24 px-4 max-w-7xl mx-auto w-full scroll-mt-20 border-t border-neutral-900">
      
      {/* Imposing Charismatic Section Header */}
      <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime-950/80 border border-lime-400/40 text-lime-400 text-xs font-mono font-bold uppercase tracking-[0.2em] mb-4 shadow-sm shadow-lime-400/15">
          <Trophy className="w-4 h-4 text-lime-400" />
          <span>LEGADO & RESULTADOS OFICIALES</span>
        </div>
        
        <h2 className="font-bebas text-5xl sm:text-7xl md:text-8xl text-white uppercase tracking-tight leading-none drop-shadow-2xl">
          EDICIONES QUE DEJARON <span className="text-lime-400 text-glow-lime">HUELLA</span>
        </h2>
        
        <p className="text-sm sm:text-lg text-neutral-300 mt-4 leading-relaxed max-w-2xl mx-auto font-sans">
          Cada kilómetro recorrido forja nuestra historia. Revive la primera edición oficial donde más de un centenar de atletas demostraron que la pasión y la competencia sana unen a nuestra manada.
        </p>
      </div>

      {/* Cinematic Edition Showcase Stage (Full impact, no claustrophobic boxes) */}
      <div className="relative rounded-3xl bg-gradient-to-b from-neutral-950 via-black to-neutral-950 border border-neutral-800 p-6 sm:p-10 md:p-14 overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.9)]">
        {/* Powerful Ambient Glow & Speed Strip Texture */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-lime-400/10 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-lime-500/5 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
          
          {/* Left Column: Monumental Floating Physical Metal Medal */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
            <div className="relative group w-full flex items-center justify-center py-4">
              {/* Radial glow spotlight behind medal */}
              <div className="absolute inset-0 max-w-[320px] max-h-[320px] mx-auto bg-gradient-to-tr from-lime-400/25 to-lime-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
              
              <img
                src="/official-medal.png"
                alt="Medalla Oficial Halloween 5K 2026"
                className="w-56 h-56 sm:w-72 sm:h-72 md:w-84 md:h-84 lg:w-96 lg:h-96 object-contain relative z-10 drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)] transition-all duration-700 transform group-hover:scale-105 group-hover:rotate-1"
              />
            </div>

            <div className="mt-2 space-y-1">
              <span className="font-bebas text-2xl sm:text-3xl text-white uppercase tracking-wider block">
                Medalla Finisher Oficial
              </span>
              <span className="font-mono text-xs sm:text-sm text-lime-400 tracking-wide font-bold block">
                Aleación maciza de colección · Relieve conmemorativo 3D
              </span>
            </div>
          </div>

          {/* Right Column: Charismatic Story, Huge Title & High-Contrast Stats */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Edition Flag */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-4 py-1.5 rounded-full bg-lime-950/90 text-lime-400 border border-lime-400/50 text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-lime-400" />
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
                HALLOWEEN <span className="text-lime-400">5K 2026</span>
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
                <span className="font-bebas text-4xl sm:text-5xl text-lime-400 block leading-none font-black">5.0 KM</span>
                <span className="text-[11px] text-neutral-400 font-sans">Circuito urbano</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block font-bold">Sorteos</span>
                <span className="font-bebas text-4xl sm:text-5xl text-white block leading-none font-black">22</span>
                <span className="text-[11px] text-neutral-400 font-sans">Premios en meta</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block font-bold">Espíritu</span>
                <span className="font-bebas text-4xl sm:text-5xl text-lime-400 block leading-none font-black">100%</span>
                <span className="text-[11px] text-neutral-400 font-sans">Competencia sana</span>
              </div>
            </div>

            {/* Imposing Action Button */}
            <div className="pt-2">
              <button
                onClick={() => setShowRosterModal(true)}
                className="px-8 py-4 rounded-2xl bg-lime-400 hover:bg-lime-300 text-black font-bebas text-xl sm:text-2xl uppercase tracking-wider transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer font-black inline-flex items-center gap-3 shadow-xl shadow-lime-400/25"
              >
                <Users className="w-6 h-6 text-black" />
                <span>Ver Nómina Oficial de los {registrations.length} Finishers</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Roster Modal (Respectful, clean: Names only, NO DNI, NO City) */}
      {showRosterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-5 border-b border-neutral-800">
              <div>
                <span className="text-[11px] font-mono text-lime-400 uppercase tracking-widest font-bold block mb-1">
                  HISTORIAL DE COMPETIDORES · HALLOWEEN 5K 2026
                </span>
                <h3 className="font-bebas text-3xl sm:text-4xl text-white uppercase tracking-wide leading-none">
                  Nómina Oficial de Finishers
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  {registrations.length} atletas que cruzaron la meta oficial
                </p>
              </div>
              <button
                onClick={() => setShowRosterModal(false)}
                className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <div className="py-4">
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchRoster}
                  onChange={(e) => setSearchRoster(e.target.value)}
                  placeholder="Buscar corredor por nombre o apellido..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-lime-400 transition"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-neutral-900 pr-1">
              {filtered.map((r, i) => (
                <div key={r.id} className="py-3.5 flex items-center justify-between text-sm hover:bg-neutral-900/60 px-3 rounded-xl transition">
                  <div className="flex items-center gap-3.5">
                    <span className="font-mono text-neutral-500 font-bold w-8 text-center text-xs">{i + 1}</span>
                    <div>
                      <strong className="text-white block font-sans font-semibold text-sm sm:text-base tracking-wide">
                        {r.firstName} {r.lastName}
                      </strong>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-lime-950/80 text-lime-400 border border-lime-400/40 uppercase tracking-wider">
                    Finisher 5K
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-5 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setShowRosterModal(false)}
                className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider font-mono cursor-pointer"
              >
                Cerrar Nómina
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
