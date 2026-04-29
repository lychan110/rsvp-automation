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
    if (!draft.startsWith('AIza')) { setErr(true); return; }
    onSave(draft);
    onClose();
  }

  return (
    <div className="if-modal-backdrop" onClick={onClose}>
      <div className="if-modal" onClick={e => e.stopPropagation()}>
        <div className="if-modal-title">Google AI Studio API Key</div>
        <div className="if-modal-sub">
          Get a free key at{' '}
          <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: '#58a6ff' }}>
            aistudio.google.com
          </a>{' '}
          → Get API key → Create API key. Starts with <code>AIza</code>. Stored in session only.
        </div>
        <input
          className={`if-input${err ? ' err' : ''}`}
          type="password"
          placeholder="AIza..."
          value={draft}
          onChange={e => { setDraft(e.target.value); setErr(false); }}
          onKeyDown={e => e.key === 'Enter' && save()}
          autoFocus
        />
        {err && <div style={{ fontSize: 10, color: '#f85149', marginTop: 6 }}>Must start with AIza</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="if-btn" onClick={onClose}>Cancel</button>
          <button className="if-btn pri" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}
