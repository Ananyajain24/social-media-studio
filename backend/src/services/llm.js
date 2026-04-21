import Anthropic from '@anthropic-ai/sdk';

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// ─── Format-specific system prompts ──────────────────────────────────────────

const COMMON_RULES = `
You are a social media content strategist for Cuemath, a K-12 math education brand.
STRICT OUTPUT: Return ONLY valid JSON. No markdown, no code blocks, no explanation.

CONTENT TYPE:
- "math_visualization": graphs, equations, geometry, fractions, number lines, coordinates
- "conceptual_explainer": study habits, psychology, parenting tips, mindset

THEME:
- "bold_dark": dramatic, high-impact topics
- "clean_light": warm, conversational, informational topics

AUDIENCE: Parents of K-12 students (not the children themselves).
TONE: warm, reassuring, expert but approachable.`;

const FORMAT_CONFIGS = {
  carousel: {
    instruction: `Create a 5-slide Instagram CAROUSEL (1:1 square format).

SLIDE STRUCTURE (exactly 5):
1. "hook"        — Scroll-stopping opening, bold claim or surprising stat
2. "problem"     — Pain/struggle parents recognise in their child
3. "explanation" — Core concept, simply explained, no jargon
4. "solution"    — Actionable advice parents can apply
5. "cta"         — Trust-building CTA, mention Cuemath naturally

WRITING RULES:
- headline: max 8 words, punchy
- subtext:  max 20 words, plain English

OUTPUT JSON:
{
  "format": "carousel",
  "title": "string",
  "target_audience": "string",
  "tone": "string",
  "content_type": "math_visualization|conceptual_explainer",
  "theme_suggestion": "bold_dark|clean_light",
  "slides": [
    {
      "slide_number": 1,
      "role": "hook|problem|explanation|solution|cta",
      "headline": "string",
      "subtext": "string",
      "emoji": "single emoji",
      "visual_hint": "optional string"
    }
  ]
}`,
    slideCount: 5
  },

  reel: {
    instruction: `Create a 6-slide Instagram REEL script (9:16 vertical format, video feel).

SLIDE STRUCTURE (exactly 6 — each slide = one full-screen scene):
1. "hook"        — 3-word punchy scroll-stopper
2. "problem"     — The pain point, dramatic
3. "stat"        — A surprising number or fact
4. "explanation" — The "aha" moment
5. "solution"    — What to do, bold and clear
6. "cta"         — Swipe / follow / try Cuemath

WRITING RULES (VIDEO-FIRST):
- headline: max 5 words, ALL CAPS energy, very punchy
- subtext: max 10 words
- animation_hint: "fade-up" | "slide-left" | "zoom-in" | "pop"

OUTPUT JSON:
{
  "format": "reel",
  "title": "string",
  "target_audience": "string",
  "tone": "string",
  "content_type": "math_visualization|conceptual_explainer",
  "theme_suggestion": "bold_dark|clean_light",
  "slides": [
    {
      "slide_number": 1,
      "role": "hook|problem|stat|explanation|solution|cta",
      "headline": "string",
      "subtext": "string",
      "emoji": "single emoji",
      "visual_hint": "optional string",
      "animation_hint": "fade-up|slide-left|zoom-in|pop"
    }
  ]
}`,
    slideCount: 6
  },

  story: {
    instruction: `Create a single Instagram STORY (9:16 vertical, one impactful frame).

ONE SLIDE ONLY. Make it standalone and scroll-stopping.

RULES:
- headline: max 6 words, massive visual impact
- subtext: 10-15 words, complete thought
- Must work without context — fully self-contained message

OUTPUT JSON:
{
  "format": "story",
  "title": "string",
  "target_audience": "string",
  "tone": "string",
  "content_type": "math_visualization|conceptual_explainer",
  "theme_suggestion": "bold_dark|clean_light",
  "slides": [
    {
      "slide_number": 1,
      "role": "hook",
      "headline": "string",
      "subtext": "string",
      "emoji": "single emoji",
      "visual_hint": "string"
    }
  ]
}`,
    slideCount: 1
  }
};

const REGEN_SYSTEM = `You are a social media copywriter for Cuemath (K-12 math education).
Rewrite a single slide based on the given instruction.
Return ONLY a valid JSON object for the slide. No markdown, no explanation.

Schema:
{
  "slide_number": number,
  "role": "string",
  "headline": "string",
  "subtext": "string",
  "emoji": "single emoji",
  "visual_hint": "optional string",
  "animation_hint": "optional string"
}`;

// ─── Exports ──────────────────────────────────────────────────────────────────

export async function generateScript(idea, format = 'carousel') {
  const client = getClient();
  const cfg = FORMAT_CONFIGS[format] || FORMAT_CONFIGS.carousel;
  const system = COMMON_RULES + '\n\n' + cfg.instruction;

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1800,
    system,
    messages: [{ role: 'user', content: `Create a ${format} script for this idea:\n\n"${idea}"` }]
  });

  const raw = msg.content[0].text.trim();
  const script = JSON.parse(extractJSON(raw));
  validateScript(script, format, cfg.slideCount);
  return script;
}

export async function regenerateSlide(script, slideIndex, instruction = '') {
  const client = getClient();
  const current = script.slides[slideIndex];
  const ctx = [
    `Format: ${script.format}`,
    `Carousel title: "${script.title}"`,
    `Slide role: "${current.role}"`,
    `Current headline: "${current.headline}"`,
    `Current subtext: "${current.subtext}"`,
    instruction ? `Instruction: ${instruction}` : 'Make it more engaging and impactful.'
  ].join('\n');

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    system: REGEN_SYSTEM,
    messages: [{ role: 'user', content: ctx }]
  });

  const raw = msg.content[0].text.trim();
  return JSON.parse(extractJSON(raw));
}

const STORY_SYSTEM = `You are a social media content strategist for Cuemath, a K-12 math education brand.
Create a single Instagram Story slide for parents of school-age children.

STRICT OUTPUT: Return ONLY valid JSON. No markdown, no code blocks, no explanation.

STRUCTURE (three distinct text zones):
- headline:    scroll-stopping hook, MAX 6 words, emotional, bold statement
- explanation: core message,          MAX 10 words, simple and clear
- result:      bottom takeaway/CTA,   MAX 8 words, action-oriented or inspiring

TONE: simple, emotional, parent-focused, reassuring

VISUAL HINT: brief background idea (e.g. "warm sunrise over books", "child smiling at math")

OUTPUT JSON SCHEMA:
{
  "format": "story_single",
  "headline": "string",
  "explanation": "string",
  "result": "string",
  "visual_hint": "string"
}`;

export async function generateStory(idea) {
  const client = getClient();
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    system: STORY_SYSTEM,
    messages: [{ role: 'user', content: `Create a story slide for this idea:\n\n"${idea}"` }]
  });

  const raw = msg.content[0].text.trim();
  const story = JSON.parse(extractJSON(raw));
  if (!story.headline || !story.explanation || !story.result) {
    throw new Error('Story JSON missing required fields');
  }
  return story;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('LLM returned no JSON — check API key and prompt');
  return match[0];
}

function validateScript(script, format, expectedCount) {
  if (!Array.isArray(script.slides)) throw new Error('Invalid script: missing slides array');
  // Truncate or pad gracefully rather than hard-failing
  if (format === 'story') script.slides = script.slides.slice(0, 1);
  if (script.slides.length < 1) throw new Error('Script has no slides');
}
