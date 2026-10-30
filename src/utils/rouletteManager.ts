import { RouletteState, RouletteWinner } from '../types/roulette';
import { RunnerRegistration } from '../types/race';

export const OFFICIAL_22_PRIZES = [
  'Premio #1: Kit Oficial Ohana Go 5K + Zapatillas Running',
  'Premio #2: Pack Nutricional + Pulseras Neón VIP',
  'Premio #3: Pack Suplementación Deportiva',
  'Premio #4: Smartwatch Deportivo 5K',
  'Premio #5: Auriculares Bluetooth Deportivos',
  'Premio #6: Mochila Hidratación 5K Tarapoto',
  'Premio #7: Pack Sorpresa Halloween Ohana',
  'Premio #8: Camiseta Conmemorativa Exclusiva',
  'Premio #9: Pack Deportivo + Botilito Térmico',
  'Premio #10: Vale de Consumo Entre Jarras S/ 100',
  'Premio #11: Kit de Entrenamiento Funcional',
  'Premio #12: Pack Gourmet + Hidratación',
  'Premio #13: Cortavientos Impermeable 5K',
  'Premio #14: Pack Nutrición Energética',
  'Premio #15: Vale de Consumo Especial Entre Jarras',
  'Premio #16: Lentes Deportivos UV400',
  'Premio #17: Gorra Conmemorativa Ohana 5K',
  'Premio #18: Pack Bienestar & Recuperación',
  'Premio #19: Cinturón Porta Celular + Luces Neón',
  'Premio #20: Pack Sorpresa de Auspiciadores',
  'Premio #21: Premio Especial Halloween Finisher',
  'Premio #22: Gran Premio Mayor: Trofeo Especial + Pack Ohana 5K',
];

const ROULETTE_STORAGE_KEY = 'ohana_roulette_state_v2';

export function getDefaultRouletteState(): RouletteState {
  return {
    isActive: true,
    totalTickets: 266,
    totalDraws: 22,
    currentDrawNumber: 1,
    currentPrizeName: OFFICIAL_22_PRIZES[0],
    isSpinning: false,
    spinStartTime: 0,
    spinDuration: 6000,
    targetTicket: 1,
    targetAngle: 0,
    winners: [],
    lastWinner: null,
  };
}

export function getStoredRouletteState(): RouletteState {
  try {
    const raw = localStorage.getItem(ROULETTE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...getDefaultRouletteState(),
          ...parsed,
          winners: Array.isArray(parsed.winners) ? parsed.winners : [],
        };
      }
    }
  } catch (e) {}
  return getDefaultRouletteState();
}

export function broadcastRouletteLocal(state: RouletteState, winner?: RouletteWinner | null) {
  try {
    localStorage.setItem(ROULETTE_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}

  try {
    const bc = new BroadcastChannel('ohana_roulette_channel');
    bc.postMessage({ roulette: state, winner });
    bc.close();
  } catch (e) {}

  try {
    window.dispatchEvent(new CustomEvent('ohana-roulette-spin', { detail: state }));
  } catch (e) {}
}

export async function fetchRouletteStateSafe(): Promise<RouletteState> {
  try {
    const res = await fetch('/api/roulette');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const serverData: RouletteState = await res.json();
      if (serverData && typeof serverData === 'object') {
        localStorage.setItem(ROULETTE_STORAGE_KEY, JSON.stringify(serverData));
        return serverData;
      }
    }
  } catch (e) {
    // Backend unreachable (Hostinger static / offline)
  }
  return getStoredRouletteState();
}

export async function spinRouletteSafe(
  prizeName: string,
  registrations: RunnerRegistration[]
): Promise<{ success: boolean; roulette: RouletteState; winner: RouletteWinner }> {
  // 1. Try server endpoint first
  try {
    const res = await fetch('/api/roulette/spin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prizeName }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.roulette && data.winner) {
        broadcastRouletteLocal(data.roulette, data.winner);
        return { success: true, roulette: data.roulette, winner: data.winner };
      }
    }
  } catch (e) {
    console.warn('Backend spin endpoint unavailable, executing client-side spin fallback for Hostinger:', e);
  }

  // 2. Client-Side Fallback for Hostinger or Offline: Guaranteed 100% success without errors
  const currentState = getStoredRouletteState();

  if (currentState.winners.length >= (currentState.totalDraws || 22)) {
    throw new Error('Ya se completaron los 22 sorteos programados.');
  }

  const wonTickets = new Set(currentState.winners.map((w) => w.ticketNumber));
  const availableTickets: number[] = [];
  for (let i = 1; i <= 266; i++) {
    if (!wonTickets.has(i)) {
      availableTickets.push(i);
    }
  }

  if (availableTickets.length === 0) {
    throw new Error('No quedan tickets disponibles para el sorteo.');
  }

  const randomIndex = Math.floor(Math.random() * availableTickets.length);
  const targetTicket = availableTickets[randomIndex];

  const matchingRunner =
    registrations.find(
      (r) => r.registrationNumber === targetTicket || r.bibNumber === targetTicket
    ) || (targetTicket <= registrations.length ? registrations[targetTicket - 1] : null);

  const drawNum = currentState.winners.length + 1;
  const actualPrize =
    prizeName.trim() ||
    currentState.currentPrizeName ||
    OFFICIAL_22_PRIZES[drawNum - 1] ||
    `Sorteo #${drawNum}: Premio Oficial 5K`;

  const newWinner: RouletteWinner = {
    drawNumber: drawNum,
    ticketNumber: targetTicket,
    prizeName: actualPrize,
    wonAt: new Date().toISOString(),
    runnerName: matchingRunner
      ? `${matchingRunner.firstName} ${matchingRunner.lastName}`
      : `Ticket Oficial #${String(targetTicket).padStart(3, '0')}`,
    runnerDni: matchingRunner ? matchingRunner.documentNumber : undefined,
  };

  // Exact sector rotation geometry so targetTicket lands under 12 o'clock pointer
  const currentRot = currentState.targetAngle || 0;
  const sectorAngle = (targetTicket - 1) * (360 / 266) + (180 / 266);
  const desiredMod = (360 - (sectorAngle % 360) + 360) % 360;
  const currentMod = ((currentRot % 360) + 360) % 360;
  let diff = desiredMod - currentMod;
  if (diff < 0) diff += 360;
  const fullSpins = (6 + Math.floor(Math.random() * 2)) * 360;
  const targetAngle = currentRot + fullSpins + diff;

  const nextDrawIdx = Math.min(drawNum, 21);
  const nextPrize = OFFICIAL_22_PRIZES[nextDrawIdx] || `Sorteo #${Math.min(drawNum + 1, 22)}: Premio Oficial 5K`;

  const newState: RouletteState = {
    ...currentState,
    isSpinning: true,
    spinStartTime: Date.now(),
    spinDuration: 6000,
    targetTicket,
    targetAngle,
    currentDrawNumber: Math.min(drawNum + 1, 22),
    currentPrizeName: nextPrize,
    lastWinner: newWinner,
    winners: [newWinner, ...currentState.winners],
  };

  broadcastRouletteLocal(newState, newWinner);
  return { success: true, roulette: newState, winner: newWinner };
}

export async function toggleRouletteSafe(isActive?: boolean): Promise<RouletteState> {
  const currentState = getStoredRouletteState();
  const nextActive = isActive !== undefined ? isActive : !currentState.isActive;

  try {
    const res = await fetch('/api/roulette/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: nextActive }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.roulette) {
        broadcastRouletteLocal(data.roulette);
        return data.roulette;
      }
    }
  } catch (e) {}

  const newState: RouletteState = { ...currentState, isActive: nextActive };
  broadcastRouletteLocal(newState);
  return newState;
}

export async function resetRouletteSafe(): Promise<RouletteState> {
  const defaultState = getDefaultRouletteState();

  try {
    const res = await fetch('/api/roulette/reset', { method: 'POST' });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.roulette) {
        broadcastRouletteLocal(data.roulette);
        return data.roulette;
      }
    }
  } catch (e) {}

  broadcastRouletteLocal(defaultState);
  return defaultState;
}

export async function removeWinnerSafe(drawNumber: number): Promise<RouletteState> {
  const currentState = getStoredRouletteState();
  const filteredWinners = currentState.winners.filter((w) => w.drawNumber !== drawNumber);
  const nextDrawNum = filteredWinners.length + 1;
  const nextPrize = OFFICIAL_22_PRIZES[Math.min(nextDrawNum - 1, 21)] || `Premio #${nextDrawNum}: Sorteo Oficial Ohana Go 5K`;

  const updatedState: RouletteState = {
    ...currentState,
    winners: filteredWinners,
    currentDrawNumber: nextDrawNum,
    currentPrizeName: nextPrize,
  };

  try {
    const res = await fetch('/api/roulette/remove-winner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawNumber }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.roulette) {
        broadcastRouletteLocal(data.roulette);
        return data.roulette;
      }
    }
  } catch (e) {}

  broadcastRouletteLocal(updatedState);
  return updatedState;
}
