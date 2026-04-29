import { CS_LS_KEY, CS_JX_KEY } from './constants';
import type { CSPersistedState, CSJurisdiction } from './types';

const EMPTY_STATE: CSPersistedState = { officials: [], newOfficials: [], scanStatus: {}, scanMeta: {} };
const EMPTY_JX: CSJurisdiction = { state: '', counties: '', city1: '', city2: '', city3: '' };

export function loadCSState(): CSPersistedState {
  try {
    const raw = localStorage.getItem(CS_LS_KEY);
    return raw ? (JSON.parse(raw) as CSPersistedState) : { ...EMPTY_STATE };
  } catch {
    return { ...EMPTY_STATE };
  }
}

export function saveCSState(s: CSPersistedState) {
  try { localStorage.setItem(CS_LS_KEY, JSON.stringify(s)); } catch { /* quota */ }
}

export function loadJurisdiction(): CSJurisdiction {
  try {
    const raw = localStorage.getItem(CS_JX_KEY);
    return raw ? (JSON.parse(raw) as CSJurisdiction) : { ...EMPTY_JX };
  } catch {
    return { ...EMPTY_JX };
  }
}

export function saveJurisdiction(jx: CSJurisdiction) {
  try { localStorage.setItem(CS_JX_KEY, JSON.stringify(jx)); } catch { /* quota */ }
}
