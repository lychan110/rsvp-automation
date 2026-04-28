import { useState } from 'react';
import { CATS, STATUS_LABEL, STATUS_COLOR } from '../constants';
import { bestEmail } from '../emailPatterns';
import type { CSOfficial, CSStatus, EmailSource } from '../types';

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
  onAddManually: () => void;
  onInferEmails: () => void;
  onGoDiscover: () => void;
}

function tagStyle(status: CSStatus): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center',
    padding: '2px 7px', borderRadius: 4, border: `1px solid ${STATUS_COLOR[status]}`,
    color: STATUS_COLOR[status], fontSize: 9, letterSpacing: '0.07em',
    animation: status === 'checking' ? 'if-pulse 1.4s ease-in-out infinite' : undefined,
  };
}

const SOURCE_COLOR: Record<EmailSource, string> = {
  scanned:  '#3fb950',
  inferred: '#58a6ff',
  manual:   '#8b949e',
};

function EmailSourceBadge({ source }: { source: EmailSource }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '1px 5px', borderRadius: 3,
      border: `1px solid ${SOURCE_COLOR[source]}`,
      color: SOURCE_COLOR[source],
      fontSize: 8, letterSpacing: '0.07em',
    }}>
      {source.toUpperCase()}
    </span>
  );
}

/** Shows which contact path will be used when exporting to InviteFlow. */
function ContactMethodBadge({ o }: { o: CSOfficial }) {
  if (o.appearanceFormUrl && !o.schedulerEmail && !o.directEmail && !o.officeEmail) {
    return (
      <span style={{ fontSize: 9, color: '#a371f7' }} title={o.appearanceFormUrl}>
        ⧉ FORM
      </span>
    );
  }
  if (o.schedulerEmail) {
    return (
      <span style={{ fontSize: 9, color: '#C8A84B' }} title={`Scheduler: ${o.schedulerName || o.schedulerEmail}`}>
        ★ SCHED
      </span>
    );
  }
  if (o.directEmail) {
    const label = o.emailSource === 'inferred' ? '~ INFERRED' : '✉ DIRECT';
    const color = o.emailSource === 'inferred' ? '#58a6ff' : '#3fb950';
    return <span style={{ fontSize: 9, color }} title={o.directEmail}>{label}</span>;
  }
  if (o.officeEmail) {
    return <span style={{ fontSize: 9, color: '#8b949e' }} title={o.officeEmail}>✉ OFFICE</span>;
  }
  return <span style={{ fontSize: 9, color: '#f85149' }}>✗ NO EMAIL</span>;
}

export default function OfficialsTab({
  officials, allOfficials, activeCat, setActiveCat,
  selected, toggleSel, setSelected, running, runVerify,
  onAddManually, onInferEmails, onGoDiscover,
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
      <div className="if-empty">
        <div className="if-empty-title">No officials in your list yet.</div>
        <div className="if-empty-sub">Scan for officials in the Discover tab, or add one manually.</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="if-btn pri" onClick={onGoDiscover}>Go to Discover</button>
          <button className="if-btn" onClick={onAddManually}>+ Add Manually</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Sticky action bar */}
      <div style={{
        padding: '8px 16px', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap',
        position: 'sticky', top: 0, background: 'var(--bg-root)', zIndex: 2,
      }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
          {CATS.map(c => (
            <button
              key={c}
              className={`if-pill${activeCat === c ? ' active' : ''}`}
              onClick={() => setActiveCat(c)}
            >
              {c.toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, flexWrap: 'wrap' }}>
          <button className="if-btn sm" onClick={onInferEmails} disabled={running} title="Fill missing emails using federal/state name patterns">
            ⟳ Infer Emails
          </button>
          <button className="if-btn sm" onClick={() => setSelected(new Set(names))} disabled={running}>Sel All</button>
          <button className="if-btn sm" onClick={() => setSelected(new Set())} disabled={running}>Clear</button>
          <button
            className="if-btn sm pri"
            onClick={() => runVerify([...selected])}
            disabled={running || selected.size === 0}
            title={`Verify ${selected.size} selected officials`}
          >
            ▶ Verify ({selected.size})
          </button>
          <button className="if-btn sm pri" onClick={() => runVerify(names)} disabled={running}>▶ All</button>
        </div>
      </div>

      {officials.length === 0 && (
        <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 11 }}>
          No officials in this category.
        </div>
      )}

      {officials.map(o => {
        const isOpen = expanded.has(o.name);
        const r = o.result;
        const email = bestEmail(o);

        return (
          <div key={o.name}>
            {/* Row */}
            <div
              className="if-official-row"
              style={{ gridTemplateColumns: '20px 1fr 100px 86px 90px 14px' }}
              onClick={() => toggleExpand(o.name)}
            >
              <input
                type="checkbox"
                checked={selected.has(o.name)}
                onClick={e => { e.stopPropagation(); toggleSel(o.name); }}
                style={{ accentColor: 'var(--accent)', marginTop: 2 }}
                readOnly
              />
              {/* Name + subtitle */}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {o.name}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-secondary)' }}>
                  {o.title}{o.district ? ` · D${o.district}` : ''}{o.county ? ` · ${o.county}` : ''}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontStyle: email ? 'normal' : 'italic', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                  {email
                    ? <><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{email}</span>
                      <EmailSourceBadge source={o.schedulerEmail ? 'scanned' : o.emailSource} />
                    </>
                    : 'no email found'}
                </div>
              </div>
              {/* Contact method */}
              <div style={{ paddingTop: 1 }}>
                <ContactMethodBadge o={o} />
              </div>
              {/* Category */}
              <div className="if-official-cat">
                <span style={{ fontSize: 9, color: 'var(--text-secondary)' }}>{o.category}</span>
              </div>
              {/* Status */}
              <div><span style={tagStyle(o.status)}>{STATUS_LABEL[o.status]}</span></div>
              {/* Chevron */}
              <div style={{ fontSize: 10, color: 'var(--border-input)' }}>{isOpen ? '▲' : '▼'}</div>
            </div>

            {/* Expanded detail */}
            {isOpen && (
              <div className="if-official-expand">
                {r?.error
                  ? <span style={{ color: 'var(--warning)' }}>Error: {r.error as string}</span>
                  : <>
                    {/* In-office status */}
                    {r?.stillInOffice !== undefined && (
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>IN OFFICE </span>
                        {r.stillInOffice
                          ? <span style={{ color: 'var(--success)' }}>Yes</span>
                          : <span style={{ color: 'var(--danger)' }}>No{r.replacedBy ? ` → ${r.replacedBy as string}` : ''}</span>}
                      </div>
                    )}
                    {r?.currentTitle && (
                      <div><span style={{ color: 'var(--text-secondary)' }}>TITLE </span>{r.currentTitle as string}</div>
                    )}

                    {/* Email section */}
                    <div style={{ marginTop: 6, marginBottom: 2, fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>CONTACT</div>
                    {o.schedulerName && (
                      <div>
                        <span style={{ color: '#C8A84B' }}>SCHEDULER </span>
                        <span style={{ color: 'var(--text-base)' }}>{o.schedulerName}</span>
                        {o.schedulerEmail && (
                          <> · <a href={`mailto:${o.schedulerEmail}`} style={{ color: '#C8A84B' }} onClick={e => e.stopPropagation()}>{o.schedulerEmail}</a></>
                        )}
                      </div>
                    )}
                    {o.directEmail && (
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>DIRECT </span>
                        <a href={`mailto:${o.directEmail}`} style={{ color: 'var(--accent-highlight)' }} onClick={e => e.stopPropagation()}>{o.directEmail}</a>
                        {' '}<EmailSourceBadge source={o.emailSource} />
                      </div>
                    )}
                    {o.officeEmail && (
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>OFFICE </span>
                        <a href={`mailto:${o.officeEmail}`} style={{ color: 'var(--accent-highlight)' }} onClick={e => e.stopPropagation()}>{o.officeEmail}</a>
                      </div>
                    )}
                    {o.officePhone && (
                      <div><span style={{ color: 'var(--text-secondary)' }}>PHONE </span>{o.officePhone}</div>
                    )}
                    {o.appearanceFormUrl && (
                      <div>
                        <span style={{ color: '#a371f7' }}>APPEARANCE FORM </span>
                        <a href={o.appearanceFormUrl} target="_blank" rel="noreferrer"
                          style={{ color: '#a371f7' }} onClick={e => e.stopPropagation()}>
                          {o.appearanceFormUrl.length > 60 ? o.appearanceFormUrl.slice(0, 60) + '…' : o.appearanceFormUrl}
                        </a>
                      </div>
                    )}

                    {/* Verify result */}
                    {r && !r.error && (
                      <>
                        {r.changes && r.changes !== 'No changes detected' && (
                          <div style={{ marginTop: 4 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>CHANGES </span>
                            <span style={{ color: 'var(--blue)' }}>{r.changes as string}</span>
                          </div>
                        )}
                        {r.flags && (
                          <div><span style={{ color: 'var(--text-secondary)' }}>FLAGS </span><span style={{ color: 'var(--warning)' }}>{r.flags as string}</span></div>
                        )}
                        {r.confidence && (
                          <div>
                            <span style={{ color: 'var(--text-secondary)' }}>CONF </span>
                            <span style={{ color: r.confidence === 'high' ? 'var(--success)' : r.confidence === 'medium' ? 'var(--warning)' : 'var(--danger)' }}>
                              {(r.confidence as string).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </>
                }
              </div>
            )}
          </div>
        );
      })}

      <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border-subtle)' }}>
        <button className="if-btn sm" onClick={onAddManually}>+ Add Manually</button>
      </div>
    </div>
  );
}
