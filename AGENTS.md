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
    tabs/               # Sub-views (Compose, Send) — NOT in tsconfig
    components/         # Reusable UI pieces
    styles/             # App-specific CSS (if.css, tiptap.css, primereact-reset.css)
    theme.css           # CSS variables for theming
    api/                # Resend, OpenAI, SerpAPI clients
    db/                 # Dexie schema
    emails/             # React Email templates
    types.ts            # Shared TypeScript types
  scout/                # ContactScout (archived sub-project)
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
| `VITE_RESEND_API_KEY` | Yes | Send invitation emails |
| `VITE_OPENAI_API_KEY` | No | AI-powered official discovery |
| `VITE_OPENAI_ENDPOINT` | No | Custom OpenAI-compatible endpoint |
| `VITE_SERPAPI_KEY` | No | Web search for official discovery |

## Version Policy

**Single source of truth: `package.json`**

- `vite.config.ts` reads `package.json` version at build time → injects into HTML title and `import.meta.env.VITE_APP_VERSION`
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
- `tsconfig.json` excludes `src/contact-scout` and `src/inviteflow/tabs` (legacy)
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
4. **`src/inviteflow/tabs` excluded from tsconfig** — these files are NOT typechecked. If you add new files there, move them to `src/inviteflow/pages/` or update tsconfig
5. **`.env` secrets** — `.env` is gitignored. CI uses env vars from workflow; local dev uses `.env` file
6. **ContactScout is archived** — `src/scout/` and `src/contact-scout/` are historical. The active contact discovery is the `ScoutPage` inside InviteFlow

## Agent Operating Principles

- **Think before coding** — state assumptions, present tradeoffs, ask when unclear
- **Surgical changes** — touch only what's needed, match existing style, clean up your own orphans
- **Goal-driven** — define success criteria, verify before declaring done
- **Simplicity first** — no speculative abstractions, no features beyond the ask
- **Update this file** — when architecture or conventions change, revise AGENTS.md before or alongside the code
