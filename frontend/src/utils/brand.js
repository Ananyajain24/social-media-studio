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
  explanation: { label: 'Explanation', glow: '#3B82F6', tw: 'text-blue-400   bg-blue-400/10   border-blue-400/30'   },
  solution:    { label: 'Solution',    glow: '#22C55E', tw: 'text-green-400  bg-green-400/10  border-green-400/30'  },
  cta:         { label: 'CTA',         glow: '#A855F7', tw: 'text-purple-400 bg-purple-400/10 border-purple-400/30' }
};

// Maps slide role → decorative gradient pair for the radial glows
export const ROLE_GLOWS = {
  hook:        ['#FFCC00', '#FF8C00'],
  problem:     ['#FF4B4B', '#FF8C00'],
  explanation: ['#4B9EFF', '#7B4BFF'],
  solution:    ['#4BFF8C', '#00C9A7'],
  cta:         ['#CC4BFF', '#4B9EFF']
};
