import { Router } from 'express';
import { generateScript, regenerateSlide, generateStory } from '../services/llm.js';

const router = Router();

router.post('/generate', async (req, res) => {
  const { idea, format = 'carousel' } = req.body;
  if (!idea?.trim()) return res.status(400).json({ error: 'idea is required' });

  try {
    const script = await generateScript(idea.trim(), format);
    res.json({ script });
  } catch (err) {
    console.error('[generate]', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/regenerate-slide', async (req, res) => {
  const { script, slideIndex, instruction } = req.body;
  if (!script || slideIndex == null) {
    return res.status(400).json({ error: 'script and slideIndex are required' });
  }

  try {
    const slide = await regenerateSlide(script, slideIndex, instruction);
    res.json({ slide });
  } catch (err) {
    console.error('[regenerate-slide]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/studio/generate-story
router.post('/generate-story', async (req, res) => {
  const { idea } = req.body;
  if (!idea?.trim()) return res.status(400).json({ error: 'idea is required' });

  try {
    const story = await generateStory(idea.trim());
    res.json({ story });
  } catch (err) {
    console.error('[generate-story]', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
