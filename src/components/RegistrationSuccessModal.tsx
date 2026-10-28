import React from 'react';
import { RunnerRegistration } from '../types/race';
import { DigitalBib } from './DigitalBib';
import { CheckCircle, X, MapPin, Calendar, AlertCircle } from 'lucide-react';

interface RegistrationSuccessModalProps {
  registration: RunnerRegistration | null;
  onClose: () => void;
}

export const RegistrationSuccessModal: React.FC<RegistrationSuccessModalProps> = ({
  registration,
  onClose,
}) => {
  if (!registration) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white bg-neutral-800 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-lime-400/20 text-lime-400 mb-2 border border-lime-400/30">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="font-bebas text-4xl sm:text-5xl text-white tracking-wide uppercase">
            ¡Inscripción Exitosa!
          </h2>
          <p className="text-sm text-neutral-300 max-w-md mx-auto">
            ¡Felicitaciones <span className="text-lime-400 font-bold">{registration.firstName}</span>! Tu cupo para la <strong>OHANA GO 5K HALLOWEEN</strong> en Tarapoto está confirmado.
          </p>
        </div>

        {/* Digital Bib Component */}
        <div className="mb-6">
          <DigitalBib registration={registration} showActions={true} />
        </div>

        {/* Important Next Steps Card */}
        <div className="bg-neutral-950 rounded-2xl p-4 border border-neutral-800 space-y-2.5 text-xs text-neutral-300">
          <h4 className="font-bebas text-base text-white uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-orange-400" />
            Información Clave para el Día de la Carrera
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-lime-400 shrink-0" />
              <span><strong>Sábado 31 Octubre 2026</strong> • 5:00 PM Concentración (Partida 7 PM)</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-lime-400 shrink-0" />
              <span><strong>Partida:</strong> Plaza de Armas Tarapoto</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lime-400 font-bold font-mono">REGISTRO</span>
              <span><strong>Código:</strong> {registration.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
              <span><strong>Meta:</strong> Entre Jarras (Jr. Lima cda. 13)</span>
            </div>
          </div>
          <p className="text-[11px] text-neutral-400 pt-2 border-t border-neutral-800/80">
            * Guarda una captura de pantalla de este pase oficial para canjear tu medalla finisher y artículo neón el día de la carrera.
          </p>
        </div>

        {/* Modal Close Action */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bebas text-lg tracking-wider uppercase rounded-xl transition cursor-pointer"
          >
            Entendido, volver a la página
          </button>
        </div>

      </div>
    </div>
  );
};
