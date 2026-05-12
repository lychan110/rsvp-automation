import { useEffect, useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { useRouter } from '../state/RouterContext';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import { personalize } from '../api/email';

const TOKENS = [
  'FirstName', 'LastName', 'FullName', 'FullTitle',
  'EventName', 'EventDate', 'Venue', 'OrgName',
  'ContactName', 'ContactEmail', 'VIPStart', 'VIPEnd', 'RSVP_Link', 'Date_Sent',
];

export default function ComposePage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { navigate } = useRouter();
  const [activePane, setActivePane] = useState<'edit' | 'preview'>('edit');
  const ev = state.events.find(e => e.id === state.activeEventId);
  const sample = state.invitees[0];

  const editor = useEditor({
    extensions: [StarterKit],
    content: state.htmlBody || '<p>Dear Honorable {{FirstName}} {{LastName}},</p><p></p><p>{{RSVP_Link}}</p>',
    onUpdate({ editor }) {
      dispatch({ type: 'SET_COMPOSE', subject: state.textSubject, html: editor.getHTML() });
    },
  });

  useEffect(() => {
    if (editor && state.htmlBody && editor.getHTML() !== state.htmlBody) {
      editor.commands.setContent(state.htmlBody, false);
    }
  }, []);

  const insertToken = useCallback((token: string) => {
    editor?.commands.insertContent(`{{${token}}}`);
  }, [editor]);

  const preview = ev && sample ? personalize(state.htmlBody, sample, ev) : state.htmlBody;
  const wordCount = state.htmlBody.replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).length;
  const tokenCount = (state.htmlBody.match(/\{\{\w+\}\}/g) || []).length;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-root)' }}>
      <PageHeader eyebrow="COMPOSE" title="Invitation template" showBack />

      {/* Top controls */}
      <div style={{ padding: '0 18px 10px', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
        {/* Tab switcher + stats */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
          <div className="if-tab-switcher" style={{ width: 180 }}>
            <button className={`if-tab-option${activePane === 'edit' ? ' active' : ''}`} onClick={() => setActivePane('edit')}>Edit</button>
            <button className={`if-tab-option${activePane === 'preview' ? ' active' : ''}`} onClick={() => setActivePane('preview')}>Preview</button>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[{ label: 'WORDS', value: wordCount }, { label: 'TOKENS', value: tokenCount }, { label: 'RECIPIENTS', value: state.invitees.length }].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 7, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--rf-serif)', fontSize: 16, fontWeight: 500, color: 'var(--text-heading)', lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <label className="if-label" style={{ flexShrink: 0, marginBottom: 0 }}>Subject</label>
          <input
            className="if-input"
            style={{ flex: 1 }}
            value={state.textSubject}
            onChange={e => dispatch({ type: 'SET_COMPOSE', subject: e.target.value, html: state.htmlBody })}
            placeholder="You are cordially invited to {{EventName}}"
          />
        </div>

        {/* Tokens */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="if-label" style={{ marginBottom: 0 }}>Insert</span>
          {TOKENS.map(t => (
            <button key={t} onClick={() => insertToken(t)} className="if-btn sm"
              style={{ color: 'var(--accent)', borderColor: 'var(--accent-border)' }}>
              {`{{${t}}}`}
            </button>
          ))}
        </div>

        {/* Format bar */}
        {activePane === 'edit' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            {[
              { label: 'B', action: () => editor?.chain().focus().toggleBold().run(), active: () => !!editor?.isActive('bold') },
              { label: 'I', action: () => editor?.chain().focus().toggleItalic().run(), active: () => !!editor?.isActive('italic') },
              { label: '• List', action: () => editor?.chain().focus().toggleBulletList().run(), active: () => !!editor?.isActive('bulletList') },
              { label: '1. List', action: () => editor?.chain().focus().toggleOrderedList().run(), active: () => !!editor?.isActive('orderedList') },
            ].map(({ label, action, active }) => (
              <button key={label} className="if-btn sm"
                style={active() ? { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'rgba(229,113,88,0.1)' } : {}}
                onClick={action}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Editor / Preview */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {/* Editor pane */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: 16,
          display: activePane === 'edit' ? 'block' : 'none',
          borderRight: '1px solid var(--border)',
        }}>
          <div className="if-section-label" style={{ marginBottom: 10 }}>EDITOR</div>
          <EditorContent editor={editor} style={{ color: 'var(--text-base)', fontSize: 13, lineHeight: 1.7 }} />
        </div>

        {/* Preview pane */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: 16,
          background: 'var(--bg-subtle)',
          display: activePane === 'preview' ? 'block' : 'none',
        }}>
          <div className="if-section-label" style={{ marginBottom: 10 }}>
            PREVIEW
            {sample
              ? <span style={{ marginLeft: 6, color: 'var(--text-muted)' }}>({sample.firstName} {sample.lastName})</span>
              : <span style={{ marginLeft: 6, color: 'var(--text-muted)' }}>(no invitees)</span>
            }
          </div>
          {!sample ? (
            <div className="if-empty" style={{ padding: '24px 0' }}>Add invitees to see a personalized preview.</div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 8, padding: 16, fontSize: 13, lineHeight: 1.7, color: '#1a1a1a' }}
              dangerouslySetInnerHTML={{ __html: preview }} />
          )}
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{ flexShrink: 0, padding: '12px 18px', borderTop: '1px solid var(--border)', background: 'var(--bg-root)' }}>
        <button className="if-btn pri" style={{ width: '100%' }} onClick={() => navigate('send')}>
          <Icon name="send" size={13} style={{ marginRight: 6 }} />
          CONTINUE TO SEND →
        </button>
      </div>
    </div>
  );
}
