import { CS_APIKEY_SK } from './constants';

const API_URL = 'https://api.anthropic.com/v1/messages';

/** Extracts JSON from a Claude response that may contain markdown fences or prose. */
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
 * Calls the Anthropic Messages API with web_search tool enabled.
 * Retries up to 3 times on 429 (rate limit) with exponential backoff.
 * Throws on 401 (invalid key) and unrecoverable errors.
 */
export async function callClaude(
  key: string,
  model: string,
  sys: string,
  user: string,
): Promise<Record<string, unknown>> {
  const delays = [2000, 4000, 8000];

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2000,
        system: sys,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: user }],
      }),
    });

    if (res.status === 401) {
      sessionStorage.removeItem(CS_APIKEY_SK);
      throw new Error('Invalid API key');
    }

    if (res.status === 429) {
      const wait = delays[attempt];
      if (wait === undefined) throw new Error('Rate limited — too many requests, try again later');
      await new Promise(r => setTimeout(r, wait));
      continue;
    }

    const d = await res.json() as {
      content?: Array<{ type: string; text?: string }>;
      error?: { message: string };
    };

    if (d.error) throw new Error(d.error.message ?? 'API error');

    const text = d.content?.find(b => b.type === 'text')?.text ?? '';
    if (!text) throw new Error('No text response from model');

    return extractJson(text);
  }

  // Unreachable but satisfies TypeScript
  throw new Error('callClaude: exhausted retry loop unexpectedly');
}
