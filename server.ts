import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Body parser with 50mb limit to handle medal photo uploads cleanly
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Always serve static files from public directory (e.g. /official-medal.png)
app.use(express.static(path.join(__dirname, 'public')));

// Persistent directory for shared data (medal photo, registrations)
const DATA_DIR = path.join(__dirname, 'data_storage');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const MEDAL_FILE = path.join(DATA_DIR, 'medal.json');
const REGISTRATIONS_FILE = path.join(DATA_DIR, 'registrations.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');
const ROULETTE_FILE = path.join(DATA_DIR, 'roulette.json');

export interface RouletteWinner {
  drawNumber: number;
  ticketNumber: number;
  prizeName: string;
  wonAt: string;
  runnerName?: string;
  runnerDni?: string;
}

export interface RouletteState {
  isActive: boolean;
  totalTickets: number;
  totalDraws: number;
  currentDrawNumber: number;
  currentPrizeName: string;
  isSpinning: boolean;
  spinStartTime: number;
  spinDuration: number;
  targetTicket: number;
  targetAngle: number;
  winners: RouletteWinner[];
  lastWinner: RouletteWinner | null;
}

function getInitialRoulette(): RouletteState {
  return {
    isActive: false,
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
  };
}

export interface CompetitorAccessRecord {
  runnerId: string;
  runnerName: string;
  documentNumber: string;
  whatsapp: string;
  accessCount: number;
  lastAccess: string;
}

export interface ActivityEvent {
  id: string;
  type: 'visit' | 'click_mi_espacio' | 'runner_login' | 'section_view' | 'qr_scan';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: string[];
  miEspacioClicks: number;
  sectionViews: Record<string, number>;
  competitorAccesses: CompetitorAccessRecord[];
  activityLog: ActivityEvent[];
}

function getInitialAnalytics(): AnalyticsData {
  return {
    pageViews: 0,
    uniqueVisitors: [],
    miEspacioClicks: 0,
    sectionViews: {
      'circuito_5k': 0,
      'kit_oficial': 0,
      'horarios': 0,
      'reglamento': 0,
      'faq': 0,
    },
    competitorAccesses: [],
    activityLog: [],
  };
}

function logAnalyticsEvent(event: {
  type: 'visit' | 'click_mi_espacio' | 'runner_login' | 'section_view' | 'qr_scan';
  sessionId?: string;
  section?: string;
  runner?: any;
  title?: string;
  description?: string;
  metadata?: any;
}) {
  try {
    const data = readJSON<AnalyticsData>(ANALYTICS_FILE, getInitialAnalytics());
    const now = new Date().toISOString();

    if (event.type === 'visit') {
      data.pageViews = (data.pageViews || 0) + 1;
      if (event.sessionId && !data.uniqueVisitors.includes(event.sessionId)) {
        data.uniqueVisitors.push(event.sessionId);
      }
    } else if (event.type === 'click_mi_espacio') {
      data.miEspacioClicks = (data.miEspacioClicks || 0) + 1;
    } else if (event.type === 'section_view') {
      const sec = event.section || 'general';
      data.sectionViews[sec] = (data.sectionViews[sec] || 0) + 1;
    } else if (event.type === 'runner_login' && event.runner) {
      const r = event.runner;
      const idx = data.competitorAccesses.findIndex(
        (c) => c.runnerId === r.id || c.documentNumber === r.documentNumber
      );
      if (idx >= 0) {
        data.competitorAccesses[idx].accessCount += 1;
        data.competitorAccesses[idx].lastAccess = now;
        data.competitorAccesses[idx].whatsapp = r.whatsapp || data.competitorAccesses[idx].whatsapp;
      } else {
        data.competitorAccesses.unshift({
          runnerId: r.id,
          runnerName: `${r.firstName} ${r.lastName}`.trim(),
          documentNumber: r.documentNumber,
          whatsapp: r.whatsapp || '',
          accessCount: 1,
          lastAccess: now,
        });
      }
    }

    // Append to activity log (keep last 150 events)
    const logItem: ActivityEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: event.type,
      title: event.title || event.type,
      description: event.description || '',
      timestamp: now,
      metadata: event.metadata,
    };
    data.activityLog = [logItem, ...(data.activityLog || [])].slice(0, 150);

    writeJSON(ANALYTICS_FILE, data);
  } catch (err) {
    console.error('Error logging analytics event:', err);
  }
}

function readJSON<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJSON<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

function savePublicMedalImage(image: string | null): void {
  if (!image) return;

  const publicDir = path.join(__dirname, 'public');
  const targetFile = path.join(publicDir, 'official-medal.png');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  if (typeof image === 'string' && image.startsWith('data:image')) {
    try {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(targetFile, buffer);

      // Also sync to dist if it exists for production
      const distDir = path.join(__dirname, 'dist');
      if (fs.existsSync(distDir)) {
        fs.writeFileSync(path.join(distDir, 'official-medal.png'), buffer);
      }
      console.log('[Medal] Successfully saved official-medal.png to public & dist');
    } catch (err) {
      console.error('Error writing official-medal.png:', err);
    }
  }
}

// Ensure medal state is synced on startup from public/official-medal.png
let initialMedal = readJSON<{ image: string | null; updatedAt?: string }>(MEDAL_FILE, { image: null });
if (!initialMedal.image) {
  const defaultPng = path.join(__dirname, 'public', 'official-medal.png');
  if (fs.existsSync(defaultPng)) {
    const b64 = 'data:image/png;base64,' + fs.readFileSync(defaultPng).toString('base64');
    initialMedal = { image: b64, updatedAt: new Date().toISOString() };
    writeJSON(MEDAL_FILE, initialMedal);
    console.log('[Medal] Initialized medal.json from public/official-medal.png');
  }
} else {
  savePublicMedalImage(initialMedal.image);
}

const MASTER_START_TOKEN = 'OHANA-START-LINE-TARAPOTO-2026';

// ================= API ROUTES =================

// 1. Medal Photo API: Shared across ALL users, devices and browsers
app.get('/api/medal', (req, res) => {
  const data = readJSON<{ image: string | null; updatedAt?: string }>(MEDAL_FILE, { image: null });
  if (!data.image) {
    const defaultPng = path.join(__dirname, 'public', 'official-medal.png');
    if (fs.existsSync(defaultPng)) {
      const b64 = 'data:image/png;base64,' + fs.readFileSync(defaultPng).toString('base64');
      data.image = b64;
      data.updatedAt = data.updatedAt || new Date().toISOString();
      writeJSON(MEDAL_FILE, data);
    }
  }
  res.json(data);
});

app.post('/api/medal', (req, res) => {
  const { image } = req.body;
  const data = {
    image: image || null,
    updatedAt: new Date().toISOString(),
  };
  writeJSON(MEDAL_FILE, data);
  savePublicMedalImage(image || null);
  res.json({ success: true, ...data });
});

// 2. Registrations API: Shared across runners and Admin Dashboard
app.get('/api/registrations', (req, res) => {
  const registrations = readJSON(REGISTRATIONS_FILE, null);
  res.json(registrations);
});

app.post('/api/registrations', (req, res) => {
  const current = readJSON<any[]>(REGISTRATIONS_FILE, []);
  const newRunner = req.body;
  const nextNum = current.length > 0
    ? Math.max(...current.map((r: any) => r.registrationNumber || r.bibNumber || 0)) + 1
    : 1;
  const newId = `OHA-2026-${String(nextNum).padStart(4, '0')}`;
  const record = {
    ...newRunner,
    id: newRunner.id || newId,
    registrationNumber: nextNum,
    bibNumber: nextNum,
    modality: newRunner.modality || 'Presencial',
    department: newRunner.department || 'San Martín',
    city: newRunner.city || 'Tarapoto',
    district: newRunner.district || 'Tarapoto',
    confirmedAtStart: false,
    createdAt: new Date().toISOString(),
  };
  const updated = [record, ...current];
  writeJSON(REGISTRATIONS_FILE, updated);
  res.json(record);
});

app.put('/api/registrations', (req, res) => {
  const { registrations } = req.body;
  if (Array.isArray(registrations)) {
    writeJSON(REGISTRATIONS_FILE, registrations);
    return res.json({ success: true, count: registrations.length });
  }
  res.status(400).json({ error: 'Expected array of registrations' });
});

// Helper function to find a runner by ANY identifier (DNI, ID with/without dash, URL, JSON, phone, or name)
function findRunner(query: any, registrations: any[]): { runner: any; index: number } | null {
  if (!query) return null;
  const raw = String(typeof query === 'object' ? JSON.stringify(query) : query).trim();
  if (!raw) return null;

  // Extract from URL if present
  let extractedDni = '';
  let extractedId = '';
  try {
    if (raw.includes('?') || raw.includes('/')) {
      const url = new URL(raw.startsWith('http') ? raw : `http://dummy.com/${raw}`);
      extractedDni = url.searchParams.get('dni') || '';
    }
  } catch (e) {}

  // Direct regex extraction for resilient matching from any scanned QR string
  const dniMatch = raw.match(/[?&]dni=([0-9]{7,10})/i) || raw.match(/dni[:=\s]+([0-9]{7,10})/i);
  if (dniMatch && dniMatch[1]) {
    extractedDni = dniMatch[1];
  }
  const runnerMatch = raw.match(/[?&]runner=(OHA-[0-9]{4}-[0-9]{4})/i) || raw.match(/(OHA-[0-9]{4}-[0-9]{4})/i);
  if (runnerMatch && runnerMatch[1]) {
    extractedId = runnerMatch[1];
  }

  // Extract from JSON if present
  let parsedJson: any = null;
  try {
    if (raw.startsWith('{') && raw.endsWith('}')) {
      parsedJson = JSON.parse(raw);
    }
  } catch (e) {}

  const normalize = (s: any) =>
    String(s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

  const digitsOnly = (s: any) => String(s || '').replace(/\D/g, '');

  const targetNorm = normalize(raw);
  const targetDigits = digitsOnly(raw);
  const jsonIdNorm = parsedJson?.id ? normalize(parsedJson.id) : '';
  const jsonDniDigits = parsedJson?.dni || parsedJson?.documentNumber ? digitsOnly(parsedJson.dni || parsedJson.documentNumber) : '';
  const extIdNorm = extractedId ? normalize(extractedId) : '';
  const extDniDigits = extractedDni ? digitsOnly(extractedDni) : '';

  const index = registrations.findIndex((r) => {
    const rIdNorm = normalize(r.id);
    const rDniDigits = digitsOnly(r.documentNumber);
    const rWspDigits = digitsOnly(r.whatsapp);
    const rFullNameNorm = normalize(`${r.firstName} ${r.lastName}`);

    // Match by runner ID (e.g., OHA-2026-0003 or oha20260003)
    if (targetNorm && rIdNorm === targetNorm) return true;
    if (extIdNorm && rIdNorm === extIdNorm) return true;
    if (jsonIdNorm && rIdNorm === jsonIdNorm) return true;

    // Match by DNI digits (e.g. 47605471)
    if (targetDigits && (rDniDigits === targetDigits || (targetDigits.length >= 7 && rDniDigits.endsWith(targetDigits)))) return true;
    if (extDniDigits && (rDniDigits === extDniDigits || rDniDigits.endsWith(extDniDigits))) return true;
    if (jsonDniDigits && (rDniDigits === jsonDniDigits || rDniDigits.endsWith(jsonDniDigits))) return true;

    // Match by WhatsApp phone
    if (targetDigits && targetDigits.length === 9 && rWspDigits === targetDigits) return true;

    // Match by Email
    const rEmailNorm = normalize(r.email);
    if (targetNorm && rEmailNorm && (rEmailNorm === targetNorm || (targetNorm.length >= 8 && rEmailNorm.includes(targetNorm)))) return true;

    // Match by Full Name
    if (targetNorm.length >= 6 && rFullNameNorm.includes(targetNorm)) return true;

    return false;
  });

  if (index === -1) return null;
  return { runner: registrations[index], index };
}

// Endpoint to update individual runner details (e.g. DNI correction by admin)
app.post('/api/runner/update', (req, res) => {
  const { runnerId, documentNumber, whatsapp, firstName, lastName } = req.body;
  if (!runnerId) return res.status(400).json({ error: 'Falta runnerId' });
  const registrations = readJSON<any[]>(REGISTRATIONS_FILE, []);
  const index = registrations.findIndex((r) => r.id === runnerId);
  if (index === -1) return res.status(404).json({ error: 'No se encontró el participante' });

  if (documentNumber !== undefined) registrations[index].documentNumber = String(documentNumber).trim();
  if (whatsapp !== undefined) registrations[index].whatsapp = String(whatsapp).trim();
  if (firstName !== undefined) registrations[index].firstName = String(firstName).trim();
  if (lastName !== undefined) registrations[index].lastName = String(lastName).trim();

  writeJSON(REGISTRATIONS_FILE, registrations);
  console.log(`[Admin Update] Updated runner ${registrations[index].id} (DNI: ${registrations[index].documentNumber}, Cel: ${registrations[index].whatsapp})`);
  res.json({ success: true, runner: registrations[index] });
});

// 3. Competitor Auth: Login strictly by DNI (or ID)
app.post('/api/competitor/login', (req, res) => {
  const { dni, query } = req.body;
  const rawInput = String(dni || query || '').trim();
  if (!rawInput) {
    return res.status(400).json({ error: 'Ingresa tu número de DNI.' });
  }

  const registrations = readJSON<any[]>(REGISTRATIONS_FILE, []);
  const match = findRunner(rawInput, registrations);

  if (!match) {
    logAnalyticsEvent({
      type: 'visit',
      title: 'Búsqueda DNI fallida',
      description: `Intento de acceso con DNI no registrado: ${rawInput}`,
    });
    return res.status(404).json({
      error: 'No se encontró un competidor registrado con ese número de DNI. Verifica tu número e intenta nuevamente.',
    });
  }

  // Log successful competitor login to analytics
  logAnalyticsEvent({
    type: 'runner_login',
    runner: match.runner,
    title: 'Atleta consultó Mi Espacio',
    description: `${match.runner.firstName} ${match.runner.lastName} (DNI: ${match.runner.documentNumber}) revisó su credencial y QR`,
  });

  res.json({ success: true, runner: match.runner });
});

// 4. Runner Lookup / Scan Verification (universal for both start and finish line / meta)
app.post('/api/verify-runner', (req, res) => {
  const { code, runnerId, dni } = req.body;
  const input = code || runnerId || dni || '';
  const registrations = readJSON<any[]>(REGISTRATIONS_FILE, []);
  const match = findRunner(input, registrations);

  if (!match) {
    return res.status(404).json({
      error: 'No se encontró ningún participante con los datos del código escaneado.',
    });
  }

  res.json({
    success: true,
    runner: match.runner,
  });
});

// 5. Start Line QR Check-in: Verification of attendance when arriving at starting arch
app.post('/api/start-checkin', (req, res) => {
  const { runnerId, dorsal, dni, token, qrData, code } = req.body;

  const registrations = readJSON<any[]>(REGISTRATIONS_FILE, []);
  const inputToMatch = code || runnerId || dni || qrData || dorsal || '';
  const match = findRunner(inputToMatch, registrations);

  if (!match) {
    return res.status(404).json({
      error: 'Competidor no encontrado para confirmación de asistencia. Verifica el DNI o código.',
    });
  }

  const updatedRunner = {
    ...registrations[match.index],
    confirmedAtStart: true,
    startCheckinTime: new Date().toISOString(),
  };
  registrations[match.index] = updatedRunner;
  writeJSON(REGISTRATIONS_FILE, registrations);

  console.log(
    `[Check-in Realtime] Participante ${updatedRunner.firstName} ${updatedRunner.lastName} (DNI: ${updatedRunner.documentNumber}) confirmó entrega de kit a las ${updatedRunner.startCheckinTime}`
  );

  logAnalyticsEvent({
    type: 'qr_scan',
    runner: updatedRunner,
    title: 'Acreditación y Kit Entregado',
    description: `${updatedRunner.firstName} ${updatedRunner.lastName} (DNI: ${updatedRunner.documentNumber}) confirmó su asistencia en Plaza de Armas.`,
  });

  broadcastCheckinUpdate(updatedRunner);

  res.json({
    success: true,
    message: '¡Asistencia Confirmada! Kit Inicial Entregado 🏃‍♂️💨',
    runner: updatedRunner,
  });
});

// 6. Meta / Finish Line QR Check-in & Medal Delivery Confirmation (Entre Jarras)
app.post('/api/meta-checkin', (req, res) => {
  const { runnerId, dni, code } = req.body;
  const registrations = readJSON<any[]>(REGISTRATIONS_FILE, []);
  const match =
    findRunner(runnerId, registrations) ||
    findRunner(dni, registrations) ||
    findRunner(code, registrations);

  if (!match) {
    return res.status(404).json({
      error: 'Competidor no encontrado para validar llegada a meta.',
    });
  }

  const updatedRunner = {
    ...registrations[match.index],
    finishedAtMeta: true,
    finishCheckinTime: new Date().toISOString(),
    medalDelivered: true,
  };
  registrations[match.index] = updatedRunner;
  writeJSON(REGISTRATIONS_FILE, registrations);

  console.log(
    `[Meta Finisher Realtime] Participante ${updatedRunner.firstName} ${updatedRunner.lastName} (DNI: ${updatedRunner.documentNumber}) cruzó la meta y recibió medalla a las ${updatedRunner.finishCheckinTime}`
  );

  res.json({
    success: true,
    message: '¡Llegada a meta y entrega de medalla confirmada exitosamente!',
    runner: updatedRunner,
  });
});

// 5. Virtual Evidence Submission: runners uploading 5K Strava / Nike screenshot & time
app.post('/api/competitor/evidence', (req, res) => {
  const { runnerId, evidence } = req.body;
  if (!runnerId || !evidence) {
    return res.status(400).json({ error: 'Datos de evidencia incompletos.' });
  }

  const registrations = readJSON<any[]>(REGISTRATIONS_FILE, []);
  const idx = registrations.findIndex((r) => r.id === runnerId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Competidor no encontrado.' });
  }

  const updatedRunner = {
    ...registrations[idx],
    virtualEvidence: {
      ...registrations[idx].virtualEvidence,
      ...evidence,
      submittedAt: new Date().toISOString(),
    },
  };
  registrations[idx] = updatedRunner;
  writeJSON(REGISTRATIONS_FILE, registrations);

  res.json({
    success: true,
    message: 'Evidencia de carrera virtual guardada exitosamente.',
    runner: updatedRunner,
  });
});

// ================= 8. ANALYTICS & ACTIVITY TRACKING API =================
app.get('/api/analytics', (req, res) => {
  const data = readJSON<AnalyticsData>(ANALYTICS_FILE, getInitialAnalytics());
  res.json({
    totalPageViews: data.pageViews || 0,
    uniqueVisitorsCount: (data.uniqueVisitors || []).length,
    miEspacioClicks: data.miEspacioClicks || 0,
    sectionViews: data.sectionViews || {},
    competitorAccesses: data.competitorAccesses || [],
    recentActivity: (data.activityLog || []).slice(0, 100),
    totalCompetitorsConsulted: (data.competitorAccesses || []).length,
  });
});

app.post('/api/analytics/track', (req, res) => {
  const { type, sessionId, section, runner, title, description, metadata } = req.body;
  if (!type) {
    return res.status(400).json({ error: 'Falta tipo de evento' });
  }
  logAnalyticsEvent({
    type,
    sessionId,
    section,
    runner,
    title,
    description,
    metadata,
  });
  res.json({ success: true });
});

app.post('/api/analytics/reset', (req, res) => {
  writeJSON(ANALYTICS_FILE, getInitialAnalytics());
  res.json({ success: true, message: 'Analítica reseteada' });
});

// High-Performance In-Memory Cache for Roulette to support 200+ concurrent clients without disk bottlenecks
let cachedRouletteState: RouletteState = readJSON<RouletteState>(ROULETTE_FILE, getInitialRoulette());

function getActiveRouletteState(): RouletteState {
  if (cachedRouletteState.isSpinning && cachedRouletteState.spinStartTime > 0) {
    const elapsed = Date.now() - cachedRouletteState.spinStartTime;
    if (elapsed >= (cachedRouletteState.spinDuration || 6000) + 4000) {
      cachedRouletteState.isSpinning = false;
      writeJSON(ROULETTE_FILE, cachedRouletteState);
    }
  }
  return cachedRouletteState;
}

function saveAndBroadcastRoulette(newState: RouletteState) {
  cachedRouletteState = newState;
  writeJSON(ROULETTE_FILE, cachedRouletteState);
  broadcastRouletteUpdate(cachedRouletteState);
}

// SSE clients for zero-latency real-time synchronization
let sseRouletteClients: any[] = [];
let sseAdminClients: any[] = [];

function broadcastRouletteUpdate(data: any) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  sseRouletteClients.forEach((client) => {
    try {
      client.write(payload);
    } catch (e) {}
  });
}

function broadcastCheckinUpdate(runner: any) {
  const payload = `data: ${JSON.stringify({ type: 'checkin', runner, timestamp: Date.now() })}\n\n`;
  sseAdminClients.forEach((client) => {
    try {
      client.write(payload);
    } catch (e) {}
  });
}

// SSE endpoint for public roulette synchronization (supports hundreds of simultaneous connections)
app.get('/api/roulette/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders?.();

  const data = getActiveRouletteState();
  res.write(`data: ${JSON.stringify(data)}\n\n`);

  // Heartbeat ping every 20 seconds to prevent proxy / browser timeout drops
  const pingTimer = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (e) {
      clearInterval(pingTimer);
    }
  }, 20000);

  sseRouletteClients.push(res);
  req.on('close', () => {
    clearInterval(pingTimer);
    sseRouletteClients = sseRouletteClients.filter((c) => c !== res);
  });
});

// SSE endpoint for admin dashboard real-time updates
app.get('/api/admin/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders?.();

  const adminPingTimer = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (e) {
      clearInterval(adminPingTimer);
    }
  }, 20000);

  sseAdminClients.push(res);
  req.on('close', () => {
    clearInterval(adminPingTimer);
    sseAdminClients = sseAdminClients.filter((c) => c !== res);
  });
});

// ================= 9. REAL-TIME ROULETTE / SORTEOS API (22 PREMIOS, 266 TICKETS) =================
// Ultra-fast memory read for /api/roulette (<1ms response even under 500+ concurrent requests)
app.get('/api/roulette', (req, res) => {
  res.json(getActiveRouletteState());
});

app.post('/api/roulette/toggle', (req, res) => {
  const { isActive } = req.body;
  const data = getActiveRouletteState();
  data.isActive = isActive !== undefined ? !!isActive : !data.isActive;
  saveAndBroadcastRoulette(data);
  logAnalyticsEvent({
    type: 'section_view',
    title: data.isActive ? 'Ruleta de Sorteos Activada' : 'Ruleta Ocultada',
    description: `El organizador ${data.isActive ? 'activó la ruleta en la página principal' : 'ocultó la ruleta'}`,
  });
  res.json({ success: true, roulette: data });
});

app.post('/api/roulette/spin', (req, res) => {
  const { prizeName } = req.body;
  const data = getActiveRouletteState();

  if (data.winners.length >= (data.totalDraws || 22)) {
    return res.status(400).json({ error: 'Ya se completaron los 22 sorteos programados.' });
  }

  // Determine available tickets from 1 to 266 that haven't won yet
  const wonTickets = new Set(data.winners.map((w) => w.ticketNumber));
  const availableTickets: number[] = [];
  for (let i = 1; i <= 266; i++) {
    if (!wonTickets.has(i)) {
      availableTickets.push(i);
    }
  }

  if (availableTickets.length === 0) {
    return res.status(400).json({ error: 'No quedan tickets disponibles para el sorteo.' });
  }

  // Randomly select winning ticket
  const randomIndex = Math.floor(Math.random() * availableTickets.length);
  const targetTicket = availableTickets[randomIndex];

  // Try to match ticket with registered runner (by registrationNumber or index)
  const registrations = readJSON<any[]>(REGISTRATIONS_FILE, []);
  const matchingRunner = registrations.find(
    (r) => r.registrationNumber === targetTicket || r.bibNumber === targetTicket
  ) || (targetTicket <= registrations.length ? registrations[targetTicket - 1] : null);

  const drawNum = data.winners.length + 1;
  const prize = prizeName || data.currentPrizeName || `Sorteo #${drawNum}: Premio Oficial 5K`;

  const newWinner: RouletteWinner = {
    drawNumber: drawNum,
    ticketNumber: targetTicket,
    prizeName: prize,
    wonAt: new Date().toISOString(),
    runnerName: matchingRunner ? `${matchingRunner.firstName} ${matchingRunner.lastName}` : `Ticket Oficial #${String(targetTicket).padStart(3, '0')}`,
    runnerDni: matchingRunner ? matchingRunner.documentNumber : undefined,
  };

  // Calculate target rotation angle so that sector `targetTicket` lands EXACTLY under top pointer at 12 o'clock (0 deg)
  const currentRot = data.targetAngle || 0;
  const sectorAngle = (targetTicket - 1) * (360 / 266) + (180 / 266);
  const desiredMod = (360 - (sectorAngle % 360) + 360) % 360;
  const currentMod = ((currentRot % 360) + 360) % 360;
  let diff = desiredMod - currentMod;
  if (diff < 0) diff += 360;
  const fullSpins = (6 + Math.floor(Math.random() * 2)) * 360;
  const targetAngle = currentRot + fullSpins + diff;

  const nextDrawIdx = Math.min(drawNum, 21);
  const correlativePrizes = [
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

  data.isSpinning = true;
  data.spinStartTime = Date.now();
  data.spinDuration = 6000;
  data.targetTicket = targetTicket;
  data.targetAngle = targetAngle;
  data.currentDrawNumber = Math.min(drawNum + 1, 22);
  data.currentPrizeName = correlativePrizes[nextDrawIdx] || `Sorteo #${Math.min(drawNum + 1, 22)}: Premio Oficial 5K`;
  data.lastWinner = newWinner;
  data.winners.unshift(newWinner); // most recent first

  saveAndBroadcastRoulette(data);

  logAnalyticsEvent({
    type: 'section_view',
    title: `¡Sorteo #${drawNum} Realizado!`,
    description: `Ganador Ticket #${String(targetTicket).padStart(3, '0')}: ${newWinner.runnerName || ''} (${prize})`,
  });

  res.json({ success: true, roulette: data, winner: newWinner });
});

app.post('/api/roulette/reset', (req, res) => {
  const initial = getInitialRoulette();
  initial.isActive = true;
  saveAndBroadcastRoulette(initial);
  res.json({ success: true, roulette: initial });
});

app.post('/api/roulette/remove-winner', (req, res) => {
  const { drawNumber } = req.body;
  const data = getActiveRouletteState();
  data.winners = data.winners.filter((w) => w.drawNumber !== drawNumber);
  data.currentDrawNumber = data.winners.length + 1;
  data.currentPrizeName = `Premio #${data.currentDrawNumber}: Sorteo Oficial Ohana Go 5K`;
  saveAndBroadcastRoulette(data);
  res.json({ success: true, roulette: data });
});

app.post('/api/roulette/update-prize', (req, res) => {
  const { currentPrizeName } = req.body;
  const data = getActiveRouletteState();
  if (currentPrizeName) {
    data.currentPrizeName = String(currentPrizeName).trim();
    saveAndBroadcastRoulette(data);
  }
  res.json({ success: true, roulette: data });
});

// ================= FRONTEND SERVING =================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Mount Vite dev server middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[FullStack] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
