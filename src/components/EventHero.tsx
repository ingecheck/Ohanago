import React from 'react';
import { Calendar, Clock, MapPin, Sparkles, Gift, Users, Trophy, Flame, ChevronRight, User } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface EventHeroProps {
  onRegisterClick?: () => void;
  onExploreUpcoming?: () => void;
  onOpenCompetitorLogin?: () => void;
  registeredCount: number;
}

export const EventHero: React.FC<EventHeroProps> = ({
  onRegisterClick,
  onExploreUpcoming,
  onOpenCompetitorLogin,
  registeredCount,
}) => {
  return (
    <div className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-red-950/50 bg-black">
      {/* Background Holiday Ambient Warmth */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 text-center">
        {/* Festive Holiday Edition Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-200 text-xs font-mono font-bold uppercase tracking-widest mb-6 shadow-lg shadow-red-950/50 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>🎅 EDICIÓN OFICIAL NAVIDEÑA · TARAPOTO 2026</span>
          <span className="text-amber-400 font-black">★</span>
        </div>

        {/* Brand Official Native Logo */}
        <div className="flex flex-col items-center justify-center mb-6">
          <BrandLogo size="xl" showSubtitle={false} variant="crimson" className="py-2 hover:scale-[1.01] transition-transform duration-300" />
          <p className="font-bebas text-2xl sm:text-3xl md:text-4xl text-neutral-300 uppercase tracking-widest mt-1">
            Muévete. Conecta. Vive.
          </p>
        </div>

        {/* Narrative & Slogan */}
        <div className="max-w-3xl mx-auto space-y-3 mb-10">
          <h1 className="font-bebas text-4xl sm:text-6xl md:text-7xl text-white tracking-wide uppercase leading-none drop-shadow-xl">
            SANTA RUN <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-300">TARAPOTO 2026</span>
          </h1>
          <p className="font-bebas text-xl sm:text-2xl text-red-400 uppercase tracking-wider flex items-center justify-center gap-2">
            <span>❤️ Corre y regala Sonrisas</span>
          </p>
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl mx-auto font-sans">
            La marea roja se apodera del asfalto nocturno de Tarapoto este fin de año. Una fiesta deportiva, familiar y solidaria con gorros de Santa, medalla conmemorativa, kit completo y sorteo de pavo navideño.
          </p>
        </div>

        {/* Key Event Milestones Chips */}
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 text-left">
          <div className="bg-neutral-950/80 border border-neutral-800/90 rounded-2xl p-3.5 backdrop-blur-md transition hover:border-red-500/50">
            <span className="text-[10px] font-mono uppercase text-red-400 font-bold block flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-red-400" /> Fecha
            </span>
            <span className="font-bebas text-xl sm:text-2xl text-white block leading-tight">Sábado 19 DIC</span>
            <span className="text-[11px] text-neutral-400">Temporada 2026</span>
          </div>

          <div className="bg-neutral-950/80 border border-neutral-800/90 rounded-2xl p-3.5 backdrop-blur-md transition hover:border-red-500/50">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Horario
            </span>
            <span className="font-bebas text-xl sm:text-2xl text-white block leading-tight">7:00 P.M.</span>
            <span className="text-[11px] text-neutral-400">Carrera Nocturna</span>
          </div>

          <div className="bg-neutral-950/80 border border-neutral-800/90 rounded-2xl p-3.5 backdrop-blur-md transition hover:border-red-500/50">
            <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" /> Partida
            </span>
            <span className="font-bebas text-lg sm:text-xl text-white block leading-tight truncate">Parque Aviación</span>
            <span className="text-[11px] text-neutral-400">Av. Aviación</span>
          </div>

          <div className="bg-neutral-950/80 border border-neutral-800/90 rounded-2xl p-3.5 backdrop-blur-md transition hover:border-red-500/50">
            <span className="text-[10px] font-mono uppercase text-red-400 font-bold block flex items-center gap-1.5 mb-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> Llegada
            </span>
            <span className="font-bebas text-lg sm:text-xl text-white block leading-tight truncate">Concha Acústica</span>
            <span className="text-[11px] text-neutral-400">Meta & Celebración</span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <button
            onClick={onRegisterClick}
            className="px-8 sm:px-10 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-bebas text-2xl uppercase tracking-wider transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl shadow-red-600/35 font-black cursor-pointer flex items-center gap-3 border border-red-400/40"
          >
            <span>Inscribirme Ahora · S/ 70.00</span>
            <ChevronRight className="w-6 h-6" />
          </button>

          <button
            onClick={onExploreUpcoming}
            className="px-7 py-4 rounded-2xl bg-neutral-950/90 hover:bg-neutral-900 border-2 border-red-500/50 hover:border-red-400 text-red-200 hover:text-white font-bebas text-xl sm:text-2xl uppercase tracking-wider transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer backdrop-blur-md font-black shadow-lg"
          >
            <Gift className="w-5 h-5 text-amber-400" />
            <span>Ver Kit & Descuento 15%</span>
          </button>

          {onOpenCompetitorLogin && (
            <button
              onClick={onOpenCompetitorLogin}
              className="px-6 py-4 rounded-2xl bg-neutral-950/80 hover:bg-neutral-900 border border-neutral-800 hover:border-red-500/40 text-neutral-300 hover:text-white font-mono text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer backdrop-blur-md font-bold"
            >
              <span>🎒 Mi Espacio / Consultar Pase</span>
            </button>
          )}
        </div>

        {/* Clean Official Poster Showcase */}
        <div className="max-w-3xl mx-auto rounded-3xl overflow-hidden border border-red-500/30 shadow-[0_20px_80px_rgba(212,36,38,0.25)] relative group">
          <img
            src="/assets/aistudio/santa_run_poster_edition.jpeg"
            alt="Santa Run Tarapoto 2026 - Afiche Oficial"
            className="w-full h-auto object-cover group-hover:scale-[1.01] transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-white">
            <span className="bg-black/80 px-3 py-1 rounded-full border border-red-500/30 font-bold backdrop-blur-md">
              🎅 Santa Run Oficial 2026
            </span>
            <span className="bg-red-600/90 text-white font-bold px-3 py-1 rounded-full shadow-md">
              Sábado 19 Dic · 7:00 PM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
