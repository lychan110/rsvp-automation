// QuickAdd Macro Templates
// Copy and adapt these patterns for your own macros

// ============================================
// PATTERN 1: Suggest from Dataview Results
// ============================================

async function suggestFromDataview(quickAddApi) {
  const app = quickAddApi.app;
  
  try {
    const dv = app.plugins.plugins.dataview?.api;
    if (!dv) throw new Error("Dataview plugin required");
    
    // Customize this query for your vault
    const results = await dv.queryAsync(`
      TABLE file.link, priority, status 
      FROM "Projects" 
      WHERE status = "active"
      SORT priority DESC
    `);
    
    if (!results.values || results.values.length === 0) {
      new app.Notice("No results found");
      return;
    }
    
    // Format suggestions
    const options = results.values.map(row => ({
      display: `${row[0].label} [P${row[1] || '0'}]`,
      link: row[0].label,
      priority: row[1]
    }));
    
    const chosen = await quickAddApi.suggester(
      options.map(o => o.display),
      options
    );
    
    if (!chosen) return;
    
    // Do something with choice (insert, open, etc)
    console.log("Selected:", chosen);
    new app.Notice(`Selected: ${chosen.link}`);
    
  } catch (error) {
    console.error("Macro error:", error);
    new app.Notice(`Error: ${error.message}`, 5000);
  }
}

// ============================================
// PATTERN 2: Create File from Template
// ============================================

async function createFromTemplate(quickAddApi) {
  const app = quickAddApi.app;
  const vault = app.vault;
  
  try {
    // Get input from user
    const title = await quickAddApi.inputPrompt("File title:");
    if (!title) return;
    
    const category = await quickAddApi.suggester(
      ["Personal", "Work", "Learning"],
      ["personal", "work", "learning"]
    );
    
    if (!category) return;
    
    // Create file with template content
    const filename = `${title}.md`;
    const folder = `${category}/`;
    const path = folder + filename;
    
    const template = `# ${title}

Category: #${category}
Created: [[${new Date().toLocaleDateString()}]]

## Content

`;
    
    const newFile = await vault.create(path, template);
    await app.workspace.getLeaf().openFile(newFile);
    
    new app.Notice(`Created: ${path}`);
    
  } catch (error) {
    console.error("Create file error:", error);
    new app.Notice(`Error: ${error.message}`, 5000);
  }
}

// ============================================
// PATTERN 3: Multi-Step Workflow
// ============================================

async function multiStepWorkflow(quickAddApi) {
  const app = quickAddApi.app;
  
  try {
    // Step 1: Select category
    const category = await quickAddApi.multiSelect(
      ["Work", "Personal", "Learning", "Admin"]
    );
    
    if (category.length === 0) return;
    
    // Step 2: Get description
    const description = await quickAddApi.inputPrompt(
      `Describe the ${category[0]} task:`
    );
    
    if (!description) return;
    
    // Step 3: Set priority
    const priority = await quickAddApi.suggester(
      ["Low", "Medium", "High"],
      [1, 2, 3]
    );
    
    if (priority === null) return;
    
    // Step 4: Confirm and create
    const confirmed = await quickAddApi.suggester(
      ["Confirm", "Cancel"],
      [true, false]
    );
    
    if (!confirmed) {
      new app.Notice("Cancelled");
      return;
    }
    
    // Execute
    console.log("Task details:", {
      category: category[0],
      description,
      priority
    });
    
    new app.Notice("Task created!");
    
  } catch (error) {
    console.error("Workflow error:", error);
    new app.Notice(`Error: ${error.message}`, 5000);
  }
}

// ============================================
// PATTERN 4: Search & Open File
// ============================================

async function findAndOpenFile(quickAddApi) {
  const app = quickAddApi.app;
  
  try {
    // Get all markdown files in a folder
    const folder = "Daily"; // Change to your folder
    const files = app.vault
      .getMarkdownFiles()
      .filter(f => f.path.startsWith(folder))
      .sort((a, b) => b.stat.mtime - a.stat.mtime); // Newest first
    
    if (files.length === 0) {
      new app.Notice("No files found");
      return;
    }
    
    // Create suggestions
    const options = files.map(f => ({ name: f.basename, file: f }));
    
    const chosen = await quickAddApi.suggester(
      options.map(o => o.name),
      options
    );
    
    if (!chosen) return;
    
    // Open file
    await app.workspace.getLeaf().openFile(chosen.file);
    new app.Notice(`Opened: ${chosen.name}`);
    
  } catch (error) {
    console.error("Find file error:", error);
    new app.Notice(`Error: ${error.message}`, 5000);
  }
}

// ============================================
// PATTERN 5: Append to Existing File
// ============================================

async function appendToFile(quickAddApi) {
  const app = quickAddApi.app;
  const vault = app.vault;
  
  try {
    // Find target file
    const dailyNote = vault.getFileByPath("Daily/today.md");
    if (!dailyNote) throw new Error("Daily file not found");
    
    // Get user input
    const note = await quickAddApi.inputPrompt("Add note:");
    if (!note) return;
    
    // Read current content
    const current = await vault.read(dailyNote);
    
    // Append new content
    const timestamp = new Date().toLocaleTimeString();
    const newContent = current + `\n- ${timestamp}: ${note}`;
    
    // Save
    await vault.modify(dailyNote, newContent);
    new app.Notice("Note added!");
    
  } catch (error) {
    console.error("Append error:", error);
    new app.Notice(`Error: ${error.message}`, 5000);
  }
}

// Export for testing
module.exports = {
  suggestFromDataview,
  createFromTemplate,
  multiStepWorkflow,
  findAndOpenFile,
  appendToFile
};
