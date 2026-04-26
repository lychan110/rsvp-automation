# Responsive Mobile-First Design — InviteFlow v3.1

Author: Yu-Chin Chan
Date: 2026-04-25

## Overview

Full Tailwind CSS migration with light-theme-default and dark-mode toggle, mobile-first responsive layout across all 7 tabs, hamburger drawer navigation on mobile, and WCAG AA accessibility improvements.

## Section 1 — Setup & Architecture

### Dependencies
- Add `tailwindcss` and `@tailwindcss/vite` (Tailwind v4 Vite plugin — zero config file required)
- No other new runtime dependencies

### CSS entry point
`src/index.css` gets `@import "tailwindcss"` as its first line. All existing inline styles are replaced with Tailwind utility classes during migration.

### Theme system
- **Light theme is the default.** Clean white/gray palette for all components.
- **Dark mode** is opt-in via a `dark` class on `<html>`. The existing dark palette (`#080c10`, `#0d1117`, `#21262d`, `#c9d1d9`, `#C8A84B`, etc.) is preserved as `dark:` variant values using Tailwind arbitrary values.
- Theme preference persisted in `localStorage` key `inviteflow_theme`.
- `AppContext` gains `darkMode: boolean` state field and a `TOGGLE_DARK` action.
- `App.tsx` syncs `document.documentElement.classList` in a `useEffect` whenever `darkMode` changes.

### Style overrides
Two small supplemental stylesheets in `src/inviteflow/styles/`:
- `tiptap.css` — TipTap editor prose styles (cursor, placeholder, focus ring) for both themes
- `primereact-reset.css` — neutralises PrimeReact's default white-theme backgrounds and borders so the DataTable inherits the app palette

Both imported in `src/main.tsx` after the Tailwind import.

### Version label
Header displays `v3.1` (updated from `v3`).

## Section 2 — App Header & Navigation

### Header layout
Two-zone flex bar (`justify-between`):

**Left zone:**
- "INVITEFLOW" wordmark (bold, tracking-tight)
- "v3.1" badge
- Active event name — `truncate max-w-[160px]` prevents overflow on narrow screens
- Unsaved dot indicator

**Right zone:**
- Theme toggle button (sun ☀ / moon ☾ text label, or Unicode glyph) — visible at all widths
- Hamburger `☰` button — `md:hidden`, opens the mobile drawer
- Desktop tab nav — `hidden md:flex`, 7 horizontal tab buttons unchanged from current layout

### Mobile drawer
- Triggered by hamburger button; state: `useState<boolean>(drawerOpen)`
- Fixed full-height panel sliding in from the left, `z-50`
- 7 tab rows, each `min-h-[44px]`, active tab highlighted with blue left border + background tint
- Closes on tab selection or backdrop tap
- Backdrop: `fixed inset-0 bg-black/40 z-40`
- Slide animation via `transition-transform`; `@media (prefers-reduced-motion: reduce)` disables animation
- ARIA: button `aria-label="Open navigation"`, drawer `role="dialog" aria-modal="true"`, tab items `role="tab" aria-selected`

## Section 3 — Per-Tab Responsive Changes

### EventsTab
- Card grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` (replaces `auto-fill minmax`)
- All action buttons: `min-h-[44px]`
- Card padding scaled to `p-4` on mobile, `p-5` on desktop

### SetupTab
- Form rows: `flex flex-col md:flex-row md:items-center gap-2` — stacked on mobile, inline label+input on `md:`
- Each input: `w-full`
- Google OAuth section: single-column on all breakpoints (already narrow content)
- Save / Authorize buttons: `min-h-[44px] w-full sm:w-auto`

### InviteesTab
- DataTable wrapped in `overflow-x-auto` container with `role="region" aria-label="Invitees table" tabindex="0"`
- PrimeReact DataTable gets `scrollable scrollHeight="flex"` props
- Action toolbar (import buttons, Add Invitee button): `flex flex-wrap gap-2`
- ContactScoutPanel: `w-full` on mobile, `max-w-sm` on `md:`
- Import URL input: `w-full`

### ComposeTab
- Token insert bar: `flex flex-wrap gap-1` (already has `flexWrap: wrap` — convert to Tailwind)
- Format toolbar: single row, `flex gap-1 flex-wrap`
- **Editor/Preview split**: on `md:` and up, `grid grid-cols-2` (current 50/50). On mobile: two toggle buttons `EDITOR` / `PREVIEW` (visible only below `md:`) swap a `activePane: 'editor' | 'preview'` local `useState` (not persisted); only the selected pane renders. The other pane is `hidden`. Default is `'editor'`.
- Both panes: `overflow-auto p-4`

### SendTab
- Filter + Send button row: `flex flex-wrap gap-2`
- Send log table: `overflow-x-auto` wrapper with `role="region" tabindex="0"`
- Progress bar and status text: full-width on mobile

### TrackerTab
- Stats card grid: `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3` — 2-up on small phones
- Category breakdown table: `overflow-x-auto` wrapper
- Table itself: `min-w-[500px]` so columns don't collapse before scroll kicks in

### SyncTab
- Audit and apply same `w-full` inputs, `flex-wrap` toolbars, and `overflow-x-auto` table patterns

## Section 4 — Accessibility & Polish

### Touch targets
- All `<button>` elements: `min-h-[44px]` at all breakpoints (44px on desktop is unobtrusive; avoiding a `md:` reset simplifies the rule)
- Icon-only buttons also get `min-w-[44px]`

### Focus visibility
- All interactive elements: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500` (light) / `dark:focus-visible:ring-blue-400` (dark)
- No focus suppression

### Font size floor
- Replace all `fontSize: 9` and `fontSize: 10` with minimum `text-[11px]` or `text-xs` (12px)
- Body/label text: `text-sm` (14px) as the mobile baseline

### Color contrast
- Light theme: primary text `text-gray-900` on `bg-white` / `bg-gray-50` — passes WCAG AA
- Dark theme: existing `#c9d1d9` on `#080c10` passes AA
- Gold accent `#C8A84B` used only as decoration (borders, badges) — never as sole state indicator; status always paired with text label

### Scrollable region accessibility
- All `overflow-x-auto` wrappers: `role="region" aria-label="<descriptive name>" tabindex="0"`

### Reduced motion
- Drawer slide transition wrapped: `motion-safe:transition-transform` (Tailwind's built-in reduced-motion utility)

## Light Theme Palette

| Token | Light value | Dark value |
|---|---|---|
| App background | `bg-gray-50` | `dark:bg-[#080c10]` |
| Surface / card | `bg-white` | `dark:bg-[#0d1117]` |
| Border | `border-gray-200` | `dark:border-[#21262d]` |
| Primary text | `text-gray-900` | `dark:text-[#c9d1d9]` |
| Muted text | `text-gray-500` | `dark:text-[#6e7681]` |
| Accent blue | `text-blue-600` | `dark:text-[#58a6ff]` |
| Active tab | `bg-blue-600 text-white` | `dark:bg-[#1f6feb] dark:text-white` |
| Gold accent | `text-[#C8A84B]` | `dark:text-[#C8A84B]` |
| Success green | `text-green-600` | `dark:text-[#3fb950]` |
| Error red | `text-red-600` | `dark:text-[#f85149]` |

## Files Changed

| File | Change |
|---|---|
| `package.json` | Bump `version` to `3.1.0`, `name` to `inviteflow-v3.1`, add `tailwindcss`, `@tailwindcss/vite` |
| `vite.config.ts` | Add `tailwindcss()` Vite plugin |
| `src/index.css` | Add `@import "tailwindcss"` |
| `src/main.tsx` | Import tiptap.css, primereact-reset.css |
| `src/inviteflow/styles/tiptap.css` | New — TipTap prose overrides |
| `src/inviteflow/styles/primereact-reset.css` | New — PrimeReact dark palette reset |
| `src/inviteflow/state/AppContext.tsx` | Add `darkMode`, `TOGGLE_DARK` |
| `src/inviteflow/state/reducer.ts` | Handle `TOGGLE_DARK` |
| `src/inviteflow/state/actions.ts` | Add `TOGGLE_DARK` action type |
| `src/inviteflow/App.tsx` | Hamburger drawer, theme toggle, v3.1 label, Tailwind classes |
| `src/inviteflow/tabs/EventsTab.tsx` | Tailwind classes, responsive grid |
| `src/inviteflow/tabs/SetupTab.tsx` | Tailwind classes, stacked mobile form |
| `src/inviteflow/tabs/InviteesTab.tsx` | Tailwind classes, overflow-x-auto, flex-wrap toolbar |
| `src/inviteflow/tabs/ComposeTab.tsx` | Tailwind classes, editor/preview toggle on mobile |
| `src/inviteflow/tabs/SendTab.tsx` | Tailwind classes, flex-wrap, overflow-x-auto |
| `src/inviteflow/tabs/TrackerTab.tsx` | Tailwind classes, responsive grid, overflow-x-auto |
| `src/inviteflow/tabs/SyncTab.tsx` | Tailwind classes, flex-wrap, overflow-x-auto |
| `src/inviteflow/components/ContactScoutPanel.tsx` | Tailwind classes, full-width on mobile |
| Git tag | Create annotated tag `v3.1.0` after all changes land |
