import { CS_APIKEY_SK } from './constants';

export async function callClaude(
  key: string,
  sys: string,
  user: string,
): Promise<Record<string, unknown>> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: sys,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: user }],
    }),
  });

  if (res.status === 401) {
    sessionStorage.removeItem(CS_APIKEY_SK);
    throw new Error('Invalid API key');
  }

  const d = await res.json() as {
    content?: Array<{ type: string; text?: string }>;
    error?: { message: string };
  };

  if (d.error) throw new Error(d.error.message ?? 'API error');
  const text = d.content?.find(b => b.type === 'text')?.text ?? '';
  if (!text) throw new Error('No text response');
  return JSON.parse(text.replace(/```json|```/g, '').trim()) as Record<string, unknown>;
}
