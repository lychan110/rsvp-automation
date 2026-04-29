import { useState, useRef, useCallback, useEffect } from 'react';
import {
  CS_APIKEY_SK, CS_OS_KEY, VERIFY_SYS, SCAN_SYS, SCAN_TARGETS,
  MODEL_SCAN, MODEL_VERIFY,
} from './constants';
import { loadCSState, saveCSState, loadJurisdiction } from './storage';
import { sleep, officialToInvitee, buildScanPrompts, downloadBlob, todaySlug } from './utils';
import { applyEmailInference } from './emailPatterns';
import { callGemini } from './api';
import { fetchStateLegislators } from './openStates';
import ApiKeyModal from './components/ApiKeyModal';
import JurisdictionModal from './components/JurisdictionModal';
import AddOfficialModal from './components/AddOfficialModal';
import LogSidebar from './components/LogSidebar';
import DiscoverTab from './components/DiscoverTab';
import OfficialsTab from './components/OfficialsTab';
import ExportTab from './components/ExportTab';
import type { CSOfficial, CSPersistedState, CSStatus, ScanState, CSJurisdiction } from './types';

// ── Root ───────────────────────────────────────────────────────────────────────

export default function App() {
  return <ContactScoutInner />;
}

// ── Blank official used for new entries ───────────────────────────────────────

function blankOfficial(): CSOfficial {
  return {
    name: '', title: '', district: '', county: '', category: '',
    directEmail: '', officeEmail: '', officePhone: '',
    schedulerName: '', schedulerEmail: '', appearanceFormUrl: '',
    emailSource: 'manual',
    status: 'pending', result: null,
  };
}

/** Normalises an official coming from the API, filling in any missing new fields. */
function normaliseOfficial(o: CSOfficial): CSOfficial {
  return {
    ...blankOfficial(),
    ...o,
    schedulerName:      o.schedulerName      ?? '',
    schedulerEmail:     o.schedulerEmail     ?? '',
    appearanceFormUrl:  o.appearanceFormUrl  ?? '',
    emailSource:        o.emailSource        ?? 'scanned',
  };
}

// ── Inner component (all app state lives here) ─────────────────────────────────

function ContactScoutInner() {
  const init = loadCSState();
  const [officials,    setOfficials]    = useState<CSOfficial[]>(
    init.officials.map(normaliseOfficial),
  );
  const [newOfficials, setNewOfficials] = useState<CSOfficial[]>(
    init.newOfficials.map(normaliseOfficial),
  );
  const [scanStatus,   setScanStatus]   = useState<Record<string, ScanState>>(init.scanStatus);
  const [scanMeta,     setScanMeta]     = useState<CSPersistedState['scanMeta']>(init.scanMeta);

  const [tab,           setTab]          = useState<0 | 1 | 2>(0);
  const [activeCat,     setActiveCat]    = useState('All');
  const [selected,      setSelected]     = useState<Set<string>>(new Set());
  const [running,       setRunning]      = useState(false);
  const [progress,      setProgress]     = useState({ done: 0, total: 0 });
  const [log,           setLog]          = useState<string[]>([]);
  const [apiKey,        setApiKey]       = useState(() => sessionStorage.getItem(CS_APIKEY_SK) || '');
  const [osApiKey,      setOsApiKey]     = useState(() => sessionStorage.getItem(CS_OS_KEY) || '');
  const [jx,            setJx]           = useState<CSJurisdiction>(loadJurisdiction);
  const [showKeyModal,  setShowKeyModal]  = useState(false);
  const [showJxModal,   setShowJxModal]   = useState(false);
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [showLog,       setShowLog]       = useState(false);

  const abortRef      = useRef(false);
  const pendingRef    = useRef<(() => void) | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveCSState({ officials, newOfficials, scanStatus, scanMeta });
  }, [officials, newOfficials, scanStatus, scanMeta]);

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString();
    setLog(prev => [`[${ts}] ${msg}`, ...prev.slice(0, 199)]);
  }, []);

  // ── API key flow ───────────────────────────────────────────────────────────

  function openKeyModal(onSave?: () => void) {
    pendingRef.current = onSave ?? null;
    setShowKeyModal(true);
  }

  function handleKeySave(geminiKey: string, osKey: string) {
    setApiKey(geminiKey);
    if (geminiKey) sessionStorage.setItem(CS_APIKEY_SK, geminiKey);
    else sessionStorage.removeItem(CS_APIKEY_SK);

    setOsApiKey(osKey);
    if (osKey) sessionStorage.setItem(CS_OS_KEY, osKey);
    else sessionStorage.removeItem(CS_OS_KEY);

    const cb = pendingRef.current;
    pendingRef.current = null;
    cb?.();
  }

  async function apiCall(
    model: string,
    sys: string,
    user: string,
  ): Promise<Record<string, unknown>> {
    if (!apiKey) {
      return new Promise((resolve, reject) => {
        openKeyModal(() => apiCall(model, sys, user).then(resolve).catch(reject));
      });
    }
    try {
      return await callGemini(apiKey, model, sys, user);
    } catch (e) {
      if (String(e).includes('Invalid API key')) setApiKey('');
      throw e;
    }
  }

  // ── Verify loop ────────────────────────────────────────────────────────────

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
      setOfficials(prev =>
        prev.map(o => o.name === name ? { ...o, status: 'checking' } : o),
      );

      try {
        const prompt =
          `Verify for 2025-2026:\n` +
          `Name: ${off.name}\nTitle: ${off.title}\nCategory: ${off.category}\n` +
          `District: ${off.district || 'N/A'}\n` +
          `Direct email: ${off.directEmail || 'none'}\n` +
          `Office email: ${off.officeEmail || 'none'}\n` +
          `Scheduler: ${off.schedulerName || 'unknown'} <${off.schedulerEmail || 'none'}>\n` +
          `Appearance form: ${off.appearanceFormUrl || 'none'}`;

        const r = await apiCall(MODEL_VERIFY, VERIFY_SYS, prompt);

        const changed = !r.stillInOffice || r.changes !== 'No changes detected' || r.flags;
        const newStatus: CSStatus = !r.stillInOffice
          ? 'left_office'
          : changed ? 'changed' : 'done';

        setOfficials(prev => prev.map(o => {
          if (o.name !== name) return o;
          return {
            ...o,
            status:           newStatus,
            result:           r as Record<string, string | boolean>,
            directEmail:      (r.directEmail as string)     || o.directEmail,
            officeEmail:      (r.officeEmail as string)     || o.officeEmail,
            officePhone:      (r.officePhone as string)     || o.officePhone,
            schedulerName:    (r.schedulerName as string)   || o.schedulerName,
            schedulerEmail:   (r.schedulerEmail as string)  || o.schedulerEmail,
            appearanceFormUrl:(r.appearanceFormUrl as string) || o.appearanceFormUrl,
            title:            (r.currentTitle as string)    || o.title,
            emailSource:      (r.directEmail || r.officeEmail) ? 'scanned' : o.emailSource,
          };
        }));

        const sched = (r.schedulerName as string) ? ` · sched: ${r.schedulerName as string}` : '';
        addLog(`✓ ${name}: ${r.stillInOffice ? 'In office' : '⚠ LEFT OFFICE'} — ${r.changes as string}${sched}`);
      } catch (e) {
        setOfficials(prev =>
          prev.map(o => o.name === name
            ? { ...o, status: 'error', result: { error: String(e) } }
            : o),
        );
        addLog(`✗ ${name}: ${String(e)}`);
      }

      setProgress({ done: i + 1, total: names.length });
      if (i < names.length - 1) await sleep(4500);
    }

    setRunning(false);
    addLog(`Done — ${names.length} verified.`);
  }

  // ── Scan ───────────────────────────────────────────────────────────────────

  async function runScan(id: string) {
    if (running) return;

    const isStateLeg = id === 'state-senate' || id === 'state-house';
    const useOpenStates = isStateLeg && !!osApiKey;

    // Open States scans don't need a Gemini key; all other scans do.
    if (!useOpenStates && !apiKey) { openKeyModal(() => runScan(id)); return; }

    abortRef.current = false;
    setRunning(true);
    setScanStatus(prev => ({ ...prev, [id]: 'scanning' }));
    addLog(`Scanning: ${SCAN_TARGETS.find(t => t.id === id)?.label}…`);

    try {
      if (useOpenStates) {
        const chamber = id === 'state-senate' ? 'upper' : 'lower';
        const { officials: found, total } = await fetchStateLegislators(osApiKey, jx.state, chamber);

        const currentNames = new Set(officials.map(o => o.name.toLowerCase().trim()));
        const fresh = found.filter(o => !currentNames.has(o.name.toLowerCase().trim()));

        const { officials: inferredFresh, inferredCount } = applyEmailInference(fresh, jx);

        setScanStatus(prev => ({ ...prev, [id]: 'done' }));
        setScanMeta(prev => ({
          ...prev,
          [id]: {
            total,
            confidence: 'high',
            notes: id === 'state-house'
              ? 'All districts via Open States — dismiss those outside your counties'
              : 'via Open States API',
          },
        }));

        if (inferredFresh.length > 0) {
          setNewOfficials(prev => {
            const ex = new Set(prev.map(x => x.name.toLowerCase()));
            return [
              ...prev,
              ...inferredFresh
                .filter(x => !ex.has(x.name.toLowerCase()))
                .map(x => ({ ...x, _scanId: id, status: 'pending' as CSStatus })),
            ];
          });
          const infMsg = inferredCount > 0 ? `, ${inferredCount} emails inferred` : '';
          addLog(`✓ Open States: ${inferredFresh.length} new (${total} total)${infMsg}. Verify individuals to add scheduler info.`);
        } else {
          addLog(`✓ Open States: All ${total} already in list.`);
        }
      } else {
        // Gemini path
        const r = await apiCall(MODEL_SCAN, SCAN_SYS, buildScanPrompts(jx)[id]);
        const currentNames = new Set(officials.map(o => o.name.toLowerCase().trim()));
        const found = ((r.officials as CSOfficial[]) ?? []).map(normaliseOfficial);
        const fresh = found.filter(o => !currentNames.has(o.name.toLowerCase().trim()));

        const { officials: inferredFresh, inferredCount } = applyEmailInference(fresh, jx);

        setScanStatus(prev => ({ ...prev, [id]: 'done' }));
        setScanMeta(prev => ({
          ...prev,
          [id]: { total: found.length, confidence: r.confidence as string, notes: r.notes as string },
        }));

        if (inferredFresh.length > 0) {
          setNewOfficials(prev => {
            const ex = new Set(prev.map(x => x.name.toLowerCase()));
            return [
              ...prev,
              ...inferredFresh
                .filter(x => !ex.has(x.name.toLowerCase()))
                .map(x => ({ ...x, _scanId: id, status: 'pending' as CSStatus })),
            ];
          });
          const infMsg = inferredCount > 0 ? `, ${inferredCount} emails inferred` : '';
          addLog(`✓ ${inferredFresh.length} new found${infMsg}.`);
        } else {
          addLog(`✓ All ${found.length} already in list.`);
        }
        if (r.notes) addLog(`ℹ ${r.notes as string}`);
      }
    } catch (e) {
      setScanStatus(prev => ({ ...prev, [id]: 'error' }));
      addLog(`✗ Scan: ${String(e)}`);
    }

    setRunning(false);
  }

  // ── Officials management ───────────────────────────────────────────────────

  function addNew(o: CSOfficial) {
    setOfficials(prev => [...prev, normaliseOfficial({ ...o, status: 'pending', result: null })]);
    setNewOfficials(prev => prev.filter(x => x.name !== o.name));
    const sched = o.schedulerEmail ? ` (sched: ${o.schedulerEmail})` : '';
    addLog(`+ Added ${o.name}${sched}`);
  }

  function dismissNew(name: string) {
    setNewOfficials(prev => prev.filter(x => x.name !== name));
  }

  function addManual(o: CSOfficial) {
    setOfficials(prev => [...prev, normaliseOfficial(o)]);
    const sched = o.schedulerEmail ? ` · sched: ${o.schedulerEmail}` : '';
    addLog(`+ Manually added ${o.name}${sched}`);
  }

  function toggleSel(name: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  // ── Infer emails for all officials missing one ─────────────────────────────

  function inferMissing() {
    const { officials: updated, inferredCount } = applyEmailInference(officials, jx);
    setOfficials(updated);
    if (inferredCount > 0) {
      addLog(`✓ Inferred ${inferredCount} email${inferredCount !== 1 ? 's' : ''} from name patterns.`);
    } else {
      addLog('ℹ No new emails could be inferred — all officials already have an email or no pattern applies.');
    }
  }

  // ── Export / import ────────────────────────────────────────────────────────

  function exportForInviteFlow() {
    const invitees = officials
      .filter(o => o.status !== 'left_office' && (o.officeEmail || o.directEmail || o.schedulerEmail))
      .map(officialToInvitee);
    if (invitees.length === 0) { addLog('No officials with an email to export.'); return; }
    downloadBlob(
      new Blob(
        [JSON.stringify({ exportedAt: new Date().toISOString(), source: 'ContactScout', count: invitees.length, invitees }, null, 2)],
        { type: 'application/json' },
      ),
      `contactscout-invitees-${todaySlug()}.json`,
    );
    addLog(`✓ Exported ${invitees.length} invitees for InviteFlow.`);
  }

  function exportBackup() {
    downloadBlob(
      new Blob(
        [JSON.stringify({ exportedAt: new Date().toISOString(), source: 'ContactScout', officials, newOfficials, scanStatus, scanMeta }, null, 2)],
        { type: 'application/json' },
      ),
      `contactscout-backup-${todaySlug()}.json`,
    );
    addLog(`✓ Backup saved (${officials.length} officials).`);
  }

  function exportCSV() {
    const h = [
      'Name','Title','District','County','Category',
      'Direct Email','Office Email','Phone',
      'Scheduler Name','Scheduler Email','Appearance Form URL',
      'Email Source','Status','Changes','Flags','Replaced By','Confidence',
    ];
    const rows = officials.map(o => [
      o.name, o.title, o.district, o.county, o.category,
      o.directEmail, o.officeEmail, o.officePhone,
      o.schedulerName, o.schedulerEmail, o.appearanceFormUrl,
      o.emailSource, o.status,
      o.result?.changes as string || '',
      o.result?.flags as string || '',
      o.result?.replacedBy as string || '',
      o.result?.confidence as string || '',
    ]);
    const csv = [h, ...rows]
      .map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    downloadBlob(new Blob([csv], { type: 'text/csv' }), `contactscout-officials-${todaySlug()}.csv`);
    addLog('✓ CSV exported.');
  }

  function importBackup(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const d = JSON.parse(reader.result as string) as Partial<CSPersistedState>;
        if (d.officials)    setOfficials(d.officials.map(normaliseOfficial));
        if (d.newOfficials) setNewOfficials(d.newOfficials.map(normaliseOfficial));
        if (d.scanStatus)   setScanStatus(d.scanStatus);
        if (d.scanMeta)     setScanMeta(d.scanMeta);
        addLog('✓ Backup loaded.');
      } catch (e) { addLog(`✗ Import failed: ${String(e)}`); }
    };
    reader.readAsText(file);
  }

  function clearAll() {
    if (!confirm('Clear all ContactScout data? This cannot be undone.')) return;
    setOfficials([]); setNewOfficials([]); setScanStatus({}); setScanMeta({});
    localStorage.removeItem('contactscout_state');
    addLog('✓ All data cleared.');
  }

  // ── Derived state ──────────────────────────────────────────────────────────

  const filtered = activeCat === 'All'
    ? officials
    : officials.filter(o => o.category === activeCat);

  const stats = {
    total:    officials.length,
    done:     officials.filter(o => o.status === 'done').length,
    changed:  officials.filter(o => o.status === 'changed').length,
    left:     officials.filter(o => o.status === 'left_office').length,
    ready:    officials.filter(o =>
      o.status !== 'left_office' &&
      (o.schedulerEmail || o.officeEmail || o.directEmail),
    ).length,
    withSched: officials.filter(o => !!o.schedulerEmail).length,
  };

  const pct     = progress.total ? Math.round(progress.done / progress.total * 100) : 0;
  const jxMissing = !jx.state.trim();

  const TABS = [
    `DISCOVER${newOfficials.length > 0 ? ` · ${newOfficials.length} NEW` : ''}`,
    `OFFICIALS${officials.length > 0 ? ` · ${officials.length}` : ''}`,
    'EXPORT',
  ] as const;

  const STAT_ROWS = [
    ['TOTAL',     stats.total,     '#8b949e'],
    ['VERIFIED',  stats.done,      '#3fb950'],
    ['CHANGED',   stats.changed,   '#58a6ff'],
    ['LEFT',      stats.left,      '#f85149'],
    ['READY',     stats.ready,     '#a371f7'],
    ['SCHEDULER', stats.withSched, '#C8A84B'],
  ] as const;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="if-root">
      <input
        ref={importFileRef} type="file" accept=".json" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) { importBackup(f); e.target.value = ''; } }}
      />

      {/* Header */}
      <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div>
          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>CONTACT SCOUT</span>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', marginTop: 1 }}>by Lenya Chan</div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button className="if-btn sm if-log-btn" onClick={() => setShowLog(v => !v)}>☰ Log</button>
          <button
            className="if-btn sm"
            onClick={() => setShowJxModal(true)}
            style={jxMissing ? { borderColor: 'var(--warning-border)', color: 'var(--warning)' } : {}}
            title={jxMissing ? 'Configure jurisdiction' : `Jurisdiction: ${jx.state}`}
          >
            ⊙ {jxMissing ? 'Jurisdiction' : jx.state}
          </button>
          <button
            className={`if-btn sm${apiKey ? ' grn' : ' del'}`}
            onClick={() => openKeyModal()}
          >
            ⚙ Key{apiKey ? ' ✓' : ''}{osApiKey ? ' + OS' : ''}
          </button>
          {running && (
            <button className="if-btn sm del" onClick={() => { abortRef.current = true; }}>■ Stop</button>
          )}
        </div>
      </div>

      {/* Onboarding banners */}
      {!apiKey && (
        <div className="if-banner info">
          <div className="if-banner-body">
            <div className="if-banner-title">Welcome to ContactScout</div>
            <div className="if-banner-text">
              Add your Google Gemini API key to start discovering officials and their schedulers.
              Get a free key at aistudio.google.com (no credit card required).
            </div>
            <button className="if-btn pri sm" onClick={() => openKeyModal()}>Add Gemini API Key</button>
          </div>
        </div>
      )}
      {apiKey && jxMissing && (
        <div className="if-banner warn">
          <div className="if-banner-body">
            <div className="if-banner-title">Jurisdiction not configured</div>
            <div className="if-banner-text">
              Configure your state, counties, and cities so scan prompts target the right officials.
            </div>
            <button
              className="if-btn sm"
              style={{ borderColor: 'var(--warning-border)', color: 'var(--warning)' }}
              onClick={() => setShowJxModal(true)}
            >
              Configure Jurisdiction
            </button>
          </div>
        </div>
      )}

      {/* Stats bar */}
      {officials.length > 0 && (
        <div className="if-stats">
          {STAT_ROWS.map(([label, n, col]) => (
            <div className="if-stat" key={label}>
              <span className="if-stat-dot" style={{ background: col }} />
              <span className="if-stat-label">{label}</span>
              <span className="if-stat-val" style={{ color: col }}>{n}</span>
            </div>
          ))}
          {running && (
            <div className="if-progress-wrap">
              <div className="if-progress-track">
                <div className="if-progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <span style={{ fontSize: 10, color: 'var(--blue)' }}>{progress.done}/{progress.total}</span>
            </div>
          )}
        </div>
      )}

      {/* Tab bar */}
      <div className="if-tab-bar">
        {TABS.map((label, i) => (
          <button
            key={i}
            className={`if-tab${tab === i ? ' active' : ''}`}
            onClick={() => setTab(i as 0 | 1 | 2)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Main content + log */}
      <div className="if-layout">
        <div className="if-main">
          {tab === 0 && (
            <DiscoverTab
              jx={jx}
              scanStatus={scanStatus}
              scanMeta={scanMeta}
              newOfficials={newOfficials}
              running={running}
              hasOsKey={!!osApiKey}
              runScan={runScan}
              addNew={addNew}
              dismissNew={dismissNew}
              onConfigureJx={() => setShowJxModal(true)}
            />
          )}
          {tab === 1 && (
            <OfficialsTab
              officials={filtered}
              allOfficials={officials}
              activeCat={activeCat}
              setActiveCat={setActiveCat}
              selected={selected}
              toggleSel={toggleSel}
              setSelected={setSelected}
              running={running}
              runVerify={runVerify}
              onAddManually={() => setShowAddModal(true)}
              onInferEmails={inferMissing}
              onGoDiscover={() => setTab(0)}
            />
          )}
          {tab === 2 && (
            <ExportTab
              officials={officials}
              exportForInviteFlow={exportForInviteFlow}
              exportBackup={exportBackup}
              exportCSV={exportCSV}
              importBackup={() => importFileRef.current?.click()}
              clearAll={clearAll}
            />
          )}
        </div>

        <LogSidebar log={log} show={showLog} onClose={() => setShowLog(false)} />
      </div>

      {/* Modals */}
      {showKeyModal && (
        <ApiKeyModal
          geminiKey={apiKey}
          osKey={osApiKey}
          onSave={handleKeySave}
          onClose={() => { setShowKeyModal(false); pendingRef.current = null; }}
        />
      )}
      {showJxModal && (
        <JurisdictionModal
          jx={jx}
          onSave={updated => setJx(updated)}
          onClose={() => setShowJxModal(false)}
        />
      )}
      {showAddModal && (
        <AddOfficialModal
          jx={jx}
          onAdd={addManual}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
