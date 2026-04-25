import { useEffect, useCallback } from 'react';
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

  const preview = ev && sample
    ? personalize(state.htmlBody, sample, ev)
    : state.htmlBody;

  const btn = (active = false): React.CSSProperties => ({
    border: `1px solid ${active ? '#C8A84B' : '#21262d'}`,
    background: active ? '#2a1a00' : 'transparent',
    color: active ? '#C8A84B' : '#8b949e',
    padding: '3px 8px',
    borderRadius: 3,
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: '0.05em',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #21262d', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10, color: '#6e7681', letterSpacing: '0.1em', minWidth: 60 }}>SUBJECT</span>
          <input
            style={{ flex: 1, background: '#0d1117', border: '1px solid #21262d', color: '#c9d1d9', padding: '5px 10px', borderRadius: 4, fontFamily: 'monospace', fontSize: 11, outline: 'none' }}
            value={state.textSubject}
            onChange={e => updateSubject(e.target.value)}
            placeholder="You are cordially invited to {{EventName}}"
          />
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: '#6e7681', letterSpacing: '0.1em', marginRight: 4 }}>INSERT</span>
          {TOKENS.map(t => (
            <button key={t} style={btn()} onClick={() => insertToken(t)}>{`{{${t}}}`}</button>
          ))}
        </div>
        {/* Format bar */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={btn(editor?.isActive('bold'))} onClick={() => editor?.chain().focus().toggleBold().run()}>B</button>
          <button style={btn(editor?.isActive('italic'))} onClick={() => editor?.chain().focus().toggleItalic().run()}>I</button>
          <button style={btn(editor?.isActive('bulletList'))} onClick={() => editor?.chain().focus().toggleBulletList().run()}>• List</button>
          <button style={btn(editor?.isActive('orderedList'))} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1. List</button>
        </div>
      </div>

      {/* Editor + Preview split */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>
        <div style={{ borderRight: '1px solid #21262d', overflow: 'auto', padding: 16 }}>
          <div style={{ fontSize: 10, color: '#6e7681', letterSpacing: '0.1em', marginBottom: 8 }}>EDITOR</div>
          <EditorContent
            editor={editor}
            style={{ color: '#c9d1d9', fontSize: 13, lineHeight: 1.8, minHeight: 200 }}
          />
        </div>
        <div style={{ overflow: 'auto', padding: 16, background: '#080c10' }}>
          <div style={{ fontSize: 10, color: '#6e7681', letterSpacing: '0.1em', marginBottom: 8 }}>
            PREVIEW {sample ? `(${sample.firstName} ${sample.lastName})` : '(no invitees)'}
          </div>
          <div
            style={{ background: '#fff', borderRadius: 4, padding: 16, color: '#1a1a1a', fontSize: 13, lineHeight: 1.8 }}
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </div>
      </div>
    </div>
  );
}
