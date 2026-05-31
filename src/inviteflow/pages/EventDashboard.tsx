import { useEffect } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { useRouter } from '../state/RouterContext';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import { loadInvitees } from '../api/storage';
import type { RouteId } from '../state/RouterContext';
import type { AppState } from '../types';

interface WorkflowRow {
  num: string;
  icon: string;
  title: string;
  sub: string;
  route: RouteId;
}

type StepId = 'invitees' | 'compose' | 'send' | 'tracker';

interface NextStep {
  id: StepId;
  route: RouteId;
  ctaLabel: string;
  contextLine: string;
}

function getNextStep(state: AppState): NextStep {
  const hasInvitees = state.invitees.length > 0;
  const hasTemplate = !!state.htmlBody.trim() || !!state.templateId;
  const pendingCount = state.invitees.filter(i => i.inviteStatus === 'pending').length;
  const sentCount    = state.invitees.filter(i => i.inviteStatus === 'sent').length;

  if (!hasInvitees) return {
    id: 'invitees', route: 'invitees',
    ctaLabel: 'Import your guest list →',
    contextLine: 'No invitees added yet — start here.',
  };
  if (!hasTemplate) return {
    id: 'compose', route: 'compose',
    ctaLabel: 'Write the invitation email →',
    contextLine: `${state.invitees.length} invitees ready, no template yet.`,
  };
  if (pendingCount > 0) return {
    id: 'send', route: 'send',
    ctaLabel: `Send to ${pendingCount} pending invitee${pendingCount !== 1 ? 's' : ''} →`,
    contextLine: `${sentCount} already sent. ${pendingCount} remaining.`,
  };
  return {
    id: 'tracker', route: 'tracker',
    ctaLabel: 'Review RSVP responses →',
    contextLine: `All ${sentCount} invites sent. Waiting for responses.`,
  };
}

const WORKFLOW: WorkflowRow[] = [
  { num: '01', icon: 'users',    title: 'Invitees',   sub: 'IMPORT, MANAGE & REVIEW GUEST LIST',  route: 'invitees' },
  { num: '02', icon: 'pen',      title: 'Compose',    sub: 'WRITE & PREVIEW THE INVITE EMAIL',    route: 'compose'  },
  { num: '03', icon: 'send',     title: 'Send',       sub: 'BULK SEND INVITATIONS',               route: 'send'     },
  { num: '04', icon: 'calendar', title: 'Tracker',    sub: 'MONITOR RSVP RESPONSES',              route: 'tracker'  },
  { num: '05', icon: 'sync',     title: 'Sync',       sub: 'SYNC WITH SPREADSHEET',               route: 'sync'     },
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
  const dispatch = useAppDispatch();
  const { navigate } = useRouter();

  // Reload invitees from Dexie when state is empty but an event is active.
  // This handles the case where SET_ACTIVE_EVENT clears invitees (e.g. switching events).
  useEffect(() => {
    if (!state.activeEventId || state.invitees.length > 0) return;
    loadInvitees(state.activeEventId).then(invitees => {
      if (invitees.length > 0) dispatch({ type: 'LOAD_STATE', partial: { invitees } });
    });
  }, [state.activeEventId, state.invitees.length]);

  const ev = state.events.find(e => e.id === state.activeEventId);

  const total     = state.invitees.length;
  const sent      = state.invitees.filter(i => i.inviteStatus === 'sent').length;
  const attending = state.invitees.filter(i => i.rsvpStatus === 'Attending').length;
  const pending   = state.invitees.filter(i => i.rsvpStatus === 'No Response').length;

  const nextStep = getNextStep(state);
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
              { label: 'INVITED',   value: sent,      color: 'var(--text-heading)', sub: `of ${total} TOTAL` },
              { label: 'ATTENDING', value: attending, color: 'var(--accent)', sub: `of ${sent} INVITED` },
              { label: 'PENDING',   value: pending,   color: 'var(--text-muted)', sub: `of ${sent} INVITED` },
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
                <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.08em', marginTop: 4 }}>
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

        {/* Zone 1: Dominant CTA */}
        <div className="if-card" style={{ padding: 20, marginBottom: 12 }}>
          <div className="if-section-label" style={{ marginBottom: 10 }}>NEXT STEP</div>
          <div style={{ fontSize: 17, fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 6 }}>
            {nextStep.ctaLabel}
          </div>
          <div style={{ fontSize: 12, fontFamily: 'var(--rf-mono)', color: 'var(--text-secondary)', marginBottom: 14 }}>
            {nextStep.contextLine}
          </div>
          <button
            className="if-primary-btn"
            style={{ width: '100%' }}
            onClick={() => navigate(nextStep.route)}
          >
            {nextStep.ctaLabel}
          </button>
        </div>

        {/* Zone 2: Remaining 4 steps */}
        <div className="if-section-label" style={{ padding: '8px 0 8px' }}>WORKFLOW</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {WORKFLOW.slice(0, 4).map((w) => {
            const isCompleted = w.route === 'invitees' && state.invitees.length > 0
              || w.route === 'compose' && (!!state.htmlBody.trim() || !!state.templateId)
              || w.route === 'send' && state.invitees.filter(i => i.inviteStatus === 'sent').length > 0;
            const isCurrent = nextStep.route === w.route;

            return (
              <button
                key={w.route}
                onClick={() => navigate(w.route)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: 'var(--rt-row-pad)', background: 'transparent', border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div
                  key={`chip-${nextStep.id}`}
                  className={`if-row-chip${isCurrent ? ' filled if-step-done' : ''}${isCompleted ? ' good' : ''}`}
                  style={{
                    width: 28, height: 28, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--rf-mono)', fontSize: 9,
                  }}
                >
                  {w.num}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="if-card-row-title">{w.title}</div>
                  <div className="if-card-row-sub">{w.sub}</div>
                </div>
                <Icon name="chevron-right" size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </button>
            );
          })}
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
                    fontFamily: 'var(--rf-mono)', fontSize: 10, letterSpacing: '0.08em',
                    color: entry.status === 'sent' ? 'var(--success)' : 'var(--danger)',
                    flexShrink: 0, minWidth: 32,
                  }}>
                    {entry.status.toUpperCase()}
                  </span>
                  <span style={{ fontFamily: 'var(--rf-mono)', fontSize: 11, color: 'var(--text-base)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.name}
                  </span>
                  <span style={{ fontFamily: 'var(--rf-mono)', fontSize: 10, color: 'var(--text-secondary)', flexShrink: 0 }}>
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
