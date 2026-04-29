---
name: lyt-moc-maintenance
description: 'Maintain MOCs in ATLAS/MOCs. Use when creating, auditing, splitting, or merging MOCs as DOTS scale.'
argument-hint: 'Domain or audit scope (single MOC or full vault)'
---

# MOC Maintenance

## When to use
- Orphan DOTS are detected
- Domain has 3 or more DOTS and no MOC
- Existing MOC is too thin, stale, or overgrown

## MOC criteria
- A MOC is a navigational hub, not a content dump.
- Each linked DOT should include a one-line description.
- MOC includes open questions and related MOCs.

## Lifecycle rules
- Healthy: 3-12 DOTS
- Thin: 1-2 DOTS, consider merge
- Overgrown: 15 or more DOTS, split into focused MOCs
- Stale: no meaningful updates in over 6 months
- Meta-MOC consideration: more than 15 MOCs total

## Procedure
1. List all MOCs in ATLAS/MOCs.
2. For each MOC, verify linked DOT existence and description quality.
3. Detect domains with 3 or more DOTS but no MOC.
4. For overgrown MOCs, split into two sub-theme MOCs and add a parent MOC.
5. For thin overlapping MOCs, merge into canonical MOC and archive secondary one.
6. Update affected DOT links after split or merge.
7. Mark stale MOCs with status: stale when appropriate.

## Quality checks
- No broken wikilinks in MOCs.
- Each MOC has clear scope and actionable open questions.
- Split and merge actions preserve discoverability.
