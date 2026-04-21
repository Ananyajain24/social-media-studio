import React, { useRef } from 'react';
import IdeaInput from './components/IdeaInput';
import CarouselPreview from './components/CarouselPreview';
import SlideEditor from './components/SlideEditor';
import BrandPanel from './components/BrandPanel';
import ExportPanel from './components/ExportPanel';
import useStudioStore from './store/studioStore';

export default function App() {
  const { script, isGenerating } = useStudioStore();
  const slideRefs = useRef([]);

  return (
    <div className="min-h-screen bg-gray-950 font-poppins">
      {/* Header */}
      <header className="border-b border-gray-900 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-brand-yellow text-lg font-black">✦</span>
            <span className="font-bold text-white text-sm">Creative Studio</span>
            <span className="text-gray-700 text-xs ml-1">by Cuemath</span>
          </div>
          <span className="text-xs text-gray-700 hidden sm:block">
            Idea → Carousel in seconds
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Idea input */}
        <IdeaInput />

        {/* Loading skeleton */}
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

        {/* Studio workspace */}
        {script && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-8 items-start">
            {/* Carousel preview */}
            <CarouselPreview slideRefs={slideRefs} />

            {/* Right sidebar */}
            <div className="space-y-4">
              <SlideEditor />
              <BrandPanel />
              <ExportPanel slideRefs={slideRefs} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
