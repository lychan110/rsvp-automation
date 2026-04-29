# Convene · Roster — Design Language

Author: Lenya Chan
Updated: 2026-04-29

---

## Purpose

This document is the single source of truth for the visual and interaction design of the Convene suite (InviteFlow + ContactScout). All UI work must reference it before introducing colors, spacing, type styles, or component patterns.

The design direction is **Roster** — a warm dark, data-dense, power-user aesthetic. It pairs a terracotta accent with a brown-black ground, Fraunces serif italic for headings, and Geist Mono for all labels and metadata. The result reads like a printed ledger rendered in low light: warm, legible, purposeful.

**Cardinal rules (from `redesign-scaffold/CLAUDE_CODE_HANDOFF.md`)**

1. **Never hardcode spacing, type, or color.** Always reach for a `var(--*)` token. If you find yourself writing `padding: 14px 18px` inline, that value belongs in `--rt-row-pad`.
2. **Never duplicate a row pattern.** If something looks like a row inside a card, use `.if-card-row`. If it needs custom controls, build a thin wrapper that extends `.if-card-row` via a custom right slot — do not write a parallel row from scratch.
3. **Headers are italic everywhere.** `font-style: italic` on `.if-page-title` is the single source of truth. Do not pass an italic span as a title prop.
4. **Dark-only.** No light mode toggle. The app is always dark. PrimeReact overrides and all CSS scope at `:root`, not `.dark`.

---

## Color Palette

All values are exposed as CSS custom properties in `src/inviteflow/theme.css`. The canonical source palette is `R_DARK` in `redesign-scaffold/roster.jsx`.

### Backgrounds

| Token | Value | Use |
|-------|-------|-----|
| `--bg-root` | `#14110d` | App root, deepest layer |
| `--bg-surface` | `#1c1814` | Cards, panels, modals, inputs |
| `--bg-subtle` | `#221d18` | Alternate rows, inset areas, preview pane |
| `--bg-nested` | `#221d18` | Nested surfaces (same as subtle) |
| `--bg-dense` | `#0d0b08` | Extremely dense areas |
| `--bg-info-tint` | `#1a2810` | Info-tinted backgrounds |
| `--bg-warn-tint` | `#221a08` | Warning-tinted backgrounds |

### Borders

| Token | Value | Use |
|-------|-------|-----|
| `--border` | `#2c2620` | Card borders, row dividers |
| `--border-subtle` | `#251f1a` | Very light separators |
| `--border-input` | `#3d342c` | Input borders, secondary dividers, row chips |

### Text

| Token | Value | Use |
|-------|-------|-----|
| `--text-heading` | `#f4ede0` | Page titles, row titles, key values |
| `--text-base` | `#c8bda9` | Body text, list item content |
| `--text-secondary` | `#8a8170` | Metadata, labels, secondary info |
| `--text-muted` | `#6a6055` | Placeholders, dim annotations |
| `--text-dim` | `#756a5e` | Least important content |

### Accent — Terracotta

| Token | Value | Use |
|-------|-------|-----|
| `--accent` | `#e57158` | Primary CTA fill, active tab underline, stat highlights |
| `--accent-highlight` | `#f08c76` | Hover state of accent elements |
| `--accent-border` | `#7a3426` | Subtle accent-colored borders |

### Semantic

| Token | Value | Use |
|-------|-------|-----|
| `--success` | `#7ba577` | Confirmed/attending, sent status, success text |
| `--success-bg` | `#3d5a3a` | Success button fill |
| `--danger` | `#cc6555` | Error text, declined status, destructive actions |
| `--danger-dark` | `#a34535` | Danger button border, error input border |
| `--warning` | `#d4a942` | Warning text, pending/no-response status |
| `--warning-border` | `#8a6b1e` | Warning chip borders |
| `--blue` | `#8aabcc` | Informational accents |
| `--purple` | `#9988cc` | Special-state accents |
| `--gold` | `#d4a942` | Alias for `--warning`; use for highlight values |

**Rule:** Before introducing any new color, search this table for the closest semantic match and reuse it. Add a new entry only if no existing token fits semantically, and document it here.

---

## Typography

Two typefaces only. No other font stacks are permitted inline — if you need a new stack, add it to `theme.css` as a `--rf-*` variable.

| Token | Stack | Role |
|-------|-------|------|
| `--rf-serif` | `'Fraunces', 'Georgia', serif` | Page titles, card row titles, stat values, modal titles — always italic |
| `--rf-mono` | `'Geist Mono', 'JetBrains Mono', 'Consolas', monospace` | All labels, eyebrows, metadata, buttons, inputs, code |
| `--rf-sans` | `system-ui, -apple-system, sans-serif` | Body prose only (rare) |

Fonts are loaded in `src/inviteflow/index.html` via Google Fonts (Fraunces variable + Geist Mono).

### Type Scale

| Role | Font | Size | Weight | Letter-spacing | Case | Notes |
|------|------|------|--------|----------------|------|-------|
| Page eyebrow | mono | 9–10px | 400 | 0.14–0.16em | UPPER | Above every page header |
| Page title | serif | 18px | 500 | −0.01em | Sentence | **Always italic** |
| Section eyebrow | mono | 9–10px | 400 | 0.16em | UPPER | Above a card |
| Card row title | serif | 14px | 500 | −0.005em | Sentence | Truncates with ellipsis |
| Card row sub | mono | 10px | 400 | 0.08em | UPPER | Secondary row info |
| Body | sans | 12px | 400 | — | Sentence | Line-height 1.5 |
| Micro / label | mono | 9px | 400 | 0.12em | UPPER | Field labels, stat labels |
| Button text | mono | 10px | 500 | 0.04–0.06em | UPPER | All buttons |
| Stat value | serif | 18–22px | 500 | — | — | StatChip + large numbers |
| Code | mono | 10px | 400 | — | — | `.if-code` blocks |

---

## Layout Tokens

Defined in `theme.css` as `--rt-*` variables, mirroring the `RT` object in `redesign-scaffold/roster.jsx`. Mutate here; never compute equivalent strings inline.

| Token | Value | Use |
|-------|-------|-----|
| `--rt-page-pad-x` | `20px` | Horizontal page padding |
| `--rt-section-pad` | `0 20px 8px` | Padding around a section eyebrow |
| `--rt-card-margin` | `0 0 12px 0` | Bottom margin between cards |
| `--rt-row-pad` | `11px 14px` | Internal padding of a card row |
| `--rt-row-gap` | `10px` | Horizontal gap between row elements (chip · body · right · chevron) |
| `--rt-row-chip` | `28px` | Width and height of a RowChip |
| `--rt-chip-radius` | `6px` | Border-radius of chips and filter pills |
| `--rt-card-radius` | `10px` | Border-radius of cards and modals |
| `--rt-card-pad-x` | `14px` | Horizontal padding inside a padded card |
| `--rt-header-btn` | `32px` | Width and height of a header action button |

---

## Spacing Scale

All spacing is a multiple of 4px.

| Name | Range | Use |
|------|-------|-----|
| 2xs | 2–3px | Tag internal padding (vertical), micro gaps |
| xs | 4–6px | Gaps between inline chips and labels |
| sm | 8–10px | Internal chip/tile padding, compact row gaps |
| md | 11–14px | Standard row padding (`--rt-row-pad`) |
| lg | 16–20px | Page padding, section gaps |
| xl | 24–32px | Modal padding, large section gaps |

---

## Component Primitives

All primitives are defined as `.if-*` classes in `src/inviteflow/styles/if.css`. They consume `var(--*)` tokens exclusively — no values are hardcoded inside the stylesheet.

### Page Header

| Class | Description |
|-------|-------------|
| `.if-eyebrow` | Mono caps 9px eyebrow. Sits above `.if-page-title` on every page. |
| `.if-page-title` | Serif italic 18px heading. Used for tab titles and modal titles. |
| `.if-header-btn` | 32px square bordered icon button. Used for back/menu/filter actions in the header right slot. |
| `.if-meta-line` | Mono caps inline run directly under the header. Contains a status dot and `·`-separated segments. |
| `.if-meta-sep` | `·` separator used inside a `.if-meta-line`. |

### Sections and Cards

| Class | Description |
|-------|-------------|
| `.if-section-label` | 9px mono caps eyebrow above a card or list section. |
| `.if-card` | Bordered surface container (`--bg-surface` bg, `--border` border, 10px radius). Children are separated by row hairlines. Add `.padded` for non-row content. |
| `.if-card.padded` | Adds `14px --rt-card-pad-x` internal padding for non-row content (e.g., charts, stat strips). |

### Card Rows

The canonical row pattern inside a `.if-card`. Use it for every list item, workflow step, settings entry, or action item.

| Class | Description |
|-------|-------------|
| `.if-card-row` | Full-width flex row: chip · body · right · chevron. `cursor: pointer`, hover dims to `--bg-subtle`. Add `.last` to suppress bottom border. Add `.no-action` for non-interactive rows. |
| `.if-card-row-body` | `flex: 1; min-width: 0` wrapper for title + sub. |
| `.if-card-row-title` | Serif 14px truncating title inside a row. |
| `.if-card-row-sub` | Mono 10px 0.08em-spaced subtitle inside a row. |
| `.if-card-row-right` | Mono 11px semi-bold right-side value. Add `.accent` for terracotta color. |

### Chips and Indicators

| Class | Description |
|-------|-------------|
| `.if-row-chip` | 28×28px square chip in the left slot of a `.if-card-row`. Shows a number, icon, or status. Modifiers: `.filled` (accent fill), `.good` (success tint), `.warn` (warning tint), `.bad` (danger tint). |
| `.if-stat-chip` | Small bordered tile (`flex: 1`). Contains `.if-stat-chip-label` (mono 8px caps) and `.if-stat-chip-value` (serif 20px). Use in a horizontal flex row for stat strips. |
| `.if-status-pill` | Mono 9px bordered pill. Right-side status indicator. Tones: `.good`, `.warn`, `.bad`, `.accent`. |
| `.if-filter-chip` | Mono 9px caps filter pill. Active state: ink fill (heading color bg, root color text). Shows a `.count` span at 60% opacity. |
| `.if-tag` | Inline 9px bordered badge. Color applied via `color` + `border-color` inline (use semantic vars). |
| `.if-stat` | Legacy stat card with 3px left accent border. **Prefer `.if-stat-chip` in new code.** |

### Controls

| Class | Description |
|-------|-------------|
| `.if-tab-switcher` | Pill toggle container. Children are `.if-tab-option`. Active segment: ink-fill (heading bg, root text). |
| `.if-tab-option` | Segment inside `.if-tab-switcher`. Add `.active` for the selected state. |
| `.if-primary-btn` | Full-width terracotta CTA. Mono 13px 0.06em. Use as the main action at the bottom of a screen. Disabled: `opacity: 0.4`. |
| `.if-btn` | Base bordered button (mono 10px, 34px height, `--border-input` border). Modifiers: `.pri` (accent fill), `.grn` (success fill), `.del` (danger border + text), `.ghost` (subtle border), `.sm` (28px / 9px), `.lg` (40px / 11px). |
| `.if-nav-tab` | Top-level tab button (mono 10px, border-bottom underline). Active: `--accent` underline + `--text-heading` text. |

### Inputs and Forms

| Class | Description |
|-------|-------------|
| `.if-label` | Mono 9px caps field label. Always sits directly above `.if-input`. |
| `.if-input` | Bordered input (36px min-height, `--bg-surface` bg, `--border-input` border). Focus: `--accent` border. Error: add `.err` for danger border. |

### Feedback and Status

| Class | Description |
|-------|-------------|
| `.if-status` | Inline mono 10px status text. Tones: `.ok` (success), `.err` (danger), `.info` (accent highlight). |
| `.if-empty` | Empty-state block (48px vertical padding, serif italic 14px, centered). Always pair with an `.if-empty-sub` (mono 10px) and a next-step action. Never use a passive "nothing here" message alone. |
| `.if-progress-track` / `.if-progress-fill` | 3px horizontal progress bar. Fill color: `--accent`. Always pair with an inline `done / total` counter. |
| `.if-bar-track` | 8px stacked bar (e.g., attending / pending / declined breakdown in Tracker). Child divs set `width` as a percentage. |
| `.if-bulk-bar` | Flex bar that appears when table rows are selected. Holds bulk action buttons. |

### Overlays

| Class | Description |
|-------|-------------|
| `.if-modal-backdrop` | Full-screen `rgba(0,0,0,0.8)` overlay. Flex-centers `.if-modal`. Clicking outside dismisses. |
| `.if-modal` | Modal panel (`--bg-surface` bg, `--border-input` border, 10px radius, 24px padding, max-width 460px, max-height 90dvh, scrollable). |
| `.if-modal-title` | Serif italic 16px modal heading. |
| `.if-modal-sub` | Mono 10px modal subheading / description text. |

### Utility

| Class | Description |
|-------|-------------|
| `.if-code` | Code block (`--bg-subtle` bg, mono 10px, horizontally scrollable, 1.6 line-height). |
| `.if-activity-row` | Feed row: time chip · type stamp · sentence. Add `.last` to suppress bottom border. |
| `.if-serif` | Applies `var(--rf-serif)` font family. |
| `.if-mono` | Applies `var(--rf-mono)` font family. |

---

## Interaction States

Every interactive element must have visually distinct `:hover` and `:focus-visible` states.

| State | Treatment |
|-------|-----------|
| `:hover` on buttons | Border brightens to `--accent-highlight`; text lightens to `--text-heading` |
| `:hover` on card rows | Background shifts to `--bg-subtle` |
| `:focus-visible` | `2px solid var(--accent); outline-offset: 2px` on all buttons and inputs |
| `:disabled` | `opacity: 0.4; cursor: not-allowed` |
| Active filter chip / tab option | Ink fill: `--text-heading` bg, `--bg-root` text |

---

## Responsive Layout

The suite is **desktop-first but must not break below 900px**.

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Desktop | ≥ 900px | Default layout; 32px tap targets |
| Narrow laptop | 900px | Max-width containers compress; tables scroll horizontally |
| Mobile | < 768px | Touch targets scale up (44px buttons, 44px inputs); font sizes step up |

### Rules

- **Containers:** always `max-width` + `width: 100%`. Never fixed `px` widths on layout wrappers.
- **Tables:** wrap in `<div class="overflow-x-auto">` so they scroll horizontally at narrow viewports rather than overflowing the page.
- **Test at:** 1440px (desktop) and 900px (narrow laptop) before committing any layout change.

### Mobile overrides (< 768px)

Defined at the bottom of `if.css`:

| Element | Desktop | Mobile |
|---------|---------|--------|
| `.if-btn` | 34px / 10px | 44px / 12px |
| `.if-btn.sm` | 28px / 9px | 36px / 10px |
| `.if-input` | 36px / 12px | 44px / 13px |
| `.if-nav-tab` | 34px / 10px | 44px / 11px |
| `.if-primary-btn` | 13px font | 14px font, extra padding |

---

## Accessibility

- All interactive elements have `:focus-visible` outlines: `2px solid var(--accent); outline-offset: 2px`
- Status is never communicated by color alone — text labels always accompany colored indicators
- Touch targets ≥ 44px tall on mobile (< 768px)
- All form inputs have an explicit `.if-label` element directly above them
- Destructive actions (delete, clear) show an **inline confirmation** before executing — never a `window.confirm()` or `alert()`
- Modal backdrops dismiss on click outside

---

## Animation

Keep animation minimal. Use it only to communicate live system state, not decoration.

| Name | Timing | Use |
|------|--------|-----|
| Progress fill transition | `width 0.2s` | `.if-progress-fill` width change during sends |
| Button / border transitions | `0.15s` | Hover state changes on buttons, inputs, tabs |

---

## UX Conventions

These are enforced at the code level, not just guidelines.

| Principle | Implementation |
|-----------|---------------|
| Empty states are never passive | Every `.if-empty` pairs with an `.if-empty-sub` and a next-step button or instruction |
| Feedback is always inline | Status messages use `.if-status.ok` / `.if-status.err` in the page — never `alert()` |
| Destructive actions require confirmation | Show an inline "are you sure?" prompt before delete/clear executes |
| Progress is always visible | Bulk operations use `.if-progress-track` + a `done / total` counter; a spinner alone is not sufficient |
| Labels describe outcomes | "Send Invitations", not "Run Loop"; "Import Contacts", not "Load Array" |

---

## File Locations

| File | Purpose |
|------|---------|
| `src/inviteflow/theme.css` | All CSS custom properties (`--bg-*`, `--text-*`, `--accent`, `--rt-*`, `--rf-*`) |
| `src/inviteflow/styles/if.css` | All `.if-*` primitive classes |
| `src/inviteflow/styles/primereact-reset.css` | PrimeReact token overrides (mapped to warm palette at `:root`) |
| `redesign-scaffold/roster.jsx` | Reference implementation: `R_DARK` palette, `RT` tokens, all React primitives |
| `redesign-scaffold/CLAUDE_CODE_HANDOFF.md` | Engineering handoff: rules, route map, TODO items |
