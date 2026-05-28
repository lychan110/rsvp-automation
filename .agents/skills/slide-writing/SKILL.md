---
name: slide-writing
description: >
  Create and maintain Marp slide decks using mslides for diagram rendering
  and PDF/HTML export. Use when the user wants to scaffold a presentation,
  author DOT or Mermaid diagrams for slides, build or export a deck, update
  deck metadata, or check slide layout and storytelling quality — even if
  they just say "make me a deck" or "update my slides."
license: Proprietary
compatibility: Requires mslides CLI, Graphviz (dot), and optionally Mermaid CLI.
metadata:
  author: yu-chin-chan
  version: "1.0"
allowed-tools: Bash(mslides:*) Bash(dot:*)
---

# Marp Slide Writing with mslides

## Scope

Use for: deck scaffolding, diagram authoring, build/watch/export, metadata-only updates, story and layout quality checks.

Do not use for: live presentation delivery, theme engine internals, MCP integration design.

## Quick Start

```bash
mslides init ./my-presentation   # scaffold
mslides build ./slides.md        # build diagrams + rendered markdown
mslides export ./slides.md --to pdf
mslides watch ./slides.md --to html
```

## File Model

```text
my-presentation/
  SKILL.md
  slides.md
  diagrams/
    diagrams.md          # consolidated diagram catalog
  img/                   # generated SVG outputs
  assets/
    marp-brand/          # portable branding resources
      brand-cheatsheet.md
      pdf/               # Siemens color/layout/brand PDFs
  references/
    storytelling.md      # storytelling and tone rules
    source-fidelity.md   # source-of-truth grounding rules
    brand-visual.md      # palette and visual rules
    troubleshooting.md   # diagram and syntax debugging
```

## Deck Metadata

Define in slide frontmatter:

```yaml
deck_title: "End-to-End Detailed Engineering: Component 1"
deck_subtitle: "Order Engineering Automation for C-Level Customization"
deck_author: "Yu-Chin Chan"
deck_date: "2026-01-01"
deck_footer: "Restricted | © Siemens 2026 | Yu-Chin Chan | FT SDT DSS-US | SIEMENS"
```

Marp CSS footer `content:` is static — always sync it with `deck_footer` when updating metadata.

## Diagram Catalog Contract

`diagrams/diagrams.md` contains YAML frontmatter with `filename` + `engine` entries and tagged diagram blocks.

Use DOT by default. Fall back to Mermaid only when DOT cannot express the diagram.

Tag rule: `<!-- diagram:my-name -->` must match `filename: my-name.svg`.

## Slide Directives

- Lead slides: `<!-- _class: lead -->`
- Chapter dividers: `<!-- _class: chapter -->`
- Hide pagination: `<!-- _paginate: false -->`

## Figure Layout Rules

1. Full-size figures: 16:9, placed directly under the slide title.
2. Wide figures: text above/below. Tall figures: text left/right.
3. Figures must fit between title area and footer — no clipping or overflow.
4. When resizing, scale internal text, objects, and line widths proportionally.
5. Main slides get simple visuals; move dense versions to backup slides.
6. Avoid accidental whitespace; if sparse by design, center content.

## Mandatory Hygiene

1. Title-slide author text: strong contrast, sufficient weight/size against background.
2. All non-title slides must show footer text.
3. Never place a diagram on a slide alone — include at least one explanatory bullet or text box.
4. On "scrap all diagrams" or major rewrite, rebuild diagram sources from scratch.
5. No behind-the-scenes framing text on slides (e.g., "proposal grounding").

## Metadata-Only Edit Mode

When only metadata changes (no body edits):

1. Edit frontmatter keys only (`deck_title`, `deck_subtitle`, `deck_author`, `deck_date`, `deck_footer`).
2. Sync footer CSS `content:` to `deck_footer`.
3. Rebuild and export:

```bash
mslides build ./slides.md
mslides export ./slides.md --to pdf
```

## Full Reset Rewrite Mode

1. Rebuild deck and diagram catalog from scratch.
2. Do not retain old framing, section labels, or diagram concepts unless user requests it.
3. Re-anchor every slide to the current source document before writing new copy.

Read [references/source-fidelity.md](references/source-fidelity.md) before grounding slides in a source document.

## Quality Checklist Before Export

- [ ] Headline message clear on every slide
- [ ] No dense text walls
- [ ] Main visuals readable from distance
- [ ] Before/after tables used where value comparison matters
- [ ] Evidence is concrete (examples, constraints, quotes, numbers)
- [ ] Footer and metadata synchronized
- [ ] No diagram-only slides remain
- [ ] Author byline visible on title slide
- [ ] Exported output reviewed in target format
- [ ] No behind-the-scenes text remains

## Gotchas

- Marp CSS footer `content:` does not auto-update from frontmatter — you must manually sync it every time `deck_footer` changes.
- `mslides build` must run before `mslides export`; exporting without building produces stale diagrams.
- DOT tag/filename mismatches silently skip diagrams — always verify `<!-- diagram:X -->` matches `filename: X.svg` in the catalog.
- Graphviz must be installed separately from mslides (`dot -V` to confirm).

## Reference Files

Read these on demand, not up front:

- [references/storytelling.md](references/storytelling.md) — storytelling arc, tone, and writing rules. Read when drafting or rewriting slide narrative.
- [references/source-fidelity.md](references/source-fidelity.md) — source-of-truth grounding rules. Read when the user provides a proposal or spec document.
- [references/brand-visual.md](references/brand-visual.md) — Siemens palette and visual conventions. Read when styling slides or choosing diagram colors.
- [references/troubleshooting.md](references/troubleshooting.md) — diagram and syntax debugging. Read if diagrams are missing or builds fail.
- [assets/marp-brand/brand-cheatsheet.md](assets/marp-brand/brand-cheatsheet.md) — quick brand reference. Read when applying brand colors or layout principles.