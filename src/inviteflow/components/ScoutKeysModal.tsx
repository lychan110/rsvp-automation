import { useState } from 'react';
import { DEFAULT_ENDPOINT } from '../../scout/constants';
import type { CSJurisdiction } from '../../scout/types';

interface Props {
  apiKey: string;
  endpoint: string;
  searchKey: string;
  osKey: string;
  jx: CSJurisdiction;
  onSave: (apiKey: string, endpoint: string, searchKey: string, osKey: string, jx: CSJurisdiction) => void;
  onClose: () => void;
}

export default function ScoutKeysModal({ apiKey, endpoint, searchKey, osKey, jx, onSave, onClose }: Props) {
  const [keyDraft, setKeyDraft] = useState(apiKey);
  const [endDraft, setEndDraft] = useState(endpoint || DEFAULT_ENDPOINT);
  const [searchDraft, setSearchDraft] = useState(searchKey);
  const [osDraft, setOsDraft] = useState(osKey);
  const [stateDraft, setStateDraft] = useState(jx.state);
  const [countiesDraft, setCountiesDraft] = useState(jx.counties);
  const [city1Draft, setCity1Draft] = useState(jx.city1);
  const [city2Draft, setCity2Draft] = useState(jx.city2);
  const [city3Draft, setCity3Draft] = useState(jx.city3);
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
    const jxUpdated: CSJurisdiction = {
      state: stateDraft.trim(),
      counties: countiesDraft.trim(),
      city1: city1Draft.trim(),
      city2: city2Draft.trim(),
      city3: city3Draft.trim(),
    };
    onSave(keyDraft.trim(), endDraft.trim() || DEFAULT_ENDPOINT, searchDraft.trim(), osDraft.trim(), jxUpdated);
    onClose();
  }

  return (
    <div
      role="presentation"
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="scout-modal-title"
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
        onKeyDown={e => e.key === 'Escape' && onClose()}
      >
        <div id="scout-modal-title" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 16 }}>
          API Configuration
        </div>

        {/* AI Provider API Key */}
        <div style={{ marginBottom: 4 }}>
          <label htmlFor="scout-api-key" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 4, letterSpacing: '0.05em' }}>
            AI Provider API Key
          </label>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>
            API key for your OpenAI-compatible provider (OpenAI, Anthropic, etc.). Stored in session only.
          </div>
          <input
            id="scout-api-key"
            type="password"
            placeholder="sk-..."
            value={keyDraft}
            onChange={e => { setKeyDraft(e.target.value); setKeyErr(false); }}
            onKeyDown={e => e.key === 'Enter' && save()}
            aria-invalid={keyErr}
            aria-describedby={keyErr ? 'scout-api-key-err' : undefined}
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
          {keyErr && <div id="scout-api-key-err" role="alert" style={{ fontSize: 10, color: 'var(--danger)', marginBottom: 12 }}>API key is required</div>}
        </div>

        {/* AI Provider Endpoint */}
        <div style={{ marginBottom: 4 }}>
          <label htmlFor="scout-endpoint" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 4, letterSpacing: '0.05em' }}>
            API Endpoint
          </label>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>
            Base URL for any OpenAI-compatible API. Defaults to <code style={{ color: 'var(--blue)' }}>https://api.openai.com/v1</code>.
          </div>
          <input
            id="scout-endpoint"
            type="text"
            placeholder="https://api.openai.com/v1"
            value={endDraft}
            onChange={e => { setEndDraft(e.target.value); setEndErr(false); }}
            onKeyDown={e => e.key === 'Enter' && save()}
            aria-invalid={endErr}
            aria-describedby={endErr ? 'scout-endpoint-err' : undefined}
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
          {endErr && <div id="scout-endpoint-err" role="alert" style={{ fontSize: 10, color: 'var(--danger)', marginBottom: 12 }}>Must be a valid URL</div>}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', margin: '14px 0' }} />

        {/* SerpAPI Key */}
        <div style={{ marginBottom: 4 }}>
          <label htmlFor="scout-serpapi-key" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 4, letterSpacing: '0.05em' }}>
            Web Search Key <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(recommended)</span>
          </label>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>
            Enables web search for discovering officials. Get a free key at{' '}
            <a href="https://serpapi.com/" target="_blank" rel="noreferrer" style={{ color: '#58a6ff' }}>
              serpapi.com
            </a>
            {' '} — free tier includes 100 searches/month.
          </div>
          <input
            id="scout-serpapi-key"
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
          <label htmlFor="scout-openstates-key" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 4, letterSpacing: '0.05em' }}>
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
            id="scout-openstates-key"
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

        <div style={{ borderTop: '1px solid var(--border)', margin: '14px 0' }} />

        {/* Jurisdiction Configuration */}
        <div style={{ marginBottom: 4 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 4, letterSpacing: '0.05em' }}>
            Jurisdiction <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(for official discovery)</span>
          </label>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>
            Configure your state and location(s) for targeted official discovery scans.
          </div>

          <label htmlFor="scout-jx-state" style={{ display: 'block', fontSize: 10, color: 'var(--text-secondary)', marginBottom: 2 }}>State</label>
          <input
            id="scout-jx-state"
            type="text"
            placeholder="e.g., California"
            value={stateDraft}
            onChange={e => setStateDraft(e.target.value)}
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
              marginBottom: 8,
            }}
          />

          <label htmlFor="scout-jx-counties" style={{ display: 'block', fontSize: 10, color: 'var(--text-secondary)', marginBottom: 2 }}>Counties (comma-separated)</label>
          <input
            id="scout-jx-counties"
            type="text"
            placeholder="e.g., Santa Clara, San Mateo"
            value={countiesDraft}
            onChange={e => setCountiesDraft(e.target.value)}
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
              marginBottom: 8,
            }}
          />

          <label htmlFor="scout-jx-city1" style={{ display: 'block', fontSize: 10, color: 'var(--text-secondary)', marginBottom: 2 }}>City 1</label>
          <input
            id="scout-jx-city1"
            type="text"
            placeholder="e.g., San Jose"
            value={city1Draft}
            onChange={e => setCity1Draft(e.target.value)}
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
              marginBottom: 8,
            }}
          />

          <label htmlFor="scout-jx-city2" style={{ display: 'block', fontSize: 10, color: 'var(--text-secondary)', marginBottom: 2 }}>City 2</label>
          <input
            id="scout-jx-city2"
            type="text"
            placeholder="e.g., Palo Alto"
            value={city2Draft}
            onChange={e => setCity2Draft(e.target.value)}
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
              marginBottom: 8,
            }}
          />

          <label htmlFor="scout-jx-city3" style={{ display: 'block', fontSize: 10, color: 'var(--text-secondary)', marginBottom: 2 }}>City 3</label>
          <input
            id="scout-jx-city3"
            type="text"
            placeholder="e.g., Mountain View"
            value={city3Draft}
            onChange={e => setCity3Draft(e.target.value)}
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
          All settings are stored in session only — never persisted to localStorage.
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
