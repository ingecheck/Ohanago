import React, { useState } from 'react';
import { RunnerRegistration } from '../types/race';
import { AnalyticsSummary } from '../utils/analytics';
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
  MapPin,
  Award,
  HelpCircle,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  Check,
  RotateCcw
} from 'lucide-react';

interface AdminAnalyticsTabProps {
  registrations: RunnerRegistration[];
  analyticsData: AnalyticsSummary | null;
  isLoading: boolean;
  onRefresh: () => void;
  onResetAnalytics?: () => void;
}

export const AdminAnalyticsTab: React.FC<AdminAnalyticsTabProps> = ({
  registrations,
  analyticsData,
  isLoading,
  onRefresh,
  onResetAnalytics,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'consulted' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubView, setActiveSubView] = useState<'runners' | 'sections' | 'feed'>('runners');

  const totalRunners = registrations.length;

  // Map of competitor accesses by DNI or runner ID
  const accessMap = new Map<string, { count: number; lastAccess: string }>();
  if (analyticsData?.competitorAccesses) {
    for (const record of analyticsData.competitorAccesses) {
      if (record.documentNumber) {
        accessMap.set(record.documentNumber.replace(/\D/g, ''), {
          count: record.accessCount,
          lastAccess: record.lastAccess,
        });
      }
      if (record.runnerId) {
        accessMap.set(record.runnerId.toLowerCase(), {
          count: record.accessCount,
          lastAccess: record.lastAccess,
        });
      }
    }
  }

  // Cross-reference all 128 registered runners with access logs
  const runnersWithAccess = registrations.map((runner) => {
    const cleanDni = runner.documentNumber.replace(/\D/g, '');
    const cleanId = runner.id.toLowerCase();
    const access = accessMap.get(cleanDni) || accessMap.get(cleanId);
    return {
      ...runner,
      hasConsulted: !!access,
      accessCount: access ? access.count : 0,
      lastAccess: access ? access.lastAccess : null,
    };
  });

  const consultedCount = runnersWithAccess.filter((r) => r.hasConsulted).length;
  const pendingCount = totalRunners - consultedCount;

  // Filter runners by search & status
  const filteredRunners = runnersWithAccess.filter((r) => {
    const q = searchTerm.toLowerCase().trim();
    const matchSearch =
      !q ||
      r.firstName.toLowerCase().includes(q) ||
      r.lastName.toLowerCase().includes(q) ||
      r.documentNumber.includes(q) ||
      r.whatsapp.includes(q) ||
      r.id.toLowerCase().includes(q);

    if (!matchSearch) return false;
    if (filterType === 'consulted') return r.hasConsulted;
    if (filterType === 'pending') return !r.hasConsulted;
    return true;
  });

  // Calculate section views
  const sectionViews = analyticsData?.sectionViews || {};
  const totalSectionViews = Object.values(sectionViews).reduce((a, b) => a + b, 0) || 1;

  const sectionsList = [
    {
      key: 'ruta-5k',
      name: 'Ruta Oficial 5K Tarapoto',
      icon: '🗺️',
      views: (sectionViews['ruta-5k'] || 0) + (sectionViews['circuito_5k'] || 0),
      desc: 'Mapa del circuito de Plaza de Armas a Entre Jarras',
    },
    {
      key: 'kit-evento',
      name: 'Medalla Finisher & Kit Oficial',
      icon: '🏅',
      views: (sectionViews['kit-evento'] || 0) + (sectionViews['kit_oficial'] || 0),
      desc: 'Detalles de la medalla en relieve, pulsera neón y beneficios',
    },
    {
      key: 'horarios',
      name: 'Horarios & Concentración (5:30 PM)',
      icon: '⏰',
      views: sectionViews['horarios'] || 0,
      desc: 'Cronograma oficial de acreditación y largada nocturna',
    },
    {
      key: 'reglamento',
      name: 'Reglamento & Preguntas Frecuentes',
      icon: '📜',
      views: (sectionViews['reglamento'] || 0) + (sectionViews['faq'] || 0),
      desc: 'Bases de participación, seguridad y sorteos',
    },
  ];

  // Helper to format ISO date
  const formatTimeAgo = (isoString: string | null) => {
    if (!isoString) return 'Nunca';
    try {
      const d = new Date(isoString);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Hace un momento';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `Hace ${diffHours} h`;
      return d.toLocaleDateString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards (4 Key Metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Page Views */}
        <div className="bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-neutral-800 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Visitas a la Web</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-bebas text-3xl sm:text-4xl text-white">
              {analyticsData?.totalPageViews || 0}
            </span>
            <span className="text-[11px] text-neutral-400">vistas totales</span>
          </div>
          <div className="text-[11px] text-cyan-400/90 font-medium mt-1 flex items-center gap-1">
            <span>{analyticsData?.uniqueVisitorsCount || 0} visitantes únicos</span>
          </div>
        </div>

        {/* Clicks on "Mi Espacio" */}
        <div className="bg-neutral-900 p-4 sm:p-5 rounded-2xl border-2 border-purple-500/40 shadow-md shadow-purple-500/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-purple-300">
            <span className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-lime-400" /> Clics en "Mi Espacio"
            </span>
            <MousePointerClick className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-bebas text-3xl sm:text-4xl text-purple-300">
              {analyticsData?.miEspacioClicks || 0}
            </span>
            <span className="text-[11px] text-purple-400/80 font-bold">veces abierto</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Accesos al portal de credenciales
          </div>
        </div>

        {/* Atletas que consultaron su espacio */}
        <div className="bg-neutral-900 p-4 sm:p-5 rounded-2xl border-2 border-lime-500/40 shadow-md shadow-lime-500/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-lime-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Atletas que Consultaron</span>
            <CheckCircle2 className="w-4 h-4 text-lime-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-bebas text-3xl sm:text-4xl text-lime-400">
              {consultedCount}
            </span>
            <span className="text-[11px] text-lime-300/80 font-bold">de {totalRunners}</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1.5">
            <span className="font-mono text-lime-400 font-bold">
              {Math.round((consultedCount / (totalRunners || 1)) * 100)}%
            </span>
            <span>ya tienen listo su QR</span>
          </div>
        </div>

        {/* Faltan consultar su QR */}
        <div className="bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-amber-500/40 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Pendientes de Consultar</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-bebas text-3xl sm:text-4xl text-amber-400">
              {pendingCount}
            </span>
            <span className="text-[11px] text-neutral-400">atletas</span>
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1">
            Recordar por WhatsApp antes de las 5:30 PM
          </div>
        </div>
      </div>

      {/* Sub navigation between Analytics Views */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/90 border border-neutral-800 p-3 rounded-2xl">
        <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
          <button
            onClick={() => setActiveSubView('runners')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubView === 'runners'
                ? 'bg-purple-900/80 text-purple-200 border border-purple-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-lime-400" />
            <span>¿Quiénes entraron a Mi Espacio? ({consultedCount})</span>
          </button>

          <button
            onClick={() => setActiveSubView('sections')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubView === 'sections'
                ? 'bg-neutral-800 text-lime-400 border border-lime-400/30 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>¿Qué miran los usuarios?</span>
          </button>

          <button
            onClick={() => setActiveSubView('feed')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubView === 'feed'
                ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Registro en Vivo ({analyticsData?.recentActivity?.length || 0})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition cursor-pointer border border-neutral-700"
            title="Refrescar métricas ahora"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-lime-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>

          {onResetAnalytics && (
            <button
              onClick={() => {
                if (window.confirm('¿Seguro que deseas reiniciar los contadores de analítica a 0?')) {
                  onResetAnalytics();
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-950 hover:bg-red-950/60 text-neutral-400 hover:text-red-300 text-xs transition cursor-pointer border border-neutral-800"
              title="Reiniciar contadores de prueba"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reiniciar</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: ¿QUIÉNES ENTRARON A MI ESPACIO? (TABLA DETALLADA) */}
      {activeSubView === 'runners' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl shadow-xl overflow-hidden">
          {/* Header & Filter Controls */}
          <div className="p-4 sm:p-5 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bebas text-xl sm:text-2xl text-white tracking-wide flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-lime-400" />
                Monitoreo de Acceso a <span className="text-purple-400">Mi Espacio</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Identifica qué corredores ya ingresaron su DNI para ver su QR y credencial, y a quiénes recordarles.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  filterType === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Todos ({totalRunners})
              </button>
              <button
                onClick={() => setFilterType('consulted')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterType === 'consulted'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'text-neutral-400 hover:text-emerald-300'
                }`}
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ya Consultaron ({consultedCount})</span>
              </button>
              <button
                onClick={() => setFilterType('pending')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterType === 'pending'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    : 'text-neutral-400 hover:text-amber-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Faltan Consultar ({pendingCount})</span>
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="p-3 bg-neutral-950/60 border-b border-neutral-800">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-neutral-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, DNI o número celular..."
                className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-3">N°</th>
                  <th className="py-3 px-3">Atleta</th>
                  <th className="py-3 px-3">DNI</th>
                  <th className="py-3 px-3">¿Ingresó a Mi Espacio?</th>
                  <th className="py-3 px-3">Última Consulta</th>
                  <th className="py-3 px-3">Kit Inicial</th>
                  <th className="py-3 px-3 text-right">Contacto WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredRunners.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-neutral-500 text-sm">
                      No se encontraron atletas con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredRunners.map((runner, index) => {
                    const waMessage = runner.hasConsulted
                      ? encodeURIComponent(
                          `¡Hola ${runner.firstName}! Te saluda el equipo de Ohana Go 🎃. Confirmamos que revisaste tu credencial en Mi Espacio. Recuerda que la concentración es hoy a las 5:30 PM en Plaza de Armas de Tarapoto para entrega de tu kit y pulsera neón. ¡Te esperamos!`
                        )
                      : encodeURIComponent(
                          `¡Hola ${runner.firstName}! Te saluda el equipo de Ohana Go 🏃. Queremos recordarte que la concentración es hoy a las 5:30 PM en Plaza de Armas. Por favor ingresa a la web y haz clic en "Mi Espacio" con tu DNI (${runner.documentNumber}) para tener tu pase y QR listos para la entrega del kit.`
                        );

                    return (
                      <tr key={runner.id} className="hover:bg-neutral-800/40 transition">
                        <td className="py-3 px-3 font-mono text-neutral-400 font-bold">
                          {runner.registrationNumber || index + 1}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-white text-sm">
                            {runner.firstName} {runner.lastName}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono flex items-center gap-1 mt-0.5">
                            <span className="text-lime-400">{runner.id}</span>
                            {runner.runningClub && (
                              <span className="bg-neutral-800 px-1.5 rounded">
                                {runner.runningClub}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-neutral-300">
                          {runner.documentNumber}
                        </td>
                        <td className="py-3 px-3">
                          {runner.hasConsulted ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>✓ Ingresó ({runner.accessCount} {runner.accessCount === 1 ? 'vez' : 'veces'})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-amber-950/60 border border-amber-500/30 text-amber-300">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>⏳ No ha ingresado</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-400 text-xs">
                          {formatTimeAgo(runner.lastAccess)}
                        </td>
                        <td className="py-3 px-3">
                          {runner.confirmedAtStart ? (
                            <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-emerald-400" /> Kit Entregado
                            </span>
                          ) : (
                            <span className="text-neutral-500 text-xs">Pendiente</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <a
                            href={`https://wa.me/51${runner.whatsapp.replace(/\D/g, '')}?text=${waMessage}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition"
                            title="Enviar recordatorio por WhatsApp"
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

      {/* VIEW 2: ¿QUÉ MIRAN LOS USUARIOS? (SECCIONES MÁS VISTAS) */}
      {activeSubView === 'sections' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="font-bebas text-2xl text-white tracking-wide flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              Secciones Más Vistas por los Visitantes
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Descubre qué contenido genera mayor interés en los corredores antes de la carrera.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectionsList.map((sec) => {
              const pct = Math.min(100, Math.round((sec.views / (analyticsData?.totalPageViews || 1)) * 100));
              return (
                <div key={sec.key} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <span className="text-xl">{sec.icon}</span> {sec.name}
                    </span>
                    <span className="font-bebas text-2xl text-lime-400">
                      {sec.views} <span className="text-xs font-sans text-neutral-400 font-normal">vistas</span>
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">{sec.desc}</p>
                  {/* Progress bar */}
                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-lime-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                    <span>Interés en la plataforma</span>
                    <span>{pct}% de visitantes</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: REGISTRO DE ACTIVIDAD EN VIVO (LIVE STREAM) */}
      {activeSubView === 'feed' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h3 className="font-bebas text-2xl text-white tracking-wide flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Flujo de Actividad en Tiempo Real
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Eventos recientes de navegación, clics en Mi Espacio y consultas de credenciales.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-xs font-bold font-mono">
              ● En Vivo
            </span>
          </div>

          <div className="divide-y divide-neutral-800/60 max-h-[500px] overflow-y-auto space-y-2 pr-1">
            {!analyticsData?.recentActivity || analyticsData.recentActivity.length === 0 ? (
              <div className="py-12 text-center text-neutral-500 text-sm">
                Aún no hay eventos registrados en este momento. Los nuevos eventos aparecerán automáticamente.
              </div>
            ) : (
              analyticsData.recentActivity.map((evt) => {
                const getEventBadge = () => {
                  if (evt.type === 'runner_login') {
                    return <span className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-500/40">🪪</span>;
                  }
                  if (evt.type === 'click_mi_espacio') {
                    return <span className="p-2 rounded-xl bg-lime-950 text-lime-400 border border-lime-500/40">🖱️</span>;
                  }
                  if (evt.type === 'qr_scan') {
                    return <span className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/40">🏁</span>;
                  }
                  if (evt.type === 'section_view') {
                    return <span className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/40">👁️</span>;
                  }
                  return <span className="p-2 rounded-xl bg-neutral-800 text-neutral-400">🌐</span>;
                };

                return (
                  <div key={evt.id} className="pt-2 pb-2 flex items-start gap-3 text-xs">
                    <div className="shrink-0 text-base">{getEventBadge()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-sm truncate">{evt.title}</span>
                        <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                          {formatTimeAgo(evt.timestamp)}
                        </span>
                      </div>
                      <p className="text-neutral-400 text-xs mt-0.5">{evt.description}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
