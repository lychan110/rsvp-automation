import { useState } from 'react';
import { CATS, STATUS_LABEL, STATUS_COLOR } from '../constants';
import type { CSOfficial, CSStatus } from '../types';

interface Props {
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
  onGoDiscover: () => void;
}

function tagStyle(status: CSStatus): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center',
    padding: '2px 7px', borderRadius: 4, border: `1px solid ${STATUS_COLOR[status]}`,
    color: STATUS_COLOR[status], fontSize: 9, letterSpacing: '0.07em',
    animation: status === 'checking' ? 'cs-pulse 1.4s ease-in-out infinite' : undefined,
  };
}

export default function OfficialsTab({
  officials, allOfficials, activeCat, setActiveCat,
  selected, toggleSel, setSelected, running, runVerify, addManually, onGoDiscover,
}: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const names = officials.map(o => o.name);

  function toggleExpand(name: string) {
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(name) ? n.delete(name) : n.add(name);
      return n;
    });
  }

  if (allOfficials.length === 0) {
    return (
      <div className="cs-empty">
        <div className="cs-empty-title">No officials in your list yet.</div>
        <div className="cs-empty-sub">Use Discover to scan for officials, then add them here.</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="cs-btn pri" onClick={onGoDiscover}>Go to Discover</button>
          <button className="cs-btn" onClick={addManually}>+ Add Manually</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Sticky action bar */}
      <div style={{
        padding: '8px 16px', borderBottom: '1px solid #161b22',
        display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap',
        position: 'sticky', top: 0, background: '#080c10', zIndex: 2,
      }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
          {CATS.map(c => (
            <button
              key={c}
              className={`cs-pill${activeCat === c ? ' active' : ''}`}
              onClick={() => setActiveCat(c)}
            >
              {c.toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button className="cs-btn sm" onClick={() => setSelected(new Set(names))} disabled={running}>Sel All</button>
          <button className="cs-btn sm" onClick={() => setSelected(new Set())} disabled={running}>Clear</button>
          <button className="cs-btn sm pri" onClick={() => runVerify([...selected])} disabled={running || selected.size === 0}>
            ▶ ({selected.size})
          </button>
          <button className="cs-btn sm pri" onClick={() => runVerify(names)} disabled={running}>▶ All</button>
        </div>
      </div>

      {officials.length === 0 && (
        <div style={{ padding: '24px 20px', textAlign: 'center', color: '#8b949e', fontSize: 11 }}>
          No officials in this category.
        </div>
      )}

      {officials.map(o => {
        const isOpen = expanded.has(o.name);
        const r = o.result;
        return (
          <div key={o.name}>
            <div className="cs-official-row" onClick={() => toggleExpand(o.name)}>
              <input
                type="checkbox"
                checked={selected.has(o.name)}
                onClick={e => { e.stopPropagation(); toggleSel(o.name); }}
                style={{ accentColor: '#1f6feb', marginTop: 2 }}
                readOnly
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#f0f6fc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {o.name}
                </div>
                <div style={{ fontSize: 9, color: '#8b949e' }}>
                  {o.title}{o.district ? ` · D${o.district}` : ''}{o.county ? ` · ${o.county}` : ''}
                </div>
                <div style={{ fontSize: 9, color: '#8b949e', fontStyle: 'italic' }}>
                  {o.directEmail || o.officeEmail || 'no email'}
                </div>
              </div>
              <div className="cs-official-cat">
                <span style={{ fontSize: 9, color: '#8b949e' }}>{o.category}</span>
              </div>
              <div><span style={tagStyle(o.status)}>{STATUS_LABEL[o.status]}</span></div>
              <div style={{ fontSize: 10, color: '#30363d' }}>{isOpen ? '▲' : '▼'}</div>
            </div>

            {isOpen && r && (
              <div className="cs-official-expand">
                {r.error
                  ? <span style={{ color: '#e3b341' }}>Error: {r.error as string}</span>
                  : <>
                    {r.stillInOffice !== undefined && (
                      <div>
                        <span style={{ color: '#8b949e' }}>IN OFFICE </span>
                        {r.stillInOffice
                          ? <span style={{ color: '#3fb950' }}>Yes</span>
                          : <span style={{ color: '#f85149' }}>No{r.replacedBy ? ` → ${r.replacedBy}` : ''}</span>}
                      </div>
                    )}
                    {r.currentTitle && <div><span style={{ color: '#8b949e' }}>TITLE </span>{r.currentTitle as string}</div>}
                    {r.directEmail  && <div><span style={{ color: '#8b949e' }}>DIRECT </span>{r.directEmail as string}</div>}
                    {r.officeEmail  && <div><span style={{ color: '#8b949e' }}>OFFICE </span>{r.officeEmail as string}</div>}
                    {r.changes && r.changes !== 'No changes detected' && (
                      <div><span style={{ color: '#8b949e' }}>CHANGES </span><span style={{ color: '#58a6ff' }}>{r.changes as string}</span></div>
                    )}
                    {r.flags && (
                      <div><span style={{ color: '#8b949e' }}>FLAGS </span><span style={{ color: '#e3b341' }}>{r.flags as string}</span></div>
                    )}
                    {r.confidence && (
                      <div>
                        <span style={{ color: '#8b949e' }}>CONF </span>
                        <span style={{ color: r.confidence === 'high' ? '#3fb950' : r.confidence === 'medium' ? '#e3b341' : '#f85149' }}>
                          {(r.confidence as string).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </>
                }
              </div>
            )}
          </div>
        );
      })}

      <div style={{ padding: '10px 18px', borderTop: '1px solid #161b22' }}>
        <button className="cs-btn sm" onClick={addManually}>+ Add Manually</button>
      </div>
    </div>
  );
}
