import { useState, useRef, useCallback, useEffect } from 'react';
import type { CSOfficial, CSScanMeta, CSPersistedState, CSStatus, ScanState, InviteeExport } from './types';

// ── Constants ─────────────────────────────────────────────────────────────────

const CS_LS_KEY = 'contactscout_state';
const CS_APIKEY_SK = 'cs_api_key';
const SCOUT_PW = 'scout2025';

const SCAN_TARGETS = [
  { id: 'us-congress',  label: 'US Congress — all seats',        desc: 'All current US reps + senators for your state' },
  { id: 'state-exec',   label: 'State Executive Branch',         desc: 'Governor, Lt. Gov, AG, Treasurer, Auditor, commissioners' },
  { id: 'state-senate', label: 'State Senate — all seats',       desc: 'Full current state senate roster' },
  { id: 'state-house',  label: 'State House — tracked counties', desc: 'House members for your tracked counties' },
  { id: 'city-1',       label: 'City Council (City 1)',          desc: 'Current mayor and all council members' },
  { id: 'city-2',       label: 'City Council (City 2)',          desc: 'Current mayor and all council members' },
  { id: 'city-3',       label: 'City Council (City 3)',          desc: 'Current mayor and all council members' },
];

const SCAN_PROMPTS: Record<string, string> = {
  'us-congress':  'Search for every current US Congress member for [YOUR STATE] (119th Congress 2025-2026): all House reps + 2 senators. For each: full name, title, district, official scheduler/contact email.',
  'state-exec':   'Search for all current [YOUR STATE] statewide executive elected officials as of 2025: Governor, Lt. Governor, AG, Treasurer, Auditor, Superintendent of Public Instruction, and other commissioners. Full name, title, email.',
  'state-senate': 'Search for all current [YOUR STATE] State Senate members as of 2025. Full name, district, official email.',
  'state-house':  'Search for all current [YOUR STATE] House members for [YOUR COUNTIES] as of 2025. Full name, district, county, official email.',
  'city-1':       'Search for current [CITY 1] City Council as of 2025. Mayor + every council member: full name, title, official email.',
  'city-2':       'Search for current [CITY 2] City Council as of 2025. Mayor + every council member: full name, title, official email.',
  'city-3':       'Search for current [CITY 3] City Council as of 2025. Mayor + every council member: full name, title, official email.',
};

const VERIFY_SYS = `Verify this elected official for 2025-2026 using web search. Respond ONLY with valid JSON no markdown:
{"stillInOffice":true,"currentTitle":"","directEmail":"","officeEmail":"","officePhone":"","changes":"No changes detected","flags":"","replacedBy":"","confidence":"high"}`;

const SCAN_SYS = `Find all current elected officials for 2025-2026 using web search. Respond ONLY with valid JSON no markdown:
{"officials":[{"name":"","title":"","district":"","county":"","category":"US Senate|US House|Executive|State Senate|House|City Council","directEmail":"","officeEmail":"","officePhone":""}],"confidence":"high","notes":""}`;

const CATS = ['All', 'US Senate', 'US House', 'Executive', 'State Senate', 'House', 'City Council'];

const STATUS_LABEL: Record<CSStatus, string> = {
  pending: 'PENDING', checking: 'CHECKING', done: 'VERIFIED',
  changed: 'CHANGED', left_office: 'LEFT OFFICE', error: 'ERROR',
};
const STATUS_COLOR: Record<CSStatus, string> = {
  pending: '#8b949e', checking: '#f59e0b', done: '#3fb950',
  changed: '#58a6ff', left_office: '#f85149', error: '#e3b341',
};

// ── Persistence ───────────────────────────────────────────────────────────────

function loadCSState(): CSPersistedState {
  try {
    const raw = localStorage.getItem(CS_LS_KEY);
    if (!raw) return { officials: [], newOfficials: [], scanStatus: {}, scanMeta: {} };
    return JSON.parse(raw) as CSPersistedState;
  } catch { return { officials: [], newOfficials: [], scanStatus: {}, scanMeta: {} }; }
}

function saveCSState(s: CSPersistedState) {
  try { localStorage.setItem(CS_LS_KEY, JSON.stringify(s)); } catch { /* quota */ }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function officialToInvitee(o: CSOfficial): InviteeExport {
  const parts = o.name.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
    title: o.title,
    category: o.category,
    email: o.officeEmail || o.directEmail || '',
    rsvpLink: '',
    inviteStatus: 'pending',
    sentAt: '',
    rsvpStatus: 'No Response',
    rsvpDate: '',
    notes: [o.district, o.county].filter(Boolean).join(' · '),
  };
}

function needsCustomization() {
  return Object.values(SCAN_PROMPTS).some(p =>
    p.includes('[YOUR STATE]') || p.includes('[YOUR COUNTIES]') || p.includes('[CITY')
  );
}

// ── Password gate ─────────────────────────────────────────────────────────────

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);

  function attempt() {
    if (pw === SCOUT_PW) onUnlock();
    else { setErr(true); setPw(''); }
  }

  return (
    <div style={{ height: '100dvh', background: '#080c10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, padding: '32px 36px', width: 360, fontFamily: 'monospace' }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#f0f6fc', letterSpacing: '-0.02em', marginBottom: 4 }}>CONTACT SCOUT</div>
        <div style={{ fontSize: 9, color: '#8b949e', letterSpacing: '0.12em', marginBottom: 20 }}>by Lenya Chan · ELECTED OFFICIALS DISCOVERY</div>
        <div style={{ fontSize: 11, color: '#8b949e', lineHeight: 1.7, marginBottom: 16 }}>
          ContactScout uses Claude AI to discover and verify elected officials. Enter your access code to continue.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="password"
            placeholder="Access code"
            value={pw}
            onChange={e => { setPw(e.target.value); setErr(false); }}
            onKeyDown={e => e.key === 'Enter' && attempt()}
            autoFocus
            style={{ flex: 1, background: '#010409', border: `1px solid ${err ? '#da3633' : '#30363d'}`, borderRadius: 4, color: '#c9d1d9', fontFamily: 'monospace', fontSize: 11, padding: '8px 10px' }}
          />
          <button
            onClick={attempt}
            style={{ background: '#1f6feb', border: '1px solid #1f6feb', color: '#fff', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, whiteSpace: 'nowrap' }}
          >
            Unlock
          </button>
        </div>
        {err && <div style={{ fontSize: 10, color: '#f85149', marginTop: 8 }}>Incorrect access code.</div>}
      </div>
    </div>
  );
}

// ── Main app ──────────────────────────────────────────────────────────────────

export default function App() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('cs_unlocked') === '1');

  if (!unlocked) {
    return (
      <PasswordGate onUnlock={() => {
        sessionStorage.setItem('cs_unlocked', '1');
        setUnlocked(true);
      }} />
    );
  }

  return <ContactScoutInner />;
}

// ── Inner component ───────────────────────────────────────────────────────────

function ContactScoutInner() {
  const persisted = loadCSState();
  const [officials, setOfficials] = useState<CSOfficial[]>(persisted.officials);
  const [newOfficials, setNewOfficials] = useState<CSOfficial[]>(persisted.newOfficials);
  const [scanStatus, setScanStatus] = useState<Record<string, ScanState>>(persisted.scanStatus);
  const [scanMeta, setScanMeta] = useState<Record<string, CSScanMeta>>(persisted.scanMeta);

  const [tab, setTab] = useState<0 | 1>(0);
  const [activeCat, setActiveCat] = useState('All');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [log, setLog] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem(CS_APIKEY_SK) || '');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyDraft, setKeyDraft] = useState('');
  const [keyErr, setKeyErr] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const abortRef = useRef(false);
  const pendingRef = useRef<(() => void) | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveCSState({ officials, newOfficials, scanStatus, scanMeta });
  }, [officials, newOfficials, scanStatus, scanMeta]);

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString();
    setLog(prev => [`[${ts}] ${msg}`, ...prev.slice(0, 99)]);
  }, []);

  // ── API key modal ──────────────────────────────────────────────────────────

  function openKeyModal(onSave?: () => void) {
    pendingRef.current = onSave ?? null;
    setKeyDraft(apiKey);
    setKeyErr(false);
    setShowKeyModal(true);
  }

  function saveKey() {
    if (!keyDraft.startsWith('sk-ant-')) { setKeyErr(true); return; }
    setApiKey(keyDraft);
    sessionStorage.setItem(CS_APIKEY_SK, keyDraft);
    setShowKeyModal(false);
    const pending = pendingRef.current;
    pendingRef.current = null;
    pending?.();
  }

  // ── Claude API ─────────────────────────────────────────────────────────────

  async function callClaude(sys: string, user: string): Promise<Record<string, unknown>> {
    const key = apiKey;
    if (!key) {
      return new Promise((resolve, reject) => {
        openKeyModal(() => callClaude(sys, user).then(resolve).catch(reject));
      });
    }
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: sys,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: user }],
      }),
    });
    if (res.status === 401) {
      setApiKey('');
      sessionStorage.removeItem(CS_APIKEY_SK);
      throw new Error('Invalid API key');
    }
    const d = await res.json() as { content?: Array<{ type: string; text?: string }>; error?: { message: string } };
    if (d.error) throw new Error(d.error.message ?? 'API error');
    const text = d.content?.find(b => b.type === 'text')?.text ?? '';
    if (!text) throw new Error('No text response');
    return JSON.parse(text.replace(/```json|```/g, '').trim()) as Record<string, unknown>;
  }

  // ── Verify ─────────────────────────────────────────────────────────────────

  async function runVerify(names: string[]) {
    if (!apiKey) { openKeyModal(() => runVerify(names)); return; }
    abortRef.current = false;
    setRunning(true);
    setProgress({ done: 0, total: names.length });

    for (let i = 0; i < names.length; i++) {
      if (abortRef.current) break;
      const name = names[i];
      const off = officials.find(o => o.name === name);
      if (!off) continue;
      addLog(`Verifying ${name}…`);
      setOfficials(prev => prev.map(o => o.name === name ? { ...o, status: 'checking' } : o));
      try {
        const r = await callClaude(VERIFY_SYS, `Verify for 2025-2026:\nName: ${off.name}\nTitle: ${off.title}\nCategory: ${off.category}\nDistrict: ${off.district || 'N/A'}\nEmail: ${off.directEmail || off.officeEmail || 'none'}`);
        const changed = !r.stillInOffice || r.changes !== 'No changes detected' || r.flags;
        const newStatus: CSStatus = !r.stillInOffice ? 'left_office' : changed ? 'changed' : 'done';
        setOfficials(prev => prev.map(o => o.name === name ? {
          ...o, status: newStatus, result: r as Record<string, string | boolean>,
          directEmail: (r.directEmail as string) || o.directEmail,
          officeEmail: (r.officeEmail as string) || o.officeEmail,
          officePhone: (r.officePhone as string) || o.officePhone,
          title: (r.currentTitle as string) || o.title,
        } : o));
        addLog(`✓ ${name}: ${r.stillInOffice ? 'In office' : '⚠ LEFT OFFICE'} — ${r.changes}`);
      } catch (e) {
        setOfficials(prev => prev.map(o => o.name === name ? { ...o, status: 'error', result: { error: String(e) } } : o));
        addLog(`✗ ${name}: ${String(e)}`);
      }
      setProgress({ done: i + 1, total: names.length });
      if (i < names.length - 1) await sleep(700);
    }
    setRunning(false);
    addLog(`Done — ${names.length} checked.`);
  }

  // ── Scan ───────────────────────────────────────────────────────────────────

  async function runScan(id: string) {
    if (running) return;
    if (!apiKey) { openKeyModal(() => runScan(id)); return; }
    abortRef.current = false;
    setRunning(true);
    setScanStatus(prev => ({ ...prev, [id]: 'scanning' }));
    addLog(`Scanning: ${SCAN_TARGETS.find(t => t.id === id)?.label}…`);
    try {
      const r = await callClaude(SCAN_SYS, SCAN_PROMPTS[id]);
      const currentNames = new Set(officials.map(o => o.name.toLowerCase().trim()));
      const found = (r.officials as CSOfficial[]) ?? [];
      const fresh = found.filter(o => !currentNames.has(o.name.toLowerCase().trim()));
      setScanStatus(prev => ({ ...prev, [id]: 'done' }));
      setScanMeta(prev => ({ ...prev, [id]: { total: found.length, confidence: r.confidence as string, notes: r.notes as string } }));
      if (fresh.length > 0) {
        setNewOfficials(prev => {
          const ex = new Set(prev.map(x => x.name.toLowerCase()));
          return [...prev, ...fresh.filter(x => !ex.has(x.name.toLowerCase())).map(x => ({ ...x, _scanId: id, status: 'pending' as CSStatus, result: null }))];
        });
        addLog(`✓ ${fresh.length} new found.`);
      } else {
        addLog(`✓ All ${found.length} already in list.`);
      }
      if (r.notes) addLog(`ℹ ${r.notes}`);
    } catch (e) {
      setScanStatus(prev => ({ ...prev, [id]: 'error' }));
      addLog(`✗ Scan: ${String(e)}`);
    }
    setRunning(false);
  }

  // ── Officials management ───────────────────────────────────────────────────

  function addNew(o: CSOfficial) {
    setOfficials(prev => [...prev, { ...o, status: 'pending', result: null }]);
    setNewOfficials(prev => prev.filter(x => x.name !== o.name));
    addLog(`+ Added ${o.name}`);
  }

  function dismissNew(name: string) {
    setNewOfficials(prev => prev.filter(x => x.name !== name));
  }

  function toggleSel(name: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  function addManually() {
    const name = prompt('Full name:');
    if (!name) return;
    const title = prompt('Title:', '') ?? '';
    const email = prompt('Email:', '') ?? '';
    const cat = prompt('Category (US Senate/US House/Executive/State Senate/House/City Council):', 'City Council') ?? 'City Council';
    setOfficials(prev => [...prev, { name, title, directEmail: email, officeEmail: '', officePhone: '', district: '', county: '', category: cat, status: 'pending', result: null }]);
    addLog(`+ Added ${name}`);
  }

  // ── Export / import ────────────────────────────────────────────────────────

  function exportForInviteFlow() {
    const invitees = officials
      .filter(o => o.status !== 'left_office' && (o.officeEmail || o.directEmail))
      .map(officialToInvitee);
    if (invitees.length === 0) { setExportStatus('No officials with email to export.'); return; }
    const blob = new Blob([JSON.stringify({
      exportedAt: new Date().toISOString(),
      source: 'ContactScout',
      count: invitees.length,
      invitees,
    }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `contactscout-invitees-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setExportStatus(`✓ Exported ${invitees.length} invitees.`);
    addLog(`⬡ Exported ${invitees.length} invitees for InviteFlow.`);
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify({
      exportedAt: new Date().toISOString(),
      source: 'ContactScout',
      officials,
      newOfficials,
      scanStatus,
      scanMeta,
    }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `contactscout-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    addLog(`✓ Backup saved (${officials.length} officials).`);
  }

  function exportCSV() {
    const h = ['Name', 'Title', 'District', 'County', 'Category', 'Direct Email', 'Office Email', 'Phone', 'Status', 'Changes', 'Flags', 'Replaced By', 'Confidence'];
    const rows = officials.map(o => [
      o.name, o.title, o.district, o.county, o.category,
      o.directEmail, o.officeEmail, o.officePhone, o.status,
      o.result?.changes as string || '', o.result?.flags as string || '',
      o.result?.replacedBy as string || '', o.result?.confidence as string || '',
    ]);
    const csv = [h, ...rows].map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `contactscout-officials-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    addLog('✓ CSV exported.');
  }

  function importBackup(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const d = JSON.parse(reader.result as string) as Partial<CSPersistedState>;
        if (d.officials) setOfficials(d.officials.map(o => ({ ...o, result: o.result || null })));
        if (d.newOfficials) setNewOfficials(d.newOfficials);
        if (d.scanStatus) setScanStatus(d.scanStatus);
        if (d.scanMeta) setScanMeta(d.scanMeta);
        addLog(`✓ Backup loaded.`);
      } catch (e) { addLog(`✗ Import failed: ${String(e)}`); }
    };
    reader.readAsText(file);
  }

  function clearAll() {
    if (!confirm('Clear all ContactScout data? This cannot be undone.')) return;
    setOfficials([]);
    setNewOfficials([]);
    setScanStatus({});
    setScanMeta({});
    localStorage.removeItem(CS_LS_KEY);
    addLog('✓ All data cleared.');
  }

  // ── Computed ───────────────────────────────────────────────────────────────

  const filtered = activeCat === 'All' ? officials : officials.filter(o => o.category === activeCat);
  const stats = {
    total: officials.length,
    done: officials.filter(o => o.status === 'done').length,
    changed: officials.filter(o => o.status === 'changed').length,
    left: officials.filter(o => o.status === 'left_office').length,
    ready: officials.filter(o => o.status !== 'left_office' && (o.officeEmail || o.directEmail)).length,
  };
  const pct = progress.total ? Math.round(progress.done / progress.total * 100) : 0;

  // ── Style helpers ──────────────────────────────────────────────────────────

  const btn = (variant: 'pri' | 'grn' | 'del' | 'def' = 'def', disabled = false): React.CSSProperties => ({
    border: `1px solid ${variant === 'pri' ? '#1f6feb' : variant === 'grn' ? '#238636' : variant === 'del' ? '#da3633' : '#21262d'}`,
    background: variant === 'pri' ? '#1f6feb' : variant === 'grn' ? '#238636' : 'transparent',
    color: variant === 'pri' || variant === 'grn' ? '#fff' : variant === 'del' ? '#f85149' : '#8b949e',
    padding: '3px 9px', borderRadius: 4, cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.05em', opacity: disabled ? 0.4 : 1,
  });

  const tagStyle = (status: CSStatus): React.CSSProperties => ({
    fontSize: 10, padding: '2px 6px', borderRadius: 3, letterSpacing: '0.07em',
    border: `1px solid ${STATUS_COLOR[status]}`, color: STATUS_COLOR[status],
    animation: status === 'checking' ? 'cs-pulse 1.4s ease-in-out infinite' : undefined,
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#080c10', fontFamily: 'monospace', fontSize: 11, overflow: 'hidden' }}>
      <style>{`@keyframes cs-pulse{0%,100%{opacity:1}50%{opacity:.3}}*:focus-visible{outline:2px solid #58a6ff;outline-offset:2px;}`}</style>
      <input ref={importFileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { importBackup(f); e.target.value = ''; } }} />

      {/* Header */}
      <div style={{ padding: '10px 20px', borderBottom: '1px solid #21262d', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, flexShrink: 0 }}>
        <div>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#f0f6fc', letterSpacing: '-0.02em' }}>CONTACT SCOUT</span>
          <span style={{ fontSize: 9, color: '#8b949e', letterSpacing: '0.1em', marginLeft: 10 }}>ELECTED OFFICIALS · VERIFY + DISCOVER</span>
          <div style={{ fontSize: 9, color: '#8b949e', marginTop: 1 }}>by Lenya Chan</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {newOfficials.length > 0 && (
            <span style={{ background: '#0c1a2e', color: '#58a6ff', border: '1px solid #1f6feb', borderRadius: 4, padding: '2px 7px', fontSize: 10 }}>
              {newOfficials.length} NEW
            </span>
          )}
          <button style={btn(apiKey ? 'grn' : 'del')} onClick={() => openKeyModal()}>⚙ Key{apiKey ? ' ✓' : ''}</button>
          <button style={btn('grn')} onClick={exportForInviteFlow}>⬡ Export → InviteFlow</button>
          <button style={btn()} onClick={exportBackup}>↓ Backup</button>
          <button style={btn()} onClick={exportCSV}>↓ CSV</button>
          <button style={btn()} onClick={() => importFileRef.current?.click()}>↑ Import</button>
          <button style={btn('del', running)} onClick={() => { abortRef.current = true; }} disabled={!running}>■ Stop</button>
          <button style={btn()} onClick={clearAll}>✕ Clear</button>
        </div>
      </div>

      {exportStatus && (
        <div style={{ padding: '5px 20px', fontSize: 10, color: exportStatus.startsWith('✓') ? '#3fb950' : '#f85149', background: '#0d1117', borderBottom: '1px solid #21262d', flexShrink: 0 }}>
          {exportStatus}
        </div>
      )}

      {/* Welcome banner (no API key) */}
      {!apiKey && (
        <div style={{ background: '#060d1a', borderBottom: '1px solid #1f6feb', padding: '12px 20px', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: '#58a6ff', fontWeight: 600, marginBottom: 4 }}>Welcome to ContactScout — by Lenya Chan</div>
          <div style={{ fontSize: 10, color: '#8b949e', lineHeight: 1.7, marginBottom: 8 }}>
            ContactScout uses Claude AI to find and verify elected officials. Add your Claude API key to get started, then configure the Scan targets for your jurisdiction.
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button style={btn('pri')} onClick={() => openKeyModal()}>→ Add Claude API Key</button>
            <span style={{ fontSize: 9, color: '#8b949e' }}>Free key at console.anthropic.com → API Keys → Create Key</span>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div style={{ padding: '5px 20px', borderBottom: '1px solid #161b22', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
        {([['TOTAL', stats.total, '#8b949e'], ['VERIFIED', stats.done, '#3fb950'], ['CHANGED', stats.changed, '#58a6ff'], ['LEFT OFFICE', stats.left, '#f85149'], ['READY TO INVITE', stats.ready, '#a371f7']] as const).map(([label, n, col]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: col, display: 'inline-block' }} />
            <span style={{ fontSize: 9, color: '#8b949e', letterSpacing: '0.1em' }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: col }}>{n}</span>
          </div>
        ))}
        {running && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 90, height: 3, background: '#21262d', borderRadius: 2 }}>
              <div style={{ width: `${pct}%`, height: '100%', background: '#1f6feb', borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 10, color: '#58a6ff' }}>{progress.done}/{progress.total}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #21262d', display: 'flex', flexShrink: 0 }}>
        {[`✓ Verify Existing`, `＋ Scan for New${newOfficials.length > 0 ? ` (${newOfficials.length})` : ''}`].map((label, i) => (
          <button
            key={i}
            onClick={() => setTab(i as 0 | 1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.04em', padding: '8px 16px', color: tab === i ? '#f0f6fc' : '#8b949e', borderBottom: `2px solid ${tab === i ? '#1f6feb' : 'transparent'}` }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <div style={{ overflowY: 'auto', minHeight: 0 }}>
          {tab === 0 ? (
            <VerifyTab
              officials={filtered}
              allOfficials={officials}
              activeCat={activeCat}
              setActiveCat={setActiveCat}
              selected={selected}
              toggleSel={toggleSel}
              setSelected={setSelected}
              running={running}
              runVerify={runVerify}
              addManually={addManually}
              btn={btn}
              tagStyle={tagStyle}
            />
          ) : (
            <ScanTab
              scanStatus={scanStatus}
              scanMeta={scanMeta}
              newOfficials={newOfficials}
              running={running}
              runScan={runScan}
              addNew={addNew}
              dismissNew={dismissNew}
              btn={btn}
            />
          )}
        </div>

        {/* Log panel */}
        <div style={{ overflowY: 'auto', padding: '11px 13px', background: '#050709', borderLeft: '1px solid #161b22', minHeight: 0 }}>
          <div style={{ fontSize: 9, color: '#8b949e', letterSpacing: '0.14em', marginBottom: 6 }}>ACTIVITY LOG</div>
          <div style={{ fontSize: 10, color: '#8b949e', fontStyle: 'italic', marginBottom: 6 }}>⬡ Export → InviteFlow to download invitee list.</div>
          {log.length === 0 && <div style={{ fontSize: 10, color: '#7d8590', fontStyle: 'italic' }}>No activity yet.</div>}
          {log.map((entry, i) => (
            <div key={i} style={{ fontSize: 10, color: i === 0 ? '#8b949e' : '#7d8590', marginBottom: 3, lineHeight: 1.5, borderLeft: `2px solid ${i === 0 ? '#1f6feb' : 'transparent'}`, paddingLeft: 5 }}>
              {entry}
            </div>
          ))}
          <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #161b22' }}>
            <div style={{ fontSize: 9, color: '#8b949e', letterSpacing: '0.1em', marginBottom: 6 }}>DATA</div>
            <button style={{ ...btn(), width: '100%', marginBottom: 4, textAlign: 'left' }} onClick={exportBackup}>↓ Backup (.json)</button>
            <button style={{ ...btn(), width: '100%', marginBottom: 4, textAlign: 'left' }} onClick={() => importFileRef.current?.click()}>↑ Import backup</button>
            <button style={{ ...btn('del'), width: '100%', textAlign: 'left' }} onClick={clearAll}>✕ Clear all data</button>
          </div>
        </div>
      </div>

      {/* API key modal */}
      {showKeyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: '22px 24px', width: 380, maxWidth: '90vw' }}>
            <div style={{ fontSize: 12, color: '#f0f6fc', fontWeight: 700, marginBottom: 6 }}>Claude API Key</div>
            <div style={{ fontSize: 10, color: '#8b949e', lineHeight: 1.6, marginBottom: 12 }}>
              Enter your Anthropic API key. Get a free key at{' '}
              <a href="https://console.anthropic.com/" target="_blank" rel="noreferrer" style={{ color: '#58a6ff' }}>console.anthropic.com</a>
              {' '}→ API Keys → Create Key. Starts with <code>sk-ant-</code>. Stored in session only — never persisted.
            </div>
            <input
              type="password"
              placeholder="sk-ant-..."
              value={keyDraft}
              onChange={e => { setKeyDraft(e.target.value); setKeyErr(false); }}
              onKeyDown={e => e.key === 'Enter' && saveKey()}
              style={{ width: '100%', background: '#010409', border: `1px solid ${keyErr ? '#da3633' : '#30363d'}`, borderRadius: 4, color: '#c9d1d9', fontFamily: 'monospace', fontSize: 11, padding: '7px 10px', marginBottom: 8 }}
              autoFocus
            />
            {keyErr && <div style={{ fontSize: 10, color: '#f85149', marginBottom: 8 }}>Must start with sk-ant-</div>}
            <div style={{ display: 'flex', gap: 7, justifyContent: 'flex-end' }}>
              <button style={btn()} onClick={() => setShowKeyModal(false)}>Cancel</button>
              <button style={btn('pri')} onClick={saveKey}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── VerifyTab ─────────────────────────────────────────────────────────────────

interface VerifyTabProps {
  officials: CSOfficial[];
  allOfficials: CSOfficial[];
  activeCat: string;
  setActiveCat: (c: string) => void;
  selected: Set<string>;
  toggleSel: (name: string) => void;
  setSelected: React.Dispatch<React.SetStateAction<Set<string>>>;
  running: boolean;
  runVerify: (names: string[]) => void;
  addManually: () => void;
  btn: (v?: 'pri' | 'grn' | 'del' | 'def', d?: boolean) => React.CSSProperties;
  tagStyle: (s: CSStatus) => React.CSSProperties;
}

function VerifyTab({ officials, allOfficials, activeCat, setActiveCat, selected, toggleSel, setSelected, running, runVerify, addManually, btn, tagStyle }: VerifyTabProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const names = officials.map(o => o.name);

  function toggleExpand(name: string) {
    setExpanded(prev => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n; });
  }

  return (
    <div>
      <div style={{ padding: '6px 18px', borderBottom: '1px solid #161b22', display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap', position: 'sticky', top: 0, background: '#080c10', zIndex: 2 }}>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', flex: 1 }}>
          {CATS.map(c => (
            <button
              key={c}
              onClick={() => setActiveCat(c)}
              style={{ border: `1px solid ${activeCat === c ? '#1f6feb' : '#21262d'}`, background: activeCat === c ? '#0c2d6b' : 'transparent', color: activeCat === c ? '#58a6ff' : '#8b949e', padding: '3px 8px', borderRadius: 20, cursor: 'pointer', fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.07em' }}
            >
              {c.toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={btn('def', running)} onClick={() => setSelected(new Set(names))} disabled={running}>Sel All</button>
          <button style={btn('def', running)} onClick={() => setSelected(new Set())} disabled={running}>Clear</button>
          <button style={btn('pri', running || selected.size === 0)} onClick={() => runVerify([...selected])} disabled={running || selected.size === 0}>▶ ({selected.size})</button>
          <button style={btn('pri', running)} onClick={() => runVerify(names)} disabled={running}>▶ All</button>
        </div>
      </div>

      {officials.length === 0 && (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8b949e', fontSize: 11 }}>
          No officials yet. Use <strong style={{ color: '#c9d1d9' }}>＋ Scan for New</strong> to discover, or{' '}
          <button style={{ background: 'none', border: 'none', color: '#58a6ff', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }} onClick={addManually}>+ Add Manually</button>.
        </div>
      )}

      {officials.map(o => {
        const isOpen = expanded.has(o.name);
        const r = o.result;
        return (
          <div key={o.name} style={{ borderBottom: '1px solid #0d1117' }}>
            <div
              style={{ display: 'grid', gridTemplateColumns: '20px 1fr 105px 82px 14px', gap: 7, padding: '8px 18px', cursor: 'pointer' }}
              onClick={() => toggleExpand(o.name)}
            >
              <input type="checkbox" checked={selected.has(o.name)} onClick={e => { e.stopPropagation(); toggleSel(o.name); }} style={{ accentColor: '#1f6feb' }} readOnly />
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#f0f6fc' }}>{o.name}</div>
                <div style={{ fontSize: 9, color: '#8b949e' }}>{o.title}{o.district ? ` · D${o.district}` : ''}{o.county ? ` · ${o.county}` : ''}</div>
                <div style={{ fontSize: 9, color: '#8b949e', fontStyle: 'italic' }}>{o.directEmail || o.officeEmail || 'no email'}</div>
              </div>
              <div style={{ fontSize: 9, color: '#8b949e', paddingTop: 1 }}>{o.category}</div>
              <div><span style={tagStyle(o.status)}>{STATUS_LABEL[o.status]}</span></div>
              <div style={{ fontSize: 10, color: '#30363d' }}>{isOpen ? '▲' : '▼'}</div>
            </div>
            {isOpen && r && (
              <div style={{ padding: '0 18px 8px 45px' }}>
                <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 5, padding: '8px 12px', fontSize: 10, lineHeight: 1.8 }}>
                  {r.error
                    ? <span style={{ color: '#e3b341' }}>Error: {r.error as string}</span>
                    : <>
                      {r.stillInOffice !== undefined && <div><span style={{ color: '#8b949e' }}>IN OFFICE </span>{r.stillInOffice ? <span style={{ color: '#3fb950' }}>Yes</span> : <span style={{ color: '#f85149' }}>No{r.replacedBy ? ` → ${r.replacedBy}` : ''}</span>}</div>}
                      {r.currentTitle && <div><span style={{ color: '#8b949e' }}>TITLE </span>{r.currentTitle as string}</div>}
                      {r.directEmail && <div><span style={{ color: '#8b949e' }}>DIRECT </span>{r.directEmail as string}</div>}
                      {r.officeEmail && <div><span style={{ color: '#8b949e' }}>OFFICE </span>{r.officeEmail as string}</div>}
                      {r.changes && r.changes !== 'No changes detected' && <div style={{ color: '#58a6ff' }}><span style={{ color: '#8b949e' }}>CHANGES </span>{r.changes as string}</div>}
                      {r.flags && <div style={{ color: '#e3b341' }}><span style={{ color: '#8b949e' }}>FLAGS </span>{r.flags as string}</div>}
                      {r.confidence && <div><span style={{ color: '#8b949e' }}>CONF </span><span style={{ color: r.confidence === 'high' ? '#3fb950' : r.confidence === 'medium' ? '#e3b341' : '#f85149' }}>{(r.confidence as string).toUpperCase()}</span></div>}
                    </>
                  }
                </div>
              </div>
            )}
          </div>
        );
      })}

      {allOfficials.length > 0 && (
        <div style={{ padding: '10px 18px', borderTop: '1px solid #161b22' }}>
          <button style={btn()} onClick={addManually}>+ Add Manually</button>
        </div>
      )}
    </div>
  );
}

// ── ScanTab ───────────────────────────────────────────────────────────────────

interface ScanTabProps {
  scanStatus: Record<string, ScanState>;
  scanMeta: Record<string, CSScanMeta>;
  newOfficials: CSOfficial[];
  running: boolean;
  runScan: (id: string) => void;
  addNew: (o: CSOfficial) => void;
  dismissNew: (name: string) => void;
  btn: (v?: 'pri' | 'grn' | 'del' | 'def', d?: boolean) => React.CSSProperties;
}

function ScanTab({ scanStatus, scanMeta, newOfficials, running, runScan, addNew, dismissNew, btn }: ScanTabProps) {
  return (
    <div style={{ padding: '14px 20px' }}>
      {needsCustomization() && (
        <div style={{ background: '#1a0e00', border: '1px solid #bb8009', borderRadius: 7, padding: '12px 16px', marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: '#e3b341', fontWeight: 600, marginBottom: 4 }}>Scan targets need customization before use</div>
          <div style={{ fontSize: 10, color: '#8b949e', lineHeight: 1.8 }}>
            The scan prompts contain placeholder text like <code style={{ color: '#C8A84B' }}>[YOUR STATE]</code> and <code style={{ color: '#C8A84B' }}>[CITY 1]</code>.<br />
            Edit <code style={{ color: '#C8A84B' }}>src/App.tsx</code> and replace the bracketed placeholders in <code style={{ color: '#C8A84B' }}>SCAN_PROMPTS</code> with your actual state, counties, and city names.
          </div>
        </div>
      )}
      <div style={{ fontSize: 10, color: '#8b949e', lineHeight: 1.6, marginBottom: 14 }}>
        Each scan searches the live web for all officials in that category. New officials not in your list surface as add candidates.
        Run after each election cycle, then <strong style={{ color: '#f0f6fc' }}>Export → InviteFlow</strong>.
      </div>
      {SCAN_TARGETS.map(t => {
        const st = scanStatus[t.id];
        const meta = scanMeta[t.id];
        const fresh = newOfficials.filter(o => o._scanId === t.id);
        return (
          <div key={t.id} style={{ marginBottom: 11 }}>
            <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 7, padding: '11px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#f0f6fc', fontWeight: 500 }}>{t.label}</div>
                  <div style={{ fontSize: 10, color: '#8b949e', marginTop: 2 }}>{t.desc}</div>
                  {meta && (
                    <div style={{ fontSize: 10, color: '#8b949e', marginTop: 3 }}>
                      Found {meta.total} · <span style={{ color: meta.confidence === 'high' ? '#3fb950' : meta.confidence === 'medium' ? '#e3b341' : '#f85149' }}>{meta.confidence}</span>
                      {meta.notes && <span style={{ color: '#e3b341' }}> · {meta.notes}</span>}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
                  {st === 'scanning' && <span style={{ fontSize: 8, padding: '2px 5px', border: '1px solid #f59e0b', color: '#f59e0b', borderRadius: 3, animation: 'cs-pulse 1.4s ease-in-out infinite' }}>SCANNING</span>}
                  {st === 'done' && <span style={{ fontSize: 8, padding: '2px 5px', border: '1px solid #238636', color: '#3fb950', borderRadius: 3 }}>DONE</span>}
                  {st === 'error' && <span style={{ fontSize: 8, padding: '2px 5px', border: '1px solid #da3633', color: '#f85149', borderRadius: 3 }}>ERROR</span>}
                  <button style={btn('pri', running)} onClick={() => runScan(t.id)} disabled={running}>{st === 'done' ? '↻ Re-scan' : '▶ Scan'}</button>
                </div>
              </div>
            </div>
            {fresh.length > 0 && (
              <div style={{ margin: '3px 0 0 11px', paddingLeft: 11, borderLeft: '2px solid #1f6feb' }}>
                <div style={{ fontSize: 9, color: '#58a6ff', letterSpacing: '0.1em', margin: '5px 0 4px' }}>NEW ({fresh.length})</div>
                {fresh.map(o => (
                  <div key={o.name} style={{ background: '#0c1a2e', border: '1px solid #1f4f99', borderRadius: 5, padding: '8px 11px', marginBottom: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#f0f6fc', fontWeight: 500 }}>{o.name}</div>
                      <div style={{ fontSize: 9, color: '#8b949e' }}>{o.title}{o.district ? ` · D${o.district}` : ''}</div>
                      {(o.directEmail || o.officeEmail) && <div style={{ fontSize: 9, color: '#8b949e' }}>{o.directEmail || o.officeEmail}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
                      <button style={btn('grn')} onClick={() => addNew(o)}>+ Add</button>
                      <button style={btn()} onClick={() => dismissNew(o.name)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {st === 'done' && fresh.length === 0 && meta && (
              <div style={{ margin: '3px 0 0 11px', padding: '4px 0 4px 11px', borderLeft: '2px solid #238636', fontSize: 10, color: '#3fb950' }}>
                ✓ All {meta.total} already in list.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
