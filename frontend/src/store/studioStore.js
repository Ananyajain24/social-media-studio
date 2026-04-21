import { create } from 'zustand';
import axios from 'axios';

const useStudioStore = create((set, get) => ({
  idea: '',
  script: null,
  selectedTemplate: 'bold_dark',
  activeSlideIndex: 0,
  isGenerating: false,
  isRegenerating: false,
  error: null,

  setIdea: (idea) => set({ idea }),
  setActiveSlide: (index) => set({ activeSlideIndex: index }),
  setTemplate: (template) => set({ selectedTemplate: template }),
  clearError: () => set({ error: null }),

  generateScript: async () => {
    const { idea } = get();
    if (!idea.trim()) return;
    set({ isGenerating: true, error: null, script: null, activeSlideIndex: 0 });

    try {
      const { data } = await axios.post('/api/studio/generate', { idea });
      set({
        script: data.script,
        selectedTemplate: data.script.theme_suggestion || 'bold_dark',
        isGenerating: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.error || err.message,
        isGenerating: false
      });
    }
  },

  updateSlide: (index, field, value) => {
    const { script } = get();
    if (!script) return;
    const slides = script.slides.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    set({ script: { ...script, slides } });
  },

  regenerateSlide: async (index, instruction = '') => {
    const { script } = get();
    if (!script) return;
    set({ isRegenerating: true, error: null });

    try {
      const { data } = await axios.post('/api/studio/regenerate-slide', {
        script,
        slideIndex: index,
        instruction
      });
      const slides = script.slides.map((s, i) =>
        i === index ? { ...s, ...data.slide } : s
      );
      set({ script: { ...script, slides }, isRegenerating: false });
    } catch (err) {
      set({
        error: err.response?.data?.error || err.message,
        isRegenerating: false
      });
    }
  }
}));

export default useStudioStore;
