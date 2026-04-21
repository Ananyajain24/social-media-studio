import React from 'react';
import useStudioStore from '../store/studioStore';

const FORMATS = [
  {
    id: 'carousel',
    label: 'Carousel',
    icon: '▦',
    desc: '1:1 · 5 slides · swipeable',
    color: 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10'
  },
  {
    id: 'reel',
    label: 'Reel',
    icon: '▶',
    desc: '9:16 · 6 scenes · video-ready',
    color: 'text-pink-400 border-pink-400/50 bg-pink-400/10'
  },
  {
    id: 'story',
    label: 'Story',
    icon: '◉',
    desc: '9:16 · 1 frame · standalone',
    color: 'text-purple-400 border-purple-400/50 bg-purple-400/10'
  }
];

export default function FormatSelector() {
  const { format, setFormat, isGenerating } = useStudioStore();

  return (
    <div className="flex gap-3 justify-center flex-wrap">
      {FORMATS.map((f) => {
        const active = format === f.id;
        return (
          <button
            key={f.id}
            onClick={() => setFormat(f.id)}
            disabled={isGenerating}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all disabled:opacity-50 ${
              active ? f.color + ' font-semibold' : 'border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
            }`}
          >
            <span className="text-base leading-none">{f.icon}</span>
            <div className="text-left">
              <div className="text-sm leading-tight">{f.label}</div>
              <div className={`text-[10px] leading-tight ${active ? 'opacity-70' : 'text-gray-600'}`}>
                {f.desc}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
