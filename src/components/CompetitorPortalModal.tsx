import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  AlertCircle,
  QrCode,
  Globe,
  Truck,
  Upload,
  Activity,
  Calendar,
  LogOut
} from 'lucide-react';
import { RunnerRegistration, VirtualEvidence } from '../types/race';
import { DigitalBib } from './DigitalBib';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'bib' | 'evidence'>('overview');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  // Evidence Form for Virtual Runners
  const [evidenceData, setEvidenceData] = useState<VirtualEvidence>({
    appName: competitor.virtualEvidence?.appName || 'Strava',
    timeRecorded: competitor.virtualEvidence?.timeRecorded || '',
    distanceKm: competitor.virtualEvidence?.distanceKm || '5.00',
    proofImage: competitor.virtualEvidence?.proofImage || '',
  });
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);

  const isVirtual = competitor.modality === 'Virtual';

  const handleEvidenceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setActionErrorMessage('La imagen de evidencia no debe superar los 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidenceData(prev => ({ ...prev, proofImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceData.timeRecorded?.trim()) {
      setActionErrorMessage('Ingresa el tiempo registrado de tus 5K');
      return;
    }

    setIsSubmittingEvidence(true);
    setActionErrorMessage(null);

    const submission: VirtualEvidence = {
      ...evidenceData,
      submittedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/competitor/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runnerId: competitor.id,
          evidence: submission,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updated = data.runner || { ...competitor, virtualEvidence: submission };
        onUpdateCompetitor(updated);
        try {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}
        setActionSuccessMessage('¡Evidencia de tus 5K enviada exitosamente!');
        setTimeout(() => setActionSuccessMessage(null), 4000);
      } else {
        // Fallback local update
        const updated = { ...competitor, virtualEvidence: submission };
        onUpdateCompetitor(updated);
        setActionSuccessMessage('¡Evidencia registrada correctamente!');
        setTimeout(() => setActionSuccessMessage(null), 4000);
      }
    } catch (e) {
      const updated = { ...competitor, virtualEvidence: submission };
      onUpdateCompetitor(updated);
      setActionSuccessMessage('¡Evidencia registrada!');
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } finally {
      setIsSubmittingEvidence(false);
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
        setActionErrorMessage(data.error || 'Código QR no válido para partida.');
        setTimeout(() => setActionErrorMessage(null), 4000);
        return;
      }

      const updated = data.runner || { ...competitor, confirmedAtStart: true, startCheckinTime: new Date().toISOString() };
      onUpdateCompetitor(updated);
      try {
        window.dispatchEvent(new CustomEvent('ohana-checkin'));
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
      setActionSuccessMessage('¡Asistencia confirmada en la partida de la Plaza de Armas!');
      setTimeout(() => setActionSuccessMessage(null), 5000);
    } catch (err: any) {
      setActionErrorMessage('Error de conexión al validar check-in.');
      setTimeout(() => setActionErrorMessage(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-4">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-lime-400 text-black flex items-center justify-center shadow-lg shadow-lime-400/20">
              <User className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-lime-400 tracking-wider uppercase flex items-center gap-1">
                  Mi Espacio 🎒
                </span>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  isVirtual 
                    ? 'bg-purple-950/80 text-purple-300 border-purple-500/40' 
                    : 'bg-lime-950/80 text-lime-400 border-lime-500/40'
                }`}>
                  {isVirtual ? 'Modalidad Virtual' : 'Presencial Tarapoto'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide uppercase leading-none">
                  {competitor.firstName} {competitor.lastName}
                </h3>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {competitor.documentType}: <strong>{competitor.documentNumber}</strong> • {competitor.department || 'San Martín'} - {competitor.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar Sesión
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notices */}
        {actionSuccessMessage && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}
        {actionErrorMessage && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-2xl bg-red-950/90 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionErrorMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-4 border-b border-neutral-800 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-t-xl font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer border-b-2 ${
              activeTab === 'overview'
                ? 'text-lime-400 border-lime-400 bg-neutral-800/40'
                : 'text-neutral-400 border-transparent hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            Mi Información
          </button>

          {isVirtual ? (
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-4 py-2.5 rounded-t-xl font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer border-b-2 ${
                activeTab === 'evidence'
                  ? 'text-purple-400 border-purple-400 bg-neutral-800/40'
                  : 'text-neutral-400 border-transparent hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              Subir Evidencia 5K
            </button>
          ) : (
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-4 py-2.5 rounded-t-xl font-bold uppercase tracking-wider flex items-center gap-1.5 text-lime-400 hover:text-lime-300 transition cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              Escanear Check-in Largada
            </button>
          )}

          <button
            onClick={() => setActiveTab('bib')}
            className={`px-4 py-2.5 rounded-t-xl font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer border-b-2 ${
              activeTab === 'bib'
                ? 'text-lime-400 border-lime-400 bg-neutral-800/40'
                : 'text-neutral-400 border-transparent hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Pase Oficial Digital
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="p-4 sm:p-6 space-y-5">
            {/* Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <span className="text-[11px] font-bold text-neutral-400 uppercase block">Estado del Pago</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${
                    competitor.paymentStatus === 'Verificado'
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                      : 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                  }`}>
                    {competitor.paymentStatus}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-500 mt-1 block">Ref: {competitor.paymentReference}</span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <span className="text-[11px] font-bold text-neutral-400 uppercase block">Modalidad</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-bebas text-2xl text-white">
                    {competitor.modality || 'Presencial'}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 mt-0.5 block">
                  {isVirtual ? '5K desde tu ciudad' : '31 Oct • 7:00 PM Tarapoto'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <span className="text-[11px] font-bold text-neutral-400 uppercase block">
                  {isVirtual ? 'Evidencia Virtual 5K' : 'Asistencia en Largada'}
                </span>
                <div className="mt-1 flex items-center gap-2">
                  {isVirtual ? (
                    competitor.virtualEvidence?.proofImage || competitor.virtualEvidence?.timeRecorded ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-purple-950/80 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                        Evidencia Enviada ({competitor.virtualEvidence.timeRecorded || 'OK'})
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-neutral-800 text-neutral-400 border border-neutral-700">
                        Pendiente de Envío
                      </span>
                    )
                  ) : competitor.confirmedAtStart ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Check-in Confirmado
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-neutral-800 text-neutral-400 border border-neutral-700">
                      Pendiente en Plaza
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  {isVirtual ? 'Subir en pestaña Evidencia' : 'Escanea QR en partida'}
                </span>
              </div>
            </div>

            {/* Modality Specific Instructions Card */}
            {isVirtual ? (
              <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-950/60 via-neutral-900 to-neutral-950 border border-purple-500/40">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black uppercase mb-2">
                      <Globe className="w-3.5 h-3.5" />
                      Guía de Carrera Virtual 5K
                    </div>
                    <h4 className="font-bebas text-2xl text-white uppercase tracking-wide">
                      ¿Cómo completar tus 5 Kilómetros Virtuales?
                    </h4>
                    <ul className="mt-2 space-y-1.5 text-xs text-neutral-300">
                      <li className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span><strong>Fechas habilitadas:</strong> Corre entre el 28 de Octubre y el 2 de Noviembre.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span><strong>Apps recomendadas:</strong> Strava, Nike Run Club, Garmin, Reloj GPS o cualquier app deportiva.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span><strong>Envío de Medalla Finisher física y Kit:</strong> Se enviará a <strong>{competitor.shippingAddress || `${competitor.district}, ${competitor.city}, ${competitor.department}`}</strong>.</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setActiveTab('evidence')}
                    className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bebas text-lg uppercase tracking-wider transition shadow-lg shadow-purple-600/30 flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Subir Evidencia
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-3xl bg-gradient-to-br from-lime-950/40 via-neutral-900 to-neutral-950 border border-lime-400/40">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/10 text-lime-400 text-xs font-black uppercase mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      Carrera Presencial en Tarapoto
                    </div>
                    <h4 className="font-bebas text-2xl text-white uppercase tracking-wide">
                      31 de Octubre • 7:00 PM • Plaza de Armas de Tarapoto
                    </h4>
                    <p className="text-xs text-neutral-300 mt-1 max-w-xl">
                      Llega a la Plaza de Armas a partir de las 6:00 PM para recibir tus pulseras neón y registrar tu check-in en el arco de salida. La meta oficial es en Entre Jarras (Jr. Lima cda. 13) donde recibirás tu Medalla Finisher.
                    </p>
                  </div>

                  {!competitor.confirmedAtStart && (
                    <button
                      onClick={() => setIsScannerOpen(true)}
                      className="px-6 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-bebas text-lg uppercase tracking-wider transition shadow-lg shadow-lime-400/25 flex items-center gap-2 cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      Escanear QR de Partida
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Runner Registration Data Summary */}
            <div className="p-5 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-3">
              <h4 className="font-bebas text-xl text-white uppercase tracking-wide flex items-center gap-2">
                <User className="w-4 h-4 text-lime-400" />
                Ficha del Participante
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-neutral-500 block uppercase font-bold text-[10px]">Edad / Género</span>
                  <span className="text-white font-semibold">{competitor.age} años • {competitor.gender}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block uppercase font-bold text-[10px]">WhatsApp</span>
                  <span className="text-white font-semibold">{competitor.whatsapp}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block uppercase font-bold text-[10px]">Correo</span>
                  <span className="text-white font-semibold truncate block">{competitor.email}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block uppercase font-bold text-[10px]">Ubicación</span>
                  <span className="text-white font-semibold">{competitor.district}, {competitor.city}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block uppercase font-bold text-[10px]">Running Club</span>
                  <span className="text-white font-semibold">{competitor.runningClub || 'Independiente'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block uppercase font-bold text-[10px]">Concurso Disfraz</span>
                  <span className="text-white font-semibold">{competitor.willWearCostume ? (competitor.costumeName || 'Sí') : 'No'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block uppercase font-bold text-[10px]">Contacto Emergencia</span>
                  <span className="text-white font-semibold">{competitor.emergencyContactName} ({competitor.emergencyContactPhone})</span>
                </div>
                <div>
                  <span className="text-neutral-500 block uppercase font-bold text-[10px]">Grupo Sanguíneo</span>
                  <span className="text-white font-semibold">{competitor.bloodType || 'No especificado'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Virtual Evidence Submission */}
        {activeTab === 'evidence' && (
          <div className="p-4 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h4 className="font-bebas text-2xl text-white uppercase tracking-wide">
                  Envío de Evidencia • 5K Virtual
                </h4>
                <p className="text-xs text-neutral-400">
                  Sube el tiempo y captura de tu carrera 5K realizada del 28 de Octubre al 2 de Noviembre.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEvidence} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Aplicación o Dispositivo Utilizado *
                  </label>
                  <select
                    value={evidenceData.appName}
                    onChange={(e) => setEvidenceData({ ...evidenceData, appName: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-400 transition"
                  >
                    <option value="Strava">Strava</option>
                    <option value="Nike Run Club">Nike Run Club</option>
                    <option value="Garmin Connect">Garmin Connect</option>
                    <option value="Apple Fitness">Apple Fitness / Watch</option>
                    <option value="Adidas Running">Adidas Running</option>
                    <option value="Trotadora / Cinta">Trotadora / Gym</option>
                    <option value="Otra App">Otra Aplicación</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Tiempo Registrado (Ej: 24:35 min) *
                  </label>
                  <input
                    type="text"
                    value={evidenceData.timeRecorded}
                    onChange={(e) => setEvidenceData({ ...evidenceData, timeRecorded: e.target.value })}
                    placeholder="Ej: 25:10 min"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-400 transition"
                  />
                </div>
              </div>

              {/* Upload Screenshot */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Captura de Pantalla o Foto del Recorrido 5K *
                </label>
                <div className="border border-dashed border-neutral-700 hover:border-purple-400 rounded-2xl p-4 text-center bg-neutral-950/60 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEvidenceImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {evidenceData.proofImage ? (
                    <div className="flex items-center justify-center gap-3">
                      <img
                        src={evidenceData.proofImage}
                        alt="Evidencia 5K"
                        className="w-16 h-16 object-cover rounded-xl border border-purple-400"
                      />
                      <div className="text-left">
                        <span className="text-xs text-purple-300 font-bold block">Captura de 5K lista</span>
                        <span className="text-[10px] text-neutral-400">Clic para cambiar imagen</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <Upload className="w-5 h-5 text-neutral-400" />
                      <span className="text-xs text-neutral-300 font-semibold">Subir captura de pantalla de Strava/Nike/Garmin</span>
                      <span className="text-[10px] text-neutral-500">JPG, PNG hasta 5MB</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingEvidence}
                  className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bebas text-xl uppercase tracking-wider rounded-xl transition shadow-lg shadow-purple-600/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingEvidence ? 'Guardando Evidencia...' : 'Confirmar y Guardar Evidencia 5K'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Digital Bib */}
        {activeTab === 'bib' && (
          <div className="p-4 sm:p-6 flex flex-col items-center">
            <DigitalBib registration={competitor} />
          </div>
        )}

      </div>

      {/* QR Scanner for Start Check-in */}
      {isScannerOpen && (
        <QRScannerModal
          title="Validar Asistencia en Partida • Plaza de Armas"
          subtitle="Apunta con la cámara al código QR oficial del arco de largada."
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
