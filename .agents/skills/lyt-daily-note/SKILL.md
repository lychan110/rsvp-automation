---
name: lyt-daily-note
description: 'Generate today\'s daily log in CALENDAR/LOGS/daily. Use when starting the day, planning work, or carrying tasks forward from yesterday.'
argument-hint: 'Date or planning context (optional)'
---

# Daily Note

## When to use
- Start-of-day planning
- Midday reset when priorities drift
- End-of-day setup for tomorrow

## Procedure
1. Read yesterday's daily note from CALENDAR/LOGS/daily.
2. Read the current weekly log in CALENDAR/LOGS/weekly.
3. Read EFFORTS/Dashboard.md for current ON and ONGOING status.
4. Check CALENDAR/to-do for open tasks.
5. Check calendar events if connected through MCP.
6. Count items in +/Inbox.base.
If count is greater than 5, add a warning in the daily note.
7. Surface one effort from EFFORTS/SIMMERING that has not appeared recently.
8. Generate CALENDAR/LOGS/daily/YYYY-MM-DD.md with:
- key priorities
- meeting prep
- carried-over items
- open questions from active efforts
- inbox warning (if triggered)
- one simmering item to keep in peripheral awareness
9. Update _index.md with a one-line entry for the new daily note.

Suggested follow-up: run lyt-inbox-process when inbox threshold is exceeded.

## Quality checks
- Priorities map to active efforts, not random tasks.
- Inbox warning appears only when threshold is exceeded.
- Simmering item is lightweight and non-blocking.
- Daily note path and date format are valid.
