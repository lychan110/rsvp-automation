// Templater Template Examples
// These can be used in markdown files with Templater plugin enabled

// ============================================
// EXAMPLE 1: Daily Note Template
// ============================================
/*
# Daily Note - <%= tp.date.now("YYYY-MM-DD") %>

## Morning

- Time: <%= tp.date.now("HH:mm") %>
- Mood: 
- Focus areas:

## Tasks

<%* 
const dv = this.app.plugins.plugins.dataview?.api;
if (dv) {
  const tasks = await dv.queryAsync(`
    TABLE file.link FROM "TodoList" WHERE !completed LIMIT 5
  `);
  if (tasks.values.length > 0) { %>
### Today's Tasks
<%* for (const task of tasks.values) { %>
- [ ] <%* dv.paragraph(task[0]) %>
<%* }
}
-%>

## Notes

## Evening Reflection

- What went well:
- What could improve:
- Tomorrow focus:
*/

// ============================================
// EXAMPLE 2: Project Template with Dataview
// ============================================
/*
---
type: project
status: planning
priority: medium
created: <%= tp.date.now("YYYY-MM-DD") %>
---

# <%= tp.file.title %>

## Overview

<%* 
const created = this.app.vault.getAbstractFileByPath(tp.file.path).stat.ctime;
const createdDate = new Date(created).toLocaleDateString();
%>

Created: <%= createdDate %>

## Goals

- [ ] Goal 1
- [ ] Goal 2
- [ ] Goal 3

## Related Notes

<%* 
const dv = this.app.plugins.plugins.dataview?.api;
if (dv) {
  const related = await dv.queryAsync(`
    TABLE file.link FROM "Projects" WHERE type = "project" LIMIT 10
  `);
  
  if (related.values.length > 0) { %>
<%* for (const note of related.values) { %>
- <%= note[0] %>
<%* }
} -%>

## Progress

- Started: <%= tp.date.now("YYYY-MM-DD") %>
- Status: #<%= tp.file.frontmatter.status %>
*/

// ============================================
// EXAMPLE 3: People/Contact Template
// ============================================
/*
---
type: person
tags: contact
---

# <%= tp.file.title %>

## Contact Info

- Email: 
- Phone: 
- LinkedIn: 

## Relationship

- How we met: 
- Common interests: 

## Recent Interactions

<%* 
const dv = this.app.plugins.plugins.dataview?.api;
if (dv) {
  const interactions = await dv.queryAsync(`
    TABLE file.link, date FROM "Interactions" 
    WHERE people = "[[<%= tp.file.title %>]]"
    SORT date DESC
    LIMIT 5
  `);
  
  if (interactions.values.length > 0) { %>
<%* for (const [link, date] of interactions.values) { %>
- <%= date %>: <%= link %>
<%* }
} -%>

## Follow-up

- [ ] Next meeting: 
- [ ] Topics to discuss:
*/

// ============================================
// EXAMPLE 4: Book Review Template
// ============================================
/*
---
type: book
author: <%= (await tp.system.prompt("Author name:")) || "Unknown" %>
rating: 
read-date: <%= tp.date.now("YYYY-MM-DD") %>
---

# <%= tp.file.title %>

## Basic Info

- Author: <%= tp.file.frontmatter.author %>
- Rating: ⭐ <%= tp.file.frontmatter.rating %>
- Read: <%= tp.file.frontmatter["read-date"] %>

## Summary

(2-3 sentence summary)

## Key Takeaways

1. 
2. 
3. 

## Quotes I Liked

> Quote here - Page X

## Would Recommend?

YES / NO

Reason: 

## Related Books

<%* 
const dv = this.app.plugins.plugins.dataview?.api;
if (dv) {
  const similarBooks = await dv.queryAsync(`
    TABLE author FROM "Books" WHERE rating >= 4 LIMIT 5
  `);
  
  if (similarBooks.values.length > 0) { %>
<%* for (const book of similarBooks.values) { %>
- <%= book[0] %>
<%* }
} -%>
*/

// ============================================
// EXAMPLE 5: Meeting Notes Template
// ============================================
/*
---
meetingType: 
attendees: 
date: <%= tp.date.now("YYYY-MM-DD HH:mm") %>
---

# Meeting: <%= tp.file.title %>

**Date:** <%= tp.file.frontmatter.date %>  
**Attendees:** <%= tp.file.frontmatter.attendees %>  
**Type:** <%= tp.file.frontmatter.meetingType %>

## Agenda

- [ ] Topic 1
- [ ] Topic 2
- [ ] Topic 3

## Discussion

### Topic 1

- Point 1:
- Point 2:
- Decision:

### Topic 2

- Point 1:
- Point 2:
- Decision:

## Action Items

<%* 
const now = new Date();
const nextWeek = new Date(now.getTime() + 7*24*60*60*1000).toISOString().split('T')[0];
%>

- [ ] [Owner] - Task 1 - Due: <%= nextWeek %>
- [ ] [Owner] - Task 2 - Due: <%= nextWeek %>

## Next Meeting

- Date: 
- Topics to cover:

## Related

- [[Previous Meeting - 2024-XX-XX]]
- [[Project Name]]
*/

// ============================================
// EXAMPLE 6: Weekly Review Template
// ============================================
/*
---
type: review
week: <%= (new Date().getFullYear()) %>-W<%= String(Math.ceil(((new Date() - new Date(new Date().getFullYear(),0,1)) / 86400000 + 1)/7)).padStart(2, '0') %>
---

# Weekly Review - <%= tp.date.now("YYYY-MM-DD") %>

## Accomplishments This Week

- [ ] 
- [ ] 
- [ ]

## What Went Well

- 
- 

## What Didn't Go Well

- 
- 

## Learnings

1. 
2. 

## Metrics

- Tasks completed: 
- Books read: 
- Workouts: 

## Next Week Focus

1. 
2. 
3. 

## Gratitude

I'm grateful for:
- 
- 
-
*/
