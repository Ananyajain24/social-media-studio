import React from 'react';
import useStudioStore from '../store/studioStore';
import SlideCard from './SlideCard';
import { ROLE_CONFIG } from '../utils/brand';

export default function CarouselPreview({ slideRefs }) {
  const { script, selectedTemplate, activeSlideIndex, setActiveSlide } = useStudioStore();

  if (!script) return null;

  const contentBadge =
    script.content_type === 'math_visualization' ? '📐 Math Visual' : '💡 Explainer';

  return (
    <div className="w-full">
      {/* Meta row */}
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <h2 className="text-base font-semibold text-white leading-tight">{script.title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {script.target_audience} · {script.tone}
          </p>
        </div>
        <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0">
          {contentBadge} · {script.slides.length} slides
        </span>
      </div>

      {/* Slide strip — horizontal scroll */}
      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
        {script.slides.map((slide, i) => {
          const role = ROLE_CONFIG[slide.role];
          return (
            <div key={i} className="snap-center flex-shrink-0 flex flex-col items-center gap-2">
              <SlideCard
                ref={(el) => { if (slideRefs) slideRefs.current[i] = el; }}
                slide={slide}
                slideCount={script.slides.length}
                template={selectedTemplate}
                isActive={i === activeSlideIndex}
                onClick={() => setActiveSlide(i)}
              />
              {/* Role chip below slide */}
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                i === activeSlideIndex
                  ? (role?.tw || 'text-brand-yellow bg-brand-yellow/10 border-brand-yellow/30')
                  : 'text-gray-600 bg-transparent border-gray-800'
              }`}>
                {role?.label || slide.role}
              </span>
            </div>
          );
        })}
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {script.slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveSlide(i)}
            className={`rounded-full transition-all ${
              i === activeSlideIndex
                ? 'w-5 h-1.5 bg-brand-yellow'
                : 'w-1.5 h-1.5 bg-gray-700 hover:bg-gray-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
