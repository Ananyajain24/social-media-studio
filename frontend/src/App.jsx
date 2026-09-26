import React, { useRef, useState } from 'react';
import IdeaInput        from './components/IdeaInput';
import CarouselPreview from './components/CarouselPreview';
import SlideEditor     from './components/SlideEditor';
import BrandPanel      from './components/BrandPanel';
import ExportPanel     from './components/ExportPanel';
import ReelGenerator   from './components/ReelGenerator';
import StoryGenerator  from './components/StoryGenerator';
import useStudioStore  from './store/studioStore';
import reelImage       from './assets/reel-creator.png';
import storyImage      from './assets/story-creator.png';
import carouselImage   from './assets/carousel-creator.png';

const FORMATS = [
  {
    id: 'reel', label: 'Reels', singular: 'Reel', icon: 'play', accent: '#ff3d81', stat: '9:16 video', image: reelImage,
    eyebrow: 'Motion that stops the scroll',
    description: 'Turn one idea into a polished, animated vertical video with an optional voiceover.',
    cardDescription: 'Create scroll-stopping short videos, complete with motion and narration.'
  },
  {
    id: 'story', label: 'Stories', singular: 'Story', icon: 'story', accent: '#a855f7', stat: '9:16 story', image: storyImage,
    eyebrow: 'One frame. Instant impact.',
    description: 'Build a beautiful, focused story that makes your key message impossible to miss.',
    cardDescription: 'Share timely ideas in a striking, ready-to-post vertical format.'
  },
  {
    id: 'carousel', label: 'Carousels', singular: 'Carousel', icon: 'stack', accent: '#ff8a00', stat: '5-slide post', image: carouselImage,
    eyebrow: 'Tell the whole story',
    description: 'Shape your idea into a swipe-worthy sequence with hooks, insights, and a strong CTA.',
    cardDescription: 'Break big ideas into engaging, beautifully structured swipeable posts.'
  }
];

function FormatIcon({ type, size = 22 }) {
  if (type === 'play') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="6" stroke="currentColor" strokeWidth="1.8" />
      <path d="m10 8.5 5.5 3.5-5.5 3.5v-7Z" fill="currentColor" />
    </svg>
  );
  if (type === 'story') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 2" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="6" width="13" height="13" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3h9a4 4 0 0 1 4 4v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Logo({ onClick }) {
  return (
    <button className="brand-lockup" onClick={onClick} aria-label="Go to home page">
      <span className="brand-mark" aria-hidden="true"><span /></span>
      <span>Social Studio</span>
    </button>
  );
}

function CarouselWorkspace() {
  const { script, isGenerating } = useStudioStore();
  const slideRefs = useRef([]);
  return (
    <div className="space-y-10">
      <IdeaInput />
      {isGenerating && (
        <div className="flex gap-4 overflow-hidden w-full">
          {[...Array(5)].map((_, i) => <div key={i} className="w-[300px] h-[300px] rounded-3xl bg-white/5 flex-shrink-0 animate-pulse" />)}
        </div>
      )}
      {script && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 items-start">
          <div className="min-w-0 overflow-hidden"><CarouselPreview slideRefs={slideRefs} /></div>
          <div className="space-y-4"><SlideEditor /><BrandPanel /><ExportPanel slideRefs={slideRefs} /></div>
        </div>
      )}
    </div>
  );
}

function LandingPage({ onSelect }) {
  const scrollToFormats = () => document.getElementById('formats')?.scrollIntoView({ behavior: 'smooth' });
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
        <button className="nav-cta" onClick={scrollToFormats}>Start creating <span>↗</span></button>
      </header>

      <main>
        <section className="landing-hero">
          <div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" />
          <div className="hero-content">
            <div className="eyebrow-pill"><span>✦</span> Your AI social creative partner</div>
            <h1>Marketing<br /><span>made easy.</span></h1>
            <p>Create reels, stories, and carousels for your brand in just one prompt.</p>
            <button className="hero-cta" onClick={scrollToFormats}>Create your first post <span className="cta-arrow">→</span></button>
            <div className="trust-row">
              <div className="avatar-stack"><i /><i /><i /></div>
              <span><strong>Built for busy brands</strong><br />From idea to post in minutes</span>
            </div>
          </div>

          <div className="hero-showcase" aria-hidden="true">
            <div className="showcase-glow" />
            <div className="floating-chip chip-one"># Brand voice</div>
            <div className="floating-chip chip-two">✦ AI generated</div>
            <div className="phone-frame">
              <div className="phone-top"><span /> Social Studio <i>•••</i></div>
              <img src={reelImage} alt="" />
              <div className="phone-actions"><span>♡</span><span>◯</span><span>⌁</span><b>⌑</b></div>
              <div className="phone-copy"><strong>Make your idea impossible to ignore.</strong><small>Designed in seconds · Ready to share</small></div>
            </div>
          </div>
        </section>

        <section className="format-section" id="formats">
          <div className="section-heading">
            <span>Choose your format</span><h2>What will you create today?</h2>
            <p>Pick a format, describe your idea, and let the studio do the heavy lifting.</p>
          </div>
          <div className="format-grid">
            {FORMATS.map((format, index) => (
              <button key={format.id} className="format-card" style={{ '--accent': format.accent, '--delay': `${index * 80}ms` }} onClick={() => onSelect(format.id)}>
                <img src={format.image} alt={`${format.label} creator inspiration`} />
                <span className="card-scrim" />
                <span className="card-topline"><span className="format-icon"><FormatIcon type={format.icon} /></span><span className="format-stat">{format.stat}</span></span>
                <span className="card-copy"><small>CREATE</small><strong>{format.label}</strong><span>{format.cardDescription}</span><b>Start creating <i>→</i></b></span>
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer className="landing-footer"><Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} /><p>One prompt. Endless creative possibilities.</p></footer>
    </div>
  );
}

function CreatorWorkspace({ activeTab, onSelect, onHome }) {
  const active = FORMATS.find((format) => format.id === activeTab);
  return (
    <div className={`workspace-page workspace-${activeTab}`}>
      <header className="workspace-nav">
        <Logo onClick={onHome} />
        <nav className="workspace-tabs" aria-label="Creator formats">
          {FORMATS.map((format) => (
            <button
              key={format.id}
              className={activeTab === format.id ? 'active' : ''}
              style={{ '--tab-accent': format.accent }}
              onClick={() => onSelect(format.id)}
              aria-label={`Open ${format.label} creator`}
              title={`${format.label} creator`}
            >
              <FormatIcon type={format.icon} size={18} /><span>{format.label}</span>
            </button>
          ))}
        </nav>
        <button className="home-link" onClick={onHome}>← Home</button>
      </header>

      <main className="workspace-main">
        <section className="workspace-hero" style={{ '--workspace-accent': active.accent }}>
          <div>
            <span className="workspace-eyebrow"><FormatIcon type={active.icon} size={16} /> {active.eyebrow}</span>
            <h1>Create your <span>{active.singular}</span></h1><p>{active.description}</p>
          </div>
          <div className="workspace-steps"><span><b>1</b> Describe</span><i /><span><b>2</b> Generate</span><i /><span><b>3</b> Share</span></div>
        </section>
        <section className="creator-shell">
          {activeTab === 'carousel' && <CarouselWorkspace />}
          {activeTab === 'story' && <StoryGenerator />}
          {activeTab === 'reel' && <ReelGenerator />}
        </section>
      </main>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState(null);
  const selectFormat = (format) => { setActiveTab(format); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  if (!activeTab) return <LandingPage onSelect={selectFormat} />;
  return <CreatorWorkspace activeTab={activeTab} onSelect={selectFormat} onHome={() => setActiveTab(null)} />;
}
