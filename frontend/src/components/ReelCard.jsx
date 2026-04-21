import React, { forwardRef } from 'react';
import { TEMPLATES, ROLE_GLOWS, getHintGradient } from '../utils/brand';

/**
 * 9:16 vertical card for Reel and Story formats.
 * Preview: 180×320px. Export via html2canvas at scale:6 → 1080×1920px.
 * Uses inline styles throughout for faithful html2canvas capture.
 */
const ReelCard = forwardRef(function ReelCard(
  { slide, slideCount, template = 'bold_dark', isActive = false, onClick },
  ref
) {
  const t = TEMPLATES[template] || TEMPLATES.bold_dark;
  const [g1, g2] = ROLE_GLOWS[slide.role] || ['#FFCC00', '#FF8C00'];

  // Dynamic gradient based on visual_hint
  const hint = getHintGradient(slide.visual_hint);
  const bgGradient = template === 'clean_light' ? t.gradient : hint.grad;
  const accentColor = template === 'clean_light' ? t.accent : hint.accent;

  const W = 180, H = 320;

  const S = {
    card: {
      width: W,
      height: H,
      background: bgGradient,
      fontFamily: "'Poppins', sans-serif",
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
      borderRadius: 16,
      border: isActive ? `2.5px solid ${accentColor}` : '2.5px solid transparent',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'border-color 0.15s'
    },
    // Glow top-right
    glow1: {
      position: 'absolute', top: -20, right: -20,
      width: 120, height: 120,
      background: `radial-gradient(circle, ${g1}35 0%, transparent 70%)`,
      pointerEvents: 'none'
    },
    // Glow bottom-left
    glow2: {
      position: 'absolute', bottom: -30, left: -10,
      width: 100, height: 100,
      background: `radial-gradient(circle, ${g2}28 0%, transparent 70%)`,
      pointerEvents: 'none'
    },
    // Horizontal accent bar at top
    topAccent: {
      position: 'absolute', top: 0, left: 0, right: 0,
      height: 3,
      background: `linear-gradient(90deg, ${g1}, ${g2}, transparent)`
    },
    // Brand + badge row
    topBar: {
      position: 'absolute', top: 12, left: 14, right: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    },
    brand: {
      fontSize: 7, fontWeight: 800, color: accentColor,
      letterSpacing: '1.5px', textTransform: 'uppercase'
    },
    badge: {
      fontSize: 6, fontWeight: 700,
      color: template === 'clean_light' ? '#fff' : '#000',
      background: accentColor,
      padding: '1.5px 6px', borderRadius: 20,
      textTransform: 'uppercase', letterSpacing: '0.5px'
    },
    // Main content — lower-center (video title card style)
    content: {
      position: 'absolute',
      bottom: 40, left: 14, right: 14
    },
    emoji: {
      fontSize: 42, lineHeight: 1,
      display: 'block', marginBottom: 8, textAlign: 'center'
    },
    headline: {
      fontSize: 16, fontWeight: 900,
      color: template === 'clean_light' ? t.text : '#fff',
      lineHeight: 1.15, marginBottom: 7,
      letterSpacing: '-0.3px', textAlign: 'center'
    },
    subtext: {
      fontSize: 8, fontWeight: 400,
      color: template === 'clean_light' ? t.subtext : 'rgba(255,255,255,0.75)',
      lineHeight: 1.5, textAlign: 'center'
    },
    // Animation hint pill
    animHint: {
      position: 'absolute', top: 28, right: 14,
      fontSize: 5.5, fontWeight: 600,
      color: accentColor, opacity: 0.7,
      background: `${accentColor}15`,
      padding: '1px 5px', borderRadius: 10,
      textTransform: 'uppercase', letterSpacing: '0.5px'
    },
    // Bottom bar
    bottomBar: {
      position: 'absolute', bottom: 10, left: 14, right: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    },
    accentLine: {
      width: 28, height: 2,
      background: `linear-gradient(90deg, ${g1}, ${g2})`,
      borderRadius: 4
    },
    counter: {
      fontSize: 6.5, fontWeight: 600, color: accentColor, opacity: 0.65
    }
  };

  return (
    <div ref={ref} style={S.card} onClick={onClick}>
      <div style={S.glow1} />
      <div style={S.glow2} />
      <div style={S.topAccent} />

      <div style={S.topBar}>
        <span style={S.brand}>Cuemath</span>
        <span style={S.badge}>{slide.role}</span>
      </div>

      {slide.animation_hint && (
        <div style={S.animHint}>⟳ {slide.animation_hint}</div>
      )}

      <div style={S.content}>
        {slide.emoji && <span style={S.emoji}>{slide.emoji}</span>}
        <div style={S.headline}>{slide.headline}</div>
        <div style={S.subtext}>{slide.subtext}</div>
      </div>

      <div style={S.bottomBar}>
        <div style={S.accentLine} />
        {slideCount > 1 && (
          <span style={S.counter}>{slide.slide_number}/{slideCount}</span>
        )}
      </div>
    </div>
  );
});

export default ReelCard;
