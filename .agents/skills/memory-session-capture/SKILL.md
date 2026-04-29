---
name: memory-session-capture
description: "Agent analyzes session, extracts key learnings with full metadata, checks for duplicates, and saves to MEMORY.md. Thoughtful capture with deduplication. Triggers on 'end session', 'close session', or 'learn from session'. Keywords: session recap, end session, learning, metadata, deduplication."
model: "Claude Haiku (Copilot)"
user-invocable: true
keywords:
  - end session
  - close session
  - learn from session
  - session recap
  - session learning
---

# Memory: Session Capture

## Purpose

Agent analyzes session transcript, extracts **1–2 key learnings** with complete metadata (tags, projects, date), and checks for duplicates before saving. Creates searchable, maintainable knowledge base entries with zero user overhead.

## When Invoked

Triggered when:
- User says "end session", "close session", "learn from session", or "session recap"
- Or user types `/memory-session-capture` manually
- After completing substantial debugging/development/automation work, ready to wrap up

## What the Agent Does

### 1. Analyze Session Transcript

Agent reads full session work and identifies:
- **Non-obvious API limitations** (e.g., "Dataview `.map()` doesn't work on results")
- **Undocumented workarounds** (e.g., "use `forEach` loop instead")
- **Patterns learned through trial-and-error** (e.g., "week-scoped filtering requires ISO date extraction")
- **Syntax traps** (e.g., "apostrophes in single-quoted strings break parsing")
- **Performance gotchas** (e.g., "N+1 queries in loops")

Extract **1–2 key learnings** (less is more; avoid overlapping insights).

### 2. Read MEMORY.md

Agent reads current `./docs/memories/MEMORY.md` to understand:
- Existing entries and sections
- Tagging conventions
- Related projects

### 3. Check for Duplicates

For each learning, agent searches MEMORY.md for:
- **API/plugin names** mentioned in the learning
- **Similar error types** or scenarios
- **Related keywords** (e.g., "Dataview", "loop", "forEach")

**If similar entry exists:**
- Agent decides: merge or keep separate?
- **Merge if:** Same underlying gotcha, just additional context
- **Separate if:** Different APIs, different scenarios, or distinct patterns
- Agent reports the decision to user

### 4. Add with Full Metadata

For each learning, write in format from [MEMORY-FORMAT.md](../memory-shared/MEMORY-FORMAT.md):
```markdown
- [API/Feature]: [One-sentence explanation]; code pattern if needed
  - **Tags**: `tag1`, `tag2`, `difficulty`
  - **Related projects**: `project-slug`
  - **Learned**: YYYY-MM-DD
```

**Agent chooses tags from taxonomy:**
- By area: `dataview`, `templater`, `python`, `javascript`, etc.
- By type: `gotcha`, `syntax-trap`, `workaround`, `performance`, `pattern`
- By difficulty: `tricky`, `subtle`, `easy`

### 5. Save & Report

- Save `./docs/memories/MEMORY.md`
- Report what was added (including dedup decisions)
- Example: "Added 1 learning (Dataview `.flat()` pattern, merged with existing loop note). 2 entries consolidated."

## Example: Agent Extraction

**Session context:** User spent 1.5 hours debugging Dataview JS code. Discovered two insights:
1. `.map().flat()` doesn't work on Dataview results; must use `forEach` loop instead
2. ISO week extraction from filenames requires regex pattern to filter date objects from Luxon

**Agent extracts, checks for duplicates, writes:**
```markdown
## Dataview JS

- Dataview JS: `.map().flat()` fails on API results; use `forEach` loop to collect items
  - **Tags**: `dataview`, `api-limitation`, `tricky`
  - **Related projects**: `obsidian-vault`
  - **Learned**: 2026-04-27

- ISO week extraction: Filter filename dates with `dv.luxon.DateTime.fromISO()` and regex to match ISO week format
  - **Tags**: `dataview`, `pattern`, `date-handling`
  - **Related projects**: `obsidian-vault`
  - **Learned**: 2026-04-27
```

**Agent reports:**
> Added 2 learnings to `./docs/memories/MEMORY.md`:
> - Dataview JS: `.flat()` API limitation (NEW)
> - Dataview JS: ISO week extraction pattern (NEW)
>
> Dedup check complete: no duplicates found.

---

## Auto-Invocation

Triggered when user types:
- "learn from session"
- "session recap"
- "session learning"
- "save discovery"
- "learning recap"

Or user types `/memory-session-capture` manually.

---

## Related Skills

- [memory-quick-capture](../memory-quick-capture/SKILL.md) — Rapid one-liner capture (≤1 min)
- [memory-cleanup](../memory-cleanup/SKILL.md) — Periodic maintenance & consolidation

**Shared format:** [MEMORY-FORMAT.md](../memory-shared/MEMORY-FORMAT.md)
