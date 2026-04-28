# Invite Automation Suite — UX Improvement Roadmap

Author: Lenya Chan
Created: 2026-04-24

---

## Why This Exists

The suite started as a personal tool and grew complex without a first-run experience or
onboarding path. Even the author found it unclear where to start. This roadmap tracks the
work needed to make the workflow clear enough that a person who only knows Google Docs and
Sheets can complete an invite campaign without reading the README.

---

## The Core Problem

Four blockers prevent a new user from getting anything done:

1. The app opens on a "Events" tab that shows schema/config management — an alien concept
   for someone who just wants to send invitations.
2. Google OAuth setup requires creating a Google Cloud project, enabling two APIs, configuring
   an OAuth consent screen, and generating credentials — with no step-by-step guide in the app.
3. Tab order (Events → Setup → Invitees → Compose → Send → Tracker → Sync) doesn't match
   the actual workflow (Setup → Invitees → Compose → Send → Track → Sync).
4. Empty states are passive ("No invitees yet") rather than actionable guides.

---

## User Personas

**Power user** — comfortable with APIs, GCP, OAuth. Can get going in 15 minutes. Current
friction: tab ordering doesn't match workflow, "Events" tab name is misleading.

**Semi-tech user** — reads READMEs, edits config files, not a developer. Understands what
OAuth is conceptually but has never set up a GCP project. Current friction: OAuth setup
requires undocumented steps (consent screen, test users, exact authorized origins).

**Non-tech user** — knows how to open and edit Google Docs and Sheets, nothing more. Current
friction: everything past the landing page. No onboarding, no plain-language explanations,
no workflow guidance.

---

## Priority Groups

### P0 — First-Run Blockers (all users hit these)

- [x] Tab order does not match workflow — fixed in v02
- [x] "Events" tab name is misleading — renamed to "Configs" in v02
- [x] No onboarding or welcome state — welcome card added in v02
- [x] Google OAuth setup is 3 lines of jargon — full 5-step guide added in v02
- [x] Invitees empty state is passive — actionable buttons added in v02
- [x] Send tab no-OAuth message is cryptic — plain-language guide added in v02
- [x] ContactScout shows no guidance when API key is missing — welcome card added in v02
- [x] ContactScout still has [YOUR STATE] placeholders with no notice — warning added in v02

### P1 — High Value (each fixes 30–60% of remaining friction)

- [ ] Google OAuth: Add "Test connection" button after Client ID is entered.
      Currently the user cannot verify their Client ID works until they try to send or import,
      which is the worst moment to discover a misconfiguration. A test button that calls a
      minimal API endpoint would confirm connectivity immediately.

- [ ] Google OAuth: Improve error messages from GSI.
      Errors like "popup_closed_by_user", "access_denied", and "invalid_client" appear raw
      in the activity log. Each should map to a plain-language explanation and a suggested fix.

- [ ] Google OAuth: Token re-auth flow.
      Tokens expire after ~1 hour. Currently, sending fails silently when a token expires mid-batch.
      The app should detect expiry before bulk send and prompt for re-auth gracefully.

- [ ] ContactScout: UI for configuring scan targets.
      The current [YOUR STATE] / [YOUR COUNTIES] / [CITY N] placeholders in SCAN_TARGETS and
      SCAN_PROMPTS require editing the HTML source. Non-tech and semi-tech users cannot do this.
      A jurisdiction settings panel stored in localStorage would solve this.

- [ ] Index page: Prerequisites checklist before entering the apps.
      "What you'll need: a Google account, 5 minutes to set up Google Cloud, your guest list
      as a spreadsheet or CSV." This sets expectations before anyone gets frustrated.

### P2 — Polish (meaningful but not blocking)

- [ ] Mobile / responsive layout. The apps are desktop-only; the stat card grids overflow on
      small screens.

- [ ] Error recovery: if a Gmail send fails partway through a batch, the log shows individual
      errors but there's no "retry failed" button.

- [ ] InviteFlow: Email preview in the Tracker tab so you can see what was sent to each invitee.

- [ ] ContactScout: "Verify all" with a smarter rate-limit backoff (currently fixed 700ms sleep).

### P3 — Future / Low Priority

- [ ] Multi-event support (currently one active config at a time in InviteFlow).
- [ ] Dark/light mode toggle.
- [ ] CC/BCC support in bulk Gmail send.
- [ ] Browser notification when a bulk send batch completes.
- [ ] Internationalization (non-English recipient support).

---

## Assumptions

- The GitHub Pages URL stays at `https://lychan110.github.io/automate-invite-emails/`.
- The app remains no-build-step, no-framework, vanilla JS.
- Google OAuth remains "external" app type in GCP (required for personal use outside a Workspace org).
- File iteration naming: `{name}_v{N:02d}.html`, with the latest promoted to `{name}.html` once stable.
