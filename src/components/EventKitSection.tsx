import React from 'react';
import { Award, Droplets, Sparkles, Gift } from 'lucide-react';
import { FinisherMedalCard } from './FinisherMedalCard';

interface EventKitSectionProps {
  onGoToRegister?: () => void;
}

export const EventKitSection: React.FC<EventKitSectionProps> = () => {
  const kitItems = [
    {
      icon: Award,
      title: 'Medalla Finisher 5K',
      badge: 'Oficial',
      color: 'from-amber-500/20 to-orange-500/20',
      borderColor: 'border-amber-500/40',
      iconColor: 'text-amber-400',
      description: 'Hermosa medalla oficial con relieve de palmeras tropicales, silueta de corredores y motivo Halloween Tarapoto 2026.',
      feature: 'Solo para los que crucen la meta en Entre Jarras'
    },
    {
      icon: Droplets,
      title: 'Hidratación (Agua Nativa)',
      badge: 'Puntos en Ruta & Meta',
      color: 'from-cyan-500/20 to-blue-500/20',
      borderColor: 'border-cyan-500/40',
      iconColor: 'text-cyan-400',
      description: 'Puntos de hidratación oficial con agua mineral Nativa en el recorrido de la Av. Circunvalación y en la zona de meta.',
      feature: 'Agua fría para todos los participantes'
    },
    {
      icon: Sparkles,
      title: 'Artículo Neón Glow',
      badge: 'Brillo en la Noche',
      color: 'from-lime-500/20 to-emerald-500/20',
      borderColor: 'border-lime-500/40',
      iconColor: 'text-lime-400',
      description: 'Pulsera o accesorio de luz neón ultra brillante para iluminar las calles de Tarapoto durante los 5 kilómetros nocturnos.',
      feature: 'Entrega en la Plaza de Armas desde las 5:00 PM (Concentración)'
    },
    {
      icon: Gift,
      title: 'Sorteos en la Llegada',
      badge: 'Entre Jarras',
      color: 'from-purple-500/20 to-fuchsia-500/20',
      borderColor: 'border-purple-500/40',
      iconColor: 'text-purple-400',
      description: 'Sorteos con tu código de inscripción en la llegada de Entre Jarras (Jr. Lima cda. 13) y premiación al mejor disfraz de Halloween.',
      feature: 'Participas automáticamente con tu código de registro'
    }
  ];

  return (
    <section id="kit-evento" className="pt-8 pb-6 px-4 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h2 className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white tracking-wider uppercase">
          Tu Inscripción <span className="text-lime-400 text-glow-lime">Incluye</span>
        </h2>
        <p className="text-neutral-400 text-sm md:text-base mt-2">
          Todo lo necesario para participar en la carrera nocturna 5K de Tarapoto el 31 de Octubre.
        </p>
      </div>

      {/* 1. Benefits Rectangles FIRST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto mb-8">
        {kitItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl bg-neutral-900/70 border ${item.borderColor} p-5 backdrop-blur-md transition-all duration-300 hover:bg-neutral-900 hover:scale-[1.01] hover:shadow-xl`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} border ${item.borderColor}`}>
                    <IconComponent className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-bebas text-2xl text-white tracking-wide uppercase">
                      {item.title}
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-wider text-lime-400 bg-lime-950/50 px-2 py-0.5 rounded border border-lime-500/30">
                      {item.badge}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
                {item.description}
              </p>

              <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                <span className="text-neutral-300 font-medium">
                  ✓ {item.feature}
                </span>
                <span className="text-lime-400 font-bold uppercase text-[11px]">
                  Incluido
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Finisher Medal Card BELOW all the benefits */}
      <div className="max-w-md mx-auto">
        <FinisherMedalCard />
      </div>
    </section>
  );
};
