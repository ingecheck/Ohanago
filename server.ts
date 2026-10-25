import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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
      extractedId = url.searchParams.get('runner') || url.searchParams.get('runnerId') || url.searchParams.get('id') || '';
    }
  } catch (e) {}

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

    // Match by Full Name
    if (targetNorm.length >= 6 && rFullNameNorm.includes(targetNorm)) return true;

    return false;
  });

  if (index === -1) return null;
  return { runner: registrations[index], index };
}

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
    return res.status(404).json({
      error: 'No se encontró un competidor registrado con ese número de DNI. Verifica tu número e intenta nuevamente.',
    });
  }

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
  const { runnerId, dorsal, dni, token, qrData } = req.body;

  const cleanToken = typeof token === 'string' ? token.trim() : '';
  const isValid =
    cleanToken === MASTER_START_TOKEN ||
    cleanToken === 'ADMIN_CHECKIN_OVERRIDE' ||
    cleanToken.includes(MASTER_START_TOKEN) ||
    cleanToken.includes('OHANA-START-LINE') ||
    cleanToken.includes('checkin=start');

  if (!isValid) {
    return res.status(400).json({
      error: 'Código QR de partida no válido. Escanea el QR oficial mostrado en la Plaza de Armas.',
    });
  }

  const registrations = readJSON<any[]>(REGISTRATIONS_FILE, []);
  const match =
    findRunner(runnerId, registrations) ||
    findRunner(dni, registrations) ||
    findRunner(qrData, registrations) ||
    findRunner(dorsal, registrations);

  if (!match) {
    return res.status(404).json({
      error: 'Competidor no encontrado para confirmación de asistencia.',
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
    `[Check-in Realtime] Participante ${updatedRunner.firstName} ${updatedRunner.lastName} (DNI: ${updatedRunner.documentNumber}) confirmó asistencia a las ${updatedRunner.startCheckinTime}`
  );

  res.json({
    success: true,
    message: '¡Asistencia Confirmada! Prepárate para la carrera 🏃‍♂️💨',
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
