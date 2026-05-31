# MEMORY.md — InviteFlow Non-Obvious Learnings

> Institutional knowledge accumulated across development sessions. Updated when something surprising, counter-intuitive, or hard-won is discovered.

---

## Architecture Decisions

### Gmail → Resend Migration
The app originally sent email via the Gmail API (Google OAuth tokens, `buildMimeRaw`, `sendEmail` in `api/gmail.ts`). This was fully replaced by Resend in `api/email.ts`. The Google OAuth section in `EventSetupPage.tsx` is vestigial — `authorize()` just returns "OAuth is not available in this version." `gmail.ts` was deleted; its `personalize()` function lives on in `email.ts`.

### TipTap → React Email Migration
`ComposeTab` originally used TipTap (ProseMirror-based rich text editor). TipTap was removed and replaced with React Email component templates (`src/inviteflow/emails/`). Backward-compatibility: if `state.templateId` is null/empty, `buildEmailHtml()` falls back to raw HTML in `state.htmlBody` via `personalize()`. New templates receive typed props `(event, invitee)` — no string token replacement needed for them.

### ContactScout: Embedded, Not Standalone
`src/scout/` is the ContactScout engine (API client, search, email patterns, types). It is NOT a standalone app — it is imported directly by `src/inviteflow/pages/ScoutPage.tsx` and `ContactScoutPanel.tsx`. The standalone ContactScout app was archived. Never treat `src/scout/` as independently runnable.

### LiteLLM as AI Gateway
The Scout/Discover feature calls an OpenAI-compatible endpoint from the browser. The default (`http://127.0.0.1:4000/v1`) is LiteLLM running locally. API keys are stored in `sessionStorage` (not persisted between page loads). `MODEL_SCAN` and `MODEL_VERIFY` in `constants.ts` are model identifiers sent to LiteLLM — LiteLLM routes to the actual provider. These can be any model ID your LiteLLM instance supports.

### Gemini Migration Plan (Not Fully Executed As Written)
`docs/superpowers/plans/2026-04-29-gemini-migration.md` intended to switch from Claude API to Google Gemini. What actually happened: the code moved to a LiteLLM proxy (OpenAI-compatible interface). `MODEL_SCAN`/`MODEL_VERIFY` were NOT changed to `gemini-2.5-flash` — they remain `claude-haiku-4-5`. This is intentional: LiteLLM handles the actual model routing. The plan's rate limit analysis (15 RPM, 4500ms delay) applies if routing to Gemini free tier.

### JSON Mode + Google Search Grounding Are Incompatible
`responseMimeType: "application/json"` cannot be combined with the `google_search` tool on Google's API (returns 400). The workaround in `api.ts` is to use text output with `extractJson()` parsing — system prompts instruct the model to output raw JSON. This is why there is no `response_format` parameter in `callLiteLLM()`.

---

## Build System

### Version: Single Source of Truth Is `package.json`
Never put the version in `.env`. The pipeline:
- `vite.config.ts` reads `package.json` at build time → injects into HTML `<title>` and `import.meta.env.VITE_APP_VERSION`
- `scripts/inject-version.js` reads `package.json` → updates the `InviteFlow vX.Y.Z` string in `README.md` and `SyncPage.tsx` GAS header
- CI extracts it via `node -p "require('./package.json').version"`
- Docker: do NOT hardcode `VITE_APP_VERSION` in compose build args — it goes stale

### `copy-static.js` Overwrites `dist/index.html`
The script first copies the root `index.html` landing page to `dist/`, then immediately overwrites `dist/index.html` with the InviteFlow app's own `index.html`. Net result: the root landing page is **not published**; the InviteFlow app is served at the root URL on GitHub Pages. The root `index.html` in the repo exists only for local reference.

### GAS Code: Two Sources, One Canonical
The RSVP ingest script exists in two places:
1. `gas/Code.gs` — manually maintained standalone file
2. `src/inviteflow/pages/SyncPage.tsx` — embedded as `GAS_CODE` string, auto-updated by `inject-version.js`

`SyncPage.tsx` is canonical. `gas/Code.gs` is updated manually and may lag. Users should copy from the Sync tab UI in the app, not directly from `gas/Code.gs`.

### tsconfig Excludes `tabs/` But Import Resolution Bypasses It
`src/inviteflow/tabs` is in the `exclude` array in `tsconfig.json`. However, because `App.tsx` explicitly imports `ComposeTab` and `SendTab` from that directory, TypeScript resolves those imports and type-checks them anyway. The exclusion only prevents files from being *discovered by glob*; files referenced via `import` are always checked. Any type errors in `ComposeTab.tsx` or `SendTab.tsx` will break the build.

---

## Deployment

### Docker: Two Compose Files, Different Contexts
- `docker-compose.yml` — local dev, port 5177, reads `.env` in repo root
- `rsvp-docker-compose.yml` — server/shared deployment, port 5176, reads `~/.rsvp-automation.env` (keeps secrets out of the repo checkout)

Both run the dev server (`Dockerfile` only has a dev stage). `nginx.conf` in the repo is prepared for a future production multi-stage build and is not currently wired into the Dockerfile.

### Submodule: Always Init Before Build
`shared/` is a git submodule (`@lenya/webapp-shared`). Build fails with "Can't resolve '../shared/src/styles/fonts.css'" if not initialized. Fix: `git submodule update --init --recursive`. The `.githooks/post-checkout` and `.githooks/post-merge` scripts do this automatically after pull/branch-switch in local dev. CI uses `submodules: true` in the checkout action.

---

## Design System

### Dark-Only — No Light Mode
The app is permanently dark. All CSS scopes to `:root`, never `.dark`. There is no light mode toggle. PrimeReact token overrides in `styles/primereact-reset.css` also target `:root`.

### `redesign-scaffold/` Is Gitignored and Does Not Exist in the Repo
`redesign-scaffold/` is listed in `.gitignore`. The files `redesign-scaffold/roster.jsx` and `redesign-scaffold/CLAUDE_CODE_HANDOFF.md` do not exist in the working tree. `docs/DESIGN.md` is the authoritative destination for those design rules — not any file in `redesign-scaffold/`.

### PrimeReact CSS Load Order Is Critical
In `main.tsx`, PrimeReact theme CSS must be imported **before** app styles:
1. PrimeReact theme (`lara-light-indigo`)
2. PrimeReact core (`primereact.min.css`)
3. PrimeIcons + PrimeFlex
4. App resets (`styles/primereact-reset.css`)
5. App theme and component styles (`theme.css`, `styles/if.css`)

Reversing this order breaks PrimeReact component styling.

---

## Scout / Discover Feature

### ContactScout Password Gate Is Soft Security
`SCOUT_PW = 'scout2025'` in `src/scout/constants.ts` is a basic access gate. It is client-side and provides no real security — anyone who inspects the bundle can bypass it. It is meant to prevent accidental use, not unauthorized access.

### OpenStates API for State Legislators
`src/scout/openStates.ts` fetches state legislators from the OpenStates API (`VITE_OPENSTATES_API_KEY`). This supplements the LLM-based scan for state legislature targets, returning structured data without an LLM call.

### Email Pattern Inference Reduces LLM Calls
`src/scout/emailPatterns.ts` infers email addresses for officials with known patterns:
- US House: `firstname.lastname@mail.house.gov`
- US Senate: `firstname.lastname@lastname.senate.gov`
- NC General Assembly: `firstname.lastname@ncleg.gov`

For these categories, the LLM's email search is redundant. The LLM's primary value is scheduler discovery. Expanding `emailPatterns.ts` to more states reduces LLM quota usage with no quality loss.

### Bundled Scan+Scheduler Prompt Is a Deliberate Trade-off
The scan prompt asks for official email AND scheduler email in one call. A two-pass approach (officials first, schedulers second) would improve completeness for large bodies (50+ seats) but doubles API calls and hits rate limits faster. The bundled approach is a deliberate decision for free-tier sustainability — do not change it without re-evaluating rate limits.

### City Council Results Have Higher Hallucination Risk
Local government data is less indexed. City council scan results should be treated as starting-point candidates, not ground truth. The `confidence` field in the result schema surfaces this. Federal and state results are more reliable.

---

## UX / Product

### ADHD UX Principles (Implemented v5.0)
The 2026-05 ADHD UX overhaul (PR #43) baked in:
- Single-responsibility screens
- Guided "next step" prompts in `EventDashboard`
- Live progress tracking on bulk send operations
- Unsaved state indicator in `PageHeader`
- Mobile touch targets ≥ 44px

See `docs/superpowers/specs/2026-05-22-adhd-ux-spec.md` for the full research-backed spec.

### Template Token Replacement Is the Legacy Path
`{{Token}}` replacement via `personalize()` only applies when `state.templateId` is null (legacy HTML mode). React Email templates receive typed `(event, invitee)` props directly. New templates should use props, not string tokens.

### Google Form RSVP Integration
RSVPs are tracked via Google Forms. The RSVP link (`{{RSVP_Link}}`) is a pre-filled Google Form URL. When a guest submits, the GAS script (copy from Sync tab in the app) writes the response into the master Google Sheet. The app reads RSVP status via manual import — there is no live sync between the Sheet and IndexedDB.
