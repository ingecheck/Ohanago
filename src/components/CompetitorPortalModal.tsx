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
  Timer,
  Gift,
  Upload,
  Image as ImageIcon,
  FileText,
  X,
  Eye
} from 'lucide-react';
import { RunnerRegistration } from '../types/race';
import { QRScannerModal } from './QRScannerModal';
import { processStartCheckinSafe } from '../utils/checkinManager';
import { DigitalBib } from './DigitalBib';

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
  const isSantaRun = competitor.edition === 'santa-run-2026' || competitor.id.startsWith('SR-');

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

  const [showCompetitorVoucherModal, setShowCompetitorVoucherModal] = useState(false);
  const [isUploadingVoucher, setIsUploadingVoucher] = useState(false);

  const handleCompetitorUploadVoucher = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingVoucher(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawData = event.target?.result as string;
      let finalData = rawData;

      if (file.type.startsWith('image/')) {
        try {
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = rawData;
          });
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            finalData = canvas.toDataURL('image/jpeg', 0.82);
          }
        } catch (e) {}
      }

      // 1. Try server upload
      try {
        const res = await fetch('/api/upload-voucher', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            runnerId: competitor.id,
            voucherImage: finalData,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.voucherUrl) {
            finalData = data.voucherUrl;
          }
        }
      } catch (err) {}

      const updatedRunner: RunnerRegistration = {
        ...competitor,
        voucherUrl: finalData,
        paymentProofImage: finalData,
      };

      onUpdateCompetitor(updatedRunner);
      setIsUploadingVoucher(false);
      setActionSuccessMessage('✓ ¡Comprobante Yape adjuntado! Nuestro equipo lo revisará para marcar tu pago como Verificado.');
      setTimeout(() => setActionSuccessMessage(null), 5500);
    };
    reader.readAsDataURL(file);
  };

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
    <div className="fixed inset-0 z-50 bg-black overflow-y-auto min-h-screen text-neutral-100 flex flex-col selection:bg-red-500 selection:text-white">
      {/* Top Sticky Header Bar: Fluid and natural, no boxed modal borders */}
      <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-red-500/30 px-4 sm:px-8 py-3.5 shadow-xl">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-red-400 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-red-500/40 shadow-sm"
              title="Regresar a la página de inicio"
            >
              <ArrowLeft className="w-4 h-4 text-red-400" />
              <span>Volver a Inicio</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center text-sm shadow">
                🎒
              </span>
              <span className="font-bebas text-xl sm:text-2xl text-white tracking-wide uppercase leading-none">
                Mi Espacio • <span className="text-red-500">Verificación Oficial</span>
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
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{actionErrorMessage}</span>
          </div>
        )}

        {/* Runner Welcome Identification Banner */}
        <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-red-950/70 via-neutral-950 to-red-950/70 border border-red-500/40 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-red-300 bg-red-900/70 px-2.5 py-0.5 rounded-full border border-red-500/40 tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Atleta Inscrito
              </span>
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                isVirtual 
                  ? 'bg-neutral-900 text-neutral-300 border-neutral-700' 
                  : 'bg-red-950 text-red-400 border-red-500/40'
              }`}>
                {isVirtual ? 'Modalidad Virtual' : 'Presencial Tarapoto'}
              </span>
            </div>
            <h2 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide uppercase leading-tight pt-1">
              {competitor.firstName} {competitor.lastName}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300">
              DNI: <strong className="text-amber-400 font-mono text-base">{competitor.documentNumber}</strong> • Código: <strong className="text-white font-mono">{competitor.id}</strong>
            </p>
          </div>

          <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800 gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Estado del Pago</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border mt-1 inline-flex items-center gap-1.5 ${
                competitor.paymentStatus === 'Verificado'
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50'
                  : 'bg-amber-950/80 text-amber-400 border-amber-500/50'
              }`}>
                {competitor.paymentStatus === 'Verificado' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
                {competitor.paymentStatus || 'Pendiente de Verificación'}
              </span>
              {competitor.paymentStatus !== 'Verificado' && (
                <span className="text-[10px] text-amber-300/90 block mt-1 max-w-[230px]">
                  Se validará manualmente al revisar tu voucher o envío por WhatsApp (+51 902 227 356).
                </span>
              )}
            </div>

            {/* Voucher status / upload */}
            <div>
              {competitor.voucherUrl || competitor.paymentProofImage ? (
                <button
                  type="button"
                  onClick={() => setShowCompetitorVoucherModal(true)}
                  className="px-2.5 py-1 rounded-xl bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 text-[11px] font-bold flex items-center gap-1.5 hover:bg-emerald-900 transition cursor-pointer shadow-sm"
                  title="Ver comprobante Yape que adjuntaste"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>🧾 Ver Voucher Yape</span>
                </button>
              ) : (
                <label className="px-2.5 py-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 hover:border-red-500 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition shadow-sm">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isUploadingVoucher ? 'Subiendo...' : '+ Adjuntar Voucher Yape'}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleCompetitorUploadVoucher}
                    disabled={isUploadingVoucher}
                    className="hidden"
                  />
                </label>
              )}
            </div>
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
                    Acreditación en Aviación
                  </span>
                  <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide uppercase mt-1 leading-none">
                    ¡Kit Oficial Entregado y Asistencia Confirmada!
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-xl leading-relaxed">
                    Tu entrega de kit oficial (polo, gorro Santa, mochila, hidratación y acreditación) ya está registrada en el sistema del organizador en tiempo real.
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
            <div className="p-6 sm:p-8 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black border-2 border-red-500/80 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black shrink-0 shadow-xl shadow-red-600/30">
                  <Camera className="w-8 h-8 stroke-[2.5]" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-950/60 text-red-300 text-[10px] font-black uppercase tracking-wider border border-red-500/40">
                    Punto de Acreditación • Aviación
                  </span>
                  <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide uppercase mt-1 leading-tight">
                    Entrega de Kit Oficial (Check-in QR)
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-xl leading-relaxed">
                    Al llegar a Aviación, escanea el código QR con el personal para confirmar tu asistencia y recibir tu Kit Navideño Oficial.
                  </p>
                </div>
              </div>

              <div className="w-full md:w-auto shrink-0 flex items-center">
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bebas text-lg sm:text-xl uppercase tracking-wider transition shadow-xl shadow-red-600/25 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.02] font-black"
                >
                  <Camera className="w-5 h-5 text-white stroke-[2.5]" />
                  <span>Escanear QR con el Personal</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* APARTADO OFICIAL: LLEGADA A META & MEDALLA FINISHER OFICIAL (CONCHA ACÚSTICA) */}
        <div className={`p-6 sm:p-7 rounded-3xl border-2 transition-all shadow-2xl space-y-4 ${
          isPost715PM || competitor.finishedAtMeta
            ? 'bg-gradient-to-br from-neutral-900 via-red-950/40 to-neutral-900 border-red-500 shadow-red-500/20'
            : 'bg-neutral-900/90 border-neutral-800'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-lg ${
                isPost715PM || competitor.finishedAtMeta
                  ? 'bg-gradient-to-br from-red-600 to-rose-600 text-white shadow-red-600/30'
                  : 'bg-neutral-800 text-neutral-400'
              }`}>
                <Award className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isPost715PM || competitor.finishedAtMeta
                      ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}>
                    {isPost715PM || competitor.finishedAtMeta ? '🔴 Meta Activa • Concha Acústica' : 'Llegada Oficial • 7:45 PM'}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono hidden sm:inline">
                    Hora actual: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <h3 className="font-bebas text-2xl sm:text-3xl text-white uppercase tracking-wide leading-none mt-1">
                  Meta Oficial • Concha Acústica & Medalla Finisher
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-300 bg-neutral-950 px-3 py-1.5 rounded-xl border border-amber-500/30">
                📍 Concha Acústica de Tarapoto
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
            {/* Left: Official Santa Run Finisher Medal */}
            <div className="flex flex-col items-center justify-center bg-black/80 rounded-2xl p-4 border border-red-500/30 shadow-inner">
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
                <img
                  src="/official-medal.png"
                  alt="Medalla Finisher Oficial Santa Run Tarapoto 2026"
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(212,36,38,0.35)] hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-[10px] font-black uppercase text-amber-400 mt-2 tracking-wider text-center">
                Medalla Finisher Oficial Santa Run 2026
              </span>
            </div>

            {/* Right: Info, Arrival & Turkey Lottery details */}
            <div className="md:col-span-2 space-y-3 text-xs">
              {isPost715PM || competitor.finishedAtMeta ? (
                <div className="p-4 rounded-2xl bg-red-950/50 border border-red-500/40 space-y-2.5">
                  <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>¡Meta Habilitada en la Concha Acústica!</span>
                  </div>
                  <p className="text-neutral-200 leading-relaxed text-xs">
                    ¡Felicitaciones, <strong>{competitor.firstName} {competitor.lastName}</strong>! Has completado el recorrido festivo de la Santa Run 2026. Acércate a la zona de coronación en la <strong>Concha Acústica</strong> para recibir tu <strong>Medalla Oficial Finisher</strong>, hidratarte y participar en el gran <strong>Sorteo del Pavo Navideño</strong>.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-amber-300">
                    <span className="bg-black/60 px-2.5 py-1 rounded-lg border border-red-500/30">
                      🎅 Atleta: {competitor.firstName} {competitor.lastName}
                    </span>
                    <span className="bg-black/60 px-2.5 py-1 rounded-lg border border-amber-500/30 text-amber-400">
                      🦃 Ticket Pavo: {competitor.turkeyRaffleTicket || `PAVO-${competitor.id}`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                  <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                    <Clock className="w-4 h-4 text-red-400" />
                    <span>Llegada Oficial a partir de las 7:45 PM</span>
                  </div>
                  <p className="text-neutral-300 leading-relaxed text-xs">
                    Al cruzar la meta en la <strong>Concha Acústica</strong>, el equipo de cronometraje registrará tu llegada oficial y se te colocará la <strong>Medalla Finisher Oficial Santa Run Tarapoto 2026</strong>. Inmediatamente después comenzará el sorteo del pavo navideño.
                  </p>
                  <div className="text-[11px] text-neutral-400 flex items-center gap-2 font-mono">
                    <Timer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ruta: 6:00 PM (Aviación) → 7:00 PM (Partida) → 7:45 PM (Concha Acústica)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DIGITAL BIB & ACCREDITATION QR CARD */}
        <div className="py-2 flex flex-col items-center">
          <div className="text-center mb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold block mb-1 text-red-400">
              🎅 SANTA RUN TARAPOTO 2026
            </span>
            <h3 className="font-bebas text-3xl sm:text-4xl text-white uppercase tracking-wide">
              Dorsal Navideño & Ticket Sorteo Pavo
            </h3>
            <p className="text-xs text-neutral-300 max-w-md mx-auto mt-0.5">
              Escanea este código QR con el personal en Aviación para confirmar tu asistencia y recibir tu Kit Navideño Oficial.
            </p>
          </div>
          <DigitalBib registration={competitor} showActions={true} />
        </div>

        {/* Clean Official Verification Card */}
        <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-500" />
              <h3 className="font-bebas text-2xl text-white uppercase tracking-wide">
                Ficha Oficial de Verificación • Santa Run 2026
              </h3>
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              Participante N° <strong className="text-red-400">{competitor.registrationNumber || competitor.id}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80">
              <span className="text-neutral-500 block uppercase font-bold text-[10px]">Documento de Identidad (DNI)</span>
              <span className="font-black font-mono text-base block mt-0.5 text-amber-400">
                {competitor.documentNumber}
              </span>
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

            {isSantaRun ? (
              <>
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/60 to-neutral-950 border border-red-500/40">
                  <span className="text-red-400 block uppercase font-bold text-[10px] flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5" /> Ticket Sorteo del Pavo
                  </span>
                  <span className="text-amber-300 font-black font-mono text-base block mt-0.5">
                    {competitor.turkeyRaffleTicket || `PAVO-${competitor.id}`}
                  </span>
                  <span className="text-[10px] text-neutral-400">Válido en la Concha Acústica</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80">
                  <span className="text-neutral-500 block uppercase font-bold text-[10px]">Polo Dry-Fit Talla</span>
                  <span className="text-white font-bold text-sm block mt-0.5">
                    Talla {competitor.tShirtSize || 'M'} + Gorra Navideña + Mochila
                  </span>
                  <span className="text-[10px] text-neutral-400">Kit Navideño Oficial</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80">
                  <span className="text-neutral-500 block uppercase font-bold text-[10px]">Ruta & Largada</span>
                  <span className="text-white font-bold text-xs block mt-0.5">Aviación → Concha Acústica</span>
                  <span className="text-[10px] text-red-400 font-mono">Sábado 19 Dic • 7:00 PM</span>
                </div>
              </>
            ) : (
              <>
                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80">
                  <span className="text-neutral-500 block uppercase font-bold text-[10px]">Modalidad</span>
                  <span className="text-white font-bold text-sm block mt-0.5">6K Presencial Tarapoto</span>
                  <span className="text-[10px] text-neutral-400">Aviación</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80">
                  <span className="text-neutral-500 block uppercase font-bold text-[10px]">Kit Inicial</span>
                  <div className="mt-0.5">
                    {competitor.confirmedAtStart ? (
                      <span className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Entregado en Aviación
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
              </>
            )}
          </div>

          {/* Event Schedule & Instructions Note - 100% Festive Santa Theme, Zero Purple */}
          <div className="p-5 rounded-2xl bg-neutral-950 border border-red-500/40 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-neutral-850 pb-2.5">
              <div className="flex items-center gap-2 font-bold text-red-400 text-sm">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className="font-bebas text-lg uppercase tracking-wide text-white">
                  Cronograma Oficial • Santa Run Tarapoto 2026 (Sábado 19 de Diciembre)
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-500/40">
                19 DIC 2026
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>6:00 PM • Concentración & Entrega de Kit</span>
                </div>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  Recepción de corredores en <strong>Aviación</strong>. Escaneo de QR con el personal y entrega de Polo oficial, Gorra de Santa, Mochila e Hidratación.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>6:30 PM • Calentamiento & Fotos Oficiales</span>
                </div>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  Activación festiva, música y calentamiento dinámico guiado por los Santa Pacers oficiales antes de ubicarse en los corrales de largada.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1">
                <div className="flex items-center gap-1.5 text-red-400 font-bold">
                  <Timer className="w-3.5 h-3.5 text-red-400" />
                  <span>7:00 PM • Largada Oficial 6K</span>
                </div>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  Conteo regresivo y partida nocturna de la marea roja desde <strong>Aviación</strong> rumbo al asfalto de Tarapoto.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>7:45 PM • Meta en Concha Acústica</span>
                </div>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  Cruce de meta en la <strong>Concha Acústica de Tarapoto</strong>. Entrega inmediata de la <strong>Medalla Finisher Oficial</strong> y rehidratación.
                </p>
              </div>
            </div>

            {/* Sorteo del Pavo Navideño Highlight */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/70 via-neutral-900 to-amber-950/40 border border-red-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">🦃</span>
                <div>
                  <strong className="text-white block font-sans">8:15 PM • Gran Sorteo en Vivo de un Pavo Navideño</strong>
                  <span className="text-[11px] text-neutral-400">
                    En el escenario principal de la Concha Acústica. Tu ticket oficial es:{' '}
                    <span className="text-amber-400 font-mono font-bold">
                      {competitor.turkeyRaffleTicket || `PAVO-${competitor.id}`}
                    </span>
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-red-900/60 text-red-200 border border-red-500/40 text-[10px] font-bold uppercase shrink-0">
                En Escenario
              </span>
            </div>
          </div>
        </div>

        {/* Generous bottom spacing area so nothing is clipped or obstructed on mobile/desktop */}
        <div className="pt-6 pb-20 text-center">
          <p className="text-xs text-neutral-500 font-mono">
            OHANA GO • SANTA RUN TARAPOTO 2026 • Ficha Oficial de Participación
          </p>
        </div>
      </main>

      {/* QR Scanner Modal for Kit Delivery Check-in */}
      {isScannerOpen && (
        <QRScannerModal
          title="Escáner QR • Entrega de Kit Navideño"
          subtitle="Apunta la cámara al código QR oficial en el stand de acreditación en Aviación con el personal."
          expectedType="start_checkin"
          allowManualInput={false}
          onScanSuccess={(token) => {
            setIsScannerOpen(false);
            handleStartQRScan(token);
          }}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {/* Modal: Competitor View Voucher */}
      {showCompetitorVoucherModal && (competitor.voucherUrl || competitor.paymentProofImage) && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-neutral-900 border-2 border-emerald-500/60 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowCompetitorVoucherModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                Tu Comprobante Oficial Yape
              </span>
              <h4 className="font-bebas text-2xl text-white uppercase mt-1 leading-tight">
                Voucher de Inscripción
              </h4>
              <p className="text-xs text-neutral-400">
                {competitor.firstName} {competitor.lastName} • DNI: {competitor.documentNumber}
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black border border-neutral-800 min-h-[220px] max-h-[60vh] flex items-center justify-center p-2">
              <img
                src={competitor.voucherUrl || competitor.paymentProofImage}
                alt="Comprobante de pago Yape"
                className="max-h-[58vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-neutral-800 text-xs">
              <span className="text-neutral-400">Canal: Yape (963 408 328 - Gisela Santa Cruz)</span>
              <button
                type="button"
                onClick={() => setShowCompetitorVoucherModal(false)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
