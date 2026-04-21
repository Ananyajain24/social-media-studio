import React, { useState, useRef, useCallback } from 'react';
import useStudioStore from '../store/studioStore';
import { ROLE_CONFIG } from '../utils/brand';

// ── Inline editable field ─────────────────────────────────────────────────────
// Shows plain text at rest; click → becomes input/textarea.
function EditableField({ label, value, onChange, multiline = false }) {
  const [editing, setEditing] = useState(false);

  const start = () => setEditing(true);
  const stop  = () => setEditing(false);

  const sharedClass =
    'w-full text-sm text-white bg-transparent transition-all duration-100';
  const inputClass =
    'bg-gray-800 border border-brand-yellow rounded-lg px-3 py-2 focus:outline-none resize-none';
  const viewClass =
    'min-h-[32px] px-3 py-2 rounded-lg cursor-text hover:bg-gray-800/60 border border-transparent hover:border-gray-700';

  return (
    <div className="group space-y-0.5">
      <div className="flex items-center justify-between h-4">
        <span className="text-[10px] text-gray-600 uppercase tracking-wide font-semibold">
          {label}
        </span>
        {!editing && (
          <span className="text-[10px] text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity select-none">
            click to edit
          </span>
        )}
      </div>

      {editing ? (
        multiline ? (
          <textarea
            autoFocus
            rows={3}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={stop}
            className={`${sharedClass} ${inputClass}`}
          />
        ) : (
          <input
            autoFocus
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={stop}
            onKeyDown={(e) => e.key === 'Enter' && stop()}
            className={`${sharedClass} ${inputClass}`}
          />
        )
      ) : (
        <div onClick={start} className={`${sharedClass} ${viewClass}`}>
          {value || (
            <span className="text-gray-600 italic text-xs">Empty — click to add</span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Slide editor panel ────────────────────────────────────────────────────────
export default function SlideEditor() {
  const {
    script, activeSlideIndex,
    updateSlide, regenerateSlide, isRegenerating
  } = useStudioStore();

  const [regenOpen, setRegenOpen]       = useState(false);
  const [instruction, setInstruction]   = useState('');

  const handleRegen = useCallback(() => {
    regenerateSlide(activeSlideIndex, instruction);
    setInstruction('');
    setRegenOpen(false);
  }, [activeSlideIndex, instruction, regenerateSlide]);

  if (!script) return null;

  const slide   = script.slides[activeSlideIndex];
  const roleCfg = ROLE_CONFIG[slide.role] || ROLE_CONFIG.hook;
  const update  = (field) => (val) => updateSlide(activeSlideIndex, field, val);

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
        <span className="text-sm font-semibold text-white">
          Slide {activeSlideIndex + 1}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${roleCfg.tw}`}>
          {roleCfg.label}
        </span>
      </div>

      {/* Editable fields */}
      <div className="px-5 py-4 space-y-3">
        <EditableField
          label="Headline"
          value={slide.headline}
          onChange={update('headline')}
        />
        <EditableField
          label="Subtext"
          value={slide.subtext}
          onChange={update('subtext')}
          multiline
        />

        {/* Emoji + visual hint side by side */}
        <div className="flex gap-3">
          <div className="w-16 group space-y-0.5">
            <span className="text-[10px] text-gray-600 uppercase tracking-wide font-semibold block h-4">
              Emoji
            </span>
            <EmojiField value={slide.emoji} onChange={update('emoji')} />
          </div>
          <div className="flex-1">
            <EditableField
              label="Visual hint"
              value={slide.visual_hint || ''}
              onChange={update('visual_hint')}
            />
          </div>
        </div>
      </div>

      {/* AI Regenerate */}
      <div className="px-5 pb-4 border-t border-gray-800 pt-3">
        {!regenOpen ? (
          <button
            onClick={() => setRegenOpen(true)}
            disabled={isRegenerating}
            className="w-full text-sm text-gray-500 hover:text-white border border-gray-800 hover:border-gray-600 rounded-lg py-2 transition-colors"
          >
            ✦ AI Regenerate This Slide
          </button>
        ) : (
          <div className="space-y-2">
            <input
              autoFocus
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRegen()}
              placeholder="Optional: make it shorter, add a stat, punchier…"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-yellow transition-colors"
            />
            <div className="flex gap-2">
              <button
                onClick={handleRegen}
                disabled={isRegenerating}
                className="flex-1 bg-brand-yellow text-black text-sm font-bold py-2 rounded-lg hover:bg-yellow-300 disabled:opacity-40 transition-colors"
              >
                {isRegenerating ? '⟳ Generating…' : '✦ Regenerate'}
              </button>
              <button
                onClick={() => { setRegenOpen(false); setInstruction(''); }}
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

// ── Emoji click-to-edit (special: large text, small input) ───────────────────
function EmojiField({ value, onChange }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
        className="w-full bg-gray-800 border border-brand-yellow rounded-lg px-2 py-1.5 text-white text-lg focus:outline-none text-center"
      />
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className="w-full min-h-[36px] flex items-center justify-center text-xl rounded-lg cursor-pointer hover:bg-gray-800/60 border border-transparent hover:border-gray-700 transition-all"
    >
      {value || <span className="text-gray-600 text-xs">+</span>}
    </div>
  );
}
