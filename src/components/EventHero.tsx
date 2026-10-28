import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Flag, Sparkles, ShieldCheck, Flame } from 'lucide-react';

interface EventHeroProps {
  onRegisterClick?: () => void;
  onExploreKitClick?: () => void;
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
    <div className="relative overflow-hidden pt-6 pb-8 md:pt-8 md:pb-10 border-b border-neutral-900 bg-radial-[at_top] from-neutral-900 via-neutral-950 to-black">
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
        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            Carrera Nocturna de Halloween
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/30">
            Modalidad Presencial & Virtual
          </span>
        </div>

        {/* Giant Main Title */}
        <div className="mb-4">
          <div className="font-bebas text-6xl sm:text-7xl md:text-9xl text-white font-extrabold tracking-tight uppercase leading-none drop-shadow-2xl">
            OHANA <span className="text-lime-400 text-glow-lime">GO</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mt-1 md:mt-2">
            <span className="font-bebas text-6xl sm:text-8xl md:text-9xl text-lime-400 uppercase tracking-tight font-black text-glow-lime">
              5K
            </span>
            <span className="font-marker text-4xl sm:text-6xl md:text-7xl text-orange-500 tracking-wide transform -rotate-1 text-glow-orange">
              HALLOWEEN
            </span>
          </div>
          <p className="font-bebas text-xl sm:text-2xl text-purple-400 uppercase tracking-widest mt-1">
            TARAPOTO • CIRCUITO 5 KILÓMETROS
          </p>
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
              <span className="text-[10px] font-black uppercase tracking-wider">Horario</span>
            </div>
            <span className="font-bebas text-xl text-white block">5:30 P.M.</span>
            <span className="text-[10px] text-lime-400 font-bold">Concentración (Partida 7 PM)</span>
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

        {/* Enhanced Visual Countdown Timer */}
        <div className="max-w-2xl mx-auto my-7 p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-neutral-900/90 via-black to-neutral-950 border border-lime-400/30 shadow-[0_0_35px_rgba(163,230,53,0.12)] relative overflow-hidden">
          {/* Subtle glow accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-16 bg-lime-400/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-950/60 border border-lime-500/30 text-lime-400 text-[11px] font-bold tracking-widest uppercase mb-4">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
              Tiempo Restante para el Evento • 31 Octubre • 5:30 PM
            </div>

            <div className="grid grid-cols-4 gap-2.5 sm:gap-4 w-full text-center">
              <div className="bg-neutral-900/90 rounded-2xl p-3 sm:p-4 border border-neutral-800 shadow-inner">
                <span className="font-bebas text-3xl sm:text-5xl text-white block tracking-wider leading-none">
                  {timeLeft.days}
                </span>
                <span className="text-[10px] sm:text-xs uppercase font-bold text-neutral-400 tracking-wider mt-1 block">
                  Días
                </span>
              </div>
              <div className="bg-neutral-900/90 rounded-2xl p-3 sm:p-4 border border-neutral-800 shadow-inner">
                <span className="font-bebas text-3xl sm:text-5xl text-white block tracking-wider leading-none">
                  {timeLeft.hours}
                </span>
                <span className="text-[10px] sm:text-xs uppercase font-bold text-neutral-400 tracking-wider mt-1 block">
                  Horas
                </span>
              </div>
              <div className="bg-neutral-900/90 rounded-2xl p-3 sm:p-4 border border-neutral-800 shadow-inner">
                <span className="font-bebas text-3xl sm:text-5xl text-white block tracking-wider leading-none">
                  {timeLeft.minutes}
                </span>
                <span className="text-[10px] sm:text-xs uppercase font-bold text-neutral-400 tracking-wider mt-1 block">
                  Minutos
                </span>
              </div>
              <div className="bg-lime-950/40 rounded-2xl p-3 sm:p-4 border border-lime-400/40 shadow-[0_0_20px_rgba(163,230,53,0.15)]">
                <span className="font-bebas text-3xl sm:text-5xl text-lime-400 block tracking-wider leading-none">
                  {timeLeft.seconds}
                </span>
                <span className="text-[10px] sm:text-xs uppercase font-bold text-lime-400 tracking-wider mt-1 block">
                  Segundos
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
