---
name: "RoadmapDriftAudit"
description: "Audit roadmap/progress/tasks against docs and code, identify drift, and propose grounded course corrections"
argument-hint: "Focus area (optional): stage, subsystem, or file path | --dry-run to skip file edits"
agent: "agent"
---
Run a repository governance and drift audit with this contract.

Response depth and tone policy:
- Default to concise output.
- Switch to deep-dive only when the user explicitly asks (for example: "deep dive", "comprehensive", or "full analysis").
- In deep-dive mode, include `## Executive Summary` as the first section.
- Use an intentionally adversarial red-team style: actively challenge assumptions, claims, and weak evidence.

Model policy:
- Use automatic model selection (do not pin or override model unless the user explicitly asks).

Use the user-provided chat argument as optional focus context. If no focus is provided, audit the full repository.
If `--dry-run` is in the argument, skip step 6 (persistence) entirely — emit patch-ready text in `## Persistence Updates Applied` instead of writing files.

Required loading order:
1. Read ROADMAP.md.
2. Read PROGRESS.md.
3. Read TASKS.md.
4. Build a technical snapshot from source code:
   - Identify the primary source directories and key entry points.
   - For each roadmap feature/phase in scope: locate the implementing module(s) and assess completeness using this checklist: (a) public interface matches roadmap contract (exports/signatures)? (b) contains stubs (`pass`, `TODO`, `raise NotImplementedError`, `// TODO`/`// FIXME`)? (c) has a corresponding test file referencing it? (d) no obvious import/syntax errors at a glance?
   - Flag stubs, TODO/FIXME/HACK comments, empty functions, or placeholder implementations.
   - Identify code that exists but has no corresponding task, progress note, or roadmap entry.
   - Check that planned architectural patterns (e.g., interfaces, layers, data flows described in roadmap) are actually present in code, not just in docs.

Required audit behavior:
1. Build a concise implementation snapshot integrating both the code scan (step 4 above) and docs relevant to the focus area.
2. Compare persisted planning claims against actual implementation state — verify against real code, not just docs.
3. Pit docs and code against each other in both directions:
   - Docs claim implemented, but code is missing/incomplete/stubbed.
   - Code behavior or module exists, but docs/tasks/progress do not reflect it.
   - TASKS state does not match observed implementation status.
   - Roadmap architectural decisions (patterns, interfaces, contracts) diverge from what is actually coded.
4. Flag drift with evidence and severity (critical, medium, low).

Mid-audit gate (run before continuing): Re-examine each finding drafted so far. Would a skeptical code reviewer reject it for insufficient evidence? Downgrade uncertain findings to a lower severity. Remove any finding with no line-linked code or doc reference. Only then proceed.

5. Recommend minimal course corrections to restore alignment (prefer surgical updates over rewrites).
6. Persist the audit outcome into existing planning artifacts with minimal edits:
   - ROADMAP.md: update phase/status claims that are no longer true.
   - PROGRESS.md: update current track, drift snapshot, and immediate focus.
   - TASKS.md: move/check tasks to reflect actual state; add missing drift-remediation tasks.
7. Do not create new planning files when ROADMAP/PROGRESS/TASKS already exist.
8. If persistence is blocked (permissions, missing file, merge conflict), report the blocker and provide exact patch-ready text.

Severity rubric:
- critical: produces wrong execution direction, false completion claims, or security/compliance risk.
- medium: sequencing/status mismatch likely to cause rework or confusion.
- low: wording or traceability issues without immediate execution risk.

Persistence editing constraints:
- Preserve existing style and structure in ROADMAP/PROGRESS/TASKS.
- Make delta-only edits; avoid broad rewrites.
- In TASKS.md, preserve section order and move tasks between sections instead of deleting history.

Required evaluation pass (challenge your own output before finalizing):
1. Logic check: verify each finding maps to concrete evidence.
2. Coverage check: confirm docs, code (including stubs/TODOs/untracked modules), and task-state drift were all assessed. If source code was not directly inspected, state that explicitly as a coverage gap.
3. Consistency check: ensure recommendations do not contradict roadmap sequencing.
4. Practicality check: ensure each correction is executable and minimally scoped.
5. Provenance check: separate plan-derived next steps from new suggestions.
6. Risk check: call out assumptions and confidence limits.

Output format (use these exact section headings):

## Executive Summary (deep-dive mode only; must be first)

## Scope
- Focus area interpreted from user input.
- Files/surfaces examined.

## Findings (Ordered by Severity)
- One bullet per finding.
- Include: status, why it matters, and evidence references in this format: path#Lx.

## Drift Matrix
| Area | Planned/Documented | Observed in Code | Drift Type | Confidence |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

## Course Corrections
- Actionable corrections with owner target (docs/code/tasks) and smallest safe change.

## Persistence Updates Applied
- List each updated planning file and what changed.
- If no edits were applied, explain why and include patch-ready text.

## Next Steps (From Persisted Plan/Tasks)
- Derive only from ROADMAP/PROGRESS/TASKS after drift check.
- If plan artifacts are stale or inconsistent, explicitly mark these as unverified.

## Next Steps (Copilot Suggestions)
- Additional suggestions not explicitly in persisted plans.
- Keep assumptions to one short line when speculative.

## Self-Challenge Review
- Briefly critique weak points in the audit (ambiguity, evidence gaps, risky assumptions).
- State the improvements made before final output.

Quality bar:
- Be explicit about uncertainty.
- Prefer evidence over assumptions.
- Keep recommendations grounded, concrete, and execution-ready.
- Prefer line-linked evidence when available.
