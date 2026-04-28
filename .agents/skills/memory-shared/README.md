# Memory Skills: Shared Resources

This folder contains shared documentation and resources for the memory-* skill family.

## Included Files

- **MEMORY-FORMAT.md** — Shared entry format, tag taxonomy, and MEMORY.md locations used by all three skills

## Skills in This Family

1. **memory-quick-capture** — ≤1 min rapid one-liner capture
2. **memory-session-capture** — 5 min full metadata + dedup
3. **memory-cleanup** — Periodic maintenance & consolidation

## How They Work Together

```
Quick discovery   →  /memory-quick-capture (one-liner)
                        ↓ (within same session or later)
Full session recap →  /memory-session-capture (with metadata)
                        ↓ (accumulated entries)
Periodic cleanup   →  /memory-cleanup (consolidate, backfill, archive)
```

## Using MEMORY.md

Each skill reads/writes to the project-level MEMORY.md:

`./docs/memories/MEMORY.md`

## Tag Taxonomy

See [MEMORY-FORMAT.md](./MEMORY-FORMAT.md) for the curated taxonomy:
- By area (dataview, templater, python, etc.)
- By type (gotcha, syntax-trap, workaround, performance, pattern)
- By difficulty (tricky, subtle, easy)

Update MEMORY-FORMAT.md if taxonomy changes.

## Modifying the Format

All three skills reference [MEMORY-FORMAT.md](./MEMORY-FORMAT.md). If you need to change:
- Entry format
- Tag taxonomy
- MEMORY.md locations
- Search/filter examples

Edit **MEMORY-FORMAT.md** and all skills automatically reference the updated version.
