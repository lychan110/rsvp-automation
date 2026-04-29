export type CSStatus = 'pending' | 'checking' | 'done' | 'changed' | 'left_office' | 'error';
export type ScanState = 'idle' | 'scanning' | 'done' | 'error';

// How an email address was obtained — drives display badge + export trust ordering.
export type EmailSource = 'scanned' | 'inferred' | 'manual';

// Which contact method should be used first when sending an event invitation.
export type ContactMethod = 'scheduler' | 'direct' | 'office' | 'form' | 'phone';

export interface CSJurisdiction {
  state: string;
  counties: string;
  city1: string;
  city2: string;
  city3: string;
}

export interface CSOfficial {
  name: string;
  title: string;
  district: string;
  county: string;
  category: string;

  // Email fields — all three may be populated; export logic picks the best one.
  directEmail: string;
  officeEmail: string;
  officePhone: string;

  // Scheduler/staff contact — the person who actually handles the calendar.
  // For federal officials this is often the most reliable path to getting on their schedule.
  schedulerName: string;
  schedulerEmail: string;

  // If the office uses a web form for appearance requests instead of direct email.
  appearanceFormUrl: string;

  // Tracks how the primary email was obtained; drives the INFERRED badge in the UI.
  emailSource: EmailSource;

  status: CSStatus;
  result: Record<string, string | boolean> | null;
  _scanId?: string;
}

export interface CSScanMeta {
  total: number;
  confidence: string;
  notes: string;
}

export interface CSPersistedState {
  officials: CSOfficial[];
  newOfficials: CSOfficial[];
  scanStatus: Record<string, ScanState>;
  scanMeta: Record<string, CSScanMeta>;
}

export interface InviteeExport {
  firstName: string;
  lastName: string;
  title: string;
  category: string;
  email: string;
  rsvpLink: string;
  inviteStatus: 'pending';
  sentAt: string;
  rsvpStatus: 'No Response';
  rsvpDate: string;
  notes: string;
}
