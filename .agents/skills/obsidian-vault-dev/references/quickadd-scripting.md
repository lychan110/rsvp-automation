# QuickAdd Scripting Guide

## Getting Started

QuickAdd allows JavaScript macros for capturing, inserting, and automating tasks. Enable "Enable Macros" in QuickAdd settings.

## API Reference

### scope Object (this)
```javascript
const app = this.app;              // Obsidian app instance
const vault = this.app.vault;      // Vault instance
const quickAddApi = this;          // QuickAdd API

// Create suggestions dialog
const result = await this.suggester(names, values);

// Get user input
const userInput = await this.inputPrompt("Enter something");

// Create single/multi-select
const multi = await this.multiSelect(["Option A", "Option B"]);
```

### Common Patterns

#### Query Dataview & Suggest Results
```javascript
const dv = this.app.plugins.plugins.dataview?.api;
if (!dv) throw new Error("Dataview required");

// Query notes
const results = await dv.queryAsync(`
  TABLE file.name, created
  FROM "folder"
  WHERE completed = false
`);

// Convert to suggestions
const names = results.values.map(row => row[0]);
const selected = await this.suggester(names, names);

await this.app.vault.adapter.append(`result: ${selected}`);
```

#### Find & Suggest Existing Notes
```javascript
const files = this.app.vault.getMarkdownFiles()
  .filter(f => f.path.includes("Notes"))
  .map(f => ({ name: f.basename, file: f }));

const choice = await this.suggester(
  files.map(f => f.name),
  files
);

// Open chosen file
await this.app.workspace.getLeaf().setViewState({
  type: "markdown",
  state: { file: choice.file.path }
});
```

#### Create Template with Variables
```javascript
const fileName = await this.inputPrompt("File name");
const content = `# ${fileName}\nDate: [[${new Date().toLocaleDateString()}]]`;

const newFile = await this.app.vault.create(`${fileName}.md`, content);
await this.app.workspace.getLeaf().openFile(newFile);
```

#### Multi-Step Workflow
```javascript
// Step 1: Multi-select categories
const categories = ["Work", "Personal", "Learning"];
const selected = await this.multiSelect(categories);

// Step 2: Get input for each
for (const cat of selected) {
  const note = await this.inputPrompt(`Note for ${cat}`);
  console.log(`[${cat}] ${note}`);
}

// Step 3: Confirm
const confirmed = await this.suggester(["Yes", "No"], [true, false]);
if (confirmed) {
  new this.app.Notice("Workflow complete!");
}
```

## Error Handling

```javascript
try {
  const dv = this.app.plugins.plugins.dataview?.api;
  if (!dv) {
    new this.app.Notice("Dataview plugin not found", 3000);
    return;
  }

  const results = await dv.queryAsync("TABLE * FROM ...");
  if (!results || results.values.length === 0) {
    new this.app.Notice("No results found");
    return;
  }
  
  // Process results
} catch (error) {
  console.error("QuickAdd error:", error);
  new this.app.Notice("Error: " + error.message, 5000);
}
```

## Debugging

Open DevTools: Ctrl+Shift+I

```javascript
// Log outputs visible in console
console.log("Debug info:", myVar);

// Check if API exists
console.log("Apps:", this.app);
console.log("Plugins:", this.app.plugins.plugins);

// Test async operations
await this.inputPrompt("test").then(x => console.log(x));
```

## Useful Methods

| Method | Purpose |
|--------|---------|
| `await this.suggester(labels, values)` | Single-select dialog |
| `await this.multiSelect(options)` | Multi-select dialog |
| `await this.inputPrompt(prompt)` | Text input dialog |
| `new this.app.Notice(message, duration)` | Toast notification |
| `this.app.vault.getMarkdownFiles()` | Get all markdown files |
| `this.app.vault.getFileByPath(path)` | Get file by path |
| `await this.app.vault.read(file)` | Read file content |
| `await this.app.vault.modify(file, content)` | Write to file |
| `await this.app.vault.create(path, content)` | Create new file |
