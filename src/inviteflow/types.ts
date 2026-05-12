export type TabId = 'events' | 'setup' | 'invitees' | 'compose' | 'send' | 'tracker' | 'sync';

export interface AppEvent {
  id: string;
  name: string;
  date: string;
  venue: string;
  orgName: string;
  contactName: string;
  contactEmail: string;
  formUrl: string;
  rsvpResponseUrl: string;
  masterSheetUrl: string;
  entryEmail: string;
  imgEmblemUrl: string;
  vipStart: string;
  vipEnd: string;
  googleClientId: string;
}

export interface Invitee {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  title: string;
  category: string;
  email: string;
  rsvpLink: string;
  inviteStatus: 'pending' | 'sent' | 'failed';
  sentAt: string;
  rsvpStatus: 'No Response' | 'Attending' | 'Declined';
  rsvpDate: string;
  notes: string;
}

export interface SendLogEntry {
  id: string;
  email: string;
  name: string;
  status: 'sent' | 'failed';
  timestamp: string;
  error?: string;
}

export interface AppState {
  activeEventId: string | null;
  events: AppEvent[];
  invitees: Invitee[];
  tab: TabId;
  textSubject: string;
  htmlBody: string;
  sendLog: SendLogEntry[];
  sending: boolean;
  sendProgress: { current: number; total: number };
  unsaved: boolean;
}
