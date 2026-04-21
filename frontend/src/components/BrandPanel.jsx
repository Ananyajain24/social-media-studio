import React from 'react';
import useStudioStore from '../store/studioStore';
import { TEMPLATES } from '../utils/brand';

export default function BrandPanel() {
  const { script, selectedTemplate, setTemplate } = useStudioStore();

  if (!script) return null;

  return (
    <div className="bg-gray-900 rounded-2xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-white">Theme</h3>

      <div className="space-y-2">
        {Object.values(TEMPLATES).map((t) => {
          const active = selectedTemplate === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                active
                  ? 'border-brand-yellow bg-brand-yellow/5'
                  : 'border-gray-800 hover:border-gray-600'
              }`}
            >
              {/* Colour swatches */}
              <div className="flex gap-1 flex-shrink-0">
                {[t.bg, t.accent, t.text].map((c, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full ring-1 ring-white/10"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <span className={`text-sm font-medium ${active ? 'text-brand-yellow' : 'text-gray-300'}`}>
                {t.name}
              </span>
              {active && (
                <span className="ml-auto text-brand-yellow text-xs font-semibold">✓</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="border-t border-gray-800 pt-3 flex items-center justify-between text-xs text-gray-600">
        <span>Font: <span className="text-gray-500">Poppins</span></span>
        <span>Brand: <span className="text-gray-500">Cuemath</span></span>
      </div>
    </div>
  );
}
