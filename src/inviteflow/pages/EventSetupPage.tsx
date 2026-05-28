import { useState } from 'react';
import type { AppEvent } from '../types';
import { useAppState, useAppDispatch } from '../state/AppContext';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import { saveEvent } from '../api/storage';

const FIELDS_DETAILS: Array<{ key: keyof AppEvent; label: string; type?: string; placeholder?: string }> = [
  { key: 'name',     label: 'Event name',         placeholder: 'Annual Civic Leadership Reception' },
  { key: 'date',     label: 'Event date',         type: 'date' },
  { key: 'venue',    label: 'Venue',              placeholder: 'Veterans Memorial Hall' },
  { key: 'orgName',  label: 'Organization name',  placeholder: 'Civic Foundation' },
  { key: 'vipStart', label: 'VIP start time',     placeholder: '5:30 PM' },
  { key: 'vipEnd',   label: 'VIP end time',       placeholder: '6:30 PM' },
];

const FIELDS_CONTACT: Array<{ key: keyof AppEvent; label: string; type?: string; placeholder?: string }> = [
  { key: 'contactName',  label: 'Contact name',                     placeholder: 'Lenya Chan' },
  { key: 'contactEmail', label: 'Sender email (used as From address)', type: 'email', placeholder: 'contact@org.com' },
];

const FIELDS_LINKS: Array<{ key: keyof AppEvent; label: string; type?: string; placeholder?: string }> = [
  { key: 'formUrl',         label: 'RSVP form URL',                   placeholder: 'https://docs.google.com/forms/…' },
  { key: 'entryEmail',      label: 'Form email entry ID (entry.XXXXXXXX)', placeholder: 'entry.123456789' },
  { key: 'rsvpResponseUrl', label: 'RSVP response sheet URL',         placeholder: 'https://docs.google.com/spreadsheets/…' },
  { key: 'masterSheetUrl',  label: 'Master sheet URL',                placeholder: 'https://docs.google.com/spreadsheets/…' },
  { key: 'imgEmblemUrl',    label: 'Emblem image URL',                placeholder: 'https://drive.google.com/…' },
];

export default function EventSetupPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const ev = state.events.find(e => e.id === state.activeEventId) ?? null;

  const [clientIdDraft, setClientIdDraft] = useState(ev?.googleClientId ?? localStorage.getItem('gClientId') ?? '');
  const [draft, setDraft] = useState<AppEvent | null>(ev ? { ...ev } : null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  if (!ev || !draft) return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-root)' }}>
      <PageHeader eyebrow="EVENT SETUP" title="No event" showBack />
      <div className="if-empty">
        No event selected.
        <div className="if-empty-sub">GO BACK AND SELECT AN EVENT</div>
      </div>
    </div>
  );

  function setField(key: keyof AppEvent, value: string) {
    setDraft(d => d ? { ...d, [key]: value } : d);
  }

  async function save() {
    if (!draft) return;
    setSaving(true); setStatus('');
    try {
      const saved = { ...draft, googleClientId: clientIdDraft };
      localStorage.setItem('gClientId', clientIdDraft);
      await saveEvent(saved);
      dispatch({ type: 'UPDATE_EVENT', event: saved });
      dispatch({ type: 'SET_UNSAVED', unsaved: false });
      setStatus('Saved.');
    } catch (e) { setStatus('Error: ' + String(e)); }
    finally { setSaving(false); }
  }

  async function authorize(scope: string) {
    setStatus('OAuth is not available in this version.');
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-root)' }}>
      <div style={{ flexShrink: 0 }}>
        <PageHeader eyebrow="EVENT SETUP" title={ev.name || 'Event Setup'} showBack />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 100px' }}>

        <div className="if-section-label" style={{ padding: '12px 0 8px' }}>GOOGLE OAUTH</div>
        <div className="if-card" style={{ marginBottom: 12 }}>
          <div style={{ padding: 'var(--rt-row-pad)', borderBottom: '1px solid var(--border)' }}>
            <label className="if-label" style={{ display: 'block', marginBottom: 6 }}>GOOGLE CLIENT ID</label>
            <input
              className="if-input"
              style={{ width: '100%' }}
              value={clientIdDraft}
              onChange={e => setClientIdDraft(e.target.value)}
              placeholder="123456789-abc.apps.googleusercontent.com"
            />
          </div>
          <div style={{ padding: 'var(--rt-row-pad)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="if-btn ghost sm" onClick={() => authorize('spreadsheets')}>Authorize Sheets</button>
            <button className="if-btn ghost sm" onClick={() => authorize('gmail.send')}>Authorize Gmail</button>
            <button className="if-btn ghost sm" onClick={() => authorize('drive.appdata')}>Authorize Drive</button>
          </div>
        </div>

        <div className="if-section-label" style={{ padding: '8px 0 8px' }}>EVENT DETAILS</div>
        <div className="if-card" style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ display: 'grid', gap: 12 }}>
            {FIELDS_DETAILS.map(f => (
              <div key={f.key}>
                <label className="if-label" style={{ display: 'block', marginBottom: 5 }}>{f.label}</label>
                <input
                  className="if-input"
                  style={{ width: '100%' }}
                  type={f.type ?? 'text'}
                  placeholder={f.placeholder}
                  value={draft[f.key] as string}
                  onChange={e => setField(f.key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="if-section-label" style={{ padding: '8px 0 8px' }}>
          CONTACT & SENDER
          <span style={{ color: 'var(--warning)', fontSize: 10, marginLeft: 6 }}>REQUIRED FOR SENDING</span>
        </div>
        <div className="if-card" style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ display: 'grid', gap: 12 }}>
            {FIELDS_CONTACT.map(f => (
              <div key={f.key}>
                <label className="if-label" style={{ display: 'block', marginBottom: 5 }}>{f.label}</label>
                <input
                  className="if-input"
                  style={{ width: '100%' }}
                  type={f.type ?? 'text'}
                  placeholder={f.placeholder}
                  value={draft[f.key] as string}
                  onChange={e => setField(f.key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="if-section-label" style={{ padding: '8px 0 8px' }}>LINKS & CONFIGURATION</div>
        <div className="if-card" style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ display: 'grid', gap: 12 }}>
            {FIELDS_LINKS.map(f => (
              <div key={f.key}>
                <label className="if-label" style={{ display: 'block', marginBottom: 5 }}>{f.label}</label>
                <input
                  className="if-input"
                  style={{ width: '100%' }}
                  type={f.type ?? 'text'}
                  placeholder={f.placeholder}
                  value={draft[f.key] as string}
                  onChange={e => setField(f.key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {status && (
          <div className={`if-status ${status.startsWith('Error') || status.startsWith('Auth') ? 'err' : 'ok'}`} style={{ marginBottom: 12 }}>
            {status}
          </div>
        )}
      </div>

      <div style={{
        flexShrink: 0, padding: '12px 18px',
        borderTop: '1px solid var(--border)', background: 'var(--bg-root)',
      }}>
        <button className="if-btn pri" style={{ width: '100%' }} onClick={save} disabled={saving}>
          <Icon name="check" size={13} style={{ marginRight: 6 }} />
          {saving ? 'SAVING…' : 'Save event'}
        </button>
      </div>
    </div>
  );
}
