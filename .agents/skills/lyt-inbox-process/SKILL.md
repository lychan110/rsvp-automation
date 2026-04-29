---
name: lyt-inbox-process
description: 'Process captures from +/Inbox.base into LYT destinations. Use when user asks to clear inbox, triage captures, or when inbox exceeds threshold.'
argument-hint: 'Inbox scope (all items, top N, or specific item)'
---

# Inbox Process

## When to use
- User says process inbox, clear inbox, or triage captures
- Weekly review finds +/Inbox.base has more than 5 items

## Procedure
1. For each inbox item, classify type:
- concept
- meeting note
- task or action
- idea
- reference
- person insight
2. Route by type:
- concept -> ATLAS/DOTS
- meeting note -> CALENDAR/NOTES, then extract decisions and people context
- task -> CALENDAR/to-do
- idea -> EFFORTS/SIMMERING or existing effort
- reference -> ATLAS/DOTS stub or related effort
- person insight -> ATLAS/MAPS/People/[name].md
3. Resolve vault scope before writing:
- personal vault for transferable concepts and personal context
- work vault for company-specific content
- for both, keep one canonical note and add a reference note in the other vault
4. Split ambiguous mixed captures into multiple notes (for example concept plus task).
5. Add frontmatter fields: title, type, tags, date, status.
6. Add wikilinks to related notes and MOCs.
7. Remove item from +/Inbox.base after successful routing.
8. Update _index.md for all new notes.

## Decision points
- If type is unclear, park it in EFFORTS/SIMMERING with an explicit uncertainty note.
- If content contains sensitive company details, keep it in work vault only.

## Quality checks
- Inbox shrinks with each processed item.
- No full-content duplication across vaults.
- Routing decisions are traceable and linked.
