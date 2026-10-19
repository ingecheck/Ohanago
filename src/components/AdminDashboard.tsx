import React, { useState, useEffect } from 'react';
import { RunnerRegistration, PaymentStatus } from '../types/race';
import { exportToCSV, saveRegistrations } from '../data/initialRegistrations';
import { adminLogout, updateAdminPassword } from '../data/auth';
import {
  Users,
  DollarSign,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  Eye,
  UserPlus,
  LogOut,
  KeyRound,
  Check,
  Award,
  Upload,
  Camera,
  QrCode,
  Trophy,
  Crown,
  AlertCircle,
  Trash2,
  Printer,
} from 'lucide-react';
import { OfficialEventQRsModal } from './OfficialEventQRsModal';
import { QRScannerModal } from './QRScannerModal';

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
  const [activeMainTab, setActiveMainTab] = useState<'registrations' | 'caldero'>('registrations');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassInput, setNewPassInput] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  // QR modals & scanning
  const [showQRsModal, setShowQRsModal] = useState(false);
  const [showStaffScanner, setShowStaffScanner] = useState(false);
  const [staffScanNotice, setStaffScanNotice] = useState<string | null>(null);

  // Medal Photo Management in Admin
  const [showMedalModal, setShowMedalModal] = useState(false);
  const [currentAdminMedal, setCurrentAdminMedal] = useState<string | null>(() =>
    localStorage.getItem('ohana_medal_photo_v2')
  );
  const [tempMedalPreview, setTempMedalPreview] = useState<string | null>(null);
  const [medalSavedNotice, setMedalSavedNotice] = useState(false);

  // Potion game states for exclusive admin view
  const [potionData, setPotionData] = useState<{
    leaderboard: any[];
    totalScans: number;
    winner: any;
    recentFeed: any[];
  }>({
    leaderboard: [],
    totalScans: 0,
    winner: null,
    recentFeed: [],
  });
  const [isProclaimingWinner, setIsProclaimingWinner] = useState(false);

  const fetchPotionLeaderboard = () => {
    fetch('/api/potions')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.leaderboard) {
          setPotionData(data);
        }
      })
      .catch((err) => console.warn('Error fetching potion leaderboard:', err));
  };

  useEffect(() => {
    // Sincronizar con el servidor para que la medalla sea consistente en todos los dispositivos
    fetch('/api/medal')
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data) => {
        if (data && data.image) {
          setCurrentAdminMedal(data.image);
          localStorage.setItem('ohana_medal_photo_v2', data.image);
        } else {
          setCurrentAdminMedal(null);
          localStorage.removeItem('ohana_medal_photo_v2');
        }
      })
      .catch((err) => console.warn('Admin /api/medal fetch:', err));

    fetchPotionLeaderboard();
  }, []);

  // New manual registration state
  const [newManual, setNewManual] = useState({
    firstName: '',
    lastName: '',
    documentNumber: '',
    whatsapp: '',
    email: '',
    age: '25',
    emergencyContactName: 'Familiar',
    emergencyContactPhone: '942000000',
    runningClub: 'Ohana Go',
    willWearCostume: false,
    costumeName: '',
  });

  // Calculate Metrics
  const totalCount = registrations.length;
  const verifiedCount = registrations.filter((r) => r.paymentStatus === 'Verificado').length;
  const pendingCount = registrations.filter((r) => r.paymentStatus === 'Pendiente de Verificación').length;
  const totalIncome = verifiedCount * 50;
  const costumedCount = registrations.filter((r) => r.willWearCostume).length;
  const confirmedAtStartCount = registrations.filter((r) => r.confirmedAtStart).length;

  // Filtered List
  const filtered = registrations.filter((r) => {
    const regNumStr = String(r.registrationNumber || r.bibNumber || '');
    const matchesSearch =
      r.documentNumber.includes(searchTerm) ||
      `${r.firstName} ${r.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      regNumStr.includes(searchTerm) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.runningClub.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || r.paymentStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const togglePaymentStatus = (id: string) => {
    const updated = registrations.map((r) => {
      if (r.id === id) {
        const nextStatus: PaymentStatus =
          r.paymentStatus === 'Verificado' ? 'Pendiente de Verificación' : 'Verificado';
        return { ...r, paymentStatus: nextStatus };
      }
      return r;
    });
    onUpdateRegistrations(updated);
    saveRegistrations(updated);
  };

  const toggleStartCheckin = async (runner: RunnerRegistration) => {
    const nextVal = !runner.confirmedAtStart;
    try {
      await fetch('/api/start-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runnerId: runner.id,
          dorsal: runner.registrationNumber || runner.bibNumber,
          dni: runner.documentNumber,
          token: 'ADMIN_CHECKIN_OVERRIDE',
        }),
      });
    } catch (e) {}

    const updated = registrations.map((r) => {
      if (r.id === runner.id) {
        return {
          ...r,
          confirmedAtStart: nextVal,
          startCheckinTime: nextVal ? new Date().toISOString() : undefined,
        };
      }
      return r;
    });
    onUpdateRegistrations(updated);
    saveRegistrations(updated);
  };

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManual.firstName || !newManual.documentNumber) return;

    const nextNum =
      registrations.length > 0
        ? Math.max(...registrations.map((r) => r.registrationNumber || r.bibNumber || 0)) + 1
        : 1;

    const newEntry: RunnerRegistration = {
      id: `OHA-2026-${String(nextNum).padStart(4, '0')}`,
      registrationNumber: nextNum,
      bibNumber: nextNum,
      firstName: newManual.firstName,
      lastName: newManual.lastName || 'Tarapoto',
      documentType: 'DNI',
      documentNumber: newManual.documentNumber,
      email: newManual.email || `${newManual.documentNumber}@ohanago.pe`,
      whatsapp: newManual.whatsapp || '942000000',
      age: parseInt(newManual.age) || 25,
      gender: 'Masculino',
      city: 'Tarapoto',
      district: 'Tarapoto',
      runningClub: newManual.runningClub || 'Independiente',
      emergencyContactName: newManual.emergencyContactName,
      emergencyContactPhone: newManual.emergencyContactPhone,
      willWearCostume: newManual.willWearCostume,
      costumeName: newManual.costumeName,
      paymentMethod: 'Efectivo / Presencial',
      paymentReference: 'REGISTRO-MANUAL-LOCAL',
      paymentStatus: 'Verificado',
      confirmedAtStart: false,
      totalCandies: 0,
      potionsCollected: [],
      createdAt: new Date().toISOString(),
      disclaimerAccepted: true,
    };

    const updated = [newEntry, ...registrations];
    onUpdateRegistrations(updated);
    saveRegistrations(updated);

    // Sync to backend
    fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    }).catch(() => {});

    setShowAddModal(false);
    setNewManual({
      firstName: '',
      lastName: '',
      documentNumber: '',
      whatsapp: '',
      email: '',
      age: '25',
      emergencyContactName: 'Familiar',
      emergencyContactPhone: '942000000',
      runningClub: 'Ohana Go',
      willWearCostume: false,
      costumeName: '',
    });
  };

  // Staff scans runner's dorsal QR at starting arch
  const handleStaffDorsalScan = (scannedCode: string) => {
    setShowStaffScanner(false);
    // Code format: OHANA-RUNNER-{dni}-{dorsal} or raw DNI or number
    let found = registrations.find(
      (r) =>
        scannedCode.includes(r.documentNumber) ||
        scannedCode === String(r.registrationNumber) ||
        scannedCode === String(r.bibNumber) ||
        scannedCode.includes(r.id)
    );

    if (found) {
      toggleStartCheckin(found);
      setStaffScanNotice(`✓ ¡Dorsal #${found.registrationNumber || found.bibNumber} (${found.firstName} ${found.lastName}) confirmado en partida!`);
      setTimeout(() => setStaffScanNotice(null), 4000);
    } else {
      setStaffScanNotice(`⚠️ No se encontró corredor con código: ${scannedCode}`);
      setTimeout(() => setStaffScanNotice(null), 4000);
    }
  };

  // Proclaim winner of Caldero
  const handleProclaimWinner = async (leader: any) => {
    setIsProclaimingWinner(true);
    try {
      const res = await fetch('/api/potions/proclaim-winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runnerId: leader.runnerId,
          notes: `Ganador absoluto del Caldero de Pociones con ${leader.totalCandies} dulces acumulados por azar.`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.winner) {
        fetchPotionLeaderboard();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProclaimingWinner(false);
    }
  };

  // Reset runner score to 0 (useful for tests or recalibration)
  const handleResetRunnerScore = async (runnerId: string, runnerName: string) => {
    try {
      await fetch('/api/potions/reset-runner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runnerId }),
      });
      fetchPotionLeaderboard();
      const updated = registrations.map((r) =>
        r.id === runnerId ? { ...r, totalCandies: 0, potionsCollected: [] } : r
      );
      onUpdateRegistrations(updated);
      saveRegistrations(updated);
      setStaffScanNotice(`✓ Se reinició el puntaje a 0 para ${runnerName}.`);
      setTimeout(() => setStaffScanNotice(null), 3500);
    } catch (e) {
      console.error(e);
    }
  };

  const topLeader = potionData.leaderboard.length > 0 ? potionData.leaderboard[0] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-7xl h-[95vh] bg-neutral-900 border border-neutral-700 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bebas text-2xl tracking-wider text-white">
                OHANA <span className="text-lime-400 font-extrabold">GO</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-400 font-bold uppercase text-[10px] tracking-wider border border-lime-400/30">
                Panel Organizador
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Gestión oficial de la carrera 5K, check-in de partida y minijuego "Caldero de Pociones".
            </p>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowQRsModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 text-purple-200 rounded-xl text-xs font-bold border border-purple-500/40 transition cursor-pointer shadow-md"
              title="Ver e imprimir códigos QR del evento"
            >
              <QrCode className="w-3.5 h-3.5 text-lime-400" />
              <span>QRs del Evento</span>
            </button>

            <button
              onClick={() => setShowStaffScanner(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-lime-400 rounded-xl text-xs font-bold border border-lime-400/30 transition cursor-pointer"
              title="Escanear dorsal de corredor en largada"
            >
              <Camera className="w-3.5 h-3.5 text-lime-400" />
              <span className="hidden sm:inline">Escanear Asistencia</span>
            </button>

            <button
              onClick={() => {
                setTempMedalPreview(currentAdminMedal);
                setShowMedalModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition border border-neutral-700 hover:border-lime-400 cursor-pointer"
              title="Subir o cambiar foto de la medalla oficial"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Foto Medalla</span>
            </button>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition cursor-pointer"
              title="Cambiar contraseña de administrador"
            >
              <KeyRound className="w-3.5 h-3.5 text-lime-400" />
              <span className="hidden sm:inline">Clave</span>
            </button>

            <button
              onClick={() => exportToCSV(registrations)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>

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

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white bg-neutral-800 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Staff Scan Notice Banner */}
        {staffScanNotice && (
          <div className="my-2 p-3 rounded-2xl bg-lime-950/90 border border-lime-400/50 text-lime-300 text-xs flex items-center justify-between">
            <span>{staffScanNotice}</span>
            <button onClick={() => setStaffScanNotice(null)} className="text-neutral-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Main Sections Navigation Tabs */}
        <div className="flex gap-2 py-3 border-b border-neutral-800 text-xs">
          <button
            onClick={() => setActiveMainTab('registrations')}
            className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
              activeMainTab === 'registrations'
                ? 'bg-lime-400 text-black shadow-md'
                : 'bg-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Inscritos & Asistencia ({totalCount})
          </button>

          <button
            onClick={() => {
              setActiveMainTab('caldero');
              fetchPotionLeaderboard();
            }}
            className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
              activeMainTab === 'caldero'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                : 'bg-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-lime-400" />
            Caldero de Pociones: Ranking Exclusivo ({potionData.totalScans} escaneos)
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-6 py-4">
          
          {/* TAB 1: REGISTRATIONS & ATTENDANCE */}
          {activeMainTab === 'registrations' && (
            <div className="space-y-6">
              {/* Key Metrics KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center gap-3">
                  <div className="p-3 bg-lime-400/10 text-lime-400 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Inscritos</span>
                    <span className="font-bebas text-3xl text-white">{totalCount}</span>
                  </div>
                </div>

                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center gap-3">
                  <div className="p-3 bg-emerald-400/10 text-emerald-400 rounded-xl">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Recaudado (Verificado)</span>
                    <span className="font-bebas text-3xl text-lime-400">S/ {totalIncome}</span>
                  </div>
                </div>

                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center gap-3">
                  <div className="p-3 bg-amber-400/10 text-amber-400 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Pendientes Pago</span>
                    <span className="font-bebas text-3xl text-amber-400">{pendingCount}</span>
                  </div>
                </div>

                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center gap-3">
                  <div className="p-3 bg-cyan-400/10 text-cyan-400 rounded-xl">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Presentes en Partida</span>
                    <span className="font-bebas text-3xl text-cyan-400">{confirmedAtStartCount}</span>
                  </div>
                </div>

                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center gap-3">
                  <div className="p-3 bg-purple-400/10 text-purple-400 rounded-xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Con Disfraz</span>
                    <span className="font-bebas text-3xl text-purple-400">{costumedCount}</span>
                  </div>
                </div>
              </div>

              {/* Filters & Actions Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="Buscar por DNI, Nombre, N° Registro o Club..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-lime-400"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-300 focus:outline-none"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="Verificado">Solo Verificados</option>
                  <option value="Pendiente de Verificación">Solo Pendientes</option>
                </select>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-black rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  Inscribir en Físico
                </button>
              </div>

              {/* Registrations Table */}
              <div className="overflow-x-auto rounded-2xl border border-neutral-800">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] font-bold tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-3">Dorsal</th>
                      <th className="py-3 px-3">Corredor</th>
                      <th className="py-3 px-3">DNI / Doc</th>
                      <th className="py-3 px-3">WhatsApp</th>
                      <th className="py-3 px-3 text-center">Partida</th>
                      <th className="py-3 px-3 text-center">Pociones</th>
                      <th className="py-3 px-3 text-center">Estado Pago</th>
                      <th className="py-3 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/40">
                    {filtered.map((runner) => (
                      <tr key={runner.id} className="hover:bg-neutral-900/60 transition">
                        <td className="py-3 px-3 font-mono font-bold text-lime-400">
                          #{String(runner.registrationNumber || runner.bibNumber || 1).padStart(3, '0')}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-white">
                            {runner.firstName} {runner.lastName}
                          </div>
                          <div className="text-[10px] text-neutral-500">
                            {runner.age} años • {runner.runningClub || 'Independiente'}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-400">
                          {runner.documentNumber}
                        </td>
                        <td className="py-3 px-3 text-neutral-400">
                          {runner.whatsapp}
                        </td>
                        {/* Start Line Check-in Status */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => toggleStartCheckin(runner)}
                            className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase transition cursor-pointer flex items-center justify-center gap-1 mx-auto ${
                              runner.confirmedAtStart
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                : 'bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700'
                            }`}
                            title="Haz clic para marcar o desmarcar presencia en partida"
                          >
                            {runner.confirmedAtStart ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Presente</span>
                              </>
                            ) : (
                              <span>Check-in</span>
                            )}
                          </button>
                        </td>
                        {/* Potions mini-game */}
                        <td className="py-3 px-3 text-center">
                          <span className="font-mono text-[11px] text-purple-300 font-bold">
                            {(runner.potionsCollected || []).length}/5
                          </span>
                          <span className="text-[10px] text-neutral-500 block">
                            {runner.totalCandies || 0} dulces
                          </span>
                        </td>
                        {/* Payment Status */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => togglePaymentStatus(runner.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition cursor-pointer ${
                              runner.paymentStatus === 'Verificado'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {runner.paymentStatus}
                          </button>
                        </td>
                        {/* Action: view proof */}
                        <td className="py-3 px-3 text-right">
                          {runner.paymentProofImage ? (
                            <button
                              onClick={() => setViewingProof(runner.paymentProofImage || null)}
                              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition cursor-pointer"
                              title="Ver comprobante de pago"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-neutral-600">Sin voucher</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CALDERO DE POCIONES - EXCLUSIVE ADMIN LEADERBOARD & WINNER */}
          {activeMainTab === 'caldero' && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-neutral-900 to-black border-2 border-purple-500/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black uppercase mb-2">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    Vista Exclusiva del Administrador
                  </div>
                  <h4 className="font-bebas text-3xl sm:text-4xl text-white tracking-wider uppercase">
                    Tablero Maestro: Caldero de Pociones
                  </h4>
                  <p className="text-xs text-neutral-300 max-w-xl mt-1 leading-relaxed">
                    Los corredores buscan los 5 QRs en Entre Jarras y el sistema les asigna valores aleatorios por cada poción. Por solicitud tuya,{' '}
                    <strong className="text-lime-400">
                      solo tú como Administrador puedes ver esta tabla completa con el total de dulces de cada uno
                    </strong>{' '}
                    para determinar con total transparencia al ganador del premio especial de OHANA GO.
                  </p>
                </div>

                {/* Leader Card & Proclaim Button */}
                {topLeader && (
                  <div className="bg-neutral-950/95 border-2 border-amber-400/60 p-5 rounded-2xl text-center min-w-[240px] shadow-2xl shrink-0">
                    <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-amber-400 mb-1">
                      <Crown className="w-4 h-4 fill-amber-400" />
                      Líder Actual #1
                    </div>
                    <span className="font-bebas text-4xl text-lime-400 font-black block leading-none my-1">
                      {topLeader.totalCandies} Dulces
                    </span>
                    <span className="text-xs font-bold text-white block truncate max-w-[200px] mx-auto">
                      Dorsal #{String(topLeader.dorsal).padStart(3, '0')} • {topLeader.runnerName}
                    </span>
                    <span className="text-[10px] text-purple-300 block mb-3">
                      {topLeader.potionsCollected?.length || 0} de 5 pociones descubiertas
                    </span>

                    <button
                      onClick={() => handleProclaimWinner(topLeader)}
                      disabled={isProclaimingWinner || topLeader.totalCandies === 0}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 disabled:opacity-50 text-black font-bebas text-base uppercase tracking-wider rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/20"
                    >
                      {potionData.winner?.proclaimed ? 'Actualizar Ganador' : 'Proclamar Ganador Oficial'}
                    </button>
                  </div>
                )}
              </div>

              {/* Winner Banner if Proclaimed */}
              {potionData.winner?.proclaimed && (
                <div className="p-4 rounded-2xl bg-amber-950/80 border-2 border-amber-400 text-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-400 text-black flex items-center justify-center font-bold">
                      <Crown className="w-7 h-7 fill-black" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 block">
                        Ganador Oficial Proclamado
                      </span>
                      <h5 className="font-bebas text-2xl text-white">
                        Dorsal #{String(potionData.winner.dorsal).padStart(3, '0')} • {potionData.winner.runnerName} ({potionData.winner.totalCandies} Dulces)
                      </h5>
                      <span className="text-[11px] text-amber-300">
                        {potionData.winner.notes}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Ranked Table */}
              <div className="overflow-x-auto rounded-2xl border border-neutral-800">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] font-bold tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-3 text-center">Rank</th>
                      <th className="py-3 px-3">Dorsal</th>
                      <th className="py-3 px-3">Competidor</th>
                      <th className="py-3 px-3">DNI</th>
                      <th className="py-3 px-3 text-center">Pociones (5 max)</th>
                      <th className="py-3 px-3 text-center font-bold text-lime-400">Total Dulces de Azar</th>
                      <th className="py-3 px-3 text-right">Último Escaneo</th>
                      <th className="py-3 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/40">
                    {potionData.leaderboard.map((item, idx) => (
                      <tr
                        key={item.runnerId}
                        className={`hover:bg-neutral-900/60 transition ${
                          idx === 0 && item.totalCandies > 0 ? 'bg-amber-950/20' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center font-bold">
                          {idx === 0 && item.totalCandies > 0 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-black font-black text-xs">
                              1°
                            </span>
                          ) : (
                            <span className="text-neutral-500 font-mono">{idx + 1}°</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-lime-400">
                          #{String(item.dorsal).padStart(3, '0')}
                        </td>
                        <td className="py-3 px-3 font-semibold text-white">
                          {item.runnerName}
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-400">
                          {item.documentNumber}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-mono font-bold text-purple-300">
                            {item.potionsCollected?.length || 0}/5
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-bebas text-2xl text-lime-400 font-black">
                            {item.totalCandies} 🍬
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-[11px] text-neutral-500">
                          {item.lastScanAt
                            ? new Date(item.lastScanAt).toLocaleTimeString('es-PE', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Sin escaneos'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {item.totalCandies > 0 ? (
                            <button
                              onClick={() => handleResetRunnerScore(item.runnerId, item.runnerName)}
                              className="px-2 py-1 bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-300 rounded-lg text-[10px] font-bold border border-neutral-700 transition cursor-pointer"
                              title="Reiniciar dulces y pociones a 0"
                            >
                              Poner a 0
                            </button>
                          ) : (
                            <span className="text-[10px] text-neutral-600">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal: View Payment Proof */}
        {viewingProof && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90">
            <div className="relative max-w-lg w-full bg-neutral-900 p-4 rounded-3xl border border-neutral-700">
              <button
                onClick={() => setViewingProof(null)}
                className="absolute top-4 right-4 p-2 bg-neutral-800 text-neutral-400 hover:text-white rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h4 className="font-bebas text-2xl text-white uppercase tracking-wider mb-3">
                Comprobante de Pago
              </h4>
              <div className="max-h-[70vh] overflow-auto rounded-2xl bg-black flex items-center justify-center">
                <img src={viewingProof} alt="Voucher" className="max-w-full h-auto object-contain" />
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Manual Runner */}
        {showAddModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90">
            <div className="relative max-w-md w-full bg-neutral-900 p-6 rounded-3xl border border-neutral-700">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-1.5 bg-neutral-800 text-neutral-400 hover:text-white rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <h4 className="font-bebas text-2xl text-white uppercase tracking-wider mb-4">
                Inscripción Presencial / Manual
              </h4>
              <form onSubmit={handleCreateManual} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Nombres</label>
                    <input
                      type="text"
                      required
                      value={newManual.firstName}
                      onChange={(e) => setNewManual({ ...newManual, firstName: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Apellidos</label>
                    <input
                      type="text"
                      value={newManual.lastName}
                      onChange={(e) => setNewManual({ ...newManual, lastName: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">DNI</label>
                    <input
                      type="text"
                      required
                      value={newManual.documentNumber}
                      onChange={(e) => setNewManual({ ...newManual, documentNumber: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">WhatsApp</label>
                    <input
                      type="tel"
                      value={newManual.whatsapp}
                      onChange={(e) => setNewManual({ ...newManual, whatsapp: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-lime-400 text-black font-bebas text-lg uppercase tracking-wider rounded-xl transition cursor-pointer mt-2"
                >
                  Registrar Participante
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Change Password */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90">
            <div className="relative max-w-sm w-full bg-neutral-900 p-6 rounded-3xl border border-neutral-700">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassSuccess(false);
                  setNewPassInput('');
                }}
                className="absolute top-4 right-4 p-1.5 bg-neutral-800 text-neutral-400 hover:text-white rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h4 className="font-bebas text-2xl text-white uppercase tracking-wider mb-2">
                Cambiar Contraseña Admin
              </h4>
              <p className="text-xs text-neutral-400 mb-4">
                Define una nueva clave para acceder a este panel de administración.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newPassInput.trim().length >= 4) {
                    updateAdminPassword(newPassInput.trim());
                    setPassSuccess(true);
                    setTimeout(() => {
                      setShowPasswordModal(false);
                      setPassSuccess(false);
                      setNewPassInput('');
                    }, 1500);
                  }
                }}
                className="space-y-3"
              >
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={newPassInput}
                    onChange={(e) => setNewPassInput(e.target.value)}
                    placeholder="Escribe tu nueva clave"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-lime-400"
                  />
                </div>

                {passSuccess && (
                  <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    ¡Contraseña actualizada exitosamente!
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-lime-400 text-black font-bebas text-lg uppercase tracking-wider rounded-xl transition cursor-pointer mt-2"
                >
                  Guardar Nueva Clave
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Manage Official Medal Photo */}
        {showMedalModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="relative max-w-md w-full bg-neutral-900 p-6 rounded-3xl border border-neutral-700 shadow-2xl">
              <button
                onClick={() => {
                  setShowMedalModal(false);
                  setMedalSavedNotice(false);
                }}
                className="absolute top-4 right-4 p-1.5 bg-neutral-800 text-neutral-400 hover:text-white rounded-full cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h4 className="font-bebas text-2xl text-white uppercase tracking-wider">
                  Foto Oficial de la Medalla Finisher
                </h4>
              </div>
              <p className="text-xs text-neutral-400 mb-4">
                Sube la foto real de la medalla. Se sincronizará inmediatamente en todos los navegadores y dispositivos de los visitantes.
              </p>

              <div className="my-3 flex flex-col items-center justify-center p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
                {tempMedalPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-lime-400/80 shadow-[0_0_30px_rgba(163,230,53,0.35)] max-h-60 bg-black">
                    <img
                      src={tempMedalPreview}
                      alt="Vista previa medalla"
                      className="max-h-56 w-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="py-8 text-center text-neutral-500 text-xs">
                    <Camera className="w-10 h-10 mx-auto text-neutral-600 mb-2" />
                    <span>Sin foto personalizada activa. Se muestra el distintivo oficial.</span>
                  </div>
                )}

                <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold border border-neutral-700 hover:border-lime-400 transition cursor-pointer">
                  <Upload className="w-4 h-4 text-lime-400" />
                  <span>Seleccionar archivo de foto (PNG / JPG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setTempMedalPreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {medalSavedNotice && (
                <div className="my-3 p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>¡Foto actualizada y publicada para todos los visitantes!</span>
                </div>
              )}

              <div className="space-y-2 mt-4">
                <button
                  type="button"
                  disabled={!tempMedalPreview}
                  onClick={async () => {
                    if (tempMedalPreview) {
                      localStorage.setItem('ohana_medal_photo_v2', tempMedalPreview);
                      setCurrentAdminMedal(tempMedalPreview);
                      window.dispatchEvent(new Event('ohana_medal_updated'));

                      try {
                        await fetch('/api/medal', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ image: tempMedalPreview }),
                        });
                      } catch (err) {
                        console.error('Error enviando medalla al servidor:', err);
                      }

                      setMedalSavedNotice(true);
                      setTimeout(() => setMedalSavedNotice(false), 2500);
                    }
                  }}
                  className="w-full py-3 bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-black font-bebas text-lg uppercase tracking-wider rounded-xl transition cursor-pointer shadow-lg shadow-lime-400/20"
                >
                  Guardar y Publicar en la Web (Visible para Todos)
                </button>

                {currentAdminMedal && (
                  <button
                    type="button"
                    onClick={async () => {
                      localStorage.removeItem('ohana_medal_photo_v2');
                      setCurrentAdminMedal(null);
                      setTempMedalPreview(null);
                      window.dispatchEvent(new Event('ohana_medal_updated'));

                      try {
                        await fetch('/api/medal', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ image: null }),
                        });
                      } catch (err) {}

                      setMedalSavedNotice(true);
                      setTimeout(() => setMedalSavedNotice(false), 2500);
                    }}
                    className="w-full py-2 bg-neutral-950 hover:bg-red-950 text-neutral-400 hover:text-red-400 text-xs font-bold rounded-xl transition cursor-pointer border border-neutral-800"
                  >
                    Eliminar Foto y Restablecer
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Official Event QRs Generator & Printer */}
        {showQRsModal && (
          <OfficialEventQRsModal onClose={() => setShowQRsModal(false)} />
        )}

        {/* Modal: Staff Scanner to Check-in Runners at Start Line */}
        {showStaffScanner && (
          <QRScannerModal
            title="Escanear Asistencia de Partida"
            subtitle="Apunta la cámara al QR del pase digital o dorsal físico del corredor."
            expectedType="any"
            onScanSuccess={handleStaffDorsalScan}
            onClose={() => setShowStaffScanner(false)}
          />
        )}

      </div>
    </div>
  );
};
