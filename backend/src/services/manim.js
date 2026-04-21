import Anthropic from '@anthropic-ai/sdk';
import { spawn }  from 'child_process';
import { writeFile, mkdir, copyFile, readdir, rm } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SYSTEM_PROMPT, buildUserPrompt } from './manimTemplate.js';

const __dir     = dirname(fileURLToPath(import.meta.url));
const TEMP_DIR   = join(__dir, '../../temp');
const OUTPUT_DIR = join(__dir, '../../output');

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// ─── Step 1: LLM → Manim Python code ─────────────────────────────────────────
export async function generateManimCode(idea) {
  const client = getClient();
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(idea) }]
  });
  const raw  = extractPython(msg.content[0].text.trim());
  const safe = sanitiseLatex(raw);
  return safe;
}

// ─── Sanitiser: catch LaTeX components the LLM may still emit ────────────────
// Each rule: [regex to find, safe replacement, label for logging]
const LATEX_PATCHES = [
  // MathTex / Tex → Text
  [/\bMathTex\s*\(/g,            'Text(',            'MathTex→Text'],
  [/\bTex\s*\(/g,                'Text(',            'Tex→Text'],

  // DecimalNumber / Integer → Text(str(...))
  [/\bDecimalNumber\s*\(\s*(\w+)\s*\)/g, 'Text(str($1))',  'DecimalNumber→Text'],
  [/\bInteger\s*\(\s*(\w+)\s*\)/g,       'Text(str($1))',  'Integer→Text'],

  // include_numbers=True → include_numbers=False (the default; safe)
  [/include_numbers\s*=\s*True/g,        'include_numbers=False', 'include_numbers'],

  // decimal_number_config=... → remove entire kwarg
  [/,?\s*decimal_number_config\s*=\s*\{[^}]*\}/g, '', 'decimal_number_config'],

  // label_constructor=... → remove
  [/,?\s*label_constructor\s*=\s*\w+/g,  '',  'label_constructor'],

  // numbers_to_include=[...] → remove (NumberLine)
  [/,?\s*numbers_to_include\s*=\s*\[[^\]]*\]/g, '', 'numbers_to_include'],

  // axes.get_axis_labels(...) → comment out
  [/^([ \t]*)(.+\.get_axis_labels\([^)]*\))/gm,
   '$1# REMOVED get_axis_labels (uses MathTex internally)',
   'get_axis_labels'],
];

function sanitiseLatex(code) {
  let out = code;
  for (const [re, replacement, label] of LATEX_PATCHES) {
    const before = out;
    out = out.replace(re, replacement);
    if (out !== before) console.warn(`[sanitise] patched: ${label}`);
  }
  return out;
}

// ─── Step 2: Run Manim, copy MP4, return filename ────────────────────────────
export async function renderManimCode(code, jobId, onProgress) {
  await mkdir(TEMP_DIR,   { recursive: true });
  await mkdir(OUTPUT_DIR, { recursive: true });

  const scriptPath = join(TEMP_DIR, `${jobId}.py`);
  const mediaDir   = join(TEMP_DIR, `media_${jobId}`);
  await writeFile(scriptPath, code, 'utf-8');

  onProgress?.('running_manim');
  await spawnManim(scriptPath, mediaDir, jobId);

  const mp4Src = await findMp4(mediaDir);
  if (!mp4Src) throw new Error('Manim finished but produced no MP4 — check the generated code');

  const outFile = `${jobId}.mp4`;
  await copyFile(mp4Src, join(OUTPUT_DIR, outFile));

  // Cleanup (best-effort, non-blocking)
  rm(scriptPath, { force: true }).catch(() => {});
  rm(mediaDir,   { recursive: true, force: true }).catch(() => {});

  return outFile;
}

// ─── Core: spawn python -m manim ─────────────────────────────────────────────
function spawnManim(scriptPath, mediaDir, jobId) {
  return new Promise((resolve, reject) => {
    // Use python -m manim — works even when 'manim' CLI is not on PATH
    const args = [
      '-m', 'manim', 'render',
      '-qm',                     // medium quality: 720p30
      '--disable_caching',       // no stale renders between jobs
      '--media_dir', mediaDir,
      scriptPath,
      'MathReel'
    ];

    const cmdStr = `python ${args.join(' ')}`;
    console.log(`[manim][${jobId}] ${cmdStr}`);

    const proc = spawn('python', args, {
      windowsHide: true,          // suppress console window on Windows
      env: { ...process.env }     // inherit full env (PATH, PYTHONPATH, etc.)
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (chunk) => {
      const line = chunk.toString();
      stdout += line;
      process.stdout.write(`[manim][${jobId}] ${line}`);   // live logs in terminal
    });

    proc.stderr.on('data', (chunk) => {
      const line = chunk.toString();
      stderr += line;
      process.stderr.write(`[manim][${jobId}] ${line}`);
    });

    const timeout = setTimeout(() => {
      proc.kill('SIGTERM');
      reject(new Error('Manim render timed out after 3 minutes'));
    }, 180_000);

    proc.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        // Surface the most useful part of stderr to the caller
        const detail = (stderr || stdout).slice(-1500);
        reject(new Error(
          `Manim exited with code ${code}.\n\nDetails:\n${detail}`
        ));
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(
        `Could not start Python: ${err.message}\n` +
        `Make sure Python is installed and in PATH, then retry.`
      ));
    });
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function extractPython(text) {
  const fenced = text.match(/```(?:python)?\n?([\s\S]*?)```/);
  return fenced ? fenced[1].trim() : text;
}

async function findMp4(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch { return null; }

  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      const hit = await findMp4(full);
      if (hit) return hit;
    } else if (e.name.endsWith('.mp4')) {
      return full;
    }
  }
  return null;
}
