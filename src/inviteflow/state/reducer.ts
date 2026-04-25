import type { AppState } from '../types';
import type { Action } from './actions';

export const INITIAL_STATE: AppState = {
  activeEventId: null,
  events: [],
  invitees: [],
  tab: 'tracker',
  textSubject: '',
  htmlBody: '',
  sendLog: [],
  sending: false,
  sendProgress: { current: 0, total: 0 },
  unsaved: false,
  theme: 'dark',
};

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, tab: action.tab };
    case 'SET_EVENTS':
      return { ...state, events: action.events };
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.event], unsaved: true };
    case 'UPDATE_EVENT':
      return { ...state, events: state.events.map(e => e.id === action.event.id ? action.event : e), unsaved: true };
    case 'DELETE_EVENT': {
      const events = state.events.filter(e => e.id !== action.id);
      const activeEventId = state.activeEventId === action.id ? (events[0]?.id ?? null) : state.activeEventId;
      return { ...state, events, activeEventId, unsaved: true };
    }
    case 'SET_ACTIVE_EVENT':
      return { ...state, activeEventId: action.id, invitees: [], unsaved: false };
    case 'SET_INVITEES':
      return { ...state, invitees: action.invitees, unsaved: true };
    case 'ADD_INVITEE':
      return { ...state, invitees: [...state.invitees, action.invitee], unsaved: true };
    case 'UPDATE_INVITEE':
      return { ...state, invitees: state.invitees.map(i => i.id === action.invitee.id ? action.invitee : i), unsaved: true };
    case 'DELETE_INVITEES':
      return { ...state, invitees: state.invitees.filter(i => !action.ids.includes(i.id)), unsaved: true };
    case 'SET_COMPOSE':
      return { ...state, textSubject: action.subject, htmlBody: action.html, unsaved: true };
    case 'START_SEND':
      return { ...state, sending: true, sendLog: [], sendProgress: { current: 0, total: action.total } };
    case 'SEND_PROGRESS':
      return { ...state, sendProgress: { ...state.sendProgress, current: action.current } };
    case 'LOG_SEND':
      return { ...state, sendLog: [...state.sendLog, action.entry] };
    case 'STOP_SEND':
      return { ...state, sending: false };
    case 'SET_UNSAVED':
      return { ...state, unsaved: action.unsaved };
    case 'LOAD_STATE':
      return { ...state, ...action.partial };
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    default:
      return state;
  }
}
