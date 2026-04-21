import Anthropic from '@anthropic-ai/sdk';

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const SYSTEM_PROMPT = `You are a social media content strategist for Cuemath, a leading K-12 math education brand.
Convert rough user ideas into structured Instagram carousel scripts.

STRICT OUTPUT: Return ONLY valid JSON. No markdown, no code blocks, no explanation.

CAROUSEL STRUCTURE (exactly 5 slides):
1. "hook"        — Scroll-stopping opening. Bold claim or surprising stat.
2. "problem"     — The pain or struggle parents recognise in their child.
3. "explanation" — Core concept simply explained. No jargon.
4. "solution"    — Actionable advice parents can apply.
5. "cta"         — Trust-building call to action. Mention Cuemath naturally.

WRITING RULES:
- headline: max 8 words, punchy, emotionally resonant
- subtext:  max 20 words, plain English, zero jargon
- Audience: parents of K-12 students (not the students themselves)
- Tone: warm, reassuring, expert but approachable
- Each slide must flow logically from the previous

CONTENT TYPE:
- "math_visualization"  → if idea involves graphs, equations, geometry, fractions, number lines, coordinates
- "conceptual_explainer" → if idea involves study habits, psychology, tips, parenting, mindset concepts

THEME SUGGESTION:
- "bold_dark"   → for dramatic, high-impact visual topics
- "clean_light" → for warm, conversational, informational topics

OUTPUT JSON SCHEMA (no deviation allowed):
{
  "format": "carousel",
  "title": "concise one-line summary of the carousel",
  "target_audience": "string",
  "tone": "comma-separated tone descriptors",
  "content_type": "math_visualization" | "conceptual_explainer",
  "theme_suggestion": "bold_dark" | "clean_light",
  "slides": [
    {
      "slide_number": 1,
      "role": "hook",
      "headline": "string",
      "subtext": "string",
      "emoji": "single most relevant emoji",
      "visual_hint": "optional brief description of ideal background/visual"
    }
  ]
}`;

const REGEN_SYSTEM = `You are a social media copywriter for Cuemath (K-12 math education).
Rewrite a single carousel slide based on the given instruction.
Return ONLY a valid JSON object for the slide. No markdown, no explanation.

Schema:
{
  "slide_number": number,
  "role": "hook|problem|explanation|solution|cta",
  "headline": "max 8 words",
  "subtext": "max 20 words",
  "emoji": "single emoji",
  "visual_hint": "optional string"
}`;

export async function generateScript(idea) {
  const client = getClient();
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Create a carousel script for this idea:\n\n"${idea}"` }]
  });

  const raw = msg.content[0].text.trim();
  const json = extractJSON(raw);
  const script = JSON.parse(json);
  validateScript(script);
  return script;
}

export async function regenerateSlide(script, slideIndex, instruction = '') {
  const client = getClient();
  const current = script.slides[slideIndex];
  const ctx = [
    `Carousel: "${script.title}"`,
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
  const json = extractJSON(raw);
  return JSON.parse(json);
}

function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('LLM returned no JSON — check API key and prompt');
  return match[0];
}

function validateScript(script) {
  if (!Array.isArray(script.slides)) throw new Error('Invalid script: missing slides array');
  if (script.slides.length !== 5) throw new Error(`Expected 5 slides, got ${script.slides.length}`);
}
