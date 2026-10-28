import React from 'react';
import { Sparkles, Calendar, Clock, MapPin, CheckCircle2, ShieldCheck, Users, Trophy } from 'lucide-react';
import { RunnerRegistration } from '../types/race';

interface RegistrationFormProps {
  onRegistrationSuccess?: (registration: RunnerRegistration) => void;
  onOpenCompetitorLogin?: () => void;
  onGoToRoute?: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onOpenCompetitorLogin,
  onGoToRoute,
}) => {
  return (
    <section id="formulario-registro" className="pt-6 pb-12 px-4 max-w-4xl mx-auto scroll-mt-20">
      {/* Container: Closed Registration Notice & Runner Guidance */}
      <div className="relative overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-2 border-lime-400/50 rounded-3xl p-6 sm:p-10 shadow-[0_0_50px_rgba(163,230,53,0.15)] text-center">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-400/10 border border-lime-400/40 text-lime-400 text-xs font-black uppercase tracking-wider mb-4">
          <CheckCircle2 className="w-4 h-4 text-lime-400" />
          <span>Etapa de Inscripciones Concluida</span>
        </div>

        {/* Main Title */}
        <h2 className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white tracking-wider uppercase leading-none">
          Inscripciones <span className="text-lime-400 text-glow-lime">Finalizadas</span>
        </h2>

        <p className="text-neutral-300 text-sm sm:text-base max-w-2xl mx-auto mt-3 leading-relaxed">
          ¡Agradecemos a toda la comunidad runner! El periodo oficial de inscripción ha culminado con éxito alcanzando la nómina oficial de corredores para la <strong>OHANA GO 5K Por Halloween</strong>.
        </p>

        {/* Key Information Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-8 text-left">
          <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800">
            <span className="text-[10px] font-bold uppercase text-neutral-400 block flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-lime-400" />
              Fecha del Evento
            </span>
            <span className="font-bebas text-2xl text-white">Sábado 31 Octubre</span>
            <span className="text-xs text-neutral-400 block mt-0.5">Tarapoto 2026</span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/90 border-2 border-lime-400/40 shadow-sm shadow-lime-400/10">
            <span className="text-[10px] font-bold uppercase text-lime-400 block flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-lime-400" />
              Hora de Concentración
            </span>
            <span className="font-bebas text-2xl text-lime-400">5:30 P.M.</span>
            <span className="text-xs text-neutral-300 block mt-0.5">Largada Oficial: 7:00 P.M.</span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800">
            <span className="text-[10px] font-bold uppercase text-neutral-400 block flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              Punto de Encuentro
            </span>
            <span className="font-bebas text-2xl text-white">Plaza de Armas</span>
            <span className="text-xs text-neutral-400 block mt-0.5">Entrega de neón & asistencia</span>
          </div>
        </div>

        {/* Competitor Instructions Box */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-neutral-900 to-purple-950/60 border border-purple-500/40 text-left my-6 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center text-3xl shrink-0 shadow-lg shadow-purple-600/30 border border-purple-400/40">
              🎒
            </div>
            <div>
              <h4 className="font-bebas text-2xl text-white uppercase tracking-wide leading-none">
                ¿Ya te encuentras registrado?
              </h4>
              <p className="text-xs text-neutral-300 mt-1 max-w-lg leading-relaxed">
                Ingresa con tu número de DNI a <strong>Mi Espacio 🎒</strong> para ver y descargar tu <strong>Pase Oficial Digital</strong> con código QR y validar tu asistencia al llegar este sábado.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCompetitorLogin}
            className="w-full md:w-auto px-6 py-3.5 bg-lime-400 hover:bg-lime-300 text-black font-bebas text-xl uppercase tracking-wider rounded-xl transition shadow-lg shadow-lime-400/30 flex items-center justify-center gap-2 cursor-pointer shrink-0 hover:scale-105"
          >
            <Sparkles className="w-5 h-5 text-black" />
            <span>Ingresar a Mi Espacio</span>
          </button>
        </div>

        {/* Secondary Info */}
        <p className="text-xs text-neutral-400 mt-2">
          Si tienes alguna consulta sobre tu inscripción, contáctanos a través de nuestro Instagram oficial <strong>@ohanago.peru</strong>.
        </p>
      </div>
    </section>
  );
};
