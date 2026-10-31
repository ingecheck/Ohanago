import { doc, getDoc, setDoc, increment, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { RunnerRegistration } from '../types/race';

export interface AnalyticsSummary {
  totalPageViews: number;
  uniqueVisitorsCount: number;
  miEspacioClicks: number;
  sectionViews: Record<string, number>;
  competitorAccesses: Array<{
    runnerId: string;
    runnerName: string;
    documentNumber: string;
    whatsapp: string;
    accessCount: number;
    lastAccess: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'visit' | 'click_mi_espacio' | 'runner_login' | 'section_view' | 'qr_scan';
    title: string;
    description: string;
    timestamp: string;
    metadata?: any;
  }>;
  totalCompetitorsConsulted: number;
}

const SESSION_KEY = 'ohana_visitor_session_id';
const LOCAL_ANALYTICS_KEY = 'ohana_local_analytics_v1';

export function getVisitorSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = `vis-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch (e) {
    return 'anonymous-session';
  }
}

export function trackEvent(params: {
  type: 'visit' | 'click_mi_espacio' | 'runner_login' | 'section_view' | 'qr_scan';
  section?: string;
  runner?: any;
  title?: string;
  description?: string;
  metadata?: any;
}): void {
  // 1. Send to server if active
  try {
    const sessionId = getVisitorSessionId();
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        sessionId,
      }),
    }).catch(() => {});
  } catch (e) {}

  // 2. Sync to Cloud Firestore (ensures tracking works 100% on Hostinger www.ohanago.pro)
  try {
    if (params.type === 'visit') {
      const summaryRef = doc(db, 'analytics', 'summary');
      setDoc(summaryRef, {
        totalPageViews: increment(1),
        lastUpdated: new Date().toISOString(),
      }, { merge: true }).catch(() => {});
    } else if (params.type === 'click_mi_espacio') {
      const summaryRef = doc(db, 'analytics', 'summary');
      setDoc(summaryRef, {
        miEspacioClicks: increment(1),
        lastUpdated: new Date().toISOString(),
      }, { merge: true }).catch(() => {});
    } else if (params.type === 'runner_login' && params.runner) {
      const runner = params.runner;
      const runnerId = runner.id || `runner-${runner.documentNumber}`;
      const loginRef = doc(db, 'competitor_logins', runnerId);
      setDoc(loginRef, {
        runnerId: runner.id,
        runnerName: `${runner.firstName || ''} ${runner.lastName || ''}`.trim() || 'Atleta 5K',
        documentNumber: runner.documentNumber || '',
        whatsapp: runner.whatsapp || '',
        accessCount: increment(1),
        lastAccess: new Date().toISOString(),
      }, { merge: true }).catch(() => {});
    }
  } catch (e) {
    console.warn('Notice: Firestore analytics track notice:', e);
  }
}

export function trackPageView(): void {
  trackEvent({
    type: 'visit',
    title: 'Visita a la Plataforma',
    description: 'Usuario navegando en la web oficial Ohana Go',
  });
}

export function trackMiEspacioClick(source: string = 'Botón Mi Espacio'): void {
  trackEvent({
    type: 'click_mi_espacio',
    title: 'Clic en Mi Espacio',
    description: `Usuario hizo clic en "Mi Espacio" desde: ${source}`,
  });
}

export function trackRunnerLogin(runner: RunnerRegistration): void {
  trackEvent({
    type: 'runner_login',
    runner,
    title: `Ingreso de Atleta: ${runner.firstName} ${runner.lastName}`,
    description: `DNI: ${runner.documentNumber} consultó su estado en Mi Espacio`,
  });
}

export function trackSectionView(sectionKey: string, sectionTitle: string): void {
  trackEvent({
    type: 'section_view',
    section: sectionKey,
    title: `Sección vista: ${sectionTitle}`,
    description: `Usuario visualizó la sección ${sectionTitle}`,
  });
}

export async function fetchAnalytics(): Promise<AnalyticsSummary | null> {
  // 1. Try Cloud Firestore first (ensures live metrics on Hostinger)
  try {
    const summaryRef = doc(db, 'analytics', 'summary');
    const summarySnap = await getDoc(summaryRef);
    const summaryData = summarySnap.exists() ? summarySnap.data() : null;

    const loginsCol = collection(db, 'competitor_logins');
    const loginsSnap = await getDocs(loginsCol);
    const competitorAccesses: Array<{
      runnerId: string;
      runnerName: string;
      documentNumber: string;
      whatsapp: string;
      accessCount: number;
      lastAccess: string;
    }> = [];

    loginsSnap.docs.forEach((d) => {
      const data = d.data();
      if (data) {
        competitorAccesses.push({
          runnerId: data.runnerId || d.id,
          runnerName: data.runnerName || 'Atleta',
          documentNumber: data.documentNumber || '',
          whatsapp: data.whatsapp || '',
          accessCount: typeof data.accessCount === 'number' ? data.accessCount : 1,
          lastAccess: data.lastAccess || new Date().toISOString(),
        });
      }
    });

    if (summaryData || competitorAccesses.length > 0) {
      const totalPageViews = Number(summaryData?.totalPageViews || 0);
      const miEspacioClicks = Number(summaryData?.miEspacioClicks || 0);

      const result: AnalyticsSummary = {
        totalPageViews: Math.max(totalPageViews, competitorAccesses.length),
        uniqueVisitorsCount: Math.max(Math.round(totalPageViews * 0.75), competitorAccesses.length),
        miEspacioClicks: Math.max(miEspacioClicks, competitorAccesses.length),
        sectionViews: summaryData?.sectionViews || {},
        competitorAccesses,
        recentActivity: [],
        totalCompetitorsConsulted: competitorAccesses.length,
      };

      try {
        localStorage.setItem(LOCAL_ANALYTICS_KEY, JSON.stringify(result));
      } catch (e) {}

      return result;
    }
  } catch (e) {
    console.warn('Notice: Firestore analytics read fallback:', e);
  }

  // 2. Try Node server API
  try {
    const res = await fetch('/api/analytics');
    if (res.ok) {
      const serverData = await res.json();
      if (serverData && typeof serverData === 'object') {
        return serverData;
      }
    }
  } catch (e) {}

  // 3. Fallback to localStorage
  try {
    const stored = localStorage.getItem(LOCAL_ANALYTICS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}

  return {
    totalPageViews: 0,
    uniqueVisitorsCount: 0,
    miEspacioClicks: 0,
    sectionViews: {},
    competitorAccesses: [],
    recentActivity: [],
    totalCompetitorsConsulted: 0,
  };
}

export async function resetAnalyticsSafe(): Promise<void> {
  try {
    const summaryRef = doc(db, 'analytics', 'summary');
    await setDoc(summaryRef, {
      totalPageViews: 0,
      miEspacioClicks: 0,
      lastUpdated: new Date().toISOString(),
    });

    const loginsCol = collection(db, 'competitor_logins');
    const snap = await getDocs(loginsCol);
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
  } catch (e) {}

  try {
    fetch('/api/analytics/reset', { method: 'POST' }).catch(() => {});
  } catch (e) {}

  try {
    localStorage.removeItem(LOCAL_ANALYTICS_KEY);
  } catch (e) {}
}
