# InviteFlow Suite — Roadmap
**Lenya Chan** · Updated 2026-04-24

---

## Completed

### v01 — Initial build
- ContactScout: Claude API + web search, verify/scan contacts, export JSON/CSV
- InviteFlow: Gmail OAuth send, Google Sheets import/sync, RSVP form prefill, 7-tab UI
- GitHub Pages deployment (static HTML, no build step)

### v02 — Redesign (2026-04-24)
- Full light theme replacing dark IDE aesthetic
- Generic naming — removed all owner-specific terminology (event/org/category names)
- Mobile-first adaptive layout: works on 375px phones without horizontal scroll
- Bottom navigation bar on mobile; top tab bar on desktop
- InviteFlow simplified from 7 tabs → 5 (Settings, Contacts, Email, Send, Track)
- Settings tab combines former Events + Setup
- Track tab combines former Tracker + Sync
- New generic email template (removed event-specific boilerplate)
- Fraunces + Outfit typography replacing monospace theme
- Updated all docs and README

---

## Near-term

- [ ] Password gate for ContactScout (lightweight client-side PIN, for owner-only access)
- [ ] Invitee search/filter in the Contacts tab
- [ ] Bulk status edit (mark selected as skipped/sent)
- [ ] Email preview in Send tab before bulk send
- [ ] RSVP link generation without Google Forms (custom URL builder)
- [ ] CSV column mapping UI (currently relies on standard header names)

---

## Medium-term

- [ ] Multiple email templates per saved config (A/B variants, follow-up templates)
- [ ] Send scheduling (queue with delay between emails, time-of-day targeting)
- [ ] Attachment support in Gmail send
- [ ] Contact deduplication tool in ContactScout
- [ ] Export: direct Google Sheets push from ContactScout (currently JSON only)
- [ ] Undo/history for invitee list edits

---

## Long-term / Exploratory

- [ ] Multi-event dashboard (switch between event profiles without reload)
- [ ] Follow-up email flow (auto-detect no-response and queue reminder)
- [ ] Read-only RSVP status page (public URL per event)
- [ ] PWA / installable app (offline support via service worker)
- [ ] Claude AI assist for email copy (rewrite/personalize body text per invitee)
