import { useState } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { getToken } from '../api/auth';
import { buildMimeRaw, personalize, sendEmail } from '../api/gmail';

type Filter = 'all' | 'pending' | 'failed';

const BATCH_SIZE = 80;
const BATCH_DELAY_MS = 61000;

// Reusable chevron icon
function Chevron() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
      <path d="M9 6l6 6-6 6"/>
    </svg>
  );
}

export default function SendTab() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [filter, setFilter] = useState<Filter>('pending');
  const [activePane, setActivePane] = useState<'preflight' | 'log'>('preflight');
  const [err, setErr] = useState('');
  const [testEmail, setTestEmail] = useState(() => {
    const ev = state.events.find(e => e.id === state.activeEventId);
    return ev?.contactEmail || '';
  });
  const [testSent, setTestSent] = useState(false);
  const [testApproved, setTestApproved] = useState(false);
  const [testSending, setTestSending] = useState(false);

  const ev = state.events.find(e => e.id === state.activeEventId);

  const filtered = state.invitees.filter(i => {
    if (filter === 'all') return true;
    if (filter === 'pending') return i.inviteStatus === 'pending';
    return i.inviteStatus === 'failed';
  });

  const pendingCount = state.invitees.filter(i => i.inviteStatus === 'pending').length;
  const sentCount    = state.invitees.filter(i => i.inviteStatus === 'sent').length;
  const failedCount  = state.invitees.filter(i => i.inviteStatus === 'failed').length;

  async function sendBulk() {
    if (!ev) { setErr('No active event — go to Setup.'); return; }
    if (!state.htmlBody.trim()) { setErr('No email body — go to Compose.'); return; }
    if (filtered.length === 0) { setErr('No invitees match the current filter.'); return; }
    setErr('');

    dispatch({ type: 'START_SEND', total: filtered.length });

    let token: string;
    try { token = await getToken('gmail.send'); }
    catch (e) { setErr(String(e)); dispatch({ type: 'STOP_SEND' }); return; }

    const from = ev.contactEmail || 'me';
    let sent = 0;

    for (let i = 0; i < filtered.length; i++) {
      const inv = filtered[i];
      const personalizedHtml    = personalize(state.htmlBody, inv, ev);
      const personalizedSubject = personalize(state.textSubject, inv, ev);
      const raw = buildMimeRaw(from, inv.email, personalizedSubject, personalizedHtml);

      try {
        await sendEmail(token, raw);
        dispatch({ type: 'UPDATE_INVITEE', invitee: { ...inv, inviteStatus: 'sent', sentAt: new Date().toISOString() } });
        dispatch({ type: 'LOG_SEND', entry: { id: crypto.randomUUID(), email: inv.email, name: `${inv.firstName} ${inv.lastName}`, status: 'sent', timestamp: new Date().toISOString() } });
      } catch (e) {
        dispatch({ type: 'UPDATE_INVITEE', invitee: { ...inv, inviteStatus: 'failed' } });
        dispatch({ type: 'LOG_SEND', entry: { id: crypto.randomUUID(), email: inv.email, name: `${inv.firstName} ${inv.lastName}`, status: 'failed', timestamp: new Date().toISOString(), error: String(e) } });
      }

      sent++;
      dispatch({ type: 'SEND_PROGRESS', current: sent });

      if (sent % BATCH_SIZE === 0 && i < filtered.length - 1) {
        await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
      }
    }

    dispatch({ type: 'STOP_SEND' });
  }

  async function sendTestEmail() {
    if (!ev) { setErr('No active event — go to Setup.'); return; }
    if (!state.htmlBody.trim()) { setErr('No email body — go to Compose.'); return; }
    if (!testEmail.trim()) { setErr('Enter a test email address.'); return; }
    setErr('');
    setTestSending(true);

    let token: string;
    try { token = await getToken('gmail.send'); }
    catch (e) { setErr(String(e)); setTestSending(false); return; }

    const from = ev.contactEmail || 'me';
    const mockInvitee = state.invitees.find(i => i.email) || {
      id: 'test',
      eventId: state.activeEventId ?? '',
      firstName: 'Test',
      lastName: 'User',
      title: '',
      category: '',
      email: testEmail,
      rsvpLink: '',
      inviteStatus: 'pending' as const,
      sentAt: '',
      rsvpStatus: 'No Response',
      rsvpDate: '',
      notes: '',
    };
    const personalizedHtml = personalize(state.htmlBody, mockInvitee, ev);
    const personalizedSubject = personalize(state.textSubject, mockInvitee, ev);
    const raw = buildMimeRaw(from, testEmail, personalizedSubject, personalizedHtml);

    try {
      await sendEmail(token, raw);
      dispatch({ type: 'LOG_SEND', entry: { id: crypto.randomUUID(), email: testEmail, name: 'Test Email', status: 'sent', timestamp: new Date().toISOString() } });
      setTestSent(true);
      setTestApproved(false);
    } catch (e) {
      setErr(`Test failed: ${String(e)}`);
    }

    setTestSending(false);
  }

  const progress = state.sendProgress.total > 0
    ? Math.round((state.sendProgress.current / state.sendProgress.total) * 100)
    : 0;

  const templateSaved = !!state.htmlBody.trim();
  const hasMissingEmail = state.invitees.some(i => !i.email);
  const allChecks = ev && templateSaved && !hasMissingEmail;

  return (
    <div className="p-5 max-w-[760px] mx-auto w-full">
      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="if-eyebrow mb-1.5">SEND</div>
          <div className="if-page-title">Bulk send</div>
        </div>
        <div className="if-tab-switcher" style={{ width: 200 }}>
          <button
            className={`if-tab-option${activePane === 'preflight' ? ' active' : ''}`}
            onClick={() => setActivePane('preflight')}
          >
            Pre-flight
          </button>
          <button
            className={`if-tab-option${activePane === 'log' ? ' active' : ''}`}
            onClick={() => setActivePane('log')}
          >
            Log
          </button>
        </div>
      </div>

      {/* Meta line */}
      <div className="if-meta-line mb-4">
        {ev ? (
          <>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: allChecks ? 'var(--success)' : 'var(--warning)', display: 'inline-block', marginRight: 8 }}/>
            <span>{ev.contactEmail ? `GMAIL · ${ev.contactEmail.split('@')[0].toUpperCase()}@…` : 'SENDER NOT CONFIGURED'}</span>
            <span className="if-meta-sep">·</span>
            <span style={{ color: 'var(--accent)' }}>{filtered.length} {filter.toUpperCase()}</span>
            {sentCount > 0 && (
              <>
                <span className="if-meta-sep">·</span>
                <span>{sentCount} SENT</span>
              </>
            )}
          </>
        ) : (
          <span style={{ color: 'var(--warning)' }}>NO ACTIVE EVENT — GO TO SETUP</span>
        )}
      </div>

      {err && <div className="if-status err mb-4">{err}</div>}

      {/* ── Pre-flight pane ───────────────────────────────────────────── */}
      {activePane === 'preflight' && (
        <>
          {/* Checklist */}
          <div className="if-section-label mb-2">PRE-FLIGHT CHECKS</div>
          <div className="if-card mb-4">
            {/* Sender */}
            <div className={`if-card-row${!ev?.contactEmail ? '' : ''}`}>
              <div className={`if-row-chip${ev?.contactEmail ? ' good' : ' warn'}`}>
                {ev?.contactEmail ? '✓' : '!'}
              </div>
              <div className="if-card-row-body">
                <div className="if-card-row-title">Sender configured</div>
                <div className="if-card-row-sub">
                  {ev?.contactEmail ? ev.contactEmail.toUpperCase() : 'CONTACT EMAIL NOT SET IN SETUP'}
                </div>
              </div>
            </div>

            {/* Template */}
            <div className="if-card-row">
              <div className={`if-row-chip${templateSaved ? ' good' : ' warn'}`}>
                {templateSaved ? '✓' : '!'}
              </div>
              <div className="if-card-row-body">
                <div className="if-card-row-title">Template saved</div>
                <div className="if-card-row-sub">
                  {templateSaved
                    ? `${(state.htmlBody.match(/\{\{\w+\}\}/g) || []).length} MERGE TOKENS DETECTED`
                    : 'NO BODY — GO TO COMPOSE'}
                </div>
              </div>
            </div>

            {/* Recipients */}
            <div className="if-card-row">
              <div className={`if-row-chip${!hasMissingEmail ? ' good' : ' warn'}`}>
                {!hasMissingEmail ? '✓' : '!'}
              </div>
              <div className="if-card-row-body">
                <div className="if-card-row-title">Recipients validated</div>
                <div className="if-card-row-sub">
                  {state.invitees.length} TOTAL
                  {hasMissingEmail ? ` · ${state.invitees.filter(i => !i.email).length} MISSING EMAIL` : ' · ALL HAVE EMAIL'}
                </div>
              </div>
            </div>

            {/* Filter */}
            <div className="if-card-row last no-action" style={{ cursor: 'default' }}>
              <div className="if-row-chip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 5h18M6 12h12M10 19h4"/>
                </svg>
              </div>
              <div className="if-card-row-body">
                <div className="if-card-row-title">Active filter</div>
                <div className="if-card-row-sub">{filter.toUpperCase()} · {filtered.length} WILL RECEIVE</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['pending', 'failed', 'all'] as Filter[]).map(f => (
                  <button
                    key={f}
                    className={`if-filter-chip${filter === f ? ' active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                    <span className="count"> {
                      f === 'all' ? state.invitees.length :
                      f === 'pending' ? pendingCount : failedCount
                    }</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Test Email Section */}
          <div className="if-section-label mb-2">PRE-FLIGHT TEST</div>
          <div className="if-card mb-4">
            <div style={{ padding: 'var(--rt-row-pad)' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input
                  type="email"
                  value={testEmail}
                  onChange={e => { setTestEmail(e.target.value); setTestSent(false); setTestApproved(false); }}
                  placeholder="test@example.com"
                  className="if-input"
                  style={{ flex: 1 }}
                />
                <button
                  className="if-btn"
                  onClick={sendTestEmail}
                  disabled={testSending || !testEmail.trim()}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {testSending ? 'SENDING…' : 'Send Test Email'}
                </button>
              </div>
              {testSent && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={testApproved}
                    onChange={e => setTestApproved(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
                  />
                  <span style={{ fontSize: 12, color: testApproved ? 'var(--text-base)' : 'var(--text-muted)' }}>
                    Confirm test email received
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Stat strip */}
          <div className="if-section-label mb-2">THIS EVENT</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div className="if-stat-chip">
              <div className="if-stat-chip-label">Pending</div>
              <div className="if-stat-chip-value" style={{ color: 'var(--text-secondary)' }}>{pendingCount}</div>
            </div>
            <div className="if-stat-chip">
              <div className="if-stat-chip-label">Sent</div>
              <div className="if-stat-chip-value" style={{ color: 'var(--success)' }}>{sentCount}</div>
            </div>
            <div className="if-stat-chip">
              <div className="if-stat-chip-label">Failed</div>
              <div className="if-stat-chip-value" style={{ color: 'var(--danger)' }}>{failedCount}</div>
            </div>
            <div className="if-stat-chip">
              <div className="if-stat-chip-label">Ready to send</div>
              <div className="if-stat-chip-value" style={{ color: 'var(--accent)' }}>{filtered.length}</div>
            </div>
          </div>

          {/* Progress bar (sending) */}
          {state.sending && (
            <div className="mb-5">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--rf-mono)', fontSize: 9, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.08em' }}>
                <span>SENDING IN PROGRESS</span>
                <span>{state.sendProgress.current} / {state.sendProgress.total} ({progress}%)</span>
              </div>
              <div className="if-progress-track">
                <div className="if-progress-fill" style={{ width: `${progress}%` }}/>
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            className="if-primary-btn"
            onClick={sendBulk}
            disabled={state.sending || filtered.length === 0 || !testSent || !testApproved}
          >
            {state.sending
              ? `SENDING… ${state.sendProgress.current}/${state.sendProgress.total}`
              : `SEND ${filtered.length} INVITATION${filtered.length !== 1 ? 'S' : ''} →`}
          </button>
          {(!testSent || !testApproved) && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
              Send a test email and confirm receipt to enable bulk send
            </div>
          )}
        </>
      )}

      {/* ── Log pane ──────────────────────────────────────────────────── */}
      {activePane === 'log' && (
        <>
          <div className="if-section-label mb-2">DELIVERY LOG</div>
          {state.sendLog.length === 0 ? (
            <div className="if-card">
              <div className="if-empty" style={{ padding: '32px 18px' }}>
                No sends yet
                <div className="if-empty-sub" style={{ marginTop: 6, marginBottom: 0 }}>
                  RUN A SEND TO SEE DELIVERY LOG
                </div>
              </div>
            </div>
          ) : (
            <div className="if-card" style={{ overflow: 'hidden' }}>
              <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                {state.sendLog.map((entry, i) => (
                  <div
                    key={entry.id}
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'baseline',
                      padding: 'var(--rt-row-pad)',
                      borderBottom: i < state.sendLog.length - 1 ? '1px solid var(--border)' : 'none',
                      fontFamily: 'var(--rf-mono)',
                      fontSize: 11,
                    }}
                  >
                    <span style={{
                      minWidth: 40, fontSize: 9, letterSpacing: '0.07em',
                      color: entry.status === 'sent' ? 'var(--success)' : 'var(--danger)',
                    }}>
                      {entry.status.toUpperCase()}
                    </span>
                    <span style={{ color: 'var(--text-base)', minWidth: 160 }}>{entry.name}</span>
                    <span style={{ color: 'var(--text-muted)', flex: 1, fontSize: 10 }}>{entry.email}</span>
                    {entry.error && (
                      <span style={{ fontSize: 9, color: 'var(--danger)' }}>{entry.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
