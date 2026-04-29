# Session Handoff — 2026-04-28

## Session summary
Full environment setup session: fixed the empty contact-scout GitHub Pages deployment, audited and improved accessibility across both repos, installed and persisted plugins/MCPs in the cloud env, and built a cross-environment handoff system using episodic-memory + git-backed HANDOFF.md. Both repos are clean on their default branches with no open PRs.

## Repos touched
- `contact-scout`: CLAUDE.md UI/UX section (PR #1, merged); empty site fix + a11y audit (PR #2, merged); `docs/HANDOFF.md` added to main
- `rsvp-automation`: CLAUDE.md UI/UX section (PR #18, merged)

## Decisions made
- **`base: './'` over `base: '/contact-scout/'`**: relative asset paths work for both GitHub Pages subpath and local serving without env-specific builds
- **`#8b949e` as standard muted text color**: replaces `#6e7681` everywhere — lifts contrast from 4.36:1 to 6.42:1 (WCAG AA threshold is 4.5:1)
- **episodic-memory via plugin system, not npm**: npm global install fails in sandbox (native `better-sqlite3`); plugin cache at `/root/.claude/plugins/cache/superpowers-marketplace/episodic-memory/1.0.15/`
- **jcodemunch-mcp via pip** (`/usr/local/bin/jcodemunch-mcp`): pure Python, no native compilation — binary may not survive container rebuilds; SessionStart hook reinstalls if missing
- **Handoff via git-backed HANDOFF.md**: mem0 and superpowers marketplace lack viable cross-env shared memory; git-backed pull at SessionStart is the working solution
- **`~/.claude/CLAUDE.md` not synced**: does not exist in this sandbox; create here or add to SessionStart hook pull

## Current state

### contact-scout
- Branch: main (clean)
- Deployed: https://lychan110.github.io/contact-scout/ (working — PR #2 triggered fixed build pipeline)
- Open PRs: none
- Known issues: `SCAN_PROMPTS` in `src/App.tsx` lines 21-27 still contain placeholders (`[YOUR STATE]`, `[YOUR COUNTIES]`, `[CITY 1]`, `[CITY 2]`, `[CITY 3]`) — app shows warning banner until replaced

### rsvp-automation
- Branch: master (clean)
- Open PRs: none
- Known issues: Nothing to note.

## Outstanding / next steps
- [ ] **Customize scan prompts** — `src/App.tsx` lines 21-27, replace all bracketed placeholders in `SCAN_PROMPTS`
- [ ] **Responsive log panel** — `src/App.tsx` line 529: `gridTemplateColumns: '1fr 220px'` breaks at narrow viewports; collapse log panel on mobile
- [ ] **Local machine hooks** — copy-paste instructions provided in session; files needed: `~/.claude/hooks/session-stop-handoff.sh`, `~/.claude/hooks/session-start-handoff.sh`, `~/.claude/skills/handoff/SKILL.md`, merge hook entries into `~/.claude/settings.json`
- [ ] **Sync `~/.claude/CLAUDE.md`** — does not exist in cloud env; add pull step to `session-start-handoff.sh` or create manually
- [ ] **Update model string** — `claude-sonnet-4-20250514` hardcoded at `src/App.tsx` line 218; update when newer Sonnet releases
- [ ] **rsvp-automation**: review `docs/ROADMAP.md`, `docs/PROGRESS.md`, `docs/TASKS.md` for queued UX work

## Key conventions (as of this session)

**contact-scout (React + Vite):**
- Inline styles throughout — no CSS modules or Tailwind
- Palette: bg `#080c10`, cards `#0d1117`, text `#f0f6fc`, muted `#8b949e`, accent `#1f6feb`, green `#238636`, red `#da3633`
- `saveState()` via `useEffect` watching `officials, newOfficials, scanStatus, scanMeta`
- API key: `sessionStorage` key `cs_api_key` — never localStorage
- Model: `claude-sonnet-4-20250514` + `web_search_20250305` tool
- Build: `npm run build` → `dist/`; dev port 5174; GitHub Pages served from `dist/` via workflow

**rsvp-automation (vanilla JS):**
- Single `<script>` block, state `S` at top, `render()` on every mutation, `saveState()` at end of `render()`
- Tab index changes require updating: TABS array, `render()` switch, all `onclick="S.tab=N"`, all `if (S.tab===N)` checks
- Production files: `inviteflow.html`, `contactscout.html` — versioned copies use `_v{N:02d}.html`
- Google OAuth via GSI CDN — never hardcode API keys or client IDs in source

## Environment notes (cloud sandbox)
- Node 22 at `/opt/node22`; Python 3.11; git remote is local proxy at `127.0.0.1:33087`
- Network allowlist blocks all tunnel services — use live GitHub Pages URL for phone testing
- Plugins persisted in `~/.claude/` (survive sessions); pip/npm global installs at `/usr/local/` may not survive container rebuild
- Installed plugins: `superpowers@superpowers-marketplace` v5.0.7, `episodic-memory@superpowers-marketplace` v1.0.15
- Installed MCP: `jcodemunch-mcp` (stdio, user scope); SessionStart hook reinstalls binary if missing
- Hooks: `~/.claude/hooks/session-stop-handoff.sh` (Stop), `~/.claude/hooks/session-start-handoff.sh` (SessionStart)
- Skill: `/handoff` at `~/.claude/skills/handoff/SKILL.md`
