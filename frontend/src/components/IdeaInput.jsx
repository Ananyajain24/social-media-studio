import React, { useState } from 'react';
import useStudioStore from '../store/studioStore';

const EXAMPLES = [
  'Carousel for parents about why kids forget what they learn — explain the forgetting curve — end with spaced repetition',
  'Why math anxiety happens and 3 ways parents can help their child overcome it at home',
  'The difference between memorising formulas and actually understanding math — and why it matters for exams'
];

export default function IdeaInput() {
  const { idea, setIdea, generateScript, isGenerating, error, clearError } = useStudioStore();
  const [showExamples, setShowExamples] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    clearError();
    generateScript();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10 pt-6">
        <h1 className="text-5xl font-black text-white tracking-tight mb-3">
          Creative Studio
          <span className="text-brand-yellow ml-3">✦</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Describe your idea — get a polished carousel ready to post
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="What do you want to teach today? Describe the topic, who it's for, and the key message…"
            rows={5}
            disabled={isGenerating}
            className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-6 py-5 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-brand-yellow transition-colors text-base leading-relaxed"
          />
          <span className="absolute bottom-4 right-5 text-xs text-gray-700 select-none">
            {idea.length}
          </span>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-5 py-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setShowExamples((v) => !v)}
            className="text-sm text-gray-600 hover:text-gray-400 transition-colors underline underline-offset-4"
          >
            {showExamples ? 'Hide examples' : 'Show me examples'}
          </button>
          <button
            type="submit"
            disabled={!idea.trim() || isGenerating}
            className="flex items-center gap-2 bg-brand-yellow text-black font-bold px-8 py-3.5 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-base"
          >
            {isGenerating ? (
              <>
                <span className="inline-block animate-spin">⟳</span>
                Creating…
              </>
            ) : (
              <>✦ Generate Carousel</>
            )}
          </button>
        </div>

        {showExamples && (
          <div className="space-y-2 pt-1">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setIdea(ex); setShowExamples(false); }}
                className="w-full text-left text-sm bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl px-5 py-4 text-gray-400 hover:text-gray-200 transition-all leading-relaxed"
              >
                {ex}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
