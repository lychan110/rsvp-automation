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

function cardStyle(active: boolean): React.CSSProperties {
  return {
    background: '#0d1117',
    border: `1px solid ${active ? '#C8A84B' : '#21262d'}`,
    borderRadius: 7,
    padding: '16px 18px',
    cursor: 'pointer',
    transition: 'border-color .15s',
  };
}

function btnStyle(variant: 'pri' | 'del' | 'def'): React.CSSProperties {
  return {
    border: `1px solid ${variant === 'pri' ? '#1f6feb' : variant === 'del' ? '#da3633' : '#21262d'}`,
    background: variant === 'pri' ? '#1f6feb' : 'transparent',
    color: variant === 'pri' ? '#fff' : variant === 'del' ? '#f85149' : '#8b949e',
    padding: '4px 10px',
    borderRadius: 4,
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: '0.05em',
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
    <div style={{ padding: 24, maxWidth: 860, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: '#f0f6fc', fontWeight: 700, letterSpacing: '0.08em' }}>EVENTS</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btnStyle('def')} onClick={loadEvents} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
          <button style={btnStyle('pri')} onClick={createEvent}>+ New Event</button>
        </div>
      </div>

      {err && <div style={{ color: '#f85149', fontSize: 11, marginBottom: 12 }}>{err}</div>}

      {state.events.length === 0 && !loading && (
        <div style={{ color: '#6e7681', fontSize: 12, textAlign: 'center', padding: 40 }}>
          No events yet. Click "+ New Event" to create one.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
        {state.events.map(ev => (
          <div
            key={ev.id}
            style={cardStyle(state.activeEventId === ev.id)}
            onClick={() => { dispatch({ type: 'SET_ACTIVE_EVENT', id: ev.id }); dispatch({ type: 'SET_TAB', tab: 'setup' }); }}
          >
            <div style={{ fontSize: 13, color: '#f0f6fc', fontWeight: 700, marginBottom: 4 }}>{ev.name || 'Unnamed Event'}</div>
            <div style={{ fontSize: 10, color: '#6e7681', marginBottom: 12 }}>
              {ev.date || 'No date'} · {ev.venue || 'No venue'}
            </div>
            <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
              <button
                style={btnStyle('pri')}
                onClick={() => { dispatch({ type: 'SET_ACTIVE_EVENT', id: ev.id }); dispatch({ type: 'SET_TAB', tab: 'setup' }); }}
              >
                {state.activeEventId === ev.id ? '✓ Active' : 'Activate'}
              </button>
              <button style={btnStyle('del')} onClick={() => deleteEvent(ev.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
