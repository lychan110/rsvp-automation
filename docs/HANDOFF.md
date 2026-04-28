# Session Handoff — 2026-04-28

## Session summary

Two major design work streams completed and merged:

1. **ContactScout visual redesign** (PR #21, #23) — refactored monolithic `App.tsx` into focused component modules (`DiscoverTab`, `OfficialsTab`, `ExportTab`, `LogSidebar`, `ApiKeyModal`, `JurisdictionModal`, `PasswordGate`); introduced `.cs-*` CSS class vocabulary via `css.ts`; established the dark terminal-inspired design language now documented in `docs/DESIGN.md`.

2. **InviteFlow design language migration** (PR #22) — applied the same dark GitHub-style visual language to InviteFlow v3.1 (React + Vite); created `src/inviteflow/styles/if.css` with a parallel `.if-*` class system; removed the theme toggle (dark-only, matching ContactScout); updated `reducer.ts` to default dark (`localStorage !== 'light'`); restyled all 7 tabs (Events, Setup, Invitees, Compose, Send, Tracker, Sync).

3. **CLAUDE.md update** — root `CLAUDE.md` rewritten to reflect InviteFlow's React v3.1 architecture (was documenting the old vanilla JS `inviteflow.html` approach); added `.if-*` class reference table; updated state shape, persistence key, tab list, and deployment instructions.

---

## Repos / branches touched

- `rsvp-automation`: all work on `claude/contact-scout-redesign-mHrFm` → merged to master via PRs #22, #23
- Master is clean, 39 commits ahead of where the previous handoff left off

---

## Current state

### rsvp-automation (master — clean)

**InviteFlow v3.1** (`src/inviteflow/`)
- React + TypeScript + Vite (root package — `npm run build` from repo root)
- Tailwind v4 for layout; `.if-*` classes (`styles/if.css`) for all design tokens
- PrimeReact DataTable in InviteesTab; TipTap editor in ComposeTab
- 7 tabs: Events, Setup, Invitees, Compose, Send, Tracker, Sync
- State persisted to `localStorage` key `inviteflow_v3_state` (excludes transient fields)
- Dark-only; default dark on first load

**ContactScout** (`src/contact-scout/`)
- Separate React + Vite package (`cd src/contact-scout && npm run build`)
- Modular component architecture — no longer a single-file App.tsx
- Design tokens: CSS vars in `index.html` `<style>` block; class utilities in `css.ts`
- `SCAN_PROMPTS` in `src/constants.ts` still contain `[YOUR STATE]` / `[YOUR COUNTIES]` / `[CITY 1-3]` placeholders — app shows warning banner until replaced

**Open PRs:** none

---

## Outstanding / next steps

- [ ] **Customize ContactScout scan prompts** — `src/contact-scout/src/constants.ts`, replace all bracketed placeholders in `SCAN_PROMPTS` before first real scan run
- [ ] **InviteFlow TASKS.md items** — `docs/TASKS.md` still lists P1 items from v02 era (Test Google Connection button, GSI error mapping, token expiry handling) — these apply to the React app now; file paths and function names will need updating
- [ ] **PROGRESS.md update** — `docs/PROGRESS.md` documents v02 (vanilla JS era); no entry yet for v3.1 React migration or design unification work
- [ ] **ContactScout model string** — `claude-sonnet-4-20250514` hardcoded in `src/contact-scout/src/constants.ts`; update when a newer Sonnet releases
- [ ] **InviteFlow dist/** — built output in `dist/` should be committed if this repo serves the app statically; check whether CI/CD handles it or if manual `npm run build && git add dist/` is needed before deploy

---

## Key conventions

**InviteFlow (React + Vite):**
- Source at `src/inviteflow/`; built from repo root with `npm run build`
- Design tokens: CSS vars in `theme.css`; utility classes in `styles/if.css`
- Adding a tab requires: new file in `tabs/`, entry in `TABS` array (`App.tsx`), entry in `TabId` union (`types.ts`), case in `TabContent` switch (`App.tsx`)
- Google OAuth per-event (each `AppEvent` has its own `googleClientId`); token fetched via `getToken(scope)` in `api/auth.ts`
- State dispatch via `useAppDispatch()`; never mutate state directly

**ContactScout (React + Vite, separate package):**
- Source at `src/contact-scout/src/`; built inside that directory with `npm run build`
- Inline styles for component-level overrides; `css.ts` for reusable class strings
- API key in `sessionStorage` (`cs_api_key`) — never localStorage
- `saveState()` via `useEffect` on `officials, newOfficials, scanStatus, scanMeta`

**Shared:**
- Dark-only; no light mode toggle in either app
- Palette documented in `docs/DESIGN.md`
- No fetch except Claude API (ContactScout) and Google APIs (InviteFlow)
- Dates: YYYY-MM-DD throughout

---

## Environment notes

- Node 22 at `/opt/node22`; git remote is local proxy at `127.0.0.1:33749`
- InviteFlow dev: `npm run dev` from repo root → `http://localhost:5173`
- ContactScout dev: `cd src/contact-scout && npm run dev` → `http://localhost:5174`
