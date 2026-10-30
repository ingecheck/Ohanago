import React, { useState, useEffect } from 'react';
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
  PackageCheck,
  Award,
  Trophy,
  Timer
} from 'lucide-react';
import { RunnerRegistration } from '../types/race';
import { QRScannerModal } from './QRScannerModal';
import { processStartCheckinSafe } from '../utils/checkinManager';

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

  // Live time tracking for the 7:15 PM milestone
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentHours = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  // 7:15 PM is 19:15
  const isPost715PM = (currentHours > 19) || (currentHours === 19 && currentMinutes >= 15);

  const handleStartQRScan = async (scannedToken: string) => {
    try {
      const result = await processStartCheckinSafe({
        runnerId: competitor.id,
        dni: competitor.documentNumber,
        token: scannedToken,
      });

      if (result.success && result.runner) {
        onUpdateCompetitor(result.runner);
        setIsScannerOpen(false);

        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        } catch (e) {}

        setActionSuccessMessage('¡Kit Inicial Entregado y Asistencia Confirmada! Prepárate para la carrera 🏃‍♂️💨');
        setTimeout(() => setActionSuccessMessage(null), 6000);
      } else {
        setActionErrorMessage(result.error || 'Código QR no válido para entrega de kit.');
        setTimeout(() => setActionErrorMessage(null), 4000);
      }
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

              <div className="w-full md:w-auto shrink-0 flex items-center">
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 text-black font-bebas text-lg sm:text-xl uppercase tracking-wider transition shadow-xl shadow-lime-400/25 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.02]"
                >
                  <Camera className="w-5 h-5 text-black stroke-[2.5]" />
                  <span>Escanear QR de Acreditación</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* APARTADO OFICIAL 7:15 PM: LLEGADA A META & MEDALLA FINISHER EN ENTRE JARRAS */}
        <div className={`p-6 sm:p-7 rounded-3xl border-2 transition-all shadow-2xl space-y-4 ${
          isPost715PM || competitor.finishedAtMeta
            ? 'bg-gradient-to-br from-neutral-900 via-amber-950/40 to-neutral-900 border-amber-400 shadow-amber-500/20'
            : 'bg-neutral-900/90 border-neutral-800'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-lg ${
                isPost715PM || competitor.finishedAtMeta
                  ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-black shadow-amber-500/30'
                  : 'bg-neutral-800 text-neutral-400'
              }`}>
                <Award className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isPost715PM || competitor.finishedAtMeta
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 animate-pulse'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}>
                    {isPost715PM || competitor.finishedAtMeta ? '🔴 Apartado Activo • 7:15 PM' : 'Apartado Programado • 7:15 PM'}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono hidden sm:inline">
                    Hora actual: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <h3 className="font-bebas text-2xl sm:text-3xl text-white uppercase tracking-wide leading-none mt-1">
                  Apartado 7:15 PM • Meta Oficial & Medalla Finisher
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-300 bg-neutral-950 px-3 py-1.5 rounded-xl border border-amber-500/30">
                📍 Entre Jarras (Av. Lima 1230)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
            {/* Left: Medal Image */}
            <div className="flex flex-col items-center justify-center bg-black/60 rounded-2xl p-4 border border-neutral-800">
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
                <img
                  src="/official-medal.png"
                  alt="Medalla Finisher Oficial OHANA GO 5K"
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(234,179,8,0.3)] hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-[10px] font-black uppercase text-amber-400 mt-2 tracking-wider">
                Medalla Finisher 5K Oficial
              </span>
            </div>

            {/* Right: Info and state */}
            <div className="md:col-span-2 space-y-3 text-xs">
              {isPost715PM || competitor.finishedAtMeta ? (
                <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/40 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>¡Punto de Meta & Entrega de Medalla Habilitado!</span>
                  </div>
                  <p className="text-neutral-200 leading-relaxed text-xs">
                    ¡Felicitaciones, <strong>{competitor.firstName} {competitor.lastName}</strong>! Has completado el recorrido nocturno de los 5K. Dirígete a la carpa de acreditación en <strong>Entre Jarras</strong> para recibir tu <strong>Medalla Oficial Finisher</strong> y disfrutar del after-race junto a la <strong>Ruleta de los 22 Premios</strong>.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-amber-300">
                    <span className="bg-black/50 px-2.5 py-1 rounded-lg border border-amber-500/30">
                      ✓ Atleta: {competitor.firstName} {competitor.lastName}
                    </span>
                    <span className="bg-black/50 px-2.5 py-1 rounded-lg border border-amber-500/30">
                      Ticket Ruleta #{competitor.registrationNumber || competitor.bibNumber || 1}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                  <div className="flex items-center gap-2 text-lime-400 font-bold text-sm">
                    <Clock className="w-4 h-4 text-lime-400" />
                    <span>Se activa automáticamente a las 7:15 PM</span>
                  </div>
                  <p className="text-neutral-300 leading-relaxed text-xs">
                    Al cruzar la meta en Entre Jarras a partir de las <strong>7:15 PM</strong>, este apartado confirmará tu acreditación como Finisher oficial. En este punto recibirás tu medalla conmemorativa de metal y se dará inicio al sorteo de los 22 premios oficiales con la Ruleta.
                  </p>
                  <div className="text-[11px] text-neutral-400 flex items-center gap-2 font-mono">
                    <Timer className="w-3.5 h-3.5 text-lime-400" />
                    <span>Itinerario: 5:30 PM (Plaza de Armas) → 7:00 PM (Partida) → 7:15 PM (Meta Entre Jarras)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
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
          allowManualInput={false}
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
