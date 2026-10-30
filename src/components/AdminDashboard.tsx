import React, { useState, useEffect } from 'react';
import { RunnerRegistration, PaymentStatus, RaceModality } from '../types/race';
import { saveRegistrations, getStoredRegistrations } from '../data/initialRegistrations';
import { adminLogout, updateAdminPassword } from '../data/auth';
import { processStartCheckinSafe, subscribeToRegistrationsFirestore } from '../utils/checkinManager';
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
  Download
} from 'lucide-react';
import { AdminAnalyticsTab } from './AdminAnalyticsTab';
import { AdminRouletteModal } from './AdminRouletteModal';
import { fetchAnalytics, AnalyticsSummary } from '../utils/analytics';

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

  // Modals
  const [scannedRunnerModal, setScannedRunnerModal] = useState<RunnerRegistration | null>(null);

  // Edit Runner DNI/Phone modal
  const [editingRunner, setEditingRunner] = useState<RunnerRegistration | null>(null);
  const [editDniValue, setEditDniValue] = useState('');
  const [editPhoneValue, setEditPhoneValue] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleSaveRunnerEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRunner) return;
    setIsSavingEdit(true);
    try {
      const res = await fetch('/api/runner/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runnerId: editingRunner.id,
          documentNumber: editDniValue.trim(),
          whatsapp: editPhoneValue.trim(),
        }),
      });
      if (res.ok) {
        const updatedList = registrations.map((r) =>
          r.id === editingRunner.id
            ? { ...r, documentNumber: editDniValue.trim(), whatsapp: editPhoneValue.trim() }
            : r
        );
        onUpdateRegistrations(updatedList);
        saveRegistrations(updatedList);
        setEditingRunner(null);
        setLiveNotice(`✓ DNI de ${editingRunner.firstName} actualizado correctamente.`);
        setTimeout(() => setLiveNotice(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingEdit(false);
    }
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
      const res = await fetch('/api/analytics/reset', { method: 'POST' });
      if (res.ok) {
        loadAnalytics();
        setLiveNotice('✓ Contadores de analítica reiniciados correctamente.');
        setTimeout(() => setLiveNotice(null), 3500);
      }
    } catch (e) {}
  };

  useEffect(() => {
    // Generate official kit delivery check-in QR code for Plaza de Armas
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
        fetchLiveRegistrations();
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

    return matchSearch && matchCheckin;
  });

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 overflow-y-auto text-neutral-100 flex flex-col min-h-screen selection:bg-lime-400 selection:text-black">
      {/* Top Sticky Header Bar (Fluid page navigation) */}
      <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 shadow-xl px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-lime-400 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-lime-400/30 shadow-sm"
              title="Volver a la página principal de la carrera"
            >
              <ArrowLeft className="w-4 h-4 text-lime-400" />
              <span>Volver a la Web</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bebas text-2xl sm:text-3xl text-white tracking-wide uppercase leading-none">
                  Panel del <span className="text-lime-400">Organizador</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-lime-400/20 text-lime-400 font-bold uppercase text-[10px] tracking-wider border border-lime-400/30 hidden sm:inline-block">
                  Acreditación & Entrega de Kits
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5 hidden md:block">
                Plaza de Armas de Tarapoto • {totalCount} atletas registrados
              </p>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Ruleta de Sorteos (22 Premios) */}
            <button
              onClick={() => setShowRouletteModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-black rounded-xl text-xs font-black transition shadow-lg shadow-amber-500/25 cursor-pointer ring-2 ring-yellow-400/50 hover:scale-[1.02]"
              title="Controlar y Girar Ruleta de Sorteos en Vivo (22 Premios / 266 Tickets)"
            >
              <Trophy className="w-4 h-4 text-black" />
              <span>🎡 Sorteos (22 Premios)</span>
            </button>

            {/* Kit Delivery QR Projector Button */}
            <button
              onClick={() => setShowStartQRModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-lime-400 to-lime-300 hover:from-lime-300 text-black rounded-xl text-xs font-black transition shadow-lg shadow-lime-400/25 cursor-pointer ring-2 ring-lime-400/50"
              title="Mostrar y proyectar QR oficial de entrega de kit para la Plaza de Armas"
            >
              <QrCode className="w-4 h-4 text-black" />
              <span>🏁 QR Entrega de Kit</span>
            </button>

            {/* Live refresh */}
            <button
              onClick={fetchLiveRegistrations}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer border border-neutral-700"
              title="Sincronizar participantes en tiempo real"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-lime-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Actualizar Nómina</span>
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
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-neutral-900 to-emerald-950/90 border-2 border-emerald-400 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xl shadow-emerald-500/20 animate-pulse">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-sm">{liveNotice}</span>
            </div>
            <button
              onClick={() => setLiveNotice(null)}
              className="text-emerald-400 hover:text-white p-1 rounded-lg hover:bg-emerald-900/60 cursor-pointer"
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
                  ? 'bg-lime-400 text-black shadow-lg shadow-lime-400/20 font-black'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Control de Atletas ({totalCount})</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('analytics')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
                activeAdminTab === 'analytics'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-black'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-purple-300" />
              <span>Métricas & Tráfico en Vivo</span>
              {analyticsData && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-purple-950 text-purple-200 text-[10px] border border-purple-400/40 font-mono">
                  {analyticsData.totalPageViews} visitas
                </span>
              )}
            </button>

            <button
              onClick={() => setShowRouletteModal(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer bg-neutral-900 text-amber-400 hover:text-white hover:bg-neutral-800 border border-amber-500/30 hover:border-amber-400 shadow-sm"
              title="Abrir Ruleta y Sorteos Oficiales"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>🎡 Ruleta & Sorteos</span>
            </button>
          </div>

          <div className="text-xs text-neutral-400 flex items-center gap-3">
            <span className="hidden sm:inline">Concentración: <strong className="text-lime-400">5:30 PM</strong></span>
            {analyticsData && (
              <span className="hidden md:inline text-purple-300 font-medium">
                🎒 Clics en Mi Espacio: <strong className="text-white font-mono">{analyticsData.miEspacioClicks}</strong>
              </span>
            )}
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
            {/* 3 Clean Metric Summary Cards (Focused purely on registration and kit delivery) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-neutral-800 shadow-md">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Atletas</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="font-bebas text-3xl sm:text-4xl text-white">{totalCount}</span>
                  <span className="text-[11px] text-neutral-500">registrados</span>
                </div>
              </div>

              <div className="bg-neutral-900 p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/50 shadow-md shadow-emerald-500/10">
                <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-emerald-400" />
                  Kits Iniciales Entregados
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="font-bebas text-3xl sm:text-4xl text-emerald-400">
                    {String(checkinConfirmedCount).padStart(2, '0')}
                  </span>
                  <span className="text-[11px] text-emerald-500 font-bold">
                    ({Math.round((checkinConfirmedCount / (totalCount || 1)) * 100)}%)
                  </span>
                </div>
              </div>

              <div className="bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-amber-500/40 shadow-md">
                <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Pendientes de Kit
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="font-bebas text-3xl sm:text-4xl text-amber-400">
                    {String(checkinPendingCount).padStart(2, '0')}
                  </span>
                  <span className="text-[11px] text-neutral-500">en Plaza de Armas</span>
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
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-lime-400 transition text-xs"
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
                </div>
              </div>
            </div>

        {/* Official Participant Table (No 'tallas', No 'meta / medalla', fluid view) */}
        <div className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-lime-400" />
              <h3 className="font-bebas text-2xl text-white uppercase tracking-wide">
                Nómina Oficial de Participantes ({filteredRegistrations.length})
              </h3>
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              Control de Acreditación y Entrega de Kit Inicial
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-3">N°</th>
                  <th className="py-3.5 px-3">Nombres y Apellidos</th>
                  <th className="py-3.5 px-3">Entrega de Kit Inicial (Check-in QR)</th>
                  <th className="py-3.5 px-3">DNI / Celular</th>
                  <th className="py-3.5 px-3 text-right">Modalidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-neutral-500 text-sm">
                      No se encontraron participantes con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((runner, index) => {
                    const isRunVirtual = runner.modality === 'Virtual';
                    return (
                      <tr key={runner.id} className="hover:bg-neutral-800/50 transition">
                        {/* Correlative index */}
                        <td className="py-3.5 px-3 font-mono font-bold text-neutral-400 text-xs">
                          {index + 1}
                        </td>

                        {/* Participant Name */}
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-white text-sm">
                            {runner.firstName} {runner.lastName}
                          </div>
                          <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-lime-400/80 font-bold">{runner.id}</span>
                            {runner.willWearCostume && (
                              <span className="text-[10px] text-purple-400 bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-500/30">
                                🎃 {runner.costumeName || 'Disfraz'}
                              </span>
                            )}
                            {runner.runningClub && (
                              <span className="text-[10px] text-neutral-400 bg-neutral-800 px-1.5 rounded">
                                {runner.runningClub}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Entrega de Kit Inicial (Check-in QR) - PRIMERO */}
                        <td className="py-3.5 px-3">
                          {runner.confirmedAtStart ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleToggleKitDelivery(runner.id, true)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black uppercase transition cursor-pointer border bg-emerald-950/90 text-emerald-400 border-emerald-500/60 hover:bg-red-950/70 hover:text-red-300 hover:border-red-500/40 shadow-sm shadow-emerald-500/20 group"
                                title="Kit inicial entregado. Clic para desmarcar."
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-400 group-hover:hidden" />
                                <X className="w-3.5 h-3.5 text-red-400 hidden group-hover:inline" />
                                <span className="group-hover:hidden">✓ Kit Entregado</span>
                                <span className="hidden group-hover:inline">Desmarcar</span>
                              </button>
                              {runner.startCheckinTime && (
                                <span className="text-[10px] text-emerald-300 font-mono hidden md:inline">
                                  {new Date(runner.startCheckinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleToggleKitDelivery(runner.id, false)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase transition cursor-pointer border bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white hover:border-lime-400 hover:bg-neutral-700 shadow-sm"
                              title="Marcar entrega de kit inicial para este participante"
                            >
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>Entregar Kit</span>
                            </button>
                          )}
                        </td>

                        {/* DNI & Phone - LUEGO */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5">
                            {runner.documentNumber.includes('Pendiente') ? (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/40">
                                ⚠️ Sin DNI (Ingresó correo)
                              </span>
                            ) : (
                              <span className="font-mono font-bold text-lime-400 text-xs">
                                {runner.documentType}: {runner.documentNumber}
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
                              <Pencil className="w-3 h-3 text-neutral-400 hover:text-lime-400" />
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <a
                              href={`https://wa.me/51${runner.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
                              title="Contactar por WhatsApp"
                            >
                              <Phone className="w-3 h-3 text-emerald-400" />
                              <span>{runner.whatsapp}</span>
                            </a>
                            {runner.documentNumber.includes('Pendiente') && runner.email && (
                              <span className="text-[10px] text-neutral-400 font-mono truncate max-w-[130px]" title={runner.email}>
                                ({runner.email})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Modality at the VERY LAST column */}
                        <td className="py-3.5 px-3 text-right">
                          {isRunVirtual ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-950/80 text-purple-300 border border-purple-500/40">
                              Virtual 5K
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-lime-950/80 text-lime-400 border border-lime-500/40">
                              Presencial 5K
                            </span>
                          )}
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
          <div className="relative max-w-lg w-full bg-neutral-900 border-2 border-lime-400 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setScannedRunnerModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 border-b border-neutral-800 pb-3">
              <div className="w-14 h-14 rounded-2xl bg-lime-400 text-black flex items-center justify-center font-black text-2xl">
                🏃
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-full border border-lime-400/30">
                  Participante Identificado
                </span>
                <h4 className="font-bebas text-3xl text-white uppercase mt-0.5 leading-none">
                  {scannedRunnerModal.firstName} {scannedRunnerModal.lastName}
                </h4>
                <p className="text-xs text-neutral-400">
                  DNI: <strong className="text-lime-400 font-mono">{scannedRunnerModal.documentNumber}</strong> • Código: <strong className="text-white font-mono">{scannedRunnerModal.id}</strong>
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
                <span className="font-bold text-lime-400 font-mono">
                  {scannedRunnerModal.documentNumber}
                </span>
              </div>
            </div>

            {/* Single Prominent Action: Confirm Kit Delivery */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-lime-400/40 space-y-3">
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
                  className={`px-4 py-2 rounded-xl font-bebas text-base uppercase transition cursor-pointer ${
                    scannedRunnerModal.confirmedAtStart
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                      : 'bg-lime-400 text-black hover:bg-lime-300 shadow-md shadow-lime-400/20'
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

      {/* Modal: Official Kit Delivery Check-in QR (For Plaza de Armas Accreditation Desk) */}
      {showStartQRModal && (
        <div className={`fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-xl overflow-y-auto ${isFullScreenQR ? 'p-0' : ''}`}>
          <div className={`relative w-full ${isFullScreenQR ? 'h-full max-w-none rounded-none p-6 sm:p-10 flex flex-col justify-between' : 'max-w-2xl rounded-3xl p-6'} bg-neutral-900 border border-lime-400/50 shadow-[0_0_60px_rgba(163,230,53,0.3)] transition-all`}>
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-lime-400 text-black flex items-center justify-center font-bebas text-xl font-black">
                  🏁
                </div>
                <div>
                  <h4 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide uppercase leading-tight">
                    Mesa de Acreditación • <span className="text-lime-400">QR Entrega de Kit Inicial</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Plaza de Armas de Tarapoto • Concentración 5:30 PM • Sábado 31 de Octubre
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullScreenQR(!isFullScreenQR)}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
                  title={isFullScreenQR ? 'Salir de pantalla completa' : 'Modo pantalla gigante / tablet'}
                >
                  {isFullScreenQR ? <Minimize2 className="w-5 h-5 text-lime-400" /> : <Maximize2 className="w-5 h-5" />}
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
            <div className="my-4 p-3.5 rounded-2xl bg-gradient-to-r from-lime-950/60 via-neutral-950 to-neutral-950 border border-lime-400/40">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-lime-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-lime-400" />
                  Kits Entregados en Tiempo Real:
                </span>
                <span className="font-mono text-white text-sm">
                  {checkinConfirmedCount} de {totalCount} ({Math.round((checkinConfirmedCount / (totalCount || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-lime-500 to-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((checkinConfirmedCount / (totalCount || 1)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Center: Giant High-Contrast QR Code */}
            <div className="flex flex-col items-center justify-center my-2 text-center">
              <div className="p-4 sm:p-6 bg-white rounded-3xl shadow-2xl border-4 border-lime-400/80 max-w-[320px] sm:max-w-[380px] w-full flex items-center justify-center transition-transform hover:scale-[1.02]">
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

              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs font-black uppercase tracking-wider">
                QR Oficial Entrega de Kit • Plaza de Armas
              </div>
              <p className="text-xs text-neutral-300 max-w-lg mt-2 leading-relaxed">
                Este código QR se ubica en la carpa de acreditación de la Plaza de Armas. Los atletas lo escanean con su cámara desde <strong>Mi Espacio 🎒</strong> para confirmar la entrega de su kit inicial en vivo.
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
                  className="px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/40 font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Camera className="w-4 h-4 text-lime-400" />
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
                              h1 { font-size: 38px; margin: 0; color: #a3e635; text-transform: uppercase; }
                              h2 { font-size: 20px; color: #fff; margin: 5px 0 25px 0; font-weight: normal; }
                              .qr-box { background: #fff; padding: 20px; border-radius: 20px; display: inline-block; border: 4px solid #a3e635; }
                              img { width: 380px; height: 380px; display: block; }
                              p { font-size: 18px; margin-top: 25px; color: #e5e5e5; }
                              .badge { background: #f97316; color: #fff; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; text-transform: uppercase; }
                            </style>
                          </head>
                          <body>
                            <span class="badge">Acreditación Oficial</span>
                            <h1>OHANA GO 5K TARAPOTO</h1>
                            <h2>Plaza de Armas • Sábado 31 de Octubre - 5:30 PM</h2>
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
                  className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-bebas text-base uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-lime-400/20"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Cartel de Acreditación
                </button>

                {/* Download High-Res QR Button */}
                {startQrDataUrl && (
                  <a
                    href={startQrDataUrl}
                    download="QR_Entrega_Kit_Ohana_Tarapoto_5K.png"
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-lime-400 hover:text-white font-bebas text-base uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer border border-lime-400/40 shadow-md"
                    title="Descargar imagen oficial del código QR en formato PNG para imprimir"
                  >
                    <Download className="w-4 h-4 text-lime-400" />
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
          <div className="relative max-w-sm w-full bg-neutral-900 border-2 border-lime-400 rounded-3xl p-6 shadow-2xl">
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
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-lime-400"
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
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-lime-400"
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
                  className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-bebas text-lg uppercase tracking-wider cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSavingEdit ? 'Guardando...' : 'Guardar DNI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Admin Live Roulette Controls (22 Sorteos / 266 Tickets) */}
      {showRouletteModal && (
        <AdminRouletteModal
          onClose={() => setShowRouletteModal(false)}
          registrations={registrations}
        />
      )}
    </div>
  );
};
