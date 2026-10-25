import React, { useState, useEffect } from 'react';
import { RunnerRegistration, PaymentStatus, RaceModality } from '../types/race';
import { saveRegistrations } from '../data/initialRegistrations';
import { adminLogout, updateAdminPassword } from '../data/auth';
import QRCode from 'qrcode';
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
  Globe,
  MapPin,
  RefreshCw,
  Phone,
  Shirt,
  ShieldAlert,
  Calendar,
  DollarSign,
  Maximize2,
  Minimize2,
  Printer
} from 'lucide-react';
import { DigitalBib } from './DigitalBib';

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
  const [filterPayment, setFilterPayment] = useState<'all' | 'Verificado' | 'Pendiente'>('all');
  
  // Modals
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [viewingBibRunner, setViewingBibRunner] = useState<RunnerRegistration | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassInput, setNewPassInput] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  // Start Line Official Check-in QR and Staff Scanner
  const [showStartQRModal, setShowStartQRModal] = useState(false);
  const [isFullScreenQR, setIsFullScreenQR] = useState(false);
  const [startQrDataUrl, setStartQrDataUrl] = useState<string | null>(null);
  const [showStaffScanner, setShowStaffScanner] = useState(false);
  const [liveNotice, setLiveNotice] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Generate official start check-in QR code for Plaza de Armas
    const origin = window.location.origin;
    const startUrl = `${origin}/?checkin=start&token=OHANA-START-LINE-TARAPOTO-2026`;
    QRCode.toDataURL(startUrl, {
      width: 600,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then((url) => setStartQrDataUrl(url))
      .catch((err) => console.error('Error generating start QR:', err));
  }, []);

  const fetchLiveRegistrations = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/registrations');
      if (res.ok) {
        const serverList: RunnerRegistration[] = await res.json();
        if (Array.isArray(serverList) && serverList.length > 0) {
          onUpdateRegistrations(serverList);
        }
      }
    } catch (err) {
      console.warn('Error fetching registrations:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  useEffect(() => {
    fetchLiveRegistrations();
    const intervalId = setInterval(fetchLiveRegistrations, 2500);

    const handleCheckinEvent = (e: any) => {
      fetchLiveRegistrations();
      if (e?.detail) {
        setLiveNotice(`🎉 ¡${e.detail.firstName} ${e.detail.lastName} acaba de confirmar asistencia en vivo!`);
        setTimeout(() => setLiveNotice(null), 5000);
      }
    };

    window.addEventListener('ohana-checkin', handleCheckinEvent);
    window.addEventListener('storage', fetchLiveRegistrations);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('ohana-checkin', handleCheckinEvent);
      window.removeEventListener('storage', fetchLiveRegistrations);
    };
  }, []);

  // Handlers for payments and check-in
  const handleTogglePayment = async (id: string, currentStatus: PaymentStatus) => {
    const newStatus: PaymentStatus =
      currentStatus === 'Verificado' ? 'Pendiente de Verificación' : 'Verificado';
    const updated = registrations.map((r) =>
      r.id === id ? { ...r, paymentStatus: newStatus } : r
    );
    onUpdateRegistrations(updated);
    saveRegistrations(updated);
  };

  const handleToggleCheckin = async (runnerId: string, currentVal: boolean) => {
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
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassInput.trim()) return;
    updateAdminPassword(newPassInput.trim());
    setPassSuccess(true);
    setNewPassInput('');
    setTimeout(() => {
      setPassSuccess(false);
      setShowPasswordModal(false);
    }, 1500);
  };

  // Metrics calculation
  const totalCount = registrations.length;
  const verifiedCount = registrations.filter((r) => r.paymentStatus === 'Verificado').length;
  const pendingPaymentCount = totalCount - verifiedCount;
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

    // Payment filter
    const matchPayment =
      filterPayment === 'all' ||
      (filterPayment === 'Verificado' && r.paymentStatus === 'Verificado') ||
      (filterPayment === 'Pendiente' && r.paymentStatus !== 'Verificado');

    return matchSearch && matchCheckin && matchPayment;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-7xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl p-4 sm:p-6 overflow-hidden my-4 max-h-[96vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bebas text-3xl sm:text-4xl text-white tracking-wide uppercase">
                Panel del <span className="text-lime-400">Organizador</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-lime-400/20 text-lime-400 font-bold uppercase text-[10px] tracking-wider border border-lime-400/30">
                OHANA GO 5K • En Vivo
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Control en tiempo real de asistencia con QR, validación de corredores y estado oficial.
            </p>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Start Line QR Code Button (Project on screen or show in Plaza) */}
            <button
              onClick={() => setShowStartQRModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-lime-400 to-lime-300 hover:from-lime-300 text-black rounded-xl text-xs font-black transition shadow-lg shadow-lime-400/25 cursor-pointer ring-2 ring-lime-400/50"
              title="Mostrar y proyectar QR oficial de check-in para que los corredores lo escaneen en la Plaza de Armas"
            >
              <QrCode className="w-4 h-4 text-black" />
              <span>🏁 QR Partida (Plaza)</span>
            </button>

            {/* Staff scan runner pass button */}
            <button
              onClick={() => setShowStaffScanner(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-lime-400 rounded-xl text-xs font-bold transition border border-lime-400/30 cursor-pointer shadow-sm"
              title="Escanear pase digital de un corredor con la cámara del organizador"
            >
              <Camera className="w-4 h-4" />
              <span>Escanear QR de Corredor</span>
            </button>

            {/* Live refresh */}
            <button
              onClick={fetchLiveRegistrations}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer border border-neutral-700"
              title="Recargar y sincronizar participantes en tiempo real"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-lime-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            {/* Change Password */}
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition cursor-pointer"
              title="Cambiar contraseña de administrador"
            >
              <KeyRound className="w-3.5 h-3.5 text-lime-400" />
              <span className="hidden sm:inline">Clave</span>
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

            {/* Close modal */}
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white bg-neutral-800 rounded-full transition cursor-pointer"
              title="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Automatic Check-in Notice Alert */}
        {liveNotice && (
          <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-neutral-900 to-emerald-950/90 border-2 border-emerald-400 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xl shadow-emerald-500/20 animate-pulse">
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

        {/* Metrics Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
          <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Inscritos</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-bebas text-3xl text-white">{totalCount}</span>
              <span className="text-[11px] text-neutral-500">participantes</span>
            </div>
          </div>

          <div className="bg-neutral-950 p-3.5 rounded-2xl border-2 border-emerald-500/50 shadow-sm shadow-emerald-500/10">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              QR Escaneado / En Partida
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-bebas text-3xl text-emerald-400">{checkinConfirmedCount}</span>
              <span className="text-[11px] text-emerald-500 font-bold">
                ({Math.round((checkinConfirmedCount / (totalCount || 1)) * 100)}%)
              </span>
            </div>
          </div>

          <div className="bg-neutral-950 p-3.5 rounded-2xl border border-amber-500/40">
            <span className="text-[10px] uppercase font-bold text-amber-400 block flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Pendientes de Escaneo
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-bebas text-3xl text-amber-400">{checkinPendingCount}</span>
              <span className="text-[11px] text-neutral-500">por registrar</span>
            </div>
          </div>

          <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">Pagos Verificados</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-bebas text-3xl text-lime-400">{verifiedCount}</span>
              <span className="text-[11px] text-neutral-500">de {totalCount}</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800 text-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, DNI, celular o ciudad..."
              className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-lime-400 transition text-xs"
            />
          </div>

          {/* Filter Tabs (QR Escaneado vs Sin Escanear) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Attendance / QR Filter */}
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
                title="Mostrar únicamente participantes que ya pasaron el QR"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>✓ Con QR Escaneado ({checkinConfirmedCount})</span>
              </button>
              <button
                onClick={() => setFilterCheckin('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  filterCheckin === 'pending'
                    ? 'bg-amber-950 border border-amber-500/60 text-amber-400 shadow-sm shadow-amber-500/20'
                    : 'text-neutral-400 hover:text-amber-300'
                }`}
                title="Mostrar participantes pendientes por escanear"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>⏳ Sin Escanear ({checkinPendingCount})</span>
              </button>
            </div>

            {/* Payment Filter */}
            <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              <button
                onClick={() => setFilterPayment('all')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterPayment === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Pagos
              </button>
              <button
                onClick={() => setFilterPayment('Verificado')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-emerald-400 ${
                  filterPayment === 'Verificado' ? 'bg-emerald-950 border border-emerald-500/40 font-bold' : 'hover:text-emerald-300'
                }`}
              >
                Pagados ({verifiedCount})
              </button>
              <button
                onClick={() => setFilterPayment('Pendiente')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-amber-400 ${
                  filterPayment === 'Pendiente' ? 'bg-amber-950 border border-amber-500/40 font-bold' : 'hover:text-amber-300'
                }`}
              >
                Pendientes ({pendingPaymentCount})
              </button>
            </div>
          </div>
        </div>

        {/* Registrations Complete Table */}
        <div className="flex-1 overflow-y-auto mt-2 -mx-4 sm:-mx-6 px-4 sm:px-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-neutral-900 border-b border-neutral-800 text-neutral-400 uppercase text-[10px] font-bold tracking-wider z-10">
              <tr>
                <th className="py-3 px-3">N°</th>
                <th className="py-3 px-3">Nombres y Apellidos</th>
                <th className="py-3 px-3">DNI / Celular</th>
                <th className="py-3 px-3">Talla & Modalidad</th>
                <th className="py-3 px-3">Ubicación / Emergencia</th>
                <th className="py-3 px-3">Estado QR / Asistencia</th>
                <th className="py-3 px-3">Pago</th>
                <th className="py-3 px-3 text-right">Pase Oficial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-neutral-500 text-xs">
                    No se encontraron participantes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((runner, index) => {
                  const isRunVirtual = runner.modality === 'Virtual';
                  return (
                    <tr key={runner.id} className="hover:bg-neutral-800/40 transition">
                      {/* Correlative index */}
                      <td className="py-3 px-3 font-mono font-bold text-neutral-400 text-xs">
                        {index + 1}
                      </td>

                      {/* Participant Name */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-white text-sm">
                          {runner.firstName} {runner.lastName}
                        </div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-neutral-500">{runner.id}</span>
                          {runner.willWearCostume && (
                            <span className="text-[10px] text-purple-400 bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-500/30">
                              🎃 Disfraz: {runner.costumeName || 'Sí'}
                            </span>
                          )}
                          {runner.runningClub && (
                            <span className="text-[10px] text-neutral-400 bg-neutral-800 px-1.5 rounded">
                              Club: {runner.runningClub}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* DNI & Phone */}
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-lime-400 text-xs">
                          {runner.documentType}: {runner.documentNumber}
                        </div>
                        <a
                          href={`https://wa.me/51${runner.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-0.5 transition"
                          title="Contactar por WhatsApp"
                        >
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{runner.whatsapp}</span>
                        </a>
                      </td>

                      {/* Shirt Size & Modality */}
                      <td className="py-3 px-3">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-800 text-white font-bold text-[11px]">
                          <Shirt className="w-3 h-3 text-neutral-400" />
                          <span>Talla {runner.tShirtSize || 'M'}</span>
                        </div>
                        <div className="mt-1">
                          {isRunVirtual ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold uppercase bg-purple-950/80 text-purple-300 border border-purple-500/40">
                              Virtual 5K
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold uppercase bg-lime-950/80 text-lime-400 border border-lime-500/40">
                              Presencial
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Location & Emergency */}
                      <td className="py-3 px-3 text-[11px] text-neutral-300">
                        <div className="font-semibold text-white truncate max-w-[150px]">
                          {runner.city} • {runner.district}
                        </div>
                        <div className="text-neutral-400 text-[10px] truncate max-w-[150px]">
                          Emergencia: {runner.emergencyContactName} ({runner.emergencyContactPhone})
                        </div>
                      </td>

                      {/* Attendance / QR Checkin State */}
                      <td className="py-3 px-3">
                        {runner.confirmedAtStart ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleCheckin(runner.id, true)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black uppercase transition cursor-pointer border bg-emerald-950/90 text-emerald-400 border-emerald-500/60 hover:bg-red-950/70 hover:text-red-300 hover:border-red-500/40 shadow-sm shadow-emerald-500/20 group"
                              title="Asistencia confirmada con QR. Clic para desmarcar si es necesario."
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-400 group-hover:hidden" />
                              <X className="w-3.5 h-3.5 text-red-400 hidden group-hover:inline" />
                              <span className="group-hover:hidden">✓ QR Escaneado</span>
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
                            onClick={() => handleToggleCheckin(runner.id, false)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase transition cursor-pointer border bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white hover:border-lime-400 hover:bg-neutral-700"
                            title="Hacer clic para marcar asistencia manual de este corredor"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Validar Asistencia</span>
                          </button>
                        )}
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleTogglePayment(runner.id, runner.paymentStatus)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition cursor-pointer border flex items-center gap-1 ${
                            runner.paymentStatus === 'Verificado'
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900'
                              : 'bg-amber-950/80 text-amber-400 border-amber-500/40 hover:bg-amber-900'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {runner.paymentStatus === 'Verificado' ? 'Verificado' : 'Pendiente'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {runner.paymentProofImage && (
                            <button
                              onClick={() => setViewingProof(runner.paymentProofImage || null)}
                              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-lime-400 transition cursor-pointer"
                              title="Ver voucher de pago"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setViewingBibRunner(runner)}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-lime-400 transition cursor-pointer"
                            title="Ver pase digital y código QR"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
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

      {/* Modal: View Payment Voucher */}
      {viewingProof && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-neutral-900 rounded-2xl p-4 border border-neutral-800">
            <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-2">
              <h4 className="font-bebas text-xl text-white uppercase">Comprobante de Pago</h4>
              <button
                onClick={() => setViewingProof(null)}
                className="p-1 rounded-full bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[70vh]">
              <img src={viewingProof} alt="Voucher" className="max-w-full max-h-[70vh] object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Digital Pass */}
      {viewingBibRunner && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="relative max-w-md w-full bg-neutral-900 rounded-3xl p-5 border border-lime-400/40">
            <button
              onClick={() => setViewingBibRunner(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <DigitalBib registration={viewingBibRunner} />
          </div>
        </div>
      )}

      {/* Modal: Change Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-sm w-full bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-2xl">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="font-bebas text-2xl text-white uppercase mb-3">Cambiar Clave de Acceso</h4>
            <form onSubmit={handleUpdatePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  required
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-lime-400"
                  placeholder="Ingresa nueva contraseña"
                />
              </div>
              {passSuccess && (
                <div className="text-xs text-lime-400 flex items-center gap-1 font-bold">
                  <Check className="w-3.5 h-3.5" /> Clave actualizada con éxito.
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime-400 text-black font-bebas text-base uppercase"
                >
                  Guardar Clave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Start Line Official Check-in QR (Visible exclusively in Admin Dashboard for Plaza de Armas) */}
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
                    Punto de Partida • <span className="text-lime-400">QR Oficial de Check-in</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Plaza de Armas de Tarapoto • Sábado 31 de Octubre 2026
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
                  Asistencia en Partida en Tiempo Real:
                </span>
                <span className="font-mono text-white text-sm">
                  {checkinConfirmedCount} de {totalCount} confirmados ({Math.round((checkinConfirmedCount / (totalCount || 1)) * 100)}%)
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
                    alt="Código QR de Partida OHANA GO 5K"
                    className="w-full h-auto object-contain aspect-square"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-neutral-400 text-xs">
                    Generando código QR...
                  </div>
                )}
              </div>

              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs font-black uppercase tracking-wider">
                QR Oficial de Largada • Plaza de Armas
              </div>
              <p className="text-xs text-neutral-300 max-w-lg mt-2 leading-relaxed">
                Este es el código QR que se colocará impreso en el stand o arco de largada de la Plaza de Armas. Los participantes lo escanean con su teléfono desde <strong>Mi Espacio 🎒</strong> para confirmar su asistencia presencial en vivo.
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
                            <title>QR Partida OHANA GO 5K Tarapoto</title>
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
                            <span class="badge">Punto de Largada Oficial</span>
                            <h1>OHANA GO 5K TARAPOTO</h1>
                            <h2>Plaza de Armas • Sábado 31 de Octubre</h2>
                            <div class="qr-box">
                              <img src="${startQrDataUrl}" />
                            </div>
                            <p><strong>Apunta con la cámara de tu celular para registrar tu asistencia en vivo</strong></p>
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
                  Imprimir Cartel para Arco
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Staff Scanner Modal (Admin scans runner's digital pass with camera) */}
      {showStaffScanner && (
        <QRScannerModal
          title="Control de Partida • Escanear Pase de Atleta"
          subtitle="Apunta la cámara al código QR del pase digital o credencial del competidor."
          expectedType="any"
          onScanSuccess={async (scannedText) => {
            setShowStaffScanner(false);
            try {
              const res = await fetch('/api/start-checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  runnerId: scannedText,
                  dni: scannedText,
                  token: 'ADMIN_CHECKIN_OVERRIDE',
                }),
              });
              const data = await res.json();
              if (res.ok && data.runner) {
                const updated = registrations.map((r) => r.id === data.runner.id ? data.runner : r);
                onUpdateRegistrations(updated);
                saveRegistrations(updated);
                setLiveNotice(`🎉 ¡${data.runner.firstName} ${data.runner.lastName} (DNI: ${data.runner.documentNumber}) confirmado en partida!`);
                setTimeout(() => setLiveNotice(null), 5000);
              } else {
                setLiveNotice(`❌ ${data.error || 'No se encontró un competidor registrado con ese código.'}`);
                setTimeout(() => setLiveNotice(null), 5000);
              }
            } catch (err) {
              setLiveNotice('❌ Error de conexión al validar check-in.');
              setTimeout(() => setLiveNotice(null), 4000);
            }
          }}
          onClose={() => setShowStaffScanner(false)}
        />
      )}

    </div>
  );
};
