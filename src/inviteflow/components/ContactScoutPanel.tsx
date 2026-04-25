import { useState, useRef } from 'react';
import { useAppDispatch } from '../state/AppContext';
import type { Invitee } from '../types';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ScoutContact {
  name: string;
  title: string;
  district?: string;
  county?: string;
  category: string;
  directEmail?: string;
  officeEmail?: string;
  officePhone?: string;
  status: 'pending' | 'checking' | 'done' | 'changed' | 'left_office' | 'error';
  result: null | Record<string, unknown>;
}

interface ScoutState {
  contacts: ScoutContact[];
  newContacts: ScoutContact[];
  scanStatus: Record<string, 'scanning' | 'done' | 'error'>;
  scanMeta: Record<string, { total: number; confidence: string; notes: string }>;
}

const LS_KEY = 'contactscout_state';
const SS_KEY = 'cs_api_key';

const SCAN_TARGETS = [
  { id: 'group-a', label: 'Group A — Category 1', desc: 'Describe the contacts you want to scan here' },
  { id: 'group-b', label: 'Group B — Category 2', desc: 'Describe the contacts you want to scan here' },
  { id: 'group-c', label: 'Group C — Category 3', desc: 'Describe the contacts you want to scan here' },
  { id: 'group-d', label: 'Group D — Category 4', desc: 'Describe the contacts you want to scan here' },
  { id: 'group-e', label: 'Group E — Category 5', desc: 'Describe the contacts you want to scan here' },
];

const SCAN_PROMPTS: Record<string, string> = {
  'group-a': 'Search for all current contacts in [GROUP A] for [YOUR ORG/REGION] as of 2025. For each: full name, title, official email.',
  'group-b': 'Search for all current contacts in [GROUP B] for [YOUR ORG/REGION] as of 2025. Full name, title, email.',
  'group-c': 'Search for all current contacts in [GROUP C] for [YOUR ORG/REGION] as of 2025. Full name, title, email.',
  'group-d': 'Search for all current contacts in [GROUP D] for [YOUR ORG/REGION] as of 2025. Full name, title, email.',
  'group-e': 'Search for all current contacts in [GROUP E] for [YOUR ORG/REGION] as of 2025. Full name, title, email.',
};

const VERIFY_SYS = `Verify this contact for 2025. Respond ONLY with valid JSON, no markdown:
{"stillInOffice":true,"currentTitle":"","directEmail":"","officeEmail":"","officePhone":"","changes":"No changes detected","flags":"","replacedBy":"","confidence":"high"}`;

const SCAN_SYS = `Find all current contacts for 2025 using web search. Respond ONLY with valid JSON, no markdown:
{"contacts":[{"name":"","title":"","district":"","county":"","category":"","directEmail":"","officeEmail":"","officePhone":""}],"confidence":"high","notes":""}`;

function loadScoutState(): ScoutState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { contacts: [], newContacts: [], scanStatus: {}, scanMeta: {} };
    const d = JSON.parse(raw);
    return {
      contacts: (d.officials ?? d.contacts ?? []).map((o: ScoutContact) => ({ ...o, result: o.result ?? null })),
      newContacts: d.newOfficials ?? d.newContacts ?? [],
      scanStatus: d.scanStatus ?? {},
      scanMeta: d.scanMeta ?? {},
    };
  } catch { return { contacts: [], newContacts: [], scanStatus: {}, scanMeta: {} }; }
}

function saveScoutState(s: ScoutState) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch { /* quota */ }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Status colors ─────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  pending: '#6e7681', checking: '#C8A84B', done: '#3fb950',
  changed: '#58a6ff', left_office: '#f85149', error: '#f85149',
};
const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending', checking: 'Checking…', done: 'Verified',
  changed: 'Changed', left_office: 'Inactive', error: 'Error',
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function ContactScoutPanel() {
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwErr, setPwErr] = useState(false);

  const [scout, setScout] = useState<ScoutState>(loadScoutState);
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem(SS_KEY) ?? '');
  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [log, setLog] = useState<string[]>([]);
  const abortRef = useRef(false);
  const importRef = useRef<HTMLInputElement>(null);

  const addLog = (m: string) => setLog(prev => [`[${new Date().toLocaleTimeString()}] ${m}`, ...prev.slice(0, 99)]);

  function persist(next: ScoutState) {
    setScout(next);
    saveScoutState(next);
  }

  function upd(name: string, patch: Partial<ScoutContact>) {
    setScout(prev => {
      const next = { ...prev, contacts: prev.contacts.map(c => c.name === name ? { ...c, ...patch } : c) };
      saveScoutState(next);
      return next;
    });
  }

  // ── Claude API ───────────────────────────────────────────────────────────────
  async function callClaude(sys: string, user: string): Promise<Record<string, unknown>> {
    if (!apiKey) {
      setShowKeyInput(true);
      throw new Error('API key required');
    }
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
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
      setApiKey(''); sessionStorage.removeItem(SS_KEY);
      throw new Error('Invalid API key');
    }
    const d = await res.json();
    if (d.error) throw new Error(d.error.message ?? 'API error');
    const text = (d.content as Array<{ type: string; text?: string }>)?.find(b => b.type === 'text')?.text ?? '';
    if (!text) throw new Error('No text response');
    return JSON.parse(text.replace(/```json|```/g, '').trim()) as Record<string, unknown>;
  }

  // ── Verify ───────────────────────────────────────────────────────────────────
  async function runVerify(names: string[]) {
    if (running) return;
    abortRef.current = false;
    setRunning(true);
    setProgress({ done: 0, total: names.length });
    for (let i = 0; i < names.length; i++) {
      if (abortRef.current) break;
      const name = names[i];
      const o = scout.contacts.find(c => c.name === name);
      if (!o) continue;
      addLog(`Verifying ${name}…`);
      upd(name, { status: 'checking' });
      try {
        const r = await callClaude(VERIFY_SYS,
          `Verify for 2025:\nName: ${o.name}\nTitle: ${o.title}\nCategory: ${o.category}\nDistrict: ${o.district ?? 'N/A'}\nEmail: ${o.directEmail ?? o.officeEmail ?? 'none'}`);
        const changed = !r.stillInOffice || r.changes !== 'No changes detected' || r.flags;
        upd(name, {
          status: !r.stillInOffice ? 'left_office' : changed ? 'changed' : 'done',
          result: r,
          directEmail: (r.directEmail as string) || o.directEmail,
          officeEmail: (r.officeEmail as string) || o.officeEmail,
          officePhone: (r.officePhone as string) || o.officePhone,
          title: (r.currentTitle as string) || o.title,
        });
        addLog(`✓ ${name}: ${r.stillInOffice ? 'Active' : '⚠ Inactive'} — ${r.changes}`);
      } catch (e) {
        upd(name, { status: 'error', result: { error: String(e) } });
        addLog(`✗ ${name}: ${String(e)}`);
      }
      setProgress({ done: i + 1, total: names.length });
      if (i < names.length - 1) await sleep(700);
    }
    setRunning(false);
    addLog(`Done — ${names.length} checked.`);
  }

  // ── Scan ─────────────────────────────────────────────────────────────────────
  async function runScan(id: string) {
    if (running) return;
    abortRef.current = false;
    setRunning(true);
    setScout(prev => {
      const next = { ...prev, scanStatus: { ...prev.scanStatus, [id]: 'scanning' as const } };
      saveScoutState(next);
      return next;
    });
    addLog(`Scanning: ${SCAN_TARGETS.find(t => t.id === id)?.label}…`);
    try {
      const r = await callClaude(SCAN_SYS, SCAN_PROMPTS[id]);
      const contacts = (r.contacts ?? r.officials ?? []) as Array<Record<string, string>>;
      setScout(prev => {
        const cur = new Set(prev.contacts.map(c => c.name.toLowerCase().trim()));
        const fresh = contacts.filter(c => !cur.has(c.name.toLowerCase().trim()));
        const ex = new Set(prev.newContacts.map(c => c.name.toLowerCase()));
        const next: ScoutState = {
          ...prev,
          scanStatus: { ...prev.scanStatus, [id]: 'done' },
          scanMeta: { ...prev.scanMeta, [id]: { total: contacts.length, confidence: r.confidence as string ?? '', notes: r.notes as string ?? '' } },
          newContacts: [...prev.newContacts, ...fresh.filter(c => !ex.has(c.name.toLowerCase())).map(c => ({ name: c.name ?? '', title: c.title ?? '', category: c.category ?? '', district: c.district, county: c.county, directEmail: c.directEmail, officeEmail: c.officeEmail, officePhone: c.officePhone, status: 'pending' as const, result: null }))],
        };
        saveScoutState(next);
        addLog(fresh.length > 0 ? `✓ ${fresh.length} new found.` : `✓ All ${contacts.length} already in list.`);
        return next;
      });
    } catch (e) {
      setScout(prev => {
        const next = { ...prev, scanStatus: { ...prev.scanStatus, [id]: 'error' as const } };
        saveScoutState(next);
        return next;
      });
      addLog(`✗ Scan: ${String(e)}`);
    }
    setRunning(false);
  }

  // ── Export to InviteFlow ──────────────────────────────────────────────────────
  function exportToInviteFlow() {
    const toAdd = scout.contacts
      .filter(c => c.status !== 'left_office')
      .map(c => {
        const full = c.name.trim();
        const parts = full.split(' ');
        const inv: Invitee = {
          id: crypto.randomUUID(),
          firstName: parts[0] ?? '',
          lastName: parts.slice(1).join(' '),
          title: c.title ?? '',
          category: c.category ?? '',
          email: c.officeEmail ?? c.directEmail ?? '',
          rsvpLink: '',
          inviteStatus: 'pending',
          sentAt: '',
          rsvpStatus: 'No Response',
          rsvpDate: '',
          notes: c.result ? `Verified: ${(c.result.changes as string) ?? ''}`.trim() : '',
        };
        return inv;
      })
      .filter(i => i.email);
    dispatch({ type: 'SET_INVITEES', invitees: toAdd });
    addLog(`✓ Pushed ${toAdd.length} contacts to InviteFlow.`);
  }

  // ── Backup I/O ────────────────────────────────────────────────────────────────
  function exportBackup() {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), source: 'ContactScout', ...scout }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `contactscout-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  function importBackup(file: File) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result as string);
        persist({
          contacts: (d.officials ?? d.contacts ?? []).map((c: ScoutContact) => ({ ...c, result: c.result ?? null })),
          newContacts: d.newOfficials ?? d.newContacts ?? [],
          scanStatus: d.scanStatus ?? {},
          scanMeta: d.scanMeta ?? {},
        });
        addLog(`✓ Backup loaded.`);
      } catch (e) { addLog(`✗ Import failed: ${String(e)}`); }
    };
    r.readAsText(file);
  }

  // ── Styles ────────────────────────────────────────────────────────────────────
  const s = {
    panel: { border: '1px solid #21262d', borderRadius: 6, background: '#0d1117', marginTop: 8 } as React.CSSProperties,
    header: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer', userSelect: 'none' as const },
    label: { fontSize: 10, color: '#6e7681', letterSpacing: '0.1em', textTransform: 'uppercase' as const },
    body: { padding: '12px 16px', borderTop: '1px solid #21262d' },
    btn: (color = '#8b949e', bg = 'transparent'): React.CSSProperties => ({
      border: `1px solid ${color}`, background: bg, color, padding: '4px 10px',
      borderRadius: 4, cursor: 'pointer', fontFamily: 'monospace', fontSize: 10,
      letterSpacing: '0.05em', whiteSpace: 'nowrap',
    }),
    input: { background: '#0d1117', border: '1px solid #21262d', color: '#c9d1d9', padding: '5px 8px', borderRadius: 4, fontFamily: 'monospace', fontSize: 11 } as React.CSSProperties,
  };

  // ── Lock screen ───────────────────────────────────────────────────────────────
  function renderLock() {
    return (
      <div style={{ padding: '16px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="password"
          placeholder="Enter passcode…"
          value={pwInput}
          onChange={e => { setPwInput(e.target.value); setPwErr(false); }}
          onKeyDown={e => e.key === 'Enter' && tryUnlock()}
          style={{ ...s.input, width: 160 }}
        />
        <button style={s.btn('#58a6ff')} onClick={tryUnlock}>Unlock</button>
        {pwErr && <span style={{ fontSize: 10, color: '#f85149' }}>Incorrect passcode</span>}
      </div>
    );
  }

  function tryUnlock() {
    if (pwInput === 'scout2025') { setUnlocked(true); setPwErr(false); }
    else { setPwErr(true); }
  }

  // ── Main UI ───────────────────────────────────────────────────────────────────
  function renderContent() {
    return (
      <div style={s.body}>
        {/* API key row */}
        {showKeyInput ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <input
              type="password"
              placeholder="sk-ant-…"
              value={apiKeyDraft}
              onChange={e => setApiKeyDraft(e.target.value)}
              style={{ ...s.input, flex: 1 }}
            />
            <button style={s.btn('#3fb950')} onClick={() => {
              if (!apiKeyDraft.startsWith('sk-ant-')) return;
              setApiKey(apiKeyDraft);
              sessionStorage.setItem(SS_KEY, apiKeyDraft);
              setApiKeyDraft(''); setShowKeyInput(false);
            }}>Save Key</button>
            <button style={s.btn()} onClick={() => setShowKeyInput(false)}>Cancel</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, color: apiKey ? '#3fb950' : '#f85149' }}>
              {apiKey ? '● API key set' : '● No API key'}
            </span>
            <button style={s.btn()} onClick={() => setShowKeyInput(true)}>
              {apiKey ? 'Change Key' : 'Set API Key'}
            </button>
            <button style={s.btn('#C8A84B', '#1c1a10')} onClick={exportToInviteFlow} title="Push active contacts to Invitees list">
              Push to InviteFlow ({scout.contacts.filter(c => c.status !== 'left_office').length})
            </button>
            <button style={s.btn()} onClick={exportBackup}>Backup</button>
            <button style={s.btn()} onClick={() => importRef.current?.click()}>Restore</button>
            <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && importBackup(e.target.files[0])} />
            {running && (
              <>
                <span style={{ fontSize: 10, color: '#C8A84B' }}>{progress.done}/{progress.total}</span>
                <button style={s.btn('#f85149')} onClick={() => { abortRef.current = true; }}>Stop</button>
              </>
            )}
          </div>
        )}

        {/* Scan targets */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {SCAN_TARGETS.map(t => {
            const st = scout.scanStatus[t.id];
            return (
              <button key={t.id} style={s.btn(st === 'done' ? '#3fb950' : st === 'scanning' ? '#C8A84B' : '#8b949e')}
                onClick={() => runScan(t.id)} disabled={running} title={t.desc}>
                {st === 'scanning' ? '↻ ' : st === 'done' ? '✓ ' : ''}
                {t.label.split(' — ')[0]}
              </button>
            );
          })}
          {scout.contacts.length > 0 && (
            <button style={s.btn('#58a6ff')} disabled={running}
              onClick={() => runVerify(scout.contacts.filter(c => c.status === 'pending').map(c => c.name))}>
              Verify All Pending
            </button>
          )}
        </div>

        {/* New contacts found */}
        {scout.newContacts.length > 0 && (
          <div style={{ marginBottom: 10, border: '1px solid #21262d', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ padding: '6px 10px', background: '#161b22', fontSize: 10, color: '#C8A84B', letterSpacing: '0.08em' }}>
              NEW CONTACTS ({scout.newContacts.length})
            </div>
            {scout.newContacts.slice(0, 8).map(c => (
              <div key={c.name} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '5px 10px', borderTop: '1px solid #0d1117', fontSize: 10 }}>
                <span style={{ flex: 1, color: '#c9d1d9' }}>{c.name}</span>
                <span style={{ color: '#6e7681' }}>{c.title}</span>
                <button style={{ ...s.btn('#3fb950'), padding: '2px 7px', fontSize: 9 }} onClick={() => {
                  persist({
                    ...scout,
                    contacts: [...scout.contacts, { ...c, status: 'pending', result: null }],
                    newContacts: scout.newContacts.filter(x => x.name !== c.name),
                  });
                  addLog(`+ Added ${c.name}`);
                }}>Add</button>
                <button style={{ ...s.btn('#6e7681'), padding: '2px 7px', fontSize: 9 }} onClick={() => {
                  persist({ ...scout, newContacts: scout.newContacts.filter(x => x.name !== c.name) });
                }}>Dismiss</button>
              </div>
            ))}
            {scout.newContacts.length > 8 && (
              <div style={{ padding: '4px 10px', fontSize: 9, color: '#6e7681' }}>+{scout.newContacts.length - 8} more…</div>
            )}
          </div>
        )}

        {/* Contact list */}
        {scout.contacts.length === 0 ? (
          <div style={{ fontSize: 10, color: '#6e7681', fontStyle: 'italic', padding: '8px 0' }}>
            No contacts yet — run a scan above or restore a backup.
          </div>
        ) : (
          <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid #21262d', borderRadius: 4 }}>
            {scout.contacts.map(c => (
              <div key={c.name} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '5px 10px', borderBottom: '1px solid #0d1117', fontSize: 10 }}>
                <span style={{ width: 56, color: STATUS_COLOR[c.status], letterSpacing: '0.06em', flexShrink: 0, fontSize: 9 }}>
                  {STATUS_LABEL[c.status]}
                </span>
                <span style={{ flex: 1, color: '#c9d1d9' }}>{c.name}</span>
                <span style={{ color: '#6e7681', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                <span style={{ color: '#6e7681', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.officeEmail ?? c.directEmail}</span>
                {c.status === 'pending' && (
                  <button style={{ ...s.btn('#58a6ff'), padding: '2px 7px', fontSize: 9 }} onClick={() => runVerify([c.name])} disabled={running}>
                    Verify
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Log */}
        {log.length > 0 && (
          <div style={{ marginTop: 10, maxHeight: 80, overflowY: 'auto', fontSize: 9, color: '#6e7681', fontFamily: 'monospace', lineHeight: 1.6 }}>
            {log.slice(0, 10).map((l, i) => <div key={i}>{l}</div>)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ ...s.panel, opacity: open && !unlocked ? 0.6 : 1 }}>
      <div style={s.header} onClick={() => setOpen(o => !o)}>
        <span style={s.label}>ContactScout</span>
        <span style={{ fontSize: 9, color: '#6e7681' }}>— Claude-powered contact discovery</span>
        {!unlocked && open && <span style={{ fontSize: 9, color: '#C8A84B', marginLeft: 4 }}>🔒</span>}
        <span style={{ marginLeft: 'auto', fontSize: 10, color: '#6e7681' }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (unlocked ? renderContent() : renderLock())}
    </div>
  );
}
