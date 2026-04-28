export const CSS = `
@keyframes cs-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
@keyframes cs-spin   { to{transform:rotate(360deg)} }

.cs-root {
  height: 100dvh; display: flex; flex-direction: column;
  background: #080c10; font-family: 'Courier New', monospace;
  font-size: 11px; overflow: hidden; color: #c9d1d9;
}

/* ── Buttons ── */
.cs-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 5px;
  min-height: 36px; padding: 0 14px; border-radius: 6px;
  border: 1px solid #30363d; background: transparent; color: #8b949e;
  font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: .04em;
  cursor: pointer; white-space: nowrap;
  transition: border-color .15s, color .15s, background .15s;
}
.cs-btn:hover:not(:disabled) { border-color: #58a6ff; color: #f0f6fc; }
.cs-btn:disabled              { opacity: .4; cursor: not-allowed; }
.cs-btn:focus-visible         { outline: 2px solid #58a6ff; outline-offset: 2px; }

.cs-btn.pri { background: #1f6feb; border-color: #1f6feb; color: #fff; }
.cs-btn.pri:hover:not(:disabled) { background: #388bfd; border-color: #388bfd; }
.cs-btn.grn { background: #238636; border-color: #238636; color: #fff; }
.cs-btn.grn:hover:not(:disabled) { background: #2ea043; border-color: #2ea043; }
.cs-btn.del { border-color: #da3633; color: #f85149; }
.cs-btn.del:hover:not(:disabled) { background: rgba(218,54,51,.1); }
.cs-btn.sm  { min-height: 28px; padding: 0 10px; font-size: 10px; }

/* ── Input ── */
.cs-input {
  width: 100%; background: #010409; border: 1px solid #30363d; border-radius: 5px;
  color: #c9d1d9; font-family: 'Courier New', monospace; font-size: 11px;
  padding: 8px 10px; outline: none;
}
.cs-input:focus         { border-color: #1f6feb; }
.cs-input:focus-visible { outline: 2px solid #58a6ff; outline-offset: 2px; }
.cs-input.err           { border-color: #da3633; }

/* ── Layout shell ── */
.cs-layout { display: flex; flex: 1; overflow: hidden; min-height: 0; }
.cs-main   { flex: 1; overflow-y: auto; min-height: 0; min-width: 0; }

/* ── Log sidebar (always visible ≥ 1024px) ── */
.cs-log-sidebar {
  width: 240px; flex-shrink: 0; overflow-y: auto; padding: 12px 14px;
  background: #050709; border-left: 1px solid #161b22;
  display: flex; flex-direction: column; gap: 4px;
}
.cs-log-btn { display: none; }

/* ── Tab bar ── */
.cs-tab-bar {
  display: flex; border-bottom: 1px solid #21262d; flex-shrink: 0;
  overflow-x: auto; scrollbar-width: none;
}
.cs-tab-bar::-webkit-scrollbar { display: none; }
.cs-tab {
  background: none; border: none; border-bottom: 2px solid transparent;
  padding: 10px 18px; font-family: 'Courier New', monospace;
  font-size: 10px; letter-spacing: .06em; color: #8b949e; cursor: pointer; white-space: nowrap;
}
.cs-tab.active           { color: #f0f6fc; border-bottom-color: #1f6feb; }
.cs-tab:hover            { color: #c9d1d9; }
.cs-tab:focus-visible    { outline: 2px solid #58a6ff; outline-offset: -2px; }

/* ── Banners ── */
.cs-banner {
  padding: 12px 20px; flex-shrink: 0;
  display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-start;
}
.cs-banner.info { background: #060d1a; border-bottom: 1px solid #1f6feb; }
.cs-banner.warn { background: #1a0e00; border-bottom: 1px solid #bb8009; }
.cs-banner-body { flex: 1; min-width: 0; }
.cs-banner-title { font-size: 11px; font-weight: 600; margin-bottom: 3px; }
.cs-banner.info .cs-banner-title { color: #58a6ff; }
.cs-banner.warn .cs-banner-title { color: #e3b341; }
.cs-banner-text  { font-size: 10px; color: #8b949e; line-height: 1.7; margin-bottom: 8px; }

/* ── Stats bar ── */
.cs-stats {
  padding: 5px 20px; border-bottom: 1px solid #161b22;
  display: flex; gap: 14px; flex-wrap: wrap; align-items: center; flex-shrink: 0;
}
.cs-stat        { display: flex; align-items: center; gap: 4px; }
.cs-stat-dot    { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.cs-stat-label  { font-size: 9px; color: #8b949e; letter-spacing: .1em; }
.cs-stat-val    { font-size: 12px; font-weight: 500; }

.cs-progress-wrap  { margin-left: auto; display: flex; align-items: center; gap: 6px; }
.cs-progress-track { width: 90px; height: 3px; background: #21262d; border-radius: 2px; overflow: hidden; }
.cs-progress-fill  { height: 100%; background: #1f6feb; border-radius: 2px; transition: width .2s; }

/* ── Cards ── */
.cs-card { background: #0d1117; border: 1px solid #21262d; border-radius: 8px; padding: 14px 16px; }

/* ── Section label ── */
.cs-section-label { font-size: 9px; color: #8b949e; letter-spacing: .14em; text-transform: uppercase; }

/* ── Category pills ── */
.cs-pill {
  display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px;
  border: 1px solid #21262d; background: transparent; color: #8b949e;
  font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: .07em;
  cursor: pointer; white-space: nowrap;
}
.cs-pill:hover           { border-color: #30363d; color: #c9d1d9; }
.cs-pill.active          { border-color: #1f6feb; background: #0c2d6b; color: #58a6ff; }
.cs-pill:focus-visible   { outline: 2px solid #58a6ff; outline-offset: 2px; }

/* ── Status tag ── */
.cs-tag {
  display: inline-flex; align-items: center; padding: 2px 7px;
  border-radius: 4px; border: 1px solid; font-size: 9px; letter-spacing: .07em;
}

/* ── New-candidate card ── */
.cs-new-card {
  background: #0c1a2e; border: 1px solid #1f4f99; border-radius: 6px;
  padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; gap: 8px;
}

/* ── Officials list row ── */
.cs-official-row {
  display: grid; grid-template-columns: 20px 1fr 105px 90px 14px;
  gap: 8px; padding: 10px 18px; cursor: pointer;
  border-bottom: 1px solid #0d1117; align-items: start;
}
.cs-official-row:hover   { background: #0d1117; }
.cs-official-cat         { padding-top: 1px; }
.cs-official-expand {
  background: #0d1117; border: 1px solid #21262d; border-radius: 5px;
  padding: 10px 12px; font-size: 10px; line-height: 1.8;
  margin: 0 18px 8px 46px;
}

/* ── Empty state ── */
.cs-empty       { padding: 48px 24px; text-align: center; }
.cs-empty-title { font-size: 13px; color: #c9d1d9; margin-bottom: 8px; }
.cs-empty-sub   { font-size: 11px; color: #8b949e; margin-bottom: 16px; }

/* ── Modal ── */
.cs-modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,.8); z-index: 50;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.cs-modal {
  background: #0d1117; border: 1px solid #30363d; border-radius: 10px;
  padding: 24px; width: 100%; max-width: 460px; max-height: 90dvh; overflow-y: auto;
}
.cs-modal-title { font-size: 13px; color: #f0f6fc; font-weight: 700; margin-bottom: 4px; }
.cs-modal-sub   { font-size: 10px; color: #8b949e; line-height: 1.7; margin-bottom: 16px; }
.cs-field       { margin-bottom: 12px; }
.cs-field-label {
  font-size: 9px; color: #8b949e; letter-spacing: .14em;
  text-transform: uppercase; margin-bottom: 5px;
}

/* ── Responsive ── */
@media (max-width: 1023px) {
  .cs-log-sidebar { display: none; }
  .cs-log-sidebar.show {
    display: flex; position: fixed; bottom: 0; left: 0; right: 0;
    width: 100%; height: 50dvh; z-index: 40;
    border-left: none; border-top: 1px solid #21262d;
  }
  .cs-log-btn { display: inline-flex; }
}

@media (max-width: 767px) {
  .cs-btn    { min-height: 44px; padding: 0 18px; font-size: 13px; border-radius: 8px; }
  .cs-btn.sm { min-height: 36px; padding: 0 14px; font-size: 11px; }
  .cs-official-row { grid-template-columns: 20px 1fr 90px 14px; }
  .cs-official-cat { display: none; }
}
`;
