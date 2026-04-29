---
name: lyt-vault-router
description: 'Route notes and captures to the right LYT location. Use when user is unsure where content belongs across type, vault, and effort heat.'
argument-hint: 'Content to route'
---

# Vault Router

## When to use
- User asks where a note should go
- Mixed captures need splitting
- Work versus personal placement is unclear

## Routing sequence
1. Determine content type:
- concept
- effort
- person
- task
- reference
- idea
2. Determine vault scope:
- work
- personal
- both (canonical plus reference note)
3. If type is effort, assign heat level:
- ON for active now
- SIMMERING for near-term but not active
- ONGOING for recurring responsibilities
- SLEEPING for paused or complete

## Type to location map
- concept -> ATLAS/DOTS
- person -> ATLAS/MAPS/People
- meeting -> CALENDAR/NOTES
- task -> CALENDAR/to-do
- active project -> EFFORTS/ON
- recurring responsibility -> EFFORTS/ONGOING
- incubating idea -> EFFORTS/SIMMERING
- paused or finished -> EFFORTS/SLEEPING
- unprocessed capture -> +/Inbox.base
- source material -> sources

## Ambiguous handling
- If capture spans multiple types, split into distinct notes.
- If uncertain between concept and effort, ask: is there action now or understanding to retain?
- If ON count already exceeds 5, recommend SIMMERING unless replacing an ON effort.

## Quality checks
- Routing is explicit and explainable.
- Cross-vault duplication is minimized.
- Every routed item is linked to relevant existing notes.
