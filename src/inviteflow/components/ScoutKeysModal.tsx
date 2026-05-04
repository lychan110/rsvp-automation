import { useState } from 'react';
import { DEFAULT_ENDPOINT } from '../../contactscout/src/constants';

interface Props {
  apiKey: string;
  endpoint: string;
  searchKey: string;
  osKey: string;
  onSave: (apiKey: string, endpoint: string, searchKey: string, osKey: string) => void;
  onClose: () => void;
}

export default function ScoutKeysModal({ apiKey, endpoint, searchKey, osKey, onSave, onClose }: Props) {
  const [keyDraft, setKeyDraft] = useState(apiKey);
  const [endDraft, setEndDraft] = useState(endpoint || DEFAULT_ENDPOINT);
  const [searchDraft, setSearchDraft] = useState(searchKey);
  const [osDraft, setOsDraft] = useState(osKey);
  const [keyErr, setKeyErr] = useState(false);
  const [endErr, setEndErr] = useState(false);

  function isValidUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  function save() {
    if (keyDraft && !keyDraft.trim()) { setKeyErr(true); return; }
    if (endDraft && !isValidUrl(endDraft)) { setEndErr(true); return; }
    onSave(keyDraft.trim(), endDraft.trim() || DEFAULT_ENDPOINT, searchDraft.trim(), osDraft.trim());
    onClose();
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-root)',
          borderRadius: 12,
          padding: 24,
          maxWidth: 480,
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 16 }}>
          API Configuration
        </div>

        {/* LiteLLM API Key */}
        <div style={{ marginBottom: 4 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 4, letterSpacing: '0.05em' }}>
            LiteLLM API Key
          </label>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>
            Your LiteLLM proxy API key. This authenticates requests to the LiteLLM endpoint. Stored in session only.
          </div>
          <input
            type="password"
            placeholder="sk-..."
            value={keyDraft}
            onChange={e => { setKeyDraft(e.target.value); setKeyErr(false); }}
            onKeyDown={e => e.key === 'Enter' && save()}
            style={{
              width: '100%',
              padding: '8px 10px',
              background: 'var(--bg-raised)',
              border: keyErr ? '1px solid var(--danger)' : '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--text-base)',
              fontFamily: 'monospace',
              boxSizing: 'border-box',
              marginBottom: keyErr ? 4 : 12,
            }}
            autoFocus
          />
          {keyErr && <div style={{ fontSize: 10, color: 'var(--danger)', marginBottom: 12 }}>API key is required</div>}
        </div>

        {/* LiteLLM Endpoint */}
        <div style={{ marginBottom: 4 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 4, letterSpacing: '0.05em' }}>
            LiteLLM Endpoint
          </label>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>
            Base URL for your LiteLLM proxy. Defaults to <code style={{ color: 'var(--blue)' }}>http://127.0.0.1:4000/v1</code>.
          </div>
          <input
            type="text"
            placeholder="http://127.0.0.1:4000/v1"
            value={endDraft}
            onChange={e => { setEndDraft(e.target.value); setEndErr(false); }}
            onKeyDown={e => e.key === 'Enter' && save()}
            style={{
              width: '100%',
              padding: '8px 10px',
              background: 'var(--bg-raised)',
              border: endErr ? '1px solid var(--danger)' : '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--text-base)',
              fontFamily: 'monospace',
              boxSizing: 'border-box',
              marginBottom: endErr ? 4 : 12,
            }}
          />
          {endErr && <div style={{ fontSize: 10, color: 'var(--danger)', marginBottom: 12 }}>Must be a valid URL</div>}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', margin: '14px 0' }} />

        {/* SerpAPI Key */}
        <div style={{ marginBottom: 4 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 4, letterSpacing: '0.05em' }}>
            SerpAPI Key <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(recommended)</span>
          </label>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>
            Enables web search for discovering officials. Get a free key at{' '}
            <a href="https://serpapi.com/" target="_blank" rel="noreferrer" style={{ color: '#58a6ff' }}>
              serpapi.com
            </a>
            {' '} — free tier includes 100 searches/month.
          </div>
          <input
            type="password"
            placeholder="SerpAPI key..."
            value={searchDraft}
            onChange={e => setSearchDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save()}
            style={{
              width: '100%',
              padding: '8px 10px',
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--text-base)',
              fontFamily: 'monospace',
              boxSizing: 'border-box',
              marginBottom: 12,
            }}
          />
        </div>

        <div style={{ borderTop: '1px solid var(--border)', margin: '14px 0' }} />

        {/* Open States */}
        <div style={{ marginBottom: 4 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 4, letterSpacing: '0.05em' }}>
            Open States API <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
          </label>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>
            Enables fast state legislator scans. Register at{' '}
            <a href="https://openstates.org/api/" target="_blank" rel="noreferrer" style={{ color: '#58a6ff' }}>
              openstates.org/api
            </a>
            {' '} for a free key.
          </div>
          <input
            type="password"
            placeholder="Open States API key..."
            value={osDraft}
            onChange={e => setOsDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save()}
            style={{
              width: '100%',
              padding: '8px 10px',
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--text-base)',
              fontFamily: 'monospace',
              boxSizing: 'border-box',
              marginBottom: 12,
            }}
          />
        </div>

        <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.6 }}>
          All keys are stored in session only — never persisted to localStorage.
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-base)',
              fontFamily: 'var(--rf-mono)',
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={save}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid var(--accent)',
              background: 'var(--accent)',
              color: '#000',
              fontFamily: 'var(--rf-mono)',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
