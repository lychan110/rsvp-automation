import { CS_APIKEY_SK } from './constants';

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/** Extracts JSON from a Gemini response that may contain markdown fences or prose. */
function extractJson(text: string): Record<string, unknown> {
  // Strip markdown fences first
  let clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // Try direct parse
  try { return JSON.parse(clean) as Record<string, unknown>; } catch { /* fall through */ }

  // Try finding the outermost JSON object
  const start = clean.indexOf('{');
  const end   = clean.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try { return JSON.parse(clean.slice(start, end + 1)) as Record<string, unknown>; } catch { /* fall through */ }
  }

  throw new Error(`No valid JSON in response: ${clean.slice(0, 120)}`);
}

/**
 * Calls the Gemini API with Google Search Grounding enabled.
 * Retries up to 3 times on 429 (rate limit) with exponential backoff.
 * Throws on invalid key and unrecoverable errors.
 *
 * Note: responseMimeType JSON mode is incompatible with google_search grounding,
 * so we instruct the model via system prompt and parse the text response.
 */
export async function callGemini(
  key: string,
  model: string,
  sys: string,
  user: string,
): Promise<Record<string, unknown>> {
  const delays = [2000, 4000, 8000];

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    const res = await fetch(`${API_BASE}/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: sys }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        tools: [{ google_search: {} }],
      }),
    });

    if (res.status === 429) {
      const wait = delays[attempt];
      if (wait === undefined) throw new Error('Rate limited — too many requests, try again later');
      await new Promise(r => setTimeout(r, wait));
      continue;
    }

    const d = await res.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      error?: { message: string };
    };

    if (d.error) {
      const msg = d.error.message ?? 'API error';
      if (msg.toLowerCase().includes('api key not valid') || res.status === 401) {
        sessionStorage.removeItem(CS_APIKEY_SK);
        throw new Error('Invalid API key');
      }
      throw new Error(msg);
    }

    const text = d.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    if (!text) throw new Error('No text response from model');

    return extractJson(text);
  }

  // Unreachable but satisfies TypeScript
  throw new Error('callGemini: exhausted retry loop unexpectedly');
}
