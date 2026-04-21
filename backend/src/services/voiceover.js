import Anthropic from '@anthropic-ai/sdk';
import OpenAI    from 'openai';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname }    from 'path';
import { fileURLToPath }    from 'url';
import { randomUUID }       from 'crypto';

const __dir    = dirname(fileURLToPath(import.meta.url));
const AUDIO_DIR = join(__dir, '../../output/audio');

// ─── Clients ──────────────────────────────────────────────────────────────────

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set. Add it to backend/.env to enable voiceover.');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ─── Duration parser: reads run_time / self.wait from Manim source ────────────

export function estimateManimDuration(code) {
  let total = 0;

  // Sum all explicit run_time=X values
  const rtMatches = [...code.matchAll(/run_time\s*=\s*([\d.]+)/g)];
  rtMatches.forEach(m => { total += parseFloat(m[1]); });

  // self.play() calls without run_time default to 1s each
  const playCount   = (code.match(/self\.play\s*\(/g)  || []).length;
  const rtCount     = rtMatches.length;
  total += Math.max(0, playCount - rtCount);

  // self.wait(X)
  const waitMatches = [...code.matchAll(/self\.wait\s*\(\s*([\d.]+)/g)];
  waitMatches.forEach(m => { total += parseFloat(m[1]); });

  // self.wait() with no args = 1s
  total += (code.match(/self\.wait\s*\(\s*\)/g) || []).length;

  console.log(`[voiceover] Estimated video duration: ${total.toFixed(1)}s`);
  return Math.max(total, 10); // floor at 10s
}

// ─── Step 1: Manim code → duration-synced narration (via Claude) ─────────────

function buildNarrationSystem(targetSeconds) {
  // At TTS speed 0.95, effective rate ≈ 142 wpm → words per second ≈ 2.37
  const targetWords = Math.round((targetSeconds / 60) * 142);

  return `You are a precise voiceover narrator for Cuemath, a K-12 math education brand.

Your job: write a narration that is frame-perfectly synchronised to the Manim animation.

VIDEO DURATION: ${targetSeconds.toFixed(1)} seconds
TARGET LENGTH: exactly ${targetWords} words  ← HARD CONSTRAINT
(At TTS speed 0.95x, ${targetWords} words ≈ ${targetSeconds.toFixed(0)} seconds of spoken audio.)

HOW TO ANALYSE THE CODE:
1. Find every self.play(..., run_time=X) — a visual moment lasting X seconds (default 1s if omitted).
2. Find every self.wait(X) — a held frame for X seconds.
3. Map out the exact timeline: what is on screen at every second.

HOW TO WRITE THE NARRATION:
- ONE continuous paragraph — pure flowing speech, no headers, no lists.
- Words at each moment describe what is CURRENTLY VISIBLE on screen.
- Sentence length mirrors animation duration: a 2s animation ≈ 10 words; 5s ≈ 25 words.
- Transitions feel natural: "Now notice…", "Watch how…", "Here…", "As you can see…"
- Tone: warm, confident, like a knowledgeable friend talking to a parent.
- Mention "Cuemath" once, naturally, near the end.
- Count your words before outputting. If over ${targetWords}, cut. If under, expand slightly.
- Output ONLY the narration text. No word count, no timestamps, no stage directions.`;
}

export async function generateNarrationText(manimCode, targetSeconds) {
  const client = getAnthropicClient();

  const msg = await client.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 1200,
    system:     buildNarrationSystem(targetSeconds),
    messages: [{
      role:    'user',
      content: `Analyse this Manim code's timeline and write a ${Math.round((targetSeconds / 60) * 142)}-word frame-synced voiceover:\n\n\`\`\`python\n${manimCode}\n\`\`\``
    }]
  });

  return msg.content[0].text.trim();
}

// ─── Step 2: narration text → MP3 (via OpenAI TTS) ───────────────────────────

const TTS_CONFIG = {
  model: 'tts-1',
  voice: 'nova',   // warm, friendly
  speed: 0.95
};

export async function textToSpeech(text, outputPath) {
  const openai = getOpenAIClient();
  console.log(`[tts] ${text.split(/\s+/).length} words → OpenAI TTS...`);

  const response = await openai.audio.speech.create({
    model:           TTS_CONFIG.model,
    voice:           TTS_CONFIG.voice,
    input:           text,
    response_format: 'mp3',
    speed:           TTS_CONFIG.speed
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(outputPath, buffer);
  console.log(`[tts] Saved ${(buffer.length / 1024).toFixed(1)} KB → ${outputPath}`);
  return buffer.length;
}

// ─── Step 3: orchestrate ──────────────────────────────────────────────────────

export async function generateVoiceover(manimCode) {
  if (!manimCode?.trim()) throw new Error('manimCode is required');

  await mkdir(AUDIO_DIR, { recursive: true });

  const targetSeconds = estimateManimDuration(manimCode);

  console.log(`[voiceover] Generating ${targetSeconds.toFixed(0)}s narration...`);
  const narrationText = await generateNarrationText(manimCode, targetSeconds);

  const wordCount = narrationText.trim().split(/\s+/).length;
  console.log(`[voiceover] Narration: ${wordCount} words (target ${Math.round((targetSeconds / 60) * 142)})`);

  const filename  = `vo_${randomUUID()}.mp3`;
  const audioPath = join(AUDIO_DIR, filename);
  await textToSpeech(narrationText, audioPath);

  return {
    audioPath,
    filename,
    audioUrl:      `/api/reel/audio/${filename}`,
    narrationText,
    targetSeconds,
    wordCount
  };
}
