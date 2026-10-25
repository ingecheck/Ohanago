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

// 3. Competitor Auth: Login strictly by DNI
app.post('/api/competitor/login', (req, res) => {
  const { dni, query } = req.body;
  const rawInput = String(dni || query || '').trim();
  if (!rawInput) {
    return res.status(400).json({ error: 'Ingresa tu número de DNI.' });
  }
  const clean = rawInput.toLowerCase().replace(/[\s\.\-#]/g, '');
  const cleanDigits = rawInput.replace(/\D/g, '');
  const registrations = readJSON<any[]>(REGISTRATIONS_FILE, []);
  
  const runner = registrations.find((r) => {
    const rDni = String(r.documentNumber || '').toLowerCase().replace(/[\s\.\-#]/g, '');
    const rDigits = String(r.documentNumber || '').replace(/\D/g, '');

    return (
      (clean && rDni === clean) ||
      (cleanDigits && rDigits === cleanDigits) ||
      (cleanDigits && cleanDigits.length >= 7 && rDigits.endsWith(cleanDigits))
    );
  });

  if (!runner) {
    return res.status(404).json({ error: 'No se encontró un competidor registrado con ese número de DNI. Verifica tu número e intenta nuevamente.' });
  }

  res.json({ success: true, runner });
});

// 4. Start Line QR Check-in: Verification of attendance when arriving at starting arch
app.post('/api/start-checkin', (req, res) => {
  const { runnerId, dorsal, dni, token } = req.body;
  
  const cleanToken = typeof token === 'string' ? token.trim() : '';
  const isValid = 
    cleanToken === MASTER_START_TOKEN || 
    cleanToken === 'ADMIN_CHECKIN_OVERRIDE' ||
    cleanToken.includes(MASTER_START_TOKEN) ||
    cleanToken.includes('OHANA-START-LINE') ||
    cleanToken.includes('checkin=start');

  if (!isValid) {
    return res.status(400).json({ error: 'Código QR de partida no válido. Escanea el QR oficial mostrado en la Plaza de Armas.' });
  }

  const registrations = readJSON<any[]>(REGISTRATIONS_FILE, []);
  const cleanDni = dni ? String(dni).trim().toLowerCase().replace(/[\s\.\-#]/g, '') : '';
  const cleanDigits = dni ? String(dni).replace(/\D/g, '') : '';
  const cleanDorsal = dorsal && !isNaN(Number(dorsal)) ? Number(dorsal) : null;
  const cleanRunnerId = runnerId ? String(runnerId).trim().toLowerCase() : '';

  const idx = registrations.findIndex((r) => {
    const rDni = String(r.documentNumber || '').toLowerCase().replace(/[\s\.\-#]/g, '');
    const rDigits = String(r.documentNumber || '').replace(/\D/g, '');
    const rId = String(r.id || '').toLowerCase();
    const rDorsal = Number(r.registrationNumber || r.bibNumber || 0);

    if (cleanRunnerId && rId === cleanRunnerId) return true;
    if (cleanDigits && (rDni === cleanDigits || rDigits === cleanDigits)) return true;
    if (cleanDni && rDni === cleanDni) return true;
    if (cleanDorsal && rDorsal === cleanDorsal) return true;
    return false;
  });

  if (idx === -1) {
    return res.status(404).json({ error: 'Competidor no encontrado para confirmación de partida.' });
  }

  const updatedRunner = {
    ...registrations[idx],
    confirmedAtStart: true,
    startCheckinTime: new Date().toISOString(),
  };
  registrations[idx] = updatedRunner;
  writeJSON(REGISTRATIONS_FILE, registrations);

  console.log(`[Check-in Realtime] Participante ${updatedRunner.firstName} ${updatedRunner.lastName} (DNI: ${updatedRunner.documentNumber}) confirmó asistencia a las ${updatedRunner.startCheckinTime}`);

  res.json({
    success: true,
    message: '¡Confirmación de partida exitosa! Tu asistencia ha sido validada en tiempo real.',
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
