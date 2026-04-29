---
name: commitGroupedChanges
description: Group similar changes and create atomic commits in a code repository
argument-hint: Describe the logical change groupings or let the agent infer them from the repo state
---
Review all pending changes in the repository, including untracked, modified, staged, and deleted files. Organize these changes into logical, atomic groups (such as features, tests, documentation, dependencies, removals, etc.), ensuring that related code, tests, and documentation are committed together. For each group:
- Write a clear, descriptive commit message summarizing the grouped changes
- Ensure each commit is atomic and focused on a single logical change
- Commit markdown files together with relevant code files if they document those changes
- Repeat until all changes are committed

If needed, prompt for clarification on how to group ambiguous changes. Do not include project-specific file names or details in the prompt.
