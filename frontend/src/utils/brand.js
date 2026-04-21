export const TEMPLATES = {
  bold_dark: {
    id: 'bold_dark',
    name: 'Bold Dark',
    bg: '#1A1A2E',
    bgSecondary: '#16213E',
    accent: '#FFCC00',
    text: '#FFFFFF',
    subtext: '#A8B2C8',
    badge: '#FFCC00',
    badgeText: '#1A1A2E',
    slideNumColor: '#FFCC00',
    gradient: 'linear-gradient(145deg, #1A1A2E 0%, #16213E 50%, #0F1A30 100%)'
  },
  clean_light: {
    id: 'clean_light',
    name: 'Clean Light',
    bg: '#FFFFFF',
    bgSecondary: '#F5F3FF',
    accent: '#4F46E5',
    text: '#111827',
    subtext: '#6B7280',
    badge: '#4F46E5',
    badgeText: '#FFFFFF',
    slideNumColor: '#4F46E5',
    gradient: 'linear-gradient(145deg, #FFFFFF 0%, #F0EEFF 100%)'
  }
};

export const ROLE_CONFIG = {
  hook:        { label: 'Hook',        glow: '#FFCC00', tw: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
  problem:     { label: 'Problem',     glow: '#EF4444', tw: 'text-red-400    bg-red-400/10    border-red-400/30'    },
  stat:        { label: 'Stat',        glow: '#3B82F6', tw: 'text-blue-400   bg-blue-400/10   border-blue-400/30'   },
  explanation: { label: 'Explanation', glow: '#3B82F6', tw: 'text-blue-400   bg-blue-400/10   border-blue-400/30'   },
  solution:    { label: 'Solution',    glow: '#22C55E', tw: 'text-green-400  bg-green-400/10  border-green-400/30'  },
  cta:         { label: 'CTA',         glow: '#A855F7', tw: 'text-purple-400 bg-purple-400/10 border-purple-400/30' }
};

export const ROLE_GLOWS = {
  hook:        ['#FFCC00', '#FF8C00'],
  problem:     ['#FF4B4B', '#FF8C00'],
  stat:        ['#4B9EFF', '#00C9FF'],
  explanation: ['#4B9EFF', '#7B4BFF'],
  solution:    ['#4BFF8C', '#00C9A7'],
  cta:         ['#CC4BFF', '#4B9EFF']
};

// Dynamic gradient backgrounds keyed on visual_hint keywords
const HINT_GRADIENTS = [
  { keys: ['graph', 'plot', 'chart'],       grad: 'linear-gradient(160deg,#0D1117 0%,#1a1a3e 100%)', accent: '#4B9EFF' },
  { keys: ['equation', 'formula', 'algebra'], grad: 'linear-gradient(160deg,#0F0C29 0%,#302b63 100%)', accent: '#A78BFA' },
  { keys: ['geometry', 'shape', 'triangle'], grad: 'linear-gradient(160deg,#0a1628 0%,#1e3a5f 100%)', accent: '#38BDF8' },
  { keys: ['fraction', 'ratio', 'division'], grad: 'linear-gradient(160deg,#1a0a2e 0%,#3d1a5f 100%)', accent: '#C084FC' },
  { keys: ['memory', 'forget', 'brain'],    grad: 'linear-gradient(160deg,#0c0c1e 0%,#2d1b4e 100%)', accent: '#818CF8' },
  { keys: ['anxiety', 'fear', 'stress'],    grad: 'linear-gradient(160deg,#1c0a0a 0%,#3d1515 100%)', accent: '#F87171' },
  { keys: ['parent', 'family', 'home'],     grad: 'linear-gradient(160deg,#0a1e1e 0%,#1a3a3a 100%)', accent: '#34D399' },
  { keys: ['learn', 'study', 'practice'],   grad: 'linear-gradient(160deg,#0a1628 0%,#1e3a5f 100%)', accent: '#60A5FA' },
  { keys: ['success', 'improve', 'growth'], grad: 'linear-gradient(160deg,#064e3b 0%,#1a1a2e 100%)', accent: '#6EE7B7' },
  { keys: ['number', 'count', 'arithmetic'], grad: 'linear-gradient(160deg,#1a1a0a 0%,#3d3d1a 100%)', accent: '#FBBF24' }
];

const DEFAULT_HINT = { grad: 'linear-gradient(145deg, #1A1A2E 0%, #16213E 100%)', accent: '#FFCC00' };

export function getHintGradient(visualHint) {
  if (!visualHint) return DEFAULT_HINT;
  const h = visualHint.toLowerCase();
  for (const entry of HINT_GRADIENTS) {
    if (entry.keys.some((k) => h.includes(k))) return entry;
  }
  return DEFAULT_HINT;
}
