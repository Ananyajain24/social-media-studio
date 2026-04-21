import React, { useState } from 'react';
import useStudioStore from '../store/studioStore';
import { exportSlide, exportAllSlides } from '../utils/export';

export default function ExportPanel({ slideRefs }) {
  const { script, activeSlideIndex } = useStudioStore();
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  if (!script) return null;

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
    run(() => exportAllSlides(slideRefs.current.filter(Boolean), script.title));

  const handleOne = () => {
    const el = slideRefs.current[activeSlideIndex];
    if (!el) return;
    run(() => exportSlide(el, `slide_${activeSlideIndex + 1}.png`));
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-5 space-y-3">
      <h3 className="text-sm font-semibold text-white">Export</h3>

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
        {busy ? '⟳ Exporting…' : '↓ Export All Slides (ZIP)'}
      </button>

      <button
        onClick={handleOne}
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 font-medium py-2 rounded-xl disabled:opacity-40 transition-colors text-sm"
      >
        ↓ Export Slide {activeSlideIndex + 1} (PNG)
      </button>

      <p className="text-center text-[11px] text-gray-700">
        Square 1:1 · PNG · Social-ready
      </p>
    </div>
  );
}
