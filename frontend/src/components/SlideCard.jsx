import React, { forwardRef } from 'react';
import { TEMPLATES, ROLE_GLOWS } from '../utils/brand';

/**
 * Renders a single carousel slide using inline styles only.
 * Inline styles are mandatory so html2canvas captures them correctly.
 *
 * size="preview"  → 300×300px (shown in UI)
 * size="export"   → not used directly; export uses scale:3 on preview
 */
const SlideCard = forwardRef(function SlideCard(
  { slide, slideCount, template = 'bold_dark', isActive = false, onClick },
  ref
) {
  const t = TEMPLATES[template] || TEMPLATES.bold_dark;
  const [g1, g2] = ROLE_GLOWS[slide.role] || ['#FFCC00', '#FF8C00'];
  const SIZE = 300;

  const S = {
    // Base container
    card: {
      width: SIZE,
      height: SIZE,
      background: t.gradient,
      fontFamily: "'Poppins', sans-serif",
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
      borderRadius: 16,
      border: isActive ? `2.5px solid ${t.accent}` : '2.5px solid transparent',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'border-color 0.15s',
      userSelect: 'none'
    },
    // Decorative radial glow — top-right
    glow1: {
      position: 'absolute',
      top: -30,
      right: -30,
      width: 180,
      height: 180,
      background: `radial-gradient(circle, ${g1}30 0%, transparent 70%)`,
      pointerEvents: 'none'
    },
    // Decorative radial glow — bottom-left
    glow2: {
      position: 'absolute',
      bottom: -40,
      left: -20,
      width: 140,
      height: 140,
      background: `radial-gradient(circle, ${g2}22 0%, transparent 70%)`,
      pointerEvents: 'none'
    },
    // Top bar
    topBar: {
      position: 'absolute',
      top: 14,
      left: 16,
      right: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    brandName: {
      fontSize: 8,
      fontWeight: 800,
      color: t.accent,
      letterSpacing: '1.5px',
      textTransform: 'uppercase'
    },
    roleBadge: {
      fontSize: 6.5,
      fontWeight: 700,
      color: t.badgeText,
      background: t.badge,
      padding: '2px 7px',
      borderRadius: 20,
      textTransform: 'uppercase',
      letterSpacing: '0.8px'
    },
    // Content block — vertically centred
    content: {
      position: 'absolute',
      top: '50%',
      left: 18,
      right: 18,
      transform: 'translateY(-50%)',
      marginTop: 6   // nudge slightly below center to leave top-bar room
    },
    emoji: {
      fontSize: 36,
      lineHeight: 1,
      marginBottom: 8,
      display: 'block'
    },
    headline: {
      fontSize: 15,
      fontWeight: 800,
      color: t.text,
      lineHeight: 1.2,
      marginBottom: 7,
      letterSpacing: '-0.3px'
    },
    subtext: {
      fontSize: 8.5,
      fontWeight: 400,
      color: t.subtext,
      lineHeight: 1.5
    },
    // Accent bar bottom-left
    accentBar: {
      position: 'absolute',
      bottom: 28,
      left: 16,
      width: 36,
      height: 3,
      background: `linear-gradient(90deg, ${g1}, ${g2})`,
      borderRadius: 4
    },
    // Slide counter bottom-right
    counter: {
      position: 'absolute',
      bottom: 10,
      right: 16,
      fontSize: 7,
      fontWeight: 600,
      color: t.slideNumColor,
      opacity: 0.75
    }
  };

  return (
    <div ref={ref} style={S.card} onClick={onClick}>
      <div style={S.glow1} />
      <div style={S.glow2} />

      {/* Top bar */}
      <div style={S.topBar}>
        <span style={S.brandName}>Cuemath</span>
        <span style={S.roleBadge}>{slide.role}</span>
      </div>

      {/* Main content */}
      <div style={S.content}>
        {slide.emoji && <span style={S.emoji}>{slide.emoji}</span>}
        <div style={S.headline}>{slide.headline}</div>
        <div style={S.subtext}>{slide.subtext}</div>
      </div>

      {/* Bottom decorations */}
      <div style={S.accentBar} />
      <div style={S.counter}>{slide.slide_number}/{slideCount}</div>
    </div>
  );
});

export default SlideCard;
