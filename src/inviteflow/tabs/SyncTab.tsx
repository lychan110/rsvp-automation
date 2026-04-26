import { useState } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { getToken } from '../api/auth';
import { sheetsGet, sheetsUpdate, sheetsClear, extractSheetId } from '../api/sheets';
import type { Invitee } from '../types';

const MASTER_COLUMNS = ['FirstName', 'LastName', 'Title', 'Category', 'Email', 'RSVP_Link', 'InviteSent', 'InviteSentDate', 'RSVP_Status', 'RSVP_Date', 'Notes'];

const GAS_CODE = `// InviteFlow v3 — RSVP ingest trigger
// Deploy: Extensions → Apps Script → add trigger: onFormSubmit (Form Submit)
// Set script property MASTER_SHEET_URL via Project Settings → Script Properties

function onFormSubmit(e) {
  const props = PropertiesService.getScriptProperties();
  const sheetUrl = props.getProperty('MASTER_SHEET_URL');
  if (!sheetUrl) return;

  const ss = SpreadsheetApp.openByUrl(sheetUrl);
  const sheet = ss.getSheets()[0];
  const responses = e.response.getItemResponses();

  let email = '';
  let attending = '';
  for (const r of responses) {
    const title = r.getItem().getTitle().toLowerCase();
    if (title.includes('email')) email = r.getResponse().trim();
    if (title.includes('attend') || title.includes('rsvp')) attending = r.getResponse().trim();
  }
  if (!email) return;

  const data = sheet.getDataRange().getValues();
  const header = data[0];
  const emailCol = header.indexOf('Email');
  const statusCol = header.indexOf('RSVP_Status');
  const dateCol = header.indexOf('RSVP_Date');
  if (emailCol < 0) return;

  const today = new Date().toISOString().slice(0, 10);
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][emailCol]).toLowerCase() === email.toLowerCase()) {
      if (statusCol >= 0) sheet.getRange(i + 1, statusCol + 1).setValue(attending || 'Attending');
      if (dateCol >= 0) sheet.getRange(i + 1, dateCol + 1).setValue(today);
      break;
    }
  }
}`;

const SECTION = "text-[10px] text-gray-500 tracking-widest font-mono uppercase mt-5 mb-2.5 border-b border-gray-200 pb-1.5 dark:text-[#6e7681] dark:border-[#21262d]";

export default function SyncTab() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState('');
  const [pushing, setPushing] = useState(false);
  const [pulling, setPulling] = useState(false);

  const ev = state.events.find(e => e.id === state.activeEventId);

  async function pushToSheets() {
    if (!ev?.masterSheetUrl) { setStatus('Error: Master Sheet URL not set — go to Setup.'); return; }
    setPushing(true);
    setStatus('');
    try {
      const token = await getToken('spreadsheets');
      const id = extractSheetId(ev.masterSheetUrl);
      await sheetsClear(token, id, 'Sheet1!A:K');
      const rows = state.invitees.map(i => [
        i.firstName, i.lastName, i.title, i.category, i.email, i.rsvpLink,
        i.inviteStatus === 'sent' ? 'TRUE' : 'FALSE',
        i.sentAt, i.rsvpStatus, i.rsvpDate, i.notes,
      ]);
      await sheetsUpdate(token, id, 'Sheet1!A1', [MASTER_COLUMNS, ...rows]);
      setStatus(`Pushed ${rows.length} rows to master sheet.`);
    } catch (e) {
      setStatus('Error: ' + String(e));
    } finally {
      setPushing(false);
    }
  }

  async function pullRsvp() {
    if (!ev?.rsvpResponseUrl) { setStatus('Error: RSVP Response Sheet URL not set — go to Setup.'); return; }
    setPulling(true);
    setStatus('');
    try {
      const token = await getToken('spreadsheets');
      const id = extractSheetId(ev.rsvpResponseUrl);
      const rows = await sheetsGet(token, id, 'Sheet1!A:K');
      if (rows.length < 2) { setStatus('RSVP sheet appears empty.'); return; }
      const [header, ...data] = rows;
      const emailCol = header.findIndex(h => h.toLowerCase().includes('email'));
      const statusCol = header.findIndex(h => h.toLowerCase().includes('attend') || h.toLowerCase().includes('rsvp'));
      const dateCol = header.findIndex(h => h.toLowerCase().includes('date'));
      if (emailCol < 0) { setStatus('Cannot find Email column in RSVP sheet.'); return; }

      let updated = 0;
      const invitees = state.invitees.map(inv => {
        const match = data.find(r => r[emailCol]?.toLowerCase() === inv.email.toLowerCase());
        if (!match) return inv;
        const rawStatus = match[statusCol] ?? '';
        const rsvpStatus: Invitee['rsvpStatus'] = rawStatus.toLowerCase().includes('yes') || rawStatus.toLowerCase().includes('attend')
          ? 'Attending'
          : rawStatus.toLowerCase().includes('no') || rawStatus.toLowerCase().includes('declin')
            ? 'Declined'
            : 'No Response';
        const rsvpDate = dateCol >= 0 ? (match[dateCol] ?? '') : new Date().toISOString().slice(0, 10);
        updated++;
        return { ...inv, rsvpStatus, rsvpDate };
      });
      dispatch({ type: 'SET_INVITEES', invitees });
      setStatus(`Updated ${updated} RSVP responses.`);
    } catch (e) {
      setStatus('Error: ' + String(e));
    } finally {
      setPulling(false);
    }
  }

  return (
    <div className="p-5 max-w-[760px] mx-auto w-full">
      <div className="text-sm font-bold tracking-[0.08em] text-gray-900 mb-4 dark:text-[#f0f6fc]">SYNC</div>

      {status && (
        <div className={`text-xs mb-4 ${status.startsWith('Error') ? 'text-red-600 dark:text-[#f85149]' : 'text-green-600 dark:text-[#3fb950]'}`}>
          {status}
        </div>
      )}

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
        {/* Push card */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 dark:bg-[#0d1117] dark:border-[#21262d]">
          <div className={SECTION}>PUSH TO MASTER SHEET</div>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed dark:text-[#6e7681]">
            Clears and rewrites all {state.invitees.length} invitees to your master Google Sheet.
          </p>
          {ev?.masterSheetUrl
            ? <a href={ev.masterSheetUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 dark:text-[#58a6ff] mb-3 block">Open sheet ↗</a>
            : <span className="text-[10px] text-red-600 dark:text-[#f85149] mb-3 block">Master Sheet URL not set in Setup.</span>
          }
          <button
            className="min-h-[44px] px-3 py-1 rounded border border-green-600 bg-green-600 text-white text-xs font-mono tracking-wide cursor-pointer hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed dark:border-[#238636] dark:bg-[#238636]"
            onClick={pushToSheets}
            disabled={pushing}
          >
            {pushing ? 'Pushing…' : `Push ${state.invitees.length} rows`}
          </button>
        </div>

        {/* Pull card */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 dark:bg-[#0d1117] dark:border-[#21262d]">
          <div className={SECTION}>PULL RSVP RESPONSES</div>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed dark:text-[#6e7681]">
            Reads RSVP statuses from your response sheet and updates invitee records.
          </p>
          {ev?.rsvpResponseUrl
            ? <a href={ev.rsvpResponseUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 dark:text-[#58a6ff] mb-3 block">Open sheet ↗</a>
            : <span className="text-[10px] text-red-600 dark:text-[#f85149] mb-3 block">RSVP Response Sheet URL not set in Setup.</span>
          }
          <button
            className="min-h-[44px] px-3 py-1 rounded border border-blue-400 bg-transparent text-blue-600 text-xs font-mono tracking-wide cursor-pointer hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-[#58a6ff] dark:text-[#58a6ff] dark:hover:bg-[#0d1f3c]"
            onClick={pullRsvp}
            disabled={pulling}
          >
            {pulling ? 'Pulling…' : 'Pull RSVP Responses'}
          </button>
        </div>
      </div>

      {/* GAS section */}
      <div className={SECTION}>GAS RSVP INGEST TRIGGER</div>
      <p className="text-xs text-gray-500 leading-relaxed mb-3 dark:text-[#6e7681]">
        Paste this script into your Google Form's Apps Script project. Add a trigger on{' '}
        <code className="bg-gray-100 px-1 rounded text-[10px] dark:bg-[#161b22]">onFormSubmit</code>{' '}
        (Form Submit event). Set script property{' '}
        <code className="bg-gray-100 px-1 rounded text-[10px] dark:bg-[#161b22]">MASTER_SHEET_URL</code>{' '}
        to your master sheet URL.
      </p>
      <div className="relative">
        <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-[10px] text-gray-800 overflow-x-auto leading-relaxed dark:bg-[#0d1117] dark:border-[#21262d] dark:text-[#c9d1d9]">
          {GAS_CODE}
        </pre>
        <button
          className="absolute top-2 right-2 min-h-[32px] px-2.5 py-1 rounded border border-gray-300 bg-white text-gray-600 text-[10px] font-mono cursor-pointer hover:border-gray-500 dark:bg-[#161b22] dark:border-[#21262d] dark:text-[#8b949e]"
          onClick={() => { navigator.clipboard.writeText(GAS_CODE); setStatus('Copied GAS code to clipboard.'); }}
        >
          Copy
        </button>
      </div>
    </div>
  );
}
