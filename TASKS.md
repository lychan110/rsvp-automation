# InviteFlow Suite — Open Tasks
**Lenya Chan** · Updated 2026-04-24

---

## Immediate / Bug fixes

- [ ] Verify ContactScout mobile log toggle works correctly (toggle button visibility via CSS `display:none !important` vs JS)
- [ ] Test InviteFlow bottom nav on actual iOS Safari (safe-area-inset-bottom rendering)
- [ ] Confirm `height:100dvh` support across target browsers (fallback: `100vh`)
- [ ] CLAUDE.md: update tab list from 7 to 5, update `S.event` new field names for guest program timing

---

## UX Polish

- [ ] ContactScout: replace `prompt()` dialogs in manual-add with a proper modal
- [ ] InviteFlow Contacts tab: add search/filter input for large invitee lists
- [ ] InviteFlow Contacts tab: column header click to sort by name/status
- [ ] InviteFlow Send tab: per-invitee preview before bulk send
- [ ] InviteFlow Settings: collapse/expand sections (accordion) on mobile to reduce scroll length
- [ ] Add loading spinner during sheet import / RSVP sync

---

## Features

- [ ] Password gate for ContactScout (PIN stored in sessionStorage, blocks render until entered)
- [ ] Invitee bulk actions: select multiple → mark sent/skipped/reset
- [ ] RSVP link generator without Google Forms (append invitee name/email as query params to any URL)
- [ ] CSV import: column-mapping UI (drag headers to fields) instead of relying on exact names
- [ ] Follow-up email mode: filter to "sent but no RSVP" and send a reminder template

---

## Docs

- [ ] Add screenshots to README (landing page, ContactScout verify tab, InviteFlow send tab)
- [ ] Document Google OAuth setup with step-by-step screenshots
- [ ] Add a CONTRIBUTING.md if the repo goes public
