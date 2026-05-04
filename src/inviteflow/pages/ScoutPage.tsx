// ── ContactScout engine (direct imports — same logic as ContactScout standalone app) ───
import { callLiteLLM } from '../../contactscout/src/api';
import { searchWeb, buildSearchQuery } from '../../contactscout/src/search';
import { fetchStateLegislators } from '../../contactscout/src/openStates';
import {
  SCAN_TARGETS,
  SCAN_SYS,
  MODEL_SCAN,
  CS_APIKEY_SK,
  CS_ENDPOINT_SK,
  CS_SEARCH_KEY,
  CS_JX_KEY,
  CS_OS_KEY,
  DEFAULT_ENDPOINT,
} from '../../contactscout/src/constants';
import { officialToInvitee, buildScanPrompts } from '../../contactscout/src/utils';
import { bestEmail } from '../../contactscout/src/emailPatterns';
import type { CSOfficial, CSJurisdiction } from '../../contactscout/src/types';

import { useEffect, useState } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { useRouter } from '../state/RouterContext';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import type { Invitee } from '../types';

// ── Types ───────────────────────────────────────────────────────────────────────

type ScanState = 'idle' | 'scanning' | 'done' | 'error';

interface DiscoveredOfficial {
  id: string;
  official: CSOfficial;
  confidence: 'high' | 'med' | 'low';
  added: boolean; // already in invitees list
}

// ── Component ───────────────────────────────────────────────────────────────────

export default function ScoutPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { goBack } = useRouter();

  const apiKey    = sessionStorage.getItem(CS_APIKEY_SK) ?? ''; // CS_APIKEY_SK='***'
  const endpoint   = sessionStorage.getItem(CS_ENDPOINT_SK) ?? DEFAULT_ENDPOINT;
  const searchKey  = sessionStorage.getItem(CS_SEARCH_KEY) ?? '';
  const osKey      = sessionStorage.getItem(CS_OS_KEY) ?? '';
  const hasLiteLLM = !!apiKey;
  const hasOS      = !!osKey;
  const hasKeys    = hasLiteLLM || hasOS;

  const [scanState,  setScanState]  = useState<ScanState>('idle');
  const [results,    setResults]    = useState<DiscoveredOfficial[]>([]);
  const [selected,   setSelected]   = useState<Set<string>>(new Set());
  const [error,      setError]      = useState('');
  const [scanTarget, setScanTarget] = useState<string>('openstates');

  // Load saved results from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('scout_results');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as DiscoveredOfficial[];
        setResults(parsed);
        if (parsed.length > 0) setScanState('done');
      } catch { /* ignore */ }
    }
  }, []);

  function scoreConfidence(o: CSOfficial): 'high' | 'med' | 'low' {
    const email = bestEmail(o);
    if (email && (email.includes('.gov') || email.includes('.senate') || email.includes('.house'))) return 'high';
    if (email) return 'med';
    return 'low';
  }

  async function runScan() {
    setError('');
    setScanState('scanning');
    setResults([]);
    setSelected(new Set());

    try {
      let officials: CSOfficial[] = [];

      if (scanTarget === 'openstates') {
        // Open States — no jurisdiction needed, fetches all legislators
        const jx = JSON.parse(sessionStorage.getItem(CS_JX_KEY) ?? '{}') as Partial<CSJurisdiction>;
        const state = (jx.state ?? 'California').toLowerCase();
        const { officials: leg } = await fetchStateLegislators(osKey, state, 'upper');
        const { officials: house } = await fetchStateLegislators(osKey, state, 'lower');
        officials = [...leg, ...house];
      } else {
        // LiteLLM web search (with SerpAPI pre-fetch)
        const jx = JSON.parse(sessionStorage.getItem(CS_JX_KEY) ?? '{}') as CSJurisdiction;
        const target = SCAN_TARGETS.find(t => t.id === scanTarget);
        if (!target) throw new Error(`Unknown scan target: ${scanTarget}`);

        const prompts = buildScanPrompts(jx);
        const targetPrompt = prompts[scanTarget] ?? target.desc;

        let finalPrompt = targetPrompt;
        if (searchKey) {
          try {
            const searchQ = buildSearchQuery(scanTarget, jx.state);
            const results = await searchWeb(searchQ, searchKey);
            finalPrompt = `${results}\n\n${targetPrompt}`;
          } catch (e) {
            console.warn('Search failed, proceeding without results:', e);
          }
        }

        const raw = await callLiteLLM(apiKey, endpoint, MODEL_SCAN, SCAN_SYS, finalPrompt);
        officials = (raw.officials as CSOfficial[]) ?? [];
      }

      const scored: DiscoveredOfficial[] = officials.map(o => ({
        id: crypto.randomUUID(),
        official: o,
        confidence: scoreConfidence(o),
        added: state.invitees.some(
          i => i.email?.toLowerCase() === bestEmail(o).toLowerCase()
        ),
      }));

      setResults(scored);
      setScanState('done');
      sessionStorage.setItem('scout_results', JSON.stringify(scored));
    } catch (e) {
      setError(String(e));
      setScanState('error');
    }
  }

  function toggle(id: string) {
    setSelected(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function addToInvitees() {
    const toAdd = results.filter(r => selected.has(r.id) && !r.added);
    const invitees: Invitee[] = toAdd.map(r => ({
      ...officialToInvitee(r.official),
      id: crypto.randomUUID(),
    }));
    invitees.forEach(i => dispatch({ type: 'ADD_INVITEE', invitee: i }));
    setResults(prev => prev.map(r =>
      selected.has(r.id) ? { ...r, added: true } : r
    ));
    setSelected(new Set());
  }

  const badgeStyle = (c: 'high' | 'med' | 'low') => ({
    padding: '2px 6px',
    borderRadius: 4,
    fontFamily: 'var(--rf-mono)',
    fontSize: 9,
    letterSpacing: '0.08em',
    background:   c === 'high' ? 'rgba(52,211,153,0.15)' : c === 'med' ? 'rgba(251,191,36,0.15)' : 'rgba(148,163,184,0.15)',
    color:        c === 'high' ? '#34d399'        : c === 'med' ? '#fbbf24'        : '#94a3b8',
    border: `1px solid ${c === 'high' ? 'rgba(52,211,153,0.3)' : c === 'med' ? 'rgba(251,191,36,0.3)' : 'rgba(148,163,184,0.3)'}`,
  });

  const headerRight = (
    <button className="if-header-btn" onClick={goBack} aria-label="Back">
      <Icon name="chevron-left" size={13} />
    </button>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-root)' }}>
      <PageHeader eyebrow="OFFICIAL DISCOVERY" title="ContactScout" right={headerRight} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 32px' }}>

        {/* Setup banner */}
        {!hasKeys && (
          <div style={{
            marginTop: 8, padding: '14px 16px', borderRadius: 8,
            background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.25)',
            marginBottom: 12,
          }}>
            <div style={{ fontFamily: 'var(--rf-serif)', fontSize: 13, color: 'var(--text-heading)', marginBottom: 6 }}>
              API keys required
            </div>
            <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 10 }}>
              Open ContactScout to configure your LiteLLM and (optionally) SerpAPI keys. They are stored in sessionStorage and carry over automatically.
            </div>
            <a
              href="/contactscout/"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontFamily: 'var(--rf-mono)', fontSize: 11,
                color: 'var(--accent)', textDecoration: 'none',
              }}
            >
              <Icon name="chevron-right" size={11} /> Open ContactScout
            </a>
          </div>
        )}

        {/* Scan controls */}
        {hasKeys && scanState === 'idle' && (
          <div className="if-card" style={{ padding: '16px', marginBottom: 12 }}>
            <div className="if-section-label" style={{ marginBottom: 10 }}>SCAN TARGET</div>
            <select
              value={scanTarget}
              onChange={e => setScanTarget(e.target.value)}
              style={{
                width: '100%', padding: '8px 10px', marginBottom: 12,
                background: 'var(--bg-raised)', border: '1px solid var(--border)',
                color: 'var(--text-base)', fontFamily: 'var(--rf-mono)', fontSize: 12,
                borderRadius: 6, cursor: 'pointer',
              }}
            >
              <optgroup label="Fast — no web search">
                <option value="openstates">State Legislators (Open States — all chambers)</option>
              </optgroup>
              <optgroup label="LiteLLM + SerpAPI web search">
                {SCAN_TARGETS.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </optgroup>
            </select>
            <button className="if-btn pri" style={{ width: '100%' }} onClick={runScan}>
              <Icon name="search" size={13} style={{ marginRight: 6 }} />
              Start Scan
            </button>
          </div>
        )}

        {/* Scanning state */}
        {scanState === 'scanning' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Scanning...
            </div>
            <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--rf-mono)', fontSize: 11 }}>
              LiteLLM scans with web search may take 30–60 seconds
            </div>
          </div>
        )}

        {/* Error */}
        {scanState === 'error' && (
          <div className="if-status err" style={{ marginBottom: 12 }}>{error}</div>
        )}

        {/* Results */}
        {scanState === 'done' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div className="if-section-label" style={{ padding: 0 }}>
                {results.length} OFFICIALS FOUND
              </div>
              {selected.size > 0 && (
                <button className="if-btn pri sm" onClick={addToInvitees}>
                  Add {selected.size} to Invitees
                </button>
              )}
            </div>

            <div className="if-card">
              {results.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--rf-mono)', fontSize: 11 }}>
                  No officials found. Try a different scan target.
                </div>
              )}
              {results.map((r, i) => {
                const isLast = i === results.length - 1;
                const email = bestEmail(r.official);
                return (
                  <div
                    key={r.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: 'var(--rt-row-pad)',
                      borderBottom: isLast ? 'none' : '1px solid var(--border)',
                      opacity: r.added ? 0.5 : 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => !r.added && toggle(r.id)}
                      disabled={r.added}
                      style={{ width: 14, height: 14, cursor: r.added ? 'not-allowed' : 'pointer', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 12, color: 'var(--text-heading)' }}>
                        {r.official.name}
                        {r.official.title ? `, ${r.official.title}` : ''}
                      </div>
                      <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                        {r.official.district ? `${r.official.district}` : ''}
                        {r.official.county ? ` · ${r.official.county}` : ''}
                        {email ? ` · ${email}` : ' · no email found'}
                      </div>
                    </div>
                    <span style={badgeStyle(r.confidence)}>
                      {r.confidence.toUpperCase()}
                    </span>
                    {r.added && (
                      <span style={{ fontFamily: 'var(--rf-mono)', fontSize: 9, color: 'var(--success)', letterSpacing: '0.08em' }}>
                        ADDED
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              className="if-btn ghost"
              style={{ width: '100%', marginTop: 8 }}
              onClick={() => { setScanState('idle'); setResults([]); sessionStorage.removeItem('scout_results'); }}
            >
              Clear results
            </button>
          </>
        )}
      </div>
    </div>
  );
}
