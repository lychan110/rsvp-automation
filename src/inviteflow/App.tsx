import { AppProvider, useAppState, useAppDispatch } from './state/AppContext';
import type { TabId } from './types';

const TABS: { id: TabId; label: string }[] = [
  { id: 'events', label: 'Events' },
  { id: 'setup', label: 'Setup' },
  { id: 'invitees', label: 'Invitees' },
  { id: 'compose', label: 'Compose' },
  { id: 'send', label: 'Send' },
  { id: 'tracker', label: 'Tracker' },
  { id: 'sync', label: 'Sync' },
];

function AppInner() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  return (
    <div style={{ minHeight: '100vh', background: '#080c10', color: '#c9d1d9', fontFamily: 'monospace', display: 'flex', flexDirection: 'column' }}>
      <header style={{ borderBottom: '1px solid #21262d', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontWeight: 800, fontSize: 16, color: '#f0f6fc', letterSpacing: '-0.02em' }}>INVITEFLOW</span>
        <span style={{ fontSize: 10, color: '#6e7681', letterSpacing: '0.12em' }}>v3</span>
        {state.unsaved && <span style={{ fontSize: 9, color: '#C8A84B', letterSpacing: '0.1em' }}>UNSAVED</span>}
        <nav style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => dispatch({ type: 'SET_TAB', tab: t.id })}
              style={{
                background: state.tab === t.id ? '#1f6feb' : 'transparent',
                border: state.tab === t.id ? '1px solid #1f6feb' : '1px solid #21262d',
                color: state.tab === t.id ? '#fff' : '#8b949e',
                padding: '4px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: 10,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main style={{ flex: 1, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6e7681', fontSize: 12 }}>
          Tab: <strong style={{ color: '#c9d1d9' }}>{state.tab}</strong> — implementation in progress
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return <AppProvider><AppInner /></AppProvider>;
}
