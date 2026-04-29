# Script Debugging Guide

## DevTools Console (Ctrl+Shift+I)

Open via keyboard shortcut and check "Console" tab for output and errors.

### Logging Output

```javascript
// Simple log
console.log("Value:", myVar);

// Structured logging with levels
console.info("Info message");
console.warn("Warning message");
console.error("Error message");

// Objects with formatting
console.table(arrayOfObjects);
console.dir(objectStructure);
```

### Inspecting Variables

```javascript
// Type checking
console.log(typeof myVar);          // "string", "object", "function", etc
console.log(Array.isArray(myVar));  // true/false

// Object inspection
console.log(JSON.stringify(obj, null, 2));  // Formatted JSON

// Plugin API check
console.log("Plugins:", this.app.plugins.plugins);
console.log("Dataview available:", !!this.app.plugins.plugins.dataview?.api);
```

## Common Issues & Solutions

### "Plugin not found"

```javascript
// ❌ Wrong
const dv = this.app.plugins.plugins.dataview.api;  // May crash if null

// ✅ Correct
const dv = this.app.plugins.plugins.dataview?.api;  // Optional chaining
if (!dv) {
  console.error("Dataview plugin not found");
  new this.app.Notice("Dataview required");
  return;
}
```

### "Cannot read property of undefined"

```javascript
// ❌ Problem
const title = result[0].title;  // result[0] might be null

// ✅ Solution
const title = result?.[0]?.title;  // Optional chaining throughout
if (!title) console.warn("Title not found in result");
```

### Async/await not working

```javascript
// ❌ Wrong - returns undefined
this.queryDataview(); // Missing await

// ✅ Correct - wait for result
const result = await this.queryDataview();

// ✅ Or in forEach loop
for (const file of files) {
  const content = await this.app.vault.read(file);  // Must await
}
```

### Script runs but nothing happens

```javascript
// Could be:
// 1. No error handling - errors hidden
try {
  // your code
} catch (error) {
  console.error("Script error:", error);
  new this.app.Notice("Error: " + error.message);
}

// 2. Missing output
// Make sure you're creating something visible (Notice, UI element, file, etc)
new this.app.Notice("Script completed");

// 3. Synchronous blocking
// Don't use heavy loops without breaks
for (const file of this.app.vault.getFiles()) {
  // Avoid: long computation here
  // Better: debounce or batch process
}
```

## QuickAdd-Specific Debugging

### Testing Incrementally

```javascript
// Start with simplest test
console.log("QuickAdd script started");

// Test plugin access
const app = this.app;
console.log("App:", !!app);

// Test Dataview
const dv = app.plugins.plugins.dataview?.api;
console.log("Dataview available:", !!dv);

// Test query
try {
  const result = await dv.queryAsync("TABLE file.name FROM ...");
  console.log("Query result:", result);
} catch (error) {
  console.error("Query failed:", error);
}
```

### Testing UI Elements

```javascript
// Test suggester dialog
const input = await this.inputPrompt("Enter text:");
console.log("User input:", input);

// Test suggester
const options = ["Option A", "Option B"];
const choice = await this.suggester(options, options);
console.log("Selected:", choice);

// Test multi-select
const selected = await this.multiSelect(["A", "B", "C"]);
console.log("Multi-select result:", selected);
```

## Templater-Specific Debugging

### Check Template Execution

```markdown
<%* console.log("Template code started"); -%>
<%* console.log("Current file:", tp.file.title); -%>
<%* console.log("Today:", tp.date.now("YYYY-MM-DD")); -%>

<%* try {
  const dv = this.app.plugins.plugins.dataview?.api;
  console.log("Dataview available:", !!dv);
} catch (error) {
  console.error("Template error:", error);
} -%>
```

## Dataview-Specific Debugging

### Query Validation

```javascript
// Test in DevTools console:
const dv = app.plugins.plugins.dataview.api;

// Simple query first
dv.query(`TABLE file.name FROM "folder" LIMIT 5`);

// Add filters incrementally
dv.query(`TABLE file.name FROM "folder" WHERE status = "done"`);

// JavaScript API version
const pages = dv.pages('"folder"');
console.log(pages);
```

## Network Requests (QuickAdd)

```javascript
// Test web requests
const response = await this.app.plugins.plugins.quickadd?._api?.web?.get_request(
  "https://api.example.com/data"
);
console.log("Response:", response);
```

## Performance Profiling

```javascript
// Measure operation duration
const start = performance.now();

// Heavy operation here
for (let i = 0; i < 100000; i++) {
  // Something expensive
}

const duration = performance.now() - start;
console.log(`Operation took ${duration.toFixed(2)}ms`);
```

## Best Practices

✅ **Log early, log often** — Add console.log at key points
✅ **Use descriptive names** — `console.log("Dataview result:", result)`
✅ **Test plugin APIs incrementally** — Don't assume all methods exist
✅ **Check for null/undefined** — Use optional chaining `?.`
✅ **Wrap in try/catch** — Catch and log all errors
✅ **Test with DevTools visible** — Monitor console while script runs
