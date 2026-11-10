import React, { useState, useEffect } from 'react';
import { RunnerRegistration, PaymentStatus, RaceModality } from '../types/race';
import { saveRegistrations, getStoredRegistrations } from '../data/initialRegistrations';
import { adminLogout, updateAdminPassword } from '../data/auth';
import { processStartCheckinSafe, subscribeToRegistrationsFirestore, cleanFirestoreData } from '../utils/checkinManager';
import { resetAnalyticsSafe } from '../utils/analytics';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { QRScannerModal } from './QRScannerModal';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  LogOut,
  KeyRound,
  Check,
  Camera,
  QrCode,
  MapPin,
  RefreshCw,
  Phone,
  DollarSign,
  Maximize2,
  Minimize2,
  Printer,
  ArrowLeft,
  PackageCheck,
  Pencil,
  BarChart3,
  Eye,
  Activity,
  MousePointerClick,
  Trophy,
  Download,
  FileSpreadsheet,
  Database,
  Gift,
  Image as ImageIcon
} from 'lucide-react';
import { AdminAnalyticsTab } from './AdminAnalyticsTab';
import { AdminRouletteModal } from './AdminRouletteModal';
import { SantaTurkeyLotteryModal } from './SantaTurkeyLotteryModal';
import { fetchAnalytics, AnalyticsSummary } from '../utils/analytics';
import { getStoredRouletteState } from '../utils/rouletteManager';
import { exportToNativeXLSX } from '../services/googleWorkspaceService';

interface AdminDashboardProps {
  registrations: RunnerRegistration[];
  onUpdateRegistrations: (updated: RunnerRegistration[]) => void;
  onClose: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  registrations,
  onUpdateRegistrations,
  onClose,
  onLogout,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCheckin, setFilterCheckin] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [filterEdition, setFilterEdition] = useState<'all' | 'santa-run-2026' | 'halloween-5k-2026'>('santa-run-2026');
  const [showTurkeyLottery, setShowTurkeyLottery] = useState(false);

  // Modals
  const [scannedRunnerModal, setScannedRunnerModal] = useState<RunnerRegistration | null>(null);
  const [viewingVoucherRunner, setViewingVoucherRunner] = useState<RunnerRegistration | null>(null);

  // Edit Runner DNI/Phone modal
  const [editingRunner, setEditingRunner] = useState<RunnerRegistration | null>(null);
  const [editDniValue, setEditDniValue] = useState('');
  const [editPhoneValue, setEditPhoneValue] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleSaveRunnerEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRunner) return;
    setIsSavingEdit(true);

    const newDni = editDniValue.trim();
    const newPhone = editPhoneValue.trim();
    const updatedRunner: RunnerRegistration = {
      ...editingRunner,
      documentNumber: newDni,
      whatsapp: newPhone,
    };

    const updatedList = registrations.map((r) =>
      r.id === editingRunner.id ? updatedRunner : r
    );

    // 1. Inmediato en estado y localStorage
    onUpdateRegistrations(updatedList);
    saveRegistrations(updatedList);

    // 2. Sincronización en la nube (Firestore) para que funcione 100% en Hostinger
    try {
      const cleaned = cleanFirestoreData(updatedRunner);
      setDoc(doc(db, 'registrations', editingRunner.id), cleaned, { merge: true }).catch(() => {});
    } catch (e) {}

    // 3. Notificación opcional al servidor si está disponible
    try {
      fetch('/api/runner/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runnerId: editingRunner.id,
          documentNumber: newDni,
          whatsapp: newPhone,
        }),
      }).catch(() => {});
    } catch (e) {}

    setEditingRunner(null);
    setIsSavingEdit(false);
    setLiveNotice(`✓ DNI de ${editingRunner.firstName} ${editingRunner.lastName} actualizado a: ${newDni}`);
    setTimeout(() => setLiveNotice(null), 4500);
  };

  // Official Kit Delivery QR and Staff Scanner
  const [showStartQRModal, setShowStartQRModal] = useState(false);
  const [isFullScreenQR, setIsFullScreenQR] = useState(false);
  const [startQrDataUrl, setStartQrDataUrl] = useState<string | null>(null);
  const [showStaffScanner, setShowStaffScanner] = useState(false);
  const [liveNotice, setLiveNotice] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active Tab: Roster table vs Traffic/Analytics
  const [activeAdminTab, setActiveAdminTab] = useState<'roster' | 'analytics'>('roster');
  const [showRouletteModal, setShowRouletteModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const loadAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const data = await fetchAnalytics();
      if (data) {
        setAnalyticsData(data);
      }
    } catch (err) {
      console.warn('Error fetching analytics:', err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleResetAnalytics = async () => {
    try {
      await resetAnalyticsSafe();
      loadAnalytics();
      setLiveNotice('✓ Contadores y accesos de analítica reiniciados correctamente.');
      setTimeout(() => setLiveNotice(null), 3500);
    } catch (e) {}
  };

  // Respaldo y Exportación de Datos del Evento
  const [showExportModal, setShowExportModal] = useState(false);

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportHalloweenAuditCSV = (filterMode: 'all' | 'pending' | 'qr-confirmed' = 'all') => {
    let list = registrations.filter((r) => r.edition !== 'santa-run-2026' && !r.id.startsWith('SR-'));
    if (filterMode === 'pending') {
      list = list.filter((r) => !r.confirmedAtStart);
    } else if (filterMode === 'qr-confirmed') {
      list = list.filter((r) => r.confirmedAtStart);
    }

    const headers = [
      'N°',
      'Código ID',
      'Nombres',
      'Apellidos',
      'DNI',
      'WhatsApp',
      'Modalidad',
      'Ciudad',
      'Club / Team',
      'Estado Kit Inicial',
      'Check-in QR Partida',
      'Fecha y Hora Check-in',
      'Llegó a Meta',
      'Estado Pago',
      'Observación Auditoría'
    ];

    const rows = list.map((r, i) => [
      i + 1,
      `"${r.id}"`,
      `"${r.firstName.replace(/"/g, '""')}"`,
      `"${r.lastName.replace(/"/g, '""')}"`,
      `"${r.documentNumber}"`,
      `"${r.whatsapp}"`,
      `"${r.modality}"`,
      `"${r.city || ''}"`,
      `"${r.runningClub || ''}"`,
      r.confirmedAtStart ? 'ENTREGADO' : 'PENDIENTE DE ENTREGA',
      r.confirmedAtStart ? 'CONFIRMADO (QR)' : 'NO REGISTRÓ EN QR',
      r.startCheckinTime ? `"${new Date(r.startCheckinTime).toLocaleString('es-PE')}"` : '""',
      r.finishedAtMeta ? 'SÍ' : 'NO',
      `"${r.paymentStatus}"`,
      r.confirmedAtStart ? '✓ Kit Entregado' : '⚠️ ATLETA SIN ENTREGA DE KIT'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const suffix = filterMode === 'pending' ? '_SOLO_KITS_PENDIENTES' : filterMode === 'qr-confirmed' ? '_CON_CHECKIN_QR' : '_AUDITORIA_COMPLETA';
    downloadFile(`Ohana_Halloween5K${suffix}_${new Date().toISOString().slice(0, 10)}.csv`, csvContent, 'text/csv;charset=utf-8;');
  };

  const handleExportSantaRunCSV = () => {
    const list = registrations.filter((r) => r.edition === 'santa-run-2026' || r.id.startsWith('SR-'));
    const headers = [
      'N°',
      'ID Santa Run',
      'Nombres',
      'Apellidos',
      'DNI',
      'WhatsApp',
      'Talla Polo',
      'Monto Inversión',
      'Descuento 15% Exclusivo',
      'Kit Santa Run',
      'Check-in QR',
      'Fecha Registro'
    ];

    const rows = list.map((r, i) => [
      i + 1,
      `"${r.id.startsWith('SR-') ? r.id : `SR-${r.id}`}"`,
      `"${r.firstName.replace(/"/g, '""')}"`,
      `"${r.lastName.replace(/"/g, '""')}"`,
      `"${r.documentNumber}"`,
      `"${r.whatsapp}"`,
      `"${r.tShirtSize || 'M'}"`,
      'S/ 70.00',
      'SÍ (Corredor Ohana)',
      r.confirmedAtStart ? 'ENTREGADO' : 'PENDIENTE',
      r.confirmedAtStart ? 'CONFIRMADO' : 'PENDIENTE',
      r.createdAt ? `"${new Date(r.createdAt).toLocaleString('es-PE')}"` : '""'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    downloadFile(`Ohana_SantaRun2026_Inscripciones_${new Date().toISOString().slice(0, 10)}.csv`, csvContent, 'text/csv;charset=utf-8;');
  };

  const handleExportRunnersCSV = () => {
    handleExportHalloweenAuditCSV('all');
  };

  const handleExportWinnersCSV = () => {
    const rState = getStoredRouletteState();
    const winners = rState.winners || [];

    if (winners.length === 0) {
      alert('Aún no hay ganadores registrados en la ruleta.');
      return;
    }

    const headers = ['N° Sorteo', 'Premio', 'Ticket Ganador', 'Nombre Ganador', 'DNI Ganador', 'Hora Sorteo'];
    const rows = winners.map((w) => [
      w.drawNumber,
      `"${(w.prizeName || '').replace(/"/g, '""')}"`,
      w.ticketNumber,
      `"${(w.runnerName || '').replace(/"/g, '""')}"`,
      `"${w.runnerDni || ''}"`,
      `"${new Date(w.wonAt).toLocaleString('es-PE')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    downloadFile(`OhanaGo5K_Ganadores_Ruleta_${new Date().toISOString().slice(0, 10)}.csv`, csvContent, 'text/csv;charset=utf-8;');
  };

  const handleExportFullJSON = () => {
    const rState = getStoredRouletteState();
    const fullBackup = {
      event: 'OHANA GO Santa Run 2026 & Halloween 5K Tarapoto',
      exportDate: new Date().toISOString(),
      userEmail: 'ingecheckplus@gmail.com',
      totalAthletes: registrations.length,
      kitsDeliveredCount: registrations.filter((r) => r.confirmedAtStart).length,
      roulette: rState,
      registrations: registrations,
      analytics: analyticsData,
    };

    downloadFile(
      `OhanaGo_Respaldo_Completo_Oficial_${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(fullBackup, null, 2),
      'application/json;charset=utf-8;'
    );
  };

  useEffect(() => {
    // Generate official kit delivery check-in QR code for Aviación
    const origin = window.location.origin;
    const startUrl = `${origin}/?checkin=start&token=OHANA-START-LINE-TARAPOTO-2026`;
    QRCode.toDataURL(startUrl, {
      width: 600,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then((url) => setStartQrDataUrl(url))
      .catch((err) => console.error('Error generating kit delivery QR:', err));
  }, []);



  const fetchLiveRegistrations = async () => {
    setIsRefreshing(true);
    loadAnalytics();
    try {
      const res = await fetch('/api/registrations');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const serverList: RunnerRegistration[] = await res.json();
        if (Array.isArray(serverList) && serverList.length > 0) {
          onUpdateRegistrations(serverList);
          saveRegistrations(serverList);
          return;
        }
      }
    } catch (err) {
      // Backend unavailable (Hostinger static hosting)
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }

    // Hostinger static or offline fallback: load from persistent local store
    const local = getStoredRegistrations();
    if (local && local.length > 0) {
      onUpdateRegistrations(local);
    }
  };

  useEffect(() => {
    fetchLiveRegistrations();
    loadAnalytics();
    const intervalId = setInterval(() => {
      fetchLiveRegistrations();
      loadAnalytics();
    }, 1500);

    const handleCheckinEvent = (e: any) => {
      fetchLiveRegistrations();
      if (e?.detail) {
        setLiveNotice(`🎉 ¡${e.detail.firstName} ${e.detail.lastName} confirmó entrega de kit inicial en vivo!`);
        setTimeout(() => setLiveNotice(null), 5000);
      }
    };

    // BroadcastChannel listener for check-ins across browser windows/tabs on Hostinger
    let checkinChannel: BroadcastChannel | null = null;
    try {
      checkinChannel = new BroadcastChannel('ohana_checkin_channel');
      checkinChannel.onmessage = (event) => {
        if (event.data && event.data.runner) {
          fetchLiveRegistrations();
          setLiveNotice(`🎉 ¡${event.data.runner.firstName} ${event.data.runner.lastName} confirmó entrega de kit inicial en vivo!`);
          setTimeout(() => setLiveNotice(null), 5000);
        }
      };
    } catch (e) {}

    // Instant SSE listener for real-time check-in updates
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/admin/stream');
      eventSource.onmessage = (event) => {
        try {
          if (event.data && event.data.startsWith('{')) {
            const parsed = JSON.parse(event.data);
            if (parsed && parsed.type === 'checkin' && parsed.runner) {
              fetchLiveRegistrations();
              setLiveNotice(`🎉 ¡${parsed.runner.firstName} ${parsed.runner.lastName} confirmó entrega de kit inicial en vivo!`);
              setTimeout(() => setLiveNotice(null), 5000);
            }
          }
        } catch (e) {}
      };
    } catch (e) {}

    // Real-time Cloud Firestore check-in listener (updates admin phone when runner scans anywhere)
    let unsubFirestore: (() => void) | null = null;
    try {
      unsubFirestore = subscribeToRegistrationsFirestore((runner) => {
        const currentList = getStoredRegistrations();
        const updated = currentList.map((r) => (r.id === runner.id ? { ...r, ...runner, confirmedAtStart: true } : r));
        onUpdateRegistrations(updated);
        saveRegistrations(updated);
        setLiveNotice(`🎉 ¡${runner.firstName} ${runner.lastName} confirmó entrega de kit inicial en vivo!`);
        setTimeout(() => setLiveNotice(null), 5000);
      });
    } catch (e) {}

    window.addEventListener('ohana-checkin', handleCheckinEvent);
    window.addEventListener('storage', fetchLiveRegistrations);
    return () => {
      clearInterval(intervalId);
      if (unsubFirestore) unsubFirestore();
      if (eventSource) eventSource.close();
      if (checkinChannel) checkinChannel.close();
      window.removeEventListener('ohana-checkin', handleCheckinEvent);
      window.removeEventListener('storage', fetchLiveRegistrations);
    };
  }, []);

  const handleToggleKitDelivery = async (runnerId: string, currentVal: boolean) => {
    const updated = registrations.map((r) =>
      r.id === runnerId
        ? {
            ...r,
            confirmedAtStart: !currentVal,
            startCheckinTime: !currentVal ? new Date().toISOString() : undefined,
          }
        : r
    );
    onUpdateRegistrations(updated);
    saveRegistrations(updated);

    if (!currentVal) {
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  // Santa Run and Halloween specific metrics
  const santaRunRegistrations = registrations.filter((r) => r.edition === 'santa-run-2026' || r.id.startsWith('SR-'));
  const halloweenRegistrations = registrations.filter((r) => r.edition !== 'santa-run-2026' && !r.id.startsWith('SR-'));
  const santaTotalCount = santaRunRegistrations.length;
  const santaKitsConfirmed = santaRunRegistrations.filter((r) => r.confirmedAtStart).length;
  const santaKitsPending = santaTotalCount - santaKitsConfirmed;
  const halloweenTotalCount = halloweenRegistrations.length;
  const halloweenKitsPending = halloweenRegistrations.filter((r) => !r.confirmedAtStart).length;
  const halloweenKitsConfirmed = halloweenRegistrations.filter((r) => r.confirmedAtStart).length;

  // Metrics calculation
  const totalCount = registrations.length;
  const checkinConfirmedCount = registrations.filter((r) => r.confirmedAtStart).length;
  const checkinPendingCount = totalCount - checkinConfirmedCount;

  // Filtered registrations
  const filteredRegistrations = registrations.filter((r) => {
    const query = searchTerm.toLowerCase().trim();
    const matchSearch =
      !query ||
      r.firstName.toLowerCase().includes(query) ||
      r.lastName.toLowerCase().includes(query) ||
      r.documentNumber.includes(query) ||
      r.whatsapp.includes(query) ||
      r.id.toLowerCase().includes(query) ||
      r.city.toLowerCase().includes(query) ||
      (r.department && r.department.toLowerCase().includes(query));

    // Attendance checkin filter
    const matchCheckin =
      filterCheckin === 'all' ||
      (filterCheckin === 'confirmed' && !!r.confirmedAtStart) ||
      (filterCheckin === 'pending' && !r.confirmedAtStart);

    // Edition filter (Santa Run 2026 vs Halloween 5K)
    const isSanta = r.edition === 'santa-run-2026' || r.id.startsWith('SR-');
    const matchEdition =
      filterEdition === 'all' ||
      (filterEdition === 'santa-run-2026' && isSanta) ||
      (filterEdition === 'halloween-5k-2026' && !isSanta);

    return matchSearch && matchCheckin && matchEdition;
  });

  // Sort registrations so Santa Run entries appear first, and within each edition newest entries appear first
  const sortedRegistrations = [...filteredRegistrations].sort((a, b) => {
    const isSantaA = a.edition === 'santa-run-2026' || a.id.startsWith('SR-');
    const isSantaB = b.edition === 'santa-run-2026' || b.id.startsWith('SR-');
    if (isSantaA !== isSantaB) return isSantaA ? -1 : 1;

    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeA !== timeB) return timeB - timeA;
    const numA = a.registrationNumber || parseInt(a.id.replace(/\D/g, ''), 10) || 0;
    const numB = b.registrationNumber || parseInt(b.id.replace(/\D/g, ''), 10) || 0;
    return numB - numA;
  });

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 overflow-y-auto text-neutral-100 flex flex-col min-h-screen selection:bg-red-600 selection:text-white">
      {/* Top Sticky Header Bar (Fluid page navigation) */}
      <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 shadow-xl px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-red-400 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-red-500/30 shadow-sm"
              title="Volver a la página principal de la carrera"
            >
              <ArrowLeft className="w-4 h-4 text-red-400" />
              <span>Volver a la Web</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bebas text-2xl sm:text-3xl text-white tracking-wide uppercase leading-none">
                  Panel del <span className="text-red-500">Organizador</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-red-950/80 text-red-400 font-bold uppercase text-[10px] tracking-wider border border-red-500/40 hidden sm:inline-block">
                  Control de Atletas & Reportes
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5 hidden md:block">
                Tarapoto • {totalCount} atletas en base de datos • {santaTotalCount} Santa Run · {halloweenTotalCount} Halloween
              </p>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* LECTOR QR DE CONTROL DE ATLETAS (CÁMARA DEL CELULAR / EN ROJO) */}
            <button
              onClick={() => setShowStaffScanner(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 text-white rounded-xl text-xs font-black transition shadow-lg shadow-red-600/30 cursor-pointer ring-2 ring-red-500/60 hover:scale-[1.02]"
              title="Abrir lector QR con la cámara del celular para acreditar atleta y entregar kit"
            >
              <Camera className="w-4 h-4 text-white" />
              <span>📷 Lector QR Atletas</span>
            </button>

            {/* DESCARGA DE REPORTES (HALLOWEEN Y SANTA RUN) */}
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 rounded-xl text-xs font-black transition border border-amber-500/40 shadow-sm cursor-pointer hover:scale-[1.02]"
              title="Descargar reportes oficiales de Halloween 5K (kits pendientes y QR) y Santa Run"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>📥 Descargar Reportes</span>
            </button>

            {/* Sorteo del Pavo Navideño (Santa Run 2026) */}
            <button
              onClick={() => setShowTurkeyLottery(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-black transition border border-neutral-700 shadow cursor-pointer"
              title="Girar la Tómbola Digital del Sorteo del Pavo Santa Run 2026"
            >
              <Gift className="w-4 h-4 text-amber-300" />
              <span>🦃 Sorteo Pavo</span>
            </button>

            {/* Ruleta de Sorteos (25 Premios) */}
            <button
              onClick={() => setShowRouletteModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-amber-400 rounded-xl text-xs font-black transition border border-neutral-700 shadow cursor-pointer"
              title="Controlar y Girar Ruleta de Sorteos en Vivo (25 Premios)"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>🎡 25 Premios</span>
            </button>

            {/* Kit Delivery QR Projector Button */}
            <button
              onClick={() => setShowStartQRModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold transition shadow cursor-pointer border border-neutral-700"
              title="Mostrar y proyectar QR oficial de entrega de kit para Aviación"
            >
              <QrCode className="w-4 h-4 text-red-400" />
              <span>Proyectar QR</span>
            </button>

            {/* Live refresh */}
            <button
              onClick={fetchLiveRegistrations}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer border border-neutral-700"
              title="Sincronizar participantes en tiempo real"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-red-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                adminLogout();
                onLogout();
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-xl text-xs font-semibold transition border border-red-500/30 cursor-pointer"
              title="Cerrar sesión de administrador"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Fluid Content (Smooth downward scrolling, no trapped modal borders) */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6 flex-1">
        {/* Live Notice Banner */}
        {liveNotice && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/90 via-neutral-900 to-red-950/90 border-2 border-red-500 text-red-200 text-xs font-bold flex items-center justify-between shadow-xl shadow-red-500/20 animate-pulse">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-red-400 shrink-0" />
              <span className="text-sm">{liveNotice}</span>
            </div>
            <button
              onClick={() => setLiveNotice(null)}
              className="text-red-400 hover:text-white p-1 rounded-lg hover:bg-red-900/60 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs between Roster & Analytics */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveAdminTab('roster')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
                activeAdminTab === 'roster'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 font-black'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Control de Atletas ({totalCount})</span>
            </button>

            <button
              onClick={() => {
                setActiveAdminTab('analytics');
                loadAnalytics();
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
                activeAdminTab === 'analytics'
                  ? 'bg-neutral-800 text-red-400 border border-red-500/50 font-black shadow-lg shadow-red-600/20'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-red-400" />
              <span>Métricas & Tráfico en Vivo</span>
              {analyticsData && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-red-950 text-red-200 text-[10px] border border-red-500/40 font-mono">
                  {analyticsData.totalPageViews} visitas
                </span>
              )}
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer bg-neutral-900 text-amber-300 hover:text-white hover:bg-neutral-800 border border-amber-500/40 shadow-sm"
              title="Descargar reportes de Halloween y Santa Run"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>Reporte Halloween & Santa Run</span>
            </button>

            <button
              onClick={() => {
                exportToNativeXLSX(registrations);
                setLiveNotice('✓ Archivo Excel oficial (.xlsx) descargado.');
                setTimeout(() => setLiveNotice(null), 4000);
              }}
              className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-950/40"
              title="Descargar archivo Excel oficial nativo (.xlsx) con pestañas de Santa Run y Halloween"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Descargar Excel Oficial (.xlsx)</span>
            </button>
          </div>

          <div className="text-xs text-neutral-400 flex items-center gap-3">
            <span className="text-red-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              Mostrando los más recientes primero
            </span>
          </div>
        </div>

        {activeAdminTab === 'analytics' ? (
          <AdminAnalyticsTab
            registrations={registrations}
            analyticsData={analyticsData}
            isLoading={isLoadingAnalytics}
            onRefresh={loadAnalytics}
            onResetAnalytics={handleResetAnalytics}
          />
        ) : (
          <>
            {/* High-Impact Athletic Metric Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Santa Run 2026 Inscriptions in Red */}
              <div className="bg-neutral-900 p-4 sm:p-5 rounded-2xl border-2 border-red-500/60 shadow-lg shadow-red-500/10">
                <span className="text-[10px] uppercase font-bold text-red-400 block flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-red-400" />
                  🎅 Santa Run 2026
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="font-bebas text-3xl sm:text-4xl text-red-500">{santaTotalCount}</span>
                  <span className="text-[11px] text-neutral-400">inscritos (S/ 70)</span>
                </div>
                <div className="text-[10px] text-neutral-400 mt-1 flex items-center justify-between border-t border-neutral-800 pt-1">
                  <span>Kits entregados:</span>
                  <span className="text-red-400 font-mono font-bold">{santaKitsConfirmed}</span>
                </div>
              </div>

              {/* Halloween Finishers Totales */}
              <div className="bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-neutral-800 shadow-md">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">🎃 Halloween 5K</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="font-bebas text-3xl sm:text-4xl text-white">{halloweenTotalCount}</span>
                  <span className="text-[11px] text-neutral-500">atletas meta</span>
                </div>
                <div className="text-[10px] text-neutral-400 mt-1 flex items-center justify-between border-t border-neutral-800 pt-1">
                  <span>Check-in QR partida:</span>
                  <span className="text-emerald-400 font-mono font-bold">{halloweenKitsConfirmed}</span>
                </div>
              </div>

              {/* Kits Pendientes de Entrega (Halloween) */}
              <div className="bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-amber-500/50 shadow-md">
                <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Kits Halloween Pendientes
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="font-bebas text-3xl sm:text-4xl text-amber-400">
                    {String(halloweenKitsPending).padStart(2, '0')}
                  </span>
                  <span className="text-[11px] text-neutral-500">sin entregar</span>
                </div>
                <button
                  onClick={() => handleExportHalloweenAuditCSV('pending')}
                  className="mt-1 w-full text-left text-[10px] text-amber-300 font-bold hover:underline flex items-center gap-1 pt-1 border-t border-neutral-800 cursor-pointer"
                >
                  <Download className="w-3 h-3 text-amber-400" />
                  Descargar pendientes (CSV)
                </button>
              </div>

              {/* Descargas & Respaldo Oficial Directo */}
              <div className="bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-neutral-800 shadow-md flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      Descargas & Excel
                    </span>
                    <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40 font-mono font-bold">
                      .XLSX DIRECTO
                    </span>
                  </span>
                  <div className="text-xs text-neutral-300 mt-1 font-sans">
                    Nómina oficial de Santa Run & Halloween
                  </div>
                </div>
                <div className="mt-2 flex flex-col gap-1.5">
                  <button
                    onClick={() => {
                      exportToNativeXLSX(registrations);
                      setLiveNotice('✓ Archivo Excel oficial (.xlsx) descargado.');
                      setTimeout(() => setLiveNotice(null), 4000);
                    }}
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Excel (.xlsx)</span>
                  </button>
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="w-full py-1 text-center rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold transition border border-neutral-700 cursor-pointer"
                  >
                    Más opciones (CSV / Backup)
                  </button>
                </div>
              </div>
            </div>

            {/* Filter and Search Toolbar */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Search Box */}
                <div className="relative flex-1 min-w-[280px] max-w-lg">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, DNI, celular, ciudad o ID..."
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition text-xs"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Kit Delivery Filter */}
                  <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                    <button
                      onClick={() => setFilterCheckin('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        filterCheckin === 'all'
                          ? 'bg-neutral-800 text-white font-bold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Todos ({totalCount})
                    </button>
                    <button
                      onClick={() => setFilterCheckin('confirmed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        filterCheckin === 'confirmed'
                          ? 'bg-emerald-950 border border-emerald-500/60 text-emerald-400 shadow-sm shadow-emerald-500/20'
                          : 'text-neutral-400 hover:text-emerald-300'
                      }`}
                      title="Mostrar participantes con kit entregado"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>✓ Kit Entregado ({checkinConfirmedCount})</span>
                    </button>
                    <button
                      onClick={() => setFilterCheckin('pending')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        filterCheckin === 'pending'
                          ? 'bg-amber-950 border border-amber-500/60 text-amber-400 shadow-sm shadow-amber-500/20'
                          : 'text-neutral-400 hover:text-amber-300'
                      }`}
                      title="Mostrar participantes pendientes de entrega de kit"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>⏳ Pendiente de Kit ({checkinPendingCount})</span>
                    </button>
                  </div>

                  {/* Edition Filter (Santa Run 2026 vs Halloween 5K) */}
                  <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                    <button
                      onClick={() => setFilterEdition('santa-run-2026')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        filterEdition === 'santa-run-2026'
                          ? 'bg-red-950 border border-red-500/60 text-red-400 shadow-sm shadow-red-500/20 font-black'
                          : 'text-neutral-400 hover:text-red-300'
                      }`}
                    >
                      <span>🎅 Santa Run ({santaTotalCount})</span>
                    </button>
                    <button
                      onClick={() => setFilterEdition('halloween-5k-2026')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        filterEdition === 'halloween-5k-2026'
                          ? 'bg-amber-950 border border-amber-500/60 text-amber-400 shadow-sm shadow-amber-500/20'
                          : 'text-neutral-400 hover:text-amber-300'
                      }`}
                    >
                      <span>🎃 Halloween ({halloweenTotalCount})</span>
                    </button>
                    <button
                      onClick={() => setFilterEdition('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        filterEdition === 'all'
                          ? 'bg-neutral-800 text-white font-bold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Todas ({totalCount})
                    </button>
                  </div>
                </div>
              </div>
            </div>

        {/* Official Participant Table (Sorted most recent first) */}
        <div className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-red-500" />
              <h3 className="font-bebas text-2xl text-white uppercase tracking-wide">
                Nómina Oficial de Participantes ({sortedRegistrations.length})
              </h3>
            </div>
            <span className="text-xs text-red-400 font-mono font-bold flex items-center gap-1">
              ⚡ Más recientes arriba
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-3">N°</th>
                  <th className="py-3.5 px-3">Atleta & ID Oficial</th>
                  <th className="py-3.5 px-3">DNI & Celular</th>
                  <th className="py-3.5 px-3">Polo & Kit Navideño</th>
                  <th className="py-3.5 px-3">Inversión & Sorteo Pavo</th>
                  <th className="py-3.5 px-3 text-right">Edición / Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {sortedRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-500 text-sm">
                      No se encontraron participantes con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  sortedRegistrations.map((runner, index) => {
                    const isSanta = runner.edition === 'santa-run-2026' || runner.id.startsWith('SR-');
                    const isRunVirtual = runner.modality === 'Virtual';
                    return (
                      <tr key={runner.id} className="hover:bg-neutral-800/50 transition">
                        {/* Correlative index */}
                        <td className="py-3.5 px-3 font-mono font-bold text-neutral-400 text-xs">
                          {index + 1}
                        </td>

                        {/* Participant Name & Red IDs for Santa Run */}
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-white text-sm">
                            {runner.firstName} {runner.lastName}
                          </div>
                          <div className="text-[11px] text-neutral-400 flex flex-wrap items-center gap-1.5 mt-0.5">
                            {isSanta ? (
                              <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-red-950/90 text-red-400 border border-red-500/50 shadow-sm">
                                {runner.id.startsWith('SR-') ? runner.id : `SR-${runner.id}`}
                              </span>
                            ) : (
                              <span className="font-mono text-neutral-300 font-bold">{runner.id}</span>
                            )}
                            {runner.city && (
                              <span className="text-[10px] text-neutral-400 bg-neutral-800 px-1.5 rounded">
                                {runner.city}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* DNI & Phone */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5">
                            {runner.documentNumber.includes('Pendiente') ? (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/40">
                                ⚠️ Sin DNI (Ingresó correo)
                              </span>
                            ) : (
                              <span className="font-mono font-bold text-amber-300 text-xs">
                                {runner.documentType || 'DNI'}: {runner.documentNumber}
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setEditingRunner(runner);
                                setEditDniValue(runner.documentNumber.includes('Pendiente') ? '' : runner.documentNumber);
                                setEditPhoneValue(runner.whatsapp);
                              }}
                              className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition cursor-pointer"
                              title="Editar o asignar DNI a este corredor"
                            >
                              <Pencil className="w-3 h-3 text-neutral-400 hover:text-red-400" />
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <a
                              href={`https://wa.me/51${runner.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition font-mono"
                              title="Contactar por WhatsApp"
                            >
                              <Phone className="w-3 h-3 text-emerald-400" />
                              <span>{runner.whatsapp}</span>
                            </a>
                            {runner.email && (
                              <span className="text-[10px] text-neutral-400 font-mono truncate max-w-[120px]" title={runner.email}>
                                • {runner.email}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Talla Polo & Kit Navideño */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-neutral-800 text-white font-mono font-bold text-xs border border-neutral-700">
                              Polo: {runner.tShirtSize || 'M'}
                            </span>
                            {isSanta && (
                              <span className="text-[10px] text-red-300 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-500/40">
                                + Gorra + Mochila
                              </span>
                            )}
                          </div>
                          <div className="mt-1">
                            {runner.confirmedAtStart ? (
                              <button
                                onClick={() => handleToggleKitDelivery(runner.id, true)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase transition cursor-pointer border bg-emerald-950/90 text-emerald-400 border-emerald-500/60 hover:bg-red-950/70 hover:text-red-300 shadow-sm"
                                title="Kit entregado. Clic para desmarcar."
                              >
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Kit Entregado</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleKitDelivery(runner.id, false)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer border bg-neutral-800 text-amber-300 border-neutral-700 hover:border-red-500 hover:text-white"
                                title="Marcar entrega de kit"
                              >
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>Entregar Kit</span>
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Inversión & Ticket Sorteo Pavo & Voucher */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-xs">
                              {runner.amountPaid ? `S/ ${Number(runner.amountPaid).toFixed(2)}` : (isSanta ? 'S/ 70.00' : 'S/ 50.00')}
                            </span>
                            {runner.hasPreviousDiscount && (
                              <span className="text-[9px] bg-red-950 text-red-300 px-1.5 py-0.2 rounded border border-red-500/40 font-bold">
                                15% OHANA
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-amber-400 font-mono mt-0.5 flex items-center gap-1">
                            {isSanta ? (
                              <span>🦃 {runner.turkeyRaffleTicket || `PAVO-${String(runner.registrationNumber || 1).padStart(4, '0')}`}</span>
                            ) : (
                              <span className="text-neutral-400">Método: {runner.paymentMethod || 'Yape'}</span>
                            )}
                          </div>
                          {/* Voucher Button / Status */}
                          <div className="mt-1">
                            {runner.paymentProofImage || runner.voucherUrl ? (
                              <button
                                onClick={() => setViewingVoucherRunner(runner)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 hover:bg-emerald-900 transition cursor-pointer shadow-sm"
                                title="Ver captura del voucher Yape"
                              >
                                <ImageIcon className="w-3 h-3 text-emerald-400" />
                                <span>🧾 Ver Voucher</span>
                              </button>
                            ) : (
                              <a
                                href={`https://wa.me/51${runner.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${runner.firstName}, te saludamos de la organización de Santa Run Tarapoto 2026. Por favor envíanos la captura de tu voucher Yape para validar tu inscripción oficial.`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-neutral-400 hover:text-amber-300 font-mono transition"
                                title="Sin voucher adjunto. Clic para pedir constancia por WhatsApp"
                              >
                                <span>Sin voucher</span>
                                <span className="text-amber-400 font-bold">• Pedir</span>
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Edición / Registro */}
                        <td className="py-3.5 px-3 text-right">
                          <div>
                            {isSanta ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-950/80 text-red-400 border border-red-500/40 shadow-sm">
                                🎅 Santa Run
                              </span>
                            ) : isRunVirtual ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-neutral-800 text-neutral-300 border border-neutral-700">
                                Virtual 5K
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-neutral-800 text-neutral-300 border border-neutral-700">
                                Halloween 5K
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                            {runner.createdAt ? new Date(runner.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}
      </main>

      {/* Modal: Runner Scanned Profile Card (Staff Scanned runner via Camera or DNI search) */}
      {scannedRunnerModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-neutral-900 border-2 border-red-500 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setScannedRunnerModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 border-b border-neutral-800 pb-3">
              <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-red-600/30">
                🏃
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-950/80 px-2 py-0.5 rounded-full border border-red-500/40">
                  Participante Identificado
                </span>
                <h4 className="font-bebas text-3xl text-white uppercase mt-0.5 leading-none">
                  {scannedRunnerModal.firstName} {scannedRunnerModal.lastName}
                </h4>
                <p className="text-xs text-neutral-400">
                  DNI: <strong className="text-red-400 font-mono">{scannedRunnerModal.documentNumber}</strong> • Código: <strong className="text-white font-mono">{scannedRunnerModal.id}</strong>
                </p>
              </div>
            </div>

            {/* Runner quick details (No tallas) */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Modalidad</span>
                <span className="font-bold text-white">{scannedRunnerModal.modality || 'Presencial 5K'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">WhatsApp</span>
                <span className="font-bold text-emerald-400 font-mono">{scannedRunnerModal.whatsapp}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Ubicación</span>
                <span className="font-bold text-white">{scannedRunnerModal.city}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">DNI</span>
                <span className="font-bold text-red-400 font-mono">
                  {scannedRunnerModal.documentNumber}
                </span>
              </div>
            </div>

            {/* Single Prominent Action: Confirm Kit Delivery */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-red-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white block">Entrega de Kit Inicial</span>
                  <span className="text-xs text-neutral-400">
                    {scannedRunnerModal.confirmedAtStart ? '✓ Kit inicial ya entregado' : 'Pendiente de entrega en mesa de acreditación'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const newVal = !scannedRunnerModal.confirmedAtStart;
                    await handleToggleKitDelivery(scannedRunnerModal.id, scannedRunnerModal.confirmedAtStart || false);
                    setScannedRunnerModal((prev) => prev ? { ...prev, confirmedAtStart: newVal, startCheckinTime: newVal ? new Date().toISOString() : undefined } : null);
                  }}
                  className={`px-4 py-2 rounded-xl font-bebas text-base uppercase transition cursor-pointer font-black ${
                    scannedRunnerModal.confirmedAtStart
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                      : 'bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-600/30'
                  }`}
                >
                  {scannedRunnerModal.confirmedAtStart ? '✓ Kit Entregado' : 'Entregar Kit Inicial'}
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-end">
              <button
                type="button"
                onClick={() => setScannedRunnerModal(null)}
                className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Official Kit Delivery Check-in QR (For Aviación Accreditation Desk) */}
      {showStartQRModal && (
        <div className={`fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-xl overflow-y-auto ${isFullScreenQR ? 'p-0' : ''}`}>
          <div className={`relative w-full ${isFullScreenQR ? 'h-full max-w-none rounded-none p-6 sm:p-10 flex flex-col justify-between' : 'max-w-2xl rounded-3xl p-6'} bg-neutral-900 border border-red-500/50 shadow-[0_0_60px_rgba(212,36,38,0.3)] transition-all`}>
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bebas text-xl font-black shadow-md shadow-red-600/30">
                  🏁
                </div>
                <div>
                  <h4 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide uppercase leading-tight">
                    Mesa de Acreditación • <span className="text-red-400">QR Entrega de Kit Inicial</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Tarapoto • Control Oficial de Acreditación
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullScreenQR(!isFullScreenQR)}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
                  title={isFullScreenQR ? 'Salir de pantalla completa' : 'Modo pantalla gigante / tablet'}
                >
                  {isFullScreenQR ? <Minimize2 className="w-5 h-5 text-red-400" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => {
                    setShowStartQRModal(false);
                    setIsFullScreenQR(false);
                  }}
                  className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Live Progress Banner */}
            <div className="my-4 p-3.5 rounded-2xl bg-gradient-to-r from-red-950/60 via-neutral-950 to-neutral-950 border border-red-500/40">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-red-400" />
                  Kits Entregados en Tiempo Real:
                </span>
                <span className="font-mono text-white text-sm">
                  {checkinConfirmedCount} de {totalCount} ({Math.round((checkinConfirmedCount / (totalCount || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((checkinConfirmedCount / (totalCount || 1)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Center: Giant High-Contrast QR Code */}
            <div className="flex flex-col items-center justify-center my-2 text-center">
              <div className="p-4 sm:p-6 bg-white rounded-3xl shadow-2xl border-4 border-red-500/80 max-w-[320px] sm:max-w-[380px] w-full flex items-center justify-center transition-transform hover:scale-[1.02]">
                {startQrDataUrl ? (
                  <img
                    src={startQrDataUrl}
                    alt="Código QR Entrega de Kit OHANA GO 5K"
                    className="w-full h-auto object-contain aspect-square"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-neutral-400 text-xs">
                    Generando código QR...
                  </div>
                )}
              </div>

              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-wider">
                QR Oficial Entrega de Kit • Aviación
              </div>
              <p className="text-xs text-neutral-300 max-w-lg mt-2 leading-relaxed">
                Este código QR se ubica en la carpa de acreditación. Los atletas lo escanean con su cámara desde <strong>Mi Espacio 🎒</strong> para confirmar la entrega de su kit inicial en vivo.
              </p>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-800 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowStaffScanner(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-red-600/30"
                >
                  <Camera className="w-4 h-4 text-white" />
                  <span>Escanear Corredor con la Cámara</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const printWindow = window.open('', '_blank');
                    if (printWindow && startQrDataUrl) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>QR Entrega de Kit - OHANA GO 5K Tarapoto</title>
                            <style>
                              body { font-family: sans-serif; text-align: center; padding: 40px; background: #000; color: #fff; }
                              h1 { font-size: 38px; margin: 0; color: #ef4444; text-transform: uppercase; }
                              h2 { font-size: 20px; color: #fff; margin: 5px 0 25px 0; font-weight: normal; }
                              .qr-box { background: #fff; padding: 20px; border-radius: 20px; display: inline-block; border: 4px solid #ef4444; }
                              img { width: 380px; height: 380px; display: block; }
                              p { font-size: 18px; margin-top: 25px; color: #e5e5e5; }
                              .badge { background: #dc2626; color: #fff; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; text-transform: uppercase; }
                            </style>
                          </head>
                          <body>
                            <span class="badge">Acreditación Oficial</span>
                            <h1>OHANA GO SANTA RUN 2026</h1>
                            <h2>Aviación • Control de Acreditación</h2>
                            <div class="qr-box">
                              <img src="${startQrDataUrl}" />
                            </div>
                            <p><strong>Apunta con la cámara de tu celular para confirmar la entrega de tu Kit Inicial</strong></p>
                            <script>window.onload = function() { window.print(); }<\/script>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bebas text-base uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/30"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Cartel de Acreditación
                </button>

                {/* Download High-Res QR Button */}
                {startQrDataUrl && (
                  <a
                    href={startQrDataUrl}
                    download="QR_Entrega_Kit_Ohana_Tarapoto_5K.png"
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-red-400 hover:text-white font-bebas text-base uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer border border-red-500/40 shadow-md"
                    title="Descargar imagen oficial del código QR en formato PNG para imprimir"
                  >
                    <Download className="w-4 h-4 text-red-400" />
                    Descargar QR (PNG)
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Scanner Modal */}
      {showStaffScanner && (
        <QRScannerModal
          title="Acreditación de Corredor • Entrega de Kit"
          subtitle="Apunta la cámara al código del participante o ingresa su DNI."
          expectedType="any"
          allowManualInput={true}
          onScanSuccess={async (scannedText) => {
            setShowStaffScanner(false);
            try {
              const checkData = await processStartCheckinSafe({
                runnerId: scannedText,
                dni: scannedText,
                code: scannedText,
                token: 'ADMIN_CHECKIN_OVERRIDE',
              });
              if (checkData.success && checkData.runner) {
                const updatedList = registrations.map((r) =>
                  r.id === checkData.runner!.id ? checkData.runner! : r
                );
                onUpdateRegistrations(updatedList);
                saveRegistrations(updatedList);
                setScannedRunnerModal(checkData.runner);
                setLiveNotice(`🎉 ¡${checkData.runner.firstName} ${checkData.runner.lastName} (DNI: ${checkData.runner.documentNumber}) kit entregado y asistencia confirmada!`);
                try {
                  confetti({ particleCount: 110, spread: 70, origin: { y: 0.6 } });
                } catch (e) {}
                setTimeout(() => setLiveNotice(null), 6000);
              } else {
                setLiveNotice(`❌ ${checkData.error || 'No se encontró un competidor registrado con ese código.'}`);
                setTimeout(() => setLiveNotice(null), 5000);
              }
            } catch (err) {
              setLiveNotice('❌ Error al procesar acreditación.');
              setTimeout(() => setLiveNotice(null), 4000);
            }
          }}
          onClose={() => setShowStaffScanner(false)}
        />
      )}
      {/* Modal: Edit Runner DNI / Phone */}
      {editingRunner && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-sm w-full bg-neutral-900 border-2 border-red-500 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setEditingRunner(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h4 className="font-bebas text-2xl text-white uppercase mb-1">
              Editar DNI del Atleta
            </h4>
            <p className="text-xs text-neutral-400 mb-4">
              {editingRunner.firstName} {editingRunner.lastName} ({editingRunner.id})
            </p>

            <form onSubmit={handleSaveRunnerEdit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                  Número de DNI (8 dígitos)
                </label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  pattern="\d{8}"
                  value={editDniValue}
                  onChange={(e) => setEditDniValue(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej: 73017454"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-red-500"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Con este número el corredor ingresará a «Mi Espacio 🎒»
                </span>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                  Número de WhatsApp
                </label>
                <input
                  type="text"
                  required
                  value={editPhoneValue}
                  onChange={(e) => setEditPhoneValue(e.target.value)}
                  placeholder="Ej: 993778180"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRunner(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit || editDniValue.length !== 8}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bebas text-lg uppercase tracking-wider cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSavingEdit ? 'Guardando...' : 'Guardar DNI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Voucher / Constancia de Pago Yape */}
      {viewingVoucherRunner && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-neutral-900 border-2 border-emerald-500/60 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setViewingVoucherRunner(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                Constancia de Pago Oficial (Yape)
              </span>
              <h4 className="font-bebas text-2xl text-white uppercase mt-1 leading-tight">
                {viewingVoucherRunner.firstName} {viewingVoucherRunner.lastName}
              </h4>
              <p className="text-xs text-neutral-400">
                DNI: <strong className="text-white font-mono">{viewingVoucherRunner.documentNumber}</strong> • ID: <strong className="text-red-400 font-mono">{viewingVoucherRunner.id}</strong> • Monto: <strong className="text-amber-400 font-mono">S/ {Number(viewingVoucherRunner.amountPaid || 70).toFixed(2)}</strong>
              </p>
            </div>

            {/* Image display */}
            <div className="rounded-2xl overflow-hidden bg-black border border-neutral-800 min-h-[220px] max-h-[60vh] flex items-center justify-center p-2">
              {viewingVoucherRunner.paymentProofImage || viewingVoucherRunner.voucherUrl ? (
                <img
                  src={viewingVoucherRunner.voucherUrl || viewingVoucherRunner.paymentProofImage}
                  alt={`Voucher de ${viewingVoucherRunner.firstName}`}
                  className="max-h-[58vh] w-auto max-w-full object-contain rounded-xl"
                />
              ) : (
                <div className="py-12 text-center text-neutral-500 text-xs">
                  No hay imagen disponible para este comprobante.
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-800">
              <a
                href={viewingVoucherRunner.voucherUrl || viewingVoucherRunner.paymentProofImage}
                target="_blank"
                rel="noreferrer"
                download={`voucher_${viewingVoucherRunner.id}.jpg`}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Abrir / Descargar</span>
              </a>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/51${viewingVoucherRunner.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl bg-neutral-800 text-emerald-400 text-xs font-bold hover:bg-neutral-700 transition flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => setViewingVoucherRunner(null)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Descargas Oficiales & Sincronización Google Drive */}
      {showExportModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="relative max-w-2xl w-full bg-neutral-900 border-2 border-red-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowExportModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-950/80 px-2.5 py-1 rounded-full border border-red-500/40">
                Auditoría & Descargas Oficiales
              </span>
              <h3 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide uppercase mt-1 leading-none">
                Exportar Reportes & Google Drive
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Descarga la nómina de atletas con auditoría de entrega de kits y registro en QR para Halloween 5K y Santa Run 2026.
              </p>
            </div>

            {/* Section 1: Reportes Halloween 5K (Kits y QR) */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <h4 className="font-bebas text-xl text-amber-400 uppercase tracking-wide flex items-center gap-2">
                <span>🎃 Reportes Oficiales Halloween 5K</span>
              </h4>
              <p className="text-xs text-neutral-400">
                Verifica a quién se le entregó el kit, quién tiene pendiente y quién registró con código QR.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <button
                  onClick={() => handleExportHalloweenAuditCSV('all')}
                  className="p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 hover:border-amber-400/60 text-xs font-bold text-left transition flex flex-col justify-between cursor-pointer"
                >
                  <span className="text-white font-bold block mb-1">📄 Reporte Completo</span>
                  <span className="text-[10px] text-neutral-400">Todos los {halloweenTotalCount} atletas con kits y QR</span>
                </button>

                <button
                  onClick={() => handleExportHalloweenAuditCSV('pending')}
                  className="p-3 rounded-xl bg-amber-950/40 hover:bg-amber-950/70 text-amber-200 border border-amber-500/50 text-xs font-bold text-left transition flex flex-col justify-between cursor-pointer"
                >
                  <span className="text-amber-300 font-bold block mb-1">⚠️ Solo Kits Pendientes</span>
                  <span className="text-[10px] text-amber-400/80">{halloweenKitsPending} atletas sin entrega</span>
                </button>

                <button
                  onClick={() => handleExportHalloweenAuditCSV('qr-confirmed')}
                  className="p-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/70 text-emerald-200 border border-emerald-500/50 text-xs font-bold text-left transition flex flex-col justify-between cursor-pointer"
                >
                  <span className="text-emerald-300 font-bold block mb-1">🏁 Con Check-in QR</span>
                  <span className="text-[10px] text-emerald-400/80">{halloweenKitsConfirmed} con QR verificado</span>
                </button>
              </div>
            </div>

            {/* Section 2: Reporte Santa Run 2026 */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-red-500/40 space-y-3">
              <h4 className="font-bebas text-xl text-red-400 uppercase tracking-wide flex items-center gap-2">
                <span>🎅 Inscripciones Santa Run Tarapoto 2026</span>
              </h4>
              <p className="text-xs text-neutral-400">
                Lista de nuevos inscritos con sus IDs oficiales de Ohana Santa Run, tallas de polo, montos y validación de descuento 15%.
              </p>

              <button
                onClick={handleExportSantaRunCSV}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 text-white font-bebas text-lg uppercase tracking-wider font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/30"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Nómina Santa Run 2026 (CSV / Excel)</span>
              </button>
            </div>

            {/* Section 3: Descarga de Respaldo Completo y Excel Nativo */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-neutral-400" />
                  <span className="font-bebas text-xl text-white uppercase tracking-wide">
                    Respaldo Completo & Excel
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-700 text-[10px] font-mono">
                  {registrations.length} registros
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Descarga de forma directa y sin configuraciones la nómina completa en Excel (.xlsx) o una copia de seguridad en formato JSON.
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    exportToNativeXLSX(registrations);
                    setLiveNotice('✓ Archivo Excel oficial (.xlsx) descargado.');
                    setTimeout(() => setLiveNotice(null), 4000);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>Descargar Excel Oficial (.xlsx)</span>
                </button>

                <button
                  onClick={() => {
                    handleExportFullJSON();
                    setLiveNotice('✓ Archivo de respaldo JSON generado.');
                    setTimeout(() => setLiveNotice(null), 4000);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition flex items-center gap-1.5 border border-neutral-700 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span>Descargar Backup JSON</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Admin Live Roulette Controls (25 Sorteos) */}
      {showRouletteModal && (
        <AdminRouletteModal
          onClose={() => setShowRouletteModal(false)}
          registrations={registrations}
        />
      )}

      {/* Modal: Digital Turkey Raffle Live Drum (Santa Run 2026) */}
      {showTurkeyLottery && (
        <SantaTurkeyLotteryModal
          runners={registrations}
          onClose={() => setShowTurkeyLottery(false)}
        />
      )}
    </div>
  );
};
