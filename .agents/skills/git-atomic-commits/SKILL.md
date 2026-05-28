---
name: git-atomic-commits
description: Use when you have pending changes (staged, unstaged, untracked) that need grouping into logical commits before finishing a development branch
---

# Creating Atomic Commits

## Overview

Group pending changes into logical, atomic commits with clear messages.

**Core principle:** One commit = one logical change. Multiple commits are better than one kitchen-sink commit. Related code, tests, and docs go together.

## When to Use

- You have pending changes ready to commit (staged, unstaged, or untracked files)
- Before finishing a development branch (required by `superpowers:finishing-a-development-branch`)
- Changes span multiple concerns (features, tests, docs, dependencies, cleanup) and need grouping
- You want reviewers to understand the logical structure of your work

**When NOT to use:**
- Work is still in progress (incomplete features, failing tests) → commit after finishing
- Single, cohesive change already staged → just commit as-is
- Unsure which changes go together → ask your human partner for grouping guidance first

## The Process

### 1. Review All Pending Changes

```bash
# See everything pending (staged, unstaged, untracked)
git status
git diff --name-only
git diff --cached --name-only
```

### 2. Identify Logical Groups

Scan pending changes and group by concern:
- **Feature**: Code + corresponding tests
- **Refactoring**: Code changes only (separate from tests if tests changed)
- **Tests**: Test files + test fixtures
- **Documentation**: Docs, comments, README updates (can go with related code)
- **Dependencies**: Package manager changes (package.json, pyproject.toml, etc.)
- **Cleanup**: Formatting, removals, renames (separate commit if substantial)

**Key rule:** If a markdown file documents a code change, commit them together.

### 3. Create Commits in Order

For each group:

```bash
# Stage the group
git add path/to/file1 path/to/file2 ...

# Verify the group
git diff --cached

# Write a clear, single-line message
# Format: <type>: <description>
# Examples:
#   feat: add user authentication module
#   test: add comprehensive retry logic tests
#   docs: update API reference for v2
#   refactor: simplify payment calculation
#   chore: update dependencies to latest

git commit -m "feat: add user authentication module"
```

**Commit message guidance:**
- Start with a type (`feat:`, `test:`, `docs:`, `refactor:`, `chore:`)
- Write in imperative mood ("add" not "adds" or "added")
- Keep to one line (50 chars preferred, 72 max)
- Describe what changed and why (if non-obvious)

### 4. Repeat Until All Changes Committed

Continue until `git status` shows no pending changes.

## Common Patterns

| Scenario | Action |
|----------|--------|
| Code + tests together | `git add impl/feature.py test/test_feature.py && git commit -m "feat: ..."` |
| Code + docs together | `git add impl/feature.py docs/api.md && git commit -m "docs: ..."` |
| Multiple independent features | Create separate commits: `feat: feature A`, then `feat: feature B` |
| Dependency + code using it | Can be one commit if tightly related, or two if independent |
| Formatting + refactoring | **Separate them** — formatting in one commit, logic in another |

## Red Flags

Stop and ask for clarification if:
- You're unsure how to group a set of changes
- Groupings seem artificial or forced
- A single group affects more than 2-3 files and doesn't fit an obvious concern
- You can't write a concise, single-line commit message for a group

## Integration

**Invoked by:** `superpowers:finishing-a-development-branch` (required step before creating PR)

**Verification:** After all commits, run:
```bash
git log --oneline HEAD~N..
# Verify each line is a clear, single logical change
```
