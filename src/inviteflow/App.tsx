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
    <div className="h-screen bg-gray-50 text-gray-900 font-mono flex flex-col overflow-hidden dark:bg-[#080c10] dark:text-[#c9d1d9]">
      {/* Header */}
      <header className="border-b border-gray-200 px-4 py-2 flex items-center gap-3 shrink-0 bg-white dark:bg-[#0d1117] dark:border-[#21262d]">
        {/* Left zone */}
        <span className="font-black text-sm text-gray-900 tracking-tight dark:text-[#f0f6fc]">INVITEFLOW</span>
        <span className="text-[9px] text-gray-400 tracking-[0.12em] dark:text-[#6e7681]">v3.1</span>
        {activeEvent && (
          <span className="text-[10px] text-[#C8A84B] tracking-[0.08em] border-l border-gray-200 pl-3 truncate max-w-[160px] dark:border-[#21262d]">
            {activeEvent.name}
          </span>
        )}
        {state.unsaved && (
          <span className="text-[9px] text-gray-400 tracking-[0.1em] dark:text-[#6e7681]">●</span>
        )}

        {/* Right zone */}
        <div className="ml-auto flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_DARK' })}
            aria-label={state.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-sm text-gray-500 hover:text-gray-900 dark:text-[#6e7681] dark:hover:text-[#c9d1d9] rounded"
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
                className={[
                  'min-h-[44px] px-2.5 py-1 rounded border text-[10px] font-mono tracking-[0.07em] uppercase cursor-pointer',
                  state.tab === t.id
                    ? 'bg-blue-600 border-blue-600 text-white dark:bg-[#1f6feb] dark:border-[#1f6feb]'
                    : 'bg-transparent border-transparent text-gray-500 hover:text-gray-900 dark:text-[#8b949e] dark:hover:text-[#c9d1d9]',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {/* Hamburger (mobile only) */}
          <button
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 dark:text-[#8b949e]"
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
            className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 flex flex-col md:hidden motion-safe:transition-transform dark:bg-[#0d1117] dark:border-[#21262d]"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#21262d]">
              <span className="font-black text-sm text-gray-900 tracking-tight dark:text-[#f0f6fc]">INVITEFLOW</span>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 dark:text-[#6e7681]"
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
                  className={[
                    'min-h-[44px] flex items-center px-5 text-xs font-mono tracking-[0.07em] uppercase cursor-pointer border-l-2',
                    state.tab === t.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-[#1f6feb] dark:bg-[#0d1f3c] dark:text-[#58a6ff]'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 dark:text-[#8b949e] dark:hover:bg-[#161b22]',
                  ].join(' ')}
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
