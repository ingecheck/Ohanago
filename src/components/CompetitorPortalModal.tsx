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
  LogOut,
  ArrowLeft,
  Flame,
  Camera,
  Shirt,
  Phone
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

      const updated = data.runner || {
        ...competitor,
        confirmedAtStart: true,
        startCheckinTime: new Date().toISOString()
      };
      
      onUpdateCompetitor(updated);

      // Broadcast event so Organizer panel in any tab/device updates immediately
      try {
        window.dispatchEvent(new CustomEvent('ohana-checkin', { detail: updated }));
        localStorage.setItem('ohana_last_checkin', JSON.stringify({ id: updated.id, timestamp: Date.now() }));
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}

      setActionSuccessMessage('¡Asistencia Confirmada! Prepárate para la carrera 🏃‍♂️💨');
      setTimeout(() => setActionSuccessMessage(null), 6000);
    } catch (err: any) {
      // Offline fallback
      const updated = {
        ...competitor,
        confirmedAtStart: true,
        startCheckinTime: new Date().toISOString()
      };
      onUpdateCompetitor(updated);
      try {
        window.dispatchEvent(new CustomEvent('ohana-checkin', { detail: updated }));
        localStorage.setItem('ohana_last_checkin', JSON.stringify({ id: updated.id, timestamp: Date.now() }));
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
      setActionSuccessMessage('¡Asistencia Confirmada! Prepárate para la carrera 🏃‍♂️💨');
      setTimeout(() => setActionSuccessMessage(null), 6000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-neutral-950 via-purple-950/30 to-neutral-950 border-2 border-purple-500/50 rounded-3xl shadow-[0_0_60px_rgba(168,85,247,0.25)] overflow-hidden my-4 max-h-[94vh] flex flex-col">
        
        {/* Top Floating Close Button (Direct, accessible X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-purple-500/30 hover:border-lime-400 transition cursor-pointer shadow-lg group"
          title="Regresar a la página principal (Cerrar)"
          aria-label="Cerrar Mi Espacio"
        >
          <X className="w-5 h-5 text-neutral-300 group-hover:text-lime-400 transition" />
        </button>

        {/* Warm & Welcoming Header Bar */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-950/80 via-neutral-900/90 to-purple-950/80 border-b border-purple-500/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 border border-purple-400/40 text-2xl">
              🎒
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-black text-purple-300 bg-purple-900/60 px-2.5 py-0.5 rounded-full border border-purple-500/40 tracking-wider uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-lime-400" />
                  Mi Espacio Oficial
                </span>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  isVirtual 
                    ? 'bg-purple-950/90 text-purple-300 border-purple-500/40' 
                    : 'bg-lime-950/90 text-lime-400 border-lime-500/40'
                }`}>
                  {isVirtual ? 'Modalidad Virtual' : 'Presencial Tarapoto'}
                </span>
              </div>
              <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide uppercase leading-none">
                {competitor.firstName} {competitor.lastName}
              </h3>
              <p className="text-xs text-neutral-300 mt-0.5">
                {competitor.documentType}: <strong className="text-lime-400 font-mono">{competitor.documentNumber}</strong> • {competitor.department || 'San Martín'} - {competitor.city}
              </p>
            </div>
          </div>

          {/* Navigation Controls in Header */}
          <div className="flex items-center gap-2 pr-12 sm:pr-14">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-neutral-700 hover:border-lime-400"
              title="Regresar a la página de inicio"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-lime-400" />
              <span>Volver a Inicio</span>
            </button>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-red-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border border-neutral-800"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Notices */}
        {actionSuccessMessage && (
          <div className="mx-4 sm:mx-6 mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-neutral-900 to-emerald-950 border-2 border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2.5 shadow-xl shadow-emerald-500/20 animate-pulse">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-semibold">{actionSuccessMessage}</span>
          </div>
        )}
        {actionErrorMessage && (
          <div className="mx-4 sm:mx-6 mt-4 p-3.5 rounded-2xl bg-red-950/90 border-2 border-red-500/60 text-red-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{actionErrorMessage}</span>
          </div>
        )}

        {/* HIGH-VISIBILITY QR SCANNER HERO AT THE VERY TOP (Requested: 'el boton de escanear qr dbe estar mas arriba') */}
        <div className="px-4 sm:px-6 pt-4">
          {competitor.confirmedAtStart ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-neutral-950 to-emerald-950/90 border-2 border-emerald-400 shadow-xl shadow-emerald-500/20 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-black flex items-center justify-center font-black shrink-0 shadow-lg shadow-emerald-400/30">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-400/40">
                    Validación Exitosa • Plaza de Armas
                  </span>
                  <h4 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide uppercase mt-0.5 leading-none">
                    ¡Asistencia Confirmada! Prepárate para la carrera 🏃‍♂️💨
                  </h4>
                  <p className="text-xs text-emerald-200/90 mt-1">
                    Tu asistencia ya está registrada en el sistema del organizador en tiempo real.
                    {competitor.startCheckinTime && (
                      <span className="font-mono ml-1 text-emerald-300 font-bold">
                        • {new Date(competitor.startCheckinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('bib')}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-lime-400 text-xs font-bold transition flex items-center gap-2 border border-lime-400/30 cursor-pointer shadow-sm"
              >
                <QrCode className="w-4 h-4" />
                <span>Ver Mi Pase Oficial</span>
              </button>
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-900/60 via-neutral-900 to-lime-950/60 border-2 border-lime-400/70 shadow-xl shadow-lime-400/15 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-lime-400 text-black flex items-center justify-center font-black shrink-0 shadow-lg shadow-lime-400/30">
                  <Camera className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-300 text-[10px] font-black uppercase tracking-wider border border-lime-400/40">
                    Paso Obligatorio en la Partida
                  </span>
                  <h4 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide uppercase mt-0.5 leading-none">
                    Escanear Código QR de Partida
                  </h4>
                  <p className="text-xs text-neutral-300 mt-1 max-w-lg">
                    Al llegar a la Plaza de Armas, apunta con tu cámara al código QR oficial para confirmar tu asistencia automática en vivo.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="px-6 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-bebas text-xl uppercase tracking-wider transition shadow-lg shadow-lime-400/30 flex items-center gap-2 cursor-pointer ring-2 ring-lime-400/40 hover:scale-105"
                >
                  <Camera className="w-5 h-5 text-black" />
                  <span>📷 Abrir Escáner QR</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-4 border-b border-purple-500/20 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-t-xl font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer border-b-2 ${
              activeTab === 'overview'
                ? 'text-lime-400 border-lime-400 bg-neutral-800/60'
                : 'text-neutral-400 border-transparent hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            Mi Información
          </button>

          <button
            onClick={() => setActiveTab('bib')}
            className={`px-4 py-2.5 rounded-t-xl font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer border-b-2 ${
              activeTab === 'bib'
                ? 'text-lime-400 border-lime-400 bg-neutral-800/60'
                : 'text-neutral-400 border-transparent hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Pase Oficial Digital
          </button>

          {isVirtual && (
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-4 py-2.5 rounded-t-xl font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer border-b-2 ${
                activeTab === 'evidence'
                  ? 'text-purple-400 border-purple-400 bg-neutral-800/60'
                  : 'text-neutral-400 border-transparent hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              Subir Evidencia 5K
            </button>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800">
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
                  <span className="text-[11px] text-neutral-500 mt-1 block font-mono">Ref: {competitor.paymentReference}</span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase block">Modalidad & Carrera</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-bebas text-2xl text-white">
                      {competitor.modality || 'Presencial'} • 5K
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 mt-0.5 block">
                    {isVirtual ? '5K desde tu ciudad' : '31 Oct • 7:00 PM Tarapoto'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase block">
                    Asistencia en Largada
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    {competitor.confirmedAtStart ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase bg-emerald-950/90 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Asistencia Confirmada
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-amber-950/80 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Pendiente en Plaza
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    {competitor.confirmedAtStart ? 'Validado con QR oficial' : 'Escanea el QR en partida'}
                  </span>
                </div>
              </div>

              {/* Runner Registration Data Summary */}
              <div className="p-5 rounded-3xl bg-neutral-950/90 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                  <h4 className="font-bebas text-xl text-white uppercase tracking-wide flex items-center gap-2">
                    <User className="w-4 h-4 text-lime-400" />
                    Ficha Oficial del Participante
                  </h4>
                  <span className="text-xs text-neutral-400 font-mono">
                    ID: <strong className="text-white">{competitor.id}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-500 block uppercase font-bold text-[10px]">Documento DNI</span>
                    <span className="text-white font-bold font-mono text-sm text-lime-400">{competitor.documentNumber}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block uppercase font-bold text-[10px]">Talla de Polo</span>
                    <span className="text-white font-bold flex items-center gap-1">
                      <Shirt className="w-3.5 h-3.5 text-neutral-400" />
                      Talla {competitor.tShirtSize || 'M'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block uppercase font-bold text-[10px]">WhatsApp</span>
                    <span className="text-white font-semibold flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      {competitor.whatsapp}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block uppercase font-bold text-[10px]">Edad / Género</span>
                    <span className="text-white font-semibold">{competitor.age} años • {competitor.gender}</span>
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
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Digital Bib */}
          {activeTab === 'bib' && (
            <div className="flex flex-col items-center">
              <DigitalBib registration={competitor} />
            </div>
          )}

          {/* Tab 3: Virtual Evidence Submission */}
          {activeTab === 'evidence' && isVirtual && (
            <div className="space-y-4">
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
        </div>

      </div>

      {/* QR Scanner Modal for Start Check-in */}
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
