import { useState } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { getToken, setClientId } from '../api/auth';
import { updateAppDataFile } from '../api/drive';
import type { AppEvent } from '../types';

const FIELDS: Array<{ key: keyof AppEvent; label: string; type?: string; placeholder?: string }> = [
  { key: 'name',            label: 'Event Name',             placeholder: 'Greater Triangle Dragon Boat Festival' },
  { key: 'date',            label: 'Event Date',             type: 'date' },
  { key: 'venue',           label: 'Venue',                  placeholder: 'Jordan Lake State Recreation Area' },
  { key: 'orgName',         label: 'Organization Name',      placeholder: 'Asian Focus NC' },
  { key: 'contactName',     label: 'Contact Name',           placeholder: 'Lenya Chan' },
  { key: 'contactEmail',    label: 'Contact Email',          type: 'email', placeholder: 'contact@org.com' },
  { key: 'vipStart',        label: 'VIP Start Time',         placeholder: '10:00 AM' },
  { key: 'vipEnd',          label: 'VIP End Time',           placeholder: '12:00 PM' },
  { key: 'formUrl',         label: 'Google Form Base URL',   placeholder: 'https://docs.google.com/forms/d/e/…/viewform' },
  { key: 'entryEmail',      label: 'Form Email Entry ID',    placeholder: 'entry.123456789' },
  { key: 'rsvpResponseUrl', label: 'RSVP Response Sheet URL', placeholder: 'https://docs.google.com/spreadsheets/d/…' },
  { key: 'masterSheetUrl',  label: 'Master Sheet URL',       placeholder: 'https://docs.google.com/spreadsheets/d/…' },
  { key: 'imgEmblemUrl',    label: 'Emblem Image URL',       placeholder: 'https://drive.google.com/…' },
];

export default function SetupTab() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [clientIdDraft, setClientIdDraft] = useState(localStorage.getItem('gClientId') ?? '');

  const ev = state.events.find(e => e.id === state.activeEventId);

  if (!ev) {
    return (
      <div className="if-empty">
        No active event.{' '}
        <button
          style={{ color: 'var(--accent)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--rf-mono)', fontSize: 11 }}
          onClick={() => dispatch({ type: 'SET_TAB', tab: 'events' })}
        >
          Go to Events →
        </button>
      </div>
    );
  }

  function update(key: keyof AppEvent, value: string) {
    dispatch({ type: 'UPDATE_EVENT', event: { ...ev!, [key]: value } });
  }

  async function save() {
    setSaving(true);
    setStatus('');
    try {
      const token = await getToken('drive.appdata');
      await updateAppDataFile(token, ev!.id, ev);
      setClientId(clientIdDraft);
      dispatch({ type: 'UPDATE_EVENT', event: { ...ev!, googleClientId: clientIdDraft } });
      setStatus('Saved.');
    } catch (e) {
      setStatus('Error: ' + String(e));
    } finally {
      setSaving(false);
    }
  }

  async function authorize(scope: string) {
    setStatus('');
    try {
      await getToken(scope);
      setStatus(`${scope} authorized.`);
    } catch (e) {
      setStatus('Auth error: ' + String(e));
    }
  }

  return (
    <div className="p-5 max-w-[640px] mx-auto w-full">
      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="if-eyebrow mb-1.5">SETUP</div>
          <div className="if-page-title">Event details</div>
        </div>
        <button className="if-btn grn" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {status && (
        <div className={`if-status mb-4 ${status.startsWith('Error') ? 'err' : 'ok'}`}>{status}</div>
      )}

      {/* ── Google OAuth ───────────────────────────────────────────────── */}
      <div className="if-section-label mb-3" style={{ paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
        GOOGLE OAUTH
      </div>
      <div className="mb-3">
        <label className="if-label">Google Client ID</label>
        <input
          className="if-input"
          value={clientIdDraft}
          onChange={e => setClientIdDraft(e.target.value)}
          placeholder="123456789-abc.apps.googleusercontent.com"
        />
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        <button className="if-btn ghost" onClick={() => authorize('spreadsheets')}>Authorize Sheets</button>
        <button className="if-btn ghost" onClick={() => authorize('gmail.send')}>Authorize Gmail</button>
        <button className="if-btn ghost" onClick={() => authorize('drive.appdata')}>Authorize Drive</button>
      </div>

      {/* ── Event Details ──────────────────────────────────────────────── */}
      <div className="if-section-label mb-3" style={{ paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
        EVENT DETAILS
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {FIELDS.map(f => (
          <div key={f.key}>
            <label className="if-label">{f.label}</label>
            <input
              className="if-input"
              type={f.type ?? 'text'}
              value={String(ev[f.key] ?? '')}
              onChange={e => update(f.key, e.target.value)}
              placeholder={f.placeholder}
            />
          </div>
        ))}
      </div>

      {/* ── Save (bottom) ──────────────────────────────────────────────── */}
      <div className="mt-6">
        <button className="if-primary-btn" onClick={save} disabled={saving}>
          {saving ? 'SAVING…' : 'SAVE EVENT'}
        </button>
      </div>
    </div>
  );
}
