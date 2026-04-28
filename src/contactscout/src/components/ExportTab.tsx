import type { CSOfficial } from '../types';
import { bestEmail } from '../emailPatterns';

interface Props {
  officials: CSOfficial[];
  exportForInviteFlow: () => void;
  exportBackup: () => void;
  exportCSV: () => void;
  importBackup: () => void;
  clearAll: () => void;
}

interface ContactBreakdown {
  scheduler: number;
  direct: number;
  inferred: number;
  office: number;
  formOnly: number;
  noContact: number;
}

function getBreakdown(officials: CSOfficial[]): ContactBreakdown {
  const eligible = officials.filter(o => o.status !== 'left_office');
  return {
    scheduler: eligible.filter(o => !!o.schedulerEmail).length,
    direct:    eligible.filter(o => !o.schedulerEmail && !!o.directEmail && o.emailSource !== 'inferred').length,
    inferred:  eligible.filter(o => !o.schedulerEmail && o.emailSource === 'inferred' && !!o.directEmail).length,
    office:    eligible.filter(o => !o.schedulerEmail && !o.directEmail && !!o.officeEmail).length,
    formOnly:  eligible.filter(o => !bestEmail(o) && !!o.appearanceFormUrl).length,
    noContact: eligible.filter(o => !bestEmail(o) && !o.appearanceFormUrl).length,
  };
}

function BreakdownRow({ label, n, color, note }: { label: string; n: number; color: string; note?: string }) {
  if (n === 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: 9, color: 'var(--text-secondary)', width: 90, letterSpacing: '0.07em', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color, width: 28, textAlign: 'right', flexShrink: 0 }}>{n}</span>
      {note && <span style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.5 }}>{note}</span>}
    </div>
  );
}

export default function ExportTab({
  officials, exportForInviteFlow, exportBackup, exportCSV, importBackup, clearAll,
}: Props) {
  const bd = getBreakdown(officials);
  const readyCount = officials.filter(
    o => o.status !== 'left_office' && (o.schedulerEmail || o.directEmail || o.officeEmail),
  ).length;

  return (
    <div style={{ padding: '16px 20px', maxWidth: 600 }}>

      {/* Contact method breakdown */}
      {officials.length > 0 && (
        <div className="if-card" style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--text-heading)', fontWeight: 600, marginBottom: 8 }}>Contact Method Breakdown</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
            For each active official, the best available contact path is used when exporting.
            Priority: scheduler email → direct email → office email.
          </div>
          <BreakdownRow label="SCHEDULER"  n={bd.scheduler} color="#C8A84B" note="invitation goes to the official's scheduler — most effective for event requests" />
          <BreakdownRow label="DIRECT"     n={bd.direct}    color="#3fb950" note="official's own email address (scanned from web)" />
          <BreakdownRow label="INFERRED"   n={bd.inferred}  color="#58a6ff" note="email derived from name pattern (federal/NC state) — verify before sending" />
          <BreakdownRow label="OFFICE"     n={bd.office}    color="#8b949e" note="general office inbox" />
          <BreakdownRow label="FORM ONLY"  n={bd.formOnly}  color="#a371f7" note="appearance request form found — export note includes URL; manual step required" />
          <BreakdownRow label="NO CONTACT" n={bd.noContact} color="#f85149" note="no email or form found — verify manually or call the office" />
        </div>
      )}

      {/* InviteFlow export */}
      <div className="if-card" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: 'var(--text-heading)', fontWeight: 600, marginBottom: 4 }}>Export to InviteFlow</div>
        <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
          Downloads a JSON file for direct import into InviteFlow.
          Includes only active officials with at least one contact email.
          {officials.length > 0 && (
            <> <strong style={{ color: readyCount > 0 ? '#a371f7' : 'var(--danger)' }}>
              {readyCount} of {officials.filter(o => o.status !== 'left_office').length} active
            </strong> officials are eligible.</>
          )}
          {bd.inferred > 0 && (
            <> <span style={{ color: '#58a6ff' }}>{bd.inferred} use inferred emails</span> — confirm addresses before sending.</>
          )}
        </div>
        <button className="if-btn grn" onClick={exportForInviteFlow} disabled={readyCount === 0}>
          ⬡ Export {readyCount > 0 ? `${readyCount} invitees` : '(no eligible officials)'} → InviteFlow JSON
        </button>
      </div>

      {/* CSV */}
      <div className="if-card" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: 'var(--text-heading)', fontWeight: 600, marginBottom: 4 }}>Download CSV</div>
        <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
          All {officials.length} officials with full columns including scheduler name, scheduler email,
          appearance form URL, and email source — suitable for spreadsheet review.
        </div>
        <button className="if-btn" onClick={exportCSV} disabled={officials.length === 0}>↓ Download CSV</button>
      </div>

      {/* Backup / restore */}
      <div className="if-card" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: 'var(--text-heading)', fontWeight: 600, marginBottom: 4 }}>Backup & Restore</div>
        <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
          Save the full ContactScout state — officials, scan history, scheduler data — as JSON.
          Restore it later or transfer to another device.
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="if-btn" onClick={exportBackup} disabled={officials.length === 0}>↓ Save Backup</button>
          <button className="if-btn" onClick={importBackup}>↑ Restore from Backup</button>
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 20, paddingTop: 16 }}>
        <div className="if-section-label" style={{ marginBottom: 10 }}>DANGER ZONE</div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--danger-dark)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-heading)', fontWeight: 500, marginBottom: 4 }}>Clear all data</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
            Permanently removes all officials, scheduler contacts, scan history, and results.
            Cannot be undone — save a backup first.
          </div>
          <button className="if-btn del" onClick={clearAll}>✕ Clear All ContactScout Data</button>
        </div>
      </div>
    </div>
  );
}
