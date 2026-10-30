import React, { useState, useEffect } from 'react';
import { RouletteState, RouletteWinner } from '../types/roulette';
import { RunnerRegistration } from '../types/race';
import {
  Trophy,
  X,
  Play,
  RotateCcw,
  Sparkles,
  Gift,
  CheckCircle2,
  Trash2,
  Eye,
  EyeOff,
  Flame,
  Award,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

import {
  fetchRouletteStateSafe,
  spinRouletteSafe,
  toggleRouletteSafe,
  resetRouletteSafe,
  removeWinnerSafe,
} from '../utils/rouletteManager';

interface AdminRouletteModalProps {
  onClose: () => void;
  registrations: RunnerRegistration[];
}

export const AdminRouletteModal: React.FC<AdminRouletteModalProps> = ({
  onClose,
  registrations,
}) => {
  const [rouletteState, setRouletteState] = useState<RouletteState | null>(null);
  const [isSpinningLocal, setIsSpinningLocal] = useState<boolean>(false);
  const [customPrizeInput, setCustomPrizeInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState<boolean>(false);
  const [confirmRemoveDraw, setConfirmRemoveDraw] = useState<number | null>(null);

  const fetchState = async () => {
    try {
      const data = await fetchRouletteStateSafe();
      setRouletteState(data);
      if (!customPrizeInput && data.currentPrizeName) {
        setCustomPrizeInput(data.currentPrizeName);
      }
    } catch (e) {
      console.warn('Error fetching roulette state:', e);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleToggleActive = async () => {
    setIsLoading(true);
    try {
      const data = await toggleRouletteSafe(!rouletteState?.isActive);
      setRouletteState(data);
      setNotice(data.isActive ? '✓ Ruleta activada en la página principal.' : '✓ Ruleta ocultada de la página principal.');
      setTimeout(() => setNotice(null), 4000);
    } catch (e) {
      setErrorNotice('Error al alternar estado de la ruleta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpin = async () => {
    if (isSpinningLocal || rouletteState?.isSpinning) return;
    setIsSpinningLocal(true);
    setIsLoading(true);
    setErrorNotice(null);

    try {
      const result = await spinRouletteSafe(customPrizeInput.trim(), registrations);
      setRouletteState(result.roulette);
      setCustomPrizeInput(result.roulette.currentPrizeName || '');
      setNotice(`🎡 ¡Ruleta girando en vivo para todos los visitantes!`);

      // 6 seconds spin animation
      setTimeout(() => {
        setIsSpinningLocal(false);
        setNotice(`🎉 ¡Ganador del Sorteo #${result.winner.drawNumber}: Ticket #${String(result.winner.ticketNumber).padStart(3, '0')} (${result.winner.runnerName})!`);
        try {
          confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
        } catch (e) {}
      }, 6000);
    } catch (e: any) {
      setIsSpinningLocal(false);
      setErrorNotice(e?.message || 'Error al girar la ruleta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveWinner = async (drawNumber: number) => {
    try {
      const updated = await removeWinnerSafe(drawNumber);
      setRouletteState(updated);
      setNotice(`✓ Sorteo #${drawNumber} anulado. Puedes volver a girar.`);
      setConfirmRemoveDraw(null);
      setTimeout(() => setNotice(null), 4000);
    } catch (e) {
      setErrorNotice('Error al anular sorteo.');
    }
  };

  const handleResetAll = async () => {
    try {
      const resetState = await resetRouletteSafe();
      setRouletteState(resetState);
      setCustomPrizeInput(resetState.currentPrizeName || 'Premio #1: Sorteo Oficial Ohana Go 5K');
      setNotice('✓ Ruleta reiniciada a 0.');
      setConfirmResetOpen(false);
      setTimeout(() => setNotice(null), 4000);
    } catch (e) {
      setErrorNotice('Error al reiniciar sorteos.');
    }
  };

  const winnersCount = rouletteState?.winners.length || 0;
  const isAllDrawn = winnersCount >= 22;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-5 bg-black/95 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-neutral-900 border-2 border-lime-400 rounded-3xl p-5 sm:p-7 shadow-[0_0_80px_rgba(163,230,53,0.3)] flex flex-col max-h-[94vh] overflow-y-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-lime-400 text-black flex items-center justify-center font-black text-2xl shadow-lg shadow-lime-400/20">
              🎡
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-400/30">
                Control de Sorteos en Vivo
              </span>
              <h3 className="font-bebas text-2xl sm:text-3xl text-white uppercase tracking-wide leading-none mt-1">
                Ruleta Oficial • <span className="text-lime-400">22 Sorteos (266 Tickets)</span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice alert */}
        {notice && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center justify-between animate-pulse">
            <span>{notice}</span>
            <button onClick={() => setNotice(null)} className="text-emerald-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error alert */}
        {errorNotice && (
          <div className="mb-4 p-3 rounded-2xl bg-red-950/90 border-2 border-red-500 text-red-200 text-xs font-bold flex items-center justify-between">
            <span>⚠️ {errorNotice}</span>
            <button onClick={() => setErrorNotice(null)} className="text-red-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 2-Column Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          {/* Left Column: Spin Controls & Live State */}
          <div className="space-y-4">
            {/* Visibility Toggle Box */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm block">Mostrar Ruleta en la Página Principal</span>
                <span className="text-xs text-neutral-400">
                  {rouletteState?.isActive
                    ? '🟢 Visible ahora para todos los visitantes en tiempo real.'
                    : '⚪ Oculta en la web (solo visible desde este panel).'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleActive}
                disabled={isLoading}
                className={`px-4 py-2 rounded-xl font-bebas text-base uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                  rouletteState?.isActive
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                }`}
              >
                {rouletteState?.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>{rouletteState?.isActive ? 'Activada' : 'Activar'}</span>
              </button>
            </div>

            {/* Current Draw Status Card */}
            <div className="p-5 rounded-2xl bg-neutral-950 border-2 border-lime-400/50 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-lime-400">
                  Próximo Sorteo a Girar:
                </span>
                <span className="px-3 py-1 rounded-full bg-lime-400/20 text-lime-300 font-mono font-bold text-xs">
                  Sorteo #{Math.min(winnersCount + 1, 22)} de 22
                </span>
              </div>

              {/* Prize Name Input */}
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">
                  Nombre del Premio / Descripción *
                </label>
                <input
                  type="text"
                  value={customPrizeInput}
                  onChange={(e) => setCustomPrizeInput(e.target.value)}
                  placeholder={`Ej: Sorteo #${winnersCount + 1}: Zapatillas Nike / Pack Suplementos`}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white text-sm font-bold focus:outline-none focus:border-lime-400"
                />
              </div>

              {/* GIANT SPIN BUTTON */}
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinningLocal || rouletteState?.isSpinning || isAllDrawn}
                className={`w-full py-4 rounded-2xl font-bebas text-2xl sm:text-3xl uppercase tracking-widest transition flex items-center justify-center gap-3 cursor-pointer shadow-xl ${
                  isAllDrawn
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : isSpinningLocal || rouletteState?.isSpinning
                    ? 'bg-purple-600 text-white animate-pulse'
                    : 'bg-gradient-to-r from-lime-400 via-lime-300 to-lime-400 hover:scale-[1.02] text-black shadow-lime-400/30'
                }`}
              >
                {isSpinningLocal || rouletteState?.isSpinning ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin text-white" />
                    <span>¡GIRANDO EN VIVO! (6s)...</span>
                  </>
                ) : isAllDrawn ? (
                  <span>¡22 SORTEOS COMPLETADOS!</span>
                ) : (
                  <>
                    <Play className="w-6 h-6 fill-current text-black" />
                    <span>¡GIRAR RULETA AHORA! 🎡</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-neutral-400">
                Al hacer clic, <strong>todos los usuarios con la web abierta</strong> verán la ruleta girar al mismo tiempo durante 6 segundos.
              </p>
            </div>

            {/* Last Winner Quick Card */}
            {rouletteState?.lastWinner && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-neutral-950 to-emerald-950 border border-emerald-500/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
                  Último Ganador: Sorteo #{rouletteState.lastWinner.drawNumber}
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bebas text-3xl text-lime-400 font-mono leading-none">
                      Ticket #{String(rouletteState.lastWinner.ticketNumber).padStart(3, '0')}
                    </div>
                    <div className="text-white font-bold text-sm mt-0.5">
                      {rouletteState.lastWinner.runnerName}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {rouletteState.lastWinner.prizeName}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-400/20 text-emerald-400 flex items-center justify-center font-black text-xl">
                    🏆
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: History of the 22 Winners */}
          <div className="flex flex-col bg-neutral-950 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h4 className="font-bebas text-xl text-white uppercase tracking-wide">
                  Historial de Sorteos ({winnersCount} de 22)
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Registro oficial de los tickets y premios entregados en la meta.
                </p>
              </div>

              {winnersCount > 0 && (
                <div>
                  {confirmResetOpen ? (
                    <div className="flex items-center gap-1.5 bg-red-950 p-1.5 rounded-lg border border-red-500/50">
                      <span className="text-[10px] text-red-200">¿Reset 0?</span>
                      <button
                        type="button"
                        onClick={handleResetAll}
                        className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold"
                      >
                        Sí
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmResetOpen(false)}
                        className="px-1.5 py-0.5 bg-neutral-800 text-neutral-300 rounded text-[10px]"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmResetOpen(true)}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-300 font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Reiniciar todos los sorteos a 0"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reiniciar</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto max-h-[420px] space-y-2 pr-1">
              {!rouletteState?.winners || rouletteState.winners.length === 0 ? (
                <div className="py-16 text-center text-neutral-500 text-xs">
                  Aún no se ha realizado ningún sorteo. Haz clic en "¡Girar Ruleta Ahora!" para comenzar el primer sorteo.
                </div>
              ) : (
                rouletteState.winners.map((winner) => (
                  <div
                    key={winner.drawNumber}
                    className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-lime-400/40 transition flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-lime-400/20 text-lime-400 font-mono font-black text-xs">
                          Ticket #{String(winner.ticketNumber).padStart(3, '0')}
                        </span>
                        <span className="font-bold text-white text-sm">
                          {winner.runnerName || 'Participante'}
                        </span>
                      </div>
                      <div className="text-neutral-400 text-xs">
                        Premio: <strong className="text-amber-300">{winner.prizeName}</strong>
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        Sorteo #{winner.drawNumber} • {new Date(winner.wonAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {confirmRemoveDraw === winner.drawNumber ? (
                      <div className="flex items-center gap-1 bg-red-950 p-1.5 rounded-lg border border-red-500/50">
                        <span className="text-[10px] text-red-200">¿Anular?</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveWinner(winner.drawNumber)}
                          className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold"
                        >
                          Sí
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmRemoveDraw(null)}
                          className="px-1.5 py-0.5 bg-neutral-800 text-neutral-300 rounded text-[10px]"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmRemoveDraw(winner.drawNumber)}
                        className="p-2 rounded-lg bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-400 transition cursor-pointer"
                        title="Anular este sorteo y volver a sortear"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between text-xs text-neutral-400">
          <span>
            Tickets totales: <strong className="text-white font-mono">266</strong> • Ganadores únicos garantizados (sin repetición)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition cursor-pointer"
          >
            Cerrar Panel de Sorteos
          </button>
        </div>
      </div>
    </div>
  );
};
