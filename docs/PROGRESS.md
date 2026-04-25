# UX Improvement Progress

Author: Lenya Chan
Updated: 2026-04-24

---

## v02 — 2026-04-24 — First UX Overhaul

### InviteFlow (inviteflow_v02.html)

- [x] Reordered tabs: Setup is now the first tab (was "Events" / schema management).
      New order: Setup → Invitees → Compose → Send → Tracker → Sync → Configs
- [x] Renamed "Events" tab to "Configs" (the function `renderEvents()` is unchanged internally).
- [x] Added welcome card at the top of Setup that shows until all three setup steps are done
      (Google connected, event name filled, invitees imported). Steps show as green checkmarks
      as the user completes them.
- [x] Rewrote Google OAuth section from 3 terse lines into a 5-step guide:
      Step 1 — Open Google Cloud Console (direct link)
      Step 2 — Create project and enable Gmail API + Google Sheets API
      Step 3 — Configure OAuth consent screen (External, add yourself as test user)
      Step 4 — Create OAuth 2.0 Client ID (Web application, add authorized origins)
      Step 5 — Paste Client ID into the app
      The section collapses to a compact confirmed state once the Client ID is entered.
- [x] Invitees tab empty state now shows actionable buttons (Import from Sheet, Upload CSV, Add
      manually) and a context-aware hint directing users to Setup if Google isn't connected yet.
- [x] Send tab no-OAuth state: replaced the small warning badge with a full explanation card
      ("Google account not connected") with a direct "Go to Setup" button and a note about
      the manual Gmail fallback.
- [x] Author credit "by Lenya Chan" added as subtitle in the welcome card.
- [x] `loadSchema()` now navigates to tab 0 (Setup) instead of tab 1 after loading a schema.
- [x] `render()` compose preview check updated from `S.tab===3` to `S.tab===2` after reorder.

### ContactScout (contactscout_v02.html)

- [x] Welcome banner added at the top of the page when no API key is set. Explains what
      ContactScout does, what the Claude API key is for, and links to console.anthropic.com.
- [x] Customization notice added in the Scan tab: detects if any SCAN_PROMPTS still contain
      "[YOUR STATE]" and shows a yellow notice box explaining that the scan targets need to be
      updated in the HTML source for the user's state/city. Includes the exact location in the
      file and what to change.
- [x] API key modal description updated: added link to console.anthropic.com and clarified
      that free-tier keys work.

### Index (index.html)

- [x] Links updated to point to inviteflow_v02.html and contactscout_v02.html.
- [x] "What you'll need" prerequisites section added below the flow diagram.

### CLAUDE.md

- [x] Author credit (Lenya Chan) added.
- [x] Version naming convention documented.
- [x] UX conventions section added.
- [x] Reference to docs/ planning files added.

---

## v01 — Original

- Initial implementation of two-app suite.
- InviteFlow: 7-tab UI, Google Sheets + Gmail OAuth2 integration, schema management.
- ContactScout: Claude API + web search for elected official discovery and verification.
- No onboarding, no first-run experience, no step-by-step Google setup guide.
