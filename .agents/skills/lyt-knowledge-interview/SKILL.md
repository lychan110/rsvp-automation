---
name: lyt-knowledge-interview
description: 'Interview the user to extract expertise into DOT notes in ATLAS/DOTS. Use for externalizing mental models, frameworks, and hard-won lessons.'
argument-hint: 'Domain or topic to capture'
---

# Knowledge Interview

## When to use
- User wants to capture what they know about a domain
- User asks to turn tacit knowledge into structured notes
- User wants to build DOTS and MOCs from experience

## Procedure
1. Ask for target domain and narrow scope.
2. Check existing ATLAS/DOTS and ATLAS/MOCs in that domain.
3. If a close DOT exists, extend it instead of creating a duplicate.
4. Ask probing questions one at a time about:
- core concepts and relationships
- mental models and frameworks
- pitfalls and common failure modes
- links to existing notes
5. Summarize each answer and ask for correction.
6. Create one DOT per distinct concept in ATLAS/DOTS.
7. Add wikilinks between related DOTS and efforts.
8. Apply MOC rules:
- create a MOC when a domain reaches 3 or more related DOTS and none exists
- do not create premature MOCs for 1-2 DOTS
- if MOC exceeds about 15 DOTS, suggest split
9. Handle multi-domain concepts with one canonical DOT linked from multiple MOCs.
10. Update _index.md for new notes.

## DOT template
```markdown
---
title: [Concept Name]
type: concept | mental-model | framework | reference
domain: [field]
tags: [#type/concept, #domain/[field]]
date: YYYY-MM-DD
status: draft
related: []
---

## What it is
## When I reach for this
## My mental model
## Pitfalls I've seen
## Connections
```

## MOC template
```markdown
---
title: [Domain Name]
type: moc
domain: [field]
tags: [#type/moc, #domain/[field]]
date: YYYY-MM-DD
status: active
---

## What this covers
[2-3 sentences describing the domain scope]

## DOTS in this domain
- [[concept-name]] - one-line description
- [[framework-name]] - one-line description

## Related MOCs
- [[adjacent-moc]]

## Open questions
[Known gaps to capture later]
```

## Quality checks
- No duplicate DOTS for same concept.
- Each new DOT is linked to a MOC or has explicit pending reason.
- Content reflects user phrasing, not generic textbook prose.
