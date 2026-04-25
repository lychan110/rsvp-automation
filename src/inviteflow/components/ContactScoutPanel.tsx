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

// ── Status styles ─────────────────────────────────────────────────────────────
const STATUS_CLASS: Record<string, string> = {
  pending: 'text-gray-400 dark:text-[#6e7681]',
  checking: 'text-[#C8A84B]',
  done: 'text-green-600 dark:text-[#3fb950]',
  changed: 'text-blue-600 dark:text-[#58a6ff]',
  left_office: 'text-red-600 dark:text-[#f85149]',
  error: 'text-red-600 dark:text-[#f85149]',
};
const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending', checking: 'Checking…', done: 'Verified',
  changed: 'Changed', left_office: 'Inactive', error: 'Error',
};

const BTN_GHOST = "min-h-[44px] px-3 py-1 rounded border border-gray-300 bg-transparent text-gray-700 text-xs font-mono tracking-wide cursor-pointer hover:bg-gray-100 dark:border-[#21262d] dark:text-[#8b949e] dark:hover:bg-[#161b22] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";
const BTN_GREEN = "min-h-[44px] px-3 py-1 rounded border border-green-600 bg-green-600 text-white text-xs font-mono tracking-wide cursor-pointer hover:bg-green-700 dark:border-[#238636] dark:bg-[#238636] disabled:opacity-50 disabled:cursor-not-allowed";
const BTN_BLUE_GHOST = "min-h-[44px] px-3 py-1 rounded border border-blue-400 bg-transparent text-blue-600 text-xs font-mono tracking-wide cursor-pointer hover:bg-blue-50 dark:border-[#58a6ff] dark:text-[#58a6ff] dark:hover:bg-[#0d1f3c] disabled:opacity-50 disabled:cursor-not-allowed";
const BTN_GOLD = "min-h-[44px] px-3 py-1 rounded border border-[#C8A84B] bg-[#1c1a10] text-[#C8A84B] text-xs font-mono tracking-wide cursor-pointer hover:bg-[#2a2510] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";
const BTN_DANGER = "min-h-[44px] px-3 py-1 rounded border border-red-500 bg-transparent text-red-600 text-xs font-mono tracking-wide cursor-pointer hover:bg-red-50 dark:border-[#f85149] dark:text-[#f85149] disabled:opacity-50 disabled:cursor-not-allowed";
const BTN_SCAN = (st: string) => `min-h-[44px] px-3 py-1 rounded border text-xs font-mono tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
  st === 'done' ? 'border-green-500 text-green-600 dark:border-[#3fb950] dark:text-[#3fb950]' :
  st === 'scanning' ? 'border-[#C8A84B] text-[#C8A84B]' :
  'border-gray-300 text-gray-600 dark:border-[#21262d] dark:text-[#8b949e]'
}`;
const INPUT = "bg-white border border-gray-300 text-gray-900 text-xs font-mono px-2.5 py-1.5 rounded outline-none focus:border-blue-500 dark:bg-[#0d1117] dark:border-[#21262d] dark:text-[#c9d1d9]";

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

  function tryUnlock() {
    if (pwInput === 'scout2025') { setUnlocked(true); setPwErr(false); }
    else { setPwErr(true); }
  }

  // ── Lock screen ───────────────────────────────────────────────────────────────
  function renderLock() {
    return (
      <div className="px-4 py-3 flex flex-wrap gap-2 items-center border-t border-gray-200 dark:border-[#21262d]">
        <input
          type="password"
          placeholder="Enter passcode…"
          value={pwInput}
          onChange={e => { setPwInput(e.target.value); setPwErr(false); }}
          onKeyDown={e => e.key === 'Enter' && tryUnlock()}
          className={`${INPUT} w-40`}
        />
        <button className={BTN_BLUE_GHOST} onClick={tryUnlock}>Unlock</button>
        {pwErr && <span className="text-[10px] text-red-600 dark:text-[#f85149]">Incorrect passcode</span>}
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────────────────
  function renderContent() {
    return (
      <div className="px-4 py-3 border-t border-gray-200 dark:border-[#21262d]">
        {/* API key row */}
        {showKeyInput ? (
          <div className="flex flex-wrap gap-2 items-center mb-3">
            <input
              type="password"
              placeholder="sk-ant-…"
              value={apiKeyDraft}
              onChange={e => setApiKeyDraft(e.target.value)}
              className={`${INPUT} flex-1 min-w-[180px]`}
            />
            <button className={BTN_GREEN} onClick={() => {
              if (!apiKeyDraft.startsWith('sk-ant-')) return;
              setApiKey(apiKeyDraft);
              sessionStorage.setItem(SS_KEY, apiKeyDraft);
              setApiKeyDraft(''); setShowKeyInput(false);
            }}>Save Key</button>
            <button className={BTN_GHOST} onClick={() => setShowKeyInput(false)}>Cancel</button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 items-center mb-3">
            <span className={`text-[10px] font-mono ${apiKey ? 'text-green-600 dark:text-[#3fb950]' : 'text-red-600 dark:text-[#f85149]'}`}>
              {apiKey ? '● API key set' : '● No API key'}
            </span>
            <button className={BTN_GHOST} onClick={() => setShowKeyInput(true)}>
              {apiKey ? 'Change Key' : 'Set API Key'}
            </button>
            <button className={BTN_GOLD} onClick={exportToInviteFlow} title="Push active contacts to Invitees list">
              Push to InviteFlow ({scout.contacts.filter(c => c.status !== 'left_office').length})
            </button>
            <button className={BTN_GHOST} onClick={exportBackup}>Backup</button>
            <button className={BTN_GHOST} onClick={() => importRef.current?.click()}>Restore</button>
            <input ref={importRef} type="file" accept=".json" className="hidden"
              onChange={e => e.target.files?.[0] && importBackup(e.target.files[0])} />
            {running && (
              <>
                <span className="text-[10px] text-[#C8A84B] font-mono">{progress.done}/{progress.total}</span>
                <button className={BTN_DANGER} onClick={() => { abortRef.current = true; }}>Stop</button>
              </>
            )}
          </div>
        )}

        {/* Scan targets */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {SCAN_TARGETS.map(t => {
            const st = scout.scanStatus[t.id] ?? '';
            return (
              <button key={t.id} className={BTN_SCAN(st)}
                onClick={() => runScan(t.id)} disabled={running} title={t.desc}>
                {st === 'scanning' ? '↻ ' : st === 'done' ? '✓ ' : ''}
                {t.label.split(' — ')[0]}
              </button>
            );
          })}
          {scout.contacts.length > 0 && (
            <button className={BTN_BLUE_GHOST} disabled={running}
              onClick={() => runVerify(scout.contacts.filter(c => c.status === 'pending').map(c => c.name))}>
              Verify All Pending
            </button>
          )}
        </div>

        {/* New contacts found */}
        {scout.newContacts.length > 0 && (
          <div className="mb-2.5 border border-gray-200 rounded overflow-hidden dark:border-[#21262d]">
            <div className="px-2.5 py-1.5 bg-gray-100 text-[10px] text-[#C8A84B] tracking-[0.08em] font-mono dark:bg-[#161b22]">
              NEW CONTACTS ({scout.newContacts.length})
            </div>
            {scout.newContacts.slice(0, 8).map(c => (
              <div key={c.name} className="flex flex-wrap gap-2 items-center px-2.5 py-1.5 border-t border-gray-100 text-xs dark:border-[#0d1117]">
                <span className="flex-1 text-gray-900 dark:text-[#c9d1d9]">{c.name}</span>
                <span className="text-gray-500 dark:text-[#6e7681]">{c.title}</span>
                <button className="min-h-[32px] px-2 py-0.5 rounded border border-green-500 text-green-600 text-[9px] font-mono cursor-pointer hover:bg-green-50 dark:border-[#3fb950] dark:text-[#3fb950]"
                  onClick={() => {
                    persist({
                      ...scout,
                      contacts: [...scout.contacts, { ...c, status: 'pending', result: null }],
                      newContacts: scout.newContacts.filter(x => x.name !== c.name),
                    });
                    addLog(`+ Added ${c.name}`);
                  }}>Add</button>
                <button className="min-h-[32px] px-2 py-0.5 rounded border border-gray-300 text-gray-500 text-[9px] font-mono cursor-pointer hover:bg-gray-100 dark:border-[#21262d] dark:text-[#6e7681]"
                  onClick={() => {
                    persist({ ...scout, newContacts: scout.newContacts.filter(x => x.name !== c.name) });
                  }}>Dismiss</button>
              </div>
            ))}
            {scout.newContacts.length > 8 && (
              <div className="px-2.5 py-1 text-[9px] text-gray-400 dark:text-[#6e7681]">+{scout.newContacts.length - 8} more…</div>
            )}
          </div>
        )}

        {/* Contact list */}
        {scout.contacts.length === 0 ? (
          <div className="text-[10px] text-gray-500 italic py-2 dark:text-[#6e7681]">
            No contacts yet — run a scan above or restore a backup.
          </div>
        ) : (
          <div
            className="max-h-64 overflow-y-auto border border-gray-200 rounded dark:border-[#21262d]"
            role="region"
            aria-label="Contact list"
            tabIndex={0}
          >
            {scout.contacts.map(c => (
              <div key={c.name} className="flex flex-wrap gap-2 items-center px-2.5 py-1.5 border-b border-gray-100 text-xs dark:border-[#0d1117]">
                <span className={`w-14 text-[9px] font-mono tracking-[0.06em] shrink-0 ${STATUS_CLASS[c.status] ?? 'text-gray-400'}`}>
                  {STATUS_LABEL[c.status]}
                </span>
                <span className="flex-1 text-gray-900 dark:text-[#c9d1d9]">{c.name}</span>
                <span className="text-gray-500 max-w-[160px] truncate dark:text-[#6e7681]">{c.title}</span>
                <span className="text-gray-500 max-w-[140px] truncate dark:text-[#6e7681]">{c.officeEmail ?? c.directEmail}</span>
                {c.status === 'pending' && (
                  <button
                    className="min-h-[32px] px-2 py-0.5 rounded border border-blue-400 text-blue-600 text-[9px] font-mono cursor-pointer hover:bg-blue-50 dark:border-[#58a6ff] dark:text-[#58a6ff] disabled:opacity-50"
                    onClick={() => runVerify([c.name])} disabled={running}>
                    Verify
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Log */}
        {log.length > 0 && (
          <div className="mt-2.5 max-h-20 overflow-y-auto text-[9px] text-gray-400 font-mono leading-relaxed dark:text-[#6e7681]">
            {log.slice(0, 10).map((l, i) => <div key={i}>{l}</div>)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`mt-2 border border-gray-200 rounded-lg bg-white dark:bg-[#0d1117] dark:border-[#21262d] ${open && !unlocked ? 'opacity-60' : ''}`}>
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none min-h-[44px]"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-[10px] text-gray-500 tracking-[0.1em] font-mono uppercase dark:text-[#6e7681]">ContactScout</span>
        <span className="text-[9px] text-gray-400 dark:text-[#6e7681]">— Claude-powered contact discovery</span>
        {!unlocked && open && <span className="text-[9px] text-[#C8A84B] ml-1">🔒</span>}
        <span className="ml-auto text-[10px] text-gray-400 dark:text-[#6e7681]">{open ? '▲' : '▼'}</span>
      </div>
      {open && (unlocked ? renderContent() : renderLock())}
    </div>
  );
}
