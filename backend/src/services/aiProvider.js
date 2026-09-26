import Anthropic from '@anthropic-ai/sdk';

const DEFAULT_PROVIDER = 'anthropic';
const DEFAULT_ANTHROPIC_MODEL = 'claude-3-5-sonnet-latest';
const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite';
const DEFAULT_GEMINI_FALLBACK_MODEL = 'gemini-3.8-flash';
const GEMINI_MAX_ATTEMPTS = 3;
const RETRYABLE_GEMINI_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

export function getAIProvider() {
  return (process.env.AI_PROVIDER || DEFAULT_PROVIDER).trim().toLowerCase();
}

export async function generateText({ system, user, maxTokens, json = false }) {
  const provider = getAIProvider();

  if (provider === 'gemini') {
    return generateWithGemini({ system, user, maxTokens, json });
  }

  if (provider === 'anthropic') {
    return generateWithAnthropic({ system, user, maxTokens });
  }

  throw new Error(
    `Unsupported AI_PROVIDER "${provider}". Use "gemini" or "anthropic" in backend/.env.`
  );
}

async function generateWithAnthropic({ system, user, maxTokens }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set for AI_PROVIDER=anthropic.');
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }]
  });

  const text = message.content
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('')
    .trim();

  if (!text) throw new Error('Anthropic returned an empty response.');
  return text;
}

async function generateWithGemini({ system, user, maxTokens, json }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set for AI_PROVIDER=gemini.');
  }

  const models = [
    process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
    process.env.GEMINI_FALLBACK_MODEL || DEFAULT_GEMINI_FALLBACK_MODEL
  ].filter((model, index, all) => model && all.indexOf(model) === index);

  const generationConfig = { maxOutputTokens: maxTokens };
  if (json) generationConfig.responseMimeType = 'application/json';

  let lastError;

  for (const model of models) {
    for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt += 1) {
      try {
        return await requestGemini({
          apiKey, model, system, user, generationConfig
        });
      } catch (error) {
        lastError = error;
        if (!error.retryable) throw error;
        if (attempt === GEMINI_MAX_ATTEMPTS) break;

        const delayMs = (750 * (2 ** (attempt - 1))) + Math.floor(Math.random() * 250);
        console.warn(
          `[gemini] ${model} temporarily unavailable; retry ${attempt}/${GEMINI_MAX_ATTEMPTS - 1} in ${delayMs}ms`
        );
        await delay(delayMs);
      }
    }

    if (models.length > 1 && model !== models.at(-1)) {
      console.warn(`[gemini] Switching from ${model} to fallback model ${models.at(-1)}`);
    }
  }

  throw lastError;
}

async function requestGemini({ apiKey, model, system, user, generationConfig }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  let response;

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig
      })
    });
  } catch (cause) {
    const error = new Error(`Gemini API network request failed: ${cause.message}`);
    error.retryable = true;
    throw error;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data?.error?.message || `${response.status} ${response.statusText}`;
    const error = new Error(`Gemini API request failed (${model}): ${detail}`);
    error.retryable = RETRYABLE_GEMINI_STATUSES.has(response.status);
    throw error;
  }

  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

  if (!text) {
    const reason = data?.candidates?.[0]?.finishReason || data?.promptFeedback?.blockReason;
    throw new Error(`Gemini returned an empty response${reason ? ` (${reason})` : ''}.`);
  }

  return text;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
