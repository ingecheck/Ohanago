import React from 'react';
import { RunnerRegistration } from '../types/race';
import { DigitalBib } from './DigitalBib';
import { isRiojaRunner } from '../utils/checkinManager';
import { CheckCircle, Clock, X, UserCheck } from 'lucide-react';

interface RegistrationSuccessModalProps {
  registration: RunnerRegistration | null;
  onClose: () => void;
  onOpenCompetitorPortal?: () => void;
}

export const RegistrationSuccessModal: React.FC<RegistrationSuccessModalProps> = ({
  registration,
  onClose,
  onOpenCompetitorPortal,
}) => {
  if (!registration) return null;

  const isVerified = registration.paymentStatus === 'Verificado';
  const isRioja = isRiojaRunner(registration);
  const eventTitle = isRioja ? 'SANTA RUN RIOJA 2026' : 'SANTA RUN TARAPOTO 2026';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white bg-neutral-800 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isVerified ? (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-600/20 text-emerald-400 mb-2 border border-emerald-500/40">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="font-bebas text-4xl sm:text-5xl text-white tracking-wide uppercase">
                ¡Inscripción Verificada!
              </h2>
              <p className="text-sm text-neutral-300 max-w-md mx-auto">
                ¡Felicitaciones <span className="text-amber-400 font-bold">{registration.firstName}</span>! Tu cupo oficial para la <strong>{eventTitle}</strong> está verificado.
              </p>
            </div>

            <div className="mb-6">
              <DigitalBib registration={registration} showActions={true} />
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bebas text-lg tracking-wider uppercase rounded-xl transition cursor-pointer"
              >
                Entendido, volver a la página
              </button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-5">
            <div className="inline-flex p-3.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/40">
              <Clock className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="font-bebas text-4xl sm:text-5xl text-white tracking-wide uppercase leading-none">
                ¡Ya se envió tu solicitud!
              </h2>
              <p className="text-sm text-neutral-200 max-w-md mx-auto leading-relaxed">
                Gracias <strong className="text-amber-400">{registration.firstName} {registration.lastName}</strong>. Tu solicitud para <strong>{eventTitle}</strong> ya fue enviada correctamente.
              </p>
            </div>

            <div className="bg-neutral-950 border border-amber-500/30 rounded-2xl p-4 text-left space-y-2.5 text-xs sm:text-sm text-neutral-300">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-neutral-400">Código de Solicitud:</span>
                <span className="font-mono font-bold text-white">{registration.id}</span>
              </div>
              {isRioja && (
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-neutral-400">Categoría Rioja:</span>
                  <span className="font-bold text-amber-300">
                    {registration.raceCategory || 'Libre 5K'} · S/ {Number(registration.amountPaid || 35).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-neutral-400">DNI / Documento:</span>
                <span className="font-mono font-bold text-white">{registration.documentNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Estado actual:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
                  Pendiente de Verificación
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 bg-neutral-950/80 border border-white/10 rounded-2xl p-4 leading-relaxed">
              Si deseas ver cuando ya estés <strong className="text-emerald-400">Verificado</strong> y acceder a tu pase oficial, tendrás que revisar tu sección <strong className="text-amber-300">«Mi Espacio»</strong> ingresando con tu DNI. Esto se actualizará en cuanto el organizador verifique tu solicitud.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              {onOpenCompetitorPortal && (
                <button
                  type="button"
                  onClick={onOpenCompetitorPortal}
                  className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bebas text-lg tracking-wider uppercase rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/25"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Ir a Mi Espacio</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bebas text-lg tracking-wider uppercase rounded-xl transition cursor-pointer"
              >
                Entendido, cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

