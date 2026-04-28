import { useState } from 'react';
import { CSS } from '../css';
import { SCOUT_PW } from '../constants';

interface Props {
  onUnlock: () => void;
}

export default function PasswordGate({ onUnlock }: Props) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);

  function attempt() {
    if (pw === SCOUT_PW) { onUnlock(); }
    else { setErr(true); setPw(''); }
  }

  return (
    <div style={{ height: '100dvh', background: '#080c10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Courier New', monospace", padding: 20 }}>
      <style>{CSS}</style>
      <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, padding: 32, width: '100%', maxWidth: 380 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#f0f6fc', letterSpacing: '-0.02em', marginBottom: 2 }}>CONTACT SCOUT</div>
        <div style={{ fontSize: 9, color: '#8b949e', letterSpacing: '0.12em', marginBottom: 20 }}>by Lenya Chan · ELECTED OFFICIALS DISCOVERY</div>
        <div style={{ fontSize: 11, color: '#8b949e', lineHeight: 1.7, marginBottom: 16 }}>
          ContactScout uses Claude AI to discover and verify elected officials. Enter your access code to continue.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className={`if-input${err ? ' err' : ''}`}
            type="password"
            placeholder="Access code"
            value={pw}
            onChange={e => { setPw(e.target.value); setErr(false); }}
            onKeyDown={e => e.key === 'Enter' && attempt()}
            autoFocus
            style={{ flex: 1 }}
          />
          <button className="if-btn pri" onClick={attempt}>Unlock</button>
        </div>
        {err && <div style={{ fontSize: 10, color: '#f85149', marginTop: 8 }}>Incorrect access code.</div>}
      </div>
    </div>
  );
}
