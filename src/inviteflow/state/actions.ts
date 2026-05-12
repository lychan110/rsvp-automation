import type { AppEvent, AppState, Invitee, SendLogEntry, TabId } from '../types';

export type Action =
  | { type: 'SET_TAB'; tab: TabId }
  | { type: 'SET_EVENTS'; events: AppEvent[] }
  | { type: 'ADD_EVENT'; event: AppEvent }
  | { type: 'UPDATE_EVENT'; event: AppEvent }
  | { type: 'DELETE_EVENT'; id: string }
  | { type: 'SET_ACTIVE_EVENT'; id: string | null }
  | { type: 'SET_INVITEES'; invitees: Invitee[] }
  | { type: 'ADD_INVITEE'; invitee: Invitee }
  | { type: 'UPDATE_INVITEE'; invitee: Invitee }
  | { type: 'DELETE_INVITEES'; ids: string[] }
  | { type: 'SET_COMPOSE'; subject: string; html: string }
  | { type: 'START_SEND'; total: number }
  | { type: 'SEND_PROGRESS'; current: number }
  | { type: 'LOG_SEND'; entry: SendLogEntry }
  | { type: 'STOP_SEND' }
  | { type: 'SET_UNSAVED'; unsaved: boolean }
  | { type: 'REFRESH_INVITEES' }
  | { type: 'LOAD_STATE'; partial: Partial<AppState> };
