# Memory Knowledge Base Format

**Shared reference for all memory-* skills.**

## Entry Format (Full)

```markdown
- [API/Feature]: [One-sentence explanation]; code pattern if needed
  - **Tags**: `tag1`, `tag2`, `difficulty`
  - **Related projects**: `project-slug`, `another-project`
  - **Learned**: YYYY-MM-DD
```

## Entry Format (Quick)

```markdown
- [API]: [One-liner]
```

Backfill metadata during periodic cleanup (via `/memory-cleanup`).

## Tag Taxonomy (Curated)

**By area:**
- `dataview`, `templater`, `obsidian`, `python`, `javascript`, `css`, etc.

**By type:**
- `gotcha` — API limitation or unexpected behavior
- `syntax-trap` — Silent parser/compiler failure
- `workaround` — Non-obvious solution pattern
- `performance` — Speed or memory optimization
- `pattern` — Architecture or design pattern

**By difficulty:**
- `tricky` — Took >15 min to debug
- `subtle` — Not obvious from error message
- `easy` — Quick fix, but non-obvious

**Example:** `dataview`, `api-limitation`, `tricky`

## MEMORY.md Location

**Project-level:**
```
./docs/memories/MEMORY.md
+ ./.agents/AGENT.md (with project-specific maintenance guidelines)
```

## Filtering & Searching

Use tags to find relevant learnings:
- By project: `grep "Related projects.*obsidian-vault"`
- By area: `grep "Tags.*dataview"`
- By difficulty: `grep "tricky\|subtle"`
- Recent: `grep "2026-04"`

## Example Entry (Complete)

```markdown
## Dataview JS API

- Dataview JS: `.map().flat()` fails on API results; use `forEach` loop to collect items
  - **Tags**: `dataview`, `api-limitation`, `tricky`
  - **Related projects**: `obsidian-vault`
  - **Learned**: 2026-04-27
```

---

**This file is shared by all memory-* skills. Update here to change format, tags, or locations across all workflows.**

**Skills:** [memory-quick-capture](../memory-quick-capture/SKILL.md), [memory-session-capture](../memory-session-capture/SKILL.md), [memory-cleanup](../memory-cleanup/SKILL.md)
