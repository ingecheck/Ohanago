import React from 'react';
import { Sparkles, Users, Trophy, MapPin, ArrowRight, Zap, Flame, Shield } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface EventHeroProps {
  onRegisterClick?: () => void;
  onExploreUpcoming?: () => void;
  onExploreCommunity?: () => void;
  registeredCount: number;
}

export const EventHero: React.FC<EventHeroProps> = ({
  onRegisterClick,
  onExploreUpcoming,
  onExploreCommunity,
  registeredCount,
}) => {
  return (
    <div className="relative overflow-hidden pt-8 pb-14 md:pt-14 md:pb-20 border-b border-neutral-900 bg-gradient-to-b from-black via-neutral-950 to-neutral-900">
      {/* Background Electric Neon Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-lime-400/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-lime-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern Texture */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#a3e635 1px, transparent 1px), linear-gradient(90deg, #a3e635 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 text-center">
        {/* Brand Kicker / Disciplines */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-lime-950/80 text-lime-400 border border-lime-400/40 shadow-sm shadow-lime-400/20">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
            Social Run Club & Eventos de Resistencia
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono text-neutral-300 bg-neutral-900 border border-neutral-800">
            <Flame className="w-3.5 h-3.5 text-lime-400" />
            Running Urbano & Trail Running · Competencia Sana
          </span>
        </div>

        {/* Brand Official Native Vector Logo Display */}
        <div className="flex flex-col items-center justify-center mb-6">
          <BrandLogo size="xl" showSubtitle={false} className="py-2 hover:scale-[1.02] transition-transform duration-300" />
          <p className="font-bebas text-3xl sm:text-4xl md:text-5xl text-neutral-200 uppercase tracking-widest mt-2">
            MÁS QUE CORRER, <span className="text-lime-400 font-black">SOMOS FAMILIA</span>
          </p>
        </div>

        {/* Narrative Description */}
        <p className="max-w-3xl mx-auto text-sm sm:text-base text-neutral-300 leading-relaxed mb-8">
          Bienvenido a la plataforma oficial de <strong>OHANA GO</strong>. Fusionamos el running urbano, el trail running y las carreras de fondo en experiencias deportivas de alta energía, compañerismo y competencia sana para atletas de todos los niveles.
        </p>

        {/* Action CTAs - Harmonized 2-Button Athletic Layout */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <button
            onClick={onExploreUpcoming}
            className="px-8 py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-black font-bebas text-xl sm:text-2xl uppercase tracking-wider transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg shadow-lime-400/25 font-black cursor-pointer"
          >
            Próxima Carrera
          </button>

          <button
            onClick={onExploreCommunity}
            className="px-8 py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border-2 border-lime-400/70 hover:border-lime-400 text-lime-400 hover:text-lime-300 font-bebas text-xl sm:text-2xl uppercase tracking-wider transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2.5 cursor-pointer font-black"
          >
            <Users className="w-5 h-5 text-lime-400" />
            <span>Comunidad Social Run</span>
          </button>
        </div>

        {/* Quick Brand Stat Pillars (3 Pillars - Natural & Balanced) */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 text-left">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 transition hover:border-lime-400/40">
            <div className="flex items-center gap-2 text-lime-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Comunidad</span>
            </div>
            <span className="font-bebas text-2xl sm:text-3xl text-white block">+{registeredCount || 131} Atletas</span>
            <span className="text-[11px] text-neutral-400">Runners activos en Tarapoto</span>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 transition hover:border-lime-400/40">
            <div className="flex items-center gap-2 text-lime-400 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Social Run</span>
            </div>
            <span className="font-bebas text-2xl sm:text-3xl text-white block">Martes & Jueves</span>
            <span className="text-[11px] text-neutral-400">6:30 PM • Salidas gratuitas</span>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 transition hover:border-lime-400/40">
            <div className="flex items-center gap-2 text-lime-400 mb-1">
              <Flame className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Filosofía</span>
            </div>
            <span className="font-bebas text-2xl sm:text-3xl text-white block">Ohana Spirit</span>
            <span className="text-[11px] text-neutral-400">Nadie se queda atrás</span>
          </div>
        </div>
      </div>
    </div>
  );
};
