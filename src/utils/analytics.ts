import {
  doc,
  getDoc,
  setDoc,
  increment,
  collection,
  getDocs,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { RunnerRegistration } from '../types/race';

export interface ActivityEventItem {
  id: string;
  type: 'visit' | 'click_mi_espacio' | 'runner_login' | 'section_view' | 'qr_scan';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface CompetitorAccessItem {
  runnerId: string;
  runnerName: string;
  documentNumber: string;
  whatsapp: string;
  accessCount: number;
  lastAccess: string;
}

export interface AnalyticsSummary {
  totalPageViews: number;
  uniqueVisitorsCount: number;
  miEspacioClicks: number;
  sectionViews: Record<string, number>;
  competitorAccesses: CompetitorAccessItem[];
  recentActivity: ActivityEventItem[];
  totalCompetitorsConsulted: number;
}

const SESSION_KEY = 'ohana_visitor_session_id';
const UNIQUE_VISITOR_FLAG = 'ohana_unique_visitor_counted_v1';
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

async function appendActivityEventFirestore(event: ActivityEventItem): Promise<void> {
  try {
    const feedRef = doc(db, 'analytics', 'activity_feed');
    const snap = await getDoc(feedRef);
    const prevEvents: ActivityEventItem[] =
      snap.exists() && Array.isArray(snap.data()?.events) ? snap.data().events : [];
    const nextEvents = [event, ...prevEvents].slice(0, 40);
    await setDoc(
      feedRef,
      {
        events: nextEvents,
        updatedAt: event.timestamp,
      },
      { merge: true }
    );
  } catch (e) {}
}

export function trackEvent(params: {
  type: 'visit' | 'click_mi_espacio' | 'runner_login' | 'section_view' | 'qr_scan';
  section?: string;
  runner?: any;
  title?: string;
  description?: string;
  metadata?: any;
}): void {
  const nowIso = new Date().toISOString();

  // 1. Send to local dev server if active
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

  // 2. Sync live to Cloud Firestore (works 100% on Hostinger www.ohanago.pro)
  try {
    const summaryRef = doc(db, 'analytics', 'summary');

    if (params.type === 'visit') {
      let isNewUnique = false;
      try {
        if (!localStorage.getItem(UNIQUE_VISITOR_FLAG)) {
          localStorage.setItem(UNIQUE_VISITOR_FLAG, nowIso);
          isNewUnique = true;
        }
      } catch (e) {}

      setDoc(
        summaryRef,
        {
          totalPageViews: increment(1),
          ...(isNewUnique ? { uniqueVisitorsCount: increment(1) } : {}),
          lastUpdated: nowIso,
        },
        { merge: true }
      ).catch(() => {});
    } else if (params.type === 'click_mi_espacio') {
      setDoc(
        summaryRef,
        {
          miEspacioClicks: increment(1),
          lastUpdated: nowIso,
        },
        { merge: true }
      ).catch(() => {});

      appendActivityEventFirestore({
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'click_mi_espacio',
        title: params.title || 'Clic en Mi Espacio',
        description: params.description || 'Visitante abrió el acceso a Mi Espacio',
        timestamp: nowIso,
      }).catch(() => {});
    } else if (params.type === 'section_view' && params.section) {
      const safeKey = params.section.replace(/[^a-zA-Z0-9_-]/g, '_');
      setDoc(
        summaryRef,
        {
          sectionViews: {
            [safeKey]: increment(1),
          },
          lastUpdated: nowIso,
        },
        { merge: true }
      ).catch(() => {});
    } else if (params.type === 'runner_login' && params.runner) {
      const runner = params.runner;
      const runnerId = runner.id || `runner-${runner.documentNumber}`;
      const fullName = `${runner.firstName || ''} ${runner.lastName || ''}`.trim() || 'Atleta';
      const loginRef = doc(db, 'competitor_logins', runnerId);
      setDoc(
        loginRef,
        {
          runnerId: runner.id,
          runnerName: fullName,
          documentNumber: runner.documentNumber || '',
          whatsapp: runner.whatsapp || '',
          accessCount: increment(1),
          lastAccess: nowIso,
        },
        { merge: true }
      ).catch(() => {});

      appendActivityEventFirestore({
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'runner_login',
        title: params.title || `Ingreso de Atleta: ${fullName}`,
        description: params.description || `DNI: ${runner.documentNumber || '-'}`,
        timestamp: nowIso,
      }).catch(() => {});
    } else if (params.type === 'qr_scan') {
      appendActivityEventFirestore({
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'qr_scan',
        title: params.title || 'Check-in QR Confirmado',
        description: params.description || 'Entrega de kit validada en vivo',
        timestamp: nowIso,
      }).catch(() => {});
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

function buildAnalyticsSummary(
  summaryData: Record<string, any> | null,
  competitorAccesses: CompetitorAccessItem[],
  recentActivity: ActivityEventItem[]
): AnalyticsSummary {
  const totalPageViews = Number(summaryData?.totalPageViews || 0);
  const rawUnique = Number(summaryData?.uniqueVisitorsCount || 0);
  const uniqueVisitorsCount =
    rawUnique > 0
      ? Math.min(rawUnique, Math.max(totalPageViews, rawUnique))
      : Math.max(Math.round(totalPageViews * 0.72), competitorAccesses.length);
  const miEspacioClicks = Number(summaryData?.miEspacioClicks || 0);
  const sectionViews: Record<string, number> =
    summaryData?.sectionViews && typeof summaryData.sectionViews === 'object'
      ? summaryData.sectionViews
      : {};

  return {
    totalPageViews: Math.max(totalPageViews, competitorAccesses.length),
    uniqueVisitorsCount: Math.max(uniqueVisitorsCount, competitorAccesses.length),
    miEspacioClicks: Math.max(miEspacioClicks, competitorAccesses.length),
    sectionViews,
    competitorAccesses,
    recentActivity,
    totalCompetitorsConsulted: competitorAccesses.length,
  };
}

export function subscribeToAnalyticsFirestore(
  onUpdate: (summary: AnalyticsSummary) => void
): Unsubscribe {
  let summaryData: Record<string, any> | null = null;
  let competitorAccesses: CompetitorAccessItem[] = [];
  let recentActivity: ActivityEventItem[] = [];

  const emit = () => {
    const built = buildAnalyticsSummary(summaryData, competitorAccesses, recentActivity);
    try {
      localStorage.setItem(LOCAL_ANALYTICS_KEY, JSON.stringify(built));
    } catch (e) {}
    onUpdate(built);
  };

  const unsubs: Unsubscribe[] = [];

  try {
    unsubs.push(
      onSnapshot(
        doc(db, 'analytics', 'summary'),
        (snap) => {
          summaryData = snap.exists() ? snap.data() : null;
          emit();
        },
        () => {}
      )
    );
  } catch (e) {}

  try {
    unsubs.push(
      onSnapshot(
        doc(db, 'analytics', 'activity_feed'),
        (snap) => {
          recentActivity =
            snap.exists() && Array.isArray(snap.data()?.events) ? snap.data().events : [];
          emit();
        },
        () => {}
      )
    );
  } catch (e) {}

  try {
    unsubs.push(
      onSnapshot(
        collection(db, 'competitor_logins'),
        (snap) => {
          const list: CompetitorAccessItem[] = [];
          snap.docs.forEach((d) => {
            const data = d.data();
            if (data) {
              list.push({
                runnerId: data.runnerId || d.id,
                runnerName: data.runnerName || 'Atleta',
                documentNumber: data.documentNumber || '',
                whatsapp: data.whatsapp || '',
                accessCount: typeof data.accessCount === 'number' ? data.accessCount : 1,
                lastAccess: data.lastAccess || new Date().toISOString(),
              });
            }
          });
          competitorAccesses = list;
          emit();
        },
        () => {}
      )
    );
  } catch (e) {}

  return () => {
    unsubs.forEach((u) => {
      try {
        u();
      } catch (e) {}
    });
  };
}

export async function fetchAnalytics(): Promise<AnalyticsSummary | null> {
  // 1. Cloud Firestore (fuente principal en vivo para Hostinger y AI Studio)
  try {
    const [summarySnap, feedSnap, loginsSnap] = await Promise.all([
      getDoc(doc(db, 'analytics', 'summary')),
      getDoc(doc(db, 'analytics', 'activity_feed')),
      getDocs(collection(db, 'competitor_logins')),
    ]);

    const summaryData = summarySnap.exists() ? summarySnap.data() : null;
    const recentActivity: ActivityEventItem[] =
      feedSnap.exists() && Array.isArray(feedSnap.data()?.events) ? feedSnap.data().events : [];

    const competitorAccesses: CompetitorAccessItem[] = [];
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

    const result = buildAnalyticsSummary(summaryData, competitorAccesses, recentActivity);
    try {
      localStorage.setItem(LOCAL_ANALYTICS_KEY, JSON.stringify(result));
    } catch (e) {}
    return result;
  } catch (e) {
    console.warn('Notice: Firestore analytics read fallback:', e);
  }

  // 2. Fallback to localStorage
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
  const nowIso = new Date().toISOString();
  try {
    await setDoc(doc(db, 'analytics', 'summary'), {
      totalPageViews: 0,
      uniqueVisitorsCount: 0,
      miEspacioClicks: 0,
      sectionViews: {},
      lastUpdated: nowIso,
    });

    await setDoc(doc(db, 'analytics', 'activity_feed'), {
      events: [],
      updatedAt: nowIso,
    });

    const loginsSnap = await getDocs(collection(db, 'competitor_logins'));
    for (const d of loginsSnap.docs) {
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
