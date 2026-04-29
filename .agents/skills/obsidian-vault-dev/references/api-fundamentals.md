# Dataview Query Language (DQL)

## Quick Reference

### Basic Query Structure
```dataview
TABLE [field1], [field2]
FROM [source]
WHERE [condition]
SORT [field] [ASCENDING|DESCENDING]
LIMIT [number]
```

### Sources
```dataview
FROM "folder"              // All files in folder
FROM #tag                  // Files with tag
FROM [[file]]              // Files linking to specific file
FROM "folder" AND #tag     // Folder AND tag
FROM "folder" OR #tag      // Folder OR tag
```

### Field References
```dataview
file.name                  // Full filename
file.path                  // File path
file.folder                // Parent folder
file.cday                  // Creation date (as Date)
file.mday                  // Modified date (as Date)
file.size                  // File size in bytes
file.link                  // Link to file [[name]]
file.tags                  // All tags in file

[key]                      // YAML frontmatter field
created                    // Custom date field (YAML)
status                     // Custom field (YAML)
```

### Comparisons
```dataview
created = date(2024-01-01)    // Exact date
status = "done"                // Exact match
priority > 5                   // Numeric comparison
contains(title, "word")        // String contains
file.path =~ /Daily/           // Regex match
```

### Examples

#### List All Tasks Under "Backlog"
```dataview
LIST file.link
FROM "Backlog"
WHERE !completed
```

#### Table with Multiple Fields
```dataview
TABLE file.link, created, status
FROM "Projects"
WHERE priority >= 8
SORT created DESCENDING
```

#### Count Files by Folder
```dataview
TABLE file.folder, length(rows) as "Count"
FROM ""
GROUP BY file.folder
```

## Inline JavaScript Queries

Use JavaScript within dataview code blocks for complex logic:

```dataview
dv.header(2, "My Query");
const pages = dv.pages('"folder"').where(p => p.status === "active");
dv.table(
  ["Name", "Status", "Created"],
  pages.map(p => [p.file.link, p.status, p.file.cday.toDateString()])
);
```

### Common Functions

| Function | Purpose |
|----------|---------|
| `dv.header(level, text)` | Add heading |
| `dv.paragraph(text)` | Add paragraph |
| `dv.list(items)` | Create bullet list |
| `dv.table(headers, rows)` | Create table |
| `dv.pages(source)` | Get pages (source = `'"folder"'` or `'#tag'`) |
| `dv.query(dqlString)` | Execute DQL query |
| `dv.current()` | Current file metadata |

## Performance Tips

❌ Avoid `WHERE` conditions with regex on large vaults  
❌ Don't query entire vault (`FROM ""`) without filtering  
✅ Use `LIMIT` when you only need subset  
✅ Filter by folder first, then tag: `FROM "folder" AND #tag`  
✅ Cache complex queries and insert results via QuickAdd/Templater

## Debugging Queries

1. Start with simple query: `TABLE file.name FROM "folder" LIMIT 5`
2. Add filters incrementally: `WHERE status = "done"`
3. Check console (Ctrl+Shift+I) for parse errors
4. Verify frontmatter field names are lowercase in queries
