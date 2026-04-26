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

const TOKEN_BTN = "px-1.5 py-0.5 rounded border border-gray-300 bg-transparent text-gray-600 text-[9px] font-mono tracking-wide cursor-pointer hover:border-[#C8A84B] hover:text-[#C8A84B] dark:border-[#21262d] dark:text-[#8b949e] dark:hover:border-[#C8A84B] dark:hover:text-[#C8A84B]";
const FMT_BTN = (active: boolean) =>
  `min-h-[36px] px-2.5 py-1 rounded border text-[10px] font-mono cursor-pointer ${
    active
      ? 'border-[#C8A84B] bg-[#2a1a00] text-[#C8A84B]'
      : 'border-gray-300 bg-transparent text-gray-600 hover:border-gray-500 dark:border-[#21262d] dark:text-[#8b949e] dark:hover:border-[#484f58]'
  }`;
const PANE_BTN = (active: boolean) =>
  `min-h-[36px] px-3 py-1 rounded border text-[10px] font-mono tracking-wide cursor-pointer ${
    active
      ? 'border-blue-600 bg-blue-600 text-white dark:border-[#1f6feb] dark:bg-[#1f6feb]'
      : 'border-gray-300 bg-transparent text-gray-600 dark:border-[#21262d] dark:text-[#8b949e]'
  }`;

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

  const preview = ev && sample
    ? personalize(state.htmlBody, sample, ev)
    : state.htmlBody;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="px-4 py-3 border-b border-gray-200 flex flex-col gap-2.5 shrink-0 dark:border-[#21262d]">
        {/* Subject */}
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] text-gray-500 tracking-widest font-mono uppercase shrink-0 dark:text-[#6e7681]">Subject</span>
          <input
            className="flex-1 min-w-0 bg-white border border-gray-300 text-gray-900 text-xs font-mono px-2.5 py-1.5 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-[#0d1117] dark:border-[#21262d] dark:text-[#c9d1d9] dark:focus:border-[#58a6ff]"
            value={state.textSubject}
            onChange={e => updateSubject(e.target.value)}
            placeholder="You are cordially invited to {{EventName}}"
          />
        </div>

        {/* Token insert row */}
        <div className="flex gap-1 flex-wrap items-center">
          <span className="text-[10px] text-gray-500 tracking-widest font-mono uppercase mr-1 dark:text-[#6e7681]">Insert</span>
          {TOKENS.map(t => (
            <button key={t} className={TOKEN_BTN} onClick={() => insertToken(t)}>{`{{${t}}}`}</button>
          ))}
        </div>

        {/* Format bar + mobile pane toggle */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1">
            <button className={FMT_BTN(!!editor?.isActive('bold'))} onClick={() => editor?.chain().focus().toggleBold().run()}>B</button>
            <button className={FMT_BTN(!!editor?.isActive('italic'))} onClick={() => editor?.chain().focus().toggleItalic().run()}>I</button>
            <button className={FMT_BTN(!!editor?.isActive('bulletList'))} onClick={() => editor?.chain().focus().toggleBulletList().run()}>• List</button>
            <button className={FMT_BTN(!!editor?.isActive('orderedList'))} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1. List</button>
          </div>
          {/* Pane toggle — mobile only */}
          <div className="flex gap-1 md:hidden">
            <button className={PANE_BTN(activePane === 'editor')} onClick={() => setActivePane('editor')}>Editor</button>
            <button className={PANE_BTN(activePane === 'preview')} onClick={() => setActivePane('preview')}>Preview</button>
          </div>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="flex-1 overflow-hidden md:grid md:grid-cols-2">
        {/* Editor pane */}
        <div className={`h-full overflow-auto p-4 border-gray-200 dark:border-[#21262d] md:border-r ${activePane === 'editor' ? 'block' : 'hidden'} md:block`}>
          <div className="text-[10px] text-gray-500 tracking-widest font-mono uppercase mb-2 dark:text-[#6e7681]">EDITOR</div>
          <EditorContent
            editor={editor}
            className="text-gray-900 text-sm leading-relaxed min-h-[200px] dark:text-[#c9d1d9]"
          />
        </div>

        {/* Preview pane */}
        <div className={`h-full overflow-auto p-4 bg-gray-50 dark:bg-[#080c10] ${activePane === 'preview' ? 'block' : 'hidden'} md:block`}>
          <div className="text-[10px] text-gray-500 tracking-widest font-mono uppercase mb-2 dark:text-[#6e7681]">
            PREVIEW {sample ? `(${sample.firstName} ${sample.lastName})` : '(no invitees)'}
          </div>
          <div
            className="bg-white rounded p-4 text-[#1a1a1a] text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </div>
      </div>
    </div>
  );
}
