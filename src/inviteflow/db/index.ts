import Dexie, { type EntityTable } from 'dexie';
import type { AppEvent, Invitee } from '../types';

interface SyncLogEntry {
  id?: number;
  action: string;
  source: string;
  timestamp: string;
  details: string;
}

class ConveneDB extends Dexie {
  events!: EntityTable<AppEvent, 'id'>;
  invitees!: EntityTable<Invitee, 'id'>;
  syncLog!: EntityTable<SyncLogEntry, 'id'>;

  constructor() {
    super('ConveneDB');
    this.version(1).stores({
      events: '&id, name',
      invitees: '&id, eventId, email, inviteStatus',
      syncLog: '++id, action, timestamp',
    });
  }
}

export const db = new ConveneDB();