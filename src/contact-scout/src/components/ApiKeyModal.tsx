import { useState } from 'react';

interface Props {
  apiKey: string;
  onSave: (key: string) => void;
  onClose: () => void;
}

export default function ApiKeyModal({ apiKey, onSave, onClose }: Props) {
  const [draft, setDraft] = useState(apiKey);
  const [err, setErr] = useState(false);

  function save() {
    if (!draft.startsWith('sk-ant-')) { setErr(true); return; }
    onSave(draft);
    onClose();
  }

  return (
    <div className="cs-modal-backdrop" onClick={onClose}>
      <div className="cs-modal" onClick={e => e.stopPropagation()}>
        <div className="cs-modal-title">Claude API Key</div>
        <div className="cs-modal-sub">
          Enter your Anthropic API key. Get a free key at{' '}
          <a href="https://console.anthropic.com/" target="_blank" rel="noreferrer" style={{ color: '#58a6ff' }}>
            console.anthropic.com
          </a>{' '}
          → API Keys → Create Key. Starts with <code>sk-ant-</code>. Stored in session only.
        </div>
        <input
          className={`cs-input${err ? ' err' : ''}`}
          type="password"
          placeholder="sk-ant-..."
          value={draft}
          onChange={e => { setDraft(e.target.value); setErr(false); }}
          onKeyDown={e => e.key === 'Enter' && save()}
          autoFocus
        />
        {err && <div style={{ fontSize: 10, color: '#f85149', marginTop: 6 }}>Must start with sk-ant-</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="cs-btn" onClick={onClose}>Cancel</button>
          <button className="cs-btn pri" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}
