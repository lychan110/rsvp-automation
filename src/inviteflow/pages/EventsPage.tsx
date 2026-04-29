import { useEffect, useState } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { useRouter } from '../state/RouterContext';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import { getToken } from '../api/auth';
import { listAppDataFiles, getAppDataFile, createAppDataFile, deleteAppDataFile } from '../api/drive';
import type { AppEvent } from '../types';

function blankEvent(id: string): AppEvent {
  return {
    id, name: 'New Event', date: '', venue: '', orgName: '',
    contactName: '', contactEmail: '', formUrl: '', rsvpResponseUrl: '',
    masterSheetUrl: '', entryEmail: '', imgEmblemUrl: '', vipStart: '', vipEnd: '',
    googleClientId: localStorage.getItem('gClientId') ?? '',
  };
}

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function EventsPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function loadEvents() {
    setLoading(true); setErr('');
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
    } catch (e) { setErr(String(e)); }
    finally { setLoading(false); }
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
      navigate('event-setup');
    } catch (e) { setErr(String(e)); }
  }

  async function deleteEvent(id: string) {
    setErr('');
    try {
      const token = await getToken('drive.appdata');
      await deleteAppDataFile(token, id);
      dispatch({ type: 'DELETE_EVENT', id });
    } catch (e) { setErr(String(e)); }
    finally { setConfirmDelete(null); }
  }

  function openEvent(id: string) {
    dispatch({ type: 'SET_ACTIVE_EVENT', id });
    navigate('event-home');
  }

  const upcoming = state.events.filter(e => !e.date || daysUntil(e.date) === null || daysUntil(e.date)! >= 0);
  const past = state.events.filter(e => e.date && daysUntil(e.date) !== null && daysUntil(e.date)! < 0);

  const headerRight = (
    <button className="if-header-btn" onClick={loadEvents} disabled={loading} aria-label="Refresh">
      <Icon name="sync" size={13} />
    </button>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-root)' }}>
      <PageHeader eyebrow="INVITEFLOW" title="Events" right={headerRight} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 32px' }}>
        {err && <div className="if-status err" style={{ marginBottom: 12 }}>{err}</div>}

        {state.events.length === 0 && !loading && (
          <div className="if-card" style={{ textAlign: 'center', padding: '48px 24px', marginTop: 8 }}>
            <div style={{ fontFamily: 'var(--rf-serif)', fontSize: 16, color: 'var(--text-secondary)', marginBottom: 8, fontStyle: 'italic' }}>
              No events yet
            </div>
            <div className="if-section-label" style={{ marginBottom: 16 }}>
              CREATE YOUR FIRST EVENT TO GET STARTED
            </div>
            <button className="if-btn pri" onClick={createEvent}>+ New Event</button>
          </div>
        )}

        {[{ label: 'UPCOMING', list: upcoming }, { label: 'PAST', list: past }].map(({ label, list }) =>
          list.length === 0 ? null : (
            <div key={label}>
              <div className="if-section-label" style={{ padding: '16px 0 8px' }}>
                {label} · {list.length}
              </div>
              <div className="if-card">
                {list.map((ev, i) => {
                  const days = daysUntil(ev.date);
                  const isActive = state.activeEventId === ev.id;
                  const isLast = i === list.length - 1;
                  const isConfirming = confirmDelete === ev.id;

                  return (
                    <div
                      key={ev.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: 'var(--rt-row-pad)',
                        borderBottom: isLast ? 'none' : '1px solid var(--border)',
                        cursor: 'default',
                      }}
                      onClick={e => {
                        if ((e.target as HTMLElement).closest('button, a')) return;
                        openEvent(ev.id);
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                        border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                        background: isActive ? 'var(--accent)' : 'transparent',
                        color: isActive ? 'var(--bg-root)' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--rf-mono)', fontSize: 9, letterSpacing: '0.06em',
                      }}>
                        {isActive ? <Icon name="check" size={11} /> : String(i + 1).padStart(2, '0')}
                      </div>

                      <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => openEvent(ev.id)}>
                        <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 12, color: 'var(--text-heading)', fontWeight: 500 }}>
                          {ev.name || 'Unnamed Event'}
                        </div>
                        <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em', marginTop: 2 }}>
                          {formatDate(ev.date) || 'No date set'}
                          {ev.venue ? ` · ${ev.venue}` : ''}
                          {days !== null && (
                            <span style={{ marginLeft: 8, color: days <= 7 ? 'var(--warning)' : 'var(--text-secondary)' }}>
                              {days === 0 ? 'TODAY' : days > 0 ? `${days}d away` : `${Math.abs(days)}d ago`}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        {isConfirming ? (
                          <>
                            <span style={{ fontFamily: 'var(--rf-mono)', fontSize: 9, color: 'var(--danger)' }}>DELETE?</span>
                            <button className="if-btn del sm" onClick={() => deleteEvent(ev.id)}>Yes</button>
                            <button className="if-btn sm" onClick={() => setConfirmDelete(null)}>No</button>
                          </>
                        ) : (
                          <>
                            {!isActive && (
                              <button className="if-btn sm" onClick={() => openEvent(ev.id)}>Open</button>
                            )}
                            <button className="if-btn del sm" onClick={() => setConfirmDelete(ev.id)}>
                              <Icon name="x" size={11} />
                            </button>
                          </>
                        )}
                      </div>

                      <Icon name="chevron-right" size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}

        {state.events.length > 0 && (
          <button
            className="if-btn ghost"
            style={{ width: '100%', marginTop: 8, minHeight: 42, justifyContent: 'center', borderRadius: 'var(--rt-card-radius)' }}
            onClick={createEvent}
          >
            <Icon name="plus" size={13} style={{ marginRight: 6 }} />
            New event
          </button>
        )}
      </div>

      {state.events.length === 0 && (
        <div style={{ padding: '0 18px 32px' }}>
          <button className="if-btn pri" style={{ width: '100%', minHeight: 46 }} onClick={createEvent}>
            <Icon name="plus" size={13} style={{ marginRight: 6 }} />
            NEW EVENT
          </button>
        </div>
      )}
    </div>
  );
}
