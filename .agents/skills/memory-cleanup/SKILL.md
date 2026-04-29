---
name: memory-cleanup
description: "Agent audits, consolidates, and backfills MEMORY.md. Removes outdated entries, merges duplicates, audits tags, archives orphans. Periodic maintenance. Triggers on 'cleanup memory', 'audit memory', 'learning maintenance'. Keywords: cleanup, maintenance, consolidation, archive, deduplication."
model: "Claude Haiku (Copilot)"
user-invocable: true
keywords:
  - cleanup memory
  - audit memory
  - learning maintenance
  - memory cleanup
  - consolidate learning
---

# Memory: Cleanup

## Purpose

Agent runs **periodic maintenance** on `./docs/memories/MEMORY.md`: removes outdated entries, consolidates duplicates, backfills metadata on quick captures, and archives orphans. Keeps knowledge base fresh and searchable.

## When Invoked

Triggered when:
- User says "cleanup memory", "audit memory", "learning maintenance", "consolidate learning", "memory cleanup"
- Or user types `/memory-cleanup` manually
- Periodically (when entries accumulate, or ≥20 entries, or monthly)

## What the Agent Does

### 1. Audit Current MEMORY.md

Agent reads `./docs/memories/MEMORY.md` and evaluates each entry:
- **Is this outdated?** (Now in official docs, false alarm, deprecated API)
- **Is this relevant?** (Active projects, or archived/renamed)
- **Is this vague?** (No tags, no projects, hard to find)
- **Is this a duplicate?** (Same gotcha mentioned elsewhere)

### 2. Remove Outdated Entries

For outdated entries:
- Agent **deletes** or moves to `## ARCHIVE (Outdated)` section at file end
- Agent records reason: _Reason: Now in official docs (2026-04)_

### 3. Consolidate Duplicates

Agent identifies duplicate or overlapping entries:
- Same API limitation described twice → merge into one entry
- Related workarounds → consolidate with cross-reference
- Agent preserves best explanation and adds user prompt if merge loses context

### 4. Audit Tags & Projects

For each entry, agent:
- Verifies **tags are from taxonomy** (see [MEMORY-FORMAT.md](../memory-shared/MEMORY-FORMAT.md))
- Checks **tags are consistent** (spelling, capitalization)
- Verifies **projects still exist** (not archived or renamed)
- **Adds missing tags** for entries that lack metadata

### 5. Backfill Metadata on Quick Entries

Agent finds bare one-liners (no tags/projects/date) and upgrades to full format:
```markdown
- [API]: [One-liner]
```
→
```markdown
- [API]: [One-liner]
  - **Tags**: `area`, `type`, `difficulty`
  - **Related projects**: `project-slug`
  - **Learned**: YYYY-MM-DD (inferred from context or current date)
```

### 6. Search for Orphans

Agent identifies entries that are:
- Too vague to find later (no tags, no searchable keywords)
- Never referenced (low signal, low utility)

Agent **marks for deletion** or prompts user to clarify.

### 7. Reorganize as Needed

Agent:
- Groups related entries (e.g., all Dataview learnings together)
- Ensures section headers are consistent
- Removes empty sections
- Creates `## ARCHIVE (Outdated / Not Relevant)` section if removed entries exist

### 8. Save & Report

- Save updated `./docs/memories/MEMORY.md`
- Report cleanup summary:
  - Entries removed: N
  - Entries consolidated: N
  - Metadata backfilled: N
  - Archived: N
  - Final count: N entries

Example: "Cleanup complete: Removed 2 outdated, consolidated 3 duplicates, backfilled 5 quick entries. docs/memories/MEMORY.md now has 18 active entries."

## Example: Cleanup Report

**Before cleanup:**
- 28 entries total
- 3 duplicate entries (same gotcha, different wording)
- 5 quick one-liners with no metadata
- 2 outdated entries (now in official docs)
- Inconsistent tagging

**After cleanup:**
- 18 active entries (consolidated, cleaned)
- All entries have full metadata
- Tags consistent and from taxonomy
- 2 outdated entries moved to ARCHIVE
- Duplicate consolidation: 3 entries → 1 (reduced 2)

**Agent report:**
> Cleanup complete:
> - Removed: 2 outdated
> - Consolidated: 3 duplicates (3 entries → 1)
> - Backfilled metadata: 5 quick entries
> - Archived: 2 entries
> - Final count: 18 active entries
>
> Next cleanup recommended in 2–4 weeks (when next 10–15 entries accumulate).
- [ ] Projects checked (still active)?
- [ ] Quick entries backfilled with metadata?
- [ ] Orphans identified and archived or deleted?
- [ ] Archive section created (if needed)?
- [ ] Saved/committed?

---

## Cadence

**Recommended:** When entries feel cluttered or you've accumulated 20+ quick captures

**Alternative:** Every 2–4 weeks, or set a calendar reminder for consistency

**Not:** Specific date-based (run it whenever you need a refresh)

---

## Auto-Invocation

Triggered when user types:
- "cleanup memory"
- "audit memory"
- "learning maintenance"
- "memory cleanup"
- "consolidate learning"

Or user types `/memory-cleanup` manually.

---

## Related Skills

- [memory-quick-capture](../memory-quick-capture/SKILL.md) — Rapid one-liner capture (≤1 min)
- [memory-session-capture](../memory-session-capture/SKILL.md) — Complete entry with metadata (5 min)

**Shared format:** [MEMORY-FORMAT.md](../memory-shared/MEMORY-FORMAT.md)
