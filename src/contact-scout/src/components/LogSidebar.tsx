interface Props {
  log: string[];
  show: boolean;
  onClose: () => void;
}

export default function LogSidebar({ log, show, onClose }: Props) {
  return (
    <div className={`cs-log-sidebar${show ? ' show' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div className="cs-section-label">ACTIVITY LOG</div>
        <button
          className="cs-btn sm cs-log-btn"
          onClick={onClose}
          style={{ minHeight: 24, padding: '0 8px' }}
          aria-label="Close log"
        >
          ✕
        </button>
      </div>
      {log.length === 0 && (
        <div style={{ fontSize: 10, color: '#7d8590', fontStyle: 'italic', marginTop: 6 }}>No activity yet.</div>
      )}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, marginTop: 6 }}>
        {log.map((entry, i) => (
          <div
            key={i}
            style={{
              fontSize: 10,
              color: i === 0 ? '#8b949e' : '#7d8590',
              marginBottom: 3,
              lineHeight: 1.5,
              borderLeft: `2px solid ${i === 0 ? '#1f6feb' : 'transparent'}`,
              paddingLeft: 5,
            }}
          >
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
}
