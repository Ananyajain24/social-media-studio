import React, { useRef, useState } from 'react';
import IdeaInput       from './components/IdeaInput';
import CarouselPreview  from './components/CarouselPreview';
import SlideEditor      from './components/SlideEditor';
import BrandPanel       from './components/BrandPanel';
import ExportPanel      from './components/ExportPanel';
import ReelGenerator    from './components/ReelGenerator';
import StoryGenerator   from './components/StoryGenerator';
import useStudioStore   from './store/studioStore';

const TABS = [
  { id: 'carousel', label: 'Carousel', icon: '▦', active: 'bg-brand-yellow text-black' },
  { id: 'story',    label: 'Story',    icon: '◉', active: 'bg-purple-500 text-white'  },
  { id: 'reel',     label: 'Reel',     icon: '▶', active: 'bg-pink-500 text-white'    },
];

// ── Carousel ──────────────────────────────────────────────────────────────────
function CarouselWorkspace() {
  const { script, isGenerating } = useStudioStore();
  const slideRefs = useRef([]);

  return (
    <div className="space-y-10">
      <IdeaInput />

      {isGenerating && (
        <div className="flex gap-4 overflow-hidden w-full">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-[300px] h-[300px] rounded-2xl bg-gray-800 flex-shrink-0 animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      )}

      {script && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 items-start">
          <div className="min-w-0 overflow-hidden">
            <CarouselPreview slideRefs={slideRefs} />
          </div>
          <div className="space-y-4">
            <SlideEditor />
            <BrandPanel />
            <ExportPanel slideRefs={slideRefs} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Story ─────────────────────────────────────────────────────────────────────
function StoryWorkspace() {
  return <StoryGenerator />;
}

// ── Reel ──────────────────────────────────────────────────────────────────────
function ReelWorkspace() {
  return <ReelGenerator />;
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('carousel');

  return (
    <div className="min-h-screen bg-gray-950">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="border-b border-gray-800/60 sticky top-0 z-20 bg-gray-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-6">

          {/* Brand */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <span className="text-brand-yellow font-black text-xl leading-none">✦</span>
            <div className="flex items-baseline gap-2">
              <span className="font-black text-white text-base tracking-tight">Creative Studio</span>
              <span className="text-gray-600 text-sm hidden md:inline">by Cuemath</span>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex bg-gray-900 border border-gray-800 p-1 rounded-2xl gap-1">
            {TABS.map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    active ? t.active : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        {activeTab === 'carousel' && <CarouselWorkspace />}
        {activeTab === 'story'    && <StoryWorkspace   />}
        {activeTab === 'reel'     && <ReelWorkspace    />}
      </main>
    </div>
  );
}
