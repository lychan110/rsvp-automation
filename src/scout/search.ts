const SERPAPI_BASE = 'https://serpapi.com/search';

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

/**
 * Calls SerpAPI to fetch web search results.
 * Returns a formatted text block suitable for injecting into an LLM prompt.
 * Throws on API errors or missing key.
 */
export async function searchWeb(query: string, apiKey: string): Promise<string> {
  const params = new URLSearchParams({
    q: query,
    api_key: apiKey,
    engine: 'google',
    num: '10',
  });

  const res = await fetch(`${SERPAPI_BASE}?${params}`);

  if (!res.ok) {
    const msg = `SerpAPI error: ${res.status} ${res.statusText}`;
    if (res.status === 401) throw new Error('Invalid SerpAPI key');
    if (res.status === 429) throw new Error('SerpAPI rate limit exceeded — try again later');
    throw new Error(msg);
  }

  const data = await res.json();

  // Handle no results
  if (!data.organic_results || data.organic_results.length === 0) {
    return '(No search results found)';
  }

  // Format as readable text block
  const results: SearchResult[] = data.organic_results.slice(0, 10);
  const formatted = results
    .map((r, i) => `${i + 1}. **${r.title}**\n   ${r.link}\n   ${r.snippet}`)
    .join('\n\n');

  return `SEARCH RESULTS FOR "${query}":\n\n${formatted}`;
}

/**
 * Builds a search query for scanning officials in a given category.
 */
export function buildSearchQuery(category: string, jurisdiction: string): string {
  const base = `current elected officials 2025 2026 ${jurisdiction}`;
  switch (category) {
    case 'us-congress':
      return `${base} US Senate US House representatives`;
    case 'state-exec':
      return `${base} governor lieutenant governor attorney general`;
    case 'state-senate':
      return `${base} state senate`;
    case 'state-house':
      return `${base} state house representatives`;
    case 'city-1':
    case 'city-2':
    case 'city-3':
      return `${base} mayor city council`;
    default:
      return base;
  }
}
