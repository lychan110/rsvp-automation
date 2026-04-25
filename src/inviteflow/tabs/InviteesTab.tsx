import { useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { getToken } from '../api/auth';
import { sheetsGet, extractSheetId } from '../api/sheets';
import type { Invitee } from '../types';

function makeInvitee(partial: Partial<Invitee> = {}): Invitee {
  return {
    id: crypto.randomUUID(),
    firstName: '',
    lastName: '',
    title: '',
    category: '',
    email: '',
    rsvpLink: '',
    inviteStatus: 'pending',
    sentAt: '',
    rsvpStatus: 'No Response',
    rsvpDate: '',
    notes: '',
    ...partial,
  };
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'var(--text-muted)',
  sent: 'var(--success)',
  failed: 'var(--danger)',
};
const RSVP_COLORS: Record<string, string> = {
  'No Response': 'var(--text-muted)',
  Attending: 'var(--success)',
  Declined: 'var(--danger)',
};

export default function InviteesTab() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState<Invitee[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<Partial<Invitee>>({});
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const ev = state.events.find(e => e.id === state.activeEventId);

  async function importFromSheets() {
    if (!sheetsUrl.trim()) return;
    setImporting(true);
    setImportStatus('');
    try {
      const token = await getToken('spreadsheets');
      const id = extractSheetId(sheetsUrl);
      const rows = await sheetsGet(token, id, 'Sheet1!A:K');
      if (rows.length < 2) { setImportStatus('Sheet appears empty (need header + data rows).'); return; }
      const [header, ...data] = rows;
      const col = (name: string) => header.findIndex(h => h.trim().toLowerCase() === name.toLowerCase());
      const ci = { fn: col('FirstName'), ln: col('LastName'), title: col('Title'), cat: col('Category'), email: col('Email'), rsvp: col('RSVP_Link'), sent: col('InviteSent'), sentDate: col('InviteSentDate'), rsvpStatus: col('RSVP_Status'), rsvpDate: col('RSVP_Date'), notes: col('Notes') };

      const incoming = data.map(r => makeInvitee({
        firstName: r[ci.fn] ?? '',
        lastName: r[ci.ln] ?? '',
        title: r[ci.title] ?? '',
        category: r[ci.cat] ?? '',
        email: r[ci.email] ?? '',
        rsvpLink: r[ci.rsvp] ?? '',
        inviteStatus: r[ci.sent]?.toLowerCase() === 'true' ? 'sent' : 'pending',
        sentAt: r[ci.sentDate] ?? '',
        rsvpStatus: (['Attending', 'Declined'].includes(r[ci.rsvpStatus]) ? r[ci.rsvpStatus] : 'No Response') as Invitee['rsvpStatus'],
        rsvpDate: r[ci.rsvpDate] ?? '',
        notes: r[ci.notes] ?? '',
      })).filter(i => i.email);

      const merged = [...state.invitees];
      for (const inc of incoming) {
        const idx = merged.findIndex(m => m.email.toLowerCase() === inc.email.toLowerCase());
        if (idx >= 0) merged[idx] = { ...merged[idx], ...inc, id: merged[idx].id };
        else merged.push(inc);
      }
      dispatch({ type: 'SET_INVITEES', invitees: merged });
      setImportStatus(`Imported ${incoming.length} rows (${merged.length - state.invitees.length} new, rest merged).`);
    } catch (e) {
      setImportStatus('Error: ' + String(e));
    } finally {
      setImporting(false);
    }
  }

  function importJSON(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result as string) as Array<Record<string, string>>;
        const parsed = raw.map(r => {
          const full = r.name ?? `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim();
          const parts = full.split(' ');
          return makeInvitee({
            firstName: r.firstName ?? parts[0] ?? '',
            lastName: r.lastName ?? parts.slice(1).join(' ') ?? '',
            title: r.title ?? '',
            category: r.category ?? '',
            email: r.email ?? '',
          });
        }).filter(i => i.email);
        const merged = [...state.invitees];
        for (const inc of parsed) {
          const idx = merged.findIndex(m => m.email.toLowerCase() === inc.email.toLowerCase());
          if (idx < 0) merged.push(inc);
        }
        dispatch({ type: 'SET_INVITEES', invitees: merged });
        setImportStatus(`JSON import: ${parsed.length} rows.`);
      } catch (e) { setImportStatus('JSON parse error: ' + String(e)); }
    };
    reader.readAsText(file);
  }

  function exportCSV() {
    const header = 'FirstName,LastName,Title,Category,Email,RSVP_Link,InviteSent,InviteSentDate,RSVP_Status,RSVP_Date,Notes';
    const rows = state.invitees.map(i =>
      [i.firstName, i.lastName, i.title, i.category, i.email, i.rsvpLink, i.inviteStatus === 'sent' ? 'TRUE' : 'FALSE', i.sentAt, i.rsvpStatus, i.rsvpDate, i.notes]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `invitees-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function addManually() {
    if (!draft.email) return;
    dispatch({ type: 'ADD_INVITEE', invitee: makeInvitee(draft) });
    setDraft({});
    setShowAdd(false);
  }

  function buildRsvpLink(inv: Invitee) {
    if (!ev?.formUrl || !ev?.entryEmail) return '';
    return `${ev.formUrl}?${ev.entryEmail}=${encodeURIComponent(inv.email)}`;
  }

  function generateAllRsvpLinks() {
    const updated = state.invitees.map(i => ({ ...i, rsvpLink: i.rsvpLink || buildRsvpLink(i) }));
    dispatch({ type: 'SET_INVITEES', invitees: updated });
  }

  function bulkMarkSent() {
    const ids = new Set(selected.map(s => s.id));
    const updated = state.invitees.map(i => ids.has(i.id) ? { ...i, inviteStatus: 'sent' as const, sentAt: new Date().toISOString() } : i);
    dispatch({ type: 'SET_INVITEES', invitees: updated });
    setSelected([]);
  }

  function bulkReset() {
    const ids = new Set(selected.map(s => s.id));
    const updated = state.invitees.map(i => ids.has(i.id) ? { ...i, inviteStatus: 'pending' as const, sentAt: '' } : i);
    dispatch({ type: 'SET_INVITEES', invitees: updated });
    setSelected([]);
  }

  function bulkDelete() {
    if (!confirm(`Delete ${selected.length} invitee(s)?`)) return;
    dispatch({ type: 'DELETE_INVITEES', ids: selected.map(s => s.id) });
    setSelected([]);
  }

  const iStyle: React.CSSProperties = {
    background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-base)',
    padding: '5px 8px', borderRadius: 4, fontFamily: 'monospace', fontSize: 11, width: '100%',
  };
  const btn = (color = 'var(--text-secondary)', bg = 'transparent'): React.CSSProperties => ({
    border: `1px solid ${color}`, background: bg, color, padding: '4px 10px',
    borderRadius: 4, cursor: 'pointer', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.05em',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px 20px', gap: 12 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--text-heading)', fontWeight: 700, letterSpacing: '0.08em', marginRight: 8 }}>
          INVITEES <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>({state.invitees.length})</span>
        </span>
        <button style={btn('var(--success)', 'var(--success-bg)')} onClick={() => setShowAdd(true)}>+ Add</button>
        <button style={btn()} onClick={exportCSV}>Export CSV</button>
        <button style={btn()} onClick={generateAllRsvpLinks}>Gen RSVP Links</button>
        <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && importJSON(e.target.files[0])} />
        <button style={btn()} onClick={() => fileRef.current?.click()}>Import JSON</button>
      </div>

      {/* Sheets import row */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          style={{ ...iStyle, flex: 1, minWidth: 200 }}
          placeholder="Paste Google Sheets URL to import…"
          value={sheetsUrl}
          onChange={e => setSheetsUrl(e.target.value)}
        />
        <button style={btn('var(--blue)')} onClick={importFromSheets} disabled={importing}>
          {importing ? 'Importing…' : 'Import Sheets'}
        </button>
        {importStatus && <span style={{ fontSize: 10, color: importStatus.startsWith('Error') ? 'var(--danger)' : 'var(--success)' }}>{importStatus}</span>}
      </div>

      {/* Bulk actions — visible when rows selected */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px' }}>
          <span style={{ fontSize: 10, color: 'var(--gold)' }}>{selected.length} selected</span>
          <button style={btn('var(--success)')} onClick={bulkMarkSent}>Mark Sent</button>
          <button style={btn('var(--text-muted)')} onClick={bulkReset}>Reset Status</button>
          <button
            style={btn('var(--success)')}
            onClick={() => { dispatch({ type: 'SET_TAB', tab: 'send' }); }}
          >Send Selected →</button>
          <button style={btn('var(--danger)')} onClick={bulkDelete}>Delete</button>
        </div>
      )}

      {/* DataTable */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <DataTable
          value={state.invitees}
          selection={selected}
          onSelectionChange={e => setSelected(e.value as Invitee[])}
          selectionMode="multiple"
          dataKey="id"
          scrollable
          scrollHeight="flex"
          virtualScrollerOptions={{ itemSize: 36 }}
          size="small"
          filterDisplay="row"
          emptyMessage="No invitees yet."
          style={{ fontSize: 11 }}
          onRowEditComplete={e => dispatch({ type: 'UPDATE_INVITEE', invitee: e.newData as Invitee })}
          editMode="row"
        >
          <Column selectionMode="multiple" style={{ width: 40 }} />
          <Column field="firstName" header="First" sortable filter filterPlaceholder="Search" style={{ minWidth: 90 }} />
          <Column field="lastName" header="Last" sortable filter filterPlaceholder="Search" style={{ minWidth: 90 }} />
          <Column field="title" header="Title" sortable style={{ minWidth: 120 }} />
          <Column field="category" header="Category" sortable filter filterPlaceholder="Filter" style={{ minWidth: 100 }} />
          <Column field="email" header="Email" sortable style={{ minWidth: 160 }} />
          <Column
            field="inviteStatus"
            header="Status"
            sortable
            filter
            filterPlaceholder="Filter"
            style={{ minWidth: 90 }}
            body={(r: Invitee) => <span style={{ color: STATUS_COLORS[r.inviteStatus] ?? 'var(--text-muted)', fontSize: 10, letterSpacing: '0.07em' }}>{r.inviteStatus.toUpperCase()}</span>}
          />
          <Column field="sentAt" header="Sent At" sortable style={{ minWidth: 110 }} body={(r: Invitee) => r.sentAt ? new Date(r.sentAt).toLocaleDateString() : '—'} />
          <Column
            field="rsvpStatus"
            header="RSVP"
            sortable
            filter
            filterPlaceholder="Filter"
            style={{ minWidth: 110 }}
            body={(r: Invitee) => <span style={{ color: RSVP_COLORS[r.rsvpStatus] ?? 'var(--text-muted)', fontSize: 10 }}>{r.rsvpStatus}</span>}
          />
          <Column field="notes" header="Notes" style={{ minWidth: 140 }} editor={(opts) => (
            <input style={iStyle} value={opts.value} onChange={e => opts.editorCallback?.(e.target.value)} />
          )} />
          <Column rowEditor style={{ width: 70 }} />
        </DataTable>
      </div>

      {/* Add manually modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '24px 28px', width: 400 }}>
            <div style={{ fontSize: 12, color: 'var(--text-heading)', fontWeight: 700, marginBottom: 16 }}>ADD INVITEE</div>
            {(['firstName', 'lastName', 'title', 'category', 'email'] as const).map(k => (
              <div key={k} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{k.toUpperCase()}</label>
                <input style={iStyle} value={String(draft[k] ?? '')} onChange={e => setDraft(d => ({ ...d, [k]: e.target.value }))} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button style={btn('var(--success)', 'var(--success-bg)')} onClick={addManually}>Add</button>
              <button style={btn()} onClick={() => { setShowAdd(false); setDraft({}); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
