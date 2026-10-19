import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import {
  X,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  Camera,
  MapPin,
  Trophy,
  AlertCircle,
  QrCode,
  LogOut,
  Gift,
  Award,
} from 'lucide-react';
import { RunnerRegistration } from '../types/race';
import { OFFICIAL_POTION_LOCATIONS, MASTER_START_QR_TOKEN } from '../data/potionConfig';
import { QRScannerModal } from './QRScannerModal';

interface CompetitorPortalModalProps {
  runner: RunnerRegistration;
  onUpdateRunner: (updated: RunnerRegistration) => void;
  onClose: () => void;
  onLogout: () => void;
}

export const CompetitorPortalModal: React.FC<CompetitorPortalModalProps> = ({
  runner,
  onUpdateRunner,
  onClose,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'caldero' | 'partida' | 'dorsal'>('caldero');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerType, setScannerType] = useState<'start_checkin' | 'potion'>('potion');
  const [scannerNotice, setScannerNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [dorsalQrUrl, setDorsalQrUrl] = useState<string>('');
  const [recentFeed, setRecentFeed] = useState<any[]>([]);

  const collectedTokens = runner.potionsCollected || [];
  const totalCandies = runner.totalCandies || 0;

  // Generate runner's personal QR for staff scan
  useEffect(() => {
    const runnerPayload = `OHANA-RUNNER-${runner.documentNumber}-${runner.registrationNumber || runner.bibNumber}`;
    QRCode.toDataURL(runnerPayload, {
      width: 300,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    }).then((url) => setDorsalQrUrl(url));
  }, [runner]);

  // Fetch live potion activity from server
  useEffect(() => {
    fetch('/api/potions')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.recentFeed) {
          setRecentFeed(data.recentFeed);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenScanner = (type: 'start_checkin' | 'potion') => {
    setScannerType(type);
    setScannerNotice(null);
    setScannerOpen(true);
  };

  const handleScanSuccess = async (scannedCode: string) => {
    setScannerOpen(false);

    // 1. If scanning start check-in QR
    if (scannedCode === MASTER_START_QR_TOKEN || scannerType === 'start_checkin') {
      try {
        const res = await fetch('/api/start-checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            runnerId: runner.id,
            dorsal: runner.registrationNumber || runner.bibNumber,
            dni: runner.documentNumber,
            token: scannedCode,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          const updated = {
            ...runner,
            confirmedAtStart: true,
            startCheckinTime: data.runner?.startCheckinTime || new Date().toISOString(),
          };
          onUpdateRunner(updated);
          setScannerNotice({
            type: 'success',
            message: '¡Confirmación de partida completada! Tus datos han sido validados en la largada.',
          });
        } else {
          setScannerNotice({
            type: 'error',
            message: data.error || 'Código QR de partida no válido.',
          });
        }
      } catch (err) {
        setScannerNotice({
          type: 'error',
          message: 'Error de conexión al validar partida. Inténtalo nuevamente.',
        });
      }
      return;
    }

    // 2. If scanning potion QR
    try {
      const res = await fetch('/api/potions/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runnerId: runner.id,
          dorsal: runner.registrationNumber || runner.bibNumber,
          dni: runner.documentNumber,
          qrToken: scannedCode,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#a3e635', '#f97316', '#a855f7', '#06b6d4'],
        });

        const newCollected = [...collectedTokens];
        if (!newCollected.includes(scannedCode)) {
          newCollected.push(scannedCode);
        }

        const updated = {
          ...runner,
          totalCandies: data.totalCandies,
          potionsCollected: newCollected,
        };
        onUpdateRunner(updated);

        setScannerNotice({
          type: 'success',
          message: `${data.message}`,
        });

        // Refresh feed
        fetch('/api/potions')
          .then((r) => r.json())
          .then((d) => d.recentFeed && setRecentFeed(d.recentFeed));
      } else {
        setScannerNotice({
          type: 'error',
          message: data.error || 'Código no válido para el minijuego de pociones.',
        });
      }
    } catch (err) {
      setScannerNotice({
        type: 'error',
        message: 'Error al registrar poción. Verifica tu conexión a internet.',
      });
    }
  };

  const dorsalNumber = String(runner.registrationNumber || runner.bibNumber || 1).padStart(3, '0');

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-700 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        {/* Top bar */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-lime-400 text-black flex items-center justify-center font-bebas text-2xl font-bold shadow-lg shadow-lime-400/20">
              #{dorsalNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-lime-400">
                  Portal del Competidor
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    runner.paymentStatus === 'Verificado'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {runner.paymentStatus}
                </span>
              </div>
              <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide uppercase leading-tight">
                {runner.firstName} {runner.lastName}
              </h3>
              <p className="text-xs text-neutral-400">
                {runner.documentType}: <strong className="text-white">{runner.documentNumber}</strong> • Talla Polo:{' '}
                <strong className="text-lime-400">{runner.tShirtSize || 'M'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="p-2 text-neutral-400 hover:text-red-400 bg-neutral-800 hover:bg-neutral-800/80 rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5"
              title="Cerrar Sesión del Competidor"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white bg-neutral-800 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice feedback banner */}
        {scannerNotice && (
          <div
            className={`my-3 p-3 rounded-2xl text-xs flex items-center gap-2.5 transition ${
              scannerNotice.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/80 border border-amber-500/40 text-amber-200'
            }`}
          >
            {scannerNotice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <span className="flex-1 font-medium">{scannerNotice.message}</span>
            <button
              onClick={() => setScannerNotice(null)}
              className="text-neutral-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-2 py-3 border-b border-neutral-800 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('caldero')}
            className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'caldero'
                ? 'bg-gradient-to-r from-lime-400 to-lime-300 text-black shadow-md'
                : 'bg-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Minijuego: Caldero de Pociones ({collectedTokens.length}/5)
          </button>

          <button
            onClick={() => setActiveTab('partida')}
            className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'partida'
                ? 'bg-lime-400 text-black'
                : 'bg-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Check-in de Partida
            {runner.confirmedAtStart ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('dorsal')}
            className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'dorsal'
                ? 'bg-lime-400 text-black'
                : 'bg-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Mi Pase / Dorsal Digital
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* TAB 1: CALDERO DE POCIONES */}
          {activeTab === 'caldero' && (
            <div className="space-y-5">
              {/* Caldero Hero Box */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-neutral-900 to-black border-2 border-purple-500/40 p-5 sm:p-6 shadow-2xl">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-black uppercase mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      Zona de Recuperación Temática • Km 5 Entre Jarras
                    </div>
                    <h4 className="font-bebas text-3xl sm:text-4xl text-white tracking-wider uppercase">
                      El Gran Caldero de Pociones
                    </h4>
                    <p className="text-xs text-neutral-300 max-w-lg mt-1 leading-relaxed">
                      Al cruzar la meta, busca los <strong>5 Códigos QR</strong> distribuidos en el local (Hidratación, Panel de Fotos, Guardarropa, Aliados Estratégicos y Meta). ¡Cada escaneo te otorga dulces al azar para ganar el premio especial de OHANA GO!
                    </p>
                  </div>

                  {/* Candy counter score */}
                  <div className="bg-neutral-950/90 border border-purple-500/50 p-4 rounded-2xl text-center shrink-0 min-w-[140px] shadow-lg">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                      Tus Dulces Mágicos
                    </span>
                    <span className="font-bebas text-4xl sm:text-5xl text-lime-400 font-black block leading-none my-1">
                      {totalCandies}
                    </span>
                    <span className="text-[11px] font-semibold text-purple-300">
                      🍬 {collectedTokens.length} de 5 pociones
                    </span>
                  </div>
                </div>

                {/* Big Action button to scan potion */}
                <div className="mt-5 pt-4 border-t border-purple-900/60 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => handleOpenScanner('potion')}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-lime-400 to-lime-300 hover:from-lime-300 hover:to-lime-200 text-black font-bebas text-xl tracking-wider uppercase rounded-xl transition shadow-lg shadow-lime-400/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-5 h-5 text-black" />
                    Escanear Código QR de Poción
                  </button>

                  <p className="text-[11px] text-neutral-400 text-center sm:text-left">
                    💡 Apunta tu cámara al código QR físico ubicado en cada módulo.
                  </p>
                </div>
              </div>

              {/* 5 Potion Cards Grid */}
              <div>
                <h5 className="font-bebas text-xl text-white tracking-wider uppercase mb-3 flex items-center justify-between">
                  <span>Pociones Disponibles en la Zona ({collectedTokens.length}/5)</span>
                  <span className="text-xs font-sans text-neutral-400 lowercase">
                    {5 - collectedTokens.length} restantes
                  </span>
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {OFFICIAL_POTION_LOCATIONS.map((loc, idx) => {
                    const isCollected = collectedTokens.includes(loc.qrToken);
                    return (
                      <div
                        key={loc.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isCollected
                            ? 'bg-neutral-950 border-lime-500/60 shadow-lg shadow-lime-500/10'
                            : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bebas text-lg font-bold ${
                                isCollected
                                  ? 'bg-lime-400 text-black shadow-md shadow-lime-400/30'
                                  : 'bg-neutral-800 text-neutral-400'
                              }`}
                            >
                              #{idx + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h6 className="font-bebas text-xl text-white tracking-wide uppercase">
                                  {loc.potionName}
                                </h6>
                              </div>
                              <span className="text-xs text-neutral-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-lime-400" />
                                {loc.name}
                              </span>
                            </div>
                          </div>

                          {isCollected ? (
                            <span className="px-2.5 py-1 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/40 text-[10px] font-black uppercase flex items-center gap-1 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Recolectada
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-400 text-[10px] font-bold uppercase shrink-0">
                              Pendiente
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-neutral-400 mt-2 line-clamp-2">
                          {loc.description}
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-neutral-900 flex items-center justify-between text-[11px]">
                          <span className="text-neutral-500">
                            Zona: <strong className="text-neutral-300">{loc.zone}</strong>
                          </span>
                          <span className="text-amber-400 font-bold font-mono">
                            {loc.minCandies}-{loc.maxCandies} dulces de azar
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Admin exclusivity notice as requested by user */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 flex items-start gap-3">
                <Trophy className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-white block">
                    Reglas del Sorteo & Premiación por Azar
                  </span>
                  <p className="leading-relaxed">
                    Tus dulces acumulados se registran de forma segura en el servidor. Por transparencia y emoción,{' '}
                    <strong className="text-lime-400">
                      la Tabla Maestra de Posiciones completa con el total de dulces de todos los competidores es visible exclusivamente por la Administración
                    </strong>
                    , quien proclamará oficialmente al ganador del premio especial de OHANA GO durante la ceremonia en Entre Jarras.
                  </p>
                </div>
              </div>

              {/* Live activity feed from venue */}
              {recentFeed.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                    Actividad en Vivo en el Evento
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
                    {recentFeed.slice(0, 5).map((scan, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-neutral-300"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bebas text-sm text-lime-400">
                            Dorsal #{String(scan.dorsal).padStart(3, '0')}
                          </span>
                          <span className="text-white font-medium truncate max-w-[150px]">
                            {scan.runnerName}
                          </span>
                          <span className="text-neutral-500">•</span>
                          <span className="text-neutral-400 text-[11px] truncate max-w-[120px]">
                            {scan.locationName}
                          </span>
                        </div>
                        <span className="text-amber-400 font-bold font-mono text-[11px]">
                          +{scan.candies} 🍬
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHECK-IN DE PARTIDA */}
          {activeTab === 'partida' && (
            <div className="space-y-5">
              <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/10 text-lime-400 text-xs font-black uppercase">
                      <Clock className="w-3.5 h-3.5" />
                      Arco de Largada • 7:00 PM
                    </div>
                    <h4 className="font-bebas text-3xl text-white tracking-wider uppercase">
                      Validación y Confirmación de Asistencia
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed max-w-lg">
                      Ubicación: <strong>Plaza Mayor de Tarapoto</strong>. Al llegar a la partida, confirma tu presencia escaneando el código QR oficial del evento mostrado en los atriles de largada.
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <div className="text-center sm:text-right">
                    {runner.confirmedAtStart ? (
                      <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                        <span className="font-bebas text-xl text-white block">
                          CONFIRMADO EN PARTIDA
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold">
                          ✓ Datos Validados para Correr 5K
                        </span>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-amber-950/70 border border-amber-500/40 text-amber-300 text-center">
                        <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-1 animate-pulse" />
                        <span className="font-bebas text-xl text-white block">
                          PENDIENTE DE CONFIRMACIÓN
                        </span>
                        <span className="text-[10px] text-amber-300">
                          Escanea el QR al llegar a la largada
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {!runner.confirmedAtStart && (
                  <div className="mt-5 pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => handleOpenScanner('start_checkin')}
                      className="w-full sm:w-auto px-6 py-3 bg-lime-400 hover:bg-lime-300 text-black font-bebas text-xl tracking-wider uppercase rounded-xl transition shadow-lg shadow-lime-400/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-5 h-5 text-black" />
                      Escanear QR Oficial de Partida
                    </button>
                    <span className="text-xs text-neutral-400">
                      Escaneo instantáneo con la cámara de tu smartphone.
                    </span>
                  </div>
                )}
              </div>

              {/* Personal QR presentation */}
              <div className="p-5 rounded-3xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-center gap-5">
                <div className="bg-white p-2.5 rounded-2xl shrink-0 shadow-md">
                  {dorsalQrUrl ? (
                    <img src={dorsalQrUrl} alt="QR Corredor" className="w-28 h-28 object-contain" />
                  ) : (
                    <div className="w-28 h-28 bg-neutral-200" />
                  )}
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] font-black uppercase text-lime-400 tracking-wider">
                    QR Personal del Competidor
                  </span>
                  <h5 className="font-bebas text-2xl text-white">
                    Código Dorsal #{dorsalNumber}
                  </h5>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    También puedes mostrar este código al equipo de jueces o fotógrafos en la partida y llegada para verificar tus datos al instante.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DORSAL DIGITAL */}
          {activeTab === 'dorsal' && (
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-neutral-950 border-2 border-lime-400/40 shadow-2xl max-w-md mx-auto text-center space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <span className="font-bebas text-2xl text-white">
                    OHANA <span className="text-lime-400 font-bold">GO</span> 5K
                  </span>
                  <span className="text-[10px] font-black uppercase bg-orange-600 text-white px-2 py-0.5 rounded font-marker">
                    HALLOWEEN
                  </span>
                </div>

                <div className="py-2">
                  <span className="text-xs uppercase font-bold text-neutral-400 block tracking-widest">
                    NÚMERO DE CORREDOR
                  </span>
                  <div className="font-bebas text-7xl sm:text-8xl text-lime-400 font-black tracking-tight leading-none my-1">
                    {dorsalNumber}
                  </div>
                  <h4 className="font-bebas text-2xl text-white uppercase tracking-wider">
                    {runner.firstName} {runner.lastName}
                  </h4>
                </div>

                <div className="bg-black/60 p-3 rounded-2xl border border-neutral-800 text-xs text-neutral-300 space-y-1 text-left">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Documento:</span>
                    <span className="text-white font-mono">{runner.documentNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Categoría:</span>
                    <span className="text-lime-400 font-bold">5K General</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Talla Polo:</span>
                    <span className="text-white font-bold">{runner.tShirtSize || 'M'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Pociones:</span>
                    <span className="text-purple-300 font-bold">{collectedTokens.length}/5 ({totalCandies} dulces)</span>
                  </div>
                </div>

                {dorsalQrUrl && (
                  <div className="pt-2 flex flex-col items-center">
                    <div className="bg-white p-2 rounded-xl">
                      <img src={dorsalQrUrl} alt="Dorsal QR" className="w-32 h-32 object-contain" />
                    </div>
                    <span className="text-[10px] text-neutral-400 mt-2 font-mono">
                      Presentar en Entre Jarras para canje de Medalla
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Camera Scanner Modal */}
      {scannerOpen && (
        <QRScannerModal
          title={
            scannerType === 'start_checkin'
              ? 'Escanear QR de Partida'
              : 'Escanear Poción del Caldero'
          }
          subtitle={
            scannerType === 'start_checkin'
              ? 'Apunta tu cámara al código QR de la largada en Plaza de Armas.'
              : 'Apunta tu cámara al código QR ubicado en el módulo de Entre Jarras.'
          }
          expectedType={scannerType}
          onScanSuccess={handleScanSuccess}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  );
};
