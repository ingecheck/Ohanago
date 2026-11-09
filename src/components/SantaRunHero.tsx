import React from 'react';
import { Calendar, Clock, MapPin, Sparkles, Trophy, Gift, ArrowRight, CheckCircle2, Ticket } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface SantaRunHeroProps {
  onRegisterClick: () => void;
  onExploreKit: () => void;
  onOpenCompetitorLogin: () => void;
  santaRegistrationsCount: number;
}

export const SantaRunHero: React.FC<SantaRunHeroProps> = ({
  onRegisterClick,
  onExploreKit,
  onOpenCompetitorLogin,
  santaRegistrationsCount,
}) => {
  return (
    <div className="relative overflow-hidden pt-6 pb-16 md:pt-10 md:pb-24 border-b border-red-950/60 bg-gradient-to-b from-black via-neutral-950 to-neutral-900">
      {/* Festive Falling Snow Particles (Subtle and athletic) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-4 left-10 w-2 h-2 rounded-full bg-white animate-pulse" />
        <div className="absolute top-16 right-20 w-1.5 h-1.5 rounded-full bg-white animate-ping" />
        <div className="absolute top-32 left-1/4 w-2 h-2 rounded-full bg-red-400/80 animate-pulse" />
        <div className="absolute top-48 right-1/3 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <div className="absolute top-8 right-1/4 w-2.5 h-2.5 rounded-full bg-amber-300/80 animate-ping" />
        <div className="absolute top-24 left-1/3 w-1 h-1 rounded-full bg-white animate-pulse" />
      </div>

      {/* Ambient Crimson & Holiday Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-red-500/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4">
        {/* Strategic Alliance Kicker */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-900">
          <div className="flex items-center gap-2">
            <span className="font-bebas text-lg sm:text-xl text-neutral-300 uppercase tracking-wider">
              OHANA GO <span className="text-red-500 font-black">PRESENTA</span>
            </span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs font-mono">
            <span className="text-neutral-400">EN ALIANZA ESTRATÉGICA CON:</span>
            <span className="font-bold text-white uppercase tracking-wider bg-gradient-to-r from-blue-400 via-amber-300 to-red-400 bg-clip-text text-transparent">
              Master Ulala
            </span>
          </div>
        </div>

        {/* Main Grid: Poster & Athletic Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Official Poster Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm sm:max-w-md w-full rounded-3xl overflow-hidden border-2 border-red-600/40 shadow-[0_0_50px_rgba(220,38,38,0.25)] bg-black">
              {/* Image banner from user upload */}
              <img
                src="/assets/aistudio/SANTA_RUN_MATERULALA_8f51e32f.jpeg"
                alt="Santa Run Tarapoto 2026 - Ohana Go & Master Ulala"
                className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4 flex items-center justify-between text-xs font-mono text-white">
                <span className="px-2.5 py-1 rounded-full bg-red-600 text-white font-bold uppercase tracking-wider text-[10px]">
                  Oficial 2026
                </span>
                <span className="text-neutral-300">Tarapoto · San Martín</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Content & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Nueva Gran Carrera Oficial · Navidad 2026</span>
            </div>

            {/* Imposing Title */}
            <div>
              <span className="text-xs sm:text-sm font-mono tracking-[0.25em] text-neutral-400 uppercase font-black block mb-1">
                OHANA GO & MASTER ULALA PRESENTAN
              </span>
              <h1 className="font-bebas text-6xl sm:text-7xl md:text-8xl text-white tracking-tight uppercase leading-none drop-shadow-2xl">
                SANTA <span className="text-red-500 text-glow-red">RUN</span>
              </h1>
              <p className="font-bebas text-3xl sm:text-4xl text-neutral-300 tracking-wider uppercase mt-1">
                TARAPOTO 2026
              </p>
              <div className="inline-block mt-2 px-4 py-1 rounded-xl bg-gradient-to-r from-red-600/20 via-neutral-900 to-red-600/20 border border-red-500/30 text-red-300 font-sans italic font-bold text-base sm:text-lg">
                "Corre y regala Sonrisas ♡"
              </div>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-xl font-sans">
              La fiesta deportiva y solidaria más esperada del año en Tarapoto. Vístete de espíritu navideño con el gorro oficial y recorre la ciudad de noche en un ambiente lleno de luces, hidratación, medalla finisher conmemorativa y el gran <strong>Sorteo de un Pavo</strong>.
            </p>

            {/* Quick Event Route & Schedule Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-neutral-900 text-left">
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-red-400" /> Fecha
                </span>
                <span className="font-bebas text-lg text-white block leading-tight">Sábado 19 Dic</span>
                <span className="text-[10px] text-neutral-400">Temporada 2026</span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold flex items-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5 text-red-400" /> Hora
                </span>
                <span className="font-bebas text-lg text-white block leading-tight">7:00 P.M.</span>
                <span className="text-[10px] text-neutral-400">Carrera Nocturna</span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold flex items-center gap-1 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400" /> Partida
                </span>
                <span className="font-bebas text-lg text-white block leading-tight">Parque Av. Aviación</span>
                <span className="text-[10px] text-neutral-400">Concentración</span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold flex items-center gap-1 mb-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> Llegada
                </span>
                <span className="font-bebas text-lg text-white block leading-tight">Concha Acústica</span>
                <span className="text-[10px] text-neutral-400">Meta & Sorteo</span>
              </div>
            </div>

            {/* Special Promo Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/80 via-neutral-950 to-neutral-900 border border-red-500/40 flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-bebas text-xl font-black flex items-center justify-center shrink-0 shadow-md shadow-red-600/30">
                  15%
                </div>
                <div>
                  <span className="font-bold text-white text-xs sm:text-sm block">
                    15% de descuento especial
                  </span>
                  <span className="text-[11px] text-neutral-400 block font-sans">
                    Para atletas de anteriores ediciones de OHANA GO (Pagan S/ 59.50)
                  </span>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-red-400 uppercase shrink-0 bg-red-950 px-2 py-1 rounded border border-red-500/30">
                Válido con tu DNI
              </span>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onRegisterClick}
                className="px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bebas text-2xl uppercase tracking-wider transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-xl shadow-red-600/30 font-black cursor-pointer flex items-center gap-2"
              >
                <span>Inscríbete Ahora (S/ 70.00)</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onExploreKit}
                className="px-6 py-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border-2 border-red-600/50 hover:border-red-500 text-white font-bebas text-xl uppercase tracking-wider transition cursor-pointer flex items-center gap-2"
              >
                <Gift className="w-5 h-5 text-red-400" />
                <span>Ver Kit & Sorteo Pavo</span>
              </button>

              <button
                onClick={onOpenCompetitorLogin}
                className="px-5 py-4 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white font-mono text-xs uppercase tracking-wider transition cursor-pointer border border-neutral-800 flex items-center gap-2"
              >
                <Ticket className="w-4 h-4 text-amber-400" />
                <span>Mi Espacio 🎒</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
