// Utility for tracking user interactions, page views, and "Mi Espacio" visits
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
  } catch (e) {
    // Fail-safe silently
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

export function trackSectionView(sectionKey: string, sectionTitle: string): void {
  trackEvent({
    type: 'section_view',
    section: sectionKey,
    title: `Sección vista: ${sectionTitle}`,
    description: `Usuario visualizó la sección ${sectionTitle}`,
  });
}

export async function fetchAnalytics(): Promise<AnalyticsSummary | null> {
  try {
    const res = await fetch('/api/analytics');
    if (!res.ok) throw new Error('Error al obtener métricas');
    return await res.json();
  } catch (e) {
    console.error('Error fetching analytics:', e);
    return null;
  }
}
