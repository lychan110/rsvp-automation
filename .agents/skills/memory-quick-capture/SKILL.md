---
name: memory-quick-capture
description: "Agent extracts and saves one-liner learnings from session context. Rapid capture with zero friction. Triggers on 'save learning', 'capture learning', or 'quick learning'. Keywords: quick capture, one-liner, discovery, learning."
model: "Claude Haiku (Copilot)"
user-invocable: true
keywords:
  - save learning
  - capture learning
  - quick learning
  - fast capture
  - discovery
---

# Memory: Quick Capture

## Purpose

Agent automatically extracts non-obvious discoveries from session context and saves as **one-liner entries** with zero user friction. Metadata backfilled later during cleanup.

## When Invoked

Triggered when:
- User says "save learning", "capture learning", "quick learning", or "save discovery" during a session
- Or user types `/memory-quick-capture` manually
- Anytime user discovers something non-obvious mid-session (not waiting for session end)

## What the Agent Does

### 1. Analyze Session Context

Agent reads session transcript/work history and asks:
- Did the user discover something **non-obvious** (took >5 min to figure out)?
- Is it a **syntax trap, API limitation, workaround, or pattern**?
- Is it **not already documented** in official docs?
- Is it **generalizable** (not a one-off project-specific hack)?

### 2. Extract Quick Learnings

If ≥1 discovery found, extract **1–2 key insights** (less is more).

For each:
- Identify the **API/area** (e.g., "Dataview JS", "Templater", "Python decorators")
- Write as **one concise sentence** (e.g., ".map().flat() not supported; use forEach loop instead")
- Include **code snippet** if the fix is non-obvious

### 3. Organize by Section

Read current `./docs/memories/MEMORY.md`. Find or create section for the API/area:
```markdown
## [API/Plugin Name]

- [One-liner with code pattern if needed]
```

### 4. Add Entries

Insert new one-liners into appropriate section. **Do NOT add metadata** (will backfill later).

### 5. Save & Report

- Save `./docs/memories/MEMORY.md`
- Report what was added (e.g., "Added 2 quick learnings: Dataview `.flat()` pattern, Templater quote handling")
- Suggest next step: `/memory-session-capture` to add full metadata now, or `/memory-cleanup` to backfill later

## Criteria: What Counts as a Learning

✅ **Include:**
- API limitation or unexpected behavior (e.g., "Dataview `.map()` returns incompatible type")
- Syntax trap (e.g., "apostrophes in single-quoted strings break JS")
- Non-obvious workaround (e.g., "use `forEach` instead of `.flat()`")
- Performance gotcha (e.g., "N+1 query pattern in Dataview")
- Pattern discovered through trial-and-error

❌ **Exclude:**
- Already documented in official API docs
- Obvious fixes or common knowledge
- One-off project-specific implementation details
- Problems with clear error messages
- Standard library features

## Example Output

**Session context:** User debugged a Templater template error for 20 minutes, discovered that single quotes with apostrophes break parsing. Also fixed a Dataview query using forEach instead of map().flat().

**Agent extracts and writes:**
```markdown
## Templater

- Single-quoted strings with apostrophes break JS parsing; use double quotes

## Dataview JS

- .map().flat() not supported on API results; use forEach loop instead
```

**Agent reports:**
> Added 2 quick learnings to `./docs/memories/MEMORY.md`:
> - Templater: quote handling
> - Dataview JS: loop pattern
>
> Next: Run `/memory-session-capture` to add metadata now, or `/memory-cleanup` during your next maintenance pass.

## Auto-Invocation

Triggered when user types:
- "end session"
- "close session"
- "save learning"
- "quick learning"

Or user types `/memory-quick-capture` manually.

**Related:** See [MEMORY-FORMAT.md](../memory-shared/MEMORY-FORMAT.md) for full entry format, tags, and examples.
