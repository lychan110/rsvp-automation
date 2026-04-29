import type { CSStatus } from './types';

export const CS_LS_KEY    = 'contactscout_state';
export const CS_JX_KEY    = 'contactscout_jurisdiction';
export const CS_APIKEY_SK = 'cs_api_key';
export const CS_OS_KEY    = 'cs_os_key';
export const SCOUT_PW     = 'scout2025';

// Model IDs — update here when new releases drop; api.ts + App.tsx read these.
export const MODEL_SCAN   = 'gemini-2.5-flash';
export const MODEL_VERIFY = 'gemini-2.5-flash';

export const SCAN_TARGETS = [
  { id: 'us-congress',  label: 'US Congress',          desc: 'All current US reps + senators for your state' },
  { id: 'state-exec',   label: 'State Executive',       desc: 'Governor, Lt. Gov, AG, Treasurer, Auditor, commissioners' },
  { id: 'state-senate', label: 'State Senate',          desc: 'Full current state senate roster' },
  { id: 'state-house',  label: 'State House',           desc: 'House members for your tracked counties' },
  { id: 'city-1',       label: 'City Council — City 1', desc: 'Current mayor and all council members' },
  { id: 'city-2',       label: 'City Council — City 2', desc: 'Current mayor and all council members' },
  { id: 'city-3',       label: 'City Council — City 3', desc: 'Current mayor and all council members' },
] as const;

// JSON schema carried in system prompts.
// The scheduler fields are the critical addition: for event invitations you contact
// the scheduler, not the official directly. The LLM is asked to find both.
const SCAN_JSON_SCHEMA =
  `{"officials":[{` +
  `"name":"","title":"","district":"","county":"",` +
  `"category":"US Senate|US House|Executive|State Senate|House|City Council",` +
  `"directEmail":"","officeEmail":"","officePhone":"",` +
  `"schedulerName":"","schedulerEmail":"",` +
  `"appearanceFormUrl":""}],` +
  `"confidence":"high|medium|low","notes":""}`;

export const SCAN_SYS =
  `You are a research assistant finding current elected officials (2025-2026) using web search.\n` +
  `For each official also search for their SCHEDULER or CHIEF OF STAFF — the person who manages event\n` +
  `invitations and appearance requests. If the office uses a web form instead of a direct email for\n` +
  `appearance requests, capture that URL in appearanceFormUrl.\n` +
  `Respond ONLY with valid JSON, no markdown fences:\n` +
  SCAN_JSON_SCHEMA;

const VERIFY_JSON_SCHEMA =
  `{"stillInOffice":true,"currentTitle":"","directEmail":"","officeEmail":"","officePhone":"",` +
  `"schedulerName":"","schedulerEmail":"","appearanceFormUrl":"",` +
  `"changes":"No changes detected","flags":"","replacedBy":"","confidence":"high"}`;

export const VERIFY_SYS =
  `You are verifying an elected official's current status and contact details (2025-2026) using web search.\n` +
  `In addition to the official's own contact info, search for their SCHEDULER or CHIEF OF STAFF who handles\n` +
  `event invitations. If their office uses a web form for appearance requests, find and return that URL.\n` +
  `Respond ONLY with valid JSON, no markdown fences:\n` +
  VERIFY_JSON_SCHEMA;

export const CATS = ['All', 'US Senate', 'US House', 'Executive', 'State Senate', 'House', 'City Council'] as const;

export const STATUS_LABEL: Record<CSStatus, string> = {
  pending: 'PENDING', checking: 'CHECKING', done: 'VERIFIED',
  changed: 'CHANGED', left_office: 'LEFT OFFICE', error: 'ERROR',
};

export const STATUS_COLOR: Record<CSStatus, string> = {
  pending: '#8b949e', checking: '#f59e0b', done: '#3fb950',
  changed: '#58a6ff', left_office: '#f85149', error: '#e3b341',
};
