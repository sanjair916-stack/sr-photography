import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { INITIAL_SEED_QUOTATIONS, DEFAULT_STUDIO_PROFILE } from './src/constants.ts';
import { Quotation, StudioProfile } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

const DATA_DIR = path.resolve(__dirname, 'data');
const QUOTATIONS_FILE = path.join(DATA_DIR, 'quotations.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const AUTH_FILE = path.join(DATA_DIR, 'auth.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize seed data if not present
if (!fs.existsSync(QUOTATIONS_FILE)) {
  fs.writeFileSync(QUOTATIONS_FILE, JSON.stringify(INITIAL_SEED_QUOTATIONS, null, 2), 'utf-8');
}

if (!fs.existsSync(SETTINGS_FILE)) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_STUDIO_PROFILE, null, 2), 'utf-8');
}

if (!fs.existsSync(AUTH_FILE)) {
  fs.writeFileSync(
    AUTH_FILE,
    JSON.stringify({ username: 'admin', password: 'srphotography2026' }, null, 2),
    'utf-8'
  );
}

// Helpers for persistent data read/write
function readQuotations(): Quotation[] {
  try {
    const data = fs.readFileSync(QUOTATIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading quotations:', err);
    return [];
  }
}

function writeQuotations(quotations: Quotation[]) {
  fs.writeFileSync(QUOTATIONS_FILE, JSON.stringify(quotations, null, 2), 'utf-8');
}

function readSettings(): StudioProfile {
  try {
    const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading settings:', err);
    return DEFAULT_STUDIO_PROFILE;
  }
}

function writeSettings(settings: StudioProfile) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

function readAuth() {
  try {
    const data = fs.readFileSync(AUTH_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return { username: 'admin', password: 'srphotography2026' };
  }
}

function writeAuth(auth: { username: string; password: string }) {
  fs.writeFileSync(AUTH_FILE, JSON.stringify(auth, null, 2), 'utf-8');
}

const DOWNLOADS_DIR = path.resolve(__dirname, 'public', 'downloads');
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

async function startServer() {
  const app = express();
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
  app.use(express.json({ limit: '25mb' })); // Support high-res base64 image uploads
  app.use(express.static(path.resolve(__dirname, 'public'), {
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  }));

  // --- API Routes ---

  // Save generated JPG/PDF for direct static file download & preview
  app.post('/api/save-download', (req, res) => {
    try {
      const { dataUrl, filename } = req.body;
      if (!dataUrl) {
        return res.status(400).json({ error: 'No data provided' });
      }
      const safeFilename = (filename || 'SR_Photography_Quotation.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
      const base64Data = dataUrl.replace(/^data:[^;]+;base64,/, '');
      const filePath = path.join(DOWNLOADS_DIR, safeFilename);
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
      res.json({ 
        success: true, 
        url: `/downloads/${safeFilename}`, 
        downloadUrl: `/api/download-file/${safeFilename}`,
        filename: safeFilename 
      });
    } catch (err) {
      console.error('Error saving download file:', err);
      res.status(500).json({ error: 'Failed to save download file' });
    }
  });

  // Direct forced download route with attachment headers
  app.get('/api/download-file/:filename', (req, res) => {
    try {
      const safeFilename = req.params.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = path.join(DOWNLOADS_DIR, safeFilename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).send('Download file not found');
      }
      res.download(filePath, safeFilename);
    } catch (err) {
      console.error('Error serving download file:', err);
      res.status(500).send('Error downloading file');
    }
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const auth = readAuth();
    if (
      username?.trim().toLowerCase() === auth.username.toLowerCase() &&
      password === auth.password
    ) {
      return res.json({ success: true, username: auth.username, token: 'sr-admin-session-token' });
    }
    return res.status(401).json({ success: false, message: 'Invalid admin username or password' });
  });

  // Auth: Change Password
  app.post('/api/auth/change-password', (req, res) => {
    const { currentPassword, newPassword, newUsername } = req.body;
    const auth = readAuth();
    if (currentPassword !== auth.password) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ success: false, message: 'New password must be at least 4 characters' });
    }
    const updated = {
      username: newUsername?.trim() || auth.username,
      password: newPassword
    };
    writeAuth(updated);
    return res.json({ success: true, message: 'Admin credentials updated successfully' });
  });

  // Quotations: List All
  app.get('/api/quotations', (req, res) => {
    const list = readQuotations();
    res.json(list);
  });

  // Quotations: Get One
  app.get('/api/quotations/:id', (req, res) => {
    const list = readQuotations();
    const item = list.find((q) => q.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    res.json(item);
  });

  // Quotations: Create New
  app.post('/api/quotations', (req, res) => {
    const list = readQuotations();
    const payload = req.body;

    // Generate unique ID: SRP-YYYY-XXXX
    const currentYear = new Date().getFullYear();
    const existingForYear = list.filter((q) => q.id.startsWith(`SRP-${currentYear}`));
    let nextNum = existingForYear.length + 1;
    let newId = `SRP-${currentYear}-${String(nextNum).padStart(4, '0')}`;
    while (list.some((q) => q.id === newId)) {
      nextNum++;
      newId = `SRP-${currentYear}-${String(nextNum).padStart(4, '0')}`;
    }

    const newQuotation: Quotation = {
      id: payload.id || newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: payload.customer || {
        name: '',
        mobile: '',
        whatsapp: '',
        email: '',
        eventDate: '',
        eventLocation: '',
        eventType: 'Wedding Ceremony'
      },
      services: payload.services || [],
      financials: payload.financials || {
        subtotal: 0,
        discountType: 'rupees',
        discountValue: 0,
        discountAmount: 0,
        finalTotal: 0,
        advancePaid: 0,
        remainingBalance: 0
      },
      status: payload.status || 'Quotation',
      paymentStatus: payload.paymentStatus || 'Advance Pending',
      notes: payload.notes || ''
    };

    list.unshift(newQuotation);
    writeQuotations(list);
    res.status(201).json(newQuotation);
  });

  // Quotations: Update Existing
  app.put('/api/quotations/:id', (req, res) => {
    const list = readQuotations();
    const index = list.findIndex((q) => q.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    const updated: Quotation = {
      ...list[index],
      ...req.body,
      id: list[index].id, // preserve immutable ID
      updatedAt: new Date().toISOString()
    };

    list[index] = updated;
    writeQuotations(list);
    res.json(updated);
  });

  // Quotations: Duplicate Existing
  app.post('/api/quotations/:id/duplicate', (req, res) => {
    const list = readQuotations();
    const source = list.find((q) => q.id === req.params.id);
    if (!source) {
      return res.status(404).json({ error: 'Source quotation not found' });
    }

    const currentYear = new Date().getFullYear();
    let nextNum = list.length + 1;
    let newId = `SRP-${currentYear}-${String(nextNum).padStart(4, '0')}`;
    while (list.some((q) => q.id === newId)) {
      nextNum++;
      newId = `SRP-${currentYear}-${String(nextNum).padStart(4, '0')}`;
    }

    const duplicated: Quotation = {
      ...source,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Quotation',
      paymentStatus: 'Advance Pending',
      customer: {
        ...source.customer,
        name: `${source.customer.name} (Copy)`
      }
    };

    list.unshift(duplicated);
    writeQuotations(list);
    res.status(201).json(duplicated);
  });

  // Quotations: Delete
  app.delete('/api/quotations/:id', (req, res) => {
    const list = readQuotations();
    const filtered = list.filter((q) => q.id !== req.params.id);
    if (filtered.length === list.length) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    writeQuotations(filtered);
    res.json({ success: true, message: `Quotation ${req.params.id} deleted permanently` });
  });

  // Settings: Get Studio Profile
  app.get('/api/settings', (req, res) => {
    const settings = readSettings();
    res.json(settings);
  });

  // Settings: Update Studio Profile
  app.put('/api/settings', (req, res) => {
    const current = readSettings();
    const updated: StudioProfile = {
      ...current,
      ...req.body
    };
    writeSettings(updated);
    res.json(updated);
  });

  // Vite Integration: Dev vs Prod
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SR PHOTOGRAPHY Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
