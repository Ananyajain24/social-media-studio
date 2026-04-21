import React, { useRef, useState } from 'react';
import IdeaInput from './components/IdeaInput';
import CarouselPreview from './components/CarouselPreview';
import SlideEditor from './components/SlideEditor';
import BrandPanel from './components/BrandPanel';
import ExportPanel from './components/ExportPanel';
import ReelGenerator from './components/ReelGenerator';
import useStudioStore from './store/studioStore';

const TABS = [
  { id: 'carousel', label: 'Carousel',   icon: '▦', sub: '1:1 · 5 slides'  },
  { id: 'reel',     label: 'Reel',        icon: '▶', sub: '9:16 · Manim MP4' }
];

function CarouselWorkspace() {
  const { script, isGenerating } = useStudioStore();
  const slideRefs = useRef([]);

  return (
    <div className="space-y-10">
      <IdeaInput />

      {isGenerating && (
        <div className="flex gap-4 overflow-hidden">
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
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-8 items-start">
          <CarouselPreview slideRefs={slideRefs} />
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

function ReelWorkspace() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white mb-1">
          Reel Generator
          <span className="text-pink-400 ml-2">▶</span>
        </h2>
        <p className="text-gray-500 text-sm">
          Describe a math concept → Claude writes Manim code → renders a 9:16 MP4
        </p>
      </div>
      <ReelGenerator />
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('carousel');

  return (
    <div className="min-h-screen bg-gray-950 font-poppins">
      {/* Header */}
      <header className="border-b border-gray-900 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-brand-yellow font-black text-lg">✦</span>
            <span className="font-bold text-white text-sm">Creative Studio</span>
            <span className="text-gray-700 text-xs ml-1">by Cuemath</span>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-gray-900 p-1 rounded-xl gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === t.id
                    ? t.id === 'reel'
                      ? 'bg-pink-500 text-white'
                      : 'bg-brand-yellow text-black'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
                <span className={`text-[10px] hidden sm:inline ${activeTab === t.id ? 'opacity-70' : 'opacity-0'}`}>
                  {t.sub}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {activeTab === 'carousel' ? <CarouselWorkspace /> : <ReelWorkspace />}
      </main>
    </div>
  );
}
