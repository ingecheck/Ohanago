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
      {/* Background Soft Ambient Glows (Toned Down) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-lime-400/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-72 h-72 bg-lime-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern Texture */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 text-center">
        {/* Brand Official Native Vector Logo Display */}
        <div className="flex flex-col items-center justify-center mb-6">
          <BrandLogo size="xl" showSubtitle={false} className="py-2 hover:scale-[1.01] transition-transform duration-300" />
          <p className="font-bebas text-2xl sm:text-3xl md:text-4xl text-neutral-300 uppercase tracking-widest mt-2">
            Muévete. Conecta. Vive.
          </p>
        </div>

        {/* Narrative Description */}
        <div className="max-w-3xl mx-auto text-sm sm:text-base text-neutral-300 leading-relaxed mb-8 space-y-3">
          <p className="font-bold text-white text-base sm:text-lg">
            Bienvenidos a la plataforma oficial de OHANA GO
          </p>
          <p>
            Un espacio creado para conectar personas, compartir experiencias, descubrir nuevas actividades, asumir retos y celebrar cada logro. Somos una comunidad que cree en el poder del movimiento y las experiencias compartidas.
          </p>
          <p className="text-neutral-200 font-medium">
            ¡Esto recién comienza! Nos esperan muchos kilómetros, nuevos desafíos y momentos inolvidables por vivir juntos.
          </p>
        </div>

        {/* Action CTA */}
        <div className="flex items-center justify-center mb-10">
          <button
            onClick={onExploreUpcoming}
            className="px-10 py-4 rounded-2xl bg-lime-400 hover:bg-lime-300 text-black font-bebas text-2xl uppercase tracking-wider transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md shadow-black/50 font-black cursor-pointer"
          >
            Próxima Carrera
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
            <span className="text-[11px] text-neutral-400">Runners activos</span>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 transition hover:border-lime-400/40">
            <div className="flex items-center gap-2 text-lime-400 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Social Run</span>
            </div>
            <span className="font-bebas text-2xl sm:text-3xl text-white block">Lun, Mar & Vie</span>
            <span className="text-[11px] text-neutral-400">5:45 AM • Salidas del Club</span>
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
