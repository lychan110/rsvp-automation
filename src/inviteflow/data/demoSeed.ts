import { saveEvent, saveInvitee, loadEvents } from '../api/storage';
import type { AppEvent, Invitee } from '../types';

export const DEMO_EVENT_ID = 'demo-event-2026-08';

export const DEMO_EVENT: AppEvent = {
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

function makeInv(
  partial: Omit<Invitee, 'id' | 'eventId' | 'rsvpLink' | 'sentAt' | 'rsvpDate' | 'notes'>
): Invitee {
  return {
    id: crypto.randomUUID(),
    eventId: DEMO_EVENT_ID,
    rsvpLink: '',
    sentAt: partial.inviteStatus !== 'pending' ? '2026-07-21T10:00:00Z' : '',
    rsvpDate: partial.rsvpStatus !== 'No Response' ? '2026-07-23T14:30:00Z' : '',
    notes: '',
    ...partial,
  };
}

export const DEMO_INVITEES: Invitee[] = [
  // Federal — sent
  makeInv({ firstName: 'Robert',    lastName: 'Hayes',    title: 'US Senator',             category: 'Federal',   email: 'r.hayes@hayes.senate.gov',     inviteStatus: 'sent',   rsvpStatus: 'Attending'   }),
  makeInv({ firstName: 'Patricia',  lastName: 'Summers',  title: 'US Representative',      category: 'Federal',   email: 'p.summers@mail.house.gov',     inviteStatus: 'sent',   rsvpStatus: 'Attending'   }),
  makeInv({ firstName: 'Marcus',    lastName: 'Webb',     title: 'US Representative',      category: 'Federal',   email: 'm.webb@mail.house.gov',        inviteStatus: 'sent',   rsvpStatus: 'No Response' }),
  // State — sent
  makeInv({ firstName: 'Jennifer',  lastName: 'Caldwell', title: 'NC Governor',            category: 'State',     email: 'j.caldwell@governor.nc.gov',   inviteStatus: 'sent',   rsvpStatus: 'Attending'   }),
  makeInv({ firstName: 'Thomas',    lastName: 'Reeves',   title: 'NC Senate President',    category: 'State',     email: 't.reeves@ncleg.gov',           inviteStatus: 'sent',   rsvpStatus: 'Declined'    }),
  makeInv({ firstName: 'Diane',     lastName: 'Holloway', title: 'NC House Speaker',       category: 'State',     email: 'd.holloway@ncleg.gov',         inviteStatus: 'sent',   rsvpStatus: 'Declined'    }),
  makeInv({ firstName: 'Samuel',    lastName: 'Torres',   title: 'NC State Senator',       category: 'State',     email: 's.torres@ncleg.gov',           inviteStatus: 'sent',   rsvpStatus: 'No Response' }),
  // City — sent
  makeInv({ firstName: 'Mary',      lastName: 'Washington', title: 'Mayor',               category: 'City',      email: 'm.washington@raleighnc.gov',   inviteStatus: 'sent',   rsvpStatus: 'No Response' }),
  makeInv({ firstName: 'Daniel',    lastName: 'Park',     title: 'Mayor',                  category: 'City',      email: 'd.park@durhamgov.gov',         inviteStatus: 'sent',   rsvpStatus: 'No Response' }),
  // County — sent
  makeInv({ firstName: 'Lisa',      lastName: 'Monroe',   title: 'County Commission Chair', category: 'County',   email: 'l.monroe@wakegov.com',         inviteStatus: 'sent',   rsvpStatus: 'No Response' }),
  // Business — pending
  makeInv({ firstName: 'Christopher', lastName: 'Lee',    title: 'CEO',                    category: 'Business',  email: 'c.lee@triangletech.com',       inviteStatus: 'pending', rsvpStatus: 'No Response' }),
  makeInv({ firstName: 'Amanda',    lastName: 'Foster',   title: 'Executive Director',     category: 'Business',  email: 'a.foster@ncchamber.com',       inviteStatus: 'pending', rsvpStatus: 'No Response' }),
  // Education — pending
  makeInv({ firstName: 'Kevin',     lastName: 'Marsh',    title: 'University President',   category: 'Education', email: 'k.marsh@unc-demo.edu',         inviteStatus: 'pending', rsvpStatus: 'No Response' }),
  // Failed
  makeInv({ firstName: 'Richard',   lastName: 'Novak',    title: 'NC Lt. Governor',        category: 'State',     email: 'r.novak@ltgov.nc.gov',         inviteStatus: 'failed', rsvpStatus: 'No Response' }),
];

export const DEMO_COMPOSE = {
  templateId: 'generic',
  templateParams: {
    greeting: 'Dear',
    body: "You are cordially invited to {{EventName}} on {{EventDate}} at {{Venue}}.\n\nThis exclusive gathering brings together North Carolina's leading voices in government, business, and education for an evening of dialogue and partnership.\n\nVIP Reception: {{VIPStart}}–{{VIPEnd}}\n\nPlease RSVP at your earliest convenience: {{RSVP_Link}}",
    closing: 'With warm regards,',
  },
  textSubject: "You're Invited: {{EventName}} — {{EventDate}}",
};

export async function loadDemoData() {
  // Skip if demo event already in Dexie to prevent duplicate inserts.
  const existing = await loadEvents();
  if (!existing.find(e => e.id === DEMO_EVENT_ID)) {
    await saveEvent(DEMO_EVENT);
    for (const inv of DEMO_INVITEES) {
      await saveInvitee(inv);
    }
  }
  return { event: DEMO_EVENT, invitees: DEMO_INVITEES, compose: DEMO_COMPOSE };
}
