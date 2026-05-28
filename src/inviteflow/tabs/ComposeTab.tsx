import { useEffect, useState, useCallback } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { buildEmailHtml } from '../api/email';
import { TEMPLATES, type ParamField } from '../emails';

export default function ComposeTab() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [activePane, setActivePane] = useState<'edit' | 'preview'>('edit');
  const [previewHtml, setPreviewHtml] = useState('');
  const [renderErr, setRenderErr] = useState('');
  const ev = state.events.find(e => e.id === state.activeEventId);
  const sample = state.invitees[0];

  const templateId = state.templateId ?? '';
  const templateMeta = templateId ? TEMPLATES[templateId] : null;

  // Initialize default template + params on first mount if empty
  useEffect(() => {
    if (!state.templateId && !state.htmlBody && ev) {
      const firstId = Object.keys(TEMPLATES)[0];
      const meta = TEMPLATES[firstId];
      const defaults: Record<string, string> = {};
      meta?.paramFields.forEach(f => { defaults[f.key] = f.defaultValue; });
      dispatch({ type: 'SET_TEMPLATE', templateId: firstId, templateParams: defaults });
    }
  }, []);

  const updateParam = useCallback((key: string, value: string) => {
    dispatch({
      type: 'SET_TEMPLATE',
      templateId: state.templateId,
      templateParams: { ...state.templateParams, [key]: value },
    });
  }, [dispatch, state.templateId, state.templateParams]);

  const selectTemplate = useCallback((id: string) => {
    const meta = TEMPLATES[id];
    const defaults: Record<string, string> = {};
    meta?.paramFields.forEach(f => { defaults[f.key] = f.defaultValue; });
    dispatch({ type: 'SET_TEMPLATE', templateId: id, templateParams: defaults });
  }, [dispatch]);

  // Live preview rendering
  useEffect(() => {
    let cancelled = false;
    async function doRender() {
      if (!ev || !sample) { setPreviewHtml(''); return; }
      try {
        setRenderErr('');
        const html = await buildEmailHtml(
          state.templateId,
          state.templateParams,
          state.htmlBody,
          sample,
          ev
        );
        if (!cancelled) setPreviewHtml(html);
      } catch (e) {
        if (!cancelled) setRenderErr(e instanceof Error ? e.message : 'Render failed');
      }
    }
    doRender();
    return () => { cancelled = true; };
  }, [state.templateId, state.templateParams, state.htmlBody, sample, ev]);

  const recipientCount = state.invitees.length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <div
        className="px-4 pt-3 pb-2.5 flex flex-col gap-2.5 shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
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
            onChange={e => dispatch({ type: 'SET_COMPOSE', subject: e.target.value, html: state.htmlBody })}
            placeholder="You are cordially invited to {{EventName}}"
          />
        </div>

        {/* Template selector */}
        <div className="flex items-center gap-2.5">
          <label className="if-label" style={{ flexShrink: 0, marginBottom: 0 }}>Template</label>
          <select
            className="if-input"
            value={templateId}
            onChange={e => selectTemplate(e.target.value)}
            style={{ flex: 1 }}
          >
            {!templateMeta && <option value="">Select a template</option>}
            {Object.entries(TEMPLATES).map(([id, meta]) => (
              <option key={id} value={id}>{meta.name}</option>
            ))}
          </select>
          {templateMeta && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{templateMeta.description}</span>
          )}
        </div>
      </div>

      {/* ── Editor + Preview split ─────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden md:grid md:grid-cols-2">
        {/* Editor pane */}
        <div
          className={`h-full overflow-auto p-4 ${activePane === 'edit' ? 'block' : 'hidden'} md:block`}
          style={{ borderRight: '1px solid var(--border)' }}
        >
          <div className="if-section-label mb-2.5">PARAMETERS</div>

          {templateMeta?.paramFields.map((field: ParamField) => (
            <div key={field.key} className="mb-3">
              <label className="if-label" style={{ fontSize: 11, marginBottom: 4 }}>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  className="if-input"
                  rows={4}
                  value={state.templateParams[field.key] ?? field.defaultValue}
                  onChange={e => updateParam(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  style={{ resize: 'vertical' }}
                />
              ) : (
                <input
                  className="if-input"
                  type="text"
                  value={state.templateParams[field.key] ?? field.defaultValue}
                  onChange={e => updateParam(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}

          {!templateMeta && (
            <div className="if-empty" style={{ padding: '24px 0' }}>
              Select a template to edit parameters.
            </div>
          )}

          {/* Legacy HTML fallback toggle */}
          <div className="mt-4" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <button
              className="if-btn sm"
              onClick={() => {
                if (state.templateId) {
                  dispatch({ type: 'SET_TEMPLATE', templateId: null, templateParams: {} });
                } else {
                  const firstId = Object.keys(TEMPLATES)[0];
                  selectTemplate(firstId);
                }
              }}
            >
              {state.templateId ? 'Switch to legacy HTML editor' : 'Switch to React Email template'}
            </button>
          </div>

          {!state.templateId && (
            <div className="mt-3">
              <label className="if-label" style={{ fontSize: 11, marginBottom: 4 }}>Legacy HTML Body</label>
              <textarea
                className="if-input"
                rows={12}
                value={state.htmlBody}
                onChange={e => dispatch({ type: 'SET_COMPOSE', subject: state.textSubject, html: e.target.value })}
                placeholder="<p>Dear...</p>"
                style={{ resize: 'vertical', fontFamily: 'var(--rf-mono)', fontSize: 12 }}
              />
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 7, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                TOKENS
              </div>
              <div style={{ fontFamily: 'var(--rf-serif)', fontSize: 16, fontWeight: 500, color: 'var(--text-heading)', lineHeight: 1 }}>
                {Object.keys(state.templateParams).length}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 7, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                RECIPIENTS
              </div>
              <div style={{ fontFamily: 'var(--rf-serif)', fontSize: 16, fontWeight: 500, color: 'var(--text-heading)', lineHeight: 1 }}>
                {recipientCount}
              </div>
            </div>
          </div>
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
          {renderErr && (
            <div className="if-status err mb-3">{renderErr}</div>
          )}
          {!sample && (
            <div className="if-empty" style={{ padding: '24px 0' }}>
              Add invitees first to see a personalized preview.
            </div>
          )}
          {sample && previewHtml && (
            <div
              style={{
                background: '#fff',
                borderRadius: 8,
                padding: 16,
                fontSize: 13,
                lineHeight: '1.7',
                color: '#1a1a1a',
              }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          )}
        </div>
      </div>
    </div>
  );
}