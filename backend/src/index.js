import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import studioRouter from './routes/studio.js';

// Resolve .env relative to this file, not the process cwd
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.use('/api/studio', studioRouter);
app.get('/health', (_, res) => res.json({ status: 'ok', ts: Date.now() }));

app.listen(PORT, () => {
  const keyLoaded = !!process.env.ANTHROPIC_API_KEY;
  console.log(`Studio backend running on :${PORT} | API key loaded: ${keyLoaded}`);
  if (!keyLoaded) console.error('ERROR: ANTHROPIC_API_KEY not found — check backend/.env');
});
