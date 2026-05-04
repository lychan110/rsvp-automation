import { useState } from 'react';
import { DEFAULT_ENDPOINT } from '../constants';

interface Props {
  apiKey: string;
  endpoint: string;
  searchKey: string;
  osKey: string;
  onSave: (apiKey: string, endpoint: string, searchKey: string, osKey: string) => void;
  onClose: () => void;
}

export default function ApiKeyModal({ apiKey, endpoint, searchKey, osKey, onSave, onClose }: Props) {
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
    <div className="if-modal-backdrop" onClick={onClose}>
      <div className="if-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480, width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="if-modal-title">API Configuration</div>

        {/* LiteLLM API Key */}
        <div style={{ marginBottom: 4 }}>
          <div className="if-label" style={{ marginBottom: 4 }}>LiteLLM API Key</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>
            Your LiteLLM proxy API key. This authenticates requests to the LiteLLM endpoint.
            Stored in session only.
          </div>
          <input
            className={`if-input${keyErr ? ' err' : ''}`}
            type="password"
            placeholder="sk-..."
            value={keyDraft}
            onChange={e => { setKeyDraft(e.target.value); setKeyErr(false); }}
            onKeyDown={e => e.key === 'Enter' && save()}
            autoFocus
          />
          {keyErr && <div style={{ fontSize: 10, color: 'var(--danger)', marginTop: 4 }}>API key is required</div>}
        </div>

        {/* LiteLLM Endpoint */}
        <div style={{ marginBottom: 4 }}>
          <div className="if-label" style={{ marginBottom: 4 }}>LiteLLM Endpoint</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>
            Base URL for your LiteLLM proxy. Defaults to <code style={{ color: 'var(--blue)' }}>http://127.0.0.1:4000/v1</code>.
            Must be a valid URL. The endpoint will be called with OpenAI-compatible chat/completions requests.
          </div>
          <input
            className={`if-input${endErr ? ' err' : ''}`}
            type="text"
            placeholder="http://127.0.0.1:4000/v1"
            value={endDraft}
            onChange={e => { setEndDraft(e.target.value); setEndErr(false); }}
            onKeyDown={e => e.key === 'Enter' && save()}
          />
          {endErr && <div style={{ fontSize: 10, color: 'var(--danger)', marginTop: 4 }}>Must be a valid URL</div>}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border)', margin: '14px 0' }} />

        {/* SerpAPI Key */}
        <div style={{ marginBottom: 4 }}>
          <div className="if-label" style={{ marginBottom: 4 }}>
            SerpAPI Key{' '}
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(recommended)</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>
            Enables web search for discovering current officials. Get a free key at{' '}
            <a href="https://serpapi.com/" target="_blank" rel="noreferrer" style={{ color: '#58a6ff' }}>
              serpapi.com
            </a>
            {' '}— free tier includes 100 searches/month.
          </div>
          <input
            className="if-input"
            type="password"
            placeholder="SerpAPI key..."
            value={searchDraft}
            onChange={e => setSearchDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save()}
          />
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border)', margin: '14px 0' }} />

        {/* Open States */}
        <div style={{ marginBottom: 4 }}>
          <div className="if-label" style={{ marginBottom: 4 }}>
            Open States API{' '}
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>
            When set, State Senate and State House scans use Open States structured data.
            Register at{' '}
            <a href="https://openstates.org/api/" target="_blank" rel="noreferrer" style={{ color: '#58a6ff' }}>
              openstates.org/api
            </a>
            {' '}for a free key.
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
          All keys are stored in session only — never persisted to localStorage.
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
          <button className="if-btn" onClick={onClose}>Cancel</button>
          <button className="if-btn pri" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}
