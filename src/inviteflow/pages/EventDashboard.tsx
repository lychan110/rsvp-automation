import { useAppState, useAppDispatch } from '../state/AppContext';
import { useRouter } from '../state/RouterContext';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import type { RouteId } from '../state/RouterContext';

interface WorkflowRow {
  num: string;
  icon: string;
  title: string;
  sub: string;
  route: RouteId;
}

const WORKFLOW: WorkflowRow[] = [
  { num: '01', icon: 'users',    title: 'Invitees',   sub: 'IMPORT, MANAGE & REVIEW GUEST LIST',  route: 'invitees' },
  { num: '02', icon: 'pen',      title: 'Compose',    sub: 'WRITE & PREVIEW THE INVITE EMAIL',    route: 'compose'  },
  { num: '03', icon: 'send',     title: 'Send',       sub: 'BULK SEND VIA GMAIL',                 route: 'send'     },
  { num: '04', icon: 'calendar', title: 'Tracker',    sub: 'MONITOR RSVP RESPONSES',              route: 'tracker'  },
  { num: '05', icon: 'sync',     title: 'Sync',       sub: 'PUSH / PULL GOOGLE SHEETS',           route: 'sync'     },
];

function CardRow({
  chip, title, sub, route, isLast,
}: {
  chip: React.ReactNode;
  title: string;
  sub: string;
  route: RouteId;
  isLast?: boolean;
}) {
  const { navigate } = useRouter();
  return (
    <button
      onClick={() => navigate(route)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: 'var(--rt-row-pad)', background: 'transparent', border: 'none',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
        cursor: 'pointer', textAlign: 'left',
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 6, flexShrink: 0,
        background: 'var(--bg-root)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-secondary)',
      }}>
        {chip}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="if-card-row-title">{title}</div>
        <div className="if-card-row-sub">{sub}</div>
      </div>
      <Icon name="chevron-right" size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
    </button>
  );
}

export default function EventDashboard() {
  const state = useAppState();
  const { navigate } = useRouter();

  const ev = state.events.find(e => e.id === state.activeEventId);

  const total     = state.invitees.length;
  const sent      = state.invitees.filter(i => i.inviteStatus === 'sent').length;
  const attending = state.invitees.filter(i => i.rsvpStatus === 'Attending').length;
  const pending   = state.invitees.filter(i => i.rsvpStatus === 'No Response').length;

  const recent = [...state.sendLog].reverse().slice(0, 5);

  if (!ev) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-root)' }}>
        <PageHeader eyebrow="EVENT" title="No event selected" showBack />
        <div className="if-empty">
          No event active.
          <div className="if-empty-sub">GO BACK AND SELECT AN EVENT</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-root)' }}>
      <PageHeader eyebrow="EVENT" title={ev.name} showBack />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 32px' }}>

        {/* Stats card */}
        <div className="if-card" style={{ padding: '14px 16px', marginBottom: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {[
              { label: 'INVITED',   value: sent,      color: 'var(--text-heading)' },
              { label: 'ATTENDING', value: attending, color: 'var(--accent)' },
              { label: 'PENDING',   value: pending,   color: 'var(--text-muted)' },
            ].map((s, i) => (
              <div
                key={s.label}
                style={{
                  textAlign: 'center',
                  borderRight: i < 2 ? '1px solid var(--border)' : 'none',
                  padding: '4px 0',
                }}
              >
                <div style={{ fontFamily: 'var(--rf-serif)', fontSize: 28, fontWeight: 500, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.12em', marginTop: 4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          {ev.date && (
            <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 9, color: 'var(--text-secondary)', letterSpacing: '0.1em', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              {ev.date} {ev.venue ? `· ${ev.venue}` : ''}
            </div>
          )}
        </div>

        {/* Workflow */}
        <div className="if-section-label" style={{ padding: '8px 0 8px' }}>WORKFLOW</div>
        <div className="if-card" style={{ marginBottom: 12 }}>
          {WORKFLOW.map((w, i) => (
            <CardRow
              key={w.route}
              chip={<span style={{ fontFamily: 'var(--rf-mono)', fontSize: 9 }}>{w.num}</span>}
              title={w.title}
              sub={w.sub}
              route={w.route}
              isLast={i === WORKFLOW.length - 1}
            />
          ))}
        </div>

        {/* More */}
        <div className="if-section-label" style={{ padding: '8px 0 8px' }}>MORE</div>
        <div className="if-card" style={{ marginBottom: 12 }}>
          <CardRow
            chip={<Icon name="settings" size={13} />}
            title="Event Setup"
            sub="EDIT EVENT DETAILS, OAUTH, SHEET URLS"
            route="event-setup"
          />
          <CardRow
            chip={<Icon name="sparkle" size={13} />}
            title="Discover Officials"
            sub="FIND ELECTED OFFICIALS WITH CONTACTSCOUT"
            route="scout"
            isLast
          />
        </div>

        {/* Recent activity */}
        {recent.length > 0 && (
          <>
            <div className="if-section-label" style={{ padding: '8px 0 8px' }}>RECENT ACTIVITY</div>
            <div className="if-card">
              {recent.map((entry, i) => (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex', gap: 10, alignItems: 'baseline',
                    padding: 'var(--rt-row-pad)',
                    borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--rf-mono)', fontSize: 8, letterSpacing: '0.08em',
                    color: entry.status === 'sent' ? 'var(--success)' : 'var(--danger)',
                    flexShrink: 0, minWidth: 32,
                  }}>
                    {entry.status.toUpperCase()}
                  </span>
                  <span style={{ fontFamily: 'var(--rf-mono)', fontSize: 11, color: 'var(--text-base)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.name}
                  </span>
                  <span style={{ fontFamily: 'var(--rf-mono)', fontSize: 9, color: 'var(--text-muted)', flexShrink: 0 }}>
                    {entry.timestamp.slice(0, 10)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
