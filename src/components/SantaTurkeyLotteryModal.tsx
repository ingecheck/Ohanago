import React, { useState, useEffect } from 'react';
import { X, Gift, Trophy, Sparkles, RefreshCw, CheckCircle2, Volume2, Crown } from 'lucide-react';
import { RunnerRegistration } from '../types/race';
import confetti from 'canvas-confetti';

interface SantaTurkeyLotteryModalProps {
  runners: RunnerRegistration[];
  onClose: () => void;
}

export const SantaTurkeyLotteryModal: React.FC<SantaTurkeyLotteryModalProps> = ({
  runners,
  onClose,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentDisplayRunner, setCurrentDisplayRunner] = useState<RunnerRegistration | null>(null);
  const [winner, setWinner] = useState<RunnerRegistration | null>(null);
  const [winnerList, setWinnerList] = useState<{ runner: RunnerRegistration; wonAt: string }[]>(() => {
    try {
      const saved = localStorage.getItem('ohana_santa_turkey_winners');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Eligible pool: prefer Santa Run runners or all registered
  const eligiblePool = runners.filter((r) => {
    // Exclude existing winners
    return !winnerList.some((w) => w.runner.id === r.id);
  });

  const handleStartDraw = () => {
    if (eligiblePool.length === 0) return;
    setIsSpinning(true);
    setWinner(null);

    let counter = 0;
    const maxSteps = 35;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * eligiblePool.length);
      setCurrentDisplayRunner(eligiblePool[randomIndex]);
      counter++;

      if (counter >= maxSteps) {
        clearInterval(interval);
        // Select official winner
        const officialWinner = eligiblePool[Math.floor(Math.random() * eligiblePool.length)];
        setCurrentDisplayRunner(officialWinner);
        setWinner(officialWinner);
        setIsSpinning(false);

        const newRecord = {
          runner: officialWinner,
          wonAt: new Date().toLocaleTimeString(),
        };

        const updatedWinners = [newRecord, ...winnerList];
        setWinnerList(updatedWinners);
        try {
          localStorage.setItem('ohana_santa_turkey_winners', JSON.stringify(updatedWinners));
        } catch (e) {}

        try {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#dc2626', '#ffffff', '#fbbf24', '#16a34a'],
          });
        } catch (e) {}
      }
    }, 85);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-950 border-2 border-red-600/70 rounded-3xl p-5 sm:p-8 shadow-2xl text-center">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="text-left">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold block mb-1">
              OHANA GO & MASTER ULALA · SANTA RUN 2026
            </span>
            <h3 className="font-bebas text-3xl sm:text-4xl text-white uppercase tracking-wide leading-none">
              Gran Sorteo del <span className="text-red-500 text-glow-red">Pavo Navideño</span> 🦃
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Participan todos los inscritos confirmados ({eligiblePool.length} atletas en tómbola)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Stage: Digital Lottery Drum */}
        <div className="my-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-red-950/40 via-black to-neutral-950 border-2 border-red-600/50 shadow-[0_0_50px_rgba(220,38,38,0.2)] relative overflow-hidden">
          
          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-600 text-white flex items-center justify-center text-4xl mb-4 shadow-xl shadow-red-600/40">
            🦃
          </div>

          {currentDisplayRunner ? (
            <div className="space-y-2">
              <span className={`text-xs font-mono uppercase tracking-widest font-bold block ${
                winner ? 'text-amber-400 animate-bounce' : 'text-neutral-400'
              }`}>
                {winner ? '🎉 ¡GANADOR OFICIAL DEL PAVO NAVIDEÑO! 🎉' : 'SORTEANDO PARTICIPANTE...'}
              </span>

              <div className="font-bebas text-4xl sm:text-5xl text-white uppercase tracking-wide leading-tight">
                {currentDisplayRunner.firstName} {currentDisplayRunner.lastName}
              </div>

              <div className="flex items-center justify-center gap-3 text-xs font-mono text-neutral-300">
                <span>DNI: {currentDisplayRunner.documentNumber}</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">
                  {currentDisplayRunner.turkeyRaffleTicket || `PAVO-${currentDisplayRunner.id}`}
                </span>
              </div>

              {winner && (
                <div className="mt-4 p-3 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs font-bold inline-block">
                  ✓ Premio listo para entrega en la Concha Acústica de Tarapoto
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">
                Presiona el botón para iniciar la tómbola digital
              </span>
              <p className="font-bebas text-3xl text-neutral-200 uppercase">
                ¿Quién se llevará el pavo navideño hoy?
              </p>
            </div>
          )}

          {/* Action Draw Button */}
          <div className="mt-6">
            <button
              onClick={handleStartDraw}
              disabled={isSpinning || eligiblePool.length === 0}
              className={`px-8 py-4 rounded-2xl font-bebas text-2xl uppercase tracking-wider font-black transition-all transform shadow-xl cursor-pointer ${
                isSpinning
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-500 text-white hover:scale-105 active:scale-95 shadow-red-600/30'
              }`}
            >
              {isSpinning ? 'Girando Tómbola...' : winner ? 'Sortear Otro Pavo / Premio' : '¡Girar Sorteo del Pavo!'}
            </button>
          </div>

        </div>

        {/* Winners History */}
        {winnerList.length > 0 && (
          <div className="text-left mt-6 pt-4 border-t border-neutral-800">
            <h4 className="font-bebas text-lg text-white uppercase tracking-wider flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Ganadores Registrados del Sorteo</span>
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {winnerList.map((w, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-400 font-bold">#{idx + 1}</span>
                    <strong className="text-white">
                      {w.runner.firstName} {w.runner.lastName}
                    </strong>
                    <span className="text-neutral-500 font-mono">({w.runner.documentNumber})</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">{w.wonAt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
