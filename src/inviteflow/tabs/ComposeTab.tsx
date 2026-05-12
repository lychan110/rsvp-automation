import { useEffect, useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { personalize } from '../api/email';

const TOKENS = [
  'FirstName', 'LastName', 'FullName', 'FullTitle',
  'EventName', 'EventDate', 'Venue', 'OrgName',
  'ContactName', 'ContactEmail',
  'VIPStart', 'VIPEnd', 'RSVP_Link', 'Date_Sent',
];

export default function ComposeTab() {
  const state = useAppState();
  const dispatch = useAppDispatch();
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

  function updateSubject(val: string) {
    dispatch({ type: 'SET_COMPOSE', subject: val, html: state.htmlBody });
  }

  const preview = ev && sample ? personalize(state.htmlBody, sample, ev) : state.htmlBody;

  const wordCount = state.htmlBody.replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).length;
  const tokenCount = (state.htmlBody.match(/\{\{\w+\}\}/g) || []).length;
  const recipientCount = state.invitees.length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <div
        className="px-4 pt-3 pb-2.5 flex flex-col gap-2.5 shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {/* Section header + tab switcher */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="if-eyebrow" style={{ marginBottom: 2 }}>COMPOSE</div>
            <div className="if-page-title" style={{ fontSize: 15 }}>Invitation template</div>
          </div>
          <div className="if-tab-switcher" style={{ width: 200, flexShrink: 0 }}>
            <button
              className={`if-tab-option${activePane === 'edit' ? ' active' : ''}`}
              onClick={() => setActivePane('edit')}
            >
              Edit
            </button>
            <button
              className={`if-tab-option${activePane === 'preview' ? ' active' : ''}`}
              onClick={() => setActivePane('preview')}
            >
              Preview
            </button>
          </div>
        </div>

        {/* Subject field */}
        <div className="flex items-center gap-2.5">
          <label className="if-label" style={{ flexShrink: 0, marginBottom: 0 }}>Subject</label>
          <input
            className="if-input"
            value={state.textSubject}
            onChange={e => updateSubject(e.target.value)}
            placeholder="You are cordially invited to {{EventName}}"
          />
        </div>

        {/* Token insert row */}
        <div className="flex gap-1.5 flex-wrap items-center">
          <span className="if-label" style={{ marginBottom: 0 }}>Insert</span>
          {TOKENS.map(t => (
            <button
              key={t}
              onClick={() => insertToken(t)}
              className="if-btn sm"
              style={{ color: 'var(--accent)', borderColor: 'var(--accent-border)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(229,113,88,0.1)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-border)';
              }}
            >
              {`{{${t}}}`}
            </button>
          ))}
        </div>

        {/* Format bar (editor mode only) */}
        {activePane === 'edit' && (
          <div className="flex items-center gap-1">
            {[
              { label: 'B', action: () => editor?.chain().focus().toggleBold().run(),         active: () => !!editor?.isActive('bold') },
              { label: 'I', action: () => editor?.chain().focus().toggleItalic().run(),       active: () => !!editor?.isActive('italic') },
              { label: '• List', action: () => editor?.chain().focus().toggleBulletList().run(),  active: () => !!editor?.isActive('bulletList') },
              { label: '1. List', action: () => editor?.chain().focus().toggleOrderedList().run(), active: () => !!editor?.isActive('orderedList') },
            ].map(({ label, action, active }) => (
              <button
                key={label}
                className="if-btn sm"
                style={active() ? { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'rgba(229,113,88,0.1)' } : {}}
                onClick={action}
              >
                {label}
              </button>
            ))}

            {/* Stats strip */}
            <div className="flex gap-3 ml-auto">
              {[
                { label: 'WORDS',      value: wordCount },
                { label: 'TOKENS',     value: tokenCount },
                { label: 'RECIPIENTS', value: recipientCount },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 7, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                    {s.label}
                  </div>
                  <div style={{ fontFamily: 'var(--rf-serif)', fontSize: 16, fontWeight: 500, color: 'var(--text-heading)', lineHeight: 1 }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Editor + Preview split ─────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden md:grid md:grid-cols-2">
        {/* Editor pane */}
        <div
          className={`h-full overflow-auto p-4 ${activePane === 'edit' ? 'block' : 'hidden'} md:block`}
          style={{ borderRight: '1px solid var(--border)' }}
        >
          <div className="if-section-label mb-2.5">EDITOR</div>
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
          <div className="if-section-label mb-2.5">
            PREVIEW
            {sample && (
              <span style={{ marginLeft: 6, color: 'var(--text-muted)' }}>
                ({sample.firstName} {sample.lastName})
              </span>
            )}
            {!sample && (
              <span style={{ marginLeft: 6, color: 'var(--text-muted)' }}>(no invitees)</span>
            )}
          </div>
          {!sample && (
            <div className="if-empty" style={{ padding: '24px 0' }}>
              Add invitees first to see a personalized preview.
            </div>
          )}
          {sample && (
            <div
              style={{
                background: '#fff',
                borderRadius: 8,
                padding: 16,
                fontSize: 13,
                lineHeight: '1.7',
                color: '#1a1a1a',
              }}
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
