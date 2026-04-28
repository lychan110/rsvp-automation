export type CSStatus = 'pending' | 'checking' | 'done' | 'changed' | 'left_office' | 'error';
export type ScanState = 'idle' | 'scanning' | 'done' | 'error';

export interface CSOfficial {
  name: string;
  title: string;
  district: string;
  county: string;
  category: string;
  directEmail: string;
  officeEmail: string;
  officePhone: string;
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
