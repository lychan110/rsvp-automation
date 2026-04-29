import { SCAN_TARGETS } from '../constants';
import { bestEmail } from '../emailPatterns';
import type { CSOfficial, CSScanMeta, CSJurisdiction, ScanState } from '../types';

interface Props {
  jx: CSJurisdiction;
  scanStatus: Record<string, ScanState>;
  scanMeta: Record<string, CSScanMeta>;
  newOfficials: CSOfficial[];
  running: boolean;
  hasOsKey: boolean;
  runScan: (id: string) => void;
  addNew: (o: CSOfficial) => void;
  dismissNew: (name: string) => void;
  onConfigureJx: () => void;
}

export default function DiscoverTab({
  jx, scanStatus, scanMeta, newOfficials,
  running, hasOsKey, runScan, addNew, dismissNew, onConfigureJx,
}: Props) {
  const jxMissing = !jx.state.trim();
  const anyDone   = Object.values(scanStatus).some(s => s === 'done');

  return (
    <div style={{ padding: '16px 20px' }}>
      {/* Jurisdiction missing */}
      {jxMissing && (
        <div style={{ background: 'var(--bg-warn-tint)', border: '1px solid var(--warning-border)', borderRadius: 7, padding: '12px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--warning)', fontWeight: 600, marginBottom: 4 }}>Scan targets need jurisdiction</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
            Configure your state, counties, and cities so scans target the right officials.
          </div>
          <button className="if-btn sm" style={{ borderColor: 'var(--warning-border)', color: 'var(--warning)' }} onClick={onConfigureJx}>
            Configure Jurisdiction
          </button>
        </div>
      )}

      {/* Intro text */}
      {!jxMissing && newOfficials.length === 0 && !anyDone && (
        <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16, maxWidth: 600 }}>
          Scan each category to find current officials and their schedulers.
          New contacts surface below each scan card as candidates.
          Accept them to move to <strong style={{ color: 'var(--text-heading)' }}>Officials</strong>,
          then verify and <strong style={{ color: 'var(--text-heading)' }}>Export</strong> when ready.
          Emails are inferred automatically for federal and NC state officials who have no scanned address.
        </div>
      )}

      {SCAN_TARGETS.map(t => {
        const st    = scanStatus[t.id];
        const meta  = scanMeta[t.id];
        const fresh = newOfficials.filter(o => o._scanId === t.id);
        const withSched = fresh.filter(o => !!o.schedulerEmail).length;
        const isStateLeg = t.id === 'state-senate' || t.id === 'state-house';

        return (
          <div key={t.id} style={{ marginBottom: 10 }}>
            {/* Scan card */}
            <div className="if-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-heading)', fontWeight: 500 }}>{t.label}</div>
                    {isStateLeg && hasOsKey && (
                      <span style={{ fontSize: 8, border: '1px solid var(--success-bg)', color: 'var(--success)', borderRadius: 3, padding: '0 4px', letterSpacing: '0.05em' }}>
                        OPEN STATES
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{t.desc}</div>
                  {meta && (
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 4 }}>
                      Found {meta.total} ·{' '}
                      <span style={{ color: meta.confidence === 'high' ? 'var(--success)' : meta.confidence === 'medium' ? 'var(--warning)' : 'var(--danger)' }}>
                        {meta.confidence}
                      </span>
                      {meta.notes && <span style={{ color: 'var(--warning)' }}> · {meta.notes}</span>}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  {st === 'scanning' && (
                    <span className="if-tag" style={{ borderColor: 'var(--amber)', color: 'var(--amber)', animation: 'if-pulse 1.4s ease-in-out infinite' }}>
                      SCANNING
                    </span>
                  )}
                  {st === 'done'  && <span className="if-tag" style={{ borderColor: 'var(--success-bg)', color: 'var(--success)' }}>DONE</span>}
                  {st === 'error' && <span className="if-tag" style={{ borderColor: 'var(--danger-dark)', color: 'var(--danger)' }}>ERROR</span>}
                  <button
                    className="if-btn sm pri"
                    onClick={() => runScan(t.id)}
                    disabled={running || jxMissing}
                  >
                    {st === 'done' ? '↻ Re-scan' : '▶ Scan'}
                  </button>
                </div>
              </div>
            </div>

            {/* New candidates */}
            {fresh.length > 0 && (
              <div style={{ margin: '3px 0 0 12px', paddingLeft: 12, borderLeft: '2px solid var(--accent)' }}>
                <div style={{ fontSize: 9, color: 'var(--accent-highlight)', letterSpacing: '0.1em', margin: '6px 0 5px', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span>NEW CANDIDATES ({fresh.length})</span>
                  {withSched > 0 && (
                    <span style={{ color: '#C8A84B' }}>★ {withSched} with scheduler</span>
                  )}
                </div>
                {fresh.map(o => {
                  const email = bestEmail(o);
                  const isInferred = !o.schedulerEmail && o.emailSource === 'inferred' && !!o.directEmail;

                  return (
                    <div className="if-new-card" key={o.name} style={{ marginBottom: 4 }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-heading)', fontWeight: 500 }}>{o.name}</div>
                        <div style={{ fontSize: 9, color: 'var(--text-secondary)' }}>
                          {o.title}{o.district ? ` · D${o.district}` : ''}
                        </div>
                        {/* Scheduler info — highest priority contact */}
                        {o.schedulerEmail ? (
                          <div style={{ fontSize: 9, color: '#C8A84B', marginTop: 2 }}>
                            ★ {o.schedulerName || 'Scheduler'}: {o.schedulerEmail}
                          </div>
                        ) : email ? (
                          <div style={{ fontSize: 9, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span>{email}</span>
                            {isInferred && (
                              <span style={{ border: '1px solid var(--blue)', color: 'var(--blue)', borderRadius: 3, padding: '0 3px', fontSize: 8 }}>
                                INFERRED
                              </span>
                            )}
                          </div>
                        ) : o.appearanceFormUrl ? (
                          <div style={{ fontSize: 9, color: '#a371f7' }}>⧉ form available</div>
                        ) : (
                          <div style={{ fontSize: 9, color: 'var(--danger)', fontStyle: 'italic' }}>no email found</div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                        <button className="if-btn sm grn" onClick={() => addNew(o)}>+ Add</button>
                        <button className="if-btn sm" onClick={() => dismissNew(o.name)}>✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {st === 'done' && fresh.length === 0 && meta && (
              <div style={{ margin: '3px 0 0 12px', padding: '4px 0 4px 12px', borderLeft: '2px solid var(--success-bg)', fontSize: 10, color: 'var(--success)' }}>
                ✓ All {meta.total} already in list.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
