import React, { useState } from 'react';
import useStudioStore from '../store/studioStore';

const EXAMPLES = [
  'Carousel for parents about why kids forget what they learn — explain forgetting curve — end with spaced repetition',
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
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-white tracking-tight mb-2">
          Creative Studio
          <span className="text-brand-yellow ml-2">✦</span>
        </h1>
        <p className="text-gray-400">
          Rough idea → polished Instagram carousel in seconds
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your carousel idea in plain English... (topic, audience, key message)"
            rows={4}
            disabled={isGenerating}
            className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-5 py-4 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-brand-yellow transition-colors text-[15px] leading-relaxed"
          />
          <span className="absolute bottom-3 right-4 text-xs text-gray-700">
            {idea.length}
          </span>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setShowExamples((v) => !v)}
            className="text-sm text-gray-600 hover:text-gray-400 transition-colors underline underline-offset-2"
          >
            {showExamples ? 'Hide' : 'Show'} example prompts
          </button>
          <button
            type="submit"
            disabled={!idea.trim() || isGenerating}
            className="flex items-center gap-2 bg-brand-yellow text-black font-bold px-7 py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            {isGenerating ? (
              <>
                <span className="inline-block animate-spin">⟳</span>
                Generating…
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
                className="w-full text-left text-sm bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl px-4 py-3 text-gray-400 hover:text-gray-200 transition-all"
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
