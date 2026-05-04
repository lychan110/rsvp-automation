import { CS_APIKEY_SK, CS_ENDPOINT_SK } from './constants';

/** Extracts JSON from a response that may contain markdown fences or prose. */
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
 * Calls the LiteLLM endpoint (OpenAI-compatible API) with search results pre-injected.
 * Retries up to 3 times on 429 (rate limit) with exponential backoff.
 * Throws on invalid key and unrecoverable errors.
 *
 * Web search results are pre-fetched and included in the user message,
 * so the LLM receives grounded context without needing tool calls.
 */
export async function callLiteLLM(
  key: string,
  endpoint: string,
  model: string,
  sys: string,
  user: string,
): Promise<Record<string, unknown>> {
  const delays = [2000, 4000, 8000];
  const apiBase = endpoint.endsWith('/v1') ? endpoint : `${endpoint}/v1`;
  const url = `${apiBase}/chat/completions`;

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: user },
        ],
        temperature: 0.7,
      }),
    });

    if (res.status === 429) {
      const wait = delays[attempt];
      if (wait === undefined) throw new Error('Rate limited — too many requests, try again later');
      await new Promise(r => setTimeout(r, wait));
      continue;
    }

    const d = await res.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message: string };
    };

    if (d.error) {
      const msg = d.error.message ?? 'API error';
      if (msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('invalid api key') || res.status === 401) {
        sessionStorage.removeItem(CS_APIKEY_SK);
        throw new Error('Invalid API key');
      }
      throw new Error(msg);
    }

    const text = d.choices?.[0]?.message?.content ?? '';
    if (!text) throw new Error('No text response from model');

    return extractJson(text);
  }

  // Unreachable but satisfies TypeScript
  throw new Error('callLiteLLM: exhausted retry loop unexpectedly');
}
