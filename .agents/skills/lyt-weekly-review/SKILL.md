---
name: lyt-weekly-review
description: 'Run a weekly vault health review. Use when user asks for weekly review, Friday planning, or when inbox and effort drift need correction.'
argument-hint: 'Week identifier or review scope'
---

# Weekly Review

## When to use
- Friday default cadence
- Monday fallback if Friday missed
- Immediate trigger when +/Inbox.base has more than 5 items

## Procedure
1. List notes modified since last weekly log.
2. Review EFFORTS heat levels:
- ON with no activity -> cooling candidate
- SIMMERING repeatedly referenced -> promotion candidate
- completed or stalled ON -> move to SLEEPING
- ON count over 5 -> propose 1-2 to cool
3. Review ATLAS/DOTS:
- new DOTS missing MOC links
- referenced but missing DOT stubs
- draft DOTS untouched for over 2 weeks
4. Review CALENDAR/NOTES for unprocessed meeting notes and decisions.
5. Run MOC health check for thin MOCs and missing domain MOCs.
6. Process +/Inbox.base or invoke lyt-inbox-process.
7. Check orphan notes and add backlinks where appropriate.
8. Refresh EFFORTS/Dashboard.md.
9. Optional cross-vault alignment for transferable concepts.
10. Write CALENDAR/LOGS/weekly/YYYY-WNN.md with movement summary, patterns, and next-week intentions.
11. Update _index.md for all newly created notes.

## Quality checks
- Review output contains concrete decisions, not generic recap.
- Heat-level changes are applied to filesystem organization and dashboard.
- Outstanding flags are captured as actionable next steps.

Related skills: lyt-moc-maintenance, lyt-inbox-process.
