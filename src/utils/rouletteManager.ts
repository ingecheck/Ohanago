import { RouletteState, RouletteWinner } from '../types/roulette';
import { RunnerRegistration } from '../types/race';
import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';

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
const FIRESTORE_ROULETTE_DOC = 'current';

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
        const state: RouletteState = {
          ...getDefaultRouletteState(),
          ...parsed,
          winners: Array.isArray(parsed.winners) ? parsed.winners : [],
        };
        // Auto-conclude spin if 6 seconds elapsed
        if (state.isSpinning && state.spinStartTime > 0 && Date.now() - state.spinStartTime >= 6000) {
          state.isSpinning = false;
          try {
            localStorage.setItem(ROULETTE_STORAGE_KEY, JSON.stringify(state));
          } catch (e) {}
        }
        return state;
      }
    }
  } catch (e) {}
  return getDefaultRouletteState();
}

function cleanObject<T>(data: T): T {
  if (data === null || data === undefined) return null as any;
  if (Array.isArray(data)) return data.map(cleanObject).filter((v) => v !== undefined) as any;
  if (typeof data === 'object') {
    const res: any = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) {
        res[k] = cleanObject(v);
      }
    }
    return res;
  }
  return data;
}

/**
 * Sync state to Firestore so all mobile phones in the world see the spin in real time
 */
export async function syncRouletteToFirestore(state: RouletteState) {
  try {
    const ref = doc(db, 'roulette', FIRESTORE_ROULETTE_DOC);
    const cleaned = cleanObject({
      ...state,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(ref, cleaned, { merge: true });
  } catch (e) {
    console.warn('Notice: Firestore sync fallback active:', e);
  }
}

/**
 * Real-time listener for Firestore roulette updates across all devices
 */
export function subscribeToRouletteFirestore(callback: (state: RouletteState) => void): Unsubscribe {
  try {
    const ref = doc(db, 'roulette', FIRESTORE_ROULETTE_DOC);
    return onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as RouletteState;
          if (data && typeof data === 'object') {
            const normalized: RouletteState = {
              ...getDefaultRouletteState(),
              ...data,
              winners: Array.isArray(data.winners) ? data.winners : [],
            };
            // Normalize spin finish
            if (
              normalized.isSpinning &&
              normalized.spinStartTime > 0 &&
              Date.now() - normalized.spinStartTime >= 6000
            ) {
              normalized.isSpinning = false;
            }
            try {
              localStorage.setItem(ROULETTE_STORAGE_KEY, JSON.stringify(normalized));
            } catch (e) {}
            callback(normalized);
          }
        }
      },
      (error) => {
        console.warn('Firestore subscription fallback:', error);
      }
    );
  } catch (e) {
    return () => {};
  }
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

  // Sync to Cloud Firestore
  syncRouletteToFirestore(state);
}

export async function fetchRouletteStateSafe(): Promise<RouletteState> {
  // 1. Return freshest state from local memory/storage (already continuously synced by onSnapshot)
  const localCached = getStoredRouletteState();
  if (localCached && localCached.winners && localCached.winners.length > 0) {
    return localCached;
  }

  // 2. Try Node server endpoint if running
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
  } catch (e) {}

  // 3. Fallback to local storage (0 Firestore reads)
  return getStoredRouletteState();
}

export async function spinRouletteSafe(
  prizeName: string,
  registrations: RunnerRegistration[]
): Promise<{ success: boolean; roulette: RouletteState; winner: RouletteWinner }> {
  // 1. Fetch freshest state from Firestore / Server / Local
  const currentState = await fetchRouletteStateSafe();

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

  // Broadcast to Cloud Firestore (so ALL users & phones see it spinning instantly) + local
  broadcastRouletteLocal(newState, newWinner);

  // Also notify backend server if running
  try {
    fetch('/api/roulette/spin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prizeName: actualPrize }),
    }).catch(() => {});
  } catch (e) {}

  // Guarantee stopping state broadcast precisely at 6000ms
  setTimeout(() => {
    try {
      const current = getStoredRouletteState();
      if (current.spinStartTime === newState.spinStartTime) {
        const finishedState: RouletteState = {
          ...current,
          isSpinning: false,
        };
        broadcastRouletteLocal(finishedState);
      }
    } catch (e) {}
  }, 6000);

  return { success: true, roulette: newState, winner: newWinner };
}

export async function toggleRouletteSafe(isActive?: boolean): Promise<RouletteState> {
  const currentState = getStoredRouletteState();
  const nextActive = isActive !== undefined ? isActive : !currentState.isActive;
  const newState: RouletteState = { ...currentState, isActive: nextActive };

  broadcastRouletteLocal(newState);

  try {
    fetch('/api/roulette/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: nextActive }),
    }).catch(() => {});
  } catch (e) {}

  return newState;
}

export async function resetRouletteSafe(): Promise<RouletteState> {
  const defaultState = getDefaultRouletteState();
  broadcastRouletteLocal(defaultState);

  try {
    fetch('/api/roulette/reset', { method: 'POST' }).catch(() => {});
  } catch (e) {}

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

  broadcastRouletteLocal(updatedState);

  try {
    fetch('/api/roulette/remove-winner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawNumber }),
    }).catch(() => {});
  } catch (e) {}

  return updatedState;
}
