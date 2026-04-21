import React, { useState } from 'react';
import useStudioStore from '../store/studioStore';
import { exportSlide, exportAllSlides } from '../utils/export';

export default function ExportPanel({ slideRefs }) {
  const { script, activeSlideIndex, format } = useStudioStore();
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  if (!script) return null;

  const formatLabel = { carousel: 'Slides', reel: 'Scenes', story: 'Frame' }[format] || 'Slides';
  const dims = format === 'carousel' ? '900×900px' : '1080×1920px';

  const run = async (fn) => {
    setBusy(true);
    setStatus('Rendering…');
    try {
      await fn();
      setStatus('✓ Downloaded!');
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      setStatus('Error: ' + err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleAll = () =>
    run(() => exportAllSlides(slideRefs.current.filter(Boolean), script.title, format));

  const handleOne = () => {
    const el = slideRefs.current[activeSlideIndex];
    if (!el) return;
    const label = format === 'reel' ? 'scene' : format === 'story' ? 'story' : 'slide';
    run(() => exportSlide(el, `${label}_${activeSlideIndex + 1}.png`));
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Export</h3>
        <span className="text-xs text-gray-600">High-res PNG</span>
      </div>

      {status && (
        <p className="text-xs bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20 rounded-lg px-3 py-2">
          {status}
        </p>
      )}

      <button
        onClick={handleAll}
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 bg-brand-yellow text-black font-bold py-3 rounded-xl hover:bg-yellow-300 disabled:opacity-40 transition-colors text-sm"
      >
        {busy ? '⟳ Saving…' : `↓ Download All ${formatLabel}`}
      </button>

      {format !== 'story' && (
        <button
          onClick={handleOne}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 font-medium py-2 rounded-xl disabled:opacity-40 transition-colors text-sm"
        >
          ↓ Download {format === 'reel' ? 'Frame' : 'Slide'} {activeSlideIndex + 1} only
        </button>
      )}

      <p className="text-center text-[11px] text-gray-700">
        High-resolution · Social-ready
      </p>
    </div>
  );
}
