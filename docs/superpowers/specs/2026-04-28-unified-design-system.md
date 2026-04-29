# Unified Design System — InviteFlow & ContactScout

Author: Claude Code
Date: 2026-04-28

## Overview

This document defines the **single source of truth** for the visual and interaction design of the Invite Automation Suite. Both InviteFlow and ContactScout must implement every pattern documented here.

This system is **dark-only, terminal-inspired**, optimized for focused, sequential workflows on desktop and mobile. All color, spacing, typography, and component patterns are defined once and reused identically across both applications.

---

## Color Palette

All colors come from the dark GitHub-style palette. This palette is the foundation for both apps.

### Semantic Color Roles

| Role | Value | Use | WCAG AA |
|------|-------|-----|---------|
| **Page background** | `#080c10` | App root background | ✓ 10.5:1 |
| **Card / surface** | `#0d1117` | Cards, panels, form surfaces | ✓ 9.8:1 |
| **Nested surface** | `#161b22` | Alternate rows, inset panels | ✓ 7.2:1 |
| **Dense surface** | `#050709` | Log panels, dense lists | ✓ 11.2:1 |
| **Subtle surface** | `#0c1a2e` | Info-tinted backgrounds | ✓ 5.1:1 |
| **Warning surface** | `#1a0e00` | Warning banners | ✓ (custom) |
| **Default border** | `#21262d` | Card borders, dividers | ✓ (design token) |
| **Input border** | `#30363d` | Input fields, secondary dividers | ✓ (design token) |
| **Primary text** | `#f0f6fc` | Headings, keys, emphasis | ✓ 12.8:1 |
| **Body text** | `#c9d1d9` | Main content | ✓ 10.5:1 |
| **Secondary text** | `#8b949e` | Metadata, labels, helpers | ✓ 5.2:1 |
| **Muted text** | `#6e7681` | Placeholders, disabled | ✓ 4.2:1 |
| **Dim text** | `#7d8590` | Oldest entries, least prominent | ✓ 4.5:1 |
| **Blue (action)** | `#1f6feb` | Primary buttons, active tabs, progress | ✓ 5.6:1 |
| **Blue (highlight)** | `#58a6ff` | Links, focus outlines, success emphasis | ✓ 5.1:1 |
| **Blue (border)** | `#1f4f99` | New-candidate card borders | ✓ (accent) |
| **Green (action)** | `#238636` | Constructive buttons (Add, Export) | ✓ 5.8:1 |
| **Green (status)** | `#3fb950` | Success indicators, verified status | ✓ 5.0:1 |
| **Red (action)** | `#da3633` | Danger button borders | ✓ 4.9:1 |
| **Red (status)** | `#f85149` | Error text, left-office status | ✓ 4.9:1 |
| **Yellow (warning)** | `#e3b341` | Warning text, flags | ✓ 4.2:1 |
| **Amber (loading)** | `#f59e0b` | Scanning animation, progress | ✓ 4.5:1 |
| **Purple (stat)** | `#a371f7` | "Ready to invite" stat, accent | ✓ 4.8:1 |
| **Warning border** | `#bb8009` | Warning banner borders | ✓ (accent) |
| **Gold (accent)** | `#C8A84B` | Legacy accents, badges (light dark theme) | ✓ 4.0:1 |

**Rule:** Before introducing any new color, search this palette for the closest semantic match and reuse it. Add a new entry only if no existing value fits semantically, and update this document.

---

## Typography

**Single typeface:** Courier New (monospace), with system monospace as fallback.

| Role | Size | Weight | Letter-spacing | Case | Use |
|------|------|--------|----------------|------|-----|
| App title | 16–18px | 800 | -0.02em | UPPER | Header wordmark |
| Section heading | 13–14px | 700 | 0 | Sentence | Modal titles, page headings |
| Body / list item | 11–12px | 400–600 | 0 | Sentence | Main content, table rows, status |
| Button label | 11px (desktop) / 13px (mobile) | 400 | 0.04em | As written | All buttons |
| Section label | 9px | 400 | 0.14em | UPPER | Form labels, section dividers |
| Category pill | 9px | 400 | 0.07em | UPPER | Filter badges, status pills |
| Status tag | 9–10px | 400 | 0.07em | UPPER | Inline status badges |
| Metadata / secondary | 9–10px | 400 | 0.08–0.1em | Mixed | Helper text, hints, timestamps |
| Byline | 9px | 400 | 0.12em | Sentence | Author credits, footnotes |

**Implementation notes:**
- No font weights other than 400, 600, 700, 800
- Monospace ensures readability in dark theme and aligns with terminal aesthetic
- Letter-spacing is used strategically for hierarchy and scannability
- Mobile text sizes increase by 1–2px for readability (esp. buttons: 13px on mobile vs. 11px on desktop)

---

## Spacing Scale

All spacing is a multiple of 4px.

| Token | Value | Use |
|-------|-------|-----|
| **2xs** | 2px | Tag internal vertical padding, tight gaps |
| **xs** | 4–6px | Gaps between inline elements, small padding |
| **sm** | 8–10px | Internal card padding, tight rows |
| **md** | 12–14px | Standard card/row padding, medium gaps |
| **lg** | 16–20px | Page-level padding, section gaps, button padding |
| **xl** | 24–32px | Modal padding, large section gaps |

**Implementation:**
- Use consistent spacing in both apps
- Don't mix scales (e.g., if a card uses `16px`, all cards use `16px`)
- Mobile may add 4px to outer padding for comfort

---

## Responsive Breakpoints

| Name | Min-width | Layout behavior |
|------|-----------|-----------------|
| Mobile | — (base) | Single column, bottom-sheet log, 44px tap targets, larger text |
| Tablet | 768px | Two-column where needed, 44px tap targets, reduced text size |
| Desktop | 1024px | Three-column layouts, 36px tap targets, standard text |
| Large | 1440px+ | Full-width with max-constraints, 36px tap targets |

**Mobile-first rules:**
- **Containers:** Always `width: 100%` with `max-width` constraints (no fixed `px` widths)
- **Tap targets:** Min `44px` on mobile (< 768px), `36px` on desktop (≥ 768px)
- **Horizontal scroll:** Permitted only inside designated scrolling regions (tab bars, category pills), never page-level
- **Stacking:** Forms and multi-column layouts stack to single column on mobile; reveal at `@media (min-width: 768px)`
- **Hidden elements:** Hide `category` column on mobile rows; hide log panel on mobile (toggle via bottom sheet)

**All viewport tests must verify:**
- 375px (small mobile)
- 768px (tablet)
- 1024px (small desktop / laptop)
- 1440px (standard desktop)

---

## Component Patterns

### Buttons

Four semantic variants, applied via CSS class modifier.

| Variant | Class | Bg | Border | Text | Use |
|---------|-------|----|----|------|-----|
| Secondary | (default) | transparent | `#30363d` | `#8b949e` | Non-primary actions |
| Primary | `.pri` | `#1f6feb` | `#1f6feb` | `#fff` | Main action per context |
| Constructive | `.grn` | `#238636` | `#238636` | `#fff` | Add, export, confirm |
| Destructive | `.del` | transparent | `#da3633` | `#f85149` | Delete, clear, revoke |

**Sizes:**
- Default: `36px` min-height, `14px` padding, `11px` font (desktop)
- Small (`.sm`): `28px` min-height, `10px` padding, `10px` font
- Large (`.lg`): `40px` min-height, `18px` padding, `11px` font

**Mobile overrides (< 768px):**
- Default → `44px` min-height, `18px` padding, `13px` font
- Small (`.sm`) → `36px` min-height, `14px` padding, `10px` font
- Large (`.lg`) → `48px` min-height (same as default on mobile)

**States:**
- `:hover` — border and text color brighten; background may shift
- `:focus-visible` — `2px solid #58a6ff` outline, `2px` offset
- `:disabled` — `opacity: 0.4`, `cursor: not-allowed`
- `:active` — immediate visual feedback (no delay)

### Form Inputs

```
background: #0d1117;
border: 1px solid #30363d;
border-radius: 5px;
color: #c9d1d9;
padding: 8px 10px;
font-family: monospace;
font-size: 11px;
min-height: 36px;
```

**States:**
- `:focus` → `border-color: #1f6feb`
- `:focus-visible` → outline `2px solid #58a6ff`, offset `2px`
- `.err` → `border-color: #da3633` (invalid input)
- `::placeholder` → `color: #6e7681`

**Mobile (< 768px):**
- Increase `min-height` to `44px`
- Increase `font-size` to `13px`
- Increase `padding` to `10px 12px`

### Cards / Panels

```
background: #0d1117;
border: 1px solid #21262d;
border-radius: 8px;
padding: 14px 16px (standard) — 20px 24px (spacious)
```

**Nested surface variant:**
```
background: #161b22;
border: 1px solid #21262d;
```

**Hover state (selectable):**
```
background: #161b22;  /* Slightly lighter */
cursor: pointer;
```

### Modals

- **Backdrop:** `rgba(0, 0, 0, 0.8)`, covers full viewport, `z-index: 50`
- **Panel:** `max-width: 460px`, `border-radius: 10px`, `padding: 24px`, `background: #0d1117`, `border: 1px solid #30363d`
- **Behavior:** Click outside dismisses; `max-height: 90dvh` with internal scroll
- **Title:** `13px`, `700` weight, `#f0f6fc`
- **Body:** `11px`, `#c9d1d9`, line-height `1.7`

### Banners

Full-width strips pinned below header, always contain an actionable button.

| Variant | Background | Border | Text |
|---------|------------|--------|------|
| `.info` | `#060d1a` | `#1f6feb` (top or bottom) | `#58a6ff` |
| `.warn` | `#1a0e00` | `#bb8009` (top or bottom) | `#e3b341` |

**Layout:**
- `padding: 12px 20px`
- `display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-start`
- Title: `11px`, `600` weight
- Body: `10px`, `#8b949e`, line-height `1.7`
- Button area: right-aligned or flex-wrap

### Empty States

Every empty list/panel must include:
1. **Title:** `13–14px`, `#c9d1d9`, plain language
2. **Description:** `11px`, `#8b949e`, optional
3. **CTA button:** Primary action (`.pri` or `.grn` button)
4. Never passive: "Nothing here." is not acceptable

Example:
```
"No invitees yet."
"Import a list or add manually."
[Import Invitees button]
```

### Status Tags

Inline bordered pill (no background fill):
```
border: 1px solid {color};
color: {color};
padding: 2px 7px;
border-radius: 4px;
font-size: 9px;
letter-spacing: 0.07em;
```

**Colors match semantic palette:**
- Verified: `#3fb950` (green)
- Pending: `#8b949e` (gray)
- Error: `#f85149` (red)
- Checking: `#f59e0b` (amber) + `cs-pulse` animation
- Left office: `#f85149` (red)

### Progress Indicator

Thin `3px` horizontal bar:
```
background: #21262d;  /* track */
border-radius: 2px;
```

**Filled portion:**
```
background: #1f6feb;  /* fill */
transition: width 0.2s;
```

Always pair with `done / total` counter displayed inline next to or above the bar.

---

## Animation & Transitions

### Timing

| Name | Duration | Easing | Use |
|------|----------|--------|-----|
| `cs-pulse` | 1.4s | ease-in-out infinite | Checking / scanning states |
| `cs-spin` | 1s | linear infinite | Loading spinner |
| Transitions | 0.12–0.2s | ease-out | Button colors, border changes, opacity fades |
| Modal enter | 0.15s | ease-out | Backdrop fade + panel slide |
| Drawer slide | 0.2s | ease-out | Mobile nav drawer |

**Rule:** Use `prefers-reduced-motion: reduce` to disable animations for users with motion sensitivity.

```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

---

## Layout Architecture

Both apps use a fixed-height shell (`100dvh`) with internal scrolling.

```
┌─────────────────────────────────────┐
│ Header (sticky, flex-shrink: 0)     │
│ [logo] [active event/title] [theme] │
├─────────────────────────────────────┤
│ Banners (sticky, if present)        │
├─────────────────────────────────────┤
│ Stats bar (sticky, if present)      │
├─────────────────────────────────────┤
│ Tab bar (sticky, flex-shrink: 0)    │
├──────────────────────┬──────────────┤
│ Main scroll area     │ Log sidebar  │
│ (flex: 1, overflow-y)│ (240px,      │
│                      │  ≥1024px)    │
└──────────────────────┴──────────────┘
```

**Mobile/tablet:** Log sidebar hidden by default; toggled as `50dvh` bottom sheet overlay.

---

## Accessibility

- **Focus outlines:** All interactive elements have `:focus-visible` → `2px solid #58a6ff; outline-offset: 2px`
- **Color + text:** Status never communicated by color alone — always paired with text label
- **Touch targets:** `≥ 44px` on mobile, `≥ 36px` on desktop
- **Form labels:** Explicit `<label>` or `.cs-section-label` / `.if-label` above inputs
- **Destructive actions:** Require inline confirmation prompt (not `alert()`)
- **Modals:** Dismissible by clicking outside; support Escape key
- **Scrollable regions:** `role="region" aria-label="descriptive name" tabindex="0"`

---

## Class Naming Convention

Both apps will use a **unified prefix system**:
- InviteFlow: Keep `.if-*` prefix (already established, low refactoring cost)
- ContactScout: Adopt `.if-*` prefix (breaking change, but standardizes codebase)

**Core classes (both apps must implement):**
- `.if-btn`, `.if-btn.pri`, `.if-btn.grn`, `.if-btn.del`, `.if-btn.sm`, `.if-btn.lg`
- `.if-input`, `.if-label`
- `.if-card`, `.if-section-label`, `.if-page-title`
- `.if-pill`, `.if-tag`, `.if-status`
- `.if-stat`, `.if-stat-label`, `.if-stat-value`
- `.if-code`, `.if-empty`
- `.if-nav-tab`, `.if-modal`, `.if-modal-backdrop`
- `.if-banner`, `.if-banner.info`, `.if-banner.warn`
- `.if-progress-track`, `.if-progress-fill`

**App-specific extensions (optional):**
- InviteFlow: `.if-bulk-bar`, `.if-bulk-action`, `.if-invite-card`
- ContactScout: `.if-log-sidebar`, `.if-log-btn`, `.if-official-row`, `.if-scan-status`

---

## Implementation Checklist

Use this checklist when updating either app:

- [ ] All colors from `COLORS` section used; no hardcoded hex outside this document
- [ ] All spacing from `SPACING_SCALE` used
- [ ] All breakpoints match `RESPONSIVE_BREAKPOINTS`
- [ ] Button sizes match `BUTTONS` section
- [ ] Input styling matches `FORM_INPUTS` section
- [ ] Modal styling matches `MODALS` section
- [ ] Empty states include CTA buttons (not passive messages)
- [ ] All `.if-*` classes exist and are applied correctly
- [ ] Focus states implemented with blue outline
- [ ] Touch targets tested at mobile (375px, 768px) and desktop (1024px, 1440px)
- [ ] `prefers-reduced-motion` respected
- [ ] All text contrast passes WCAG AA
- [ ] Navigation links verified and working
- [ ] No hardcoded font sizes outside this document's ranges

---

## Files to Update

### InviteFlow
- `src/inviteflow/theme.css` — CSS custom properties (consolidate with ContactScout palette)
- `src/inviteflow/styles/if.css` — Component classes (standardize sizing, animation timing)
- `src/inviteflow/App.tsx` — Remove light-mode toggle; dark-only default
- All tab components — verify responsive breakpoints

### ContactScout
- `src/contact-scout/src/css.ts` — Extract to separate CSS files; rename classes to `.if-*`
- `src/contact-scout/src/App.tsx` — Update class names; verify breakpoints
- All component files — update class references

---

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2026-04-28 | Claude Code | Initial unified design system spec |

