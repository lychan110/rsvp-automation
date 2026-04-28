import type { CSOfficial, CSJurisdiction, InviteeExport } from './types';

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export function officialToInvitee(o: CSOfficial): InviteeExport {
  const parts = o.name.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
    title: o.title,
    category: o.category,
    email: o.officeEmail || o.directEmail || '',
    rsvpLink: '',
    inviteStatus: 'pending',
    sentAt: '',
    rsvpStatus: 'No Response',
    rsvpDate: '',
    notes: [o.district, o.county].filter(Boolean).join(' · '),
  };
}

export function buildScanPrompts(jx: CSJurisdiction): Record<string, string> {
  const st = jx.state.trim()    || '[YOUR STATE]';
  const co = jx.counties.trim() || '[YOUR COUNTIES]';
  const c1 = jx.city1.trim()    || '[CITY 1]';
  const c2 = jx.city2.trim()    || '[CITY 2]';
  const c3 = jx.city3.trim()    || '[CITY 3]';
  return {
    'us-congress':  `Search for every current US Congress member for ${st} (119th Congress 2025-2026): all House reps + 2 senators. For each: full name, title, district, official scheduler/contact email.`,
    'state-exec':   `Search for all current ${st} statewide executive elected officials as of 2025: Governor, Lt. Governor, AG, Treasurer, Auditor, Superintendent of Public Instruction, and other commissioners. Full name, title, email.`,
    'state-senate': `Search for all current ${st} State Senate members as of 2025. Full name, district, official email.`,
    'state-house':  `Search for all current ${st} House members for ${co} as of 2025. Full name, district, county, official email.`,
    'city-1':       `Search for current ${c1} City Council as of 2025. Mayor + every council member: full name, title, official email.`,
    'city-2':       `Search for current ${c2} City Council as of 2025. Mayor + every council member: full name, title, official email.`,
    'city-3':       `Search for current ${c3} City Council as of 2025. Mayor + every council member: full name, title, official email.`,
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
