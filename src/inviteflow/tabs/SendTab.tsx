import { useState } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { getToken } from '../api/auth';
import { buildMimeRaw, personalize, sendEmail } from '../api/gmail';

type Filter = 'all' | 'pending' | 'failed';

const BATCH_SIZE = 80;
const BATCH_DELAY_MS = 61000;

export default function SendTab() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [filter, setFilter] = useState<Filter>('pending');
  const [err, setErr] = useState('');

  const ev = state.events.find(e => e.id === state.activeEventId);

  const filtered = state.invitees.filter(i => {
    if (filter === 'all') return true;
    if (filter === 'pending') return i.inviteStatus === 'pending';
    return i.inviteStatus === 'failed';
  });

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

  const progress = state.sendProgress.total > 0
    ? Math.round((state.sendProgress.current / state.sendProgress.total) * 100)
    : 0;

  return (
    <div className="p-5 max-w-[800px] mx-auto w-full">
      <div className="if-page-title mb-4">SEND</div>

      {/* Filter + Send controls */}
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <span className="if-section-label">Filter</span>
        {(['all', 'pending', 'failed'] as Filter[]).map(f => (
          <button
            key={f}
            className={`if-pill${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.toUpperCase()}
          </button>
        ))}
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace', marginLeft: 4 }}>
          {filtered.length} invitees
        </span>
        <button
          className="if-btn grn ml-auto"
          onClick={sendBulk}
          disabled={state.sending}
        >
          {state.sending ? 'Sending...' : `Send to ${filtered.length} →`}
        </button>
      </div>

      {err && <div className="if-status err mb-3">{err}</div>}

      {/* Progress bar */}
      {state.sending && (
        <div className="mb-4">
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: 6 }}>
            {state.sendProgress.current} / {state.sendProgress.total} sent ({progress}%)
          </div>
          <div style={{ height: 3, background: 'var(--bg-subtle)', borderRadius: 2, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: 'var(--gold)',
                borderRadius: 2,
                transition: 'width 0.3s',
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Send log */}
      {state.sendLog.length > 0 && (
        <div>
          <div className="if-section-label mb-2">SEND LOG</div>
          <div
            style={{
              maxHeight: 384,
              overflowY: 'auto',
              border: '1px solid var(--border)',
              borderRadius: 6,
            }}
          >
            {state.sendLog.map(entry => (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'baseline',
                  padding: '6px 12px',
                  borderBottom: '1px solid var(--bg-subtle)',
                  fontFamily: 'monospace',
                  fontSize: 11,
                }}
              >
                <span style={{ minWidth: 40, fontSize: 10, letterSpacing: '0.07em', color: entry.status === 'sent' ? 'var(--success)' : 'var(--danger)' }}>
                  {entry.status.toUpperCase()}
                </span>
                <span style={{ color: 'var(--text-base)', minWidth: 160 }}>{entry.name}</span>
                <span style={{ color: 'var(--text-muted)', flex: 1 }}>{entry.email}</span>
                {entry.error && <span style={{ fontSize: 10, color: 'var(--danger)' }}>{entry.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {state.sendLog.length === 0 && !state.sending && (
        <div className="if-empty">No sends yet. Choose a filter and click Send.</div>
      )}
    </div>
  );
}
