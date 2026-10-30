import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  AlertCircle,
  QrCode,
  LogOut,
  ArrowLeft,
  Camera,
  Phone,
  Calendar,
  PackageCheck
} from 'lucide-react';
import { RunnerRegistration } from '../types/race';
import { QRScannerModal } from './QRScannerModal';

interface CompetitorPortalModalProps {
  competitor: RunnerRegistration;
  onClose: () => void;
  onLogout: () => void;
  onUpdateCompetitor: (updated: RunnerRegistration) => void;
}

export const CompetitorPortalModal: React.FC<CompetitorPortalModalProps> = ({
  competitor,
  onClose,
  onLogout,
  onUpdateCompetitor,
}) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  const isVirtual = competitor.modality === 'Virtual';

  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  const handleConfirmKitDirectly = async () => {
    setIsConfirming(true);
    setActionErrorMessage(null);
    try {
      const res = await fetch('/api/start-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runnerId: competitor.id,
          dni: competitor.documentNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionErrorMessage(data.error || 'Error al validar entrega de kit.');
        setTimeout(() => setActionErrorMessage(null), 4000);
        return;
      }
      const updated = data.runner || {
        ...competitor,
        confirmedAtStart: true,
        startCheckinTime: new Date().toISOString(),
      };
      onUpdateCompetitor(updated);
      try {
        window.dispatchEvent(new CustomEvent('ohana-checkin', { detail: updated }));
        confetti({ particleCount: 130, spread: 85, origin: { y: 0.6 } });
      } catch (e) {}
      setActionSuccessMessage('¡Kit Inicial Entregado y Asistencia Confirmada! Acreditado en el sistema.');
      setTimeout(() => setActionSuccessMessage(null), 6000);
    } catch (e) {
      setActionErrorMessage('Error de conexión al registrar check-in.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleStartQRScan = async (scannedToken: string) => {
    try {
      const res = await fetch('/api/start-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runnerId: competitor.id,
          dni: competitor.documentNumber,
          token: scannedToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionErrorMessage(data.error || 'Código QR no válido para entrega de kit.');
        setTimeout(() => setActionErrorMessage(null), 4000);
        return;
      }

      const updated = data.runner || {
        ...competitor,
        confirmedAtStart: true,
        startCheckinTime: new Date().toISOString()
      };
      
      onUpdateCompetitor(updated);
      setIsScannerOpen(false);

      try {
        window.dispatchEvent(new CustomEvent('ohana-checkin', { detail: updated }));
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}

      setActionSuccessMessage('¡Kit Inicial Entregado y Asistencia Confirmada! Prepárate para la carrera 🏃‍♂️💨');
      setTimeout(() => setActionSuccessMessage(null), 6000);
    } catch (err: any) {
      setActionErrorMessage('Error al procesar el código.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 overflow-y-auto min-h-screen text-neutral-100 flex flex-col selection:bg-lime-400 selection:text-black">
      {/* Top Sticky Header Bar: Fluid and natural, no boxed modal borders */}
      <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-md border-b border-purple-500/30 px-4 sm:px-8 py-3.5 shadow-xl">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-lime-400 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-lime-400/40 shadow-sm"
              title="Regresar a la página de inicio"
            >
              <ArrowLeft className="w-4 h-4 text-lime-400" />
              <span>Volver a Inicio</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center text-sm shadow">
                🎒
              </span>
              <span className="font-bebas text-xl sm:text-2xl text-white tracking-wide uppercase leading-none">
                Mi Espacio • <span className="text-lime-400">Verificación Oficial</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl bg-red-950/70 hover:bg-red-900 text-red-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-red-500/40 shadow-sm"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Fluid Content */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6 flex-1">
        {/* Notices */}
        {actionSuccessMessage && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-neutral-900 to-emerald-950 border-2 border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2.5 shadow-xl shadow-emerald-500/20 animate-pulse">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-semibold">{actionSuccessMessage}</span>
          </div>
        )}
        {actionErrorMessage && (
          <div className="p-4 rounded-2xl bg-red-950/90 border-2 border-red-500/60 text-red-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{actionErrorMessage}</span>
          </div>
        )}

        {/* Runner Welcome Identification Banner */}
        <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-purple-950/70 via-neutral-900 to-purple-950/70 border border-purple-500/40 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-purple-300 bg-purple-900/70 px-2.5 py-0.5 rounded-full border border-purple-500/40 tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-lime-400" />
                Atleta Inscrito
              </span>
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                isVirtual 
                  ? 'bg-purple-950 text-purple-300 border-purple-500/40' 
                  : 'bg-lime-950 text-lime-400 border-lime-500/40'
              }`}>
                {isVirtual ? 'Modalidad Virtual' : 'Presencial Tarapoto'}
              </span>
            </div>
            <h2 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide uppercase leading-tight pt-1">
              {competitor.firstName} {competitor.lastName}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300">
              DNI: <strong className="text-lime-400 font-mono text-base">{competitor.documentNumber}</strong> • Código: <strong className="text-white font-mono">{competitor.id}</strong>
            </p>
          </div>

          <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">Estado del Pago</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border mt-1 inline-flex items-center gap-1.5 ${
              competitor.paymentStatus === 'Verificado'
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50'
                : 'bg-amber-950/80 text-amber-400 border-amber-500/50'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {competitor.paymentStatus}
            </span>
          </div>
        </div>

        {/* HIGH-IMPACT QR SCANNER CARD FOR ENTREGA DE KIT INICIAL */}
        <div className="rounded-3xl overflow-hidden shadow-2xl transition-all">
          {competitor.confirmedAtStart ? (
            <div className="p-6 sm:p-8 bg-gradient-to-r from-emerald-950/90 via-neutral-900 to-emerald-950/90 border-2 border-emerald-400 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-400 text-black flex items-center justify-center font-black shrink-0 shadow-xl shadow-emerald-400/30">
                  <PackageCheck className="w-9 h-9 stroke-[2.2]" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-400/40">
                    Acreditación en Plaza de Armas
                  </span>
                  <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide uppercase mt-1 leading-none">
                    ¡Kit Inicial Entregado y Asistencia Confirmada!
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-xl leading-relaxed">
                    Tu entrega de kit inicial (pulseras neón, número, hidratación y acreditación) ya está registrada en el sistema del organizador en tiempo real.
                    {competitor.startCheckinTime && (
                      <span className="font-mono ml-1 text-emerald-300 font-bold block sm:inline mt-0.5 sm:mt-0">
                        • {new Date(competitor.startCheckinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="px-4 py-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center shrink-0">
                ✓ Listo para largar (7:00 PM)
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 bg-gradient-to-br from-neutral-900 via-purple-950/50 to-neutral-900 border-2 border-lime-400/80 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_50px_rgba(163,230,53,0.15)]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-lime-400 text-black flex items-center justify-center font-black shrink-0 shadow-xl shadow-lime-400/30">
                  <Camera className="w-8 h-8 stroke-[2.5]" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-lime-400/20 text-lime-300 text-[10px] font-black uppercase tracking-wider border border-lime-400/40">
                    Punto de Acreditación • Plaza de Armas
                  </span>
                  <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide uppercase mt-1 leading-tight">
                    Entrega de Kit Inicial (Check-in QR)
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-xl leading-relaxed">
                    Al llegar a la Plaza de Armas a las <strong>5:30 PM</strong>, apunta con tu cámara al código QR oficial para confirmar tu asistencia y recibir tu Kit Inicial (pulseras neón, número, hidratación).
                  </p>
                </div>
              </div>

              <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleConfirmKitDirectly}
                  disabled={isConfirming}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-black font-bebas text-lg sm:text-xl uppercase tracking-wider transition shadow-xl shadow-lime-400/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
                >
                  <PackageCheck className="w-5 h-5 text-black" />
                  <span>{isConfirming ? 'Confirmando...' : '✓ Confirmar Entrega de Kit'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bebas text-lg sm:text-xl uppercase tracking-wider transition border border-neutral-700 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="w-5 h-5 text-lime-400" />
                  <span>Escanear QR</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clean Official Verification Card */}
        <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-lime-400" />
              <h3 className="font-bebas text-2xl text-white uppercase tracking-wide">
                Ficha Oficial de Verificación
              </h3>
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              Participante N° <strong className="text-lime-400">{competitor.registrationNumber || competitor.id}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80">
              <span className="text-neutral-500 block uppercase font-bold text-[10px]">Documento de Identidad (DNI)</span>
              <span className="text-lime-400 font-black font-mono text-base block mt-0.5">{competitor.documentNumber}</span>
              <span className="text-[10px] text-neutral-400">Verificado para ingreso</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80">
              <span className="text-neutral-500 block uppercase font-bold text-[10px]">Nombre Completo</span>
              <span className="text-white font-bold text-sm block mt-0.5">{competitor.firstName} {competitor.lastName}</span>
              <span className="text-[10px] text-neutral-400">{competitor.gender} • {competitor.age} años</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80">
              <span className="text-neutral-500 block uppercase font-bold text-[10px]">Teléfono WhatsApp</span>
              <span className="text-emerald-400 font-semibold font-mono text-sm flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5" />
                {competitor.whatsapp}
              </span>
              <span className="text-[10px] text-neutral-400">Contacto de registro</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80">
              <span className="text-neutral-500 block uppercase font-bold text-[10px]">Modalidad</span>
              <span className="text-white font-bold text-sm block mt-0.5">5K Presencial Tarapoto</span>
              <span className="text-[10px] text-neutral-400">Plaza de Armas</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80">
              <span className="text-neutral-500 block uppercase font-bold text-[10px]">Kit Inicial</span>
              <div className="mt-0.5">
                {competitor.confirmedAtStart ? (
                  <span className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Entregado en Plaza
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold text-sm flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Pendiente de Entrega
                  </span>
                )}
              </div>
              <span className="text-[10px] text-neutral-400">Recepción en mesa de acreditación</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80">
              <span className="text-neutral-500 block uppercase font-bold text-[10px]">Ubicación</span>
              <span className="text-white font-semibold text-xs block mt-0.5">{competitor.city} • {competitor.district}</span>
              <span className="text-[10px] text-neutral-400">{competitor.department || 'San Martín'}</span>
            </div>
          </div>

          {/* Event Schedule & Instructions Note */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-purple-300 font-bold">
              <Calendar className="w-4 h-4 text-lime-400" />
              <span>Cronograma Oficial del Evento • Sábado 31 de Octubre</span>
            </div>
            <ul className="text-neutral-300 text-[11px] space-y-1 list-disc list-inside">
              <li><strong>5:30 PM:</strong> Concentración y entrega de Kit Inicial en la Plaza de Armas de Tarapoto.</li>
              <li><strong>6:30 PM:</strong> Calentamiento grupal, dinámicas y activación.</li>
              <li><strong>7:00 PM:</strong> Conteo regresivo y largada oficial 5K.</li>
              <li><strong>Llegada & After Race:</strong> Meta y sorteos en Entre Jarras (Av. Lima 1230).</li>
            </ul>
          </div>
        </div>

        {/* Generous bottom spacing area so nothing is clipped or obstructed on mobile/desktop */}
        <div className="pt-6 pb-20 text-center">
          <p className="text-xs text-neutral-500 font-mono">
            OHANA GO 5K TARAPOTO • Ficha Oficial de Participación
          </p>
        </div>
      </main>

      {/* QR Scanner Modal for Kit Delivery Check-in */}
      {isScannerOpen && (
        <QRScannerModal
          title="Escáner QR • Entrega de Kit Inicial"
          subtitle="Apunta la cámara al código QR oficial en el stand de acreditación de la Plaza de Armas."
          expectedType="start_checkin"
          onScanSuccess={(token) => {
            setIsScannerOpen(false);
            handleStartQRScan(token);
          }}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  );
};
