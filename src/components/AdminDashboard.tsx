import React, { useState } from 'react';
import { RunnerRegistration, PaymentStatus, TShirtSize } from '../types/race';
import { exportToCSV, saveRegistrations } from '../data/initialRegistrations';
import { adminLogout, updateAdminPassword } from '../data/auth';
import { 
  Users, 
  DollarSign, 
  Download, 
  Search, 
  CheckCircle2, 
  Clock, 
  Shirt, 
  Sparkles, 
  X, 
  Eye, 
  UserPlus,
  LogOut,
  KeyRound,
  Check
} from 'lucide-react';

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
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSize, setFilterSize] = useState<string>('all');
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassInput, setNewPassInput] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  // New manual registration state
  const [newManual, setNewManual] = useState({
    firstName: '',
    lastName: '',
    documentNumber: '',
    whatsapp: '',
    email: '',
    tShirtSize: 'M' as TShirtSize,
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

  // Size distribution
  const sizeCounts: { [key in TShirtSize]?: number } = {};
  registrations.forEach((r) => {
    sizeCounts[r.tShirtSize] = (sizeCounts[r.tShirtSize] || 0) + 1;
  });

  // Filtered List
  const filtered = registrations.filter((r) => {
    const matchesSearch =
      r.documentNumber.includes(searchTerm) ||
      `${r.firstName} ${r.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(r.bibNumber).includes(searchTerm) ||
      r.runningClub.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || r.paymentStatus === filterStatus;
    const matchesSize = filterSize === 'all' || r.tShirtSize === filterSize;

    return matchesSearch && matchesStatus && matchesSize;
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

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManual.firstName || !newManual.documentNumber) return;

    const nextBib = registrations.length > 0 ? Math.max(...registrations.map(r => r.bibNumber)) + 1 : 101;
    const newEntry: RunnerRegistration = {
      id: `OHA-2026-${String(nextBib).padStart(4, '0')}`,
      bibNumber: nextBib,
      firstName: newManual.firstName,
      lastName: newManual.lastName || 'Tarapoto',
      documentType: 'DNI',
      documentNumber: newManual.documentNumber,
      email: newManual.email || `${newManual.documentNumber}@ohanago.pe`,
      whatsapp: newManual.whatsapp || '942000000',
      age: parseInt(newManual.age, 10) || 25,
      gender: 'Masculino',
      city: 'Tarapoto',
      district: 'Tarapoto Cercado',
      runningClub: newManual.runningClub,
      tShirtSize: newManual.tShirtSize,
      emergencyContactName: newManual.emergencyContactName,
      emergencyContactPhone: newManual.emergencyContactPhone,
      bloodType: 'O+',
      willWearCostume: newManual.willWearCostume,
      costumeName: newManual.costumeName,
      paymentMethod: 'Efectivo / Presencial',
      paymentReference: 'EFECTIVO-EN-LOCAL',
      paymentStatus: 'Verificado',
      createdAt: new Date().toISOString(),
      disclaimerAccepted: true,
    };

    const updated = [newEntry, ...registrations];
    onUpdateRegistrations(updated);
    saveRegistrations(updated);
    setShowAddModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-neutral-900 border border-neutral-700 rounded-3xl p-5 sm:p-8 shadow-2xl my-6 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bebas text-3xl sm:text-4xl text-white tracking-wider uppercase">
                Panel del Organizador <span className="text-lime-400">OHANA GO</span>
              </span>
              <span className="bg-lime-950 text-lime-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-lime-500/30">
                ADMIN 5K
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Control de inscritos, recaudación, tallas de polos y exportación a Excel para entrega de kits en Tarapoto.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition cursor-pointer"
              title="Cambiar contraseña de administrador"
            >
              <KeyRound className="w-3.5 h-3.5 text-lime-400" />
              <span className="hidden sm:inline">Cambiar Clave</span>
            </button>
            <button
              onClick={() => exportToCSV(registrations)}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Descargar Excel (CSV)
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

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-6">
          
          {/* Key Metrics KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center gap-3">
              <div className="p-3 bg-lime-400/10 text-lime-400 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Inscritos</span>
                <span className="font-bebas text-3xl text-white">{totalCount}</span>
                <span className="text-[10px] text-neutral-500 block">Meta: 300 runners</span>
              </div>
            </div>

            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center gap-3">
              <div className="p-3 bg-emerald-400/10 text-emerald-400 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Recaudado (Verificado)</span>
                <span className="font-bebas text-3xl text-lime-400">S/ {totalIncome}</span>
                <span className="text-[10px] text-neutral-500 block">{verifiedCount} confirmados x S/ 50</span>
              </div>
            </div>

            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center gap-3">
              <div className="p-3 bg-amber-400/10 text-amber-400 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Pendientes de Pago</span>
                <span className="font-bebas text-3xl text-amber-400">{pendingCount}</span>
                <span className="text-[10px] text-neutral-500 block">Por verificar en Yape/Local</span>
              </div>
            </div>

            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center gap-3">
              <div className="p-3 bg-purple-400/10 text-purple-400 rounded-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Con Disfraz Halloween</span>
                <span className="font-bebas text-3xl text-purple-400">{costumedCount}</span>
                <span className="text-[10px] text-neutral-500 block">Para concurso de disfraces</span>
              </div>
            </div>
          </div>

          {/* Size Count Breakdown (crucial for textile ordering!) */}
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shirt className="w-4 h-4 text-lime-400" />
                <h4 className="font-bebas text-lg text-white uppercase tracking-wider">
                  Inventario para Confección de Polos por Talla
                </h4>
              </div>
              <span className="text-xs text-neutral-400">Total polos solicitados: {totalCount}</span>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center">
              {(['XS', 'S', 'M', 'L', 'XL'] as TShirtSize[]).map((size) => (
                <div key={size} className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                  <span className="text-xs text-neutral-400 block uppercase font-bold">Talla {size}</span>
                  <span className="font-bebas text-2xl text-lime-400">{sizeCounts[size] || 0}</span>
                  <span className="text-[10px] text-neutral-500 block">
                    {totalCount > 0 ? Math.round(((sizeCounts[size] || 0) / totalCount) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Filters & Actions Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Buscar por DNI, Nombre, N° Dorsal o Club..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-lime-400"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-300 focus:outline-none"
            >
              <option value="all">Todos los Estados</option>
              <option value="Verificado">Solo Verificados</option>
              <option value="Pendiente de Verificación">Solo Pendientes</option>
            </select>

            {/* Size Filter */}
            <select
              value={filterSize}
              onChange={(e) => setFilterSize(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-300 focus:outline-none"
            >
              <option value="all">Todas las Tallas</option>
              <option value="XS">Talla XS</option>
              <option value="S">Talla S</option>
              <option value="M">Talla M</option>
              <option value="L">Talla L</option>
              <option value="XL">Talla XL</option>
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
                  <th className="py-3 px-3">Talla</th>
                  <th className="py-3 px-3">Disfraz</th>
                  <th className="py-3 px-3">Método / Ref</th>
                  <th className="py-3 px-3 text-center">Estado Pago</th>
                  <th className="py-3 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/40">
                {filtered.map((runner) => (
                  <tr key={runner.id} className="hover:bg-neutral-900/60 transition">
                    <td className="py-3 px-3 font-mono font-bold text-lime-400">
                      #{String(runner.bibNumber).padStart(4, '0')}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">
                        {runner.firstName} {runner.lastName}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        {runner.age} años • {runner.runningClub || 'Independiente'}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {runner.documentNumber}
                    </td>
                    <td className="py-3 px-3">
                      <a
                        href={`https://wa.me/51${runner.whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline"
                      >
                        {runner.whatsapp}
                      </a>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-neutral-800 font-bold text-white">
                        {runner.tShirtSize}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {runner.willWearCostume ? (
                        <span className="text-[11px] text-purple-400 font-bold" title={runner.costumeName}>
                          🎃 {runner.costumeName || 'Sí'}
                        </span>
                      ) : (
                        <span className="text-neutral-500 text-[11px]">Runner</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-white font-medium">{runner.paymentMethod}</div>
                      <div className="text-[10px] text-neutral-500 font-mono flex items-center gap-1">
                        {runner.paymentReference}
                        {runner.paymentProofImage && (
                          <button
                            onClick={() => setViewingProof(runner.paymentProofImage || null)}
                            className="text-lime-400 hover:text-lime-300 inline-flex items-center cursor-pointer"
                            title="Ver captura del voucher"
                          >
                            <Eye className="w-3 h-3 ml-1" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => togglePaymentStatus(runner.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                          runner.paymentStatus === 'Verificado'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900'
                            : 'bg-amber-950 text-amber-400 border border-amber-500/40 hover:bg-amber-900'
                        }`}
                      >
                        {runner.paymentStatus === 'Verificado' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Verificado
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" /> Pendiente
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => togglePaymentStatus(runner.id)}
                        className="text-[11px] text-lime-400 hover:underline cursor-pointer"
                      >
                        {runner.paymentStatus === 'Verificado' ? 'Cambiar a pendiente' : 'Aprobar pago'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="p-8 text-center text-neutral-500 text-xs">
                No se encontraron inscritos con los filtros seleccionados.
              </div>
            )}
          </div>

        </div>

        {/* Modal: View Voucher Proof */}
        {viewingProof && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90">
            <div className="relative max-w-lg bg-neutral-900 p-4 rounded-2xl border border-neutral-700">
              <button
                onClick={() => setViewingProof(null)}
                className="absolute top-2 right-2 p-1.5 bg-neutral-800 text-neutral-400 hover:text-white rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <h5 className="font-bebas text-lg text-white mb-2">Comprobante de Pago Subido</h5>
              <img
                src={viewingProof}
                alt="Voucher de pago"
                className="max-h-[70vh] w-auto mx-auto rounded-lg object-contain"
              />
            </div>
          </div>
        )}

        {/* Modal: Quick In-Person Registration */}
        {showAddModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90">
            <div className="relative max-w-md w-full bg-neutral-900 p-6 rounded-3xl border border-neutral-700">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-1.5 bg-neutral-800 text-neutral-400 hover:text-white rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h4 className="font-bebas text-2xl text-white uppercase tracking-wider mb-3">
                Inscripción Presencial / Efectivo
              </h4>

              <form onSubmit={handleCreateManual} className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Nombres *</label>
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
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">DNI *</label>
                    <input
                      type="text"
                      required
                      value={newManual.documentNumber}
                      onChange={(e) => setNewManual({ ...newManual, documentNumber: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Talla Polo</label>
                    <select
                      value={newManual.tShirtSize}
                      onChange={(e) => setNewManual({ ...newManual, tShirtSize: e.target.value as TShirtSize })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                    </select>
                  </div>
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

                <button
                  type="submit"
                  className="w-full py-3 bg-lime-400 text-black font-bebas text-lg uppercase tracking-wider rounded-xl transition cursor-pointer mt-2"
                >
                  Registrar & Asignar Dorsal
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Change Admin Password */}
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
                    Nueva Contraseña (mínimo 4 caracteres)
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

      </div>
    </div>
  );
};
