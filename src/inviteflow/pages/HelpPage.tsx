import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import { helpSections } from '../data/helpContent';

const sections = helpSections;

export default function HelpPage() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-root)' }}>
      <PageHeader eyebrow="HELP" title="Quick Start Guide" showBack />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 48px' }}>

        {sections.map(section => (
          <div key={section.id}>
            <div className="if-section-label" style={{ padding: '20px 0 10px' }}>
              {section.label}
            </div>

            {section.content && (
              <div className="if-card" style={{ padding: 16, marginBottom: 4 }}>
                <p style={{ margin: 0, fontFamily: 'var(--rf-mono)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {section.content}
                </p>
              </div>
            )}

            {section.steps && (
              <div className="if-card" style={{ marginBottom: 4 }}>
                {section.steps.map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 14, padding: '14px 16px',
                    borderBottom: i < section.steps!.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                      background: 'var(--accent)', color: 'var(--bg-root)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--rf-mono)', fontSize: 10, fontWeight: 600,
                    }}>
                      {step.num}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 12, color: 'var(--text-heading)', fontWeight: 600, marginBottom: 4 }}>
                        {step.title}
                      </div>
                      <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                        {step.body}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {section.tokens && (
              <div className="if-card" style={{ marginBottom: 4, padding: 0, overflow: 'hidden' }}>
                {section.tokens.map(([token, desc], i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '9px 16px',
                    borderBottom: i < section.tokens!.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <code style={{
                      fontFamily: 'var(--rf-mono)', fontSize: 11, color: 'var(--accent)',
                      background: 'rgba(0,217,205,0.06)', padding: '2px 7px', borderRadius: 4,
                      border: '1px solid rgba(0,217,205,0.15)', flexShrink: 0,
                    }}>
                      {token}
                    </code>
                    <span style={{ fontFamily: 'var(--rf-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                      {desc}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {section.bullets && (
              <div className="if-card" style={{ padding: 16, marginBottom: 4 }}>
                {section.bullets.map((b, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 10, marginBottom: i < section.bullets!.length - 1 ? 10 : 0,
                    alignItems: 'flex-start',
                  }}>
                    <Icon name="chevron-right" size={11} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontFamily: 'var(--rf-mono)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {b}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
