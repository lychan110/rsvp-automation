import type { CSOfficial } from '../types';

interface Props {
  officials: CSOfficial[];
  exportForInviteFlow: () => void;
  exportBackup: () => void;
  exportCSV: () => void;
  importBackup: () => void;
  clearAll: () => void;
}

export default function ExportTab({
  officials, exportForInviteFlow, exportBackup, exportCSV, importBackup, clearAll,
}: Props) {
  const readyCount = officials.filter(
    o => o.status !== 'left_office' && (o.officeEmail || o.directEmail),
  ).length;

  return (
    <div style={{ padding: '16px 20px', maxWidth: 600 }}>
      {/* InviteFlow export */}
      <div className="cs-card" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: '#f0f6fc', fontWeight: 600, marginBottom: 4 }}>Export to InviteFlow</div>
        <div style={{ fontSize: 10, color: '#8b949e', lineHeight: 1.7, marginBottom: 12 }}>
          Downloads a JSON file that InviteFlow imports directly. Includes only officials with an
          email address who are still in office.
          {officials.length > 0 && (
            <> <strong style={{ color: readyCount > 0 ? '#a371f7' : '#f85149' }}>
              {readyCount} of {officials.length}
            </strong> officials are eligible.</>
          )}
        </div>
        <button className="cs-btn grn" onClick={exportForInviteFlow} disabled={readyCount === 0}>
          ⬡ Export {readyCount > 0 ? `${readyCount} invitees` : '(no eligible officials)'} → InviteFlow JSON
        </button>
      </div>

      {/* CSV */}
      <div className="cs-card" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: '#f0f6fc', fontWeight: 600, marginBottom: 4 }}>Download CSV</div>
        <div style={{ fontSize: 10, color: '#8b949e', lineHeight: 1.7, marginBottom: 12 }}>
          All {officials.length} officials with full detail columns, suitable for spreadsheet analysis.
        </div>
        <button className="cs-btn" onClick={exportCSV} disabled={officials.length === 0}>↓ Download CSV</button>
      </div>

      {/* Backup / restore */}
      <div className="cs-card" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: '#f0f6fc', fontWeight: 600, marginBottom: 4 }}>Backup & Restore</div>
        <div style={{ fontSize: 10, color: '#8b949e', lineHeight: 1.7, marginBottom: 12 }}>
          Save the full ContactScout state (officials, scan history, metadata) as JSON.
          Restore it later or transfer to another device.
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="cs-btn" onClick={exportBackup} disabled={officials.length === 0}>↓ Save Backup</button>
          <button className="cs-btn" onClick={importBackup}>↑ Restore from Backup</button>
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ borderTop: '1px solid #161b22', marginTop: 20, paddingTop: 16 }}>
        <div className="cs-section-label" style={{ marginBottom: 10 }}>DANGER ZONE</div>
        <div style={{ background: '#0d1117', border: '1px solid #da3633', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: '#f0f6fc', fontWeight: 500, marginBottom: 4 }}>Clear all data</div>
          <div style={{ fontSize: 10, color: '#8b949e', lineHeight: 1.6, marginBottom: 12 }}>
            Permanently removes all officials, scan history, and results from this browser.
            Cannot be undone — save a backup first.
          </div>
          <button className="cs-btn del" onClick={clearAll}>✕ Clear All ContactScout Data</button>
        </div>
      </div>
    </div>
  );
}
