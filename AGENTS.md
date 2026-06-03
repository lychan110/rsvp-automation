# AGENTS.md — InviteFlow

> Repo-scoped agent instructions. Keep this file current when architecture or conventions change.

## Project

**InviteFlow** — Local-first event invitation manager. All data stays in the browser (IndexedDB via Dexie). Email via Resend API. No backend, no Google account required.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + Vite 6 |
| Styling | Tailwind CSS v4 + PrimeReact |
| State | React Context + Dexie (IndexedDB) |
| Router | Custom (`RouterContext`) — hashless SPA |
| Build | `tsc && vite build && node scripts/inject-version.js && node scripts/copy-static.js` |
| Deploy | GitHub Actions → GitHub Pages |

## File Structure

```
src/
  inviteflow/           # Main app
    main.tsx            # Entry: imports theme, PrimeReact, CSS
    App.tsx             # Router switch — renders page by route
    state/              # AppContext, RouterContext
    pages/              # Full-page components (Events, Dashboard, Setup, etc.)
    tabs/               # ComposeTab + SendTab (active but excluded from tsconfig; other tab files are legacy stubs)
    components/         # Reusable UI pieces
    styles/             # App-specific CSS (if.css, primereact-reset.css)
    theme.css           # CSS variables for theming
    api/                # Resend, OpenAI, SerpAPI clients
    db/                 # Dexie schema
    emails/             # React Email templates
    types.ts            # Shared TypeScript types
  scout/                # ContactScout engine (imported by ScoutPage)
  index.css             # Tailwind entry + shared token imports
shared/                 # @lenya/webapp-shared (git submodule)
scripts/
  inject-version.js     # Bakes package.json version into README + source
  copy-static.js        # Copies static assets to dist
docs/                   # Design specs, plans, quickstart
```

## Development

```bash
npm install          # Installs deps + initializes shared submodule
npm run dev          # Vite dev server
npm run build        # Full production build
```

### Env setup

Copy `.env.example` → `.env` and fill secrets. **Never commit `.env`** — it contains API keys.

| Key | Required | Purpose |
|-----|----------|---------|
| `RESEND_API_KEY` | Yes | Send invitation emails |
| `OPENAI_API_KEY` | No | AI-powered official discovery |
| `OPENAI_ENDPOINT` | No | Custom OpenAI-compatible endpoint |
| `SERPAPI_KEY` | No | Web search for official discovery |

## Version Policy

**Single source of truth: `package.json`**

- `vite.config.ts` reads `package.json` version at build time → injects into HTML title and `import.meta.env.APP_VERSION`
- `scripts/inject-version.js` reads `package.json` → bakes version into `README.md` and GAS code headers
- CI workflow passes version via `$GITHUB_ENV`
- **Do NOT store version in `.env`** — it goes stale.

To bump: edit `package.json` → `npm run build` (or push, let CI do it).

## Shared Submodule

This repo consumes `@lenya/webapp-shared` via a git submodule at `shared/`.

- **Local**: resolve alias `@lenya/webapp-shared` → `./shared` (vite.config.ts)
- **CI**: `actions/checkout` must use `submodules: true`
- **Githooks**: `.githooks/post-checkout` and `.githooks/post-merge` auto-update the submodule on pull/branch switch
- **Never** commit inside `shared/` from this repo — commit changes in the shared repo, then `git submodule update`

## Architecture Conventions

### Routing
Custom `RouterContext` — not React Router. Routes are string keys (`events`, `event-home`, `compose`, etc.). URL hash is NOT used.

### State
- `AppContext` — global app state (events, invitees, settings)
- `RouterContext` — current route + navigation
- Dexie for persistence — all data survives page refresh

### Styling
- **Tailwind v4** utility classes for layout and custom UI
- **PrimeReact** components (DataTable, Dialog, Calendar, etc.) with Tailwind overrides in `styles/primereact-reset.css`
- **CSS variables** in `theme.css` for theming (light/dark via `.dark` class on `<html>`)
- Fonts loaded from Google Fonts in `index.html`

### TypeScript
- `tsconfig.json` excludes `src/inviteflow/tabs` (ComposeTab and SendTab are active but not type-checked; other tab files are legacy stubs)
- `noUnusedLocals: false` — don't let TS nag about unused variables during prototyping

## Testing

No formal test suite yet. Verify manually:
- `npm run build` passes (typecheck + vite build)
- Check browser console for errors
- Check dist/ output has correct version in title

## CI / Deploy

GitHub Actions workflow: `.github/workflows/deploy.yml`

1. Checkout with `submodules: true`
2. `npm ci && npm run build && node scripts/copy-static.js`
3. Upload `dist/` artifact
4. Deploy to GitHub Pages

## Gotchas

1. **Submodule not checked out** → build fails with "Can't resolve '../shared/src/styles/fonts.css'". Fix: `git submodule update --init --recursive`
2. **Stale version strings** → `inject-version.js` uses `package.json` as source of truth; if you see old versions, the build likely failed before inject-version ran
3. **PrimeReact CSS load order** matters — import PrimeReact theme BEFORE app styles in `main.tsx`
4. **`src/inviteflow/tabs` excluded from tsconfig** — these files are NOT typechecked. Only ComposeTab and SendTab are active; the rest are legacy stubs. If you add new files there, move them to `src/inviteflow/pages/` or update tsconfig
5. **`.env` secrets** — `.env` is gitignored. CI uses env vars from workflow; local dev uses `.env` file
6. **ContactScout is embedded** — `src/scout/` is the ContactScout engine, imported directly by `ScoutPage`. The standalone ContactScout app no longer exists in this repo.

## Documentation Map

When adding or changing a feature, update the right docs. Each file has a distinct scope — don't blur them.

| File | What belongs here | Update when |
|------|-------------------|-------------|
| `README.md` | User-facing feature overview, setup steps, tech stack | New feature added, setup flow changes |
| `docs/QUICKSTART.md` | Step-by-step guide for first-time users | Workflow changes, new first-run experience (e.g. demo) |
| `docs/MEMORY.md` | Non-obvious learnings: gotchas, invariants, design decisions with hidden constraints | Something surprising discovered; a decision that would confuse a future developer |
| `AGENTS.md` | Architecture, conventions, gotchas for agents/developers | Architecture changes, new conventions, new gotchas |
| `docs/DESIGN.md` | Visual design system, layout rules, color/type scale | Design language changes |

### What goes in MEMORY.md

Add an entry whenever you discover something **non-obvious** — something a future developer would reasonably get wrong. Examples: why a check must be two conditions not one, why an import must also write to Dexie, why a feature uses fixed IDs. Do not add entries for things that are obvious from reading the code.

### UI strings vs. docs

Keep tech implementation details **out of UI labels and action text**. Describe what the feature does for the user, not which service or library implements it. Service names belong in:
- Setup/configuration screens where the user needs them to sign up (e.g. "Get your key at resend.com →")
- Help text below form fields
- Project docs (README, QUICKSTART)

Not in: button labels, workflow step subtitles, status messages, section headers.

## Shipping Checklist

Before marking a PR ready or closing a task, verify:

- [ ] **Version bumped** — edit `package.json` `"version"` for any user-visible change (new feature, fix, or significant refactor). Patch = `x.y.Z`, minor = `x.Y.0`, major = `X.0.0`. Run `npm run build` after bumping so `inject-version.js` bakes it into `README.md` and `SyncPage.tsx`.
- [ ] **PR description current** — reflects the full set of changes actually merged, not just the initial scope. Update it as the PR evolves.
- [ ] **Docs updated** — see Documentation Map above.
- [ ] **Build passes** — `npm run build` with no TypeScript errors.

## Agent Operating Principles

- **Think before coding** — state assumptions, present tradeoffs, ask when unclear
- **Surgical changes** — touch only what's needed, match existing style, clean up your own orphans
- **Goal-driven** — define success criteria, verify before declaring done
- **Simplicity first** — no speculative abstractions, no features beyond the ask
- **Update docs alongside code** — when a feature ships, update README + QUICKSTART (user-facing) and MEMORY (non-obvious learnings) in the same commit or PR
