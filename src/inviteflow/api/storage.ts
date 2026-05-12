import { db } from '../db';
import type { AppEvent, Invitee } from '../types';

export async function loadEvents(): Promise<AppEvent[]> {
  return db.events.orderBy('date').reverse().toArray();
}

export async function saveEvent(event: AppEvent): Promise<string> {
  await db.events.put(event);
  return event.id;
}

export async function deleteEvent(id: string): Promise<void> {
  await db.transaction('rw', [db.events, db.invitees], async () => {
    await db.events.delete(id);
    await db.invitees.where('eventId').equals(id).delete();
  });
}

export async function loadInvitees(eventId: string): Promise<Invitee[]> {
  return db.invitees.where('eventId').equals(eventId).toArray();
}

interface SyncLogEntry {
  action: string;
  timestamp: string;
}

export async function logSync(entry: SyncLogEntry): Promise<number> {
  const id = await db.syncLog.add(entry);
  return id as number;
}