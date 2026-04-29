---
name: lyt-quarterly-prune
description: 'Run deep quarterly vault maintenance. Use for archiving dormant efforts, pruning stale DOTS, auditing MOCs, and restoring index accuracy.'
argument-hint: 'Quarter/year or maintenance scope'
---

# Quarterly Prune

## When to use
- End of quarter (Mar, Jun, Sep, Dec)
- Weekly review flags scale thresholds:
- dormant SLEEPING efforts over 6 months
- DOTS count over 50
- MOCs count over 15

## Procedure
1. Audit EFFORTS/SLEEPING and move dormant efforts to EFFORTS/SLEEPING/archive/[year].
2. Add archival note to effort brief with date and reason.
3. Audit ATLAS/DOTS for stale drafts, orphans, and duplicates.
4. Promote, merge, link, or delete according to evidence and backlinks.
5. Audit MOC health using lyt-moc-maintenance lifecycle rules.
6. Perform effort heat audit:
- long-idle SIMMERING may move to SLEEPING
- inactive ON efforts move to SIMMERING or SLEEPING
7. Refresh EFFORTS/Dashboard.md to match current heat states.
8. Reconcile _index.md with existing files.
9. If both vaults are available, add cross-vault reference notes where useful.
10. Produce prune summary with counts and next-quarter flags.

## Quality checks
- No destructive deletion of potentially useful history without rationale.
- Heat-level changes are reflected in Dashboard and logs.
- Index entries match actual files after pruning.
