import { useEffect, useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { personalize } from '../api/gmail';

const TOKENS = [
  'FirstName', 'LastName', 'FullName', 'FullTitle',
  'EventName', 'EventDate', 'Venue', 'OrgName',
  'ContactName', 'ContactEmail',
  'VIPStart', 'VIPEnd', 'RSVP_Link', 'Date_Sent',
];

export default function ComposeTab() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [activePane, setActivePane] = useState<'editor' | 'preview'>('editor');
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

  function updateSubject(val: string) {
    dispatch({ type: 'SET_COMPOSE', subject: val, html: state.htmlBody });
  }

  const preview = ev && sample ? personalize(state.htmlBody, sample, ev) : state.htmlBody;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div
        className="px-4 py-3 flex flex-col gap-2.5 shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {/* Subject */}
        <div className="flex items-center gap-2.5">
          <span className="if-section-label shrink-0">Subject</span>
          <input
            className="if-input"
            value={state.textSubject}
            onChange={e => updateSubject(e.target.value)}
            placeholder="You are cordially invited to {{EventName}}"
          />
        </div>

        {/* Token insert row */}
        <div className="flex gap-1 flex-wrap items-center">
          <span className="if-section-label mr-1">Insert</span>
          {TOKENS.map(t => (
            <button
              key={t}
              onClick={() => insertToken(t)}
              style={{
                padding: '2px 6px',
                borderRadius: 3,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-muted)',
                fontFamily: 'monospace',
                fontSize: 9,
                letterSpacing: '0.04em',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--gold)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
              }}
            >
              {`{{${t}}}`}
            </button>
          ))}
        </div>

        {/* Format bar + mobile pane toggle */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1">
            {[
              { label: 'B', action: () => editor?.chain().focus().toggleBold().run(),         active: () => !!editor?.isActive('bold') },
              { label: 'I', action: () => editor?.chain().focus().toggleItalic().run(),       active: () => !!editor?.isActive('italic') },
              { label: '• List', action: () => editor?.chain().focus().toggleBulletList().run(),  active: () => !!editor?.isActive('bulletList') },
              { label: '1. List', action: () => editor?.chain().focus().toggleOrderedList().run(), active: () => !!editor?.isActive('orderedList') },
            ].map(({ label, action, active }) => (
              <button
                key={label}
                className="if-btn sm"
                style={active() ? { borderColor: 'var(--gold)', color: 'var(--gold)', background: 'var(--gold-bg)' } : {}}
                onClick={action}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Pane toggle — mobile only */}
          <div className="flex gap-1 md:hidden">
            <button
              className={`if-btn sm${activePane === 'editor' ? ' pri' : ''}`}
              onClick={() => setActivePane('editor')}
            >
              Editor
            </button>
            <button
              className={`if-btn sm${activePane === 'preview' ? ' pri' : ''}`}
              onClick={() => setActivePane('preview')}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="flex-1 overflow-hidden md:grid md:grid-cols-2">
        {/* Editor pane */}
        <div
          className={`h-full overflow-auto p-4 ${activePane === 'editor' ? 'block' : 'hidden'} md:block`}
          style={{ borderRight: '1px solid var(--border)' }}
        >
          <div className="if-section-label mb-2">EDITOR</div>
          <EditorContent
            editor={editor}
            className="text-sm leading-relaxed min-h-[200px]"
            style={{ color: 'var(--text-base)' }}
          />
        </div>

        {/* Preview pane */}
        <div
          className={`h-full overflow-auto p-4 ${activePane === 'preview' ? 'block' : 'hidden'} md:block`}
          style={{ background: 'var(--bg-subtle)' }}
        >
          <div className="if-section-label mb-2">
            PREVIEW {sample ? `(${sample.firstName} ${sample.lastName})` : '(no invitees)'}
          </div>
          <div
            className="rounded p-4 text-sm leading-relaxed"
            style={{ background: '#fff', color: '#1a1a1a' }}
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </div>
      </div>
    </div>
  );
}
