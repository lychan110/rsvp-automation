/**
 * Deterministic email pattern inference for elected officials.
 *
 * The exploration report's "scraper path" cannot run in a browser (CORS).
 * What IS portable is the email address patterns themselves — these are publicly
 * documented conventions that government offices follow:
 *
 *   Federal House:   FirstName.LastName@mail.house.gov
 *   Federal Senate:  FirstName.LastName@{surname}.senate.gov
 *   NC State Leg:    FirstName.LastName@ncleg.gov
 *
 * These are applied POST-SCAN to fill in officials who have no scanned email,
 * reducing reliance on a second LLM call just to get a guessable address.
 *
 * Challenge to the exploration report: the report conflates "scheduler email"
 * with "official email". The pattern above reaches the OFFICIAL's office mailbox,
 * not the scheduler directly. Scheduler emails follow no standard pattern and
 * MUST come from LLM web-search. Inferred emails are therefore marked as such
 * and ranked below scanned/manual in the contact priority order.
 */

import type { CSOfficial, CSJurisdiction } from './types';

function normalise(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')  // strip diacritics
    .replace(/[^a-z\s'-]/g, '')
    .trim();
}

function nameParts(name: string): { first: string; last: string } {
  const parts = normalise(name).split(/\s+/);
  return {
    first: parts[0] ?? '',
    last:  parts[parts.length - 1] ?? '',
  };
}

/**
 * Returns a deterministically inferred email for a federal House member.
 * Pattern: FirstName.LastName@mail.house.gov
 */
export function inferHouseEmail(name: string): string {
  const { first, last } = nameParts(name);
  if (!first || !last) return '';
  return `${first}.${last}@mail.house.gov`;
}

/**
 * Returns a deterministically inferred email for a federal Senator.
 * Pattern: FirstName.LastName@{surname}.senate.gov
 */
export function inferSenateEmail(name: string): string {
  const { first, last } = nameParts(name);
  if (!first || !last) return '';
  return `${first}.${last}@${last}.senate.gov`;
}

/**
 * Returns a deterministically inferred email for an NC General Assembly member.
 * Pattern: FirstName.LastName@ncleg.gov
 * Source: https://www.ncleg.gov — standard for all members.
 */
export function inferNCLegEmail(name: string): string {
  const { first, last } = nameParts(name);
  if (!first || !last) return '';
  return `${first}.${last}@ncleg.gov`;
}

/**
 * Main entry point.  Returns an inferred email (or empty string) for an official
 * that has no scanned email, based on their category and jurisdiction state.
 *
 * Scope: only fills `directEmail` (office-inbox pattern) — never scheduler email,
 * which has no standard pattern and must be sourced from LLM web search.
 */
export function inferEmail(official: CSOfficial, jx: CSJurisdiction): string {
  const st = jx.state.trim().toLowerCase();

  switch (official.category) {
    case 'US House':
      return inferHouseEmail(official.name);

    case 'US Senate':
      return inferSenateEmail(official.name);

    case 'State Senate':
    case 'House':
      if (st === 'north carolina' || st === 'nc') {
        return inferNCLegEmail(official.name);
      }
      return '';

    default:
      // Executive and City Council have no standard pattern — too varied.
      return '';
  }
}

/**
 * Applies email inference to a batch of officials.
 * Only modifies officials with no directEmail and no officeEmail.
 * Sets emailSource to 'inferred' on modified officials.
 * Returns a new array (does not mutate).
 */
export function applyEmailInference(
  officials: CSOfficial[],
  jx: CSJurisdiction,
): { officials: CSOfficial[]; inferredCount: number } {
  let inferredCount = 0;
  const updated = officials.map(o => {
    if (o.directEmail || o.officeEmail) return o;
    const inferred = inferEmail(o, jx);
    if (!inferred) return o;
    inferredCount++;
    return { ...o, directEmail: inferred, emailSource: 'inferred' as const };
  });
  return { officials: updated, inferredCount };
}

/**
 * Returns the best contact email for an official, in priority order:
 *   1. schedulerEmail  — most likely to reach the right person for event invites
 *   2. directEmail     — official's own inbox (may be inferred)
 *   3. officeEmail     — general office inbox
 *
 * appearanceFormUrl takes precedence over all email when it exists, but that
 * logic lives in the export layer since InviteFlow only accepts email fields.
 */
export function bestEmail(o: CSOfficial): string {
  return o.schedulerEmail || o.directEmail || o.officeEmail || '';
}
