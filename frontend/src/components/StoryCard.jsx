import React, { forwardRef } from 'react';
import { TEMPLATES, getHintGradient } from '../utils/brand';

/**
 * Single 9:16 Story slide.
 * Preview: 180×320px.  Export: html2canvas scale:6 → 1080×1920px.
 * All styles are inline so html2canvas captures them faithfully.
 *
 * Layout (top → bottom):
 *   Brand tag
 *   ── accent rule ──
 *   HEADLINE  (hook, large, bold)
 *   explanation  (middle, smaller)
 *   ╔═ RESULT BADGE ═╗  (bottom, highlighted box)
 *   story pip
 */
const StoryCard = forwardRef(function StoryCard(
  { story, template = 'bold_dark' },
  ref
) {
  // Always use the selected palette — never fall back to hint-driven colours
  const t = TEMPLATES[template] || TEMPLATES.bold_dark;

  const bg          = t.gradient;
  const accentColor = t.accent;
  const textColor   = t.text;
  const subtextCol  = t.subtext;
  const badgeText   = t.badgeText;

  // hint drives only the soft radial glow tint — palette accent is still used for UI
  const hint  = getHintGradient(story.visual_hint);
  const glow1 = accentColor;   // glow matches the active palette accent

  const S = {
    card: {
      width: 180, height: 320,
      background: bg,
      fontFamily: "'Poppins', sans-serif",
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 16,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '14px 14px 12px'
    },

    // Atmospheric glow behind headline
    glow: {
      position: 'absolute',
      top: '30%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 200, height: 200,
      background: `radial-gradient(circle, ${glow1}28 0%, transparent 70%)`,
      pointerEvents: 'none'
    },

    // ── Top zone ──────────────────────────────────────────────────────────
    brand: {
      fontSize: 7, fontWeight: 800, color: accentColor,
      letterSpacing: '1.8px', textTransform: 'uppercase',
      marginBottom: 6, alignSelf: 'flex-start'
    },
    accentRule: {
      width: '100%', height: 2,
      background: `linear-gradient(90deg, ${accentColor}, transparent)`,
      borderRadius: 2, marginBottom: 14
    },

    // ── Headline zone (hook) ───────────────────────────────────────────────
    headlineWrap: {
      flex: 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      paddingBottom: 4
    },
    headline: {
      fontSize: 21, fontWeight: 900,
      color: textColor,
      lineHeight: 1.18,
      textAlign: 'center',
      letterSpacing: '-0.4px'
    },

    // ── Explanation zone (middle) ──────────────────────────────────────────
    explanation: {
      fontSize: 8.5, fontWeight: 400,
      color: subtextCol,
      lineHeight: 1.55,
      textAlign: 'center',
      paddingBottom: 12,
      paddingLeft: 4, paddingRight: 4
    },

    // ── Result badge (bottom highlight) ───────────────────────────────────
    badge: {
      background: accentColor,
      color: badgeText,
      borderRadius: 8,
      paddingTop: 5, paddingBottom: 5,
      paddingLeft: 10, paddingRight: 10,
      fontSize: 8, fontWeight: 800,
      textAlign: 'center',
      letterSpacing: '0.3px',
      width: '100%',
      marginBottom: 8
    },

    // ── Story indicator pip ────────────────────────────────────────────────
    pip: {
      fontSize: 6, color: accentColor,
      opacity: 0.5, letterSpacing: '2px'
    }
  };

  return (
    <div ref={ref} style={S.card}>
      <div style={S.glow} />

      {/* Brand + rule */}
      <div style={S.brand}>Cuemath</div>
      <div style={S.accentRule} />

      {/* Headline */}
      <div style={S.headlineWrap}>
        <div style={S.headline}>{story.headline}</div>
      </div>

      {/* Explanation */}
      <div style={S.explanation}>{story.explanation}</div>

      {/* Result badge */}
      <div style={S.badge}>{story.result}</div>

      {/* Story pip */}
      <div style={S.pip}>● STORY</div>
    </div>
  );
});

export default StoryCard;
