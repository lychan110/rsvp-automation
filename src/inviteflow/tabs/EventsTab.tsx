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
        <span className="if-page-title">EVENTS</span>
        <div className="flex gap-2">
          <button className="if-btn" onClick={loadEvents} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button className="if-btn pri" onClick={createEvent}>+ New Event</button>
        </div>
      </div>

      {err && <div className="if-status err mb-3">{err}</div>}

      {state.events.length === 0 && !loading && (
        <div className="if-empty">No events yet. Click &ldquo;+ New Event&rdquo; to create one.</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {state.events.map(ev => (
          <div
            key={ev.id}
            className="if-card cursor-pointer"
            style={state.activeEventId === ev.id
              ? { borderColor: 'var(--gold)', cursor: 'pointer' }
              : { cursor: 'pointer' }}
            onClick={() => {
              dispatch({ type: 'SET_ACTIVE_EVENT', id: ev.id });
              dispatch({ type: 'SET_TAB', tab: 'setup' });
            }}
          >
            <div
              className="text-sm font-bold mb-1"
              style={{ color: 'var(--text-heading)', fontFamily: 'monospace' }}
            >
              {ev.name || 'Unnamed Event'}
            </div>
            <div className="text-[10px] mb-3" style={{ color: 'var(--text-muted)' }}>
              {ev.date || 'No date'} · {ev.venue || 'No venue'}
            </div>
            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
              <button
                className="if-btn pri sm"
                onClick={() => {
                  dispatch({ type: 'SET_ACTIVE_EVENT', id: ev.id });
                  dispatch({ type: 'SET_TAB', tab: 'setup' });
                }}
              >
                {state.activeEventId === ev.id ? '✓ Active' : 'Activate'}
              </button>
              <button className="if-btn del sm" onClick={() => deleteEvent(ev.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
