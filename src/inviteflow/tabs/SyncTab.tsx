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
      const header = MASTER_COLUMNS;
      const rows = state.invitees.map(i => [
        i.firstName, i.lastName, i.title, i.category, i.email, i.rsvpLink,
        i.inviteStatus === 'sent' ? 'TRUE' : 'FALSE',
        i.sentAt, i.rsvpStatus, i.rsvpDate, i.notes,
      ]);
      await sheetsUpdate(token, id, 'Sheet1!A1', [header, ...rows]);
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

  const btn = (color = '#8b949e', bg = 'transparent', disabled = false): React.CSSProperties => ({
    border: `1px solid ${color}`, background: bg, color, padding: '6px 14px',
    borderRadius: 4, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
    fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.05em',
  });

  const sectionLabel: React.CSSProperties = { fontSize: 10, color: '#6e7681', letterSpacing: '0.12em', marginBottom: 10, marginTop: 20 };

  return (
    <div style={{ padding: 24, maxWidth: 760, margin: '0 auto' }}>
      <div style={{ fontSize: 13, color: '#f0f6fc', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 16 }}>SYNC</div>

      {status && (
        <div style={{ fontSize: 11, color: status.startsWith('Error') ? '#f85149' : '#3fb950', marginBottom: 14 }}>{status}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 7, padding: '18px 20px' }}>
          <div style={sectionLabel}>PUSH TO MASTER SHEET</div>
          <div style={{ fontSize: 11, color: '#6e7681', marginBottom: 14, lineHeight: 1.7 }}>
            Clears and rewrites all {state.invitees.length} invitees to your master Google Sheet.
            {ev?.masterSheetUrl
              ? <><br /><a href={ev.masterSheetUrl} target="_blank" rel="noreferrer" style={{ color: '#58a6ff', fontSize: 10 }}>Open sheet ↗</a></>
              : <><br /><span style={{ color: '#f85149', fontSize: 10 }}>Master Sheet URL not set in Setup.</span></>
            }
          </div>
          <button style={btn('#3fb950', '#238636', pushing)} onClick={pushToSheets} disabled={pushing}>
            {pushing ? 'Pushing…' : `Push ${state.invitees.length} rows`}
          </button>
        </div>

        <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 7, padding: '18px 20px' }}>
          <div style={sectionLabel}>PULL RSVP RESPONSES</div>
          <div style={{ fontSize: 11, color: '#6e7681', marginBottom: 14, lineHeight: 1.7 }}>
            Reads RSVP statuses from your response sheet and updates invitee records.
            {ev?.rsvpResponseUrl
              ? <><br /><a href={ev.rsvpResponseUrl} target="_blank" rel="noreferrer" style={{ color: '#58a6ff', fontSize: 10 }}>Open sheet ↗</a></>
              : <><br /><span style={{ color: '#f85149', fontSize: 10 }}>RSVP Response Sheet URL not set in Setup.</span></>
            }
          </div>
          <button style={btn('#58a6ff', 'transparent', pulling)} onClick={pullRsvp} disabled={pulling}>
            {pulling ? 'Pulling…' : 'Pull RSVP Responses'}
          </button>
        </div>
      </div>

      <div style={sectionLabel}>GAS RSVP INGEST TRIGGER</div>
      <div style={{ fontSize: 11, color: '#6e7681', lineHeight: 1.8, marginBottom: 12 }}>
        Paste this script into your Google Form's Apps Script project. Add a trigger on <code style={{ background: '#161b22', padding: '1px 4px', borderRadius: 3 }}>onFormSubmit</code> (Form Submit event). Set script property <code style={{ background: '#161b22', padding: '1px 4px', borderRadius: 3 }}>MASTER_SHEET_URL</code> to your master sheet URL.
      </div>
      <div style={{ position: 'relative' }}>
        <pre style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, padding: '14px 16px', fontSize: 10, color: '#c9d1d9', overflowX: 'auto', lineHeight: 1.7 }}>
          {GAS_CODE}
        </pre>
        <button
          style={{ position: 'absolute', top: 8, right: 8, ...btn('#6e7681') }}
          onClick={() => { navigator.clipboard.writeText(GAS_CODE); setStatus('Copied GAS code to clipboard.'); }}
        >
          Copy
        </button>
      </div>
    </div>
  );
}
