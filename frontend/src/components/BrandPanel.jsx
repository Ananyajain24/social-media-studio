import React from 'react';
import useStudioStore from '../store/studioStore';
import { TEMPLATES } from '../utils/brand';

const DARK_PALETTES  = Object.values(TEMPLATES).filter((t) => t.group === 'dark');
const LIGHT_PALETTES = Object.values(TEMPLATES).filter((t) => t.group === 'light');

// ── Palette swatch button ─────────────────────────────────────────────────────
function Swatch({ palette, active, onSelect }) {
  return (
    <button
      onClick={() => onSelect(palette.id)}
      title={palette.name}
      className={`relative group flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
        active
          ? 'border-white/30 bg-white/5 scale-105'
          : 'border-gray-800 hover:border-gray-600 hover:bg-gray-800/40'
      }`}
    >
      {/* Colour ring: bg + accent */}
      <div className="relative w-10 h-10 rounded-full ring-2 ring-white/10"
           style={{ background: palette.bg }}>
        {/* Accent half-circle overlay */}
        <div
          className="absolute bottom-0 right-0 w-5 h-5 rounded-full ring-1 ring-white/20"
          style={{ background: palette.accent }}
        />
        {active && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xs font-black drop-shadow">✓</span>
          </div>
        )}
      </div>

      <span className={`text-[10px] font-medium leading-tight text-center ${
        active ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
      }`}>
        {palette.name}
      </span>
    </button>
  );
}

// ── Brand panel ───────────────────────────────────────────────────────────────
export default function BrandPanel() {
  const { script, selectedTemplate, setTemplate } = useStudioStore();

  if (!script) return null;

  const current = TEMPLATES[selectedTemplate] || TEMPLATES.bold_dark;

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-white">Theme & Palette</h3>
        {/* Active palette preview strip */}
        <div className="flex gap-1">
          {[current.bg, current.accent, current.subtext].map((c, i) => (
            <div key={i} className="w-3 h-3 rounded-full ring-1 ring-white/10"
                 style={{ background: c }} />
          ))}
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">

        {/* Dark palettes */}
        <div>
          <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Dark</p>
          <div className="flex gap-2 flex-wrap">
            {DARK_PALETTES.map((p) => (
              <Swatch
                key={p.id}
                palette={p}
                active={selectedTemplate === p.id}
                onSelect={setTemplate}
              />
            ))}
          </div>
        </div>

        {/* Light palettes */}
        <div>
          <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Light</p>
          <div className="flex gap-2 flex-wrap">
            {LIGHT_PALETTES.map((p) => (
              <Swatch
                key={p.id}
                palette={p}
                active={selectedTemplate === p.id}
                onSelect={setTemplate}
              />
            ))}
          </div>
        </div>

        {/* Active palette detail */}
        <div className="rounded-xl overflow-hidden border border-gray-800 mt-1">
          <div className="h-8 w-full" style={{ background: current.gradient }} />
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">{current.name}</span>
            <div className="flex gap-2 items-center">
              <span className="text-[10px] text-gray-600">accent</span>
              <div className="w-4 h-4 rounded-full ring-1 ring-white/20"
                   style={{ background: current.accent }} />
            </div>
          </div>
        </div>

        <p className="text-[11px] text-gray-700 text-center">
          Font: <span className="text-gray-500">Poppins</span>
          {' · '}
          Brand: <span className="text-gray-500">Cuemath</span>
        </p>
      </div>
    </div>
  );
}
