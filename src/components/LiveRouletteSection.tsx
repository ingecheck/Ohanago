import React, { useEffect, useState, useRef, useMemo } from 'react';
import { RouletteState, RouletteWinner } from '../types/roulette';
import { RunnerRegistration } from '../types/race';
import { playWheelClickSound, playWinnerFanfare } from '../utils/rouletteAudio';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  Gift,
  CheckCircle2,
  Volume2,
  VolumeX,
  History,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Ticket as TicketIcon,
  Flame,
  Maximize2
} from 'lucide-react';

interface LiveRouletteSectionProps {
  onClose?: () => void;
  isAdmin?: boolean;
  onOpenAdminControls?: () => void;
  registrations?: RunnerRegistration[];
}

// 8 high-contrast alternating neon colors for the 266 sectors
const SECTOR_PALETTE = [
  { bg: '#84cc16', text: '#000000' }, // Lime neon
  { bg: '#581c87', text: '#ffffff' }, // Deep Purple
  { bg: '#ea580c', text: '#ffffff' }, // Bright Orange
  { bg: '#0891b2', text: '#ffffff' }, // Cyan
  { bg: '#ca8a04', text: '#000000' }, // Gold / Yellow
  { bg: '#be185d', text: '#ffffff' }, // Hot Pink
  { bg: '#059669', text: '#ffffff' }, // Emerald
  { bg: '#1e40af', text: '#ffffff' }, // Electric Blue
];

// Precompute the geometry of all 266 sectors (1 to 266) once
const TOTAL_TICKETS = 266;
const PRECOMPUTED_SECTORS = Array.from({ length: TOTAL_TICKETS }, (_, idx) => {
  const ticketNumber = idx + 1;
  const degPerSlice = 360 / TOTAL_TICKETS;
  const degStart = idx * degPerSlice;
  const degEnd = (idx + 1) * degPerSlice;
  const degMid = (idx + 0.5) * degPerSlice;

  // Geometry: outer radius 485, inner radius 230, center at 500,500
  const radStart = ((degStart - 90) * Math.PI) / 180;
  const radEnd = ((degEnd - 90) * Math.PI) / 180;

  const xo1 = 500 + 485 * Math.cos(radStart);
  const yo1 = 500 + 485 * Math.sin(radStart);
  const xo2 = 500 + 485 * Math.cos(radEnd);
  const yo2 = 500 + 485 * Math.sin(radEnd);

  const xi2 = 500 + 230 * Math.cos(radEnd);
  const yi2 = 500 + 230 * Math.sin(radEnd);
  const xi1 = 500 + 230 * Math.cos(radStart);
  const yi1 = 500 + 230 * Math.sin(radStart);

  const pathD = `M ${xo1.toFixed(2)} ${yo1.toFixed(2)} A 485 485 0 0 1 ${xo2.toFixed(2)} ${yo2.toFixed(2)} L ${xi2.toFixed(2)} ${yi2.toFixed(2)} A 230 230 0 0 0 ${xi1.toFixed(2)} ${yi1.toFixed(2)} Z`;
  const color = SECTOR_PALETTE[idx % SECTOR_PALETTE.length];

  return {
    ticketNumber,
    pathD,
    degMid,
    bg: color.bg,
    text: color.text,
  };
});

export const LiveRouletteSection: React.FC<LiveRouletteSectionProps> = ({
  onClose,
  isAdmin = false,
  onOpenAdminControls,
  registrations = [],
}) => {
  const [state, setState] = useState<RouletteState>({
    isActive: true,
    totalTickets: 266,
    totalDraws: 22,
    currentDrawNumber: 1,
    currentPrizeName: 'Premio #1: Sorteo Oficial Ohana Go 5K',
    isSpinning: false,
    spinStartTime: 0,
    spinDuration: 6000,
    targetTicket: 1,
    targetAngle: 0,
    winners: [],
    lastWinner: null,
  });
  const [displayTicket, setDisplayTicket] = useState<number>(1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;

  // Search & Explorer state for the 266 tickets
  const [showTicketsDirectory, setShowTicketsDirectory] = useState<boolean>(false);
  const [searchTicketQuery, setSearchTicketQuery] = useState<string>('');
  const [filterTicketType, setFilterTicketType] = useState<'all' | 'available' | 'winners'>('all');

  const previousSpinTimeRef = useRef<number>(0);
  const tickerIntervalRef = useRef<any>(null);

  // Poll roulette state every 1000ms for seamless real-time synchronization
  const fetchRouletteState = async () => {
    try {
      const res = await fetch('/api/roulette');
      if (res.ok) {
        const data: RouletteState = await res.json();
        setState(data);

        // Check if a new spin just started from the server
        if (data.isSpinning && data.spinStartTime !== previousSpinTimeRef.current) {
          previousSpinTimeRef.current = data.spinStartTime;
          triggerClientSpin(data);
        } else if (!data.isSpinning && !isAnimating && data.lastWinner) {
          setDisplayTicket(data.lastWinner.ticketNumber);
        }
      }
    } catch (e) {
      console.warn('Error fetching roulette state:', e);
    }
  };

  useEffect(() => {
    fetchRouletteState();
    const interval = setInterval(fetchRouletteState, 1000);
    return () => clearInterval(interval);
  }, [isAnimating]);

  const triggerClientSpin = (rouletteData: RouletteState) => {
    setIsAnimating(true);

    // Fast ticking number effect during spin
    let tickCount = 0;
    if (tickerIntervalRef.current) clearInterval(tickerIntervalRef.current);

    tickerIntervalRef.current = setInterval(() => {
      const randomTicket = Math.floor(Math.random() * TOTAL_TICKETS) + 1;
      setDisplayTicket(randomTicket);
      tickCount++;
      if (soundRef.current && tickCount % 2 === 0) {
        playWheelClickSound();
      }
    }, 65);

    // Animate rotation to server target angle
    const targetDeg = rouletteData.targetAngle || 2160 + (rouletteData.targetTicket * (360 / TOTAL_TICKETS));
    setWheelRotation(targetDeg);

    // After 6 seconds, conclude spin and announce winner
    setTimeout(() => {
      if (tickerIntervalRef.current) clearInterval(tickerIntervalRef.current);
      setDisplayTicket(rouletteData.targetTicket);
      setIsAnimating(false);

      if (soundRef.current) {
        playWinnerFanfare();
      }

      try {
        confetti({
          particleCount: 180,
          spread: 95,
          origin: { y: 0.55 },
          colors: ['#84cc16', '#ea580c', '#a855f7', '#06b6d4', '#eab308', '#ec4899'],
        });
      } catch (e) {}
    }, 6000);
  };

  // Helper map: ticketNumber -> Winner or Registered Athlete
  const winnersMap = useMemo(() => {
    const map = new Map<number, RouletteWinner>();
    if (state?.winners) {
      state.winners.forEach((w) => map.set(w.ticketNumber, w));
    }
    return map;
  }, [state?.winners]);

  const runnersMap = useMemo(() => {
    const map = new Map<number, RunnerRegistration>();
    registrations.forEach((r, idx) => {
      const ticketNum = r.registrationNumber || r.bibNumber || (idx + 1);
      if (ticketNum >= 1 && ticketNum <= TOTAL_TICKETS) {
        map.set(ticketNum, r);
      }
    });
    return map;
  }, [registrations]);

  // Compute tape window (surrounding numbers) centered at displayTicket
  const tapeTickets = useMemo(() => {
    const arr = [];
    for (let offset = -3; offset <= 3; offset++) {
      let t = displayTicket + offset;
      while (t < 1) t += TOTAL_TICKETS;
      while (t > TOTAL_TICKETS) t -= TOTAL_TICKETS;
      arr.push({ ticket: t, isCenter: offset === 0 });
    }
    return arr;
  }, [displayTicket]);

  if (state && state.isActive === false && !isAdmin) {
    return null;
  }

  // Filtered tickets for the 266 directory explorer
  const filteredTickets = PRECOMPUTED_SECTORS.filter((s) => {
    const isWinner = winnersMap.has(s.ticketNumber);
    if (filterTicketType === 'winners' && !isWinner) return false;
    if (filterTicketType === 'available' && isWinner) return false;

    if (searchTicketQuery.trim()) {
      const q = searchTicketQuery.toLowerCase().trim();
      const numStr = String(s.ticketNumber);
      const runner = runnersMap.get(s.ticketNumber);
      const runnerName = runner ? `${runner.firstName} ${runner.lastName}`.toLowerCase() : '';
      const runnerDni = runner ? runner.documentNumber : '';
      return numStr.includes(q) || runnerName.includes(q) || runnerDni.includes(q);
    }
    return true;
  });

  return (
    <section id="ruleta-sorteo" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-neutral-950 via-purple-950/40 to-neutral-950 relative overflow-hidden border-y-2 border-lime-400/50">
      {/* Background Neon Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-lime-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        {/* Top Header Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border-2 border-red-500/60 text-red-200 text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/20 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
            🔴 SORTEO EN VIVO • OHANA GO 5K TARAPOTO
          </div>

          <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-wider uppercase drop-shadow-md">
            Ruleta Oficial de <span className="text-lime-400">266 Tickets</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto">
            Participan los <strong>266 números completos (#001 al #266)</strong> de la carrera. ¡22 grandes premios en disputa en vivo y en directo en la meta!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <span className="px-3.5 py-1 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-200 text-xs font-bold font-mono">
              {state.currentDrawNumber <= 22 ? `Sorteo #${state.currentDrawNumber} de 22` : '¡22 Sorteos Concluidos!'}
            </span>

            <span className="px-3 py-1 rounded-xl bg-lime-400/15 border border-lime-400/40 text-lime-400 text-xs font-bold font-mono">
              266 Números en la Ruleta
            </span>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
              title={soundEnabled ? 'Silenciar efectos de sonido' : 'Activar sonido'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-lime-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {isAdmin && onOpenAdminControls && (
              <button
                onClick={onOpenAdminControls}
                className="px-3.5 py-1 rounded-xl bg-lime-400 text-black font-bebas text-sm uppercase tracking-wide font-black hover:bg-lime-300 transition cursor-pointer shadow-md"
              >
                Control Admin Ruleta
              </button>
            )}
          </div>
        </div>

        {/* Current Prize Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-950/60 via-neutral-900 to-purple-950/60 border border-amber-500/40 shadow-xl max-w-2xl mx-auto text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-0.5">
            🎁 Premio En Disputa
          </span>
          <h3 className="font-bebas text-2xl sm:text-3xl text-white uppercase tracking-wide">
            {state.currentPrizeName || `Sorteo #${state.currentDrawNumber} de 22`}
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Total de Ganadores hasta el momento: <strong className="text-lime-400 font-mono">{state.winners.length}</strong> de 22
          </p>
        </div>

        {/* HIGH-PRECISION ZOOM TAPE / ODÓMETRO SUPERIOR */}
        <div className="max-w-md mx-auto bg-neutral-900/90 border-2 border-lime-400/50 rounded-2xl p-2.5 shadow-2xl">
          <div className="flex items-center justify-between px-2 mb-1 text-[10px] font-black uppercase tracking-wider text-neutral-400">
            <span>Visor de Cinta Zoom</span>
            <span className="text-lime-400 font-mono">1 a 266</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-hidden py-1">
            {tapeTickets.map((item, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center rounded-xl transition-all duration-150 ${
                  item.isCenter
                    ? 'w-16 sm:w-20 h-14 bg-gradient-to-b from-lime-400 to-lime-500 text-black font-black scale-110 shadow-[0_0_20px_rgba(163,230,53,0.8)] border-2 border-white'
                    : 'w-10 sm:w-12 h-10 bg-neutral-950 text-neutral-400 text-xs font-mono border border-neutral-800 opacity-60'
                }`}
              >
                {item.isCenter && (
                  <span className="text-[8px] uppercase tracking-widest leading-none font-sans font-black">
                    {isAnimating ? 'GIRANDO' : 'TICKET'}
                  </span>
                )}
                <span className={`font-mono leading-none ${item.isCenter ? 'font-bebas text-2xl sm:text-3xl' : 'font-bold'}`}>
                  #{String(item.ticket).padStart(3, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* The 266-Slice Giant Roulette & Status Card */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14 pt-2">
          {/* Wheel Graphic Container */}
          <div className="relative w-[340px] sm:w-[440px] md:w-[480px] h-[340px] sm:h-[440px] md:h-[480px] flex items-center justify-center">
            {/* Top Fixed Marker / Pointer (points to 12 o'clock) */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none drop-shadow-[0_4px_16px_rgba(234,179,8,1)]">
              <div className="w-7 h-7 bg-amber-400 border-2 border-white rotate-45 transform origin-center shadow-2xl" />
              <div className="w-2 h-3 bg-red-600 rounded-full -mt-2.5" />
            </div>

            {/* Glowing outer bezel with neon studs */}
            <div className="absolute inset-0 rounded-full border-8 border-neutral-900 shadow-[0_0_60px_rgba(163,230,53,0.35)] bg-gradient-to-b from-neutral-800 to-neutral-950 p-2">
              <div className="w-full h-full rounded-full border-4 border-amber-400/70 relative overflow-hidden" />
            </div>

            {/* Spinning SVG Wheel with ALL 266 SECTORS AND NUMBERS */}
            <div
              className="w-[305px] sm:w-[395px] md:w-[435px] h-[305px] sm:h-[395px] md:h-[435px] rounded-full relative overflow-hidden transition-transform shadow-2xl"
              style={{
                transform: `rotate(${wheelRotation}deg)`,
                transitionDuration: isAnimating ? '6000ms' : '0ms',
                transitionTimingFunction: 'cubic-bezier(0.12, 0.8, 0.22, 1)',
              }}
            >
              <svg
                viewBox="0 0 1000 1000"
                className="w-full h-full"
                shapeRendering="geometricPrecision"
              >
                <defs>
                  <filter id="glow-sector" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#ffffff" floodOpacity="0.5" />
                  </filter>
                </defs>

                {/* Draw each of the 266 sectors */}
                <g>
                  {PRECOMPUTED_SECTORS.map((sec) => (
                    <path
                      key={sec.ticketNumber}
                      d={sec.pathD}
                      fill={sec.bg}
                      stroke="#000000"
                      strokeWidth="0.6"
                      opacity="0.96"
                    />
                  ))}
                </g>

                {/* Outer Rim separator circle */}
                <circle cx="500" cy="500" r="485" fill="none" stroke="#eab308" strokeWidth="3" />
                <circle cx="500" cy="500" r="230" fill="none" stroke="#eab308" strokeWidth="2.5" />

                {/* Draw ticket number text for all 266 sectors radially */}
                <g>
                  {PRECOMPUTED_SECTORS.map((sec) => (
                    <g key={sec.ticketNumber} transform={`rotate(${sec.degMid} 500 500)`}>
                      <text
                        x="500"
                        y="95"
                        fill={sec.text}
                        fontSize="7.5"
                        fontWeight="900"
                        fontFamily="ui-monospace, SFMono-Regular, monospace"
                        textAnchor="middle"
                        transform="rotate(90 500 95)"
                        letterSpacing="-0.3"
                      >
                        {sec.ticketNumber}
                      </text>
                    </g>
                  ))}
                </g>
              </svg>
            </div>

            {/* Glowing Center Hub with Live Ticket Odometer */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-28 sm:w-34 h-28 sm:h-34 rounded-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border-4 border-lime-400 flex flex-col items-center justify-center text-center shadow-[0_0_40px_rgba(163,230,53,0.6)]">
              <span className="text-[9px] font-black uppercase tracking-wider text-lime-400">
                Ticket Oficial
              </span>
              <span className="font-bebas text-3xl sm:text-4xl text-white font-mono font-bold leading-none mt-0.5 drop-shadow">
                #{String(displayTicket).padStart(3, '0')}
              </span>
              <span className="text-[8px] text-neutral-400 mt-0.5 font-mono">
                de 266 Tickets
              </span>
            </div>
          </div>

          {/* Real-time Status Card & Winner Announcement */}
          <div className="w-full max-w-md bg-neutral-900/90 border-2 border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h4 className="font-bebas text-2xl text-white uppercase tracking-wide">
                  Estado del Sorteo
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30 text-xs font-mono font-bold">
                266 Tickets
              </span>
            </div>

            {/* Live Animation Indicator */}
            {isAnimating ? (
              <div className="p-4 rounded-2xl bg-purple-950/80 border border-purple-500/50 text-center space-y-2 animate-pulse">
                <div className="w-10 h-10 rounded-full border-3 border-lime-400 border-t-transparent animate-spin mx-auto" />
                <h5 className="font-bebas text-2xl text-white tracking-wide uppercase">
                  ¡La Ruleta está girando en vivo!
                </h5>
                <p className="text-xs text-purple-200">
                  Determinando al ganador entre los <strong>266 tickets</strong> para el <strong>{state.currentPrizeName}</strong>...
                </p>
              </div>
            ) : state.lastWinner ? (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-neutral-950 to-emerald-950/90 border-2 border-emerald-400 text-center space-y-2 shadow-xl shadow-emerald-500/15">
                <span className="px-3 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-400/40 inline-block">
                  ✓ Ganador Sorteo #{state.lastWinner.drawNumber}
                </span>

                <div className="font-bebas text-4xl sm:text-5xl text-lime-400 font-mono tracking-wider">
                  Ticket #{String(state.lastWinner.ticketNumber).padStart(3, '0')}
                </div>

                <div className="text-white font-bold text-sm sm:text-base">
                  {state.lastWinner.runnerName || 'Participante Asignado'}
                </div>

                {state.lastWinner.runnerDni && (
                  <div className="text-xs text-neutral-400 font-mono">
                    DNI: <strong className="text-white">{state.lastWinner.runnerDni}</strong>
                  </div>
                )}

                <div className="text-xs text-amber-300 font-medium pt-1 border-t border-neutral-800">
                  Premio: <strong>{state.lastWinner.prizeName}</strong>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 text-center text-xs text-neutral-400 space-y-2">
                <Gift className="w-8 h-8 text-neutral-600 mx-auto" />
                <p>
                  El sorteo está listo. Cuando el organizador active el giro desde el panel, todos los presentes verán la ruleta girar en vivo.
                </p>
              </div>
            )}

            {/* List of Previous Winners (Accordion summary) */}
            {state.winners.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-neutral-400 font-bold uppercase">
                  <span>Ganadores Confirmados ({state.winners.length} de 22)</span>
                  <History className="w-3.5 h-3.5 text-lime-400" />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-neutral-800/60">
                  {state.winners.map((winner, idx) => (
                    <div key={idx} className="pt-1.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-lime-400">
                          #{String(winner.ticketNumber).padStart(3, '0')}
                        </span>{' '}
                        <span className="font-bold text-white truncate max-w-[170px] inline-block align-bottom">
                          {winner.runnerName || 'Participante'}
                        </span>
                        <div className="text-[10px] text-neutral-400 truncate max-w-[200px]">
                          {winner.prizeName}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 text-[10px] font-mono">
                        Sorteo {winner.drawNumber}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 266 TICKETS DIRECTORY & EXPLORER TOGGLE */}
        <div className="bg-neutral-900/90 border-2 border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lime-400/20 text-lime-400 flex items-center justify-center font-bold text-lg">
                <TicketIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bebas text-2xl text-white uppercase tracking-wide leading-none">
                  Padrón de los 266 Tickets Participantes
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Verifica tu número de ticket (#001 al #266) y el estado en el sorteo en tiempo real.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTicketsDirectory(!showTicketsDirectory)}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <span>{showTicketsDirectory ? 'Ocultar Padrón de 266 Tickets' : 'Ver Padrón de 266 Tickets'}</span>
              {showTicketsDirectory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showTicketsDirectory && (
            <div className="mt-5 space-y-4">
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={searchTicketQuery}
                    onChange={(e) => setSearchTicketQuery(e.target.value)}
                    placeholder="Buscar por # de ticket (ej: 045, 120) o nombre de atleta..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setFilterTicketType('all')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex-1 sm:flex-initial ${
                      filterTicketType === 'all'
                        ? 'bg-lime-400 text-black'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    Todos (266)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterTicketType('available')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex-1 sm:flex-initial ${
                      filterTicketType === 'available'
                        ? 'bg-lime-400 text-black'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    En Juego ({266 - (state.winners.length || 0)})
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterTicketType('winners')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex-1 sm:flex-initial ${
                      filterTicketType === 'winners'
                        ? 'bg-lime-400 text-black'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    Ganadores ({state.winners.length || 0})
                  </button>
                </div>
              </div>

              {/* Grid of the 266 Tickets */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredTickets.map((s) => {
                  const winner = winnersMap.get(s.ticketNumber);
                  const runner = runnersMap.get(s.ticketNumber);
                  const isCurrent = displayTicket === s.ticketNumber;

                  return (
                    <div
                      key={s.ticketNumber}
                      className={`p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                        winner
                          ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-md'
                          : isCurrent
                          ? 'bg-purple-950/90 border-lime-400 text-white ring-2 ring-lime-400/50'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-mono font-black ${winner ? 'text-lime-300' : 'text-lime-400'}`}>
                          #{String(s.ticketNumber).padStart(3, '0')}
                        </span>
                        {winner ? (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/30 text-[9px] font-bold text-emerald-300 uppercase">
                            🏆 Sorteo {winner.drawNumber}
                          </span>
                        ) : (
                          <span className="text-[9px] text-neutral-500 font-mono">
                            En Juego
                          </span>
                        )}
                      </div>

                      <div className="mt-1 font-bold text-[11px] truncate text-white" title={winner?.runnerName || (runner ? `${runner.firstName} ${runner.lastName}` : 'Ticket Oficial')}>
                        {winner?.runnerName || (runner ? `${runner.firstName} ${runner.lastName}` : `Ticket Oficial #${String(s.ticketNumber).padStart(3, '0')}`)}
                      </div>

                      {winner && (
                        <div className="text-[9px] text-amber-300 truncate mt-0.5">
                          {winner.prizeName}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {filteredTickets.length === 0 && (
                <div className="py-8 text-center text-xs text-neutral-500">
                  No se encontraron tickets con la búsqueda realizada.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
