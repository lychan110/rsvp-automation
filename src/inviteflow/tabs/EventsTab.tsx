import { useEffect, useState } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { loadEvents, saveEvent, deleteEvent as storageDeleteEvent } from '../api/storage';
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
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function loadEventsFromStorage() {
    setLoading(true);
    setErr('');
    try {
      const configs = await loadEvents();
      dispatch({ type: 'SET_EVENTS', events: configs });
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEventsFromStorage(); }, []);

  async function createEvent() {
    setErr('');
    try {
      const tempId = crypto.randomUUID();
      const ev = blankEvent(tempId);
      await saveEvent(ev);
      dispatch({ type: 'ADD_EVENT', event: ev });
      dispatch({ type: 'SET_ACTIVE_EVENT', id: ev.id });
      dispatch({ type: 'SET_TAB', tab: 'setup' });
    } catch (e) {
      setErr(String(e));
    }
  }

  async function deleteEvent(id: string) {
    setErr('');
    try {
      await storageDeleteEvent(id);
      dispatch({ type: 'DELETE_EVENT', id });
    } catch (e) {
      setErr(String(e));
    } finally {
      setConfirmDelete(null);
    }
  }

  function activateEvent(id: string) {
    dispatch({ type: 'SET_ACTIVE_EVENT', id });
    dispatch({ type: 'SET_TAB', tab: 'setup' });
  }

  return (
    <div className="p-5 max-w-[860px] mx-auto w-full">
      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="if-eyebrow mb-1.5">CONVENE · ROSTER</div>
          <div className="if-page-title">Events</div>
        </div>
        <div className="flex gap-2 items-center">
          <button className="if-btn ghost" onClick={loadEventsFromStorage} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
          <button className="if-btn pri" onClick={createEvent}>+ New Event</button>
        </div>
      </div>

      {err && <div className="if-status err mb-4">{err}</div>}

      {/* ── Empty state ────────────────────────────────────────────────── */}
      {state.events.length === 0 && !loading && (
        <div className="if-card padded" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div className="if-page-title" style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
            No events yet
          </div>
          <div className="if-section-label" style={{ marginBottom: 16 }}>
            CREATE YOUR FIRST EVENT TO GET STARTED
          </div>
          <button className="if-btn pri" onClick={createEvent}>+ New Event</button>
        </div>
      )}

      {/* ── Event list ─────────────────────────────────────────────────── */}
      {state.events.length > 0 && (
        <>
          <div className="if-section-label mb-2" style={{ padding: '0 0 6px' }}>
            EVENTS · {state.events.length}
          </div>
          <div className="if-card">
            {state.events.map((ev, i) => {
              const isActive = state.activeEventId === ev.id;
              const isLast = i === state.events.length - 1;
              const isConfirmingDelete = confirmDelete === ev.id;

              return (
                <div
                  key={ev.id}
                  className={`if-card-row${isLast ? ' last' : ''}`}
                  style={{ cursor: 'default' }}
                  onClick={e => {
                    if ((e.target as HTMLElement).closest('button')) return;
                    activateEvent(ev.id);
                  }}
                >
                  {/* Status chip */}
                  <div
                    className={`if-row-chip${isActive ? ' filled' : ''}`}
                    title={isActive ? 'Active event' : 'Activate'}
                  >
                    {isActive ? '✓' : String(i + 1).padStart(2, '0')}
                  </div>

                  {/* Title + meta */}
                  <div className="if-card-row-body" style={{ cursor: 'pointer' }} onClick={() => activateEvent(ev.id)}>
                    <div className="if-card-row-title">{ev.name || 'Unnamed Event'}</div>
                    <div className="if-card-row-sub">
                      {[ev.date, ev.venue].filter(Boolean).join(' · ') || 'No date or venue set'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                    {isConfirmingDelete ? (
                      <>
                        <span className="if-section-label" style={{ color: 'var(--danger)' }}>Delete?</span>
                        <button className="if-btn del sm" onClick={() => deleteEvent(ev.id)}>Yes</button>
                        <button className="if-btn sm" onClick={() => setConfirmDelete(null)}>No</button>
                      </>
                    ) : (
                      <>
                        {isActive && (
                          <span className="if-status-pill accent">ACTIVE</span>
                        )}
                        {!isActive && (
                          <button className="if-btn sm" onClick={() => activateEvent(ev.id)}>
                            Activate
                          </button>
                        )}
                        <button
                          className="if-btn del sm"
                          onClick={() => setConfirmDelete(ev.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>

                  {/* Chevron */}
                  <svg
                    width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ color: 'var(--text-muted)', flexShrink: 0 }}
                  >
                    <path d="M9 6l6 6-6 6"/>
                  </svg>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── New event CTA ──────────────────────────────────────────────── */}
      {state.events.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <button
            className="if-btn ghost"
            style={{ width: '100%', minHeight: 42, justifyContent: 'center', borderRadius: 'var(--rt-card-radius)' }}
            onClick={createEvent}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <span>New event</span>
          </button>
        </div>
      )}
    </div>
  );
}
