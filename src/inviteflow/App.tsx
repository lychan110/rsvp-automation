import { useState } from 'react';

type TabId = 'events' | 'setup' | 'invitees' | 'compose' | 'send' | 'tracker' | 'sync';
const TABS: TabId[] = ['events', 'setup', 'invitees', 'compose', 'send', 'tracker', 'sync'];

export default function App() {
  const [tab, setTab] = useState<TabId>('tracker');

  return (
    <div style={{ minHeight: '100vh', background: '#080c10', color: '#c9d1d9', fontFamily: 'monospace', display: 'flex', flexDirection: 'column' }}>
      <header style={{ borderBottom: '1px solid #21262d', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontWeight: 800, fontSize: 16, color: '#f0f6fc', letterSpacing: '-0.02em' }}>INVITEFLOW</span>
        <span style={{ fontSize: 10, color: '#6e7681', letterSpacing: '0.12em' }}>v3</span>
        <nav style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: tab === t ? '#1f6feb' : 'transparent',
                border: tab === t ? '1px solid #1f6feb' : '1px solid #21262d',
                color: tab === t ? '#fff' : '#8b949e',
                padding: '4px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: 10,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
              }}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>
      <main style={{ flex: 1, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6e7681', fontSize: 12 }}>
          Tab: <strong style={{ color: '#c9d1d9' }}>{tab}</strong> — implementation in progress
        </div>
      </main>
    </div>
  );
}
