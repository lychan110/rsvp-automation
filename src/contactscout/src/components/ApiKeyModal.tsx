import { useState } from 'react';

interface Props {
  geminiKey: string;
  osKey: string;
  onSave: (geminiKey: string, osKey: string) => void;
  onClose: () => void;
}

export default function ApiKeyModal({ geminiKey, osKey, onSave, onClose }: Props) {
  const [gDraft, setGDraft] = useState(geminiKey);
  const [osDraft, setOsDraft] = useState(osKey);
  const [gErr, setGErr] = useState(false);

  function save() {
    if (gDraft && !gDraft.startsWith('AIza')) { setGErr(true); return; }
    onSave(gDraft.trim(), osDraft.trim());
    onClose();
  }

  return (
    <div className="if-modal-backdrop" onClick={onClose}>
      <div className="if-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, width: '90%' }}>
        <div className="if-modal-title">API Keys</div>

        {/* Gemini */}
        <div style={{ marginBottom: 4 }}>
          <div className="if-label" style={{ marginBottom: 4 }}>Google AI Studio — Gemini</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>
            Required for all scans. Get a free key at{' '}
            <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: '#58a6ff' }}>
              aistudio.google.com
            </a>{' '}
            → Get API key → Create API key. Starts with <code>AIza</code>.
          </div>
          <input
            className={`if-input${gErr ? ' err' : ''}`}
            type="password"
            placeholder="AIza..."
            value={gDraft}
            onChange={e => { setGDraft(e.target.value); setGErr(false); }}
            onKeyDown={e => e.key === 'Enter' && save()}
            autoFocus
          />
          {gErr && <div style={{ fontSize: 10, color: 'var(--danger)', marginTop: 4 }}>Must start with AIza</div>}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border)', margin: '14px 0' }} />

        {/* Open States */}
        <div style={{ marginBottom: 4 }}>
          <div className="if-label" style={{ marginBottom: 4 }}>
            Open States — State Legislature{' '}
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>
            When set, State Senate and State House scans use Open States structured data instead of Gemini.
            Register at{' '}
            <a href="https://openstates.org/api/" target="_blank" rel="noreferrer" style={{ color: '#58a6ff' }}>
              openstates.org/api
            </a>{' '}
            for a free key.
          </div>
          <input
            className="if-input"
            type="password"
            placeholder="Open States API key..."
            value={osDraft}
            onChange={e => setOsDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save()}
          />
        </div>

        <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.6 }}>
          Both keys are stored in session only — never persisted to localStorage.
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
          <button className="if-btn" onClick={onClose}>Cancel</button>
          <button className="if-btn pri" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}
