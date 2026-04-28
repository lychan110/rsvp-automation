# ContactScout Design Language

Author: Lenya Chan
Updated: 2026-04-28

---

## Purpose

This document is the single source of truth for ContactScout's visual and interaction design. All future UI work must reference it before introducing new colors, spacing, or component patterns. It reflects a **mobile-first, dark terminal-inspired** aesthetic tuned for focused, sequential workflows.

---

## Color Palette

### Backgrounds (darkest → lightest)
| Role | Value | Use |
|------|-------|-----|
| Page base | `#080c10` | App root background |
| Log / dense surface | `#050709` | Log panel, very dense areas |
| Card / surface | `#0d1117` | Cards, panels, modals |
| Nested surface | `#161b22` | Alt rows, inset areas |
| Highlighted surface | `#0c1a2e` | Selected rows, info-tinted bg |
| Warning surface | `#1a0e00` | Warning banners |

### Borders
| Role | Value | Use |
|------|-------|-----|
| Default | `#21262d` | Card borders, dividers |
| Subtle | `#161b22` | Very light separators |
| Input / secondary | `#30363d` | Input borders, secondary dividers |

### Text
| Role | Value | Use |
|------|-------|-----|
| Primary | `#f0f6fc` | Headings, names, key values |
| Body | `#c9d1d9` | Main body text |
| Secondary | `#8b949e` | Metadata, labels, helper text |
| Dim | `#7d8590` | Placeholders, oldest log entries |

### Interactive / Semantic
| Role | Value | Use |
|------|-------|-----|
| Blue (action) | `#1f6feb` | Primary buttons, active tabs, progress bar |
| Blue (highlight) | `#58a6ff` | Links, active state text, info emphasis |
| Blue (border accent) | `#1f4f99` | New-candidate card borders |
| Green (action) | `#238636` | Constructive button bg (Add, Export) |
| Green (status) | `#3fb950` | Verified status, success text |
| Red (action border) | `#da3633` | Danger button border |
| Red (status) | `#f85149` | Error text, left-office status |
| Yellow | `#e3b341` | Warning text, flags |
| Amber | `#f59e0b` | Scanning/checking animation |
| Purple | `#a371f7` | "Ready to invite" stat |
| Warning border | `#bb8009` | Warning banner border |

**Rule:** Before introducing any new color, search this palette for the closest semantic match and reuse it. Add a new entry only if no existing value fits semantically, and document it here.

---

## Typography

Single typeface: **Courier New** (monospace), falling back to system monospace. No other typefaces.

| Role | Size | Weight | Letter-spacing | Case |
|------|------|--------|----------------|------|
| App title | 16–18px | 800 | -0.02em | UPPER |
| Modal / section headings | 13–14px | 700 | 0 | Sentence |
| Body / list items | 11–12px | 400–600 | 0 | Sentence |
| Buttons | 11px desktop / 13px mobile | 400 | 0.04em | As written |
| Section labels | 9px | 400 | 0.14em | UPPER |
| Category pills | 9px | 400 | 0.07em | UPPER |
| Status tags | 9–10px | 400 | 0.07em | UPPER |
| Metadata / secondary | 9–10px | 400 | 0.08–0.1em | Mixed |
| Byline | 9px | 400 | 0.12em | Sentence |

---

## Spacing Scale

All spacing is a multiple of 4px.

| Token | Value | Use |
|-------|-------|-----|
| 2xs | 2px | Tag internal padding (vertical) |
| xs | 4–6px | Gaps between inline elements |
| sm | 8–10px | Internal card padding, tight rows |
| md | 12–14px | Standard card/row padding |
| lg | 16–20px | Page-level padding, section gaps |
| xl | 24–32px | Modal padding, large section gaps |

---

## Responsive Breakpoints

| Name | Min-width | Layout behavior |
|------|-----------|-----------------|
| Mobile | — (base) | Single column, bottom-sheet log, 44px tap targets |
| Tablet | 768px | Same as mobile, wider content |
| Desktop | 1024px | Log sidebar always visible, smaller tap targets (36px) |

### Mobile-first rules
- **Containers:** always `width: 100%` with `max-width` where needed. Never fixed `px` widths on layout containers.
- **Tap targets:** min-height `44px` on mobile (< 768px), `36px` on desktop.
- **Horizontal scroll:** permitted only inside designated scrolling regions (tab bar, category pills). No page-level horizontal overflow.
- **Log panel:** hidden by default on mobile/tablet; toggled as a 50dvh bottom sheet via `☰ Log` button. Always visible at ≥ 1024px.
- **Category column:** hidden in official list rows on mobile (< 768px) — name, email, and status are sufficient.

---

## Component Patterns

### Buttons

Four semantic variants, applied via CSS class:

| Class | Bg | Border | Text | Use |
|-------|----|--------|------|-----|
| (default) | transparent | `#30363d` | `#8b949e` | Secondary actions |
| `.pri` | `#1f6feb` | `#1f6feb` | `#fff` | Primary action per context |
| `.grn` | `#238636` | `#238636` | `#fff` | Constructive (add, export) |
| `.del` | transparent | `#da3633` | `#f85149` | Destructive (delete, clear) |

Add `.sm` for compact contexts. All buttons require `:hover` and `:disabled` states. Disabled: `opacity: 0.4`, `cursor: not-allowed`.

### Status Tags

Inline bordered pill, no background fill:
```
border: 1px solid {color}; color: {color};
padding: 2px 7px; border-radius: 4px; font-size: 9–10px; letter-spacing: 0.07em
```
Active states (checking/scanning) use `cs-pulse` animation.

### Cards / Panels

```
background: #0d1117; border: 1px solid #21262d; border-radius: 8px; padding: 14–20px
```

### Modals

- Backdrop: `rgba(0,0,0,0.8)`, covers full screen
- Panel: `max-width: 460px`, `border-radius: 10px`, `padding: 24px`
- Clicking outside dismisses
- Max-height `90dvh`, scrollable internally on small screens

### Banners

Full-width strips pinned below header. Always contain an actionable button — never purely informational.

| Variant | Bg | Border | Text color |
|---------|-----|--------|-----------|
| `.info` | `#060d1a` | `#1f6feb` | `#58a6ff` |
| `.warn` | `#1a0e00` | `#bb8009` | `#e3b341` |

### Empty States

Every empty list/panel must include:
1. Short plain-language explanation (13–14px, `#c9d1d9`)
2. One primary action button
3. Optional supporting line (11px, `#8b949e`)

Never use a standalone "Nothing here yet." message.

### Progress Indicator

Thin 3px horizontal bar:
```
track: #21262d; fill: #1f6feb; border-radius: 2px
```
Always paired with a `done/total` counter inline.

---

## Animation

| Name | Timing | Use |
|------|--------|-----|
| `cs-pulse` | `opacity: 1→0.35→1`, 1.4s ease-in-out infinite | Checking / scanning states |
| `cs-spin` | `rotate(360deg)`, 1s linear infinite | Loading spinner |

Keep animation minimal. Only use it to communicate live system state (not decoration).

---

## Layout Architecture

The app is a fixed-height shell (`100dvh`) with internal scrolling:

```
┌─────────────────────────────────────────┐
│ Header (flex-shrink: 0)                 │
│ Banners (flex-shrink: 0, conditional)   │
│ Stats bar (flex-shrink: 0, conditional) │
│ Tab bar (flex-shrink: 0)                │
├─────────────────────────┬───────────────┤
│ Main scroll area        │ Log sidebar   │
│ (flex: 1, overflow-y)   │ (240px, ≥1024)│
└─────────────────────────┴───────────────┘
```

On mobile/tablet, the log sidebar becomes a toggled bottom sheet overlay.

---

## Sequential Workflow

ContactScout has three steps, reflected in the tab order:

1. **Discover** — Run scans; review new candidates
2. **Officials** — Manage list; verify who is still in office
3. **Export** — Send to InviteFlow, download CSV, backup/restore

First-run onboarding sequence (via banners, not modals):
1. No API key → welcome banner with "Add API Key" CTA
2. API key set but no jurisdiction → warning banner with "Configure Jurisdiction" CTA
3. Both set → no banner; user proceeds to Discover tab

---

## Accessibility

- All interactive elements have `:focus-visible` outlines: `2px solid #58a6ff; outline-offset: 2px`
- Status is never communicated by color alone — text labels always accompany colored indicators
- Touch targets ≥ 44px tall on mobile
- Form inputs have explicit `<label>` or `.cs-section-label` above them
- Destructive actions (clear all) require browser `confirm()` before executing
- Modal backdrops can be dismissed by clicking outside
