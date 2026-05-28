import { useState, useRef } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { saveInvitee, deleteInvitee, loadSyncLog, logSync, type SyncLogEntry } from '../api/storage';
import type { Invitee } from '../types';

interface ImportedRow {
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
  category?: string;
  notes?: string;
}

const CSV_COLUMNS = ['FirstName', 'LastName', 'Email', 'Title', 'Category', 'Notes'];

function parseCSV(text: string): ImportedRow[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: ImportedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const obj: Record<string, string> = {};
    header.forEach((h, idx) => { obj[h] = vals[idx] ?? ''; });
    rows.push({
      firstName: obj['FirstName'] ?? obj['firstName'] ?? '',
      lastName: obj['LastName'] ?? obj['lastName'] ?? '',
      email: obj['Email'] ?? obj['email'] ?? '',
      title: obj['Title'] ?? obj['title'] ?? '',
      category: obj['Category'] ?? obj['category'] ?? '',
      notes: obj['Notes'] ?? obj['notes'] ?? '',
    });
  }
  return rows;
}

function parseJSON(text: string): ImportedRow[] {
  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : data.invitees ?? data.rows ?? [];
  return arr.map((r: Record<string, unknown>) => ({
    firstName: String(r.firstName ?? r.FirstName ?? ''),
    lastName: String(r.lastName ?? r.LastName ?? ''),
    email: String(r.email ?? r.Email ?? ''),
    title: String(r.title ?? r.Title ?? ''),
    category: String(r.category ?? r.Category ?? ''),
    notes: String(r.notes ?? r.Notes ?? ''),
  }));
}

function computeDiff(existing: Invitee[], incoming: ImportedRow[]) {
  const existingMap = new Map(existing.map(e => [e.email.toLowerCase(), e]));
  let added = 0, updated = 0, deleted = 0;

  incoming.forEach(row => {
    if (!row.email) return;
    const existing = existingMap.get(row.email.toLowerCase());
    if (existing) {
      if (existing.firstName !== row.firstName || existing.lastName !== row.lastName ||
          existing.title !== row.title || existing.category !== row.category || existing.notes !== row.notes) {
        updated++;
      }
    } else {
      added++;
    }
  });

  const incomingEmails = new Set(incoming.map(r => r.email.toLowerCase()));
  existing.forEach(e => {
    if (!incomingEmails.has(e.email.toLowerCase())) deleted++;
  });

  return { added, updated, deleted };
}

function generateCSV(invitees: Invitee[]): string {
  const header = CSV_COLUMNS.join(',');
  const rows = invitees.map(i =>
    [i.firstName, i.lastName, i.email, i.title, i.category, i.notes]
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  return [header, ...rows].join('\n');
}

export default function SyncTab() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ added: number; updated: number; deleted: number } | null>(null);
  const [parsedRows, setParsedRows] = useState<ImportedRow[] | null>(null);
  const [history, setHistory] = useState<SyncLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  async function loadHistory() {
    const logs = await loadSyncLog();
    setHistory(logs);
  }
  loadHistory();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      let rows: ImportedRow[];
      if (file.name.endsWith('.json')) {
        try { rows = parseJSON(text); } catch { setStatus('Error: Invalid JSON file'); return; }
      } else {
        rows = parseCSV(text);
      }
      if (rows.length === 0) { setStatus('No data found in file'); return; }
      setParsedRows(rows);
      const diff = computeDiff(state.invitees, rows);
      setPreview(diff);
      setStatus(`Preview: ${diff.added} new, ${diff.updated} updated, ${diff.deleted} missing`);
    };
    reader.readAsText(file);
  }

  async function confirmImport() {
    if (!parsedRows) return;
    setLoading(true);
    setStatus('');
    try {
      const existingMap = new Map(state.invitees.map(e => [e.email.toLowerCase(), e]));
      let added = 0, updated = 0, deleted = 0;
      const incomingEmails = new Set(parsedRows.map(r => r.email.toLowerCase()));

      for (const row of parsedRows) {
        if (!row.email) continue;
        const existing = existingMap.get(row.email.toLowerCase());
        if (existing) {
          const updatedInv: Invitee = {
            ...existing,
            firstName: row.firstName || existing.firstName,
            lastName: row.lastName || existing.lastName,
            title: row.title || existing.title,
            category: row.category || existing.category,
            notes: row.notes || existing.notes,
          };
          if (JSON.stringify(existing) !== JSON.stringify(updatedInv)) {
            await saveInvitee(updatedInv);
            updated++;
          }
        } else {
          const newInv: Invitee = {
            id: crypto.randomUUID(),
            eventId: state.activeEventId ?? '',
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            title: row.title || '',
            category: row.category || '',
            notes: row.notes || '',
            rsvpLink: '',
            inviteStatus: 'pending',
            sentAt: '',
            rsvpStatus: 'No Response',
            rsvpDate: '',
          };
          await saveInvitee(newInv);
          added++;
        }
      }

      for (const existing of state.invitees) {
        if (!incomingEmails.has(existing.email.toLowerCase())) {
          await deleteInvitee(existing.id);
          deleted++;
        }
      }

      dispatch({ type: 'REFRESH_INVITEES' });

      await logSync({
        action: 'import',
        source: 'file',
        timestamp: new Date().toISOString(),
        details: `${added} added, ${updated} updated, ${deleted} removed`,
      });

      setPreview(null);
      setParsedRows(null);
      setStatus(`Imported: ${added} added, ${updated} updated, ${deleted} removed`);
      loadHistory();
    } catch (e) {
      setStatus('Import failed: ' + String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleExportCSV() {
    if (state.invitees.length === 0) {
      setStatus('No invitees to export');
      return;
    }
    const csv = generateCSV(state.invitees);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invitees-${state.activeEventId?.slice(0, 8) ?? 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    await logSync({
      action: 'export',
      source: 'csv',
      timestamp: new Date().toISOString(),
      details: `${state.invitees.length} invitees exported`,
    });

    setStatus(`Exported ${state.invitees.length} rows`);
    loadHistory();
  }

  function formatTime(ts: string) {
    try {
      const d = new Date(ts);
      return d.toLocaleString();
    } catch { return ts; }
  }

  return (
    <div className="p-5 max-w-[760px] mx-auto w-full">
      <div className="mb-5">
        <div className="if-eyebrow mb-1.5">DATA</div>
        <div className="if-page-title">Import / Export</div>
      </div>

      {status && (
        <div className={`if-status mb-4 ${status.startsWith('Error') ? 'err' : 'ok'}`}>{status}</div>
      )}

      {/* Import Section */}
      <div className="if-section-label mb-2">IMPORT</div>
      <div className="if-card mb-6">
        <div className="if-card-row" style={{ alignItems: 'flex-start', cursor: 'default' }}>
          <div className="if-row-chip">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
          </div>
          <div className="if-card-row-body">
            <div className="if-card-row-title">Import from file</div>
            <div className="if-card-row-sub">
              ACCEPT .CSV OR .JSON — REPLACES MISSING ENTRIES
            </div>
            <div style={{ marginTop: 10 }}>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <button
                className="if-btn ghost sm"
                onClick={() => fileRef.current?.click()}
              >
                Choose file
              </button>
            </div>
            {preview && (
              <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--rt-card-radius)', fontSize: 12 }}>
                <strong>Preview:</strong> {preview.added} new, {preview.updated} updated, {preview.deleted} missing
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <button className="if-btn pri sm" onClick={confirmImport} disabled={loading}>
                    {loading ? 'Importing…' : 'Confirm import'}
                  </button>
                  <button className="if-btn ghost sm" onClick={() => { setPreview(null); setParsedRows(null); setStatus(''); }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="if-section-label mb-2">EXPORT</div>
      <div className="if-card mb-6">
        <div className="if-card-row last" style={{ alignItems: 'flex-start', cursor: 'default' }}>
          <div className="if-row-chip">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
          </div>
          <div className="if-card-row-body">
            <div className="if-card-row-title">Download CSV</div>
            <div className="if-card-row-sub">
              {state.invitees.length} INVITEES FOR CURRENT EVENT
            </div>
            <div style={{ marginTop: 10 }}>
              <button className="if-btn ghost sm" onClick={handleExportCSV}>
                Download CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="if-section-label mb-2">HISTORY</div>
      <div className="if-card">
        {history.length === 0 ? (
          <div className="if-card-row last" style={{ cursor: 'default' }}>
            <div className="if-card-row-body">
              <div className="if-card-row-sub">No sync activity yet</div>
            </div>
          </div>
        ) : (
          history.map((entry, i) => (
            <div
              key={entry.id ?? i}
              className={`if-card-row${i === history.length - 1 ? ' last' : ''}`}
              style={{ cursor: 'default' }}
            >
              <div
                className="if-row-chip"
                style={{ background: entry.action === 'import' ? 'var(--accent)' : 'var(--success)', color: 'var(--bg)' }}
              >
                {entry.action === 'import' ? '↓' : '↑'}
              </div>
              <div className="if-card-row-body">
                <div className="if-card-row-title">
                  {entry.action.toUpperCase()} — {entry.source.toUpperCase()}
                </div>
                <div className="if-card-row-sub">{entry.details}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                  {formatTime(entry.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}