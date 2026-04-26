import { useState } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { getToken } from '../api/auth';
import { buildMimeRaw, personalize, sendEmail } from '../api/gmail';

type Filter = 'all' | 'pending' | 'failed';

const BATCH_SIZE = 80;
const BATCH_DELAY_MS = 61000;

const FILTER_BTN = (active: boolean) =>
  `min-h-[36px] px-3 py-1 rounded border text-[10px] font-mono tracking-wide cursor-pointer ${
    active
      ? 'border-blue-600 bg-blue-600 text-white dark:border-[#1f6feb] dark:bg-[#1f6feb]'
      : 'border-gray-300 bg-transparent text-gray-600 hover:border-gray-500 dark:border-[#21262d] dark:text-[#8b949e] dark:hover:border-[#484f58]'
  }`;

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
      <div className="text-sm font-bold tracking-[0.08em] text-gray-900 mb-4 dark:text-[#f0f6fc]">SEND</div>

      {/* Filter + Send controls */}
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <span className="text-[10px] text-gray-500 tracking-widest font-mono uppercase dark:text-[#6e7681]">Filter</span>
        {(['all', 'pending', 'failed'] as Filter[]).map(f => (
          <button key={f} className={FILTER_BTN(filter === f)} onClick={() => setFilter(f)}>{f.toUpperCase()}</button>
        ))}
        <span className="text-[10px] text-gray-500 font-mono ml-2 dark:text-[#6e7681]">{filtered.length} invitees</span>
        <button
          className="min-h-[36px] px-3 py-1 rounded border border-green-600 bg-green-600 text-white text-[10px] font-mono tracking-wide cursor-pointer hover:bg-green-700 ml-auto disabled:opacity-50 disabled:cursor-not-allowed dark:border-[#238636] dark:bg-[#238636]"
          onClick={sendBulk}
          disabled={state.sending}
        >
          {state.sending ? 'Sending…' : `Send to ${filtered.length} →`}
        </button>
      </div>

      {err && <div className="text-xs text-red-600 mb-3 dark:text-[#f85149]">{err}</div>}

      {/* Progress bar */}
      {state.sending && (
        <div className="mb-4">
          <div className="text-[10px] text-gray-500 mb-1.5 dark:text-[#6e7681]">
            {state.sendProgress.current} / {state.sendProgress.total} sent ({progress}%)
          </div>
          <div className="h-1 bg-gray-200 rounded overflow-hidden dark:bg-[#161b22]">
            <div className="h-full bg-[#C8A84B] rounded transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Send log */}
      {state.sendLog.length > 0 && (
        <div>
          <div className="text-[10px] text-gray-500 tracking-widest font-mono uppercase mb-2 dark:text-[#6e7681]">SEND LOG</div>
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg dark:border-[#21262d]">
            {state.sendLog.map(entry => (
              <div key={entry.id} className="flex gap-2.5 items-baseline px-3 py-1.5 border-b border-gray-100 text-xs last:border-0 dark:border-[#161b22]">
                <span className={`min-w-[40px] text-[10px] tracking-[0.07em] font-mono ${entry.status === 'sent' ? 'text-green-600 dark:text-[#3fb950]' : 'text-red-600 dark:text-[#f85149]'}`}>
                  {entry.status.toUpperCase()}
                </span>
                <span className="text-gray-900 min-w-[160px] dark:text-[#c9d1d9]">{entry.name}</span>
                <span className="text-gray-500 flex-1 dark:text-[#6e7681]">{entry.email}</span>
                {entry.error && <span className="text-[10px] text-red-600 dark:text-[#f85149]">{entry.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {state.sendLog.length === 0 && !state.sending && (
        <div className="text-gray-500 text-xs text-center py-10 dark:text-[#6e7681]">
          No sends yet. Choose a filter and click Send.
        </div>
      )}
    </div>
  );
}
