import { RunnerRegistration } from '../types/race';
import { getStoredRegistrations, saveRegistrations } from '../data/initialRegistrations';
import { doc, setDoc, collection, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';

const CHECKIN_CHANNEL_NAME = 'ohana_checkin_channel';

export function cleanFirestoreData<T>(data: T): T {
  if (data === null || data === undefined) return null as any;
  if (Array.isArray(data)) return data.map(cleanFirestoreData).filter((v) => v !== undefined) as any;
  if (typeof data === 'object') {
    const res: any = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) {
        res[k] = cleanFirestoreData(v);
      }
    }
    return res;
  }
  return data;
}

export function broadcastCheckinLocal(runner: RunnerRegistration) {
  try {
    const currentList = getStoredRegistrations();
    const updated = currentList.map((r) => (r.id === runner.id ? runner : r));
    saveRegistrations(updated);
  } catch (e) {}

  try {
    const channel = new BroadcastChannel(CHECKIN_CHANNEL_NAME);
    channel.postMessage({ type: 'checkin', runner, timestamp: Date.now() });
    channel.close();
  } catch (e) {}

  try {
    window.dispatchEvent(new CustomEvent('ohana-checkin', { detail: runner }));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {}

  // Sync to Cloud Firestore (sanitizing undefined fields)
  try {
    const cleaned = cleanFirestoreData(runner);
    setDoc(doc(db, 'registrations', runner.id), cleaned, { merge: true })
      .then(() => console.log(`[Firestore] Registered check-in for ${runner.firstName} ${runner.lastName} (${runner.id})`))
      .catch((err) => console.error('Firestore checkin write error:', err));
  } catch (e) {
    console.error('Firestore checkin dispatch error:', e);
  }
}

export function subscribeToRegistrationsFirestore(callback: (runner: RunnerRegistration) => void): Unsubscribe {
  try {
    return onSnapshot(
      collection(db, 'registrations'),
      (snapshot) => {
        snapshot.docs.forEach((docSnap) => {
          const runner = docSnap.data() as RunnerRegistration;
          if (runner && runner.id) {
            callback(runner);
          }
        });
      },
      (err) => {
        console.warn('Notice: Firestore registrations fallback:', err);
      }
    );
  } catch (e) {
    return () => {};
  }
}

export async function processStartCheckinSafe(params: {
  runnerId?: string;
  dni?: string;
  code?: string;
  token?: string;
}): Promise<{ success: boolean; runner?: RunnerRegistration; error?: string }> {
  // 1. Try server endpoint first
  try {
    const res = await fetch('/api/start-checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.runner) {
        broadcastCheckinLocal(data.runner);
        return { success: true, runner: data.runner };
      }
    }
  } catch (e) {
    console.warn('Backend check-in endpoint unavailable, executing client-side check-in fallback for Hostinger:', e);
  }

  // 2. Client-Side Fallback for Hostinger or Offline
  const registrations = getStoredRegistrations();
  const searchInput = (params.code || params.runnerId || params.dni || '').trim();

  // Normalize search input (in case full URL was passed)
  let cleanInput = searchInput;
  if (searchInput.includes('runner=') || searchInput.includes('dni=')) {
    const matchDni = searchInput.match(/dni=([0-9]+)/i);
    const matchRunner = searchInput.match(/runner=([A-Za-z0-9-]+)/i);
    if (matchDni) cleanInput = matchDni[1];
    else if (matchRunner) cleanInput = matchRunner[1];
  }

  const query = cleanInput.toLowerCase();
  const foundIndex = registrations.findIndex((r) => {
    if (!query) return false;
    if (r.id.toLowerCase() === query) return true;
    if (r.documentNumber.toLowerCase() === query) return true;
    if (r.documentNumber.replace(/\D/g, '') === query.replace(/\D/g, '') && query.length >= 7) return true;
    if (String(r.bibNumber) === query || String(r.registrationNumber) === query) return true;
    if (r.whatsapp.replace(/\D/g, '') === query.replace(/\D/g, '') && query.length >= 8) return true;
    const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
    if (fullName.includes(query) && query.length > 5) return true;
    return false;
  });

  if (foundIndex === -1) {
    return {
      success: false,
      error: 'Competidor no encontrado. Verifica que el DNI o código coincida con la inscripción oficial.',
    };
  }

  const updatedRunner: RunnerRegistration = {
    ...registrations[foundIndex],
    confirmedAtStart: true,
    startCheckinTime: new Date().toISOString(),
  };

  registrations[foundIndex] = updatedRunner;
  saveRegistrations(registrations);
  broadcastCheckinLocal(updatedRunner);

  return { success: true, runner: updatedRunner };
}
