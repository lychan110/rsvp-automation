---
description: "Use when creating or editing Graphviz DOT diagrams for presentation-ready technical figures, especially spacing, alignment, edge routing, and label placement in dot."
name: "Graphviz DOT Figure Rules"
---
# Graphviz DOT Figure Rules (Global)

Use these concise defaults and techniques for `dot`-engine diagrams.

## Baseline Defaults
```dot
graph [
  rankdir=TB
  splines=polyline
  nodesep=0.60
  pad=0.1
  bgcolor=none
  newrank=true
  compound=true
  fontname="Helvetica-Bold"
  fontsize=20
  forcelabels=true
]

node [
  shape=box
  style="filled,rounded"
  fontname="Helvetica-Bold"
  fontsize=15
  fixedsize=false
  penwidth=2.5
  margin="0.6,0.14"
]

edge [
  fontname="Helvetica"
  fontsize=13
  penwidth=2.0
  arrowsize=0.8
  labelfloat=false
  labeljust="c"
]
```

## Core Rules
- Default to `splines=polyline` for complex multi-cluster figures.
- Use `splines=ortho` only for simple linear flows; avoid ports and edge `label=` there, prefer `xlabel`.
- Use `splines=spline` only if curved routing is clearly more readable.
- Set `ranksep` only when explicitly needed (`ranksep=0.4` for tight pipelines; `"... equally"` for uniform rows).
- Do not set explicit cluster/subgraph `margin`; use graph spacing and edge constraints instead.
- With `fixedsize=false`, avoid global node `width`/`height`; size special nodes via node-local `margin`.

## Edge And Ranking Heuristics
- Weight hierarchy:
  - `weight=1000` critical backbone
  - `weight=100` strong secondary flow
  - `weight=10` loop/retry/support
  - `weight=0` structural/compound connectors and feedback
- Use `constraint=false` on non-flow feedback edges.
- Use `group=main` / `group=support` before adding invisible scaffolds.
- With `newrank=true`, use cross-cluster `{ rank=same; OUTSIDE; INSIDE }` when exact row alignment is needed.

## Proven Layout Tricks
### Cluster gap from upstream node
```dot
graph [compound=true]
edge [labelfloat=false]
UP -> FIRST_IN_CLUSTER [weight=0 lhead=cluster_name label=" \n"]
```
The `" \n"` forces Graphviz to reserve vertical space between node and cluster boundary.

### Vertical cluster centering
```dot
MERGE -> SB [style=invis weight=0 ltail=cluster_post lhead=cluster_comparison label=" "]
REC   -> SB [weight=1000]
```
Use an invisible compound edge to anchor cluster center; keep visible edge weight much higher to avoid squiggles.

### Fan-in / fan-out cleanup
```dot
A -> DEST [samehead=h1]
B -> DEST [samehead=h1]
SRC -> X  [sametail=t1]
SRC -> Y  [sametail=t1]
```
- `samehead` / `sametail` are dot-only edge attributes.
- Use when parallel edges attach at scattered points.

## Labels
- Prefer `xlabel` for edge text.
- Keep labels short; use multiline only when necessary.
- If labels are hidden, keep `forcelabels=true` and verify overlap visually.

## Color
- If Siemens theme is requested, use Siemens palette:
  - `#009999`, `#00C1B6`, `#000028`, `#00FFB9`, `#00E6DC`, `#F3F3F0`, `#FFFFFF`
- Otherwise use high-contrast, color-blind friendly combinations.

## Validation
```bash
dot -Tpng -Gdpi=300 <figure>.dot -o <figure>.png
```
Check: no overlaps with cluster borders, labels visible, and support/feedback edges do not distort main flow.

## Source Notes
Grounded in Graphviz docs: `splines`, `xlabel`, `forcelabels`, `pad`, `margin`, `nodesep`, `ranksep`, `newrank`, `constraint`, `weight`, `group`, `compound`, `lhead`, `ltail`, `samehead`, `sametail`, `labelfloat`, `labeljust`, `bgcolor`.
