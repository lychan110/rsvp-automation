# Current UX Tasks

Author: Lenya Chan
Updated: 2026-04-24

---

## In Progress

None — v02 implementation just completed.

---

## Next Up (P1)

### 1. Add "Test Google Connection" button in Setup

When a user enters a Client ID, they have no way to know if it works until they attempt a
real action (send or import). A failed send is the worst time to discover a misconfiguration.

**Approach:** After Client ID is pasted, show a "Test connection" button. Clicking it calls
`getGoogleToken('spreadsheets')` and then makes a minimal Sheets API call (list the user's
spreadsheets). If it succeeds, show "✓ Connection verified". If it fails, show the specific
error with a suggested fix (e.g., "invalid_client → check that your authorized origins
include this page's URL").

**Files:** `inviteflow_v02.html`, `getGoogleToken()` section, `renderSetup()`.

---

### 2. Map GSI errors to plain-language messages

Raw error codes from Google Identity Services appear in the activity log without context.
Common codes and their plain-language fixes:

| GSI error | Plain-language explanation |
|-----------|---------------------------|
| `popup_closed_by_user` | You closed the Google sign-in popup. Click the button again. |
| `access_denied` | You did not grant permission. Try again and click "Allow". |
| `invalid_client` | The Client ID is wrong or your page URL is not in the authorized origins list. |
| `popup_blocked_by_browser` | Your browser blocked the popup. Allow popups for this site, then try again. |

**Approach:** Wrap `getGoogleToken()` catch blocks with a lookup map. Append the plain-language
message to the log entry.

**Files:** `inviteflow_v02.html`, `getGoogleToken()`.

---

### 3. Handle token expiry before bulk send

Tokens from Google Identity Services expire after ~1 hour. If a batch send starts and the
token expires mid-batch, sends fail silently. The user sees "failed: Unauthorized" with no
explanation.

**Approach:** In `sendBulkEmails()`, check `_tokens['gmail.send']?.expires` against
`Date.now()` before starting the loop. If the token is expired or within 5 minutes of
expiring, call `getGoogleToken('gmail.send')` first (which triggers re-auth). Also add a
note in the Send tab UI showing when the current token expires.

**Files:** `inviteflow_v02.html`, `sendBulkEmails()`, `renderSend()`.

---

### 4. ContactScout: Jurisdiction settings panel

The [YOUR STATE], [YOUR COUNTIES], and [CITY N] placeholders in `SCAN_TARGETS` and
`SCAN_PROMPTS` require editing the HTML source. This is impossible for non-tech users and
inconvenient even for power users.

**Approach:** Add a "Jurisdiction" settings section in a new Settings modal or sidebar panel.
Store jurisdiction values (state name, county names, city names) in localStorage under a new
key `contactscout_jurisdiction`. At startup, replace placeholder strings in SCAN_PROMPTS with
values from localStorage. Provide a form UI to configure state, counties (comma-separated),
and up to 3 cities.

**Files:** `contactscout_v02.html`, new Settings modal, SCAN_PROMPTS generation.

---

## Backlog (P2/P3)

- [ ] Mobile-responsive layouts (stat card grids overflow on screens < 480px).
- [ ] Retry failed sends: after bulk send, show a "Retry X failed" button that re-runs only
      the failed recipients.
- [ ] Email preview in Tracker: for each sent invitee, show a preview of the email they received.
- [ ] InviteFlow: CC/BCC field support in bulk Gmail send.
- [ ] ContactScout: smarter rate-limit backoff for verify batch (currently fixed 700ms between
      calls regardless of API response headers).
- [ ] Browser notification on bulk send completion (Notifications API, requires permission).
- [ ] Multi-event mode: allow switching between multiple active InviteFlow configs without
      losing invitee data.
