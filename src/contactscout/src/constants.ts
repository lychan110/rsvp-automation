import type { CSStatus } from './types';

export const CS_LS_KEY = 'contactscout_state';
export const CS_JX_KEY = 'contactscout_jurisdiction';
export const CS_APIKEY_SK = 'cs_api_key';
export const SCOUT_PW = 'scout2025';

export const SCAN_TARGETS = [
  { id: 'us-congress',  label: 'US Congress',          desc: 'All current US reps + senators for your state' },
  { id: 'state-exec',   label: 'State Executive',       desc: 'Governor, Lt. Gov, AG, Treasurer, Auditor, commissioners' },
  { id: 'state-senate', label: 'State Senate',          desc: 'Full current state senate roster' },
  { id: 'state-house',  label: 'State House',           desc: 'House members for your tracked counties' },
  { id: 'city-1',       label: 'City Council — City 1', desc: 'Current mayor and all council members' },
  { id: 'city-2',       label: 'City Council — City 2', desc: 'Current mayor and all council members' },
  { id: 'city-3',       label: 'City Council — City 3', desc: 'Current mayor and all council members' },
] as const;

export const VERIFY_SYS =
  `Verify this elected official for 2025-2026 using web search. Respond ONLY with valid JSON no markdown:\n` +
  `{"stillInOffice":true,"currentTitle":"","directEmail":"","officeEmail":"","officePhone":"","changes":"No changes detected","flags":"","replacedBy":"","confidence":"high"}`;

export const SCAN_SYS =
  `Find all current elected officials for 2025-2026 using web search. Respond ONLY with valid JSON no markdown:\n` +
  `{"officials":[{"name":"","title":"","district":"","county":"","category":"US Senate|US House|Executive|State Senate|House|City Council","directEmail":"","officeEmail":"","officePhone":""}],"confidence":"high","notes":""}`;

export const CATS = ['All', 'US Senate', 'US House', 'Executive', 'State Senate', 'House', 'City Council'] as const;

export const STATUS_LABEL: Record<CSStatus, string> = {
  pending: 'PENDING', checking: 'CHECKING', done: 'VERIFIED',
  changed: 'CHANGED', left_office: 'LEFT OFFICE', error: 'ERROR',
};

export const STATUS_COLOR: Record<CSStatus, string> = {
  pending: '#8b949e', checking: '#f59e0b', done: '#3fb950',
  changed: '#58a6ff', left_office: '#f85149', error: '#e3b341',
};
