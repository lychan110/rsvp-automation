import { useEffect, useState } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { getToken } from '../api/auth';
import { listAppDataFiles, getAppDataFile, createAppDataFile, deleteAppDataFile } from '../api/drive';
import type { AppEvent } from '../types';

function blankEvent(id: string): AppEvent {
  return {
    id,
    name: 'New Event',
    date: '',
    venue: '',
    orgName: '',
    contactName: '',
    contactEmail: '',
    formUrl: '',
    rsvpResponseUrl: '',
    masterSheetUrl: '',
    entryEmail: '',
    imgEmblemUrl: '',
    vipStart: '',
    vipEnd: '',
    googleClientId: localStorage.getItem('gClientId') ?? '',
  };
}

export default function EventsTab() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function loadEvents() {
    setLoading(true);
    setErr('');
    try {
      const token = await getToken('drive.appdata');
      const files = await listAppDataFiles(token);
      const configs = await Promise.all(
        files
          .filter(f => f.name.endsWith('.json'))
          .map(async f => {
            const data = await getAppDataFile(token, f.id) as AppEvent;
            return { ...data, id: f.id };
          })
      );
      dispatch({ type: 'SET_EVENTS', events: configs });
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEvents(); }, []);

  async function createEvent() {
    setErr('');
    try {
      const token = await getToken('drive.appdata');
      const tempId = crypto.randomUUID();
      const ev = blankEvent(tempId);
      const realId = await createAppDataFile(token, tempId + '.json', ev);
      ev.id = realId;
      dispatch({ type: 'ADD_EVENT', event: ev });
      dispatch({ type: 'SET_ACTIVE_EVENT', id: realId });
      dispatch({ type: 'SET_TAB', tab: 'setup' });
    } catch (e) {
      setErr(String(e));
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    setErr('');
    try {
      const token = await getToken('drive.appdata');
      await deleteAppDataFile(token, id);
      dispatch({ type: 'DELETE_EVENT', id });
    } catch (e) {
      setErr(String(e));
    }
  }

  return (
    <div className="p-5 max-w-[860px] mx-auto w-full">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-bold tracking-[0.08em] text-gray-900 dark:text-[#f0f6fc]">EVENTS</span>
        <div className="flex gap-2">
          <button
            onClick={loadEvents}
            disabled={loading}
            className="min-h-[44px] px-3 py-1 rounded border border-gray-300 bg-transparent text-gray-700 text-xs font-mono tracking-wide cursor-pointer hover:bg-gray-100 dark:border-[#21262d] dark:text-[#8b949e] dark:hover:bg-[#161b22] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
          <button
            onClick={createEvent}
            className="min-h-[44px] px-3 py-1 rounded border border-blue-600 bg-blue-600 text-white text-xs font-mono tracking-wide cursor-pointer hover:bg-blue-700 dark:border-[#1f6feb] dark:bg-[#1f6feb]"
          >
            + New Event
          </button>
        </div>
      </div>

      {err && <div className="text-xs text-red-600 mb-3 dark:text-[#f85149]">{err}</div>}

      {state.events.length === 0 && !loading && (
        <div className="text-gray-500 text-xs text-center py-10 dark:text-[#6e7681]">
          No events yet. Click &ldquo;+ New Event&rdquo; to create one.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {state.events.map(ev => (
          <div
            key={ev.id}
            className={[
              'bg-white border rounded-lg p-4 cursor-pointer transition-colors dark:bg-[#0d1117]',
              state.activeEventId === ev.id
                ? 'border-[#C8A84B]'
                : 'border-gray-200 hover:border-gray-400 dark:border-[#21262d] dark:hover:border-[#484f58]',
            ].join(' ')}
            onClick={() => { dispatch({ type: 'SET_ACTIVE_EVENT', id: ev.id }); dispatch({ type: 'SET_TAB', tab: 'setup' }); }}
          >
            <div className="text-sm font-bold text-gray-900 mb-1 dark:text-[#f0f6fc]">{ev.name || 'Unnamed Event'}</div>
            <div className="text-[10px] text-gray-500 mb-3 dark:text-[#6e7681]">
              {ev.date || 'No date'} · {ev.venue || 'No venue'}
            </div>
            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => { dispatch({ type: 'SET_ACTIVE_EVENT', id: ev.id }); dispatch({ type: 'SET_TAB', tab: 'setup' }); }}
                className="min-h-[44px] px-3 py-1 rounded border border-blue-600 bg-blue-600 text-white text-xs font-mono tracking-wide cursor-pointer hover:bg-blue-700 dark:border-[#1f6feb] dark:bg-[#1f6feb]"
              >
                {state.activeEventId === ev.id ? '✓ Active' : 'Activate'}
              </button>
              <button
                onClick={() => deleteEvent(ev.id)}
                className="min-h-[44px] px-3 py-1 rounded border border-red-500 bg-transparent text-red-600 text-xs font-mono tracking-wide cursor-pointer hover:bg-red-50 dark:border-[#f85149] dark:text-[#f85149] dark:hover:bg-[#2d0f0e]"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
