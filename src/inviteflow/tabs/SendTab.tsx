import { useState } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { getToken } from '../api/auth';
import { buildMimeRaw, personalize, sendEmail } from '../api/gmail';
import type { Invitee } from '../types';

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
      const personalizedHtml = personalize(state.htmlBody, inv, ev);
      const personalizedSubject = personalize(state.textSubject, inv, ev);
      const raw = buildMimeRaw(from, inv.email, personalizedSubject, personalizedHtml);

      try {
        await sendEmail(token, raw);
        dispatch({
          type: 'UPDATE_INVITEE',
          invitee: { ...inv, inviteStatus: 'sent', sentAt: new Date().toISOString() },
        });
        dispatch({
          type: 'LOG_SEND',
          entry: { id: crypto.randomUUID(), email: inv.email, name: `${inv.firstName} ${inv.lastName}`, status: 'sent', timestamp: new Date().toISOString() },
        });
      } catch (e) {
        dispatch({
          type: 'UPDATE_INVITEE',
          invitee: { ...inv, inviteStatus: 'failed' },
        });
        dispatch({
          type: 'LOG_SEND',
          entry: { id: crypto.randomUUID(), email: inv.email, name: `${inv.firstName} ${inv.lastName}`, status: 'failed', timestamp: new Date().toISOString(), error: String(e) },
        });
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

  const btn = (active = false, color = 'var(--text-secondary)', bg = 'transparent'): React.CSSProperties => ({
    border: `1px solid ${active ? 'var(--accent)' : color}`,
    background: active ? 'var(--accent)' : bg,
    color: active ? '#fff' : color,
    padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.05em',
  });

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ fontSize: 13, color: 'var(--text-heading)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 16 }}>SEND</div>

      {/* Filter + Send controls */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>FILTER</span>
        {(['all', 'pending', 'failed'] as Filter[]).map(f => (
          <button key={f} style={btn(filter === f)} onClick={() => setFilter(f)}>{f.toUpperCase()}</button>
        ))}
        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 8 }}>{filtered.length} invitees</span>
        <button
          style={{ ...btn(false, '#fff', 'var(--success-bg)'), border: '1px solid var(--success-bg)', marginLeft: 'auto' }}
          onClick={sendBulk}
          disabled={state.sending}
        >
          {state.sending ? 'Sending…' : `Send to ${filtered.length} →`}
        </button>
      </div>

      {err && <div style={{ fontSize: 11, color: 'var(--danger)', marginBottom: 12 }}>{err}</div>}

      {/* Progress bar */}
      {state.sending && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>
            {state.sendProgress.current} / {state.sendProgress.total} sent ({progress}%)
          </div>
          <div style={{ height: 4, background: 'var(--bg-subtle)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--gold)', borderRadius: 2, transition: 'width .3s' }} />
          </div>
        </div>
      )}

      {/* Send log */}
      {state.sendLog.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>SEND LOG</div>
          <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 6 }}>
            {state.sendLog.map(entry => (
              <div key={entry.id} style={{ display: 'flex', gap: 10, alignItems: 'baseline', padding: '6px 12px', borderBottom: '1px solid var(--bg-subtle)', fontSize: 11 }}>
                <span style={{ color: entry.status === 'sent' ? 'var(--success)' : 'var(--danger)', minWidth: 40, fontSize: 10, letterSpacing: '0.07em' }}>
                  {entry.status.toUpperCase()}
                </span>
                <span style={{ color: 'var(--text-base)', minWidth: 160 }}>{entry.name}</span>
                <span style={{ color: 'var(--text-muted)', flex: 1 }}>{entry.email}</span>
                {entry.error && <span style={{ color: 'var(--danger)', fontSize: 10 }}>{entry.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {state.sendLog.length === 0 && !state.sending && (
        <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: 40 }}>
          No sends yet. Choose a filter and click Send.
        </div>
      )}
    </div>
  );
}
