import React, { useState, useRef } from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';

const EXAMPLES = [
  'Explain the Pythagorean theorem visually with a right triangle and squares on each side',
  'Show how compound interest grows over 20 years compared to simple interest',
  'Visualise adding fractions with different denominators step by step',
  'Animate the unit circle and how sin/cos values change as the angle increases'
];

const STAGE_META = {
  idle:         { label: '',                          pct: 0   },
  gen_code:     { label: 'Writing Manim code…',       pct: 25  },
  queued:       { label: 'Render queued…',            pct: 30  },
  rendering:    { label: 'Manim is rendering…',       pct: null },  // pct comes from server
  done:         { label: 'Done!',                     pct: 100 },
  error:        { label: '',                          pct: 0   }
};

export default function ReelGenerator() {
  const [idea,     setIdea]     = useState('');
  const [stage,    setStage]    = useState('idle');
  const [progress, setProgress] = useState(0);
  const [code,     setCode]     = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [error,    setError]    = useState('');
  const [showCode, setShowCode] = useState(false);
  const [showEx,   setShowEx]   = useState(false);
  const pollRef = useRef(null);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const pollStatus = (jobId) => {
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await axios.get(`/api/reel/status/${jobId}`);
        setProgress(data.progress);

        if (data.status === 'done') {
          stopPolling();
          setVideoUrl(data.videoUrl);
          setStage('done');
        } else if (data.status === 'error') {
          stopPolling();
          setError(data.error);
          setStage('error');
        }
      } catch {
        // network blip — keep polling
      }
    }, 3000);
  };

  const run = async () => {
    if (!idea.trim()) return;
    stopPolling();
    setStage('gen_code');
    setProgress(10);
    setError('');
    setCode('');
    setVideoUrl('');

    // ── Step 1: generate Manim code (fast, ~3-5 s) ──────────────────────
    let generatedCode;
    try {
      const { data } = await axios.post('/api/reel/generate-code', { idea });
      generatedCode = data.code;
      setCode(generatedCode);
      setProgress(25);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setStage('error');
      return;
    }

    // ── Step 2: submit render job (returns immediately with jobId) ───────
    setStage('queued');
    let jobId;
    try {
      const { data } = await axios.post('/api/reel/render', { code: generatedCode });
      jobId = data.jobId;
      setProgress(30);
      setStage('rendering');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setStage('error');
      return;
    }

    // ── Step 3: poll /status every 3 s until done ───────────────────────
    pollStatus(jobId);
  };

  const reset = () => {
    stopPolling();
    setStage('idle');
    setProgress(0);
    setCode('');
    setVideoUrl('');
    setError('');
  };

  const meta    = STAGE_META[stage] || STAGE_META.idle;
  const pct     = meta.pct !== null ? meta.pct : progress;
  const busy    = stage === 'gen_code' || stage === 'queued' || stage === 'rendering';

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">

      {/* ── Idea input ───────────────────────────────────────────────── */}
      <div className="space-y-3">
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          disabled={busy}
          placeholder="Describe the math concept to animate…"
          rows={3}
          className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-5 py-4 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-pink-500 transition-colors text-[15px] leading-relaxed"
        />

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={() => setShowEx((v) => !v)}
            className="text-sm text-gray-600 hover:text-gray-400 transition-colors underline underline-offset-2"
          >
            {showEx ? 'Hide' : 'Show'} examples
          </button>

          <div className="flex gap-2">
            {(stage === 'done' || stage === 'error') && (
              <button
                onClick={reset}
                className="px-4 py-2.5 text-sm text-gray-400 border border-gray-700 hover:border-gray-500 rounded-xl transition-colors"
              >
                ← New idea
              </button>
            )}
            <button
              onClick={run}
              disabled={!idea.trim() || busy}
              className="flex items-center gap-2 bg-pink-500 hover:bg-pink-400 text-white font-bold px-6 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {busy
                ? <><span className="inline-block animate-spin">⟳</span> {meta.label}</>
                : '▶ Generate Reel'}
            </button>
          </div>
        </div>

        {showEx && (
          <div className="space-y-2">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => { setIdea(ex); setShowEx(false); }}
                className="w-full text-left text-sm bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl px-4 py-3 text-gray-400 hover:text-gray-200 transition-all"
              >
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Progress bar (shown while working) ──────────────────────── */}
      {busy && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{meta.label}</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          {stage === 'rendering' && (
            <p className="text-xs text-gray-600 text-center">
              Manim is rendering your video — usually 60–120 s
            </p>
          )}
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────────────── */}
      {stage === 'error' && error && (
        <div className="bg-red-900/20 border border-red-700/40 rounded-2xl p-4 space-y-1">
          <p className="text-sm font-semibold text-red-400">Render failed</p>
          <pre className="text-xs text-red-300/70 whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">
            {error}
          </pre>
        </div>
      )}

      {/* ── Generated code viewer ────────────────────────────────────── */}
      {code && (
        <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
          <button
            onClick={() => setShowCode((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="text-pink-400">⌨</span>
              Generated Manim code
              {stage === 'rendering' && (
                <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                  rendering…
                </span>
              )}
            </span>
            <span className="text-xs">{showCode ? '▲ Hide' : '▼ Show'}</span>
          </button>
          {showCode && (
            <pre className="px-5 pb-5 text-xs text-green-300/80 font-mono leading-relaxed overflow-x-auto max-h-80 overflow-y-auto border-t border-gray-800 pt-4">
              {code}
            </pre>
          )}
        </div>
      )}

      {/* ── Video player ─────────────────────────────────────────────── */}
      {stage === 'done' && videoUrl && (
        <VideoPlayer url={videoUrl} />
      )}
    </div>
  );
}
