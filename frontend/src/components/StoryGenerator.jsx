import React, { useRef, useState } from 'react';
import axios from 'axios';
import StoryCard from './StoryCard';
import { TEMPLATES } from '../utils/brand';
import { exportSlide } from '../utils/export';

const DARK_PALETTES  = Object.values(TEMPLATES).filter((t) => t.group === 'dark');
const LIGHT_PALETTES = Object.values(TEMPLATES).filter((t) => t.group === 'light');

const EXAMPLES = [
  'Why kids forget math homework the next day',
  'How to help your child stop fearing math tests',
  'The one habit that makes kids better at math',
  'Why understanding beats memorising in school'
];

const FIELD_META = {
  headline:    { label: 'Headline (hook)',     max: 6,  hint: 'max 6 words'  },
  explanation: { label: 'Explanation (middle)',max: 10, hint: 'max 10 words' },
  result:      { label: 'Result (badge)',       max: 8,  hint: 'max 8 words'  }
};

export default function StoryGenerator() {
  const [idea,     setIdea]     = useState('');
  const [story,    setStory]    = useState(null);
  const [template, setTemplate] = useState('bold_dark');
  const [loading,  setLoading]  = useState(false);
  const [exporting,setExporting]= useState(false);
  const [error,    setError]    = useState('');
  const [showEx,   setShowEx]   = useState(false);
  const cardRef = useRef(null);

  const generate = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    setError('');
    setStory(null);
    try {
      const { data } = await axios.post('/api/studio/generate-story', { idea });
      setStory(data.story);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setStory((s) => ({ ...s, [field]: value }));
  };

  const handleExport = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      await exportSlide(cardRef.current, 'cuemath_story.png');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* ── Input section ─────────────────────────────────────────────── */}
      <div className="max-w-xl mx-auto space-y-3">
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          disabled={loading}
          placeholder="What's your story about? (topic, emotion, key message for parents)"
          rows={3}
          className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-5 py-4 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-purple-500 transition-colors text-[15px] leading-relaxed"
        />

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setShowEx((v) => !v)}
            className="text-sm text-gray-600 hover:text-gray-400 transition-colors underline underline-offset-2"
          >
            {showEx ? 'Hide' : 'Show'} examples
          </button>
          <button
            onClick={generate}
            disabled={!idea.trim() || loading}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-400 text-white font-bold px-6 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {loading
              ? <><span className="animate-spin inline-block">⟳</span> Generating…</>
              : '◉ Generate Story'}
          </button>
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

        {error && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
      </div>

      {/* ── Studio: preview + controls ────────────────────────────────── */}
      {story && (
        <div className="grid grid-cols-1 xl:grid-cols-[auto_1fr] gap-10 items-start justify-items-center xl:justify-items-start">

          {/* Phone mock + card */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] text-gray-600 uppercase tracking-wider">Preview · 9:16</span>

            {/* Phone chrome */}
            <div className="relative bg-gray-900 rounded-[28px] border-2 border-gray-700 p-2 shadow-2xl shadow-purple-500/10">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-3.5 bg-gray-900 rounded-b-xl z-10" />
              <StoryCard ref={cardRef} story={story} template={template} />
            </div>

            <span className="text-[10px] text-gray-600">
              {story.visual_hint}
            </span>
          </div>

          {/* Controls */}
          <div className="w-full max-w-sm space-y-4">

            {/* Inline text editor */}
            <div className="bg-gray-900 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">Edit Text</h3>
              {Object.entries(FIELD_META).map(([field, meta]) => (
                <div key={field}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">
                      {meta.label}
                    </label>
                    <span className="text-[10px] text-gray-700">{meta.hint}</span>
                  </div>
                  <input
                    type="text"
                    value={story[field] || ''}
                    onChange={(e) => updateField(field, e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              ))}
            </div>

            {/* Theme */}
            <div className="bg-gray-900 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
                <h3 className="text-sm font-semibold text-white">Theme</h3>
                <div className="flex gap-1">
                  {[TEMPLATES[template]?.bg, TEMPLATES[template]?.accent, TEMPLATES[template]?.subtext]
                    .filter(Boolean)
                    .map((c, i) => (
                      <div key={i} className="w-3 h-3 rounded-full ring-1 ring-white/10"
                           style={{ background: c }} />
                    ))}
                </div>
              </div>

              <div className="px-5 py-4 space-y-3">
                {/* Dark row */}
                <div>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Dark</p>
                  <div className="flex gap-2 flex-wrap">
                    {DARK_PALETTES.map((p) => {
                      const active = template === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setTemplate(p.id)}
                          title={p.name}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                            active
                              ? 'border-white/30 bg-white/5 scale-105'
                              : 'border-gray-800 hover:border-gray-600 hover:bg-gray-800/40'
                          }`}
                        >
                          <div className="relative w-10 h-10 rounded-full ring-2 ring-white/10"
                               style={{ background: p.bg }}>
                            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full ring-1 ring-white/20"
                                 style={{ background: p.accent }} />
                            {active && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white text-xs font-black drop-shadow">✓</span>
                              </div>
                            )}
                          </div>
                          <span className={`text-[10px] font-medium ${active ? 'text-white' : 'text-gray-500'}`}>
                            {p.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Light row */}
                <div>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Light</p>
                  <div className="flex gap-2 flex-wrap">
                    {LIGHT_PALETTES.map((p) => {
                      const active = template === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setTemplate(p.id)}
                          title={p.name}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                            active
                              ? 'border-white/30 bg-white/5 scale-105'
                              : 'border-gray-800 hover:border-gray-600 hover:bg-gray-800/40'
                          }`}
                        >
                          <div className="relative w-10 h-10 rounded-full ring-2 ring-white/10"
                               style={{ background: p.bg }}>
                            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full ring-1 ring-white/20"
                                 style={{ background: p.accent }} />
                            {active && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-gray-800 text-xs font-black drop-shadow">✓</span>
                              </div>
                            )}
                          </div>
                          <span className={`text-[10px] font-medium ${active ? 'text-white' : 'text-gray-500'}`}>
                            {p.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active preview strip */}
                <div className="rounded-xl overflow-hidden border border-gray-800">
                  <div className="h-6 w-full" style={{ background: TEMPLATES[template]?.gradient }} />
                </div>
              </div>
            </div>

            {/* Export */}
            <div className="bg-gray-900 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Export</h3>
                <span className="text-[10px] text-gray-600">1080×1920px · PNG</span>
              </div>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-400 text-white font-bold py-3 rounded-xl disabled:opacity-40 transition-colors text-sm"
              >
                {exporting ? '⟳ Exporting…' : '↓ Download Story (PNG)'}
              </button>
              <p className="text-center text-[11px] text-gray-700">
                9:16 vertical · Social-ready
              </p>
            </div>

            {/* Regenerate */}
            <button
              onClick={generate}
              disabled={loading}
              className="w-full text-sm text-gray-500 hover:text-white border border-gray-800 hover:border-gray-600 py-2.5 rounded-xl transition-colors"
            >
              ✦ Regenerate Story
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
