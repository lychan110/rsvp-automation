import { useAppState } from '../state/AppContext';
import type { Invitee } from '../types';

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
  const inv = state.invitees;

  const total = inv.length;
  const sent = inv.filter(i => i.inviteStatus === 'sent').length;
  const pending = inv.filter(i => i.inviteStatus === 'pending').length;
  const failed = inv.filter(i => i.inviteStatus === 'failed').length;
  const attending = inv.filter(i => i.rsvpStatus === 'Attending').length;
  const declined = inv.filter(i => i.rsvpStatus === 'Declined').length;
  const noResponse = inv.filter(i => i.rsvpStatus === 'No Response').length;

  const cats = Array.from(new Set(inv.map(i => i.category).filter(Boolean))).sort();
  const byCategory: CategoryRow[] = cats.map(cat => {
    const rows = inv.filter(i => i.category === cat);
    return {
      category: cat,
      total: rows.length,
      sent: rows.filter(i => i.inviteStatus === 'sent').length,
      attending: rows.filter(i => i.rsvpStatus === 'Attending').length,
      declined: rows.filter(i => i.rsvpStatus === 'Declined').length,
      noResponse: rows.filter(i => i.rsvpStatus === 'No Response').length,
    };
  });

  const card = (label: string, value: number, color: string) => (
    <div key={label} style={{ background: 'var(--bg-surface)', border: `1px solid var(--border)`, borderRadius: 7, padding: '16px 20px', borderLeft: `3px solid ${color}` }}>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, color, fontWeight: 700 }}>{value}</div>
    </div>
  );

  const th: React.CSSProperties = { fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', padding: '6px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)' };
  const td: React.CSSProperties = { fontSize: 11, color: 'var(--text-base)', padding: '7px 12px', borderBottom: '1px solid var(--bg-subtle)' };

  if (total === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
        No invitees yet. Add them in the Invitees tab.
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ fontSize: 13, color: 'var(--text-heading)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 20 }}>TRACKER</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10, marginBottom: 28 }}>
        {card('TOTAL', total, 'var(--text-secondary)')}
        {card('PENDING', pending, 'var(--text-muted)')}
        {card('SENT', sent, 'var(--success)')}
        {card('FAILED', failed, 'var(--danger)')}
        {card('ATTENDING', attending, 'var(--gold)')}
        {card('DECLINED', declined, 'var(--danger)')}
        {card('NO RESPONSE', noResponse, 'var(--text-muted)')}
      </div>

      {byCategory.length > 0 && (
        <>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 10 }}>BY CATEGORY</div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 7, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Category', 'Total', 'Sent', 'Attending', 'Declined', 'No Response'].map(h => (
                    <th key={h} style={th}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {byCategory.map(row => (
                  <tr key={row.category}>
                    <td style={td}>{row.category}</td>
                    <td style={td}>{row.total}</td>
                    <td style={{ ...td, color: 'var(--success)' }}>{row.sent}</td>
                    <td style={{ ...td, color: 'var(--gold)' }}>{row.attending}</td>
                    <td style={{ ...td, color: 'var(--danger)' }}>{row.declined}</td>
                    <td style={{ ...td, color: 'var(--text-muted)' }}>{row.noResponse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
