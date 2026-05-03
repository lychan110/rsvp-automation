import { useRef, useState } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { useRouter } from '../state/RouterContext';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import { getToken, setClientId } from '../api/auth';

export default function SettingsPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { navigate } = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [clientIdDraft, setClientIdDraft] = useState(localStorage.getItem('gClientId') ?? '');
  const [status, setStatus] = useState('');

  async function authorize(scope: string) {
    setStatus('');
    try { await getToken(scope); setStatus(`${scope} authorized.`); }
    catch (e) { setStatus('Error: ' + String(e)); }
  }

  function saveClientId() {
    setClientId(clientIdDraft);
    setStatus('Client ID saved.');
  }

  function exportData() {
    const { sendLog: _sl, sending: _s, sendProgress: _sp, ...rest } = state;
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), ...rest }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `inviteflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importBackup(file: File) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.events) {
          dispatch({ type: 'LOAD_STATE', partial: parsed });
          setStatus('Backup imported.');
        } else {
          setStatus('Error: Invalid backup file (no events field).');
        }
      } catch { setStatus('Error: Invalid JSON.'); }
    };
    reader.readAsText(file);
  }

  const authRow = (icon: string, title: string, sub: string, scope: string, isLast = false) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: 'var(--rt-row-pad)',
      borderBottom: isLast ? 'none' : '1px solid var(--border)',
    }}>
      <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-root)', border: '1px solid var(--border)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={13} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="if-card-row-title">{title}</div>
        <div className="if-card-row-sub">{sub}</div>
      </div>
      <button className="if-btn ghost sm" onClick={() => authorize(scope)}>Authorize</button>
    </div>
  );

  const actionRow = (icon: string, title: string, sub: string, onClick: () => void, isLast = false) => (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: 'var(--rt-row-pad)', background: 'transparent', border: 'none',
        borderBottom: isLast ? 'none' : '1px solid var(--border)', textAlign: 'left', cursor: 'pointer',
      }}
    >
      <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-root)', border: '1px solid var(--border)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={13} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="if-card-row-title">{title}</div>
        <div className="if-card-row-sub">{sub}</div>
      </div>
      <Icon name="chevron-right" size={13} style={{ color: 'var(--text-muted)' }} />
    </button>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-root)' }}>
      <PageHeader eyebrow="SETTINGS" title="Account & defaults" showBack right={null} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 32px' }}>

        {status && (
          <div className={`if-status ${status.startsWith('Error') ? 'err' : 'ok'}`} style={{ margin: '8px 0' }}>
            {status}
          </div>
        )}

        <div className="if-section-label" style={{ padding: '12px 0 8px' }}>GOOGLE OAUTH</div>
        <div className="if-card" style={{ marginBottom: 12 }}>
          {authRow('mail',     'Gmail · Send',              'AUTHORIZE GMAIL SENDING',        'gmail.send')}
          {authRow('building', 'Google Sheets',             'AUTHORIZE SPREADSHEET ACCESS',   'spreadsheets')}
          {authRow('user',     'Google Drive AppData',      'AUTHORIZE EVENT STORAGE',        'drive.appdata', true)}
        </div>

        <div className="if-section-label" style={{ padding: '8px 0 8px' }}>CLIENT ID</div>
        <div className="if-card" style={{ padding: 14, marginBottom: 12 }}>
          <label className="if-label" style={{ display: 'block', marginBottom: 6 }}>GOOGLE CLIENT ID</label>
          <input
            className="if-input"
            style={{ width: '100%', marginBottom: 8 }}
            value={clientIdDraft}
            onChange={e => setClientIdDraft(e.target.value)}
            placeholder="123456789-abc.apps.googleusercontent.com"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--rf-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              REQUIRED FOR ALL GOOGLE API CALLS
            </span>
            <button className="if-btn grn sm" onClick={saveClientId}>Save</button>
          </div>
        </div>

        <div className="if-section-label" style={{ padding: '8px 0 8px' }}>DATA</div>
        <div className="if-card" style={{ marginBottom: 12 }}>
          {actionRow('download', 'Export all data',  'DOWNLOAD FULL BACKUP AS JSON',  exportData)}
          {actionRow('upload',   'Import backup',    'RESTORE FROM JSON FILE',        () => fileRef.current?.click(), true)}
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) importBackup(f); e.target.value = ''; }} />
        </div>

        <div className="if-section-label" style={{ padding: '8px 0 8px' }}>ABOUT</div>
        <div className="if-card" style={{ marginBottom: 12 }}>
          <button
            onClick={() => navigate('help')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: 'var(--rt-row-pad)', background: 'transparent', border: 'none',
              borderBottom: '1px solid var(--border)', textAlign: 'left', cursor: 'pointer',
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-root)', border: '1px solid var(--border)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="help-circle" size={13} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="if-card-row-title">Quick Start Guide</div>
              <div className="if-card-row-sub">FIRST-TIME SETUP WALKTHROUGH</div>
            </div>
            <Icon name="chevron-right" size={13} style={{ color: 'var(--text-muted)' }} />
          </button>
          <div style={{ padding: 14, display: 'flex', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              INVITEFLOW · v3.2 · by Lenya Chan
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
