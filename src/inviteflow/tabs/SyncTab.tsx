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
      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="mb-5">
        <div className="if-eyebrow mb-1.5">SYNC</div>
        <div className="if-page-title">Google Sheets sync</div>
      </div>

      {status && (
        <div className={`if-status mb-4 ${status.startsWith('Error') ? 'err' : 'ok'}`}>{status}</div>
      )}

      {/* ── Action cards ──────────────────────────────────────────────── */}
      <div className="if-section-label mb-2">OPERATIONS</div>
      <div className="if-card mb-5">
        {/* Push row */}
        <div className="if-card-row" style={{ alignItems: 'flex-start', cursor: 'default' }} onClick={e => { if (!(e.target as HTMLElement).closest('button, a')) void 0; }}>
          <div className="if-row-chip" style={{ marginTop: 2 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20V8M7 13l5-5 5 5M4 21h16"/>
            </svg>
          </div>
          <div className="if-card-row-body">
            <div className="if-card-row-title">Push to master sheet</div>
            <div className="if-card-row-sub">
              CLEARS AND REWRITES ALL {state.invitees.length} INVITEES TO GOOGLE SHEETS
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {ev?.masterSheetUrl ? (
                <a
                  href={ev.masterSheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontFamily: 'var(--rf-mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '0.06em' }}
                >
                  OPEN SHEET ↗
                </a>
              ) : (
                <span style={{ fontFamily: 'var(--rf-mono)', fontSize: 9, color: 'var(--danger)', letterSpacing: '0.06em' }}>
                  MASTER SHEET URL NOT SET IN SETUP
                </span>
              )}
              <button className="if-btn grn sm" onClick={pushToSheets} disabled={pushing}>
                {pushing ? 'Pushing…' : `Push ${state.invitees.length} rows`}
              </button>
            </div>
          </div>
        </div>

        {/* Pull row */}
        <div className="if-card-row last" style={{ alignItems: 'flex-start', cursor: 'default' }}>
          <div className="if-row-chip" style={{ marginTop: 2 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v12M7 11l5 5 5-5M4 21h16"/>
            </svg>
          </div>
          <div className="if-card-row-body">
            <div className="if-card-row-title">Pull RSVP responses</div>
            <div className="if-card-row-sub">
              READS RSVP STATUS FROM RESPONSE SHEET AND UPDATES RECORDS
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {ev?.rsvpResponseUrl ? (
                <a
                  href={ev.rsvpResponseUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontFamily: 'var(--rf-mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '0.06em' }}
                >
                  OPEN SHEET ↗
                </a>
              ) : (
                <span style={{ fontFamily: 'var(--rf-mono)', fontSize: 9, color: 'var(--danger)', letterSpacing: '0.06em' }}>
                  RSVP RESPONSE URL NOT SET IN SETUP
                </span>
              )}
              <button className="if-btn ghost sm" onClick={pullRsvp} disabled={pulling}>
                {pulling ? 'Pulling…' : 'Pull RSVP responses'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── GAS script ────────────────────────────────────────────────── */}
      <div className="if-section-label mb-2">GAS RSVP INGEST TRIGGER</div>
      <p style={{ fontFamily: 'var(--rf-mono)', fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
        Paste into your Google Form&apos;s Apps Script. Add an{' '}
        <code style={{ background: 'var(--bg-subtle)', padding: '1px 5px', borderRadius: 3, fontSize: 9 }}>
          onFormSubmit
        </code>{' '}
        trigger and set the{' '}
        <code style={{ background: 'var(--bg-subtle)', padding: '1px 5px', borderRadius: 3, fontSize: 9 }}>
          MASTER_SHEET_URL
        </code>{' '}
        script property.
      </p>
      <div style={{ position: 'relative' }}>
        <pre className="if-code">{GAS_CODE}</pre>
        <button
          className="if-btn sm"
          style={{ position: 'absolute', top: 8, right: 8 }}
          onClick={() => {
            navigator.clipboard.writeText(GAS_CODE);
            setStatus('Copied GAS code to clipboard.');
          }}
        >
          Copy
        </button>
      </div>
    </div>
  );
}
