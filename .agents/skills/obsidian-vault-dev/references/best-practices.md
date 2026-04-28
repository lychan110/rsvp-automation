# Multi-Plugin Workflows

## Coordinating Plugins

### Pattern: Dataview → QuickAdd → Templater

Query data with Dataview, suggest to user via QuickAdd, insert with Templater:

**QuickAdd Macro:**
```javascript
const dv = this.app.plugins.plugins.dataview?.api;
if (!dv) {
  new this.app.Notice("Dataview required");
  return;
}

// Query active projects
const results = await dv.queryAsync(`
  TABLE file.link, priority FROM "Projects" WHERE status = "active"
`);

// Create suggestions
const options = results.values.map(row => ({
  link: row[0],
  priority: row[1]
}));

const chosen = await this.suggester(
  options.map(o => `[P${o.priority}] ${o.link}`),
  options
);

// Open Templater template with chosen project
const template = this.app.vault.getFileByPath("Templates/task.md");
const leaf = await this.app.workspace.getLeaf();
await leaf.openFile(template);

// Store chosen project in QuickAdd variable
this.variables.project = chosen.link;
```

**Templater Template (`task.md`):**
```markdown
# Task
Project: 
Related: 
```

### Pattern: Tasks Plugin + Dataview

Query tasks filtered by status:

```dataview
TABLE file.link as "Note", urgency as "!!"
FROM ""
WHERE contains(type, "task") AND status = "in progress"
SORT urgency DESC
```

### Pattern: QuickAdd + Style Settings

Access Style Settings variables in QuickAdd to apply theme-aware colors:

```javascript
const styleSettings = this.app.plugins.plugins["style-settings"]?.api;
const accentColor = styleSettings?.getSetting("my-plugin-accent-color");
console.log("Current accent:", accentColor);
```

## Testing Plugin Interactions

### Verify Plugin Availability
```javascript
function getPluginAPI(pluginName) {
  const plugin = this.app.plugins.plugins[pluginName]?.api;
  if (!plugin) {
    throw new Error(`${pluginName} plugin not installed or disabled`);
  }
  return plugin;
}

try {
  const dv = getPluginAPI.call(this, "dataview");
  const tasks = getPluginAPI.call(this, "tasks");
} catch (error) {
  new this.app.Notice(error.message);
}
```

### Safe Plugin Feature Detection
```javascript
// Check if plugin method exists
const dv = this.app.plugins.plugins.dataview?.api;
if (dv?.queryAsync) {
  // Safe to use async queries
  const results = await dv.queryAsync(...);
} else {
  // Fall back to sync
  const results = dv.query(...);
}
```

## Performance & Reliability

### Debouncing Heavy Operations
```javascript
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const debouncedUpdate = debounce((file) => {
  // Heavy operation
}, 500);
```

### Error Recovery
```javascript
async function queryWithFallback(dv, query) {
  try {
    const results = await dv.queryAsync(query);
    return results;
  } catch (error) {
    console.warn("Query failed, trying simpler query:", error);
    // Return empty or fallback results
    return { values: [] };
  }
}
```

## Common Integration Issues

❌ **Plugin not loaded**: Check `this.app.plugins.enabledPlugins` array  
❌ **API changed between versions**: Test with DevTools, read plugin docs  
❌ **Circular references**: Dataview → QuickAdd → Templater → Dataview = loop  
✅ **Cache API references**: Store `const dv = getDataview()` at start  
✅ **Test each step**: Debug each plugin's output independently first  
✅ **Handle null gracefully**: Always check API exists before calling
