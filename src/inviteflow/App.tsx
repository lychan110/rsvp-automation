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
  { id: 'events',   label: 'Events'   },
  { id: 'setup',    label: 'Setup'    },
  { id: 'invitees', label: 'Invitees' },
  { id: 'compose',  label: 'Compose'  },
  { id: 'send',     label: 'Send'     },
  { id: 'tracker',  label: 'Tracker'  },
  { id: 'sync',     label: 'Sync'     },
];

function TabContent() {
  const { tab } = useAppState();
  switch (tab) {
    case 'events':   return <EventsTab />;
    case 'setup':    return <SetupTab />;
    case 'invitees': return <InviteesTab />;
    case 'compose':  return <ComposeTab />;
    case 'send':     return <SendTab />;
    case 'tracker':  return <TrackerTab />;
    case 'sync':     return <SyncTab />;
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
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-root)', color: 'var(--text-base)', fontFamily: 'var(--rf-mono)' }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        className="shrink-0"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
      >
        {/* Row 1 — Brand + event context */}
        <div className="flex items-center gap-4 px-5 pt-3 pb-2">
          {/* Brand */}
          <div className="flex flex-col shrink-0">
            <span className="if-eyebrow" style={{ marginBottom: 3 }}>CONVENE · ROSTER</span>
            <span className="if-page-title" style={{ fontSize: 16 }}>InviteFlow</span>
          </div>

          {/* Active event context */}
          {activeEvent && (
            <div
              className="flex items-center gap-2 pl-4 truncate"
              style={{ borderLeft: '1px solid var(--border)' }}
            >
              <span
                style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--accent)', flexShrink: 0,
                }}
              />
              <span
                className="truncate"
                style={{
                  fontFamily: 'var(--rf-mono)', fontSize: 10,
                  letterSpacing: '0.1em', color: 'var(--text-base)',
                }}
              >
                {activeEvent.name.toUpperCase()}
              </span>
              {activeEvent.date && (
                <>
                  <span style={{ color: 'var(--border-input)', flexShrink: 0 }}>·</span>
                  <span
                    style={{
                      fontFamily: 'var(--rf-mono)', fontSize: 10,
                      color: 'var(--text-secondary)', letterSpacing: '0.08em', flexShrink: 0,
                    }}
                  >
                    {activeEvent.date}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Unsaved indicator */}
          {state.unsaved && (
            <span
              style={{
                fontFamily: 'var(--rf-mono)', fontSize: 9,
                letterSpacing: '0.1em', color: 'var(--text-muted)',
              }}
            >
              UNSAVED
            </span>
          )}

          {/* Mobile hamburger */}
          <button
            className="ml-auto md:hidden if-header-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
          >
            ☰
          </button>
        </div>

        {/* Row 2 — Desktop tab navigation */}
        <nav
          className="hidden md:flex px-5"
          role="tablist"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {TABS.map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={state.tab === t.id}
              onClick={() => selectTab(t.id)}
              className={`if-nav-tab${state.tab === t.id ? ' active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* ── Mobile drawer ──────────────────────────────────────────────── */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setDrawerOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="fixed inset-y-0 left-0 w-56 z-50 flex flex-col md:hidden"
            style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}
          >
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div>
                <div className="if-eyebrow" style={{ marginBottom: 2 }}>CONVENE · ROSTER</div>
                <div className="if-page-title" style={{ fontSize: 15 }}>InviteFlow</div>
              </div>
              <button className="if-header-btn" onClick={() => setDrawerOpen(false)} aria-label="Close">
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
                  className="min-h-[44px] flex items-center px-5 cursor-pointer border-l-2"
                  style={{
                    fontFamily: 'var(--rf-mono)',
                    fontSize: 10,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    ...(state.tab === t.id
                      ? { borderColor: 'var(--accent)', background: 'var(--bg-subtle)', color: 'var(--accent)' }
                      : { borderColor: 'transparent', color: 'var(--text-secondary)', background: 'transparent' }),
                  }}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </>
      )}

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto flex flex-col">
        <TabContent />
      </main>
    </div>
  );
}

export default function App() {
  return <AppProvider><AppInner /></AppProvider>;
}
