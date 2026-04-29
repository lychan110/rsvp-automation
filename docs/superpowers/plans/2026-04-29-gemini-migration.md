# ContactScout: Gemini Migration Plan
Author: Lenya Chan
Date: 2026-04-29

## Context

ContactScout currently calls the Anthropic Claude API (`claude-sonnet-4-6`) with the
`web_search_20250305` tool directly from the browser. This costs money. The app is for
personal/non-profit use, so we are switching to Google Gemini 2.5 Flash with Search
Grounding, which is free forever with no credit card required (Google AI Studio free tier).

---

## Task 3: Migration Plan

### Chosen provider: Google Gemini 2.5 Flash + Google Search Grounding

- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}`
- Search: `tools: [{ "google_search": {} }]` (first-party Google Search grounding, built-in)
- Free tier: 15 RPM, 1000 RPD (no credit card)
- Browser-direct: API key in URL query param; no CORS proxy needed
- Keys from: https://aistudio.google.com/ → Get API key; format starts with `AIza`

### Constraint: JSON mode is incompatible with Search Grounding

`responseMimeType: "application/json"` cannot be combined with the `google_search` tool
(Google API returns 400). This is not a blocker because the current codebase already
uses the text-parse approach: system prompts instruct the model to output raw JSON,
and `extractJson()` strips any markdown fences. This same approach works with Gemini.

### Files changed

| File | Change |
|------|--------|
| `src/api.ts` | Replace `callClaude()` with `callGemini()` using Gemini REST endpoint |
| `src/constants.ts` | `MODEL_SCAN` and `MODEL_VERIFY` → `"gemini-2.5-flash"` |
| `src/components/ApiKeyModal.tsx` | Update key format validation (`AIza`), instructions, and link to AI Studio |
| `src/App.tsx` | Rename import (`callClaude` → `callGemini`); fix inter-call delay (700ms → 4500ms) |
| `src/contact-scout/CLAUDE.md` | Update API setup section |

### Rate limit fix (critical)

Gemini 2.5 Flash free tier: **15 RPM** = 1 request every 4 seconds.
Current verify loop delay: **700ms** — this will cause immediate 429s during bulk verify.
Fix: increase delay to **4500ms** (safe margin below 4000ms per call).

Impact: verifying 100 officials takes ~7.5 minutes. Acceptable for an infrequent batch operation.

### Gemini API request shape

```json
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}

{
  "system_instruction": { "parts": [{ "text": "<SCAN_SYS or VERIFY_SYS>" }] },
  "contents": [{ "role": "user", "parts": [{ "text": "<scan or verify prompt>" }] }],
  "tools": [{ "google_search": {} }]
}
```

Response path: `candidates[0].content.parts[0].text` → run through `extractJson()`.

Error handling:
- HTTP 400 with `"API key not valid"` → clear key, throw `"Invalid API key"`
- HTTP 429 → retry with 2s/4s/8s exponential backoff (same as current)
- `data.error` present → throw `data.error.message`

---

## Task 4: LLM Usage Critique

### Current LLM usage in ContactScout

Two operations use the LLM:
1. **Scan** — discover all current officials in a category (e.g., "all NC state senators")
2. **Verify** — re-check a known official's status and update their contact details

### Angle 1: Is the LLM essential?

**Scan:** Yes. There is no free structured API that returns "all current elected officials for
a given US state with their emails and schedulers" in a single call. Google Civic API is
deprecated. Ballotpedia has no free tier. OpenSecrets is read-only for contributions. The
LLM with web search is the only viable path to discovering officials without a paid data feed.

**Verify:** Partially. The "still in office" check genuinely requires live web search — LLM
training data is 6-18 months stale relative to election cycles. However, verifying email
addresses for officials whose status hasn't changed is of marginal value and wastes quota.

**Verdict:** LLM is essential for scan. Verify is useful post-election but expensive for
stable rosters. The `lastVerifiedAt` pattern (skip re-verify if checked < 30 days ago) would
cut verify quota usage by 80% in steady state.

### Angle 2: Is it effective?

**Strong:** Federal officials (Congress, state executive). Well-indexed, stable roles, clear
email patterns. Email inference (`emailPatterns.ts`) covers the majority of federal contacts
without any LLM call.

**Moderate:** State legislature. Large bodies (50+ seats) risk partial results if the LLM
response gets long. A 50-seat senate returned in one JSON object can hit max_tokens silently.

**Weak:** City councils. Local data is less indexed; hallucination risk is highest. Results
should be treated as starting-point candidates, not ground truth.

**Scheduler discovery:** The highest-value differentiator. No structured data source exists
for scheduler names/emails. LLM web search is the only practical source. This feature is
worth protecting even if other parts are simplified.

### Angle 3: Does the current architecture over-rely on LLM?

Yes, in one specific way: the scan prompt asks for official email AND scheduler email in a
single call. For large bodies (state senate/house), bundling scheduler lookup with basic
discovery overloads the response. The LLM may return partial scheduler info or truncate the
official list.

A two-pass approach would be more reliable:
- Pass 1 (scan): official name, title, district, category only
- Pass 2 (verify): contact details including scheduler

However, this doubles API calls per official and hits the 1000 RPD limit faster. The
current bundled approach is a deliberate trade-off: one call with some scheduler gaps vs.
two calls with better completeness. Given the RPD constraint, the bundled approach is
**correct for this use case**. Do not change it.

### Angle 4: What email inference already eliminates

`emailPatterns.ts` infers correct emails for:
- All US House members (`firstname.lastname@mail.house.gov`)
- All US Senators (`firstname.lastname@lastname.senate.gov`)
- NC General Assembly (`firstname.lastname@ncleg.gov`)

These cover the most frequently contacted officials. For these categories, the LLM's email
search is redundant and the inferred address is more reliable. The LLM's value for these
categories is exclusively for scheduler discovery.

Opportunity: expand `emailPatterns.ts` to additional state legislatures with known patterns.
This reduces LLM dependency without degrading quality.

### Angle 5: Rate limit sustainability

With 1000 RPD on Gemini free tier:
- 7 scan targets = 7 calls (one per target)
- ~100 official verifications = 100 calls
- Total: 107 calls per full cycle

This fits in one day but leaves minimal buffer. In practice:
- Scans run once per election cycle (2x/year)
- Verifications run monthly or post-election
- Daily use is typically 0-5 verify calls (checking new or changed officials)

Verdict: 1000 RPD is sufficient for the actual usage pattern.

### Decisions

| Finding | Action |
|---------|--------|
| 700ms delay breaks at Gemini 15 RPM | Fix delay to 4500ms |
| Bundled scan+scheduler prompt is correct | Keep as-is |
| Email inference reduces LLM calls | Keep and note for future expansion |
| Verify wastes quota on stable officials | Note `lastVerifiedAt` as future improvement |
| City council results unreliable | Document in UI (low-confidence warning already exists via `confidence` field) |
| Key validation rejects Google keys | Fix in ApiKeyModal |

---

## What is NOT changing

- The scan prompt content and JSON schema
- The verify prompt content
- The `extractJson()` parser
- The `emailPatterns.ts` inference layer
- The two-pass scan → verify workflow
- The export schema contract with InviteFlow
- Local storage persistence
- The password gate
