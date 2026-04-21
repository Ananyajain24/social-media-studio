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
  idle:      { label: '',                       pct: 0    },
  gen_code:  { label: 'Designing your video…',  pct: 25   },
  queued:    { label: 'Starting render…',       pct: 30   },
  rendering: { label: 'Rendering animation…',   pct: null },
  done:      { label: 'Done!',                  pct: 100  },
  error:     { label: '',                       pct: 0    }
};

export default function ReelGenerator() {
  const [idea,          setIdea]          = useState('');
  const [stage,         setStage]         = useState('idle');
  const [progress,      setProgress]      = useState(0);
  const [code,          setCode]          = useState('');
  const [videoUrl,      setVideoUrl]      = useState('');
  const [error,         setError]         = useState('');
  const [showEx,        setShowEx]        = useState(false);
  const [voiceStage,    setVoiceStage]    = useState('idle');
  const [audioUrl,      setAudioUrl]      = useState('');
  const [narrationText, setNarrationText] = useState('');
  const [voiceError,    setVoiceError]    = useState('');
  const [showNarration, setShowNarration] = useState(false);
  const [exportStage,   setExportStage]   = useState('idle');
  const [mergedUrl,     setMergedUrl]     = useState('');
  const [exportError,   setExportError]   = useState('');
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
          stopPolling(); setVideoUrl(data.videoUrl); setStage('done');
        } else if (data.status === 'error') {
          stopPolling(); setError(data.error); setStage('error');
        }
      } catch { /* network blip */ }
    }, 3000);
  };

  const run = async () => {
    if (!idea.trim()) return;
    stopPolling();
    setStage('gen_code'); setProgress(10); setError('');
    setCode(''); setVideoUrl('');
    setVoiceStage('idle'); setAudioUrl(''); setNarrationText(''); setVoiceError('');
    setExportStage('idle'); setMergedUrl(''); setExportError('');

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

    pollStatus(jobId);
  };

  const reset = () => {
    stopPolling();
    setStage('idle'); setProgress(0); setCode(''); setVideoUrl(''); setError('');
    setVoiceStage('idle'); setAudioUrl(''); setNarrationText(''); setVoiceError('');
    setExportStage('idle'); setMergedUrl(''); setExportError('');
  };

  const generateVoiceover = async () => {
    setVoiceStage('loading'); setVoiceError('');
    setExportStage('idle'); setMergedUrl('');
    try {
      const { data } = await axios.post('/api/reel/voiceover', { code });
      setAudioUrl(data.audioUrl);
      setNarrationText(data.narrationText);
      setVoiceStage('done');
    } catch (err) {
      setVoiceError(err.response?.data?.error || err.message);
      setVoiceStage('error');
    }
  };

  const basename = (url) => url.split('/').pop();

  const exportFinal = async () => {
    setExportStage('merging'); setExportError('');
    try {
      const { data } = await axios.post('/api/reel/export', {
        videoFilename: basename(videoUrl),
        audioFilename: basename(audioUrl),
      });
      setMergedUrl(data.mergedUrl);
      setExportStage('done');
    } catch (err) {
      setExportError(err.response?.data?.error || err.message);
      setExportStage('error');
    }
  };

  const meta = STAGE_META[stage] || STAGE_META.idle;
  const pct  = meta.pct !== null ? meta.pct : progress;
  const busy = stage === 'gen_code' || stage === 'queued' || stage === 'rendering';

  return (
    <div className="w-full space-y-8">

      {/* ── Hero + input ──────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto">

        {stage === 'idle' && (
          <div className="text-center mb-10 pt-6">
            <h2 className="text-5xl font-black text-white tracking-tight mb-3">
              Reel Creator
              <span className="text-pink-400 ml-3">▶</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Describe a concept — get a beautiful animated video with narration
            </p>
          </div>
        )}

        <div className="space-y-4">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            disabled={busy}
            placeholder="What concept do you want to animate? (e.g. Pythagorean theorem, compound interest…)"
            rows={5}
            className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-6 py-5 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-pink-500 transition-colors text-base leading-relaxed"
          />

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <button
              onClick={() => setShowEx((v) => !v)}
              className="text-sm text-gray-600 hover:text-gray-400 transition-colors underline underline-offset-4"
            >
              {showEx ? 'Hide examples' : 'Show me examples'}
            </button>

            <div className="flex gap-3">
              {(stage === 'done' || stage === 'error') && (
                <button
                  onClick={reset}
                  className="px-5 py-3 text-sm text-gray-400 border border-gray-700 hover:border-gray-500 rounded-xl transition-colors"
                >
                  ← Start over
                </button>
              )}
              <button
                onClick={run}
                disabled={!idea.trim() || busy}
                className="flex items-center gap-2 bg-pink-500 hover:bg-pink-400 text-white font-bold px-8 py-3.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-base"
              >
                {busy
                  ? <><span className="inline-block animate-spin">⟳</span> {meta.label}</>
                  : '▶ Create Video'}
              </button>
            </div>
          </div>

          {showEx && (
            <div className="space-y-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => { setIdea(ex); setShowEx(false); }}
                  className="w-full text-left text-sm bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl px-5 py-4 text-gray-400 hover:text-gray-200 transition-all leading-relaxed"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Progress ──────────────────────────────────────────────────── */}
      {busy && (
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <span>{meta.label}</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          {stage === 'rendering' && (
            <p className="text-sm text-gray-600 text-center">
              This usually takes 1–2 minutes
            </p>
          )}
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────── */}
      {stage === 'error' && error && (
        <div className="max-w-3xl mx-auto bg-red-900/20 border border-red-700/40 rounded-2xl p-5">
          <p className="text-base font-semibold text-red-400 mb-1">Something went wrong</p>
          <p className="text-sm text-red-300/70 leading-relaxed">{error}</p>
        </div>
      )}

      {/* ── Video + Narration + Export ─────────────────────────────────── */}
      {stage === 'done' && (
        <div className="max-w-3xl mx-auto space-y-5">

          {videoUrl && <VideoPlayer url={videoUrl} />}

          {/* Narration card */}
          {code && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-white">Add Narration</p>
                  <p className="text-sm text-gray-500 mt-0.5">AI voice, synced to your video</p>
                </div>
                {voiceStage === 'idle' && (
                  <button onClick={generateVoiceover}
                    className="flex-shrink-0 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
                    Generate Narration
                  </button>
                )}
                {voiceStage === 'loading' && (
                  <span className="flex-shrink-0 text-sm text-purple-400 flex items-center gap-2">
                    <span className="inline-block animate-spin">⟳</span> Writing script…
                  </span>
                )}
                {voiceStage === 'done' && (
                  <button onClick={generateVoiceover}
                    className="flex-shrink-0 text-sm text-gray-500 border border-gray-700 hover:border-gray-500 hover:text-gray-300 px-4 py-2 rounded-xl transition-colors">
                    ↺ Redo
                  </button>
                )}
                {voiceStage === 'error' && (
                  <button onClick={generateVoiceover}
                    className="flex-shrink-0 text-sm text-red-400 border border-red-700/50 px-4 py-2 rounded-xl transition-colors">
                    ↺ Retry
                  </button>
                )}
              </div>

              {voiceStage === 'error' && voiceError && (
                <div className="px-6 pb-5 border-t border-gray-800 pt-4">
                  <p className="text-sm text-red-400">{voiceError}</p>
                </div>
              )}

              {voiceStage === 'done' && audioUrl && (
                <div className="px-6 pb-6 border-t border-gray-800 pt-5 space-y-4">
                  <audio key={audioUrl} controls src={audioUrl} className="w-full"
                    style={{ colorScheme: 'dark', accentColor: '#a855f7' }} />
                  <div className="flex items-center justify-between">
                    <button onClick={() => setShowNarration((v) => !v)}
                      className="text-sm text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2">
                      {showNarration ? 'Hide' : 'Read'} narration script
                    </button>
                    <a href={audioUrl} download
                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                      ↓ Download audio
                    </a>
                  </div>
                  {showNarration && narrationText && (
                    <p className="text-sm text-gray-400 leading-relaxed bg-gray-800/50 rounded-xl px-5 py-4 whitespace-pre-wrap">
                      {narrationText}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Export card */}
          {voiceStage === 'done' && (
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700/40 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-white">Export Final Reel</p>
                  <p className="text-sm text-gray-500 mt-0.5">Narration + video combined in one file</p>
                </div>
                {exportStage === 'idle' && (
                  <button onClick={exportFinal}
                    className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all">
                    ↓ Export MP4
                  </button>
                )}
                {exportStage === 'merging' && (
                  <span className="flex-shrink-0 text-sm text-purple-300 flex items-center gap-2">
                    <span className="inline-block animate-spin">⟳</span> Merging…
                  </span>
                )}
                {exportStage === 'done' && mergedUrl && (
                  <a href={mergedUrl} download
                    className="flex-shrink-0 bg-green-700 hover:bg-green-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors">
                    ↓ Download Reel
                  </a>
                )}
                {exportStage === 'error' && (
                  <button onClick={exportFinal}
                    className="flex-shrink-0 text-sm text-red-400 border border-red-700/50 px-4 py-2 rounded-xl">
                    ↺ Retry
                  </button>
                )}
              </div>

              {exportStage === 'error' && exportError && (
                <div className="px-6 pb-5 border-t border-purple-800/30 pt-4">
                  <p className="text-sm text-red-400">{exportError}</p>
                </div>
              )}

              {exportStage === 'done' && mergedUrl && (
                <div className="px-6 pb-6 border-t border-purple-800/30 pt-4">
                  <video key={mergedUrl} controls src={mergedUrl} className="w-full rounded-xl"
                    style={{ maxHeight: '420px' }} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
