import React, { useState, useEffect } from 'react';
import { RunnerRegistration, PaymentStatus, RaceModality, VirtualEvidence } from '../types/race';
import { exportToCSV, saveRegistrations } from '../data/initialRegistrations';
import { adminLogout, updateAdminPassword } from '../data/auth';
import QRCode from 'qrcode';
import { QRScannerModal } from './QRScannerModal';
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
  Globe,
  MapPin,
  Truck,
  AlertCircle,
  Trash2,
  Activity,
  Maximize2,
  Minimize2,
  Printer,
  RefreshCw
} from 'lucide-react';
import { DigitalBib } from './DigitalBib';

interface AdminDashboardProps {
  registrations: RunnerRegistration[];
  onUpdateRegistrations: (updated: RunnerRegistration[]) => void;
  onClose: () => void;
  onLogout: () => void;
}

const DEPARTMENTS_PERU = [
  'San Martín',
  'Lima',
  'Loreto',
  'Ucayali',
  'Amazonas',
  'La Libertad',
  'Lambayeque',
  'Piura',
  'Cajamarca',
  'Arequipa',
  'Cusco',
  'Junín',
  'Áncash',
  'Otro Departamento'
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  registrations,
  onUpdateRegistrations,
  onClose,
  onLogout,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModality, setFilterModality] = useState<'all' | 'Presencial' | 'Virtual'>('all');
  const [filterPayment, setFilterPayment] = useState<'all' | 'Verificado' | 'Pendiente'>('all');
  const [filterCheckin, setFilterCheckin] = useState<'all' | 'confirmed' | 'pending'>('all');
  
  // Modals
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [viewingEvidenceRunner, setViewingEvidenceRunner] = useState<RunnerRegistration | null>(null);
  const [viewingBibRunner, setViewingBibRunner] = useState<RunnerRegistration | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassInput, setNewPassInput] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  // Start Line Official Check-in QR and Staff Scanner
  const [showStartQRModal, setShowStartQRModal] = useState(false);
  const [isFullScreenQR, setIsFullScreenQR] = useState(false);
  const [startQrDataUrl, setStartQrDataUrl] = useState<string | null>(null);
  const [showStaffScanner, setShowStaffScanner] = useState(false);
  const [liveNotice, setLiveNotice] = useState<string | null>(null);

  // Medal Photo Management in Admin
  const [showMedalModal, setShowMedalModal] = useState(false);
  const [currentAdminMedal, setCurrentAdminMedal] = useState<string | null>(null);
  const [tempMedalPreview, setTempMedalPreview] = useState<string | null>(null);
  const [medalSavedNotice, setMedalSavedNotice] = useState(false);

  // New Manual Runner Form
  const [newManual, setNewManual] = useState({
    modality: 'Presencial' as RaceModality,
    firstName: '',
    lastName: '',
    documentNumber: '',
    whatsapp: '',
    email: '',
    age: '25',
    department: 'San Martín',
    city: 'Tarapoto',
    district: 'Tarapoto',
    shippingAddress: '',
    runningClub: 'Independiente',
    emergencyContactName: 'Familiar',
    emergencyContactPhone: '942000000',
    willWearCostume: false,
    costumeName: '',
  });

  useEffect(() => {
    // Generate official start check-in QR code
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

  const [isRefreshing, setIsRefreshing] = useState(false);

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
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchLiveRegistrations();
    const intervalId = setInterval(fetchLiveRegistrations, 2500);
    window.addEventListener('ohana-checkin', fetchLiveRegistrations);
    window.addEventListener('storage', fetchLiveRegistrations);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('ohana-checkin', fetchLiveRegistrations);
      window.removeEventListener('storage', fetchLiveRegistrations);
    };
  }, []);

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
        } else {
          setCurrentAdminMedal(null);
        }
      })
      .catch((err) => console.warn('Admin /api/medal fetch:', err));
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

  const handleCreateManual = async (e: React.FormEvent) => {
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
      modality: newManual.modality,
      firstName: newManual.firstName,
      lastName: newManual.lastName || '',
      documentType: 'DNI',
      documentNumber: newManual.documentNumber,
      email: newManual.email || `${newManual.documentNumber}@correo.pe`,
      whatsapp: newManual.whatsapp || '942000000',
      age: parseInt(newManual.age) || 25,
      gender: 'Masculino',
      department: newManual.department,
      city: newManual.city,
      district: newManual.district,
      shippingAddress: newManual.shippingAddress,
      runningClub: newManual.runningClub || 'Independiente',
      emergencyContactName: newManual.emergencyContactName,
      emergencyContactPhone: newManual.emergencyContactPhone,
      willWearCostume: newManual.willWearCostume,
      costumeName: newManual.costumeName,
      paymentMethod: 'Efectivo / Presencial',
      paymentReference: 'REGISTRO-MANUAL-ORGANIZADOR',
      paymentStatus: 'Verificado',
      confirmedAtStart: false,
      createdAt: new Date().toISOString(),
      disclaimerAccepted: true,
    };

    const updated = [newEntry, ...registrations];
    onUpdateRegistrations(updated);
    saveRegistrations(updated);

    setShowAddModal(false);
    setNewManual({
      modality: 'Presencial',
      firstName: '',
      lastName: '',
      documentNumber: '',
      whatsapp: '',
      email: '',
      age: '25',
      department: 'San Martín',
      city: 'Tarapoto',
      district: 'Tarapoto',
      shippingAddress: '',
      runningClub: 'Independiente',
      emergencyContactName: 'Familiar',
      emergencyContactPhone: '942000000',
      willWearCostume: false,
      costumeName: '',
    });
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
  const presencialCount = registrations.filter((r) => (r.modality || 'Presencial') === 'Presencial').length;
  const virtualCount = registrations.filter((r) => r.modality === 'Virtual').length;
  const verifiedCount = registrations.filter((r) => r.paymentStatus === 'Verificado').length;
  const pendingCount = totalCount - verifiedCount;
  const checkinPresencialCount = registrations.filter((r) => r.confirmedAtStart).length;
  const virtualEvidenceCount = registrations.filter((r) => r.modality === 'Virtual' && r.virtualEvidence?.proofImage).length;
  const totalRevenue = verifiedCount * 50;

  // Filtered registrations
  const filteredRegistrations = registrations.filter((r) => {
    // Search query
    const query = searchTerm.toLowerCase();
    const matchSearch =
      r.firstName.toLowerCase().includes(query) ||
      r.lastName.toLowerCase().includes(query) ||
      r.documentNumber.includes(query) ||
      r.whatsapp.includes(query) ||
      r.id.toLowerCase().includes(query) ||
      String(r.registrationNumber || r.bibNumber || '').includes(query) ||
      r.city.toLowerCase().includes(query) ||
      (r.department && r.department.toLowerCase().includes(query));

    // Modality filter
    const matchModality =
      filterModality === 'all' ||
      (filterModality === 'Presencial' && (r.modality || 'Presencial') === 'Presencial') ||
      (filterModality === 'Virtual' && r.modality === 'Virtual');

    // Payment filter
    const matchPayment =
      filterPayment === 'all' ||
      (filterPayment === 'Verificado' && r.paymentStatus === 'Verificado') ||
      (filterPayment === 'Pendiente' && r.paymentStatus !== 'Verificado');

    // Attendance checkin filter
    const matchCheckin =
      filterCheckin === 'all' ||
      (filterCheckin === 'confirmed' && !!r.confirmedAtStart) ||
      (filterCheckin === 'pending' && !r.confirmedAtStart && (r.modality || 'Presencial') === 'Presencial');

    return matchSearch && matchModality && matchPayment && matchCheckin;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-7xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl p-4 sm:p-6 overflow-hidden my-4 max-h-[95vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bebas text-3xl sm:text-4xl text-white tracking-wide uppercase">
                Panel del <span className="text-lime-400">Organizador</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-lime-400/20 text-lime-400 font-bold uppercase text-[10px] tracking-wider border border-lime-400/30">
                OHANA GO 5K Oficial
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Gestión centralizada de corredores presenciales y virtuales, pagos, asistencias y medalla oficial.
            </p>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Start Line QR Code Button (exclusive for Admin to display at starting arch) */}
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
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-lime-400 rounded-xl text-xs font-bold transition border border-lime-400/30 cursor-pointer"
              title="Escanear pase digital de un corredor con la cámara del organizador"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Escanear Runner</span>
            </button>

            <button
              onClick={() => {
                setTempMedalPreview(currentAdminMedal);
                setShowMedalModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold transition border border-neutral-700 hover:border-lime-400 cursor-pointer shadow-sm"
              title="Subir o cambiar foto de la medalla oficial"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Foto Medalla</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-lime-400 hover:bg-lime-300 text-black rounded-xl text-xs font-bold transition shadow-md shadow-lime-400/20 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Nuevo Corredor</span>
            </button>

            <button
              onClick={fetchLiveRegistrations}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer border border-neutral-700"
              title="Recargar y sincronizar participantes en tiempo real"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-lime-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <button
              onClick={() => exportToCSV(registrations)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
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

        {/* Live Automatic Check-in Notice Alert */}
        {liveNotice && (
          <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-neutral-900 to-emerald-950/90 border-2 border-emerald-400 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xl shadow-emerald-500/20 animate-pulse">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{liveNotice}</span>
            </div>
            <button
              onClick={() => setLiveNotice(null)}
              className="text-emerald-400 hover:text-white p-1 rounded-lg hover:bg-emerald-900/60 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 py-4">
          <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Inscritos</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-bebas text-2xl sm:text-3xl text-white">{totalCount}</span>
              <span className="text-[10px] text-neutral-500">runners</span>
            </div>
          </div>

          <div className="bg-neutral-950 p-3 rounded-2xl border border-lime-400/30">
            <span className="text-[10px] uppercase font-bold text-lime-400 block flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Presencial
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-bebas text-2xl sm:text-3xl text-lime-300">{presencialCount}</span>
              <span className="text-[10px] text-neutral-500">Tarapoto</span>
            </div>
          </div>

          <div className="bg-neutral-950 p-3 rounded-2xl border border-emerald-400/50 bg-gradient-to-br from-emerald-950/30 to-neutral-950 shadow-sm shadow-emerald-500/10">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" /> Check-in Partida
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-bebas text-2xl sm:text-3xl text-emerald-400">{checkinPresencialCount}</span>
              <span className="text-[10px] text-neutral-400 font-bold">de {presencialCount} ({Math.round((checkinPresencialCount / (presencialCount || 1)) * 100)}%)</span>
            </div>
          </div>

          <div className="bg-neutral-950 p-3 rounded-2xl border border-purple-500/30">
            <span className="text-[10px] uppercase font-bold text-purple-400 block flex items-center gap-1">
              <Globe className="w-3 h-3" /> Virtual
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-bebas text-2xl sm:text-3xl text-purple-300">{virtualCount}</span>
              <span className="text-[10px] text-neutral-500">nacional</span>
            </div>
          </div>

          <div className="bg-neutral-950 p-3 rounded-2xl border border-emerald-500/30">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Pagos Verificados</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-bebas text-2xl sm:text-3xl text-emerald-400">{verifiedCount}</span>
              <span className="text-[10px] text-neutral-500">de {totalCount}</span>
            </div>
          </div>

          <div className="bg-neutral-950 p-3 rounded-2xl border border-amber-500/30">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">Pendientes Pago</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-bebas text-2xl sm:text-3xl text-amber-400">{pendingCount}</span>
              <span className="text-[10px] text-neutral-500">por cobrar</span>
            </div>
          </div>

          <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">Recaudación Oficial</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-bebas text-2xl sm:text-3xl text-lime-400">S/ {totalRevenue}</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800 text-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, DNI, celular o ciudad..."
              className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-lime-400 transition text-xs"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Attendance Check-in Filter */}
            <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              <button
                onClick={() => setFilterCheckin('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterCheckin === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Toda Asistencia
              </button>
              <button
                onClick={() => setFilterCheckin('confirmed')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  filterCheckin === 'confirmed' ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-bold' : 'text-neutral-400 hover:text-emerald-300'
                }`}
                title="Corredores que ya pasaron el QR o tienen asistencia confirmada"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                ✓ En Partida ({checkinPresencialCount})
              </button>
              <button
                onClick={() => setFilterCheckin('pending')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  filterCheckin === 'pending' ? 'bg-amber-950 border border-amber-500/40 text-amber-400 font-bold' : 'text-neutral-400 hover:text-amber-300'
                }`}
                title="Corredores presenciales que aún no han pasado el QR"
              >
                <Clock className="w-3 h-3 text-amber-400" />
                ⏳ Por Llegar ({Math.max(0, presencialCount - checkinPresencialCount)})
              </button>
            </div>

            {/* Modality Filter */}
            <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              <button
                onClick={() => setFilterModality('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterModality === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Modalidades
              </button>
              <button
                onClick={() => setFilterModality('Presencial')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  filterModality === 'Presencial' ? 'bg-lime-400 text-black font-bold' : 'text-neutral-400 hover:text-lime-300'
                }`}
              >
                <MapPin className="w-3 h-3" /> Presencial ({presencialCount})
              </button>
              <button
                onClick={() => setFilterModality('Virtual')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  filterModality === 'Virtual' ? 'bg-purple-600 text-white font-bold' : 'text-neutral-400 hover:text-purple-300'
                }`}
              >
                <Globe className="w-3 h-3" /> Virtual ({virtualCount})
              </button>
            </div>

            {/* Payment Filter */}
            <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              <button
                onClick={() => setFilterPayment('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterPayment === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Pagos
              </button>
              <button
                onClick={() => setFilterPayment('Verificado')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer text-emerald-400 ${
                  filterPayment === 'Verificado' ? 'bg-emerald-950 border border-emerald-500/40' : 'hover:text-emerald-300'
                }`}
              >
                Pagados ({verifiedCount})
              </button>
              <button
                onClick={() => setFilterPayment('Pendiente')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer text-amber-400 ${
                  filterPayment === 'Pendiente' ? 'bg-amber-950 border border-amber-500/40' : 'hover:text-amber-300'
                }`}
              >
                Pendientes ({pendingCount})
              </button>
            </div>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="flex-1 overflow-y-auto mt-2 -mx-4 sm:-mx-6 px-4 sm:px-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-neutral-900 border-b border-neutral-800 text-neutral-400 uppercase text-[10px] font-bold tracking-wider z-10">
              <tr>
                <th className="py-3 px-3">N°</th>
                <th className="py-3 px-3">Corredor / Runner</th>
                <th className="py-3 px-3">Modalidad</th>
                <th className="py-3 px-3">Ubicación</th>
                <th className="py-3 px-3">Asistencia / Evidencia</th>
                <th className="py-3 px-3">Estado Pago</th>
                <th className="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500 text-xs">
                    No se encontraron inscripciones con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((runner, index) => {
                  const isRunVirtual = runner.modality === 'Virtual';
                  return (
                    <tr key={runner.id} className="hover:bg-neutral-800/40 transition">
                      {/* Consecutive registration index */}
                      <td className="py-3 px-3 font-mono font-bold text-neutral-400 text-xs">
                        {index + 1}
                      </td>

                      {/* Runner info */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-white text-xs">
                          {runner.firstName} {runner.lastName}
                        </div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                          <span>{runner.documentType}: <strong>{runner.documentNumber}</strong></span>
                          <span>•</span>
                          <span>Wsp: {runner.whatsapp}</span>
                          {runner.willWearCostume && (
                            <span className="text-[10px] text-purple-400 bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-500/30">
                              Disfraz: {runner.costumeName || 'Sí'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Modality */}
                      <td className="py-3 px-3">
                        {isRunVirtual ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-950/80 text-purple-300 border border-purple-500/40">
                            <Globe className="w-3 h-3 text-purple-400" />
                            Virtual 5K
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-lime-950/80 text-lime-400 border border-lime-500/40">
                            <MapPin className="w-3 h-3 text-lime-400" />
                            Presencial
                          </span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3 text-[11px] text-neutral-300">
                        <div className="font-semibold text-white">{runner.department || 'San Martín'}</div>
                        <div className="text-neutral-400">{runner.city} • {runner.district}</div>
                      </td>

                      {/* Attendance / Virtual Evidence */}
                      <td className="py-3 px-3">
                        {isRunVirtual ? (
                          runner.virtualEvidence?.proofImage || runner.virtualEvidence?.timeRecorded ? (
                            <button
                              onClick={() => setViewingEvidenceRunner(runner)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 transition cursor-pointer"
                            >
                              <Activity className="w-3.5 h-3.5 text-purple-300" />
                              Ver Evidencia ({runner.virtualEvidence.timeRecorded || 'OK'})
                            </button>
                          ) : (
                            <span className="text-[11px] text-neutral-500 italic">
                              Pendiente envío
                            </span>
                          )
                        ) : runner.confirmedAtStart ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleCheckin(runner.id, true)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase transition cursor-pointer border bg-emerald-950/90 text-emerald-400 border-emerald-500/50 hover:bg-red-950/60 hover:text-red-400 hover:border-red-500/40 shadow-sm shadow-emerald-500/10 group"
                              title="Asistencia confirmada. Clic para anular si fue un error."
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-400 group-hover:hidden" />
                              <X className="w-3.5 h-3.5 text-red-400 hidden group-hover:inline" />
                              <span className="group-hover:hidden">✓ En Partida</span>
                              <span className="hidden group-hover:inline">Desmarcar</span>
                            </button>
                            {runner.startCheckinTime && (
                              <span className="text-[10px] text-neutral-400 font-mono hidden md:inline">
                                {new Date(runner.startCheckinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleToggleCheckin(runner.id, false)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition cursor-pointer border bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white hover:border-lime-400 hover:bg-neutral-700"
                            title="Hacer clic para marcar asistencia manual de este corredor"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Marcar Asistencia</span>
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
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
                            title="Ver pase oficial digital"
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
                className="p-1 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
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

      {/* Modal: View Virtual Evidence Details */}
      {viewingEvidenceRunner && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-xl w-full bg-neutral-900 rounded-3xl p-5 border border-purple-500/40">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] text-purple-400 uppercase font-black tracking-wider block">Evidencia 5K Virtual</span>
                <h4 className="font-bebas text-2xl text-white uppercase">
                  {viewingEvidenceRunner.firstName} {viewingEvidenceRunner.lastName} (DNI: {viewingEvidenceRunner.documentNumber})
                </h4>
              </div>
              <button
                onClick={() => setViewingEvidenceRunner(null)}
                className="p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
                <div>
                  <span className="text-neutral-500 uppercase font-bold text-[10px] block">App Utilizada</span>
                  <span className="text-white font-semibold">{viewingEvidenceRunner.virtualEvidence?.appName || 'Strava'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase font-bold text-[10px] block">Tiempo Registrado</span>
                  <span className="text-lime-400 font-bebas text-xl">{viewingEvidenceRunner.virtualEvidence?.timeRecorded || 'N/A'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-neutral-500 uppercase font-bold text-[10px] block">Dirección de Envío de Medalla</span>
                  <span className="text-neutral-300 font-medium">
                    {viewingEvidenceRunner.shippingAddress || 'No especificada aún'} ({viewingEvidenceRunner.city}, {viewingEvidenceRunner.department})
                  </span>
                </div>
              </div>

              {viewingEvidenceRunner.virtualEvidence?.proofImage ? (
                <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-[50vh] border border-neutral-800">
                  <img
                    src={viewingEvidenceRunner.virtualEvidence.proofImage}
                    alt="Evidencia 5K"
                    className="max-w-full max-h-[50vh] object-contain"
                  />
                </div>
              ) : (
                <p className="text-xs text-neutral-400 text-center py-4">No se adjuntó captura de pantalla aún.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Digital Bib */}
      {viewingBibRunner && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-neutral-900 rounded-3xl p-5 border border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bebas text-xl text-white uppercase">Pase Digital de Participante</h4>
              <button
                onClick={() => setViewingBibRunner(null)}
                className="p-1 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <DigitalBib registration={viewingBibRunner} />
          </div>
        </div>
      )}

      {/* Modal: Add Manual Runner */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="relative max-w-xl w-full bg-neutral-900 rounded-3xl p-6 border border-neutral-800 my-4">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-3">
              <h4 className="font-bebas text-2xl text-white uppercase flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-lime-400" />
                Registrar Nuevo Corredor Manualmente
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-4">
              {/* Modality radio */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Modalidad de Participación *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewManual({ ...newManual, modality: 'Presencial' })}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer flex items-center justify-center gap-2 ${
                      newManual.modality === 'Presencial'
                        ? 'bg-lime-400/20 border-lime-400 text-lime-300 font-bold'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    Presencial Tarapoto
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewManual({ ...newManual, modality: 'Virtual' })}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer flex items-center justify-center gap-2 ${
                      newManual.modality === 'Virtual'
                        ? 'bg-purple-600/30 border-purple-400 text-purple-300 font-bold'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    Virtual 5K
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    required
                    value={newManual.firstName}
                    onChange={(e) => setNewManual({ ...newManual, firstName: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    value={newManual.lastName}
                    onChange={(e) => setNewManual({ ...newManual, lastName: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    DNI / Documento *
                  </label>
                  <input
                    type="text"
                    required
                    value={newManual.documentNumber}
                    onChange={(e) => setNewManual({ ...newManual, documentNumber: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Celular WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={newManual.whatsapp}
                    onChange={(e) => setNewManual({ ...newManual, whatsapp: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Departamento
                  </label>
                  <select
                    value={newManual.department}
                    onChange={(e) => setNewManual({ ...newManual, department: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-lime-400"
                  >
                    {DEPARTMENTS_PERU.map((dep) => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Ciudad / Provincia
                  </label>
                  <input
                    type="text"
                    value={newManual.city}
                    onChange={(e) => setNewManual({ ...newManual, city: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Distrito
                  </label>
                  <input
                    type="text"
                    value={newManual.district}
                    onChange={(e) => setNewManual({ ...newManual, district: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>

                {newManual.modality === 'Virtual' && (
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-1">
                      Dirección de Envío para Medalla
                    </label>
                    <input
                      type="text"
                      value={newManual.shippingAddress}
                      onChange={(e) => setNewManual({ ...newManual, shippingAddress: e.target.value })}
                      placeholder="Dirección o agencia de entrega"
                      className="w-full bg-neutral-950 border border-purple-500/40 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-bebas text-lg uppercase tracking-wider"
                >
                  Guardar Inscripción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Official Medal Photo Management */}
      {showMedalModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-neutral-900 rounded-3xl p-6 border border-neutral-800">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-3">
              <h4 className="font-bebas text-2xl text-white uppercase flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Foto Oficial de la Medalla Finisher 5K
              </h4>
              <button
                onClick={() => setShowMedalModal(false)}
                className="p-1 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-neutral-400">
                La foto que subas aquí se guardará en el servidor y se mostrará en tiempo real a todos los visitantes, dispositivos y navegadores.
              </p>

              {/* Preview Box */}
              <div className="h-64 rounded-2xl bg-black border border-neutral-800 overflow-hidden flex items-center justify-center relative">
                {tempMedalPreview ? (
                  <img
                    src={tempMedalPreview}
                    alt="Medalla Finisher Oficial"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center p-4">
                    <Award className="w-12 h-12 text-neutral-600 mx-auto mb-2" />
                    <span className="text-xs text-neutral-400 block">Sin foto cargada</span>
                    <span className="text-[10px] text-neutral-600">Se mostrará el emblema oficial predeterminado</span>
                  </div>
                )}
              </div>

              {/* Upload Input */}
              <div className="flex items-center gap-2">
                <label className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold text-center cursor-pointer transition border border-neutral-700">
                  <Upload className="w-4 h-4 inline mr-2" />
                  Elegir Foto de la Medalla
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

                {tempMedalPreview && (
                  <button
                    onClick={() => setTempMedalPreview(null)}
                    className="px-3 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-semibold transition border border-red-500/30"
                    title="Eliminar foto de medalla"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {medalSavedNotice && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Foto sincronizada exitosamente con el servidor.</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMedalModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setCurrentAdminMedal(tempMedalPreview);
                    try {
                      await fetch('/api/medal', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image: tempMedalPreview }),
                      });
                      try {
                        localStorage.setItem('ohana_medal_photo_v2', tempMedalPreview || '');
                      } catch (e) {}
                      window.dispatchEvent(new CustomEvent('ohana_medal_updated'));
                      setMedalSavedNotice(true);
                      setTimeout(() => {
                        setMedalSavedNotice(false);
                        setShowMedalModal(false);
                      }, 1200);
                    } catch (e) {
                      console.error('Error saving medal:', e);
                    }
                  }}
                  className="px-6 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-bebas text-lg uppercase tracking-wider"
                >
                  Guardar y Publicar Medalla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Change Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-sm w-full bg-neutral-900 rounded-3xl p-6 border border-neutral-800">
            <h4 className="font-bebas text-2xl text-white uppercase mb-2">Cambiar Contraseña de Administrador</h4>
            <p className="text-xs text-neutral-400 mb-4">
              Ingresa la nueva clave para el acceso del organizador.
            </p>
            <form onSubmit={handleUpdatePassword} className="space-y-3">
              <input
                type="text"
                required
                value={newPassInput}
                onChange={(e) => setNewPassInput(e.target.value)}
                placeholder="Nueva contraseña"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-lime-400"
              />
              {passSuccess && (
                <p className="text-emerald-400 text-xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Clave actualizada exitosamente.
                </p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold"
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
                  {checkinPresencialCount} de {presencialCount} confirmados ({Math.round((checkinPresencialCount / (presencialCount || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-lime-500 to-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((checkinPresencialCount / (presencialCount || 1)) * 100))}%` }}
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
                Este es el código QR que se colocará impreso en el stand o arco de largada de la Plaza de Armas. Los participantes lo escanean con la cámara de su teléfono o desde <strong>Mi Espacio 🎒</strong> para confirmar su asistencia presencial en vivo.
              </p>

              {/* Direct Link Copier */}
              <div className="mt-3 flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 max-w-md w-full">
                <span className="text-[11px] text-neutral-400 font-mono truncate flex-1 text-left">
                  {typeof window !== 'undefined' ? `${window.location.origin}/?checkin=start` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(`${window.location.origin}/?checkin=start&token=OHANA-START-LINE-TARAPOTO-2026`);
                      alert('Enlace de check-in copiado al portapapeles');
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-lime-400 text-[11px] font-bold transition cursor-pointer shrink-0"
                >
                  Copiar Link
                </button>
              </div>
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
                {startQrDataUrl && (
                  <a
                    href={startQrDataUrl}
                    download="QR-Partida-OHANA-GO-5K-Tarapoto.png"
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer border border-neutral-700"
                  >
                    <Download className="w-4 h-4 text-lime-400" />
                    Descargar Imagen QR
                  </a>
                )}

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

      {/* Staff Scanner Modal (Admin scans runner's digital bib with camera) */}
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
