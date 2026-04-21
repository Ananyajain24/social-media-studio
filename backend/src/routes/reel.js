import { Router }       from 'express';
import { randomUUID }   from 'crypto';
import { generateManimCode, renderManimCode } from '../services/manim.js';
import { generateVoiceover }                  from '../services/voiceover.js';
import { mergeVideoAudio }                    from '../services/export.js';

const router = Router();

// ─── In-memory job store ──────────────────────────────────────────────────────
// Shape: { status, progress, videoUrl, error, createdAt }
const jobs = new Map();

// Prune jobs older than 1 hour (prevents memory leak on long-running server)
setInterval(() => {
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [id, job] of jobs) {
    if (job.createdAt < cutoff) jobs.delete(id);
  }
}, 15 * 60 * 1000);


// ─── POST /api/reel/generate-code ─────────────────────────────────────────────
// Fast (~3-5 s). Returns Manim Python code as a string.
router.post('/generate-code', async (req, res) => {
  const { idea } = req.body;
  if (!idea?.trim()) return res.status(400).json({ error: 'idea is required' });

  try {
    const code = await generateManimCode(idea.trim());
    res.json({ code });
  } catch (err) {
    console.error('[generate-code]', err.message);
    res.status(500).json({ error: err.message });
  }
});


// ─── POST /api/reel/render ────────────────────────────────────────────────────
// Returns jobId IMMEDIATELY. Rendering runs in the background.
// Poll GET /api/reel/status/:jobId for progress.
router.post('/render', (req, res) => {
  const { code } = req.body;
  if (!code?.trim()) return res.status(400).json({ error: 'code is required' });

  const jobId = randomUUID();
  jobs.set(jobId, {
    status: 'rendering',
    progress: 5,
    videoUrl: null,
    error: null,
    createdAt: Date.now()
  });

  console.log(`[render] job ${jobId} queued`);
  res.json({ jobId });   // ← respond immediately, don't await render

  // Background render — update job map when done
  renderManimCode(code, jobId, (stage) => {
    if (stage === 'running_manim') {
      jobs.set(jobId, { ...jobs.get(jobId), progress: 20 });
    }
  })
    .then((filename) => {
      jobs.set(jobId, {
        ...jobs.get(jobId),
        status: 'done',
        progress: 100,
        videoUrl: `/api/reel/video/${filename}`
      });
      console.log(`[render] job ${jobId} done → ${filename}`);
    })
    .catch((err) => {
      jobs.set(jobId, {
        ...jobs.get(jobId),
        status: 'error',
        progress: 0,
        error: err.message
      });
      console.error(`[render] job ${jobId} failed:`, err.message);
    });
});


// ─── GET /api/reel/status/:jobId ──────────────────────────────────────────────
// Poll this every 3 s from the frontend.
router.get('/status/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  // Simulate smooth progress bar while rendering
  if (job.status === 'rendering' && job.progress < 85) {
    job.progress = Math.min(job.progress + 5, 85);
  }

  res.json({
    status:   job.status,    // 'rendering' | 'done' | 'error'
    progress: job.progress,  // 0-100
    videoUrl: job.videoUrl,  // set when done
    error:    job.error      // set on failure
  });
});


// ─── POST /api/reel/voiceover ─────────────────────────────────────────────────
// Body: { code: <manim python source> }
// Returns: { audioUrl, narrationText, duration, wordCount }
router.post('/voiceover', async (req, res) => {
  const { code } = req.body;

  if (!code?.trim()) {
    return res.status(400).json({ error: 'code (Manim source) is required' });
  }

  try {
    const result = await generateVoiceover(code);
    res.json({
      audioUrl:      result.audioUrl,
      narrationText: result.narrationText,
      duration:      result.duration,
      wordCount:     result.wordCount
    });
  } catch (err) {
    console.error('[voiceover]', err.message);
    res.status(500).json({ error: err.message });
  }
});


// ─── POST /api/reel/export ────────────────────────────────────────────────────
// Body: { videoFilename, audioFilename }
// Returns: { mergedUrl }
router.post('/export', async (req, res) => {
  const { videoFilename, audioFilename } = req.body;
  if (!videoFilename || !audioFilename) {
    return res.status(400).json({ error: 'videoFilename and audioFilename are required' });
  }
  try {
    const result = await mergeVideoAudio(videoFilename, audioFilename);
    res.json({ mergedUrl: result.mergedUrl });
  } catch (err) {
    console.error('[export]', err.message);
    res.status(500).json({ error: err.message });
  }
});


export default router;
