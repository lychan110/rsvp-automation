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

const INPUT = "w-full bg-white border border-gray-300 text-gray-900 text-xs font-mono px-2.5 py-1.5 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-[#0d1117] dark:border-[#21262d] dark:text-[#c9d1d9] dark:focus:border-[#58a6ff]";
const LABEL = "text-[10px] text-gray-500 tracking-widest font-mono uppercase mb-1 block dark:text-[#6e7681]";
const SECTION = "text-[10px] text-gray-500 tracking-widest font-mono uppercase mt-5 mb-2.5 border-b border-gray-200 pb-1.5 dark:text-[#6e7681] dark:border-[#21262d]";

export default function SetupTab() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [clientIdDraft, setClientIdDraft] = useState(localStorage.getItem('gClientId') ?? '');

  const ev = state.events.find(e => e.id === state.activeEventId);

  if (!ev) {
    return (
      <div className="p-10 text-gray-500 text-xs text-center dark:text-[#6e7681]">
        No active event. Go to{' '}
        <button
          className="text-blue-600 bg-transparent border-none cursor-pointer font-mono text-xs dark:text-[#58a6ff]"
          onClick={() => dispatch({ type: 'SET_TAB', tab: 'events' })}
        >
          Events
        </button>{' '}
        to create or activate one.
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
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold tracking-[0.08em] text-gray-900 dark:text-[#f0f6fc]">SETUP</span>
        <button
          onClick={save}
          disabled={saving}
          className="min-h-[44px] px-3 py-1 rounded border border-green-600 bg-green-600 text-white text-xs font-mono tracking-wide cursor-pointer hover:bg-green-700 dark:border-[#238636] dark:bg-[#238636] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {status && (
        <div className={`text-xs mb-3 ${status.startsWith('Error') ? 'text-red-600 dark:text-[#f85149]' : 'text-green-600 dark:text-[#3fb950]'}`}>
          {status}
        </div>
      )}

      <div className={SECTION}>GOOGLE OAUTH</div>
      <div className="mb-3">
        <label className={LABEL}>Google Client ID</label>
        <input
          className={INPUT}
          value={clientIdDraft}
          onChange={e => setClientIdDraft(e.target.value)}
          placeholder="123456789-abc.apps.googleusercontent.com"
        />
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          className="min-h-[44px] px-3 py-1 rounded border border-blue-400 bg-transparent text-blue-600 text-xs font-mono tracking-wide cursor-pointer hover:bg-blue-50 dark:border-[#58a6ff] dark:text-[#58a6ff] dark:hover:bg-[#0d1f3c]"
          onClick={() => authorize('spreadsheets')}
        >Authorize Sheets</button>
        <button
          className="min-h-[44px] px-3 py-1 rounded border border-blue-400 bg-transparent text-blue-600 text-xs font-mono tracking-wide cursor-pointer hover:bg-blue-50 dark:border-[#58a6ff] dark:text-[#58a6ff] dark:hover:bg-[#0d1f3c]"
          onClick={() => authorize('gmail.send')}
        >Authorize Gmail</button>
        <button
          className="min-h-[44px] px-3 py-1 rounded border border-blue-400 bg-transparent text-blue-600 text-xs font-mono tracking-wide cursor-pointer hover:bg-blue-50 dark:border-[#58a6ff] dark:text-[#58a6ff] dark:hover:bg-[#0d1f3c]"
          onClick={() => authorize('drive.appdata')}
        >Authorize Drive</button>
      </div>

      <div className={SECTION}>EVENT DETAILS</div>
      <div className="grid gap-3">
        {FIELDS.map(f => (
          <div key={f.key}>
            <label className={LABEL}>{f.label}</label>
            <input
              className={INPUT}
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
