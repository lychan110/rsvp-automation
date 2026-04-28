import { SCAN_TARGETS } from '../constants';
import type { CSOfficial, CSScanMeta, CSJurisdiction, ScanState } from '../types';

interface Props {
  jx: CSJurisdiction;
  scanStatus: Record<string, ScanState>;
  scanMeta: Record<string, CSScanMeta>;
  newOfficials: CSOfficial[];
  running: boolean;
  runScan: (id: string) => void;
  addNew: (o: CSOfficial) => void;
  dismissNew: (name: string) => void;
  onConfigureJx: () => void;
}

export default function DiscoverTab({
  jx, scanStatus, scanMeta, newOfficials,
  running, runScan, addNew, dismissNew, onConfigureJx,
}: Props) {
  const jxMissing = !jx.state.trim();
  const anyDone = Object.values(scanStatus).some(s => s === 'done');

  return (
    <div style={{ padding: '16px 20px' }}>
      {jxMissing && (
        <div style={{ background: '#1a0e00', border: '1px solid #bb8009', borderRadius: 7, padding: '12px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#e3b341', fontWeight: 600, marginBottom: 4 }}>Scan targets need jurisdiction</div>
          <div style={{ fontSize: 10, color: '#8b949e', lineHeight: 1.7, marginBottom: 8 }}>
            Configure your state, counties, and cities so scans target the right officials.
          </div>
          <button className="if-btn sm" style={{ borderColor: '#bb8009', color: '#e3b341' }} onClick={onConfigureJx}>
            Configure Jurisdiction
          </button>
        </div>
      )}

      {!jxMissing && newOfficials.length === 0 && !anyDone && (
        <div style={{ fontSize: 10, color: '#8b949e', lineHeight: 1.7, marginBottom: 16 }}>
          Scan each category to discover current officials. New officials not already in your list will surface as add candidates.
          Run after each election cycle, then head to <strong style={{ color: '#f0f6fc' }}>Officials</strong> to verify,
          and <strong style={{ color: '#f0f6fc' }}>Export</strong> when ready.
        </div>
      )}

      {SCAN_TARGETS.map(t => {
        const st = scanStatus[t.id];
        const meta = scanMeta[t.id];
        const fresh = newOfficials.filter(o => o._scanId === t.id);

        return (
          <div key={t.id} style={{ marginBottom: 10 }}>
            <div className="if-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: '#f0f6fc', fontWeight: 500, marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: 10, color: '#8b949e' }}>{t.desc}</div>
                  {meta && (
                    <div style={{ fontSize: 10, color: '#8b949e', marginTop: 4 }}>
                      Found {meta.total} ·{' '}
                      <span style={{ color: meta.confidence === 'high' ? '#3fb950' : meta.confidence === 'medium' ? '#e3b341' : '#f85149' }}>
                        {meta.confidence}
                      </span>
                      {meta.notes && <span style={{ color: '#e3b341' }}> · {meta.notes}</span>}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  {st === 'scanning' && (
                    <span className="if-tag" style={{ borderColor: '#f59e0b', color: '#f59e0b', animation: 'cs-pulse 1.4s ease-in-out infinite' }}>
                      SCANNING
                    </span>
                  )}
                  {st === 'done'  && <span className="if-tag" style={{ borderColor: '#238636', color: '#3fb950' }}>DONE</span>}
                  {st === 'error' && <span className="if-tag" style={{ borderColor: '#da3633', color: '#f85149' }}>ERROR</span>}
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

            {fresh.length > 0 && (
              <div style={{ margin: '3px 0 0 12px', paddingLeft: 12, borderLeft: '2px solid #1f6feb' }}>
                <div style={{ fontSize: 9, color: '#58a6ff', letterSpacing: '0.1em', margin: '6px 0 5px' }}>
                  NEW CANDIDATES ({fresh.length})
                </div>
                {fresh.map(o => (
                  <div className="if-new-card" key={o.name} style={{ marginBottom: 4 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: '#f0f6fc', fontWeight: 500 }}>{o.name}</div>
                      <div style={{ fontSize: 9, color: '#8b949e' }}>
                        {o.title}{o.district ? ` · D${o.district}` : ''}
                      </div>
                      {(o.directEmail || o.officeEmail) && (
                        <div style={{ fontSize: 9, color: '#8b949e' }}>{o.directEmail || o.officeEmail}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                      <button className="if-btn sm grn" onClick={() => addNew(o)}>+ Add</button>
                      <button className="if-btn sm" onClick={() => dismissNew(o.name)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {st === 'done' && fresh.length === 0 && meta && (
              <div style={{ margin: '3px 0 0 12px', padding: '4px 0 4px 12px', borderLeft: '2px solid #238636', fontSize: 10, color: '#3fb950' }}>
                ✓ All {meta.total} already in list.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
