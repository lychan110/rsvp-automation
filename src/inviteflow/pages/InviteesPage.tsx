import { useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { useRouter } from '../state/RouterContext';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import type { Invitee } from '../types';

function makeInvitee(partial: Partial<Invitee> = {}): Invitee {
  return {
    id: crypto.randomUUID(),
    eventId: '',
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

const INVITE_COLOR: Record<string, string> = {
  pending: 'var(--text-muted)', sent: 'var(--success)', failed: 'var(--danger)',
};
const RSVP_COLOR: Record<string, string> = {
  'No Response': 'var(--text-muted)', Attending: 'var(--success)', Declined: 'var(--danger)',
};

export default function InviteesPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { navigate } = useRouter();
  const [selected, setSelected] = useState<Invitee[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<Partial<Invitee>>({});
  const [importStatus, setImportStatus] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const ev = state.events.find(e => e.id === state.activeEventId);

  function importJSON(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result as string) as Array<Record<string, string>>;
        const parsed = raw.map(r => {
          const full = r.name ?? `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim();
          const parts = full.split(' ');
          return makeInvitee({
            firstName: r.firstName ?? parts[0] ?? '', lastName: r.lastName ?? parts.slice(1).join(' ') ?? '',
            title: r.title ?? '', category: r.category ?? '', email: r.email ?? '',
          });
        }).filter(i => i.email);
        const merged = [...state.invitees];
        for (const inc of parsed) {
          if (!merged.find(m => m.email.toLowerCase() === inc.email.toLowerCase())) merged.push(inc);
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
      [i.firstName, i.lastName, i.title, i.category, i.email, i.rsvpLink,
       i.inviteStatus === 'sent' ? 'TRUE' : 'FALSE', i.sentAt, i.rsvpStatus, i.rsvpDate, i.notes]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `invitees-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function generateAllRsvpLinks() {
    const updated = state.invitees.map(i => ({
      ...i,
      rsvpLink: i.rsvpLink || (ev?.formUrl && ev?.entryEmail
        ? `${ev.formUrl}?${ev.entryEmail}=${encodeURIComponent(i.email)}`
        : ''),
    }));
    dispatch({ type: 'SET_INVITEES', invitees: updated });
  }

  function bulkMarkSent() {
    const ids = new Set(selected.map(s => s.id));
    const updated = state.invitees.map(i =>
      ids.has(i.id) ? { ...i, inviteStatus: 'sent' as const, sentAt: new Date().toISOString() } : i
    );
    dispatch({ type: 'SET_INVITEES', invitees: updated });
    setSelected([]);
  }

  function bulkReset() {
    const ids = new Set(selected.map(s => s.id));
    const updated = state.invitees.map(i =>
      ids.has(i.id) ? { ...i, inviteStatus: 'pending' as const, sentAt: '' } : i
    );
    dispatch({ type: 'SET_INVITEES', invitees: updated });
    setSelected([]);
  }

  function bulkDelete() {
    if (!confirm(`Delete ${selected.length} invitee(s)?`)) return;
    dispatch({ type: 'DELETE_INVITEES', ids: selected.map(s => s.id) });
    setSelected([]);
  }

  function addManually() {
    if (!draft.email) return;
    dispatch({ type: 'ADD_INVITEE', invitee: makeInvitee(draft) });
    setDraft({});
    setShowAdd(false);
  }

  const toolbarRight = (
    <div style={{ display: 'flex', gap: 6 }}>
      <button className="if-header-btn" onClick={() => setShowAdd(true)} aria-label="Add invitee">
        <Icon name="plus" size={13} />
      </button>
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-root)' }}>
      <PageHeader eyebrow="INVITEES" title={`Roster · ${state.invitees.length}`} showBack right={toolbarRight} />

      <div style={{ padding: '0 18px 10px', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
        <button className="if-btn sm" onClick={exportCSV}>Export CSV</button>
        <button className="if-btn sm" onClick={generateAllRsvpLinks}>Gen RSVP Links</button>
        <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && importJSON(e.target.files[0])} />
        <button className="if-btn sm" onClick={() => fileRef.current?.click()}>Import JSON</button>
      </div>

      {importStatus && (
        <div className={`if-status ${importStatus.startsWith('Error') ? 'err' : 'ok'}`} style={{ margin: '0 18px 8px' }}>
          {importStatus}
        </div>
      )}

      {selected.length > 0 && (
        <div className="if-bulk-bar" style={{ margin: '0 18px 8px', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--rf-mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.08em' }}>
            {selected.length} SELECTED
          </span>
          <button className="if-btn grn sm" onClick={bulkMarkSent}>Mark Sent</button>
          <button className="if-btn sm" onClick={bulkReset}>Reset</button>
          <button className="if-btn pri sm" onClick={() => navigate('send')}>Send Selected →</button>
          <button className="if-btn del sm" onClick={bulkDelete}>Delete</button>
        </div>
      )}

      <div style={{ flex: 1, overflow: 'hidden', margin: '0 18px 18px', borderRadius: 'var(--rt-card-radius)', border: '1px solid var(--border)' }}>
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
          emptyMessage="No invitees yet. Add one above or import from JSON."
          style={{ fontSize: 11 }}
          onRowEditComplete={e => dispatch({ type: 'UPDATE_INVITEE', invitee: e.newData as Invitee })}
          editMode="row"
        >
          <Column selectionMode="multiple" style={{ width: 40 }} />
          <Column field="firstName" header="First"    sortable filter filterPlaceholder="Search" style={{ minWidth: 90 }} />
          <Column field="lastName"  header="Last"     sortable filter filterPlaceholder="Search" style={{ minWidth: 90 }} />
          <Column field="title"     header="Title"    sortable style={{ minWidth: 120 }} />
          <Column field="category"  header="Category" sortable filter filterPlaceholder="Filter" style={{ minWidth: 100 }} />
          <Column field="email"     header="Email"    sortable style={{ minWidth: 160 }} />
          <Column
            field="inviteStatus" header="Status" sortable filter filterPlaceholder="Filter" style={{ minWidth: 90 }}
            body={(r: Invitee) => (
              <span style={{ color: INVITE_COLOR[r.inviteStatus] ?? 'var(--text-muted)', fontSize: 9, letterSpacing: '0.07em', fontFamily: 'var(--rf-mono)' }}>
                {r.inviteStatus.toUpperCase()}
              </span>
            )}
          />
          <Column
            field="sentAt" header="Sent At" sortable style={{ minWidth: 110 }}
            body={(r: Invitee) => r.sentAt ? new Date(r.sentAt).toLocaleDateString() : '—'}
          />
          <Column
            field="rsvpStatus" header="RSVP" sortable filter filterPlaceholder="Filter" style={{ minWidth: 110 }}
            body={(r: Invitee) => (
              <span style={{ color: RSVP_COLOR[r.rsvpStatus] ?? 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--rf-mono)' }}>
                {r.rsvpStatus}
              </span>
            )}
          />
          <Column
            field="notes" header="Notes" style={{ minWidth: 140 }}
            editor={(opts) => (
              <input className="if-input" style={{ fontSize: 11, minHeight: 28, padding: '4px 8px' }}
                value={opts.value} onChange={e => opts.editorCallback?.(e.target.value)} />
            )}
          />
          <Column rowEditor style={{ width: 70 }} />
        </DataTable>
      </div>

      {showAdd && (
        <div className="if-modal-backdrop">
          <div className="if-modal">
            <div className="if-modal-title">Add Invitee</div>
            <div className="if-modal-sub">Email is required.</div>
            {(['firstName', 'lastName', 'title', 'category', 'email'] as const).map(k => (
              <div key={k} style={{ marginBottom: 10 }}>
                <label className="if-label">{k}</label>
                <input className="if-input" value={String(draft[k] ?? '')}
                  onChange={e => setDraft(d => ({ ...d, [k]: e.target.value }))} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="if-btn grn" onClick={addManually} disabled={!draft.email}>Add</button>
              <button className="if-btn" onClick={() => { setShowAdd(false); setDraft({}); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}