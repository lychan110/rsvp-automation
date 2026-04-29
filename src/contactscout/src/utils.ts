import type { CSOfficial, CSJurisdiction, InviteeExport } from './types';
import { bestEmail } from './emailPatterns';

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/**
 * Converts an official to the InviteFlow invitee schema for export.
 * Contact priority: schedulerEmail > directEmail > officeEmail.
 * This means if a scheduler was found, the invitation goes to them — exactly
 * the right person for event appearance requests.
 */
export function officialToInvitee(o: CSOfficial): InviteeExport {
  const parts = o.name.trim().split(/\s+/);
  const email = bestEmail(o);

  // Build notes: district, county, and flag if using scheduler or appearance form.
  const noteParts: string[] = [];
  if (o.district) noteParts.push(o.district);
  if (o.county)   noteParts.push(o.county);
  if (o.schedulerEmail && email === o.schedulerEmail && o.schedulerName) {
    noteParts.push(`via scheduler: ${o.schedulerName}`);
  }
  if (o.appearanceFormUrl && !email) {
    noteParts.push(`form: ${o.appearanceFormUrl}`);
  }

  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
    title: o.title,
    category: o.category,
    email,
    rsvpLink: '',
    inviteStatus: 'pending',
    sentAt: '',
    rsvpStatus: 'No Response',
    rsvpDate: '',
    notes: noteParts.join(' · '),
  };
}

/**
 * Builds scan prompts from jurisdiction settings.
 * Prompts are scheduler-aware: they explicitly request the name and email of
 * the official's scheduler/chief-of-staff alongside the official's own contact.
 */
export function buildScanPrompts(jx: CSJurisdiction): Record<string, string> {
  const st = jx.state.trim()    || '[YOUR STATE]';
  const co = jx.counties.trim() || '[YOUR COUNTIES]';
  const c1 = jx.city1.trim()    || '[CITY 1]';
  const c2 = jx.city2.trim()    || '[CITY 2]';
  const c3 = jx.city3.trim()    || '[CITY 3]';

  const schedNote =
    `For each official, also search for their SCHEDULER or CHIEF OF STAFF (the person who manages ` +
    `event invitations and appearance requests) and return their name and email in schedulerName/schedulerEmail. ` +
    `If the office uses a web form for appearance requests, return that URL in appearanceFormUrl.`;

  return {
    'us-congress': (
      `Search for every current US Congress member for ${st} (119th Congress 2025-2026): ` +
      `all House representatives and both senators. For each: full name, title (e.g. "U.S. Representative"), ` +
      `district number (House only), official email. ${schedNote}`
    ),
    'state-exec': (
      `Search for all current ${st} statewide executive elected officials as of 2025-2026: ` +
      `Governor, Lt. Governor, Attorney General, State Treasurer, State Auditor, ` +
      `Superintendent of Public Instruction, and any other statewide commissioners. ` +
      `Full name, title, official contact email. ${schedNote}`
    ),
    'state-senate': (
      `Search for ALL current ${st} State Senate members as of 2025-2026. ` +
      `Full name, district number, official contact email. Include every seat. ${schedNote}`
    ),
    'state-house': (
      `Search for all current ${st} State House members representing ${co} as of 2025-2026. ` +
      `Full name, district number, county, official contact email. ${schedNote}`
    ),
    'city-1': (
      `Search for the current ${c1} city government as of 2025-2026: ` +
      `the Mayor and every current City Council member. ` +
      `Full name, title, official contact email. ${schedNote}`
    ),
    'city-2': (
      `Search for the current ${c2} city government as of 2025-2026: ` +
      `the Mayor and every current City Council member. ` +
      `Full name, title, official contact email. ${schedNote}`
    ),
    'city-3': (
      `Search for the current ${c3} city government as of 2025-2026: ` +
      `the Mayor and every current City Council member. ` +
      `Full name, title, official contact email. ${schedNote}`
    ),
  };
}

export function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function todaySlug() {
  return new Date().toISOString().slice(0, 10);
}
