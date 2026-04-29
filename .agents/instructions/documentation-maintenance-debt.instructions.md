---
name: Low-Maintenance Documentation
description: "Apply when agents create or update documentation. For evolving docs (README, indexes, overviews), use change-tolerant language and avoid details that drift. Keep exact details only in snapshot, history, and runbook docs."
---

# Low-Maintenance Documentation

## Rule

Classify the document first, then write to the document's intent.

### Document Types

- Evolving docs: README, indexes, overviews, structure summaries.
Use durable wording that survives growth and reorganization.

- Snapshot docs: architecture snapshots, migration/history/changelog, runbooks.
Use precise details when operationally necessary.

### For Evolving Docs

- Avoid brittle specifics: counts, exhaustive inventories, and "... (N more)" patterns.
- Prefer categories and examples over full enumeration.
- Prefer stable references over duplicated detail. Link to the canonical source instead of copying long lists.
- Avoid time-sensitive phrasing unless a date is required.
- Keep setup and command details centralized in one canonical guide.

### Quick Check Before Save

If one item is added, renamed, or moved, would this section need manual edits?
If yes, rewrite to category-level wording or link to the canonical source.

### Why

- Lower maintenance overhead as content grows.
- Less drift between docs and implementation.
- Better readability focused on intent, not volatile detail.
