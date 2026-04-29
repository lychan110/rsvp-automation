import { useState } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { getToken } from '../api/auth';
import { sheetsGet, sheetsUpdate, sheetsClear, extractSheetId } from '../api/sheets';
import type { Invitee } from '../types';

const MASTER_COLUMNS = ['FirstName', 'LastName', 'Title', 'Category', 'Email', 'RSVP_Link', 'InviteSent', 'InviteSentDate', 'RSVP_Status', 'RSVP_Date', 'Notes'];

const GAS_CODE = `// InviteFlow v4 — RSVP ingest trigger
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
      const emailCol  = header.findIndex(h => h.toLowerCase().includes('email'));
      const statusCol = header.findIndex(h => h.toLowerCase().includes('attend') || h.toLowerCase().includes('rsvp'));
      const dateCol   = header.findIndex(h => h.toLowerCase().includes('date'));
      if (emailCol < 0) { setStatus('Cannot find Email column in RSVP sheet.'); return; }

      let updated = 0;
      const invitees = state.invitees.map(inv => {
        const match = data.find(r => r[emailCol]?.toLowerCase() === inv.email.toLowerCase());
        if (!match) return inv;
        const rawStatus = match[statusCol] ?? '';
        const rsvpStatus: Invitee['rsvpStatus'] =
          rawStatus.toLowerCase().includes('yes') || rawStatus.toLowerCase().includes('attend')
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
      <div className="if-page-title mb-4">SYNC</div>

      {status && (
        <div className={`if-status mb-4 ${status.startsWith('Error') ? 'err' : 'ok'}`}>{status}</div>
      )}

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
        {/* Push card */}
        <div className="if-card">
          <div className="if-section-label mb-2.5 pb-1.5 border-b" style={{ borderColor: 'var(--border)' }}>
            PUSH TO MASTER SHEET
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 12, fontFamily: 'monospace' }}>
            Clears and rewrites all {state.invitees.length} invitees to your master Google Sheet.
          </p>
          {ev?.masterSheetUrl
            ? <a href={ev.masterSheetUrl} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: 'var(--blue)', display: 'block', marginBottom: 10 }}>Open sheet &uarr;</a>
            : <span style={{ fontSize: 10, color: 'var(--danger)', display: 'block', marginBottom: 10 }}>Master Sheet URL not set in Setup.</span>
          }
          <button className="if-btn grn" onClick={pushToSheets} disabled={pushing}>
            {pushing ? 'Pushing...' : `Push ${state.invitees.length} rows`}
          </button>
        </div>

        {/* Pull card */}
        <div className="if-card">
          <div className="if-section-label mb-2.5 pb-1.5 border-b" style={{ borderColor: 'var(--border)' }}>
            PULL RSVP RESPONSES
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 12, fontFamily: 'monospace' }}>
            Reads RSVP statuses from your response sheet and updates invitee records.
          </p>
          {ev?.rsvpResponseUrl
            ? <a href={ev.rsvpResponseUrl} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: 'var(--blue)', display: 'block', marginBottom: 10 }}>Open sheet &uarr;</a>
            : <span style={{ fontSize: 10, color: 'var(--danger)', display: 'block', marginBottom: 10 }}>RSVP Response Sheet URL not set in Setup.</span>
          }
          <button className="if-btn ghost" onClick={pullRsvp} disabled={pulling}>
            {pulling ? 'Pulling...' : 'Pull RSVP Responses'}
          </button>
        </div>
      </div>

      {/* GAS section */}
      <div className="if-section-label mb-2.5 pb-1.5 border-b" style={{ borderColor: 'var(--border)' }}>
        GAS RSVP INGEST TRIGGER
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 10, fontFamily: 'monospace' }}>
        Paste this script into your Google Form&apos;s Apps Script project. Add a trigger on{' '}
        <code style={{ background: 'var(--bg-subtle)', padding: '1px 4px', borderRadius: 3, fontSize: 10 }}>onFormSubmit</code>{' '}
        (Form Submit event). Set script property{' '}
        <code style={{ background: 'var(--bg-subtle)', padding: '1px 4px', borderRadius: 3, fontSize: 10 }}>MASTER_SHEET_URL</code>{' '}
        to your master sheet URL.
      </p>
      <div style={{ position: 'relative' }}>
        <pre className="if-code">{GAS_CODE}</pre>
        <button
          className="if-btn sm"
          style={{ position: 'absolute', top: 8, right: 8 }}
          onClick={() => { navigator.clipboard.writeText(GAS_CODE); setStatus('Copied GAS code to clipboard.'); }}
        >
          Copy
        </button>
      </div>
    </div>
  );
}
