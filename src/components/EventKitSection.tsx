import React from 'react';
import { Award, Droplets, Sparkles, Gift, Check, ArrowRight, MapPin } from 'lucide-react';
import { FinisherMedalCard } from './FinisherMedalCard';

interface EventKitSectionProps {
  onGoToRegister: () => void;
}

export const EventKitSection: React.FC<EventKitSectionProps> = ({ onGoToRegister }) => {
  const kitItems = [
    {
      icon: Award,
      title: 'Medalla Finisher Oficial',
      badge: 'Exclusiva Coleccionable',
      color: 'from-amber-500/20 to-orange-500/20',
      borderColor: 'border-amber-500/40',
      iconColor: 'text-amber-400',
      description: 'Hermosa medalla metálica fundida con relieve de palmeras tropicales, silueta de corredores, atardecer y motivo Halloween Tarapoto 2026.',
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
      feature: 'Entrega previa al inicio de la carrera'
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
    <section id="kit-evento" className="pt-8 pb-3 px-4 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs font-black uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Beneficios Oficiales de tu Pase
        </div>
        <h2 className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white tracking-wider uppercase">
          Tu Inscripción <span className="text-lime-400 text-glow-lime">Incluye</span>
        </h2>
        <p className="text-neutral-400 text-sm md:text-base mt-2">
          Todo lo necesario para participar en la carrera nocturna 5K de Tarapoto el 31 de Octubre.
        </p>
      </div>

      {/* Grid: Left medal showcase + Right Kit items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Medal Highlight */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <FinisherMedalCard />

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 backdrop-blur-md">
            <h4 className="font-bebas text-xl text-white tracking-wide uppercase flex items-center gap-2">
              <MapPin className="w-4 h-4 text-lime-400" />
              Entrega de Medalla & Neón
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-neutral-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                <span><strong>Artículo Neón:</strong> Entrega previa antes de la largada en Plaza de Armas</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                <span><strong>Medalla Finisher Oficial:</strong> Entrega en la meta en Entre Jarras</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                <span><strong>Requisito:</strong> Presentar DNI o tu <strong>Pase Digital</strong> desde tu celular</span>
              </li>
            </ul>

            <button
              onClick={onGoToRegister}
              className="mt-4 w-full py-3 bg-lime-400 hover:bg-lime-300 text-black font-bebas text-xl tracking-wider uppercase rounded-xl transition shadow-lg shadow-lime-400/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              Completar Mi Inscripción
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Column: Kit item cards */}
        <div className="lg:col-span-7 space-y-4">
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
      </div>
    </section>
  );
};
