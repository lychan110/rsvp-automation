---
name: "SelfChallengeReview"
description: "Challenge research assumptions, plans, and decisions using local and recent web evidence"
argument-hint: "What should be challenged? (feature, plan, decision, or architecture)"
agent: "agent"
tools: [search, web]
---
Challenge the subject provided as the chat argument (or pasted directly after the prompt invocation) from multiple angles.

Tone: intentionally adversarial red-team. Probe hard. Do not hedge findings to appear constructive — accuracy first.

---

### Shared steps (run in both modes)

**Step 1 — Gather evidence before any analysis.**
- Search local context (repo files, attached docs, codebase) for relevant evidence.
- Search the web; prefer sources from the last 2 years. If an older source is used, state why it remains authoritative.
- If no relevant evidence is found, state that explicitly and proceed on stated assumptions only. Do not synthesize sources.
- Distinguish facts, assumptions, and opinions. Flag claims with no supporting evidence.

**Step 2 — Build an Assumption Inventory.**
- List explicit assumptions in the subject.
- Infer likely hidden assumptions.
- Mark each: validated, uncertain, or weak. Top 3 only in concise mode.

---

### If concise mode (default)
Use this mode unless the user explicitly says "deep dive", "comprehensive", "full analysis", or equivalent.

**Step 3 — Pick the 3 highest-risk angles** from the angle menu below. For each:
- What speaks for this? What speaks against? If one side is trivially empty, say so and move on.
- Key risk if ignored.
- Confidence (high / medium / low).

**Step 4 — Recommendation.**
- Top 3 changes with rationale.
- What to defer and why.
- One kill criterion that would invalidate the proposal.

**Output (stop after these 3 sections):**
## Assumption Inventory
## Top Risks
## Recommendation

---

### If deep-dive mode (~800 word cap total)
Triggered only by explicit user request.

**Step 3 — Pick up to 6 angles** from the angle menu below; skip any with no meaningful finding. For each:
- What speaks for this? What speaks against? If one side is trivially empty, say so and move on.
- Key risk if ignored.
- Confidence (high / medium / low).

**Step 4 — Conflict tests.**
- Identify at least 3 direct tradeoffs between the selected angles.
- For each: which side currently dominates and why, what evidence is missing, one concrete metric or experiment to resolve it.

**Step 5 — Recommendation.**
- Top 3 changes with rationale.
- What to defer and why.
- Measurable success criteria.
- One kill criterion that would invalidate the proposal.

**Output (start with Executive Summary; cap at ~800 words total):**
## Executive Summary
## Assumption Inventory
## Multi-Angle Challenge
## Conflict Tests
## Evidence Log
## Recommendation
## Open Risks

---

### Angle menu (select from this list in both modes)
1. Fit-for-purpose — is this the right solution to the right problem?
2. Internal logic & feasibility — are claims self-consistent? Can it be built and executed as described?
3. Validity & rigor — edge cases, failure modes, missing scenarios, methodological soundness.
4. Computational feasibility & resource constraints — can this run within available hardware, time, and budget at research scale?
5. Security & trust surface — attack surface, trust assumptions, privilege scope, data sensitivity.
6. Reliability & resilience — graceful degradation, dependency failure handling.
7. Simplicity — is there a meaningfully simpler path to the same outcome?
8. Investment & strategic ROI — cost vs. portfolio fit, time-to-value horizon, alignment with R&D mission.
9. Adoption likelihood & stakeholder fit — will sponsors, domain experts, or downstream teams actually use or support this?
10. Longevity & knowledge continuity — what happens when the researcher leaves? Is the approach documentable and recoverable?
11. Reversibility & blast radius — how hard to undo? Worst-case failure scope?
12. Organizational & strategic alignment — does this fit current priorities, decision-maker expectations, and team mandates?
13. Regulatory, IP & compliance risk — patent landscape, data governance, export controls, ethical review.

---

Quality bar:
- Challenge requirements — do not accept them at face value.
- Prefer falsifiable claims over generic advice.
- Be specific and adversarial. Constructive framing is welcome only when it does not soften accuracy.
