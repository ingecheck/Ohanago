import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Flag, Sparkles, ArrowRight, ShieldCheck, Flame, Trophy, Gift } from 'lucide-react';

interface EventHeroProps {
  onRegisterClick: () => void;
  onExploreKitClick: () => void;
  registeredCount: number;
}

export const EventHero: React.FC<EventHeroProps> = ({
  onRegisterClick,
  onExploreKitClick,
  registeredCount,
}) => {
  // Countdown to Saturday October 31, 2026, 19:00:00 (Tarapoto / Lima GMT-5)
  const targetDate = new Date('2026-10-31T19:00:00-05:00').getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, targetDate - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="relative overflow-hidden pt-8 pb-14 md:pt-12 md:pb-20 border-b border-neutral-900 bg-radial-[at_top] from-neutral-900 via-neutral-950 to-black">
      {/* Background Neon ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-lime-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-orange-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-4 w-72 h-72 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle Bats Motif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 select-none">
        <svg className="w-full h-full" viewBox="0 0 1000 400" fill="currentColor">
          <path d="M 120 70 C 115 65, 105 65, 90 70 C 95 75, 96 80, 98 86 C 104 83, 108 83, 112 86 C 114 80, 115 75, 120 70 Z" className="text-orange-500" />
          <path d="M 880 120 C 875 115, 865 115, 850 120 C 855 125, 856 130, 858 136 C 864 133, 868 133, 872 136 C 874 130, 875 125, 880 120 Z" className="text-lime-400" />
        </svg>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 text-center">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-lime-400/10 text-lime-400 border border-lime-400/30">
            <Flame className="w-3.5 h-3.5 text-lime-400" />
            Tarapoto 2026
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            Carrera Nocturna de Halloween
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-neutral-300 bg-neutral-900 border border-neutral-800">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            {registeredCount > 0 ? `${registeredCount} inscritos` : 'Inscripciones Oficiales Abiertas'}
          </span>
        </div>

        {/* Giant Main Title */}
        <div className="mb-4">
          <div className="font-bebas text-6xl sm:text-7xl md:text-9xl text-white font-extrabold tracking-tight uppercase leading-none drop-shadow-2xl">
            OHANA <span className="text-lime-400 text-glow-lime">GO &gt;</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 -mt-2 md:-mt-4">
            <span className="font-bebas text-5xl sm:text-7xl md:text-8xl text-white uppercase tracking-tighter">
              5K
            </span>
            <span className="font-marker text-3xl sm:text-5xl md:text-6xl text-orange-500 tracking-wide transform -rotate-1 text-glow-orange">
              HALLOWEEN
            </span>
          </div>
          <p className="font-bebas text-xl sm:text-2xl text-purple-400 uppercase tracking-widest mt-1">
            TARAPOTO • CIRCUITO 5 KILÓMETROS
          </p>
        </div>

        {/* Clean, sober event pill info (no exaggerated screaming price banner) */}
        <div className="my-5 flex flex-wrap items-center justify-center gap-3">
          <span className="px-4 py-2 rounded-xl bg-neutral-900/90 border border-neutral-700 text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            Medalla Finisher Metálica
          </span>
          <span className="px-4 py-2 rounded-xl bg-neutral-900/90 border border-neutral-700 text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-purple-400" />
            Sorteos en la Llegada
          </span>
          <span className="px-4 py-2 rounded-xl bg-lime-950/60 border border-lime-500/40 text-xs font-bold text-lime-400">
            Partida: Plaza de Armas • Llegada: Entre Jarras
          </span>
        </div>

        {/* Event Key Facts Bar */}
        <div className="max-w-4xl mx-auto my-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-3.5 backdrop-blur-md">
            <div className="flex items-center gap-2 text-lime-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">Fecha</span>
            </div>
            <span className="font-bebas text-xl text-white block">Sábado 31 Octubre</span>
            <span className="text-[10px] text-neutral-400">2026</span>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-3.5 backdrop-blur-md">
            <div className="flex items-center gap-2 text-lime-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">Hora</span>
            </div>
            <span className="font-bebas text-xl text-white block">7:00 P.M.</span>
            <span className="text-[10px] text-neutral-400">Concentración 6:30 PM</span>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-3.5 backdrop-blur-md">
            <div className="flex items-center gap-2 text-orange-400 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">Partida</span>
            </div>
            <span className="font-bebas text-xl text-white block truncate">Plaza de Armas</span>
            <span className="text-[10px] text-neutral-400">Tarapoto</span>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-3.5 backdrop-blur-md">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <Flag className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">Llegada</span>
            </div>
            <span className="font-bebas text-xl text-white block truncate">Entre Jarras</span>
            <span className="text-[10px] text-neutral-400">Jr. Lima cda. 13 • Sorteos</span>
          </div>
        </div>

        {/* Live Countdown Timer */}
        <div className="max-w-xl mx-auto my-6 p-4 rounded-3xl bg-neutral-950/80 border border-neutral-800/90 shadow-xl">
          <span className="text-[10px] uppercase font-black tracking-widest text-lime-400 block mb-2">
            Tiempo Restante para la Largada
          </span>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-neutral-900/90 rounded-2xl p-2 border border-neutral-800">
              <span className="font-bebas text-2xl sm:text-3xl text-white block">{timeLeft.days}</span>
              <span className="text-[9px] uppercase font-bold text-neutral-500">Días</span>
            </div>
            <div className="bg-neutral-900/90 rounded-2xl p-2 border border-neutral-800">
              <span className="font-bebas text-2xl sm:text-3xl text-white block">{timeLeft.hours}</span>
              <span className="text-[9px] uppercase font-bold text-neutral-500">Horas</span>
            </div>
            <div className="bg-neutral-900/90 rounded-2xl p-2 border border-neutral-800">
              <span className="font-bebas text-2xl sm:text-3xl text-white block">{timeLeft.minutes}</span>
              <span className="text-[9px] uppercase font-bold text-neutral-500">Minutos</span>
            </div>
            <div className="bg-neutral-900/90 rounded-2xl p-2 border border-neutral-800">
              <span className="font-bebas text-2xl sm:text-3xl text-lime-400 block">{timeLeft.seconds}</span>
              <span className="text-[9px] uppercase font-bold text-neutral-500">Segundos</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-7">
          <button
            onClick={onRegisterClick}
            className="w-full sm:w-auto px-10 py-4 bg-lime-400 hover:bg-lime-300 text-black font-bebas text-2xl uppercase tracking-wider rounded-2xl shadow-xl shadow-lime-400/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
          >
            Inscribirme a la Carrera
            <ArrowRight className="w-6 h-6" />
          </button>

          <button
            onClick={onExploreKitClick}
            className="w-full sm:w-auto px-8 py-4 bg-neutral-900 hover:bg-neutral-800 text-white font-bebas text-xl uppercase tracking-wider rounded-2xl border border-neutral-700 hover:border-lime-400 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <Trophy className="w-5 h-5 text-amber-400" />
            Ver Medalla Finisher Oficial
          </button>
        </div>

      </div>
    </div>
  );
};
