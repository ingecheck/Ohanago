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

// Persistent directory for shared data (medal photo & registrations)
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
  if (!image || typeof image !== 'string' || !image.startsWith('data:image')) return;
  try {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicDir, 'official-medal.png'), Buffer.from(base64Data, 'base64'));
    console.log('[Medal] Successfully saved /public/official-medal.png');
  } catch (err) {
    console.error('Error writing public/official-medal.png:', err);
  }
}

// On startup, ensure public/official-medal.png exists if medal.json has image
const initialMedal = readJSON<{ image: string | null }>(MEDAL_FILE, { image: null });
if (initialMedal && initialMedal.image) {
  savePublicMedalImage(initialMedal.image);
}

// ================= API ROUTES =================

// 1. Medal Photo API: Shared across ALL users, devices and browsers
app.get('/api/medal', (req, res) => {
  const data = readJSON(MEDAL_FILE, { image: null, updatedAt: null });
  res.json(data);
});

app.post('/api/medal', (req, res) => {
  const { image } = req.body;
  const data = {
    image: image || null,
    updatedAt: new Date().toISOString(),
  };
  writeJSON(MEDAL_FILE, data);
  if (image) {
    savePublicMedalImage(image);
  }
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
