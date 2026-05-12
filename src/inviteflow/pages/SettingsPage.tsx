import { useRef, useState } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { useRouter } from '../state/RouterContext';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import { DEFAULT_ENDPOINT } from '../../scout/constants';

export default function SettingsPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { navigate } = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState('');
  const [resendKey, setResendKey] = useState(localStorage.getItem('resend_api_key') ?? '');
  const [llmApiKey, setLlmApiKey] = useState(sessionStorage.getItem('cs_api_key') ?? '');
  const [llmEndpoint, setLlmEndpoint] = useState(sessionStorage.getItem('cs_endpoint') ?? DEFAULT_ENDPOINT);
  const [serpApiKey, setSerpApiKey] = useState(sessionStorage.getItem('cs_search_key') ?? '');

  function saveResendConfig() {
    localStorage.setItem('resend_api_key', resendKey);
    setStatus('Resend API key saved.');
  }

  function saveLlmConfig() {
    sessionStorage.setItem('cs_api_key', llmApiKey);
    sessionStorage.setItem('cs_endpoint', llmEndpoint || DEFAULT_ENDPOINT);
    sessionStorage.setItem('cs_search_key', serpApiKey);
    setStatus('LLM & SerpAPI configuration saved.');
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

        <div className="if-section-label" style={{ padding: '12px 0 8px' }}>EMAIL (REQUIRED)</div>
        <div className="if-card" style={{ padding: 14, marginBottom: 12 }}>
          <label className="if-label" style={{ display: 'block', marginBottom: 6 }}>RESEND API KEY</label>
          <input
            className="if-input"
            style={{ width: '100%', marginBottom: 8 }}
            type="password"
            value={resendKey}
            onChange={e => setResendKey(e.target.value)}
            placeholder="re_xxxxxxxxxxxxx — get from resend.com"
          />
          <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 9, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.5 }}>
            Required to send invitation emails. Free tier: 3,000 emails/month.<br />
            <a href="https://resend.com" target="_blank" rel="noopener" style={{ color: 'var(--accent)' }}>Sign up at resend.com →</a>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--rf-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              REQUIRED FOR SENDING INVITES
            </span>
            <button className="if-btn grn sm" onClick={saveResendConfig}>Save</button>
          </div>
        </div>

        <div className="if-section-label" style={{ padding: '8px 0 8px' }}>DISCOVER (OPTIONAL)</div>
        <div className="if-card" style={{ padding: 14, marginBottom: 12 }}>
          <label className="if-label" style={{ display: 'block', marginBottom: 6 }}>OPENAI-COMPATIBLE API KEY</label>
          <input
            className="if-input"
            style={{ width: '100%', marginBottom: 8 }}
            type="password"
            value={llmApiKey}
            onChange={e => setLlmApiKey(e.target.value)}
            placeholder="sk-... (OpenAI, Anthropic, Ollama, etc.)"
          />

          <label className="if-label" style={{ display: 'block', marginBottom: 6 }}>API ENDPOINT</label>
          <input
            className="if-input"
            style={{ width: '100%', marginBottom: 8 }}
            value={llmEndpoint}
            onChange={e => setLlmEndpoint(e.target.value)}
            placeholder={DEFAULT_ENDPOINT}
          />
          <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 9, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.5 }}>
            Default: {DEFAULT_ENDPOINT}<br />
            Supports OpenAI, Anthropic, Ollama, or any OpenAI-compatible endpoint.
          </div>

          <label className="if-label" style={{ display: 'block', marginBottom: 6 }}>SERPAPI KEY</label>
          <input
            className="if-input"
            style={{ width: '100%', marginBottom: 8 }}
            type="password"
            value={serpApiKey}
            onChange={e => setSerpApiKey(e.target.value)}
            placeholder="Get from https://serpapi.com/"
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--rf-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              OPTIONAL — FOR OFFICIAL DISCOVERY
            </span>
            <button className="if-btn grn sm" onClick={saveLlmConfig}>Save</button>
          </div>
        </div>

        <div className="if-section-label" style={{ padding: '8px 0 8px' }}>DATA</div>
        <div className="if-card" style={{ marginBottom: 12 }}>
          {actionRow('download', 'Export all data',  'DOWNLOAD FULL BACKUP AS JSON',  exportData)}
          {actionRow('upload',   'Import backup',    'RESTORE FROM JSON FILE',        () => fileRef.current?.click(), true)}
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) importBackup(f); e.target.value = ''; }} />
        </div>

        <div className="if-section-label" style={{ padding: '8px 0 8px' }}>QUICK START</div>
        <div className="if-card" style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 10, color: 'var(--text-base)', lineHeight: 1.6 }}>
            <div style={{ marginBottom: 12, color: 'var(--text-heading)', fontWeight: 500 }}>1. SET UP EVENT</div>
            <div style={{ marginBottom: 12, color: 'var(--text-heading)', fontWeight: 500 }}>2. ADD INVITEES</div>
            <div style={{ marginBottom: 12, color: 'var(--text-heading)', fontWeight: 500 }}>3. COMPOSE EMAIL</div>
            <div style={{ marginBottom: 12, color: 'var(--text-heading)', fontWeight: 500 }}>4. SEND (TEST FIRST)</div>
            <div style={{ color: 'var(--text-heading)', fontWeight: 500 }}>5. TRACK RSVPS</div>
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <button className="if-btn ghost sm" style={{ width: '100%' }} onClick={() => navigate('help')}>
              Full Guide →
            </button>
          </div>
        </div>

        <div className="if-section-label" style={{ padding: '8px 0 8px' }}>ABOUT</div>
        <div className="if-card" style={{ marginBottom: 12 }}>
          <div style={{ padding: 14, display: 'flex', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              INVITEFLOW · v{__APP_VERSION__} · by Lenya Chan
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}