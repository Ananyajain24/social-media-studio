import React from 'react';
import useStudioStore from '../store/studioStore';
import ReelCard from './ReelCard';
import { ROLE_CONFIG } from '../utils/brand';

export default function ReelPreview({ slideRefs }) {
  const { script, selectedTemplate, activeSlideIndex, setActiveSlide, format } = useStudioStore();

  if (!script) return null;

  const isStory = format === 'story';
  const label = isStory ? 'Story' : 'Reel';
  const contentBadge =
    script.content_type === 'math_visualization' ? '📐 Math Visual' : '💡 Explainer';

  return (
    <div className="w-full">
      {/* Meta */}
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <h2 className="text-base font-semibold text-white leading-tight">{script.title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{script.target_audience} · {script.tone}</p>
        </div>
        <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0">
          {contentBadge} · {script.slides.length} {label === 'Story' ? 'frame' : 'scenes'}
        </span>
      </div>

      {isStory ? (
        /* Story: single large centered card */
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-3">
            <ReelCard
              ref={(el) => { if (slideRefs) slideRefs.current[0] = el; }}
              slide={script.slides[0]}
              slideCount={1}
              template={selectedTemplate}
              isActive
            />
            <span className="text-xs text-gray-500">9:16 · Story frame</span>
          </div>
        </div>
      ) : (
        /* Reel: horizontal strip + large active preview */
        <div className="space-y-6">
          {/* Large active frame */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="text-[10px] text-gray-600 uppercase tracking-wider">
                Scene {activeSlideIndex + 1} of {script.slides.length}
              </div>
              <ReelCard
                ref={(el) => { if (slideRefs) slideRefs.current[activeSlideIndex] = el; }}
                slide={script.slides[activeSlideIndex]}
                slideCount={script.slides.length}
                template={selectedTemplate}
                isActive
              />
              {/* Prev / Next */}
              <div className="flex items-center gap-4 mt-1">
                <button
                  onClick={() => setActiveSlide(Math.max(0, activeSlideIndex - 1))}
                  disabled={activeSlideIndex === 0}
                  className="text-gray-500 hover:text-white disabled:opacity-20 transition-colors text-lg"
                >
                  ←
                </button>
                <div className="flex gap-1.5">
                  {script.slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlide(i)}
                      className={`rounded-full transition-all ${
                        i === activeSlideIndex
                          ? 'w-4 h-1.5 bg-brand-yellow'
                          : 'w-1.5 h-1.5 bg-gray-700 hover:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setActiveSlide(Math.min(script.slides.length - 1, activeSlideIndex + 1))}
                  disabled={activeSlideIndex === script.slides.length - 1}
                  className="text-gray-500 hover:text-white disabled:opacity-20 transition-colors text-lg"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Thumbnail strip — hidden but ref'd for export */}
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
            {script.slides.map((slide, i) => {
              const role = ROLE_CONFIG[slide.role];
              return (
                <div key={i} className="snap-center flex-shrink-0 flex flex-col items-center gap-1.5">
                  <ReelCard
                    ref={(el) => {
                      // Non-active refs for export (active is already set above)
                      if (slideRefs && i !== activeSlideIndex) slideRefs.current[i] = el;
                    }}
                    slide={slide}
                    slideCount={script.slides.length}
                    template={selectedTemplate}
                    isActive={i === activeSlideIndex}
                    onClick={() => setActiveSlide(i)}
                  />
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${
                    i === activeSlideIndex
                      ? (role?.tw || 'text-brand-yellow bg-brand-yellow/10 border-brand-yellow/30')
                      : 'text-gray-700 border-gray-800'
                  }`}>
                    {role?.label || slide.role}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
