import { useState } from 'react';
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeEvent = state.events.find(e => e.id === state.activeEventId);

  function selectTab(id: TabId) {
    dispatch({ type: 'SET_TAB', tab: id });
    setDrawerOpen(false);
  }

  return (
    <div className="h-screen font-mono flex flex-col overflow-hidden" style={{ background: 'var(--bg-root)', color: 'var(--text-base)' }}>
      {/* Header */}
      <header className="px-4 py-2 flex items-center gap-3 shrink-0" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        {/* Left zone */}
        <span className="font-black text-sm tracking-tight" style={{ color: 'var(--text-heading)' }}>INVITEFLOW</span>
        <span className="text-[9px] tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>v3.1</span>
        {activeEvent && (
          <span className="text-[10px] text-[#C8A84B] tracking-[0.08em] pl-3 truncate max-w-[160px]" style={{ borderLeft: '1px solid var(--border)' }}>
            {activeEvent.name}
          </span>
        )}
        {state.unsaved && (
          <span className="text-[9px] tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>●</span>
        )}

        {/* Right zone */}
        <div className="ml-auto flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_DARK' })}
            aria-label={state.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-sm rounded"
            style={{ color: 'var(--text-muted)' }}
          >
            {state.darkMode ? '☀' : '☾'}
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-1" role="tablist">
            {TABS.map(t => (
              <button
                key={t.id}
                role="tab"
                aria-selected={state.tab === t.id}
                onClick={() => selectTab(t.id)}
                className="min-h-[44px] px-2.5 py-1 rounded border text-[10px] font-mono tracking-[0.07em] uppercase cursor-pointer"
                style={state.tab === t.id
                  ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' }
                  : { background: 'transparent', borderColor: 'transparent', color: 'var(--text-secondary)' }}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {/* Hamburger (mobile only) */}
          <button
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
            style={{ color: 'var(--text-secondary)' }}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="fixed inset-y-0 left-0 w-64 z-50 flex flex-col md:hidden motion-safe:transition-transform"
            style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="font-black text-sm tracking-tight" style={{ color: 'var(--text-heading)' }}>INVITEFLOW</span>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center"
                style={{ color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>
            <nav role="tablist" className="flex flex-col py-2">
              {TABS.map(t => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={state.tab === t.id}
                  onClick={() => selectTab(t.id)}
                  className="min-h-[44px] flex items-center px-5 text-xs font-mono tracking-[0.07em] uppercase cursor-pointer border-l-2"
                  style={state.tab === t.id
                    ? { borderColor: 'var(--accent)', background: 'var(--bg-subtle)', color: 'var(--accent)' }
                    : { borderColor: 'transparent', color: 'var(--text-secondary)', background: 'transparent' }}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto flex flex-col">
        <TabContent />
      </main>
    </div>
  );
}

export default function App() {
  return <AppProvider><AppInner /></AppProvider>;
}
