# InviteFlow ADHD/auDHD UX Overhaul — Implementation Plan

Author: Lenya Chan
Date: 2026-05-22
Spec: `docs/superpowers/specs/2026-05-22-adhd-ux-spec.md`
Status: Ready to implement — execute phases in order

---

## Codebase Snapshot (for implementers)

Single-page React + TypeScript app with a custom stack-based router (`RouterContext`; `navigate(RouteId)` calls) and a single `useReducer` store (`AppContext`). Styling is CSS custom properties in `theme.css` + utility classes in `if.css`. PrimeReact is used only in `InviteesPage` for `DataTable`.

Current fonts:
- `--rf-serif`: Fraunces (page titles, stat values)
- `--rf-mono`: Geist Mono (everything else — labels, buttons, body, nav)
- `--rf-sans`: system-ui (declared but unused)

`state.unsaved` is already tracked in `AppState` and set to `true` by `ADD_EVENT`, `UPDATE_EVENT`, `SET_INVITEES`, `ADD_INVITEE`, `UPDATE_INVITEE`, `DELETE_INVITEES`, `SET_COMPOSE`. It is **never displayed**.

`SEND_PROGRESS` action already tracks `{ current, total }` but does **not** track the current recipient name. Phase 1 adds this.

---

## Phase 0 — Visual Foundation

**Goal:** Update all color, typography, and motion tokens — CSS and HTML only, zero component logic changes.

### Files changed

#### `src/inviteflow/index.html`

Replace the existing Google Fonts `<link>` with a combined import for all four families:

```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,700;1,9..144,400;1,9..144,500&family=Geist+Mono:wght@400;500;600&family=Lexend:wght@300;400;500;600&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
```

Note: Atkinson Hyperlegible is not a variable font — enumerate each style explicitly. Lexend is variable; request `wght@300;400;500;600`.

#### `src/inviteflow/theme.css`

Full replacement of the `:root` token block. The current palette is warm brown/terracotta. New palette is warm dark gray + blue accent.

**Backgrounds:**
```css
--bg-root:      #141416;    /* was: #14110d */
--bg-surface:   #1C1C1F;    /* was: #1c1814 */
--bg-elevated:  #242428;    /* NEW */
--bg-subtle:    #2A2A2E;    /* was: #221d18 */
--bg-nested:    #2A2A2E;    /* was: #221d18 — sync to bg-subtle */
--bg-dense:     #0E0E10;    /* was: #0d0b08 */
--bg-overlay:   rgba(0,0,0,0.55);  /* NEW — for modal backdrops */
```

**Borders:**
```css
--border:         #2E2E32;    /* was: #2c2620 */
--border-subtle:  #252528;    /* was: #251f1a */
--border-input:   #3A3A3F;    /* was: #3d342c */
--border-focus:   #5B8DEF;    /* NEW */
--border-strong:  #4A4A50;    /* NEW */
```

**Text:**
```css
--text-heading:    #E8E6E1;   /* was: #f4ede0 */
--text-base:       #C9C7C0;   /* was: #c8bda9 — keep token name, update value */
--text-secondary:  #9B9890;   /* was: #8a8170 — contrast upgrade */
--text-muted:      #6B6864;   /* was: #6a6055 */
--text-dim:        #5A5855;   /* was: #756a5e */
--text-placeholder:#5A5855;   /* NEW alias */
```

**Accent (terracotta → blue — full replacement):**
```css
--accent:           #5B8DEF;               /* was: #e57158 */
--accent-hover:     #6F9DF2;               /* was: --accent-highlight: #f08c76 */
--accent-muted:     rgba(91,141,239,0.15); /* NEW */
--accent-text:      #93B8FF;               /* NEW */
--accent-border:    #2A3D5A;               /* was: #7a3426 */
/* Remove: --accent-highlight (replaced by --accent-hover) */
```

**Status tokens:**
```css
--success:          #5CB87A;   /* was: #7ba577 */
--success-bg:       #1A2E1F;   /* was: #3d5a3a */
--success-border:   #2D5038;   /* NEW */
--danger:           #E06464;   /* was: #cc6555 */
--danger-bg:        #2E1A1A;   /* NEW */
--danger-dark:      #5A2A2A;   /* was: #a34535 */
--warning:          #D4A44C;   /* was: #d4a942 */
--warning-bg:       #2E2518;   /* NEW */
--warning-border:   #5A4820;   /* was: #8a6b1e */
--info:             #5B8DEF;   /* NEW — matches --accent */
--info-bg:          #1A2235;   /* NEW */
--info-border:      #2A3D5A;   /* NEW */
/* Remove: --amber, --blue, --purple, --gold (use semantic tokens instead) */
```

**Typography tokens:**
```css
/* Keep: */
--rf-serif: 'Fraunces', 'Georgia', serif;
--rf-mono:  'Geist Mono', 'JetBrains Mono', 'Consolas', monospace;
/* Update --rf-sans and add named aliases: */
--rf-sans:    'Lexend', 'Inter', system-ui, sans-serif;
--font-body:  'Lexend', 'Inter', system-ui, sans-serif;
--font-label: 'Atkinson Hyperlegible', 'Inter', sans-serif;
--font-mono:  'Geist Mono', 'JetBrains Mono', 'Consolas', monospace;
```

**Line-height tokens (all new):**
```css
--lh-body:    1.65;
--lh-ui:      1.4;
--lh-heading: 1.25;
--lh-table:   1.4;
```

**Letter-spacing tokens (all new):**
```css
--ls-body:        0em;
--ls-label-upper: 0.08em;
--ls-micro:       0.12em;
```

**Spacing tokens (8-point grid, all new):**
```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
```

Keep all `--rt-*` layout tokens unchanged.

#### `src/inviteflow/styles/if.css`

Six targeted updates — no structural changes:

**1. Font-family replacements:**
- `.if-card-row-title`: `var(--rf-serif)` → `var(--font-body)`, `font-size: 14px` → `15px`, add `line-height: var(--lh-ui)`
- `.if-card-row-sub`: keep `--rf-mono`, `font-size: 10px` → `11px`
- `.if-label`: `var(--rf-mono)` → `var(--font-label)`, `font-size: 9px` → `12px`
- `.if-input`: `var(--rf-mono)` → `var(--font-body)`, `font-size: 12px` → `14px`, add `line-height: var(--lh-ui)`
- `.if-primary-btn`: `var(--rf-mono)` → `var(--font-body)`, `font-size: 13px` → `15px`
- `.if-btn`: `var(--rf-mono)` → `var(--font-body)`, `font-size: 10px` → `13px`, add `line-height: var(--lh-ui)`
- `.if-empty`: `var(--rf-serif)` → `var(--font-body)`, `font-size: 14px` → `16px`, add `line-height: var(--lh-body)`
- `.if-stat-chip-label`: keep `--rf-mono`, `font-size: 8px` → `11px`

Monospace stays for: `.if-section-label`, `.if-eyebrow`, `.if-meta-line`, `.if-code`, token buttons in ComposePage, status chips.

**2. Motion — reduce all transitions to spec durations:**
- `.if-card-row`: `background 0.1s` → `background 150ms ease-out`
- `.if-btn`: all transitions → `150ms ease-out`
- `.if-primary-btn`: `background 0.15s` → `background 150ms ease-out`
- `.if-tab-option`, `.if-filter-chip`, `.if-nav-tab`: all → `150ms ease-out`

**3. Add `prefers-reduced-motion` block at bottom of file:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
Use `0.01ms` not `0s` — PrimeReact and progress bar rely on `transitionend` events.

**4. Status pill — update border tokens:**
- `.if-status-pill.good`: `border-color: var(--success-bg)` → `var(--success-border)`
- `.if-row-chip.bad`: `background: rgba(163,69,53,0.15)` → `var(--danger-bg)`

**5. Modal backdrop:**
- `.if-modal-backdrop`: `background: rgba(0,0,0,0.8)` → `var(--bg-overlay)`

**6. Filled chip contrast fix:**
- `.if-row-chip.filled`: add `color: var(--text-heading)` — `#5B8DEF` (blue) on white fails WCAG AA (~3.4:1); `#E8E6E1` on `#5B8DEF` passes.

#### `src/inviteflow/App.tsx`

One line: root `div` style `fontFamily: 'var(--font-body)'` (was `'var(--rf-mono)'`).

### Key implementation notes — Phase 0

1. **`--accent-highlight` rename hazard:** Every use of `var(--accent-highlight)` must be replaced with `var(--accent-hover)` before committing. Grep: `grep -r "accent-highlight" src/inviteflow/`.

2. **Do not rename `--text-base`:** Components use `var(--text-base)`, not `var(--text-primary)`. Update the hex value; keep the token name.

3. **Order of operations:** `index.html` → `theme.css` → `if.css` → `App.tsx`. Visual test after each file.

### Verification — Phase 0

- Background is `#141416` (warm gray, not brown)
- Page titles render in Fraunces (serif/italic)
- Button labels render in Lexend (rounder than Geist Mono)
- Form field labels render in Atkinson Hyperlegible
- Active nav tab and primary buttons show blue accent (`#5B8DEF`)
- DevTools → "Emulate prefers-reduced-motion: reduce" → all transitions disappear
- Lighthouse accessibility audit: no new contrast failures
- Grep for old accent/background hex values — none appear in computed styles

---

## Phase 1 — Core Behavioral UX

**Goal:** Eliminate the three highest-friction ADHD blockers: decision paralysis on EventDashboard, no live progress during bulk send, and invisible unsaved-state anxiety.

### Files changed

#### `src/inviteflow/types.ts`

Extend `sendProgress` in `AppState`:
```ts
sendProgress: { current: number; total: number; currentName: string };
```

#### `src/inviteflow/state/actions.ts`

Update `SEND_PROGRESS` action:
```ts
| { type: 'SEND_PROGRESS'; current: number; currentName: string }
```

#### `src/inviteflow/state/reducer.ts`

- `INITIAL_STATE.sendProgress`: add `currentName: ''`
- `START_SEND` case: include `currentName: ''` in reset
- `SEND_PROGRESS` case: spread in `currentName: action.currentName`

#### `src/inviteflow/pages/EventDashboard.tsx`

**Replace 5 equal-weight workflow rows with a single dominant CTA driven by app state.**

Add a pure `getNextStep(state: AppState): NextStep` function above the component:

```tsx
type StepId = 'invitees' | 'compose' | 'send' | 'tracker';

interface NextStep {
  id: StepId;
  route: RouteId;
  ctaLabel: string;   // concrete outcome, e.g. "Import your guest list →"
  contextLine: string; // e.g. "No invitees added yet"
}

function getNextStep(state: AppState): NextStep {
  const hasInvitees = state.invitees.length > 0;
  const hasTemplate = !!state.htmlBody.trim();
  const pendingCount = state.invitees.filter(i => i.inviteStatus === 'pending').length;
  const sentCount    = state.invitees.filter(i => i.inviteStatus === 'sent').length;

  if (!hasInvitees) return {
    id: 'invitees', route: 'invitees',
    ctaLabel: 'Import your guest list →',
    contextLine: 'No invitees added yet — start here.',
  };
  if (!hasTemplate) return {
    id: 'compose', route: 'compose',
    ctaLabel: 'Write the invitation email →',
    contextLine: `${state.invitees.length} invitees ready, no template yet.`,
  };
  if (pendingCount > 0) return {
    id: 'send', route: 'send',
    ctaLabel: `Send to ${pendingCount} pending invitee${pendingCount !== 1 ? 's' : ''} →`,
    contextLine: `${sentCount} already sent. ${pendingCount} remaining.`,
  };
  return {
    id: 'tracker', route: 'tracker',
    ctaLabel: 'Review RSVP responses →',
    contextLine: `All ${sentCount} invites sent. Waiting for responses.`,
  };
}
```

**Layout — two zones:**

Zone 1 (dominant CTA): single `if-card` with `padding: 20px` containing:
- `"NEXT STEP"` in `.if-section-label`
- `ctaLabel` at `font-size: 17px, font-family: var(--font-body), font-weight: 600, color: var(--text-heading)`
- `contextLine` at `font-size: 12px, font-family: var(--rf-mono), color: var(--text-secondary)`
- Full-width `.if-primary-btn` with the `ctaLabel` text

Zone 2 (secondary nav): remaining 4 steps in `if-card-row` style, `color: var(--text-secondary)`. The current/next step chip gets `.filled`; completed steps get `.if-row-chip good`; future steps get default `.if-row-chip`.

**Stats card:** Update narrative — stat value = sent count, sub-label = `"of ${total} TOTAL"`.

#### `src/inviteflow/pages/SendPage.tsx`

**Part A — Pre-flight confirmation gate:**

Add local state: `const [confirmOpen, setConfirmOpen] = useState(false);`

Restructure the send action into two phases:
1. `handleSendClick()` — validates pre-conditions, sets `confirmOpen(true)` on pass
2. `handleConfirmSend()` — called from modal "Confirm & Send" button; dispatches the actual send

Confirmation modal content:
```
Title: "Ready to send?"
Body:  "Sending to {N} {filter} invitees.
        From: {ev.contactEmail}
        Subject: {state.textSubject || '(no subject set)'}
        This will run in the background once confirmed."
Buttons: [Confirm & Send (if-btn pri)] [Cancel (if-btn)]
```

Add Escape key handler (pattern: `useEffect` with `keydown` listener, cleanup on unmount).

**Part B — Live per-item progress:**

Replace the current static progress bar (lines 143–153) with:
```tsx
{state.sending && (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between',
      fontFamily: 'var(--rf-mono)', fontSize: 11, color: 'var(--text-secondary)',
      marginBottom: 8, letterSpacing: '0.06em' }}>
      <span style={{ color: 'var(--text-heading)' }}>
        Sending to: {state.sendProgress.currentName || '…'}
      </span>
      <span>
        {state.sendProgress.current} of {state.sendProgress.total} ({progress}%)
      </span>
    </div>
    <div className="if-progress-track">
      <div className="if-progress-fill" style={{ width: `${progress}%` }} />
    </div>
  </div>
)}
```

**Part C — CTA label updates (sentence case, concrete):**
- Idle: `"Send to ${filtered.length} pending invitee${...} →"`
- Sending: `"Sending ${current} of ${total}…"` with `disabled={true}`

**Part D — Shame-free error messages:**
- `'No active event'` → `'No event selected — go back and choose one.'`
- `'No email body'` → `"No invitation template yet — tap Compose to write one."`
- `'No invitees match'` → `"No invitees match this filter — try 'All'."`

#### `src/inviteflow/pages/InviteesPage.tsx`

**Add responsive mobile card view below 768px. Desktop DataTable unchanged.**

Add hook above component definition:
```tsx
function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return mobile;
}
```

Conditional render: `{isMobile ? <InviteeMobileList ... /> : <DataTable ... />}`

`InviteeMobileList` (local component, same file) — each card is `if-card` with `padding: 14px 16px, marginBottom: 8px`:
- Row 1: Name (`.if-card-row-title`) + invite status pill
- Row 2: Title + category in `.if-card-row-sub`
- Row 3: Email as `mailto:` link in `.if-card-row-sub`
- Row 4: RSVP status badge (`.if-tag`)
- Tap → expand inline edit using `editTarget: Invitee | null` state; reuse existing Add modal pre-populated

All toolbar buttons (Export, Import, bulk bar) remain unchanged — not PrimeReact-specific.

Add to `if.css` mobile block: `.if-header-btn { min-height: 44px; width: 44px; }`

#### `src/inviteflow/components/PageHeader.tsx`

Import `useAppState`. When `state.unsaved` is true, render a 5px amber dot in the eyebrow line:

```tsx
<div className="if-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
  {eyebrow}
  {state.unsaved && (
    <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
      background: 'var(--warning)', flexShrink: 0 }}
      aria-label="Unsaved changes" title="You have unsaved changes" />
  )}
</div>
```

Also: in `EventSetupPage.tsx` save function, add `dispatch({ type: 'SET_UNSAVED', unsaved: false })` immediately after `dispatch({ type: 'UPDATE_EVENT', event: saved })`.

### Key implementation notes — Phase 1

1. **`getNextStep` is pure** — takes `AppState` subset as input, deterministic. Keep in `EventDashboard.tsx`.
2. **`sendProgress.currentName` is `''` until real send loop is implemented.** UI shows `"Sending to: …"` gracefully.
3. **`InviteeMobileList` edit** — reuse existing `showAdd` / `draft` / `setDraft` state. Add `editTarget: Invitee | null` state; branch modal title/submit between "Add Invitee" and "Edit Invitee".
4. **Do not remove `DataTable` import** — still renders on desktop.

### Verification — Phase 1

- **EventDashboard CTAs:** 0 invitees → "Import your guest list →". Invitees but no template → "Write the invitation email →". Pending invitees → "Send to N pending invitees →". All sent → "Review RSVP responses →".
- **SendPage:** Click send → confirmation modal appears with count, email, subject. Escape → modal closes. During send: "Sending to: …" live-updates.
- **InviteesPage:** Resize to <768px → card view appears; desktop → DataTable.
- **PageHeader:** Edit a field in EventSetupPage → amber dot appears. Save → dot disappears.

---

## Phase 2 — UX Structure

**Goal:** Reduce cognitive cost of reading, scanning, and filling forms through consistent language, grouped fields, and categorized controls.

### Files changed

#### `src/inviteflow/pages/EventSetupPage.tsx`

**Split 12 fields into 3 labeled sections.**

Replace single `FIELDS` array with three typed arrays (all typed as `Array<{ key: keyof AppEvent; label: string; type?: string; placeholder?: string }>`):

```
FIELDS_DETAILS: name, date, venue, orgName, vipStart, vipEnd
FIELDS_CONTACT: contactName, contactEmail
FIELDS_LINKS:   formUrl, entryEmail, rsvpResponseUrl, masterSheetUrl, imgEmblemUrl
```

Render as three `<section>` elements with `.if-section-label` headers:
- `"EVENT DETAILS"`
- `"CONTACT & SENDER"` + inline `<span style={{ color: 'var(--warning)' }}>REQUIRED FOR SENDING</span>`
- `"LINKS & CONFIGURATION"`

OAuth section (Google Client ID + auth buttons) stays as a separate card above all three, labeled `"GOOGLE OAUTH"`.

**Field label updates:**
- `'Event Name'` → `'Event name'`
- `'Contact Email'` → `'Sender email (used as From address)'`
- `'Google Form Base URL'` → `'RSVP form URL'`
- `'Form Email Entry ID'` → `'Form email entry ID (entry.XXXXXXXX)'`

#### `src/inviteflow/pages/TrackerPage.tsx`

**Narrative stat labels:**

Replace bare labels with narrative sub-labels below each value:
```
sent         → sub: "of {total} invited"
attending    → sub: "of {sent} invited"
noResponse   → sub: "of {sent} invited"
declined     → sub: "declined" (hide when declined === 0 on mobile)
```

**Status label unification:**

Filter chips: `All / Yes / Pending / No` → `All / Attending / Awaiting / Declined`

Legend text: `"{n} YES"` / `"{n} PEND"` / `"{n} NO"` → `"attending"` / `"awaiting"` / `"declined"`

Invitee status display:
- `pending` → omit (or small muted `"not yet sent"`)
- `sent` → `"Invited"` in `var(--success)`
- `failed` → `"Send failed"` in `var(--danger)` + text link `"→ retry in Send"`

#### `src/inviteflow/pages/SendPage.tsx`

**Narrative stat chips:**
```
pendingCount  → sub: "of {total} total"
sentCount     → sub: "sent successfully"
failedCount   → sub: "of {total} total"
filtered.length → sub: "will receive"
```

To show the sub-label below the value, render the `.if-stat-chip-label` after `.if-stat-chip-value` with `margin-top: 3px` inline.

#### `src/inviteflow/pages/ComposePage.tsx`

**Group 14 token buttons into 3 labeled rows.**

Replace flat `TOKENS` array with:
```tsx
const TOKEN_GROUPS = [
  { label: 'Guest', tokens: ['FirstName','LastName','FullName','FullTitle'] },
  { label: 'Event', tokens: ['EventName','EventDate','Venue','VIPStart','VIPEnd'] },
  { label: 'Meta',  tokens: ['OrgName','ContactName','ContactEmail','RSVP_Link','Date_Sent'] },
];
```

Render as column of rows; each row has a `9px uppercase mono` category label (36px min-width) + wrapped token buttons. Token text color: `var(--accent-text)` (`#93B8FF`); border: `var(--accent-border)`.

#### `src/inviteflow/pages/SettingsPage.tsx`

**Visually distinguish required vs. optional:**

Required email section card: add `borderLeft: '3px solid var(--warning)'`.

Section label: `"EMAIL"` + `<span class="if-status-pill accent" style={{ marginLeft: 8, fontSize: 8 }}>REQUIRED FOR SENDING</span>`.

Optional discover section: remove `(OPTIONAL)` from label text; replace with `<span style={{ color: 'var(--text-muted)', fontSize: 9 }}> · optional</span>`.

#### Button label audit (all pages)

| Current | New |
|---------|-----|
| `"SEND ${n} INVITATIONS →"` (SendPage) | `"Send to ${n} pending invitees →"` *(done in P1)* |
| `"SAVE EVENT"` (EventSetupPage) | `"Save event"` |
| `"CONTINUE TO SEND →"` (ComposePage) | `"Continue to send →"` |
| `"Gen RSVP Links"` (InviteesPage) | `"Generate RSVP links"` |
| `"Import JSON"` (InviteesPage) | `"Import from JSON"` |

### Key implementation notes — Phase 2

1. **FIELDS array typing:** Preserve `Array<{ key: keyof AppEvent; label: string; type?: string; placeholder?: string }>` for all three new arrays — TypeScript enforces valid keys.
2. **Status terminology enumeration:**
   - `inviteStatus` values `'pending'` / `'sent'` / `'failed'` → display as `"Not sent"` / `"Invited"` / `"Send failed"`
   - `rsvpStatus` values `'No Response'` / `'Attending'` / `'Declined'` → display as `"No response"` / `"Attending"` / `"Declined"`

### Verification — Phase 2

- EventSetupPage: three distinct labeled sections; "CONTACT & SENDER" has warning annotation; all labels sentence-case.
- TrackerPage: stats read narrative style; filter chips read "All / Attending / Awaiting / Declined"; invitee rows show "Invited" / "Send failed".
- ComposePage: token buttons in 3 labeled rows; token text is `#93B8FF` blue.
- SettingsPage: required section has left-border emphasis and pill label.
- All pages: no ALL-CAPS button labels except filter chips (mono caps are convention, not labels).

---

## Phase 3 — Polish and Momentum

**Goal:** Add micro-rewards for task completion, clear post-operation landing states, improved empty states, modal accessibility, and shame-free error copy throughout.

### Files changed

#### `src/inviteflow/styles/if.css`

Add completion animation classes:
```css
/* ─── COMPLETION ANIMATIONS ──────────────────────────────────────────────── */
@keyframes if-step-done {
  0%   { opacity: 0; transform: scale(0.85); }
  60%  { opacity: 1; transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
}
.if-step-done {
  animation: if-step-done 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes if-fade-up {
  0%   { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}
.if-fade-up {
  animation: if-fade-up 250ms ease-out forwards;
}
```

These respect the `prefers-reduced-motion` block from Phase 0 (`animation-duration: 0.01ms`).

#### `src/inviteflow/pages/EventDashboard.tsx`

**Step completion animation on workflow chip.**

Use `key` prop to force re-mount when step advances (replays CSS animation):
```tsx
<div
  key={`chip-${nextStep.id}`}
  className="if-row-chip filled if-step-done"
  ...
>
```

Completed steps: `.if-row-chip good` (static green). Future steps: `.if-row-chip` (default gray). Only the current next step gets `.if-step-done`.

#### `src/inviteflow/pages/SendPage.tsx`

**Post-send soft landing state.**

Add state: `const [sendComplete, setSendComplete] = useState(false);`

Detect transition from `sending: true` → `false`:
```tsx
const prevSending = useRef(false);
useEffect(() => {
  if (prevSending.current && !state.sending && state.sendLog.length > 0) {
    setSendComplete(true);
  }
  prevSending.current = state.sending;
}, [state.sending]);
```

Reset `sendComplete` to `false` in `handleConfirmSend()` at the start of a new send.

When `sendComplete` is true, render above the stat strip:
```tsx
<div className="if-card padded if-fade-up"
  style={{ marginBottom: 16, borderColor: 'var(--success-border)' }}>
  <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600,
    color: 'var(--success)', marginBottom: 4 }}>
    ✓ Invites sent
  </div>
  <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 11,
    color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 12 }}>
    {sentCount} sent successfully
    {failedCount > 0
      ? ` · ${failedCount} couldn't be reached — see Log below`
      : ''}
  </div>
  <button className="if-btn pri"
    onClick={() => { setSendComplete(false); navigate('tracker'); }}>
    See who responded →
  </button>
</div>
```

**Error messages with action buttons:**

Add `errAction` state: `const [errAction, setErrAction] = useState<{ label: string; fn: () => void } | null>(null);`

Pair errors with inline action buttons:
- No template: action `{ label: 'Go to Compose', fn: () => navigate('compose') }`
- No event: action `{ label: 'Go back', fn: goBack }`
- No filter match: action `{ label: "Show all", fn: () => setFilter('all') }`

Update error display:
```tsx
{err && (
  <div className="if-status err"
    style={{ marginBottom: 12, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 10 }}>
    <span>{err}</span>
    {errAction && (
      <button className="if-btn sm" onClick={errAction.fn} style={{ flexShrink: 0 }}>
        {errAction.label}
      </button>
    )}
  </div>
)}
```

Requires adding `goBack` to the `useRouter()` destructure (not currently imported in SendPage).

#### `src/inviteflow/pages/EventsPage.tsx`

Update empty state copy:
- Main text: `"Start by creating your first event"`
- Sub text: `"Each event has its own guest list, email template, and send history."`
- Keep existing "New Event" `.if-btn.pri` button

#### `src/inviteflow/pages/TrackerPage.tsx`

Replace empty state with actionable version:
```tsx
<div className="if-empty">
  No invitees to track yet.
  <div className="if-empty-sub" style={{ marginBottom: 16 }}>
    Add your guest list in the Invitees step first.
  </div>
  <button className="if-btn pri" onClick={() => navigate('invitees')}>
    Go to Invitees →
  </button>
</div>
```

Add `const { navigate } = useRouter();` (currently not imported in TrackerPage).

#### `src/inviteflow/pages/InviteesPage.tsx`

**Modal accessibility improvements:**

1. **Escape key handler:**
```tsx
useEffect(() => {
  if (!showAdd) return;
  const h = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { setShowAdd(false); setDraft({}); }
  };
  document.addEventListener('keydown', h);
  return () => document.removeEventListener('keydown', h);
}, [showAdd]);
```

2. **Visible close button** in modal header alongside title:
```tsx
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
  <div className="if-modal-title">Add invitee</div>
  <button className="if-header-btn" onClick={() => { setShowAdd(false); setDraft({}); }} aria-label="Close">
    <Icon name="x" size={13} />
  </button>
</div>
```

3. **Modal helper text update:** `"Email is required."` → `"Fill in the email address to add someone. All other fields are optional."`

### Key implementation notes — Phase 3

1. **`key` prop animation trick:** Changing `key` on a div forces React to unmount/remount the element, which restarts the CSS animation. This is idiomatic and requires no JS `classList` manipulation.
2. **`prevSending` ref:** `useRef` to track previous `state.sending` value. Effect dependencies: `[state.sending]`. Reset `sendComplete` at start of each new send in `handleConfirmSend()`.
3. **`navigate` in TrackerPage:** Two-line addition — import `useRouter` and destructure `navigate`.
4. **Escape key scope:** Each page's handler is local to that page. Only one page is mounted at a time (stack router), so no conflict between multiple Escape handlers.
5. **Phase 3 order:** `if.css` animation classes → EventDashboard chip → SendPage landing state → empty states → modal improvements.

### Verification — Phase 3

- **EventDashboard:** Advance workflow steps — chip briefly animates on newly active step row (check with DevTools animation inspector).
- **SendPage:** After send completes — green landing card appears with success count and "See who responded →" CTA. Errors appear with adjacent action buttons.
- **EventsPage:** Empty state has descriptive text + "New Event" button.
- **TrackerPage:** Empty state has "Go to Invitees →" button.
- **InviteesPage modal:** Escape key closes modal; X button visible in top-right; helper text mentions optional fields.
- **prefers-reduced-motion:** Toggle → `.if-step-done` and `.if-fade-up` collapse to imperceptible (no visual jump or layout shift).

---

## Cross-Phase Dependency Map

```
Phase 0 (theme.css tokens)
  └─ must complete before any Phase 1–3 work
     (all components reference var(--*) tokens)

Phase 1 (types.ts + actions.ts + reducer.ts state changes)
  └─ must complete before:
     ├─ SendPage Phase 1 (sendProgress.currentName)
     └─ SendPage Phase 3 (landing state reset in handleConfirmSend)

Phase 1 (EventDashboard getNextStep + chip layout)
  └─ must complete before:
     └─ Phase 3 (chip animation — animates the chip Phase 1 introduces)

Phase 1 (confirmOpen modal in SendPage)
  └─ must complete before:
     └─ Phase 3 (sendComplete landing state — same send flow)

Phase 2 items are all independent of each other and of Phase 3.
Phase 3 items are all independent of each other (except CSS classes must precede component use).
```

## Commit Scope Per Phase

Each phase is independently committable without breaking the app:

| Phase | Files touched | TypeScript changes | State changes |
|-------|--------------|-------------------|---------------|
| 0 | `index.html`, `theme.css`, `if.css`, `App.tsx` | None | None |
| 1 | `types.ts`, `actions.ts`, `reducer.ts`, `EventDashboard.tsx`, `SendPage.tsx`, `InviteesPage.tsx`, `PageHeader.tsx`, `EventSetupPage.tsx` | Yes (sendProgress shape) | `sendProgress.currentName` added |
| 2 | `EventSetupPage.tsx`, `TrackerPage.tsx`, `SendPage.tsx`, `ComposePage.tsx`, `SettingsPage.tsx`, `InviteesPage.tsx` | None | None |
| 3 | `if.css`, `EventDashboard.tsx`, `SendPage.tsx`, `EventsPage.tsx`, `TrackerPage.tsx`, `InviteesPage.tsx` | None | None |

## Critical files reference

```
src/inviteflow/
├── index.html                        P0
├── theme.css                         P0
├── styles/if.css                     P0, P3
├── App.tsx                           P0
├── types.ts                          P1
├── state/
│   ├── actions.ts                    P1
│   ├── reducer.ts                    P1
│   └── AppContext.tsx                (read only)
├── components/
│   └── PageHeader.tsx                P1
└── pages/
    ├── EventDashboard.tsx            P1, P3
    ├── SendPage.tsx                  P1, P2, P3
    ├── InviteesPage.tsx              P1, P2, P3
    ├── EventSetupPage.tsx            P1, P2
    ├── ComposePage.tsx               P2
    ├── TrackerPage.tsx               P2, P3
    ├── EventsPage.tsx                P3
    └── SettingsPage.tsx              P2
```
