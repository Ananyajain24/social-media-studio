import express from 'express';
import cors    from 'cors';
import dotenv  from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync }    from 'fs';
import studioRouter from './routes/studio.js';
import reelRouter   from './routes/reel.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const app  = express();
const PORT = process.env.PORT || 3001;
const PROD = process.env.NODE_ENV === 'production';

// CORS — in production the frontend is served from the same origin, so this
// only matters for direct API access from other domains.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.RENDER_EXTERNAL_URL,
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '2mb' }));

// Generated media files
app.use('/api/reel/video',  express.static(join(__dirname, '../output')));
app.use('/api/reel/audio',  express.static(join(__dirname, '../output/audio')));
app.use('/api/reel/merged', express.static(join(__dirname, '../output/merged')));

// API routes
app.use('/api/studio', studioRouter);
app.use('/api/reel',   reelRouter);

app.get('/health', (_, res) => res.json({ status: 'ok', ts: Date.now() }));

// In production, serve the built frontend for all non-API routes
if (PROD) {
  const publicDir = join(__dirname, '../public');
  if (existsSync(publicDir)) {
    app.use(express.static(publicDir));
    app.get('*', (req, res) => {
      res.sendFile(join(publicDir, 'index.html'));
    });
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Studio backend on :${PORT} [${PROD ? 'production' : 'development'}]`);
  console.log(`  ANTHROPIC_API_KEY : ${process.env.ANTHROPIC_API_KEY ? '✓' : '✗ MISSING'}`);
  console.log(`  OPENAI_API_KEY    : ${process.env.OPENAI_API_KEY    ? '✓' : '✗ MISSING'}`);
});
