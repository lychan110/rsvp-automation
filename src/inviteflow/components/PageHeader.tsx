import type { ReactNode } from 'react';
import { useRouter } from '../state/RouterContext';
import { useAppState } from '../state/AppContext';
import Icon from './Icon';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  showBack?: boolean;
  // undefined = show hamburger → settings, null = hide, ReactNode = custom
  right?: ReactNode | null;
}

export default function PageHeader({ eyebrow, title, showBack = false, right }: PageHeaderProps) {
  const state = useAppState();
  const { goBack, navigate } = useRouter();

  const rightEl: ReactNode = right === undefined
    ? (
      <button
        className="if-header-btn"
        onClick={() => navigate('settings')}
        aria-label="Settings"
      >
        <Icon name="menu" size={15}/>
      </button>
    )
    : right;

  return (
    <div style={{
      padding: '12px 18px 14px',
      display: 'flex', alignItems: 'center', gap: 10,
      flexShrink: 0,
    }}>
      {showBack && (
        <button className="if-header-btn" onClick={goBack} aria-label="Back">
          <Icon name="chevron-left" size={14}/>
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="if-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          {eyebrow}
          {state.unsaved && (
            <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
              background: 'var(--warning)', flexShrink: 0 }}
              aria-label="Unsaved changes" title="You have unsaved changes" />
          )}
        </div>
        <div className="if-page-title">{title}</div>
      </div>
      {rightEl}
    </div>
  );
}
