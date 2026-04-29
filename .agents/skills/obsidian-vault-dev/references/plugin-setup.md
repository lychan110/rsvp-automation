# Templater API Guide

## JavaScript Execution in Templates

Templater supports two types of code injection:

| Syntax | Context | When to Use |
|--------|---------|-------------|
| `<% code %>` | Raw expression, outputs result inline | Variable interpolation, simple logic |
| `<%* code %>` | Full JS block, no automatic output | Complex logic, loops, async operations |
| `<%_ code _%>` | Same as `<%*` but no whitespace output | Clean formatting |

## Common Functions

### File Functions (`tp.file`)
```javascript
< tp.file.title %>          // File name without extension
<% tp.file.path %>          // Full path including filename
<% tp.file.folder(true) %>  // Parent folder path (true = relative)
<% tp.file.extension %>     // File extension
<% tp.file.creation_date("YYYY-MM-DD") %>  // Creation date
<% tp.file.last_modified_date("YYYY-MM-DD") %>  // Last modified
```

### Date Functions (`tp.date`)
```javascript
<% tp.date.now("YYYY-MM-DD") %>           // Current date
<% tp.date.now("YYYY-MM-DD HH:mm") %>     // Current date & time
<% tp.date.tomorrow("YYYY-MM-DD") %>      // Tomorrow
<% tp.date.yesterday("YYYY-MM-DD") %>     // Yesterday
<% tp.date.now("dddd") %>                 // Day name (Monday, etc)
```

### Web Functions (`tp.web`)
```javascript
<%* const html = await tp.web.daily_quote() %>  // Daily quote
<%* const data = await tp.web.get_request("https://api.example.com/data") %>
```

### System Functions (`tp.system`)
```javascript
<% tp.system.prompt("Enter name") %>           // User input
<% tp.system.suggester(["A", "B"], ["A", "B"]) %>  // Dropdown choice
```

## Advanced Patterns

### Query Dataview & Insert Results
```markdown
<%* const dv = this.app.plugins.plugins.dataview?.api; -%>
<%* if (!dv) { %>Dataview plugin not found<% return; } -%>

## Inbox Items
<%* const results = await dv.queryAsync(`
  TABLE file.link, created FROM "Inbox" WHERE status = "new"
`); -%>

<%* for (const row of results.values) { -%>
- [[<% row[0] %>]] created <% row[1] %>
<%* } -%>
```

### Dynamic Selection and Content
```markdown
<%* const chosen = await tp.system.suggester(
  ["Personal", "Work", "Learning"],
  ["personal", "work", "learning"]
); -%>

# <% chosen.toUpperCase() %>

## Date: <% tp.date.now("YYYY-MM-DD") %>
## Author: <% (await this.app.vault.adapter.read(".obsidian/author.txt")).trim() %>
```

### Conditional Template Content
```markdown
<%* const time = parseInt(tp.date.now("HH")); -%>

## Good <%= time < 12 ? "Morning" : time < 18 ? "Afternoon" : "Evening" %>!

<%* if (this.app.vault.getFiles().length > 100) { -%>
⚠️ **Vault has many files** — Consider archiving older notes
<%* } -%>
```

## Error Handling

```javascript
<%* 
try {
  const dv = this.app.plugins.plugins.dataview?.api;
  if (!dv) throw new Error("Dataview required");
  
  const results = await dv.queryAsync("...");
  // Process results
} catch (error) {
  console.error("Template error:", error);
}
%>
```

## Debugging Templates

1. **Check DevTools**: Ctrl+Shift+I → Console tab
2. **Use console.log()**: Output visible in DevTools
3. **Test syntax**: Use Templater command → "Open sample" to test
4. **Variable inspection**: Add `<% JSON.stringify(variable, null, 2) %>` to output objects

## Performance Tips

❌ Avoid large loops in templates — slow inserts
✅ Pre-calculate complex queries before template insertion
✅ Cache Dataview API: `const dv = ... || {}`
✅ Use `<%_` to avoid extra whitespace in output
