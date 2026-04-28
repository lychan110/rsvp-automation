import { useAppState } from '../state/AppContext';

interface CategoryRow {
  category: string;
  total: number;
  sent: number;
  attending: number;
  declined: number;
  noResponse: number;
}

const STAT_BORDER: Record<string, string> = {
  TOTAL:       'var(--text-secondary)',
  PENDING:     'var(--text-muted)',
  SENT:        'var(--success)',
  FAILED:      'var(--danger)',
  ATTENDING:   'var(--gold)',
  DECLINED:    'var(--danger)',
  'NO RESPONSE': 'var(--text-muted)',
};
const STAT_VALUE: Record<string, string> = {
  TOTAL:       'var(--text-secondary)',
  PENDING:     'var(--text-muted)',
  SENT:        'var(--success)',
  FAILED:      'var(--danger)',
  ATTENDING:   'var(--gold)',
  DECLINED:    'var(--danger)',
  'NO RESPONSE': 'var(--text-muted)',
};

export default function TrackerTab() {
  const state = useAppState();
  const inv = state.invitees;

  const total      = inv.length;
  const sent       = inv.filter(i => i.inviteStatus === 'sent').length;
  const pending    = inv.filter(i => i.inviteStatus === 'pending').length;
  const failed     = inv.filter(i => i.inviteStatus === 'failed').length;
  const attending  = inv.filter(i => i.rsvpStatus === 'Attending').length;
  const declined   = inv.filter(i => i.rsvpStatus === 'Declined').length;
  const noResponse = inv.filter(i => i.rsvpStatus === 'No Response').length;

  const stats: [string, number][] = [
    ['TOTAL', total], ['PENDING', pending], ['SENT', sent],
    ['FAILED', failed], ['ATTENDING', attending], ['DECLINED', declined], ['NO RESPONSE', noResponse],
  ];

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
    return <div className="if-empty">No invitees yet. Add them in the Invitees tab.</div>;
  }

  return (
    <div className="p-5 max-w-[900px] mx-auto w-full">
      <div className="if-page-title mb-5">TRACKER</div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-7">
        {stats.map(([label, value]) => (
          <div
            key={label}
            className="if-stat"
            style={{ borderLeftColor: STAT_BORDER[label] }}
          >
            <div className="if-stat-label">{label}</div>
            <div className="if-stat-value" style={{ color: STAT_VALUE[label] }}>{value}</div>
          </div>
        ))}
      </div>

      {/* By category table */}
      {byCategory.length > 0 && (
        <>
          <div className="if-section-label mb-2.5">BY CATEGORY</div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
            <div className="overflow-x-auto" role="region" aria-label="Category breakdown" tabIndex={0}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace' }}>
                <thead>
                  <tr>
                    {['Category', 'Total', 'Sent', 'Attending', 'Declined', 'No Response'].map(h => (
                      <th
                        key={h}
                        style={{
                          fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em',
                          textTransform: 'uppercase', textAlign: 'left', padding: '6px 12px',
                          borderBottom: '1px solid var(--border)',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {byCategory.map(row => (
                    <tr key={row.category} style={{ borderBottom: '1px solid var(--bg-subtle)' }}>
                      <td style={{ fontSize: 11, color: 'var(--text-base)', padding: '5px 12px' }}>{row.category}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-secondary)', padding: '5px 12px' }}>{row.total}</td>
                      <td style={{ fontSize: 11, color: 'var(--success)', padding: '5px 12px' }}>{row.sent}</td>
                      <td style={{ fontSize: 11, color: 'var(--gold)', padding: '5px 12px' }}>{row.attending}</td>
                      <td style={{ fontSize: 11, color: 'var(--danger)', padding: '5px 12px' }}>{row.declined}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)', padding: '5px 12px' }}>{row.noResponse}</td>
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
