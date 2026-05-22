import { useState, useEffect } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { useRouter } from '../state/RouterContext';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';

type Filter = 'all' | 'pending' | 'failed';

export default function SendPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { navigate } = useRouter();
  const [filter, setFilter] = useState<Filter>('pending');
  const [activePane, setActivePane] = useState<'preflight' | 'log'>('preflight');
  const [err, setErr] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const ev = state.events.find(e => e.id === state.activeEventId);

  const filtered = state.invitees.filter(i =>
    filter === 'all' ? true : filter === 'pending' ? i.inviteStatus === 'pending' : i.inviteStatus === 'failed'
  );
  const pendingCount = state.invitees.filter(i => i.inviteStatus === 'pending').length;
  const sentCount    = state.invitees.filter(i => i.inviteStatus === 'sent').length;
  const failedCount  = state.invitees.filter(i => i.inviteStatus === 'failed').length;

  const templateSaved = !!state.htmlBody.trim();
  const hasMissingEmail = state.invitees.some(i => !i.email);
  const allChecks = ev && templateSaved && !hasMissingEmail;

  const progress = state.sendProgress.total > 0
    ? Math.round((state.sendProgress.current / state.sendProgress.total) * 100)
    : 0;

  useEffect(() => {
    if (!confirmOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setConfirmOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [confirmOpen]);

  function handleSendClick() {
    if (!ev) { setErr('No event selected — go back and choose one.'); return; }
    if (!state.htmlBody.trim()) { setErr('No invitation template yet — tap Compose to write one.'); return; }
    if (filtered.length === 0) { setErr('No invitees match this filter — try \'All\'.'); return; }
    setErr('');
    setConfirmOpen(true);
  }

  function handleConfirmSend() {
    setConfirmOpen(false);
    setErr('Email sending is not available in this version.');
    // dispatch({ type: 'START_SEND', total: filtered.length });
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-root)' }}>
      <PageHeader eyebrow="SEND" title="Bulk send" showBack />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 100px' }}>

        {/* Pane switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="if-meta-line">
            {ev ? (
              <>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: allChecks ? 'var(--success)' : 'var(--warning)', display: 'inline-block', marginRight: 8 }} />
                <span>{ev.contactEmail ? `GMAIL · ${ev.contactEmail.split('@')[0].toUpperCase()}@…` : 'SENDER NOT CONFIGURED'}</span>
                <span className="if-meta-sep">·</span>
                <span style={{ color: 'var(--accent)' }}>{filtered.length} {filter.toUpperCase()}</span>
              </>
            ) : <span style={{ color: 'var(--warning)' }}>NO ACTIVE EVENT</span>}
          </div>
          <div className="if-tab-switcher" style={{ width: 180, flexShrink: 0 }}>
            <button className={`if-tab-option${activePane === 'preflight' ? ' active' : ''}`} onClick={() => setActivePane('preflight')}>Pre-flight</button>
            <button className={`if-tab-option${activePane === 'log' ? ' active' : ''}`} onClick={() => setActivePane('log')}>Log</button>
          </div>
        </div>

        {err && <div className="if-status err" style={{ marginBottom: 12 }}>{err}</div>}

        {/* ── Pre-flight pane ────────────────────────── */}
        {activePane === 'preflight' && (
          <>
            <div className="if-section-label" style={{ marginBottom: 8 }}>PRE-FLIGHT CHECKS</div>
            <div className="if-card" style={{ marginBottom: 16 }}>
              {[
                {
                  ok: !!ev?.contactEmail,
                  title: 'Sender configured',
                  sub: ev?.contactEmail ? ev.contactEmail.toUpperCase() : 'CONTACT EMAIL NOT SET IN EVENT SETUP',
                },
                {
                  ok: templateSaved,
                  title: 'Template saved',
                  sub: templateSaved
                    ? `${(state.htmlBody.match(/\{\{\w+\}\}/g) || []).length} MERGE TOKENS DETECTED`
                    : 'NO BODY — GO TO COMPOSE',
                },
                {
                  ok: !hasMissingEmail,
                  title: 'Recipients validated',
                  sub: `${state.invitees.length} TOTAL · ${hasMissingEmail ? `${state.invitees.filter(i => !i.email).length} MISSING EMAIL` : 'ALL HAVE EMAIL'}`,
                },
              ].map((check, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 'var(--rt-row-pad)', borderBottom: '1px solid var(--border)' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                    background: check.ok ? 'rgba(98,196,98,0.15)' : 'rgba(229,113,88,0.12)',
                    border: `1px solid ${check.ok ? 'var(--success)' : 'var(--danger)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: check.ok ? 'var(--success)' : 'var(--danger)',
                    fontFamily: 'var(--rf-mono)', fontSize: 10,
                  }}>
                    {check.ok ? <Icon name="check" size={11} /> : '!'}
                  </div>
                  <div>
                    <div className="if-card-row-title">{check.title}</div>
                    <div className="if-card-row-sub">{check.sub}</div>
                  </div>
                </div>
              ))}

              {/* Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 'var(--rt-row-pad)' }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, background: 'var(--bg-root)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <Icon name="filter" size={12} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="if-card-row-title">Active filter</div>
                  <div className="if-card-row-sub">{filter.toUpperCase()} · {filtered.length} WILL RECEIVE</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['pending', 'failed', 'all'] as Filter[]).map(f => (
                    <button key={f} className={`if-filter-chip${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                      {f}
                      <span className="count"> {f === 'all' ? state.invitees.length : f === 'pending' ? pendingCount : failedCount}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stat strip */}
            <div className="if-section-label" style={{ marginBottom: 8 }}>THIS EVENT</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Pending', value: pendingCount, sublabel: `of ${state.invitees.length} total`, color: 'var(--text-secondary)' },
                { label: 'Sent',    value: sentCount,    sublabel: 'sent successfully', color: 'var(--success)' },
                { label: 'Failed',  value: failedCount,  sublabel: `of ${state.invitees.length} total`, color: 'var(--danger)' },
                { label: 'Ready',   value: filtered.length, sublabel: 'will receive', color: 'var(--accent)' },
              ].map(s => (
                <div key={s.label} className="if-stat-chip">
                  <div className="if-stat-chip-label">{s.label}</div>
                  <div className="if-stat-chip-value" style={{ color: s.color }}>{s.value}</div>
                  <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 9, color: 'var(--text-muted)', marginTop: 3 }}>{s.sublabel}</div>
                </div>
              ))}
            </div>

            {/* Progress */}
            {state.sending && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  fontFamily: 'var(--rf-mono)', fontSize: 11, color: 'var(--text-secondary)',
                  marginBottom: 8, letterSpacing: '0.06em' }}>
                  <span style={{ color: 'var(--text-heading)' }}>
                    Sending to: {state.sendProgress.currentName || '…'}
                  </span>
                  <span>
                    {state.sendProgress.current} of {state.sendProgress.total} ({progress}%)
                  </span>
                </div>
                <div className="if-progress-track">
                  <div className="if-progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Log pane ────────────────────────────────── */}
        {activePane === 'log' && (
          <>
            <div className="if-section-label" style={{ marginBottom: 8 }}>DELIVERY LOG</div>
            {state.sendLog.length === 0 ? (
              <div className="if-card">
                <div className="if-empty" style={{ padding: '32px 18px' }}>
                  No sends yet
                  <div className="if-empty-sub" style={{ marginTop: 6, marginBottom: 0 }}>RUN A SEND TO SEE DELIVERY LOG</div>
                </div>
              </div>
            ) : (
              <div className="if-card" style={{ overflow: 'hidden' }}>
                {state.sendLog.map((entry, i) => (
                  <div key={entry.id} style={{
                    display: 'flex', gap: 10, alignItems: 'baseline',
                    padding: 'var(--rt-row-pad)',
                    borderBottom: i < state.sendLog.length - 1 ? '1px solid var(--border)' : 'none',
                    fontFamily: 'var(--rf-mono)', fontSize: 11,
                  }}>
                    <span style={{ minWidth: 40, fontSize: 9, letterSpacing: '0.07em', color: entry.status === 'sent' ? 'var(--success)' : 'var(--danger)' }}>
                      {entry.status.toUpperCase()}
                    </span>
                    <span style={{ color: 'var(--text-base)', minWidth: 160 }}>{entry.name}</span>
                    <span style={{ color: 'var(--text-muted)', flex: 1, fontSize: 10 }}>{entry.email}</span>
                    {entry.error && <span style={{ fontSize: 9, color: 'var(--danger)' }}>{entry.error}</span>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <>
          <div className="if-modal-backdrop" onClick={() => setConfirmOpen(false)} />
          <div className="if-modal" style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            zIndex: 1000, maxWidth: 400, width: 'calc(100% - 32px)',
          }}>
            <div style={{ marginBottom: 12 }}>
              <div className="if-page-title">Ready to send?</div>
            </div>
            <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.65 }}>
              Sending to {filtered.length} {filter === 'all' ? 'invitee(s)' : filter + ' invitee(s)'}.<br />
              From: {ev?.contactEmail || '(not configured)'}<br />
              Subject: {state.textSubject || '(no subject set)'}<br />
              This will run in the background once confirmed.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="if-btn" onClick={() => setConfirmOpen(false)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button className="if-btn pri" onClick={handleConfirmSend} style={{ flex: 1 }}>
                Confirm & Send
              </button>
            </div>
          </div>
        </>
      )}

      {/* Sticky CTA */}
      <div style={{ flexShrink: 0, padding: '12px 18px', borderTop: '1px solid var(--border)', background: 'var(--bg-root)' }}>
        <button
          className="if-primary-btn"
          onClick={handleSendClick}
          disabled={state.sending || filtered.length === 0}
          style={{ width: '100%' }}
        >
          {state.sending
            ? `Sending ${state.sendProgress.current} of ${state.sendProgress.total}…`
            : `Send to ${filtered.length} pending invitee${filtered.length !== 1 ? 's' : ''} →`}
        </button>
      </div>
    </div>
  );
}
