import { AppProvider, useAppState, useAppDispatch } from './state/AppContext';
import type { TabId } from './types';
import EventsTab from './tabs/EventsTab';
import SetupTab from './tabs/SetupTab';
import InviteesTab from './tabs/InviteesTab';
import ComposeTab from './tabs/ComposeTab';
import SendTab from './tabs/SendTab';
import TrackerTab from './tabs/TrackerTab';
import SyncTab from './tabs/SyncTab';

const TABS: { id: TabId; label: string }[] = [
  { id: 'events', label: 'Events' },
  { id: 'setup', label: 'Setup' },
  { id: 'invitees', label: 'Invitees' },
  { id: 'compose', label: 'Compose' },
  { id: 'send', label: 'Send' },
  { id: 'tracker', label: 'Tracker' },
  { id: 'sync', label: 'Sync' },
];

function TabContent() {
  const { tab } = useAppState();
  switch (tab) {
    case 'events': return <EventsTab />;
    case 'setup': return <SetupTab />;
    case 'invitees': return <InviteesTab />;
    case 'compose': return <ComposeTab />;
    case 'send': return <SendTab />;
    case 'tracker': return <TrackerTab />;
    case 'sync': return <SyncTab />;
  }
}

function AppInner() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const activeEvent = state.events.find(e => e.id === state.activeEventId);

  return (
    <div style={{ height: '100vh', background: '#080c10', color: '#c9d1d9', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <header style={{ borderBottom: '1px solid #21262d', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span style={{ fontWeight: 800, fontSize: 15, color: '#f0f6fc', letterSpacing: '-0.02em' }}>INVITEFLOW</span>
        <span style={{ fontSize: 9, color: '#6e7681', letterSpacing: '0.12em' }}>v3</span>
        {activeEvent && (
          <span style={{ fontSize: 10, color: '#C8A84B', letterSpacing: '0.08em', borderLeft: '1px solid #21262d', paddingLeft: 12 }}>
            {activeEvent.name}
          </span>
        )}
        {state.unsaved && <span style={{ fontSize: 9, color: '#6e7681', letterSpacing: '0.1em' }}>●</span>}
        <nav style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => dispatch({ type: 'SET_TAB', tab: t.id })}
              style={{
                background: state.tab === t.id ? '#1f6feb' : 'transparent',
                border: state.tab === t.id ? '1px solid #1f6feb' : '1px solid transparent',
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
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <TabContent />
      </main>
    </div>
  );
}

export default function App() {
  return <AppProvider><AppInner /></AppProvider>;
}
