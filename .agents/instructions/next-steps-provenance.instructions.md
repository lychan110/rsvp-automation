---
name: "Next Steps Provenance + Drift Check"
description: "Use when presenting next steps, follow-ups, recommendations, or action items. Enforce drift check first, then clearly separate plan-derived steps from Copilot-suggested steps."
applyTo: "**"
---
# Next Steps Provenance + Drift Check

Before suggesting any next steps:

1. Check for planning drift first when planning artifacts exist.
- Treat ROADMAP -> PROGRESS -> TASKS as the expected source order.
- If artifacts are missing, stale, or inconsistent with the current implementation state, say so explicitly before proposing steps.

2. Label next steps by provenance and do not mix sources.
- Use a heading that clearly identifies plan-derived items, such as: "Next Steps (From Persisted Plan/Tasks)".
- Use a separate heading for agent proposals, such as: "Next Steps (Copilot Suggestions)".
- Never present Copilot-generated ideas as if they came from persisted plans.

3. State confidence and dependency assumptions when needed.
- If you could not verify drift, mark plan-derived next steps as unverified.
- If suggestions are speculative, state key assumptions in one short line.

Output contract:
- If only one source exists, still label it.
- If no trustworthy plan source exists, do not claim alignment; provide only Copilot suggestions and state that plan alignment could not be verified.
