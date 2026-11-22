import React, { useEffect, useMemo, useState } from 'react';
import { RunnerRegistration } from '../types/race';
import { AnalyticsSummary } from '../utils/analytics';
import { isRiojaRunner, isTarapotoRunner } from '../utils/checkinManager';
import {
  Users,
  Search,
  Eye,
  MousePointerClick,
  Sparkles,
  CheckCircle2,
  Clock,
  RefreshCw,
  Phone,
  Activity,
  TrendingUp,
  Shirt,
  HardDrive,
  DollarSign,
  PackageCheck,
  Check,
  RotateCcw,
  Camera,
  FileCheck2,
  Percent,
  MapPin,
  Tag,
} from 'lucide-react';

interface AdminAnalyticsTabProps {
  registrations: RunnerRegistration[];
  analyticsData: AnalyticsSummary | null;
  isLoading: boolean;
  onRefresh: () => void;
  onResetAnalytics?: () => void;
  initialEdition?: 'santa-run-2026' | 'santa-run-rioja-2026';
}

const SHIRT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;

export const AdminAnalyticsTab: React.FC<AdminAnalyticsTabProps> = ({
  registrations,
  analyticsData,
  isLoading,
  onRefresh,
  onResetAnalytics,
  initialEdition = 'santa-run-2026',
}) => {
  const [selectedEdition, setSelectedEdition] = useState<'santa-run-2026' | 'santa-run-rioja-2026'>(initialEdition);
  const [filterType, setFilterType] = useState<'all' | 'consulted' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubView, setActiveSubView] = useState<'runners' | 'sections' | 'feed'>('runners');
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  useEffect(() => {
    setSelectedEdition(initialEdition);
  }, [initialEdition]);

  const isRiojaSelected = selectedEdition === 'santa-run-rioja-2026';

  const tarapotoCount = useMemo(
    () => registrations.filter(isTarapotoRunner).length,
    [registrations]
  );
  const riojaCount = useMemo(
    () => registrations.filter(isRiojaRunner).length,
    [registrations]
  );

  // Strictly isolate metrics per active Santa Run sede (Tarapoto vs Rioja)
  const santaRunners = useMemo(
    () =>
      registrations
        .filter((r) => (isRiojaSelected ? isRiojaRunner(r) : isTarapotoRunner(r)))
        .sort((a, b) => (b.registrationNumber || 0) - (a.registrationNumber || 0)),
    [registrations, isRiojaSelected]
  );

  const totalRunners = santaRunners.length;
  const verifiedRunners = santaRunners.filter((r) => r.paymentStatus === 'Verificado');
  const pendingPaymentRunners = santaRunners.filter((r) => r.paymentStatus !== 'Verificado');
  const verifiedCount = verifiedRunners.length;
  const pendingPaymentCount = pendingPaymentRunners.length;
  const verificationRate = totalRunners > 0 ? Math.round((verifiedCount / totalRunners) * 100) : 0;

  // Accurate per-sede revenue breakdown
  const getRunnerPrice = (r: RunnerRegistration) => {
    if (typeof r.amountPaid === 'number' && r.amountPaid > 0) return r.amountPaid;
    if (isRiojaRunner(r)) {
      return r.raceCategory === 'Kids 2K' ? 25.0 : 35.0;
    }
    return r.hasPreviousDiscount ? 59.5 : 70.0;
  };

  const revenueVerified = verifiedRunners.reduce((sum, r) => sum + getRunnerPrice(r), 0);
  const revenuePending = pendingPaymentRunners.reduce((sum, r) => sum + getRunnerPrice(r), 0);
  const revenueTotal = revenueVerified + revenuePending;
  const discountRunnersCount = santaRunners.filter((r) => r.hasPreviousDiscount && !isRiojaRunner(r)).length;

  // Kit & Google Drive media completion metrics
  const kitsDeliveredCount = santaRunners.filter((r) => r.confirmedAtStart).length;
  const kitsPendingCount = totalRunners - kitsDeliveredCount;
  const drivePhotosCount = santaRunners.filter(
    (r) => !!(r.drivePhotoFileId || r.drivePhotoUrl || r.personalPhotoUrl)
  ).length;
  const driveVouchersCount = santaRunners.filter(
    (r) => !!(r.driveVoucherFileId || r.driveVoucherUrl || r.voucherUrl || r.paymentProofImage)
  ).length;

  // T-Shirt size distribution (Tarapoto)
  const shirtBreakdown = useMemo(() => {
    return SHIRT_SIZES.map((size) => {
      const matching = santaRunners.filter((r) => (r.tShirtSize || 'M').toUpperCase() === size);
      const verifiedInSize = matching.filter((r) => r.paymentStatus === 'Verificado').length;
      const pct = totalRunners > 0 ? Math.round((matching.length / totalRunners) * 100) : 0;
      return {
        size,
        total: matching.length,
        verified: verifiedInSize,
        pct,
      };
    });
  }, [santaRunners, totalRunners]);

  // Category distribution (Rioja: Kids 2K S/ 25 vs Libre 5K S/ 35)
  const riojaCategoryBreakdown = useMemo(() => {
    const categories = [
      { key: 'Kids 2K' as const, label: 'Categoría KIDS 2K', price: 25.0, accent: 'from-amber-500 to-yellow-400' },
      { key: 'Libre 5K' as const, label: 'Categoría LIBRE 5K', price: 35.0, accent: 'from-red-600 via-rose-500 to-amber-400' },
    ];
    return categories.map((cat) => {
      const matching = santaRunners.filter((r) =>
        cat.key === 'Kids 2K' ? r.raceCategory === 'Kids 2K' : r.raceCategory !== 'Kids 2K'
      );
      const verifiedInCat = matching.filter((r) => r.paymentStatus === 'Verificado').length;
      const pct = totalRunners > 0 ? Math.round((matching.length / totalRunners) * 100) : 0;
      const catRevenue = matching.reduce((sum, r) => sum + getRunnerPrice(r), 0);
      return {
        ...cat,
        total: matching.length,
        verified: verifiedInCat,
        pct,
        revenue: catRevenue,
      };
    });
  }, [santaRunners, totalRunners]);

  // Daily registration trend (last 7 days with activity or last 7 calendar days)
  const dailyTrend = useMemo(() => {
    const countsByDay = new Map<string, { label: string; total: number; verified: number }>();
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
      countsByDay.set(key, { label, total: 0, verified: 0 });
    }

    for (const r of santaRunners) {
      if (!r.createdAt) continue;
      const key = String(r.createdAt).slice(0, 10);
      const existing = countsByDay.get(key);
      if (existing) {
        existing.total += 1;
        if (r.paymentStatus === 'Verificado') existing.verified += 1;
      }
    }

    const items = Array.from(countsByDay.values());
    const maxVal = Math.max(...items.map((x) => x.total), 1);
    return { items, maxVal };
  }, [santaRunners]);

  // Map of competitor accesses by DNI or runner ID
  const accessMap = useMemo(() => {
    const map = new Map<string, { count: number; lastAccess: string }>();
    if (analyticsData?.competitorAccesses) {
      for (const record of analyticsData.competitorAccesses) {
        if (record.documentNumber) {
          map.set(record.documentNumber.replace(/\D/g, ''), {
            count: record.accessCount,
            lastAccess: record.lastAccess,
          });
        }
        if (record.runnerId) {
          map.set(record.runnerId.toLowerCase(), {
            count: record.accessCount,
            lastAccess: record.lastAccess,
          });
        }
      }
    }
    return map;
  }, [analyticsData]);

  // Cross-reference Santa Run 2026 runners with Mi Espacio logins
  const runnersWithAccess = useMemo(
    () =>
      santaRunners.map((runner) => {
        const cleanDni = (runner.documentNumber || '').replace(/\D/g, '');
        const cleanId = (runner.id || '').toLowerCase();
        const access = accessMap.get(cleanDni) || accessMap.get(cleanId);
        return {
          ...runner,
          hasConsulted: !!access,
          accessCount: access ? access.count : 0,
          lastAccess: access ? access.lastAccess : null,
        };
      }),
    [santaRunners, accessMap]
  );

  const consultedCount = runnersWithAccess.filter((r) => r.hasConsulted).length;
  const pendingConsultCount = totalRunners - consultedCount;

  const filteredRunners = runnersWithAccess.filter((r) => {
    const q = searchTerm.toLowerCase().trim();
    const matchSearch =
      !q ||
      `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
      (r.documentNumber || '').includes(q) ||
      (r.whatsapp || '').includes(q) ||
      (r.id || '').toLowerCase().includes(q);

    if (!matchSearch) return false;
    if (filterType === 'consulted') return r.hasConsulted;
    if (filterType === 'pending') return !r.hasConsulted;
    return true;
  });

  // Web traffic & conversion metrics
  const totalPageViews = analyticsData?.totalPageViews || 0;
  const uniqueVisitors = analyticsData?.uniqueVisitorsCount || 0;
  const miEspacioClicks = analyticsData?.miEspacioClicks || 0;
  const conversionRate =
    uniqueVisitors > 0 ? Math.min(100, Math.round((totalRunners / uniqueVisitors) * 100)) : 0;

  // Section views (accurate Santa Run Tarapoto 2026 labels)
  const sectionViews = analyticsData?.sectionViews || {};
  const sectionsList = [
    {
      key: 'ruta-5k',
      name: 'Ruta Oficial 6K Tarapoto',
      views: (sectionViews['ruta-5k'] || 0) + (sectionViews['circuito_5k'] || 0),
      desc: 'Recorrido nocturno desde Aviación hasta la Concha Acústica',
    },
    {
      key: 'kit-evento',
      name: 'Kit Oficial & Medalla Santa Run',
      views: (sectionViews['kit-evento'] || 0) + (sectionViews['kit_oficial'] || 0),
      desc: 'Polo Dry-Fit, gorro de Santa, mochila, medalla Finisher e hidratación',
    },
    {
      key: 'horarios',
      name: 'Cronograma Oficial (6:00 PM / 7:00 PM)',
      views: sectionViews['horarios'] || 0,
      desc: 'Concentración en Aviación, largada 7:00 PM y meta en Concha Acústica',
    },
    {
      key: 'reglamento',
      name: 'Reglamento & Sorteo del Pavo',
      views: (sectionViews['reglamento'] || 0) + (sectionViews['faq'] || 0),
      desc: 'Bases de participación, seguridad en ruta y sorteo navideño',
    },
  ];
  const maxSectionView = Math.max(...sectionsList.map((s) => s.views), 1);

  const formatTimeAgo = (isoString: string | null) => {
    if (!isoString) return 'Sin ingreso';
    try {
      const d = new Date(isoString);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Hace un momento';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `Hace ${diffHours} h`;
      return d.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  const formatMoney = (amount: number) =>
    `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      {/* Header strip with Live Badge, Sede Switcher & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/90 border border-neutral-800 rounded-2xl px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="font-bebas text-2xl text-white tracking-wide uppercase leading-none">
              Métricas en Vivo · {isRiojaSelected ? 'Santa Run Rioja 2026' : 'Santa Run Tarapoto 2026'}
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Cifras reales sincronizadas en tiempo real desde Cloud Firestore y Google Drive por sede.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sede Switcher */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              type="button"
              onClick={() => setSelectedEdition('santa-run-2026')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                !isRiojaSelected
                  ? 'bg-red-600 text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Tarapoto ({tarapotoCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedEdition('santa-run-rioja-2026')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isRiojaSelected
                  ? 'bg-amber-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-amber-300'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Rioja ({riojaCount})</span>
            </button>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition cursor-pointer border border-neutral-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-red-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>

          {onResetAnalytics && !confirmResetOpen && (
            <button
              type="button"
              onClick={() => setConfirmResetOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-950 hover:bg-red-950/60 text-neutral-400 hover:text-red-300 text-xs font-bold transition cursor-pointer border border-neutral-800"
              title="Reiniciar solo contadores de visitas/clics a 0 (no borra inscritos)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reiniciar Visitas</span>
            </button>
          )}

          {onResetAnalytics && confirmResetOpen && (
            <div className="flex items-center gap-1.5 bg-red-950/90 border border-red-500/60 rounded-xl px-2.5 py-1.5 text-xs">
              <span className="text-red-200 font-bold">¿Poner visitas en 0?</span>
              <button
                type="button"
                onClick={() => {
                  onResetAnalytics();
                  setConfirmResetOpen(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer"
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="px-2 py-1 rounded-lg bg-neutral-800 text-neutral-300 font-bold cursor-pointer"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ROW 1: 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Inscritos Santa Run */}
        <div className="bg-neutral-900 p-5 rounded-2xl border-2 border-red-500/50 shadow-lg shadow-red-950/20">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase font-bold tracking-wider text-red-300">
              Inscritos Santa Run
            </span>
            <Users className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-bebas text-4xl text-white tabular-nums">{totalRunners}</span>
            <span className="text-xs text-neutral-400">participantes</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-bold tabular-nums">
              {verifiedCount} verificados ({verificationRate}%)
            </span>
            <span className="text-amber-400 font-mono tabular-nums">{pendingPaymentCount} pend.</span>
          </div>
        </div>

        {/* KPI 2: Recaudación Real */}
        <div className="bg-neutral-900 p-5 rounded-2xl border border-emerald-500/40 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-300">
              Recaudación Verificada
            </span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-bebas text-4xl text-emerald-400 tabular-nums">
              {formatMoney(revenueVerified)}
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between text-[11px] gap-2">
            <span className="text-amber-300 font-mono tabular-nums">
              Por validar: {formatMoney(revenuePending)}
            </span>
            {discountRunnersCount > 0 && (
              <span className="text-neutral-400 font-mono flex items-center gap-0.5 shrink-0">
                <Percent className="w-3 h-3 text-amber-400" />
                {discountRunnersCount} desc.
              </span>
            )}
          </div>
        </div>

        {/* KPI 3: Tráfico Web & Conversión */}
        <div className="bg-neutral-900 p-5 rounded-2xl border border-cyan-500/35 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase font-bold tracking-wider text-cyan-300">
              Visitas Web & Mi Espacio
            </span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-bebas text-4xl text-white tabular-nums">{totalPageViews}</span>
            <span className="text-xs text-cyan-400 font-semibold tabular-nums">
              {uniqueVisitors} únicos
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between text-[11px]">
            <span className="text-neutral-300 flex items-center gap-1 tabular-nums">
              <MousePointerClick className="w-3 h-3 text-red-400" />
              Mi Espacio: <strong className="text-white">{miEspacioClicks}</strong>
            </span>
            <span className="text-cyan-400 font-mono font-bold tabular-nums">
              Conv. {conversionRate}%
            </span>
          </div>
        </div>

        {/* KPI 4: Kits & Archivos en Drive */}
        <div className="bg-neutral-900 p-5 rounded-2xl border border-amber-500/35 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] uppercase font-bold tracking-wider text-amber-300">
              Kits & Archivos Drive
            </span>
            <PackageCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-bebas text-4xl text-amber-400 tabular-nums">
              {kitsDeliveredCount}
            </span>
            <span className="text-xs text-neutral-400 tabular-nums">
              / {totalRunners} kits entregados
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between text-[11px]">
            <span className="text-neutral-300 flex items-center gap-1 tabular-nums">
              <Camera className="w-3 h-3 text-amber-400" />
              Fotos: <strong className="text-white">{drivePhotosCount}</strong>
            </span>
            <span className="text-neutral-300 flex items-center gap-1 tabular-nums">
              <FileCheck2 className="w-3 h-3 text-emerald-400" />
              Yape: <strong className="text-white">{driveVouchersCount}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ROW 2: Operational Breakdown (Shirt Sizes + Daily Trend & Funnel) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Pedido de Polos (Tarapoto) OR Distribución por Categoría (Rioja) */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          {isRiojaSelected ? (
            <>
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div>
                  <h3 className="font-bebas text-2xl text-white uppercase tracking-wide flex items-center gap-2">
                    <Tag className="w-5 h-5 text-amber-400" />
                    Distribución por Categoría · Rioja 2026
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Conteo real por categoría (Kids 2K S/ 25.00 y Libre 5K S/ 35.00) · Alianza Sacha Runners.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300 bg-neutral-950 border border-amber-500/30 px-3 py-1 rounded-xl tabular-nums">
                  Total: {totalRunners}
                </span>
              </div>

              <div className="space-y-4 py-2">
                {riojaCategoryBreakdown.map((cat) => (
                  <div
                    key={cat.key}
                    className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-950/80 border border-amber-500/40 font-mono font-black text-amber-300">
                          {cat.key}
                        </span>
                        <span className="text-white font-bold">{cat.label}</span>
                        <span className="text-[11px] font-mono text-neutral-400">
                          S/ {cat.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-white font-black tabular-nums">{cat.total} inscritos</span>
                        <span className="text-emerald-400 text-[11px] tabular-nums">({cat.verified} verif.)</span>
                      </div>
                    </div>

                    <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                      <div
                        className={`h-full bg-gradient-to-r ${cat.accent} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(cat.pct, cat.total > 0 ? 5 : 0)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                      <span>{cat.pct}% del total Rioja</span>
                      <span className="text-amber-300 font-bold tabular-nums">
                        Subtotal: {formatMoney(cat.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400">
                <span>Proyección total Rioja (verificados + pendientes):</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {formatMoney(revenueTotal)}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div>
                  <h3 className="font-bebas text-2xl text-white uppercase tracking-wide flex items-center gap-2">
                    <Shirt className="w-5 h-5 text-red-400" />
                    Distribución de Tallas de Polo
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Conteo exacto para producción de polos oficiales Santa Run Tarapoto 2026.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-neutral-300 bg-neutral-950 border border-neutral-800 px-3 py-1 rounded-xl tabular-nums">
                  Total: {totalRunners}
                </span>
              </div>

              <div className="space-y-3">
                {shirtBreakdown.map((item) => (
                  <div key={item.size} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-9 text-center py-0.5 rounded-lg bg-neutral-950 border border-neutral-800 font-mono font-black text-white">
                          {item.size}
                        </span>
                        <span className="text-neutral-300 font-semibold tabular-nums">
                          {item.total} {item.total === 1 ? 'polo' : 'polos'}
                        </span>
                        {item.total > 0 && (
                          <span className="text-[11px] text-emerald-400 font-mono tabular-nums">
                            ({item.verified} verif.)
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-neutral-400 font-bold tabular-nums">
                        {item.pct}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800/80">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(item.pct, item.total > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400">
                <span>Proyección total con pendientes:</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {formatMoney(revenueTotal)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right: Tendencia Diaria & Salud Operativa */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="font-bebas text-2xl text-white uppercase tracking-wide flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Inscripciones · Últimos 7 Días
                </h3>
                <p className="text-xs text-neutral-400">
                  Ritmo diario de registros oficiales recibidos en red.
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                Tiempo Real
              </span>
            </div>

            {/* Clean CSS bar chart */}
            <div className="grid grid-cols-7 gap-2 items-end h-36 pt-5 pb-2 px-1">
              {dailyTrend.items.map((day) => {
                const heightPct = day.total > 0 ? Math.max(18, Math.round((day.total / dailyTrend.maxVal) * 100)) : 6;
                return (
                  <div key={day.label} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[11px] font-mono font-bold text-white tabular-nums">
                      {day.total > 0 ? day.total : ''}
                    </span>
                    <div className="w-full max-w-[34px] flex-1 flex items-end">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          day.total > 0
                            ? 'bg-gradient-to-t from-red-600 to-amber-400 shadow-sm shadow-red-600/30'
                            : 'bg-neutral-800/70'
                        }`}
                        style={{ height: `${heightPct}%` }}
                        title={`${day.label}: ${day.total} inscritos (${day.verified} verificados)`}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 text-center leading-none">
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Operational Health Progress Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-neutral-800 text-center">
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Pagos OK</span>
              <span className="font-bebas text-2xl text-emerald-400 tabular-nums">
                {verificationRate}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Fotos Drive</span>
              <span className="font-bebas text-2xl text-amber-400 tabular-nums">
                {totalRunners > 0 ? Math.round((drivePhotosCount / totalRunners) * 100) : 0}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Vouchers Drive</span>
              <span className="font-bebas text-2xl text-emerald-300 tabular-nums">
                {totalRunners > 0 ? Math.round((driveVouchersCount / totalRunners) * 100) : 0}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Mi Espacio</span>
              <span className="font-bebas text-2xl text-cyan-400 tabular-nums">
                {totalRunners > 0 ? Math.round((consultedCount / totalRunners) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub navigation between Detail Analytics Views */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/90 border border-neutral-800 p-3 rounded-2xl">
        <div className="flex flex-wrap items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveSubView('runners')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubView === 'runners'
                ? 'bg-red-950/80 text-red-200 border border-red-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-red-400" />
            <span>Seguimiento Mi Espacio ({consultedCount}/{totalRunners})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubView('sections')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubView === 'sections'
                ? 'bg-neutral-800 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Secciones Más Vistas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubView('feed')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubView === 'feed'
                ? 'bg-neutral-800 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Actividad en Vivo ({analyticsData?.recentActivity?.length || 0})</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
          <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
          <span>Kits pendientes: <strong className="text-white">{kitsPendingCount}</strong></span>
        </div>
      </div>

      {/* VIEW 1: SEGUIMIENTO MI ESPACIO (SANTA RUN 2026) */}
      {activeSubView === 'runners' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl shadow-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bebas text-xl sm:text-2xl text-white tracking-wide flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Seguimiento de Atletas en <span className="text-red-400">Mi Espacio</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Verifica quiénes ya consultaron su estado y QR en Mi Espacio y envía recordatorios por WhatsApp en 1 clic.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  filterType === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Todos ({totalRunners})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('consulted')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterType === 'consulted'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'text-neutral-400 hover:text-emerald-300'
                }`}
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ingresaron ({consultedCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType('pending')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterType === 'pending'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    : 'text-neutral-400 hover:text-amber-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Pendientes ({pendingConsultCount})</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-neutral-950/60 border-b border-neutral-800">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-neutral-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, DNI, código o WhatsApp..."
                className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-400"
              />
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-3">N°</th>
                  <th className="py-3 px-3">Atleta</th>
                  <th className="py-3 px-3">{isRiojaSelected ? 'DNI / Categoría' : 'DNI / Talla'}</th>
                  <th className="py-3 px-3">Pago</th>
                  <th className="py-3 px-3">Mi Espacio</th>
                  <th className="py-3 px-3">Última Consulta</th>
                  <th className="py-3 px-3 text-right">WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredRunners.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-neutral-500 text-sm">
                      {totalRunners === 0
                        ? `Aún no hay inscritos en ${isRiojaSelected ? 'Santa Run Rioja 2026' : 'Santa Run Tarapoto 2026'}. Cuando se inscriban aparecerán aquí en vivo.`
                        : 'No se encontraron atletas con los filtros seleccionados.'}
                    </td>
                  </tr>
                ) : (
                  filteredRunners.map((runner, index) => {
                    const runnerIsRioja = isRiojaRunner(runner);
                    const waMessage = runnerIsRioja
                      ? runner.hasConsulted
                        ? encodeURIComponent(
                            `¡Hola ${runner.firstName}! Te saluda el equipo de Santa Run Rioja 2026 (OHANA GO & Sacha Runners). Confirmamos tu acceso a Mi Espacio. Te esperamos el domingo 20 de diciembre a las 7:30 a. m. (Llegada: Don Diogo). ¡Corre y regala sonrisas!`
                          )
                        : encodeURIComponent(
                            `¡Hola ${runner.firstName}! Te saluda el equipo de Santa Run Rioja 2026 (OHANA GO & Sacha Runners). Ya puedes ingresar a "Mi Espacio" en www.ohanago.pro/santarunrioja con tu DNI (${runner.documentNumber}) para ver tu estado de verificación y tu código QR oficial.`
                          )
                      : runner.hasConsulted
                        ? encodeURIComponent(
                            `¡Hola ${runner.firstName}! Te saluda el equipo de Santa Run Tarapoto 2026. Confirmamos tu acceso a Mi Espacio. Recuerda que la concentración y entrega de kit es el sábado 19 de diciembre a las 6:00 PM en Aviación (largada 7:00 PM). ¡Te esperamos!`
                          )
                        : encodeURIComponent(
                            `¡Hola ${runner.firstName}! Te saluda el equipo de Santa Run Tarapoto 2026. Ya puedes ingresar a "Mi Espacio" en www.ohanago.pro/santaruntarapoto con tu DNI (${runner.documentNumber}) para ver tu estado de verificación y tu código QR oficial.`
                          );

                    return (
                      <tr key={runner.id} className="hover:bg-neutral-800/40 transition">
                        <td className="py-3 px-3 font-mono text-neutral-400 font-bold tabular-nums">
                          #{String(runner.registrationNumber || index + 1).padStart(4, '0')}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-white text-sm">
                            {runner.firstName} {runner.lastName}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                            <span className={`${runnerIsRioja ? 'text-amber-400' : 'text-red-400'} font-bold`}>
                              {runner.id}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <div className="font-bold text-neutral-200">{runner.documentNumber}</div>
                          <div className="text-[10px] text-neutral-400">
                            {runnerIsRioja ? (
                              <>
                                Cat:{' '}
                                <strong className="text-amber-300">
                                  {runner.raceCategory === 'Kids 2K' ? 'Kids 2K' : 'Libre 5K'}
                                </strong>
                              </>
                            ) : (
                              <>
                                Polo: <strong className="text-white">{runner.tShirtSize || 'M'}</strong>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {runner.paymentStatus === 'Verificado' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                              <CheckCircle2 className="w-3 h-3" /> Verificado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-950/70 text-amber-300 border border-amber-500/30">
                              <Clock className="w-3 h-3" /> Pendiente
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {runner.hasConsulted ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Ingresó ({runner.accessCount}x)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-neutral-950 border border-neutral-800 text-neutral-400">
                              <Clock className="w-3.5 h-3.5 text-neutral-500" />
                              <span>Sin ingreso</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-400 text-xs">
                          {formatTimeAgo(runner.lastAccess)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <a
                            href={`https://wa.me/51${(runner.whatsapp || '').replace(/\D/g, '')}?text=${waMessage}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition"
                            title="Enviar mensaje por WhatsApp"
                          >
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span>{runner.whatsapp}</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: SECCIONES MÁS VISTAS */}
      {activeSubView === 'sections' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div>
            <h3 className="font-bebas text-2xl text-white tracking-wide flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              Secciones Más Vistas por los Visitantes
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Medición en tiempo real de qué apartados de la web despiertan mayor interés.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectionsList.map((sec) => {
              const barPct = sec.views > 0 ? Math.max(8, Math.round((sec.views / maxSectionView) * 100)) : 0;
              return (
                <div key={sec.key} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white text-sm">{sec.name}</span>
                    <span className="font-bebas text-2xl text-red-400 tabular-nums shrink-0">
                      {sec.views} <span className="text-xs font-sans text-neutral-400 font-normal">vistas</span>
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">{sec.desc}</p>
                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: ACTIVIDAD EN VIVO */}
      {activeSubView === 'feed' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h3 className="font-bebas text-2xl text-white tracking-wide flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Actividad en Tiempo Real
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Últimos 40 eventos sincronizados en la nube: nuevas inscripciones, ingresos a Mi Espacio y check-ins.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-xs font-bold font-mono">
              ● En Vivo
            </span>
          </div>

          <div className="divide-y divide-neutral-800/60 max-h-[460px] overflow-y-auto pr-1">
            {!analyticsData?.recentActivity || analyticsData.recentActivity.length === 0 ? (
              <div className="py-12 text-center text-neutral-500 text-sm">
                Aún no hay eventos registrados. Las nuevas inscripciones y consultas aparecerán automáticamente aquí.
              </div>
            ) : (
              analyticsData.recentActivity.map((evt) => (
                <div key={evt.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <span className="font-bold text-white text-sm block truncate">{evt.title}</span>
                    <p className="text-neutral-400 text-xs mt-0.5">{evt.description}</p>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                    {formatTimeAgo(evt.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
