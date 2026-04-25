# InviteFlow Suite — Progress Log
**Lenya Chan**

---

## 2026-04-24 — v02 Redesign

**Scope**: Full visual and UX overhaul of all three HTML files + docs.

### Completed this session

**index.html**
- Complete rewrite: light warm palette, Fraunces + Outfit fonts, responsive 2-column card grid
- Generic naming ("contacts", not event/org-specific terms)
- Workflow visualization with numbered steps
- Scales cleanly from 375px mobile to wide desktop

**contactscout.html**
- Complete CSS rewrite: light theme, CSS custom properties, shared palette
- Renamed "officials" → "contacts" throughout UI text
- Status tags: "Left Office" → "Inactive"
- Responsive layout: fixed-height desktop panel layout / natural-scroll mobile layout
- Log sidebar: always visible on desktop (≥768px), toggleable on mobile
- SCAN_TARGETS, SCAN_PROMPTS, CATS generalized with placeholder text

**inviteflow.html**
- Complete CSS + render function rewrite: light theme
- Tabs reduced from 7 → 5: Settings, Contacts, Email, Send, Track
  - Settings = former Events + Setup tabs
  - Track = former Tracker + Sync tabs
- Mobile bottom navigation bar (fixed, icon + label per tab)
- Desktop top tab bar (hidden on mobile)
- Naming: "VIP MAILER" → "InviteFlow", "VIP Researcher" → "ContactScout"
- Labels: "VIP Start/End" → "Guest Program Start/End"
- Default email template: removed event-specific boilerplate (dragon boat, attendance numbers, specific org references)
- Export filename: `vip-mailer-*` → `inviteflow-*`
- Schema identifier: `vip-mailer-profile-v1` → `inviteflow-profile-v1`
- `loadSchema()` redirects to tab 0 (Settings) instead of tab 1

**Docs**
- README.md: rewritten, generic, accurate tab count, correct filenames, Lenya Chan credit
- ROADMAP.md: created with v01/v02 history and near/medium/long-term backlog
- PROGRESS.md: created (this file)
- TASKS.md: created with current open items

---

## 2026-04-23 — v01 Initial build

- ContactScout: Claude API + web_search tool, verify/scan loop, export JSON/CSV
- InviteFlow: 7-tab UI, Gmail OAuth send, Google Sheets import/sync, RSVP form prefill, schema management
- GitHub Pages deployment via `.nojekyll`
- Google Apps Script integration removed (legacy)
- Git history scrubbed of real credentials
