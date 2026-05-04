/**
 * Open States v3 API client — fetches current state legislators.
 *
 * Used for state-senate and state-house scan targets as a structured-data
 * alternative to LLM-based web search. Returns actual email addresses from the
 * official Open States dataset rather than LLM-inferred addresses.
 *
 * Free tier: no rate limit enforced on v3. Pagination: max 100 per page.
 * API key registration: https://openstates.org/api/
 *
 * Note: county filtering is not available — Open States returns all legislators
 * for the chamber. For state-house scans, all districts are returned and the
 * user dismisses those outside their tracked counties.
 *
 * Scheduler/chief-of-staff fields are left empty; the Verify flow fills them
 * individually via LLM web search when the user verifies an official.
 */

import type { CSOfficial, EmailSource } from './types';

const BASE = 'https://v3.openstates.org';

interface OSOffice {
  name?: string;
  email?: string | null;
  voice?: string | null;
}

interface OSPerson {
  name: string;
  current_role: {
    title: string;
    org_classification: 'upper' | 'lower';
    district: string;
  } | null;
  offices: OSOffice[];
}

interface OSResponse {
  results: OSPerson[];
  pagination: {
    per_page: number;
    page: number;
    max_page: number;
    total_items: number;
  };
}

/**
 * Fetches all current legislators for a state chamber from Open States v3.
 * Handles pagination automatically (100 per page).
 *
 * @param apiKey  Open States API key (registered at openstates.org/api/)
 * @param state   State name or abbreviation (case-insensitive). E.g. "nc" or "North Carolina".
 * @param chamber "upper" for Senate, "lower" for House.
 * @returns       Array of CSOfficial records and total count.
 * @throws        Error with message "Invalid Open States API key" on 401/403.
 */
export async function fetchStateLegislators(
  apiKey: string,
  state: string,
  chamber: 'upper' | 'lower',
): Promise<{ officials: CSOfficial[]; total: number }> {
  const jurisdiction = state.trim().toLowerCase();
  const collected: OSPerson[] = [];
  let page = 1;

  while (true) {
    const url =
      `${BASE}/people` +
      `?jurisdiction=${encodeURIComponent(jurisdiction)}` +
      `&classification=legislator` +
      `&chamber=${chamber}` +
      `&per_page=100` +
      `&page=${page}` +
      `&apikey=${encodeURIComponent(apiKey)}`;

    const res = await fetch(url);

    if (res.status === 401 || res.status === 403) {
      throw new Error('Invalid Open States API key');
    }
    if (!res.ok) {
      throw new Error(`Open States API error ${res.status}: ${await res.text().catch(() => '')}`);
    }

    const data = await res.json() as OSResponse;
    collected.push(...data.results);

    if (page >= data.pagination.max_page) break;
    page++;
  }

  const category = chamber === 'upper' ? 'State Senate' : 'House';

  const officials: CSOfficial[] = collected.map(p => {
    const email = p.offices.find(o => o.email)?.email ?? '';
    const phone = p.offices.find(o => o.voice)?.voice ?? '';
    const src: EmailSource = email ? 'scanned' : 'inferred';

    return {
      name:             p.name,
      title:            p.current_role?.title ?? (chamber === 'upper' ? 'State Senator' : 'State Representative'),
      district:         p.current_role?.district ?? '',
      county:           '',
      category,
      directEmail:      '',
      officeEmail:      email,
      officePhone:      phone,
      schedulerName:    '',
      schedulerEmail:   '',
      appearanceFormUrl: '',
      emailSource:      src,
      status:           'pending',
      result:           null,
    };
  });

  return { officials, total: collected.length };
}
