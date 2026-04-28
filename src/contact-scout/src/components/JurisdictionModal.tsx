import { useState } from 'react';
import { saveJurisdiction } from '../storage';
import type { CSJurisdiction } from '../types';

interface Props {
  jx: CSJurisdiction;
  onSave: (jx: CSJurisdiction) => void;
  onClose: () => void;
}

const FIELDS: { key: keyof CSJurisdiction; label: string; placeholder: string }[] = [
  { key: 'state',    label: 'State name',                 placeholder: 'e.g. California' },
  { key: 'counties', label: 'Counties (comma-separated)', placeholder: 'e.g. San Francisco, Alameda' },
  { key: 'city1',    label: 'City 1',                     placeholder: 'e.g. San Francisco' },
  { key: 'city2',    label: 'City 2 (optional)',          placeholder: 'e.g. Oakland' },
  { key: 'city3',    label: 'City 3 (optional)',          placeholder: 'e.g. Berkeley' },
];

export default function JurisdictionModal({ jx, onSave, onClose }: Props) {
  const [draft, setDraft] = useState(jx);

  function save() {
    saveJurisdiction(draft);
    onSave(draft);
    onClose();
  }

  return (
    <div className="cs-modal-backdrop" onClick={onClose}>
      <div className="cs-modal" onClick={e => e.stopPropagation()}>
        <div className="cs-modal-title">Jurisdiction Settings</div>
        <div className="cs-modal-sub">
          These values replace [YOUR STATE] and [CITY N] placeholders in scan prompts.
          Saved locally in your browser.
        </div>
        {FIELDS.map(f => (
          <div className="cs-field" key={f.key}>
            <div className="cs-field-label">{f.label}</div>
            <input
              className="cs-input"
              placeholder={f.placeholder}
              value={draft[f.key]}
              onChange={e => setDraft(prev => ({ ...prev, [f.key]: e.target.value }))}
            />
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="cs-btn" onClick={onClose}>Cancel</button>
          <button className="cs-btn pri" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}
