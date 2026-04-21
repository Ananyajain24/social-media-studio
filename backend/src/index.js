import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import studioRouter from './routes/studio.js';
import reelRouter   from './routes/reel.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));

// Serve generated MP4s, MP3s, and merged exports as static files
app.use('/api/reel/video',  express.static(join(__dirname, '../output')));
app.use('/api/reel/audio',  express.static(join(__dirname, '../output/audio')));
app.use('/api/reel/merged', express.static(join(__dirname, '../output/merged')));

app.use('/api/studio', studioRouter);
app.use('/api/reel',   reelRouter);

app.get('/health', (_, res) => res.json({ status: 'ok', ts: Date.now() }));

app.listen(PORT, () => {
  const key = !!process.env.ANTHROPIC_API_KEY;
  console.log(`Studio backend on :${PORT} | API key: ${key ? '✓' : '✗ MISSING'}`);
  if (!key) console.error('ERROR: set ANTHROPIC_API_KEY in backend/.env');
});
