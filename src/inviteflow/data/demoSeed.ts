import type { AppEvent, Invitee, AppState } from '../types';
import { importBackupData } from '../api/storage';

// Fixed IDs so repeated demo loads are idempotent (Dexie put = upsert).
export const DEMO_EVENT_ID = 'demo-event-2026-08-14';

const DEMO_EVENT: AppEvent = {
  id: DEMO_EVENT_ID,
  name: 'Capital Region Leadership Summit',
  date: '2026-08-14',
  venue: 'Raleigh Convention Center',
  orgName: 'North Carolina Leadership Foundation',
  contactName: 'Jordan Mitchell',
  contactEmail: 'jordan.mitchell@nclf.org',
  formUrl: 'https://forms.google.com/demo-rsvp',
  rsvpResponseUrl: '',
  masterSheetUrl: '',
  entryEmail: '',
  imgEmblemUrl: '',
  vipStart: '6:00 PM',
  vipEnd: '7:00 PM',
  googleClientId: '',
};

const DEMO_INVITEES: Invitee[] = [
  // Federal — sent
  { id: 'demo-inv-01', eventId: DEMO_EVENT_ID, firstName: 'Robert',      lastName: 'Hayes',      title: 'US Senator',              category: 'Federal',   email: 'r.hayes@hayes.senate.gov',   inviteStatus: 'sent',    rsvpStatus: 'Attending',   rsvpLink: '', sentAt: '2026-07-21T10:00:00Z', rsvpDate: '2026-07-23T14:30:00Z', notes: '' },
  { id: 'demo-inv-02', eventId: DEMO_EVENT_ID, firstName: 'Patricia',    lastName: 'Summers',    title: 'US Representative',       category: 'Federal',   email: 'p.summers@mail.house.gov',   inviteStatus: 'sent',    rsvpStatus: 'Attending',   rsvpLink: '', sentAt: '2026-07-21T10:00:00Z', rsvpDate: '2026-07-24T09:00:00Z', notes: '' },
  { id: 'demo-inv-03', eventId: DEMO_EVENT_ID, firstName: 'Marcus',      lastName: 'Webb',       title: 'US Representative',       category: 'Federal',   email: 'm.webb@mail.house.gov',      inviteStatus: 'sent',    rsvpStatus: 'No Response', rsvpLink: '', sentAt: '2026-07-21T10:00:00Z', rsvpDate: '', notes: '' },
  // State — sent
  { id: 'demo-inv-04', eventId: DEMO_EVENT_ID, firstName: 'Jennifer',    lastName: 'Caldwell',   title: 'NC Governor',             category: 'State',     email: 'j.caldwell@governor.nc.gov', inviteStatus: 'sent',    rsvpStatus: 'Attending',   rsvpLink: '', sentAt: '2026-07-21T10:00:00Z', rsvpDate: '2026-07-22T16:00:00Z', notes: '' },
  { id: 'demo-inv-05', eventId: DEMO_EVENT_ID, firstName: 'Thomas',      lastName: 'Reeves',     title: 'NC Senate President',     category: 'State',     email: 't.reeves@ncleg.gov',         inviteStatus: 'sent',    rsvpStatus: 'Declined',    rsvpLink: '', sentAt: '2026-07-21T10:00:00Z', rsvpDate: '2026-07-22T11:00:00Z', notes: '' },
  { id: 'demo-inv-06', eventId: DEMO_EVENT_ID, firstName: 'Diane',       lastName: 'Holloway',   title: 'NC House Speaker',        category: 'State',     email: 'd.holloway@ncleg.gov',       inviteStatus: 'sent',    rsvpStatus: 'Declined',    rsvpLink: '', sentAt: '2026-07-21T10:00:00Z', rsvpDate: '2026-07-23T08:00:00Z', notes: '' },
  { id: 'demo-inv-07', eventId: DEMO_EVENT_ID, firstName: 'Samuel',      lastName: 'Torres',     title: 'NC State Senator',        category: 'State',     email: 's.torres@ncleg.gov',         inviteStatus: 'sent',    rsvpStatus: 'No Response', rsvpLink: '', sentAt: '2026-07-21T10:00:00Z', rsvpDate: '', notes: '' },
  // City — sent
  { id: 'demo-inv-08', eventId: DEMO_EVENT_ID, firstName: 'Mary',        lastName: 'Washington', title: 'Mayor',                   category: 'City',      email: 'm.washington@raleighnc.gov', inviteStatus: 'sent',    rsvpStatus: 'No Response', rsvpLink: '', sentAt: '2026-07-21T10:00:00Z', rsvpDate: '', notes: '' },
  { id: 'demo-inv-09', eventId: DEMO_EVENT_ID, firstName: 'Daniel',      lastName: 'Park',       title: 'Mayor',                   category: 'City',      email: 'd.park@durhamgov.gov',       inviteStatus: 'sent',    rsvpStatus: 'No Response', rsvpLink: '', sentAt: '2026-07-21T10:00:00Z', rsvpDate: '', notes: '' },
  // County — sent
  { id: 'demo-inv-10', eventId: DEMO_EVENT_ID, firstName: 'Lisa',        lastName: 'Monroe',     title: 'County Commission Chair', category: 'County',    email: 'l.monroe@wakegov.com',       inviteStatus: 'sent',    rsvpStatus: 'No Response', rsvpLink: '', sentAt: '2026-07-21T10:00:00Z', rsvpDate: '', notes: '' },
  // Business — pending
  { id: 'demo-inv-11', eventId: DEMO_EVENT_ID, firstName: 'Christopher', lastName: 'Lee',        title: 'CEO',                     category: 'Business',  email: 'c.lee@triangletech.com',     inviteStatus: 'pending', rsvpStatus: 'No Response', rsvpLink: '', sentAt: '', rsvpDate: '', notes: '' },
  { id: 'demo-inv-12', eventId: DEMO_EVENT_ID, firstName: 'Amanda',      lastName: 'Foster',     title: 'Executive Director',      category: 'Business',  email: 'a.foster@ncchamber.com',     inviteStatus: 'pending', rsvpStatus: 'No Response', rsvpLink: '', sentAt: '', rsvpDate: '', notes: '' },
  // Education — pending
  { id: 'demo-inv-13', eventId: DEMO_EVENT_ID, firstName: 'Kevin',       lastName: 'Marsh',      title: 'University President',    category: 'Education', email: 'k.marsh@unc-demo.edu',       inviteStatus: 'pending', rsvpStatus: 'No Response', rsvpLink: '', sentAt: '', rsvpDate: '', notes: '' },
  // Failed
  { id: 'demo-inv-14', eventId: DEMO_EVENT_ID, firstName: 'Richard',     lastName: 'Novak',      title: 'NC Lt. Governor',         category: 'State',     email: 'r.novak@ltgov.nc.gov',       inviteStatus: 'failed',  rsvpStatus: 'No Response', rsvpLink: '', sentAt: '2026-07-21T10:00:00Z', rsvpDate: '', notes: '' },
];

// Shaped exactly like an app export (exportData() in SettingsPage strips sendLog/sending/sendProgress).
export const DEMO_BACKUP: Omit<AppState, 'sending' | 'sendLog' | 'sendProgress'> & { exportedAt: string } = {
  exportedAt: '2026-07-21T10:00:00.000Z',
  activeEventId: DEMO_EVENT_ID,
  events: [DEMO_EVENT],
  invitees: DEMO_INVITEES,
  tab: 'tracker',
  textSubject: "You're Invited: {{EventName}} — {{EventDate}}",
  htmlBody: '',
  templateId: 'generic',
  templateParams: {
    greeting: 'Dear',
    body: "You are cordially invited to {{EventName}} on {{EventDate}} at {{Venue}}.\n\nThis exclusive gathering brings together North Carolina's leading voices in government, business, and education for an evening of dialogue and partnership.\n\nVIP Reception: {{VIPStart}}–{{VIPEnd}}\n\nPlease RSVP at your earliest convenience: {{RSVP_Link}}",
    closing: 'With warm regards,',
  },
  unsaved: false,
};

// Same code path as SettingsPage importBackup: write to Dexie, then caller dispatches LOAD_STATE.
export async function loadDemoData() {
  await importBackupData(DEMO_BACKUP);
  return DEMO_BACKUP;
}
