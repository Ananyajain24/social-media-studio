import { spawn }        from 'child_process';
import { mkdir, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID }    from 'crypto';

// Use FFMPEG_PATH env var (set in .env for local Windows dev), or fall back to
// system ffmpeg (available in the production Docker container via apt-get).
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';

const __dir      = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR  = join(__dir, '../../output');
const MERGED_DIR  = join(__dir, '../../output/merged');

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

/**
 * mergeVideoAudio(videoFilename, audioFilename)
 *
 * Runs FFmpeg to overlay the MP3 on the MP4.
 * Audio is trimmed to video length (-shortest) so they stay in sync.
 * Returns { mergedFilename, mergedUrl }
 */
export async function mergeVideoAudio(videoFilename, audioFilename) {
  await mkdir(MERGED_DIR, { recursive: true });

  const videoPath  = join(OUTPUT_DIR, videoFilename);
  const audioPath  = join(OUTPUT_DIR, 'audio', audioFilename);
  const outName    = `final_${randomUUID()}.mp4`;
  const outPath    = join(MERGED_DIR, outName);

  if (!(await fileExists(videoPath))) throw new Error(`Video not found: ${videoFilename}`);
  if (!(await fileExists(audioPath))) throw new Error(`Audio not found: ${audioFilename}`);

  console.log(`[export] Merging ${videoFilename} + ${audioFilename} → ${outName}`);

  await new Promise((resolve, reject) => {
    const proc = spawn(FFMPEG, [
      '-y',
      '-i', videoPath,
      '-i', audioPath,
      '-c:v', 'copy',       // no re-encode — fast
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',          // cut at the shorter stream (video wins after sync fix)
      outPath
    ], { windowsHide: true });

    let stderr = '';
    proc.stderr.on('data', d => { stderr += d.toString(); });

    proc.on('close', code => {
      if (code === 0) {
        console.log(`[export] Done → ${outName}`);
        resolve();
      } else {
        console.error('[export] FFmpeg stderr:', stderr.slice(-800));
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    proc.on('error', err => {
      if (err.code === 'ENOENT') {
        reject(new Error(
          'FFmpeg not found. Install it and ensure it is in your PATH.\n' +
          'Download: https://ffmpeg.org/download.html'
        ));
      } else {
        reject(err);
      }
    });
  });

  return {
    mergedFilename: outName,
    mergedUrl: `/api/reel/merged/${outName}`
  };
}
