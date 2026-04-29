---
name: obsidian-vault-dev
description: Use when building Obsidian automation scripts, CSS customizations, and multi-plugin workflows using Dataview, Tasks, QuickAdd, Templater, and Style Settings
---

# Obsidian Vault Development

## What This Skill Provides

Complete guidance for working with existing Obsidian plugins, including:
- **QuickAdd Macros & Scripts**: JavaScript automation for capture, insertion, and templating
- **Templater Scripting**: Dynamic templates with JavaScript execution
- **Dataview Queries**: DQL and JavaScript for advanced note queries
- **CSS Customization**: Vault appearance tweaks and plugin-aware styling
- **Multi-Plugin Workflows**: Coordinating Dataview, Tasks, QuickAdd, Templater, and Style Settings
- **JSON Configuration**: Managing plugin settings and configurations

## When to Use

✓ Writing QuickAdd macros and JavaScript scripts
✓ Creating dynamic Templater templates with JS execution
✓ Building Dataview queries (DQL or inline JS)
✓ Creating CSS snippets for vault customization
✓ Coordinating multiple plugins (Dataview + Tasks + QuickAdd)
✓ Setting up automation workflows and shortcuts
✓ Configuring plugin behaviors via JSON settings
✓ Debugging scripts and template execution

## Quick Start by Task

### QuickAdd Macros & Scripting

1. **Setup QuickAdd Command**
   - Install QuickAdd plugin
   - Create new macro or script choice
   - Enable JavaScript execution in settings

2. **Write Macro Script**
   - Reference the QuickAdd scripting guide for API details
   - Use provided [macro templates](./scripts/quickadd-macros.js)
   - Access app/vault via QuickAdd API: `quickAddApi`, `app`

3. **Integrate with Dataview & Tasks**
   - Query notes via Dataview: `app.plugins.plugins.dataview.api`
   - Parse Tasks plugin syntax within resulting notes
   - Reference [Multi-Plugin Workflows](./references/best-practices.md)

4. **Test & Debug**
   - Use DevTools console (Ctrl+Shift+I) to check output
   - Log results: `console.log()` visible in DevTools

### Templater Dynamic Templates

1. **Create Template File**
   - Store in folder configured in Templater settings (default: `Templates/`)
   - Use `.md` extension with embedded JavaScript

2. **Write Templater Script**
   - Check the Templater API docs for complete function reference
   - Use provided [template examples](./scripts/templater-examples.js)
   - Reference Dataview queries within templates

3. **Insert & Execute**
   - Use QuickAdd or Templater hotkey to insert template
   - Variables and functions auto-execute
   - Test dynamic content generation

### CSS Customization & Vault Styling

1. **Create CSS Snippet**
   - Create `vault-root/.obsidian/snippets/custom.css`
   - Use [CSS Architecture Guide](./references/css-guide.md) for selectors
   - Reference [CSS Variables](./references/css-variables.md) for theming
   - Check [CSS Snippets Examples](./scripts/css-snippets.css) for starter templates

2. **Plugin-Aware Styling**
   - Use `.is-mobile`, `.theme-light/dark`, `.plugin-{name}` for responsive design
   - Coordinate with Style Settings plugin for dynamic customization
   - Check [CSS + Plugin Integration](./references/css-guide.md) for examples

3. **Performance Optimization**
   - Avoid expensive selectors (nested `:has()`, deep specificity)
   - Use CSS variables for theme compatibility
   - Test on mobile viewports (`.is-mobile` class)

### Dataview Queries

1. **Write DQL Query**
   - Reference [Dataview Query Language](./references/api-fundamentals.md) docs
   - Create inline queries with ` ```dataview ... ``` `
   - Test query syntax in query block

2. **Inline JavaScript**
   - Use `dv.current()`, `dv.pages()`, `dv.query()`
   - Reference [Dataview JS API](./references/api-fundamentals.md)
   - Integrate with QuickAdd/Templater for dynamic data

### Multi-Plugin Workflows

1. **Coordinate Plugins**
   - Reference [Multi-Plugin Workflows](./references/best-practices.md)
   - Example: Dataview → QuickAdd suggester → Templater insert
   - Access plugin APIs via `app.plugins.plugins`

2. **Respect Periodic Notes**
   - If the vault uses the Periodic Notes plugin, let it manage daily/weekly note filenames
   - Keep templates focused on frontmatter and body content instead of renaming periodic notes

3. **Error Handling**
   - Check plugin existence before accessing API
   - Handle missing data gracefully
   - Use try/catch in QuickAdd/Templater scripts

## Core Patterns

### QuickAdd Script Pattern

```javascript
// Access QuickAdd API and app context
const quickAddApi = this;
const app = quickAddApi.app;
const vault = app.vault;

// Query via Dataview (if installed)
try {
  const dv = app.plugins.plugins.dataview?.api;
  if (!dv) throw new Error("Dataview required");
  
  const results = await dv.queryAsync(`TABLE file.name, created FROM "path"`);
  const options = results.values.map(row => row[0]);
  
  const choice = await quickAddApi.suggester(options, options);
  console.log("Selected:", choice);
} catch (error) {
  console.error("Script error:", error);
  new app.Notice("Error: " + error.message);
}
```

### Templater Dynamic Template

```markdown
<%* // JavaScript execution block
const app = this.app;
const dv = app.plugins.plugins.dataview?.api;

if (dv) {
  const today = window.moment().format("YYYY-MM-DD");
  const todayNotes = await dv.queryAsync(`
    TABLE file.name FROM "Daily" WHERE date = "${today}"
  `);
}
-%>

# Template Output
- Date: <% tp.date.now("YYYY-MM-DD") %>
- File: <% tp.file.title %>
- Folder: <% tp.file.folder(true) %>
```

### Dataview Inline JavaScript

```markdown
```dataview
dv.header(2, "Active Tasks");
dv.table(["Task", "Due"], 
  dv.pages("#task")
    .where(p => !p.completed)
    .sort(p => p.due)
    .map(p => [p.file.link, p.due])
);
```
```

### CSS with Theme Variables

```css
/* Use native CSS variables for consistent theming */
:root {
  --custom-accent: var(--color-accent, #7c3aed);
  --custom-text: var(--text-normal, #000);
  --custom-bg: var(--background-primary, #fff);
}

.theme-dark {
  --custom-accent: var(--color-accent, #a78bfa);
  --custom-text: var(--text-normal, #e0e0e0);
  --custom-bg: var(--background-primary, #1e1e1e);
}

/* Plugin-aware selectors */
.workspace:has(.dataview-container) .my-panel {
  border-left: 2px solid var(--custom-accent);
}
```

## Key Resources

- [Dataview Documentation](https://blacksmithgu.github.io/obsidian-dataview/) — Query language and JS API
- [QuickAdd GitHub](https://github.com/chhoumann/quickadd) — Macro examples and setup
- [Templater Documentation](https://silentvoid13.github.io/Templater/) — Template functions and syntax
- [Tasks Plugin](https://obsidian-tasks-group.github.io/obsidian-tasks/) — Task parsing and queries
- [Style Settings Plugin](https://github.com/mgmeyers/obsidian-style-settings) — CSS variable customization
- [Obsidian Community Discord](https://discord.gg/obsidianmd) — Plugin support and examples

## Next Steps

- Choose your task above and follow the procedure
- Use reference docs for detailed guidance on each plugin's API
- Check provided scripts and templates for boilerplate starting points
- Test scripts in DevTools console (Ctrl+Shift+I) before full implementation

---

## Common Pitfalls

❌ Plugin API not available → Always check plugin exists first: `app.plugins.plugins.dataview?.api`
❌ Async operations not awaited → Use `await` in QuickAdd/Templater scripts
❌ CSS selectors that ignore `.is-mobile` → Test responsive layouts on mobile viewports
❌ Hardcoded file paths → Use `app.vault.adapter` for cross-platform compatibility
❌ Renaming periodic notes in templates → Let the Periodic Notes plugin control weekly/daily filenames
❌ Missing error handling in scripts → Always use try/catch for plugin API calls

See [Script Debugging Guide](./references/debugging.md) for troubleshooting patterns.
