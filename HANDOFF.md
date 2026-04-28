# Handoff — ContactScout Tech Overhaul

**Date:** 2026-04-28
**Branch:** `claude/contactscout-tech-overhaul-QbbSS`
**PR:** https://github.com/lychan110/rsvp-automation/pull/26 (draft, open, clean merge)
**Commit:** `943bda9`
**Author:** Lenya Chan

---

## What was done this session

Full overhaul of ContactScout (`src/contact-scout/src/`) triggered by an exploration report on government contact discovery for Dragon Boat Festival / Asia Fest 2026. The report proposed deterministic scrapers; the session challenged that approach (CORS blocks direct fetches in a browser app) and instead delivered:

### 1. Extended data model (`types.ts`)
Four new fields on `CSOfficial`:
- `schedulerName: string` — name of the official's scheduler / chief-of-staff
- `schedulerEmail: string` — scheduler's email (highest-priority contact for event invitations)
- `appearanceFormUrl: string` — web form URL for offices that don't accept email requests
- `emailSource: 'scanned' | 'inferred' | 'manual'` — provenance tracking for the direct email

Two new type aliases: `EmailSource`, `ContactMethod`.

### 2. Deterministic email inference engine (`emailPatterns.ts` — new file)
- Federal House: `FirstName.LastName@mail.house.gov`
- Federal Senate: `FirstName.LastName@{surname}.senate.gov`
- NC state legislature: `FirstName.LastName@ncleg.gov`
- Handles diacritics via NFD decomposition
- `bestEmail(o)` helper: `schedulerEmail || directEmail || officeEmail || ''`
- `applyEmailInference()` batch-fills officials post-scan
- Inferred emails are marked `emailSource: 'inferred'` and shown with an INFERRED badge in the UI; they rank below scanned/scheduler in export priority

### 3. API layer improvements (`api.ts`, `constants.ts`)
- Model upgraded to `claude-sonnet-4-6`; model IDs in `MODEL_SCAN` / `MODEL_VERIFY` constants
- Exponential backoff on 429: 2s → 4s → 8s
- Robust JSON extraction with object-boundary fallback
- `max_tokens` raised to 2000
- `callClaude()` now takes `model` as a parameter (not hardcoded)

### 4. Prompt improvements (`constants.ts`, `utils.ts`)
- `SCAN_SYS` and `VERIFY_SYS` now ask Claude to find scheduler name, scheduler email, and appearance form URL for each official
- Every scan prompt appends a scheduler-discovery instruction
- Verify prompt sends existing scheduler data for confirmation/update

### 5. `AddOfficialModal.tsx` (new component)
- Replaces three chained `prompt()` browser dialogs with a proper form modal
- All fields including scheduler + form URL
- Live email inference preview updates as name/category is typed

### 6. UI updates
- **OfficialsTab**: new contact-method column (SCHED / DIRECT / INFERRED / OFFICE / FORM / NO EMAIL); email source badge; scheduler section + form URL in expanded row; "Infer Emails" button
- **DiscoverTab**: candidates show scheduler email in gold or inferred badge; scan card shows count with scheduler found
- **ExportTab**: contact-method breakdown table (scheduler / direct / inferred / office / form-only / no-contact counts); warning for inferred emails; CSV gains 4 new columns
- **Stats bar** (App.tsx): gold SCHEDULER dot counting officials with a known scheduler email

### 7. localStorage migration (`App.tsx`)
`normaliseOfficial()` fills new fields with safe defaults on load — existing data upgrades silently, no reset required.

---

## Current state

| Item | Status |
|------|--------|
| TypeScript build | Clean (0 errors) |
| Vite production build | Clean (190 kB JS, 7.6 kB CSS) |
| PR #26 | Draft, open, no CI checks configured for repo |
| Review comments | None |
| Merge conflicts | None (mergeable: clean) |

---

## Pending / next steps

1. **Mark PR ready for review** when Lenya is satisfied with the implementation and has tested manually per the PR test plan.

2. **Manual testing checklist** (from PR description):
   - Load with existing localStorage — verify no data loss, new fields default empty
   - Run a scan — confirm scheduler fields appear in candidate cards
   - Run "Infer Emails" on a list with federal officials — verify INFERRED badge and address pattern
   - Add official manually via modal — confirm inference preview updates live
   - Run verify — confirm scheduler fields update from Claude result
   - Export tab — confirm breakdown table matches Officials list
   - Download CSV — confirm new columns present
   - Trigger 429 (rapid scans) — confirm backoff delay logged

3. **CLAUDE.md update** (not yet done): document `emailPatterns.ts`, the new `CSOfficial` fields, updated `callClaude()` signature, and `MODEL_SCAN`/`MODEL_VERIFY` constants.

4. **`docs/TASKS.md`** — the P2 "smarter rate-limit backoff" item is now resolved; mark complete.

5. **Jurisdiction customization**: `App.tsx` `SCAN_PROMPTS` still contain `[YOUR STATE]`, `[YOUR COUNTIES]`, `[CITY 1/2/3]` placeholders that must be replaced before first real scan. The `needsCustomization()` guard detects them and shows a warning banner.

---

## File inventory (changed this session)

| File | Change |
|------|--------|
| `src/contact-scout/src/types.ts` | 4 new fields, 2 new types |
| `src/contact-scout/src/constants.ts` | Model constants, updated SCAN_SYS/VERIFY_SYS prompts |
| `src/contact-scout/src/emailPatterns.ts` | NEW — inference engine |
| `src/contact-scout/src/api.ts` | Backoff, model param, robust JSON extraction |
| `src/contact-scout/src/utils.ts` | bestEmail in export, scheduler in scan prompts |
| `src/contact-scout/src/App.tsx` | normaliseOfficial, inferMissing, AddOfficialModal wiring, stats bar |
| `src/contact-scout/src/components/AddOfficialModal.tsx` | NEW — replaces prompt() dialogs |
| `src/contact-scout/src/components/OfficialsTab.tsx` | Contact-method column, source badge, expanded scheduler row |
| `src/contact-scout/src/components/DiscoverTab.tsx` | Scheduler count, gold email in candidates |
| `src/contact-scout/src/components/ExportTab.tsx` | Breakdown table, inferred warning, CSV columns |
| `src/contact-scout/src/styles.css` | 6-col grid, mobile breakpoint fix |
