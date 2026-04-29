---
description: "Debug and harden an LLM prompt/workflow using evidence, docs-by-langchain checks, and concrete revisions"
argument-hint: "Describe the failure, expected behavior, and target prompt/symbol (for example #sym:build_field_mapper_prompt)"
agent: "agent"
tools: [read/readFile, search, web, 'docs-by-langchain/*', 'huggingface/*']
---

# Debug LLM Prompt/Agent Behavior With Evidence

Analyze an unsatisfactory LLM response, prompt, or agent orchestration and produce the best revision using LangChain best practices.

You must be critical of first-pass choices and explicitly verify better alternatives before finalizing recommendations.

## Instructions

1. **Establish failure context**
   - What happened vs. expected behavior?
   - Which artifact failed? (prompt text, parser, tool invocation, routing, state update)
   - Use the invocation context as provided by the user; do not hardcode symbol or file priority.

2. **Audit optimization choices with a challenger mindset**
   - Identify the first-pass changes and why they may be weak.
   - Explicitly test whether each change improves or harms reliability and extraction quality.
   - For prompt compaction: do not remove structure blindly. Decide what should stay as concise guidance versus what should be externalized.

3. **Mandatory docs-by-langchain grounding**
   - Use docs-by-langchain to validate recommended patterns before finalizing.
   - Cite at least 1 to 2 concrete docs-by-langchain findings in the analysis.
   - Prefer patterns aligned with current LangChain guidance for prompt design, structured outputs, validation, and tool orchestration.
   - Optionally search web and Hugging Face for additional evidence, but do not rely on anecdotal or forum sources.
   - If a recommendation is not clearly supported, mark it as a hypothesis and lower confidence.

4. **Prompt quality checks (required)**
   - Prompt instructions use plain language.
   - Avoid placeholder jargon or meta labels in both internal and final prompt text (for example FORMAT_CATALOG, INPUT_LINES, OUTPUT_SCHEMA sections as raw variable headers).
   - Examples are generic and tool-agnostic.
   - Constraints are explicit, testable, and non-conflicting.

5. **Produce a concrete revision plan**
   - Give the smallest high-impact edits first.
   - Include before/after snippets for the critical sections.
   - Add validation steps to prove the revision is better (targeted tests, representative inputs, failure-case checks).

## Output Format

- **Failure Summary**: [what failed and where]
- **Why First Pass Was Insufficient**: [specific weak decisions]
- **Evidence Check (docs-by-langchain)**: [what was validated and how it changed decisions]
- **Revised Recommendation**: [best pattern + rationale]
- **Critical Edits**: [before/after snippets]
- **Validation Plan**: [how to verify improvement]
- **Confidence & Risks**: [high/medium/low with residual uncertainty]
