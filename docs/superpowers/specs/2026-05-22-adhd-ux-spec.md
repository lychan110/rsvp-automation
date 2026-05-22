# ADHD/auDHD UX Specification
**InviteFlow — Cognitive Accessibility & Mobile Redesign**

Author: Lenya Chan
Date: 2026-05-22
Status: Actionable — ready for implementation

---

## Why this document exists

InviteFlow was built to replace grunt work. But using it still demands full executive function. The tool meant to reduce cognitive load adds it. This document names the root causes, synthesizes research from ADHD/neurodiversity UX practitioners and peer-reviewed sources, and provides implementation-ready specifications for a full UX overhaul.

The three research threads synthesized here:
- ADHD/neurodiversity UX principles (Tiimo, Intuit, dubbii n=30,000, arXiv 2507.06864, NNG, UXPA)
- InviteFlow UX audit (24 friction points across all pages)
- Typography and color theming (PMC/NCBI, WCAG/APCA, GitHub Primer, Linear, IBM Carbon)

---

## Root Cause Diagnosis

### Root cause 1: No guided "next step" — pure decision paralysis

Every screen gives options instead of direction. The EventDashboard shows 5 equally-weighted workflow rows. The Invitees page has 4 bulk action buttons, 12 table columns, import/export, and inline editing all at the same visual weight. The app never answers "what do I do right now?"

**Research backing:** The single most effective change in the dubbii (n=30,000 ADHD users) study was "each screen has one responsibility." Every additional equally-weighted option costs executive function. The 10-second rule: if it takes more than 10 seconds to find what to do next, the environment has too much friction.

### Root cause 2: The phone experience was never actually designed

The app is desktop-first code squeezed onto a phone. A 12-column PrimeReact DataTable, 12-field forms, monospace font at small sizes — these are cognitively heavy on desktop. On mobile, they're unusable. The "work from anywhere" promise breaks because there is no mobile layout, just a smaller desktop layout.

**Research backing:** ADHD mobile UX requires flat navigation, card-based views instead of data tables, 48px+ touch targets, and showing only the current task's details — not the full context of everything.

### Root cause 3: Bulk send has no momentum anchor

Sending 200 emails is the highest-stakes action in the app. It's also the one with the least live feedback. Without per-item progress ("Sending to Sen. Smith... 18 of 47"), the brain has nothing to latch onto and context-switches away. Coming back means re-orienting from scratch — anxiety, lost momentum, abandoned session.

**Research backing:** During bulk operations, the progress display is the primary attention anchor for ADHD users. It must update per-item with the recipient's name and a live count. The dopamine hit of "18... 19... 20..." sustains flow where a spinner does not.

---

## Part 1: ADHD/Neurodiversity UX Principles

### Cognitive load and decision fatigue

- **One primary action per screen.** The primary button must be immediately obvious and singular. Secondary options should be visually subordinate or hidden behind an "expand" affordance.
- **Suppress secondary options until needed.** Surface only contextually relevant actions. Hide tools for other tasks — but don't hide tools the user needs *right now*.
- **Eliminate blank-slate paralysis.** Opening to an empty state with no clear next action is a task-initiation killer. Always present a dominant CTA on load: "Resume where you left off" or a pre-selected default.
- **Pre-populate and pre-decide where safe.** Decision fatigue drops when the system makes reasonable default choices. Let users override, but don't force choosing from scratch.
- **Chunk to 3–6 items.** ADHD working memory holds fewer items reliably. Any list exceeding ~7 items should be paginated, filtered, or sectioned.

### Multi-step tasks

- **Never show the full depth of a process upfront.** "Step 2 of 4" is better than all 4 steps at once.
- **Max 3–6 steps per journey.** If a process exceeds 6 steps, split it into named sub-journeys with clear handoff points.
- **Pre-flight confirmation gate before irreversible operations.** A calm summary before bulk send: "You're about to send to 47 pending invitees. Subject: [X]. Sending from: [Y]. Continue?" Once confirmed and running, *never interrupt with additional prompts.*
- **Never require starting over.** "Retry 2 failed emails" is calming. "Send again" implies repeating what already worked — alarming.
- **First-step specificity.** "Send to 47 pending invitees" beats "Send invitations." Replace abstract labels with concrete outcome descriptions at every decision gate.

### Progress and momentum

- **Each "next" click is a dopamine micro-dose.** Multi-step flows deliver a small reward with each forward step. Design completion animations for each step, not just the final one.
- **Momentum feedback, not just completion feedback.** Progress bars must update after each individual item in a bulk operation — not just at 25%/50%/75%/100%. "18 of 47 (38%) — Sending to: Sen. Jane Smith..." keeps the user in flow.
- **Soft landing after completion.** Without clear redirection, ADHD users freeze or doom-scroll. Post-completion states must present the immediate next logical action.
- **Granular success/failure accounting.** "45 sent, 2 failed (details below)" not "some errors occurred." Specificity is calming; vagueness triggers catastrophizing.
- **Save and resume aggressively.** Any operation that cannot pause mid-flow will be abandoned at the first interruption. State must be serialized: "You were sending email 18 of 47. Continue?"

### Shame-free failure states

ADHD brains are vulnerable to Rejection Sensitive Dysphoria. Error messages that frame failure as user fault cause disproportionate distress.

- Replace "Error: Failed to send" with "Couldn't reach Jane Smith's inbox — tap to retry."
- Frame failures as technical events, not user failures.
- Never use red text without an immediate path to resolution.
- Never use `alert()`. All feedback is inline.

### auDHD-specific: stable structure, variable content

The autism-ADHD overlap creates a design paradox: autism drives toward predictability; ADHD drives toward novelty. Resolution:

- **Navigation, layout, and interaction patterns must be identical across sessions** — satisfies the predictability need.
- **Content, status, data, and micro-rewards should vary appropriately** — satisfies the novelty need.
- State transitions (tab changes, step completions) must be brief and contextual — not abrupt — because state transitions are neurologically costly for auDHD users.

---

## Part 2: InviteFlow UX Audit — Friction Points by Priority

### Critical (decision paralysis / context loss)

| # | Issue | Location | ADHD Impact |
|---|---|---|---|
| 1 | No linear workflow / entry point | EventDashboard | Decision paralysis, overwhelm |
| 2 | No unsaved changes indicator | ComposePage, EventSetupPage, InviteesPage | Work loss, shame, disengagement |
| 3 | DataTable cognitive overload (12 columns, 4 bulk actions) | InviteesPage | Info overload, task abandonment |
| 4 | No guardrails on task switching | Router / all pages | Context loss, working memory drain |
| 5 | Multiple confusing status systems | SendPage, InviteesPage, TrackerPage | Working memory strain |

### High priority

| # | Issue | Location | ADHD Impact |
|---|---|---|---|
| 6 | 12-field form with no grouping | EventSetupPage | Form fatigue, dopamine drop |
| 7 | Token insertion UI: 14 flat buttons, no grouping | ComposePage | Scanning fatigue |
| 8 | Stats without narrative context | EventDashboard, SendPage, TrackerPage | Requires external processing |
| 9 | Cryptic error messages with no "what now?" | Multiple | Frustration, abandonment |
| 10 | Color-only status indicators (no icon/text) | TrackerPage, SendPage | Working memory load |
| 11 | No progress indicators in multi-step workflow | All workflow pages | No dopamine reward, disengagement |

### Medium priority

| # | Issue | Location | ADHD Impact |
|---|---|---|---|
| 12 | Too many metrics at once in Tracker | TrackerPage | Visual overstimulation |
| 13 | Modal dialogs with unclear exit path | InviteesPage, ScoutPage | Anxiety, misclicks |
| 14 | Inconsistent button labeling (lowercase vs ALL-CAPS vs Mixed) | Multiple | Pattern recognition overhead |
| 15 | Monospace font everywhere (body, labels, nav, stats) | if.css, all pages | Reading fatigue |
| 16 | Low contrast on `--text-secondary` (#8a8170) | theme.css | Extended fatigue |
| 17 | Unclear CTA hierarchy — multiple equal-weight paths | ComposePage, EventDashboard | Decision paralysis |
| 18 | Settings: required vs. optional fields given equal weight | SettingsPage | Cognitive friction |

### Lower priority (polish)

| # | Issue | Location |
|---|---|---|
| 19 | Generic empty states without actionable next step | EventsPage, TrackerPage |
| 20 | Scout page complexity visible during core workflow | ScoutPage |
| 21 | No keyboard navigation strategy | All pages |
| 22 | `state.unsaved` tracked but never shown | types.ts, all edit pages |

---

## Part 3: Typography Specification

### Typeface selection

**Body text / UI copy: Lexend**
- Google-backed research: ~20% reading speed improvement vs. serif; 90% of participants showed better fluency scores
- Mechanism: variable inter-letter spacing (the "Hyper Expansion" axis) baked into the typeface; clean letterforms that minimize character confusion
- Free, Google Fonts, variable font
- Usage: all body copy, button labels, nav labels, paragraph text

**Labels / data / status: Atkinson Hyperlegible**
- Designed by the Braille Institute to maximize character disambiguation
- Each letterform engineered so `b/d/p/q`, `I/l/1`, `O/0`, `rn/m` are unambiguous
- Free from Braille Institute and Google Fonts
- Usage: form field labels, captions, status badges, data values

**Avoid for UI body text: OpenDyslexic**
- Multiple peer-reviewed studies (including 2017 Annals of Dyslexia) found zero improvement in reading speed or accuracy vs. Arial/Verdana. Not recommended.

**Monospace: retain for code only**
- Geist Mono / JetBrains Mono: keep for the GAS code block in SyncPage, token display in ComposePage
- Remove from all nav labels, body copy, stat values, and general UI text

```css
/* Font stack */
--font-body: 'Lexend', 'Inter', system-ui, sans-serif;
--font-label: 'Atkinson Hyperlegible', 'Inter', sans-serif;
--font-mono: 'Geist Mono', 'JetBrains Mono', 'Consolas', monospace;
```

### Font sizing

| Element | Current | Recommended | Notes |
|---|---|---|---|
| Body / paragraph copy | ~13px | **16px / 1rem** | 14px absolute minimum; 16 significantly reduces fatigue |
| Navigation labels | 10px | **13px / 0.8125rem** | Uppercase + letter-spacing compensate for small size |
| Section/column headings | 12–13px | **16–18px / 1–1.125rem** | |
| Page / major headings | 13px bold | **20–24px / 1.25–1.5rem** | |
| Form field labels | 10px | **12px / 0.75rem** | All-caps OK at 12px with +0.08em spacing |
| Stat values | 24px | **24px** ✓ (keep) | |
| Stat labels | 9px | **11–12px** | |
| Data table cells | ~13px | **14px / 0.875rem** | |
| Badge / tag text | 10px | **11px / 0.6875rem** | Only at very short strings |

### Line height, letter spacing, line length

**Line height:**
```css
--lh-body:    1.65;   /* body text, paragraphs */
--lh-ui:      1.4;    /* nav labels, compact UI elements */
--lh-heading: 1.25;   /* headings */
--lh-table:   1.4;    /* table cells */
```

**Letter spacing:**
```css
/* Body text (Lexend handles this internally — start at 0, only add if needed) */
--ls-body: 0em;

/* Uppercase labels / nav */
--ls-label-upper: 0.08em;

/* All-caps micro-labels */
--ls-micro: 0.12em;
```

PMC/NCBI research (2020): inter-letter spacing must be increased *together* with word spacing — increasing one without the other impairs reading. If adding `letter-spacing`, always pair with proportional `word-spacing` (~2.5× the letter-spacing value).

**Line length:**
```css
/* Reading-heavy containers */
max-width: 65ch;

/* UI panels */
max-width: 80ch;
```

British Dyslexia Association and WCAG: 60–75 CPL optimal; 80 CPL absolute maximum.

---

## Part 4: Color and Theming Specification

### The core principle: warm dark gray, not pure black

Pure black (#000) with white text creates the "halation effect" — bright text appears to vibrate or bleed against pitch-black. This is measurably worse for users with visual processing sensitivities including ADHD. Target: warm-shifted dark grays for backgrounds, warm off-white for primary text.

Reference points: Material Design dark background `#121212`, IBM Carbon Gray 100 `#161616`, GitHub Primer dark canvas `#0d1117`. All avoid pure black.

### Background palette

| Token | Hex | Role |
|---|---|---|
| `--bg-root` | `#141416` | Page background — warm-shifted, not pure neutral |
| `--bg-surface` | `#1C1C1F` | Cards, panels — +2 stops from root |
| `--bg-elevated` | `#242428` | Dropdowns, modals — +2 stops from surface |
| `--bg-subtle` | `#2A2A2E` | Hover states, code blocks, selected rows |
| `--bg-overlay` | `rgba(0,0,0,0.55)` | Modal backdrops |

The warm undertone (hue shifted ~3–5° toward warm/purple-brown) vs. pure neutral grays significantly reduces fatigue in extended sessions. Compare: `hsl(240, 3%, 8%)` (current) → `hsl(255, 5%, 8%)` (warmer).

### Text palette

| Token | Hex | Contrast on `#141416` | Role |
|---|---|---|---|
| `--text-heading` | `#E8E6E1` | ~14:1 | Headings, primary values |
| `--text-primary` | `#C9C7C0` | ~9:1 | Body text, default content |
| `--text-secondary` | `#9B9890` | ~5:1 | Secondary labels, captions |
| `--text-muted` | `#6B6864` | ~3.5:1 | Disabled, placeholder-adjacent |
| `--text-placeholder` | `#5A5855` | ~2.8:1 | Input placeholders |

`--text-heading` is warm off-white (`#E8E6E1`), not pure white (`#FFFFFF`). This eliminates halation while still exceeding WCAG AAA at this background. Current `--text-secondary` (#8a8170) is below optimal — upgrade to `#9B9890` for the same visual character with better contrast.

### Contrast targets

| Standard | Body text target | Notes |
|---|---|---|
| WCAG 2.2 AA | 4.5:1 minimum | Absolute floor |
| WCAG 2.2 AAA | 7:1 | Target for all body text |
| APCA Lc 75 | ~8–9:1 equivalent | Minimum for comfortable body reading |
| APCA Lc 90 | ~12–14:1 equivalent | Target for headings |
| Halation zone | >15:1 | Avoid pure white on pure black |

Do not use `#FFFFFF` or `#000000` anywhere in the UI.

### Accent / interactive color

Blue is the safest accent for ADHD dark UIs: familiar in productive dark tools (GitHub, Linear, VS Code), low apparent luminance that doesn't distract peripherally. Saturation: 55–75% HSL — muted enough not to compete with content, vivid enough to be immediately identifiable as interactive.

| Token | Hex | HSL | Use |
|---|---|---|---|
| `--accent` | `#5B8DEF` | hsl(218, 82%, 64%) | Primary interactive, active states, focus rings |
| `--accent-hover` | `#6F9DF2` | hsl(218, 82%, 70%) | Button hover |
| `--accent-muted` | `rgba(91,141,239,0.15)` | — | Selected row backgrounds |
| `--accent-text` | `#93B8FF` | hsl(218, 100%, 79%) | Text links, inline accented text |

Single accent hue used consistently. No competing accent colors.

### Status colors

Design rule: never rely on color alone. Always pair with icon + text label. The ADHD user scanning quickly must parse status without decoding color. Use muted, desaturated versions — bright red triggers alarm response disproportionate to the situation.

| Status | Background | Text | Border | Icon |
|---|---|---|---|---|
| Success | `#1A2E1F` | `#5CB87A` | `#2D5038` | ✓ checkmark |
| Error / Danger | `#2E1A1A` | `#E06464` | `#5A2A2A` | ✕ or ⚠ |
| Warning | `#2E2518` | `#D4A44C` | `#5A4820` | ⚠ |
| Info | `#1A2235` | `#5B8DEF` | `#2A3D5A` | ℹ |
| Neutral | `#1E1E22` | `#9B9890` | `#383835` | — |

- Error is muted warm red (`#E06464`), ~50% saturation vs. pure red — reads clearly as danger without triggering alarm
- Warning uses amber/gold (`#D4A44C`) — less eye-searing than bright yellow, still reads as "pay attention"
- Info uses the accent blue — consistent with interactive color; info is not alarming

### Border colors

```css
--border:          #2E2E32;   /* card/panel borders */
--border-input:    #3A3A3F;   /* input field borders */
--border-focus:    #5B8DEF;   /* focus ring (matches accent) */
--border-strong:   #4A4A50;   /* stronger separator lines */
```

---

## Part 5: Spacing and Motion Specification

### Spacing system (8-point grid)

All spacing values are multiples of 4, preferably 8:

```css
--space-1:  4px;   /* minimum (icon internal padding, tight badges) */
--space-2:  8px;   /* between inline elements */
--space-3:  12px;  /* compact card padding, tight list items */
--space-4:  16px;  /* standard element/card internal padding */
--space-5:  20px;  /* generous card padding */
--space-6:  24px;  /* section-internal spacing */
--space-8:  32px;  /* section-to-section spacing */
--space-10: 40px;  /* major section breaks */
```

Card internal padding: 16–20px. Section gap: 24–32px. Table row vertical padding: 10–12px.

### Touch targets

| Surface | Minimum | Recommended |
|---|---|---|
| Desktop interactive elements | 28px (WCAG 2.5.8) | **36px** (current `.if-btn` — keep) |
| Mobile touch targets | 44px (Apple/Google/WCAG AAA) | **44px minimum** |
| Mobile primary actions | 44px | **48px** |
| Table row height | — | **40px** |

The existing mobile breakpoint override to 44px min-height is correct. Verify it covers all interactive elements, not just `.if-btn`.

### Animation and motion

The ADHD brain is highly sensitive to movement in peripheral vision — it pulls attention away from the task. Eliminate any animation not directly tied to a user action. Keep direct-feedback animations brief.

| Interaction | Duration | Easing |
|---|---|---|
| Button hover | `150ms` | `ease-out` |
| Button press/active | `80ms` | `linear` |
| Dropdown/menu open | `150–200ms` | `cubic-bezier(0.16,1,0.3,1)` |
| Modal enter | `200ms` | `cubic-bezier(0.16,1,0.3,1)` |
| Modal exit | `150ms` | `ease-in` |
| Tab switch | **0ms** | — (instant is correct) |
| Progress bar fill | `400ms` | `ease-out` |
| Status message appear | `200ms` | `ease-out` |
| Status message disappear | `300ms` | `ease-in` |
| Tooltip show | `100ms` | `ease-out` |

Rules:
- No looping animations unless actively waiting (spinner)
- No auto-play, parallax, or scroll-triggered animations
- No "spring" easing with overshoot — the bounce draws attention and feels unpredictable
- No tab-switch animation — instant switching is the correct behavior

```css
/* Required: prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Use `0.01ms` not `0` — some JS relies on `transitionend` events. Opacity-only transitions ≤200ms are acceptable even under reduced-motion.

---

## Part 6: Prioritized Implementation Roadmap

### P0 — Quick wins (1–2 days, high impact, low risk)

These changes are CSS/copy-only. No behavioral changes. Highest ratio of ADHD impact to implementation cost.

| # | Change | Files | Impact |
|---|---|---|---|
| P0-1 | Switch body font to Lexend; Atkinson Hyperlegible for labels | `theme.css`, Google Fonts import | Reading fatigue ↓ dramatically |
| P0-2 | Warm off-white text (`#E8E6E1` headings, `#C9C7C0` body) | `theme.css` | Halation eliminated |
| P0-3 | Warm dark gray backgrounds (`#141416` root, `#1C1C1F` surfaces) | `theme.css` | Eye strain ↓ over long sessions |
| P0-4 | Line height 1.65 on body text; 1.4 on UI elements | `if.css`, `theme.css` | Reading comprehension ↑ |
| P0-5 | Muted status colors + icon pairing on all status elements | `theme.css`, `if.css` | Anxiety reduction, RSD protection |
| P0-6 | Remove all animations except direct-feedback transitions | `if.css` | Attention disruption ↓ |
| P0-7 | Increase `--text-secondary` contrast (`#9B9890`) | `theme.css` | Legibility across all secondary text |
| P0-8 | Shame-free, actionable error message copy | All pages | RSD protection, task resumption |

### P1 — Core behavioral changes (week 1)

| # | Change | Files | Impact |
|---|---|---|---|
| P1-1 | EventDashboard: one dominant CTA based on current state | `EventDashboard.tsx` | Eliminates task-initiation paralysis |
| P1-2 | SendPage: live per-item progress ("Sending to: Sen. Smith... 18/47") | `SendPage.tsx` | Keeps user in flow during hardest task |
| P1-3 | Pre-flight send confirmation gate (calm summary, then run silently) | `SendPage.tsx` | Eliminates mid-operation anxiety |
| P1-4 | Mobile: card view for Invitees (replace 12-column table on small screens) | `InviteesPage.tsx` | Makes phone use viable |
| P1-5 | Show `state.unsaved` in header when changes are pending | `App.tsx`, reducer | Prevents work loss, reduces anxiety |

### P2 — UX structure (week 2)

| # | Change | Files | Impact |
|---|---|---|---|
| P2-1 | EventSetupPage: group 12 fields into 3 sections (Details / Contact / Links) | `EventSetupPage.tsx` | Form fatigue ↓ |
| P2-2 | Unify status terminology across all tabs | types.ts, all pages | Working memory overhead ↓ |
| P2-3 | Stats with narrative context ("3 of 47 confirmed") | TrackerPage, SendPage | Numbers become meaningful |
| P2-4 | Token insertion grouped by category (guest / event / meta) | `ComposePage.tsx` | Scanning fatigue ↓ |
| P2-5 | Consistent button labeling audit (sentence case, outcome-describing) | All pages | Pattern recognition load ↓ |
| P2-6 | Settings: visually distinguish required from optional | `SettingsPage.tsx` | Clarity on what blocks core workflow |

### P3 — Polish and motion (week 3)

| # | Change | Impact |
|---|---|---|
| P3-1 | Add `prefers-reduced-motion` CSS block | Vestibular accessibility |
| P3-2 | Completion animations for each workflow step (brief, ≤300ms) | Dopamine micro-rewards |
| P3-3 | Soft-landing state after bulk send | Prevents freeze/doom-scroll post-task |
| P3-4 | Improve empty states with contextual next-step CTAs | Orientation when lost |
| P3-5 | Modal: Escape key + visible close button + clear submit vs. cancel hierarchy | Anxiety reduction |

---

## Reference: Design System Token Changes

Summary of specific theme.css token updates needed (P0 changes):

```css
/* BEFORE → AFTER */
--bg-root:          [current]  → #141416
--bg-surface:       [current]  → #1C1C1F
--bg-elevated:      [new]         #242428
--bg-subtle:        [current]  → #2A2A2E

--text-heading:     [current]  → #E8E6E1
--text-primary:     [current]  → #C9C7C0
--text-secondary:   #8a8170    → #9B9890
--text-muted:       [current]  → #6B6864

--accent:           [current]  → #5B8DEF
--accent-hover:     [new]         #6F9DF2
--accent-muted:     [new]         rgba(91,141,239,0.15)
--accent-text:      [new]         #93B8FF

--success-bg:       [current]  → #1A2E1F
--success:          [current]  → #5CB87A
--danger-bg:        [current]  → #2E1A1A
--danger:           [current]  → #E06464
--warning-bg:       [new]         #2E2518
--warning:          [current]  → #D4A44C
--info-bg:          [new]         #1A2235
--info:             [new]         #5B8DEF

--border:           [current]  → #2E2E32
--border-input:     [current]  → #3A3A3F
--border-focus:     [new]         #5B8DEF

--font-body:        [new]         'Lexend', 'Inter', system-ui, sans-serif
--font-label:       [new]         'Atkinson Hyperlegible', 'Inter', sans-serif
--font-mono:        [keep]        'Geist Mono', 'JetBrains Mono', monospace
```

---

## Sources

**ADHD/neurodiversity UX:**
- Gravitywell: *How We Designed an ADHD-Friendly Mobile App* (dubbii, n=30,000)
- Tiimo: *Sensory-Friendly Design for ADHD and Autism*; *Task Initiation Tactics for ADHD Adults*
- Intuit Design Hub: *How My ADHD Makes Me a Better Designer*
- arXiv 2507.06864: *Toward Neurodivergent-Aware Productivity* (n=25 ADHD professionals)
- NNG: *Why Zen Mode Isn't the Answer*
- UXPA: *Designing for ADHD in UX*; *Beyond the Interface: Neuroadaptive UX*
- Klarity Health: *Breaking the Chain: Why Streak Features Fail ADHD Users*
- DEV Community / WellNest: *Why Most Medication Apps Fail ADHD Brains*
- Jacob Vetere: *Designing Software with ADHD in Mind*
- Go Make Things: *How to Get Stuff Done as a Developer with ADHD*
- UX Magazine: *Designing for Dopamine*
- UX Planet: *Boost Task Completion with Dopamine*

**Typography:**
- PMC/NCBI: *Inter-letter spacing, font with dyslexia-friendly features* (2020)
- PMC: *Extra-large letter spacing improves reading in dyslexia*
- PubMed: *The effect of OpenDyslexic on reading rate and accuracy* (2017)
- Neurolaunch; ReadingQuick; AudioEye; Nook: *Best Fonts for ADHD Readers*
- Teleprompter.com: *Effectiveness of Lexend and OpenDyslexic Fonts*
- Braille Institute: *Atkinson Hyperlegible Font*
- British Dyslexia Association: typography recommendations
- UXPin: *Optimal Line Length for Readability*

**Color and contrast:**
- Smashing Magazine: *Inclusive Dark Mode: Designing Accessible Dark Themes* (2025)
- APCA: *APCA in a Nutshell*; WCAG 2.2 AA/AAA specifications
- GitHub Blog: *Unlocking Inclusive Design: How Primer's Color System Is Making GitHub More Inclusive*
- Linear: *A calmer interface for a product in motion* (2024–2025 design refresh)
- IBM Carbon Design System; Material Design dark theme documentation
- DubBot: *Dark Mode: Best Practices for Accessibility*

**Motion and spacing:**
- MDN Web Docs: *prefers-reduced-motion*
- Smashing Magazine: *Accessible Target Sizes Cheatsheet*
- WCAG 2.5.5 / 2.5.8: target size requirements
- GitHub Gist (uxderrick): *Web Animation Best Practices & Guidelines*
