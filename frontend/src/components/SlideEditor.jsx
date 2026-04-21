import React, { useState } from 'react';
import useStudioStore from '../store/studioStore';
import { ROLE_CONFIG } from '../utils/brand';

export default function SlideEditor() {
  const { script, activeSlideIndex, updateSlide, regenerateSlide, isRegenerating } = useStudioStore();
  const [instruction, setInstruction] = useState('');
  const [regenOpen, setRegenOpen] = useState(false);

  if (!script) return null;

  const slide = script.slides[activeSlideIndex];
  const roleCfg = ROLE_CONFIG[slide.role] || ROLE_CONFIG.hook;

  const handleRegen = () => {
    regenerateSlide(activeSlideIndex, instruction);
    setInstruction('');
    setRegenOpen(false);
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          Slide {activeSlideIndex + 1}
        </h3>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${roleCfg.tw}`}>
          {roleCfg.label}
        </span>
      </div>

      {/* Headline */}
      <div>
        <label className="block text-[11px] text-gray-500 mb-1 font-medium uppercase tracking-wide">
          Headline
        </label>
        <input
          type="text"
          value={slide.headline}
          onChange={(e) => updateSlide(activeSlideIndex, 'headline', e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-yellow transition-colors"
        />
      </div>

      {/* Subtext */}
      <div>
        <label className="block text-[11px] text-gray-500 mb-1 font-medium uppercase tracking-wide">
          Subtext
        </label>
        <textarea
          value={slide.subtext}
          onChange={(e) => updateSlide(activeSlideIndex, 'subtext', e.target.value)}
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-yellow transition-colors resize-none"
        />
      </div>

      {/* Emoji */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="block text-[11px] text-gray-500 mb-1 font-medium uppercase tracking-wide">
            Emoji
          </label>
          <input
            type="text"
            value={slide.emoji || ''}
            onChange={(e) => updateSlide(activeSlideIndex, 'emoji', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-lg focus:outline-none focus:border-brand-yellow transition-colors text-center"
          />
        </div>
        {slide.visual_hint && (
          <div className="flex-[2]">
            <label className="block text-[11px] text-gray-500 mb-1 font-medium uppercase tracking-wide">
              Visual hint
            </label>
            <p className="text-xs text-gray-500 bg-gray-800 rounded-lg px-3 py-2 leading-relaxed">
              {slide.visual_hint}
            </p>
          </div>
        )}
      </div>

      {/* AI Regenerate */}
      <div className="border-t border-gray-800 pt-3">
        {!regenOpen ? (
          <button
            onClick={() => setRegenOpen(true)}
            className="w-full text-sm text-gray-500 hover:text-white border border-gray-800 hover:border-gray-600 rounded-lg py-2 transition-colors"
          >
            ✦ AI Regenerate This Slide
          </button>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Optional: make it punchier, add a stat, shorter…"
              onKeyDown={(e) => e.key === 'Enter' && handleRegen()}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-yellow transition-colors"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleRegen}
                disabled={isRegenerating}
                className="flex-1 bg-brand-yellow text-black text-sm font-bold py-2 rounded-lg hover:bg-yellow-300 disabled:opacity-50 transition-colors"
              >
                {isRegenerating ? '⟳ Generating…' : '✦ Regenerate'}
              </button>
              <button
                onClick={() => setRegenOpen(false)}
                className="px-3 text-gray-500 hover:text-gray-300 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
