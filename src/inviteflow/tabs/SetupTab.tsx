import { useState } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { getToken, setClientId } from '../api/auth';
import { updateAppDataFile } from '../api/drive';
import type { AppEvent } from '../types';

const FIELDS: Array<{ key: keyof AppEvent; label: string; type?: string; placeholder?: string }> = [
  { key: 'name', label: 'Event Name', placeholder: 'Greater Triangle Dragon Boat Festival' },
  { key: 'date', label: 'Event Date', type: 'date' },
  { key: 'venue', label: 'Venue', placeholder: 'Jordan Lake State Recreation Area' },
  { key: 'orgName', label: 'Organization Name', placeholder: 'Asian Focus NC' },
  { key: 'contactName', label: 'Contact Name', placeholder: 'Lenya Chan' },
  { key: 'contactEmail', label: 'Contact Email', type: 'email', placeholder: 'contact@org.com' },
  { key: 'vipStart', label: 'VIP Start Time', placeholder: '10:00 AM' },
  { key: 'vipEnd', label: 'VIP End Time', placeholder: '12:00 PM' },
  { key: 'formUrl', label: 'Google Form Base URL', placeholder: 'https://docs.google.com/forms/d/e/…/viewform' },
  { key: 'entryEmail', label: 'Form Email Entry ID', placeholder: 'entry.123456789' },
  { key: 'rsvpResponseUrl', label: 'RSVP Response Sheet URL', placeholder: 'https://docs.google.com/spreadsheets/d/…' },
  { key: 'masterSheetUrl', label: 'Master Sheet URL', placeholder: 'https://docs.google.com/spreadsheets/d/…' },
  { key: 'imgEmblemUrl', label: 'Emblem Image URL', placeholder: 'https://drive.google.com/…' },
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
      <div style={{ padding: 40, color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' }}>
        No active event. Go to <button
          style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontFamily: 'monospace', fontSize: 12 }}
          onClick={() => dispatch({ type: 'SET_TAB', tab: 'events' })}
        >Events</button> to create or activate one.
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

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    color: 'var(--text-base)',
    padding: '6px 10px',
    borderRadius: 5,
    fontFamily: 'monospace',
    fontSize: 11,
    width: '100%',
    outline: 'none',
  };
  const labelStyle: React.CSSProperties = { fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 4, display: 'block' };
  const sectionStyle: React.CSSProperties = { fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em', marginTop: 20, marginBottom: 10, borderBottom: '1px solid var(--border)', paddingBottom: 6 };
  const btnStyle = (color: string): React.CSSProperties => ({
    border: `1px solid ${color}`,
    background: 'transparent',
    color,
    padding: '5px 12px',
    borderRadius: 4,
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: '0.05em',
  });

  return (
    <div style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: 'var(--text-heading)', fontWeight: 700, letterSpacing: '0.08em' }}>SETUP</span>
        <button
          style={{ ...btnStyle('var(--success)'), background: 'var(--success-bg)', color: '#fff', border: '1px solid var(--success-bg)' }}
          onClick={save}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {status && <div style={{ fontSize: 11, color: status.startsWith('Error') ? 'var(--danger)' : 'var(--success)', marginBottom: 12 }}>{status}</div>}

      <div style={sectionStyle}>GOOGLE OAUTH</div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Google Client ID</label>
        <input
          style={inputStyle}
          value={clientIdDraft}
          onChange={e => setClientIdDraft(e.target.value)}
          placeholder="123456789-abc.apps.googleusercontent.com"
        />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button style={btnStyle('var(--blue)')} onClick={() => authorize('spreadsheets')}>Authorize Sheets</button>
        <button style={btnStyle('var(--blue)')} onClick={() => authorize('gmail.send')}>Authorize Gmail</button>
        <button style={btnStyle('var(--blue)')} onClick={() => authorize('drive.appdata')}>Authorize Drive</button>
      </div>

      <div style={sectionStyle}>EVENT DETAILS</div>
      <div style={{ display: 'grid', gap: 12 }}>
        {FIELDS.map(f => (
          <div key={f.key}>
            <label style={labelStyle}>{f.label.toUpperCase()}</label>
            <input
              style={inputStyle}
              type={f.type ?? 'text'}
              value={String(ev[f.key] ?? '')}
              onChange={e => update(f.key, e.target.value)}
              placeholder={f.placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
