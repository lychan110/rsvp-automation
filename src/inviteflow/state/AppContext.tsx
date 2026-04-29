import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AppState } from '../types';
import type { Action } from './actions';
import { reducer, INITIAL_STATE } from './reducer';

const STORAGE_KEY = 'inviteflow_v3_state';

function saveState(state: AppState) {
  const { sendLog: _sl, sending: _s, sendProgress: _sp, ...rest } = state;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rest)); } catch { /* quota */ }
}

function loadPersistedState(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

const StateCtx = createContext<AppState>(INITIAL_STATE);
const DispatchCtx = createContext<React.Dispatch<Action>>(() => {});

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE, () => ({
    ...INITIAL_STATE,
    ...loadPersistedState(),
  }));

  useEffect(() => { saveState(state); }, [state]);

  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>
        {children}
      </DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export const useAppState = () => useContext(StateCtx);
export const useAppDispatch = () => useContext(DispatchCtx);
