import { useState } from 'react';
import { useAppState } from '../state/AppContext';

type Filter = 'all' | 'attending' | 'pending' | 'declined';

interface CategoryRow {
  category: string;
  total: number;
  sent: number;
  attending: number;
  declined: number;
  noResponse: number;
}

export default function TrackerTab() {
  const state = useAppState();
  const [filter, setFilter] = useState<Filter>('all');

  const inv = state.invitees;
  const total      = inv.length;
  const sent       = inv.filter(i => i.inviteStatus === 'sent').length;
  const pending    = inv.filter(i => i.inviteStatus === 'pending').length;
  const failed     = inv.filter(i => i.inviteStatus === 'failed').length;
  const attending  = inv.filter(i => i.rsvpStatus === 'Attending').length;
  const declined   = inv.filter(i => i.rsvpStatus === 'Declined').length;
  const noResponse = inv.filter(i => i.rsvpStatus === 'No Response').length;

  const filtered = filter === 'all' ? inv
    : filter === 'attending' ? inv.filter(i => i.rsvpStatus === 'Attending')
    : filter === 'pending'   ? inv.filter(i => i.rsvpStatus === 'No Response')
    : inv.filter(i => i.rsvpStatus === 'Declined');

  const cats = Array.from(new Set(inv.map(i => i.category).filter(Boolean))).sort();
  const byCategory: CategoryRow[] = cats.map(cat => {
    const rows = inv.filter(i => i.category === cat);
    return {
      category:   cat,
      total:      rows.length,
      sent:       rows.filter(i => i.inviteStatus === 'sent').length,
      attending:  rows.filter(i => i.rsvpStatus === 'Attending').length,
      declined:   rows.filter(i => i.rsvpStatus === 'Declined').length,
      noResponse: rows.filter(i => i.rsvpStatus === 'No Response').length,
    };
  });

  if (total === 0) {
    return (
      <div className="if-empty">
        No invitees yet.
        <div className="if-empty-sub">ADD THEM IN THE INVITEES TAB</div>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-[900px] mx-auto w-full">
      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="mb-5">
        <div className="if-eyebrow mb-1.5">TRACKER</div>
        <div className="if-page-title">RSVP roster</div>
      </div>

      {/* ── Send status stat strip ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-5">
        {([
          { label: 'TOTAL',       value: total,      color: 'var(--text-secondary)' },
          { label: 'PENDING',     value: pending,    color: 'var(--text-muted)' },
          { label: 'SENT',        value: sent,       color: 'var(--success)' },
          { label: 'FAILED',      value: failed,     color: 'var(--danger)' },
          { label: 'ATTENDING',   value: attending,  color: 'var(--accent)' },
          { label: 'DECLINED',    value: declined,   color: 'var(--danger)' },
          { label: 'NO RESPONSE', value: noResponse, color: 'var(--text-muted)' },
        ] as Array<{ label: string; value: number; color: string }>).map(s => (
          <div
            key={s.label}
            className="if-stat"
            style={{ borderLeftColor: s.color }}
          >
            <div className="if-stat-label">{s.label}</div>
            <div className="if-stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── RSVP overview card ─────────────────────────────────────────── */}
      {total > 0 && (
        <div className="if-card padded mb-4">
          {/* Big number */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
            <span style={{ fontFamily: 'var(--rf-serif)', fontSize: 40, fontWeight: 500, color: 'var(--accent)', lineHeight: 1, letterSpacing: '-0.02em' }}>
              {attending}
            </span>
            <span style={{ fontFamily: 'var(--rf-mono)', fontSize: 12, color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
              of {total} confirmed
            </span>
          </div>

          {/* Stacked bar */}
          <div className="if-bar-track" style={{ marginBottom: 8 }}>
            {attending  > 0 && <div style={{ width: `${attending / total * 100}%`,  background: 'var(--accent)' }}/>}
            {noResponse > 0 && <div style={{ width: `${noResponse / total * 100}%`, background: 'var(--warning)', opacity: 0.5 }}/>}
            {declined   > 0 && <div style={{ width: `${declined / total * 100}%`,   background: 'var(--danger)',  opacity: 0.5 }}/>}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--rf-mono)', fontSize: 9, color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>
            {[
              { label: `${attending} YES`,  dot: 'var(--accent)',   opacity: 1 },
              { label: `${noResponse} PEND`, dot: 'var(--warning)', opacity: 0.7 },
              { label: `${declined} NO`,    dot: 'var(--danger)',   opacity: 0.7 },
            ].map(l => (
              <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: l.dot, opacity: l.opacity, flexShrink: 0, display: 'inline-block' }}/>
                {l.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Filter chips ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {([
          { k: 'all' as Filter,       l: 'All',     c: total },
          { k: 'attending' as Filter, l: 'Yes',     c: attending },
          { k: 'pending' as Filter,   l: 'Pending', c: noResponse },
          { k: 'declined' as Filter,  l: 'No',      c: declined },
        ]).map(f => (
          <button
            key={f.k}
            className={`if-filter-chip${filter === f.k ? ' active' : ''}`}
            onClick={() => setFilter(f.k)}
          >
            {f.l}
            <span className="count"> {f.c}</span>
          </button>
        ))}
      </div>

      {/* ── Dense invitee list ─────────────────────────────────────────── */}
      <div className="if-section-label mb-2">INVITEES</div>
      <div className="if-card" style={{ marginBottom: 24 }}>
        {filtered.length === 0 ? (
          <div className="if-empty" style={{ padding: '24px' }}>No results for this filter.</div>
        ) : (
          filtered.map((o, i) => {
            const rsvpColor =
              o.rsvpStatus === 'Attending' ? 'var(--accent)' :
              o.rsvpStatus === 'Declined'  ? 'var(--danger)' :
              'var(--warning)';
            const rsvpLabel =
              o.rsvpStatus === 'Attending' ? 'YES' :
              o.rsvpStatus === 'Declined'  ? 'NO'  : 'WAIT';
            const isLast = i === filtered.length - 1;

            return (
              <div
                key={o.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: 'var(--rt-row-pad)',
                  borderBottom: isLast ? 'none' : '1px solid var(--border)',
                }}
              >
                {/* Status accent bar */}
                <div style={{ width: 3, alignSelf: 'stretch', background: rsvpColor, borderRadius: 2, flexShrink: 0 }}/>

                {/* Name + title */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--rf-sans)', fontSize: 12, fontWeight: 500, color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {o.firstName} {o.lastName}
                    </span>
                    {o.category && (
                      <span style={{ fontFamily: 'var(--rf-mono)', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.08em', flexShrink: 0 }}>
                        {o.category.toUpperCase()}
                      </span>
                    )}
                  </div>
                  {o.title && (
                    <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 10, color: 'var(--text-secondary)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {o.title}
                    </div>
                  )}
                </div>

                {/* Send status */}
                <span style={{ fontFamily: 'var(--rf-mono)', fontSize: 9, color: o.inviteStatus === 'sent' ? 'var(--success)' : o.inviteStatus === 'failed' ? 'var(--danger)' : 'var(--text-muted)', flexShrink: 0, letterSpacing: '0.06em' }}>
                  {o.inviteStatus.toUpperCase()}
                </span>

                {/* RSVP pill */}
                <span style={{
                  fontFamily: 'var(--rf-mono)', fontSize: 9,
                  padding: '3px 6px', borderRadius: 3,
                  border: `1px solid ${rsvpColor}`,
                  color: rsvpColor,
                  letterSpacing: '0.1em', flexShrink: 0,
                }}>
                  {rsvpLabel}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* ── By category table ──────────────────────────────────────────── */}
      {byCategory.length > 0 && (
        <>
          <div className="if-section-label mb-2">BY CATEGORY</div>
          <div className="if-card" style={{ overflow: 'hidden', marginBottom: 24 }}>
            <div className="overflow-x-auto" role="region" aria-label="Category breakdown" tabIndex={0}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--rf-mono)' }}>
                <thead>
                  <tr>
                    {['Category', 'Total', 'Sent', 'Attending', 'Declined', 'No Response'].map(h => (
                      <th
                        key={h}
                        style={{
                          fontSize: 8, color: 'var(--text-secondary)', letterSpacing: '0.12em',
                          textTransform: 'uppercase', textAlign: 'left', padding: '7px 12px',
                          borderBottom: '1px solid var(--border)',
                          background: 'var(--bg-subtle)',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {byCategory.map((row, i) => (
                    <tr key={row.category} style={{ borderBottom: i < byCategory.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ fontSize: 11, color: 'var(--text-base)', padding: '6px 12px' }}>{row.category}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-secondary)', padding: '6px 12px' }}>{row.total}</td>
                      <td style={{ fontSize: 11, color: 'var(--success)', padding: '6px 12px' }}>{row.sent}</td>
                      <td style={{ fontSize: 11, color: 'var(--accent)', padding: '6px 12px' }}>{row.attending}</td>
                      <td style={{ fontSize: 11, color: 'var(--danger)', padding: '6px 12px' }}>{row.declined}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)', padding: '6px 12px' }}>{row.noResponse}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
