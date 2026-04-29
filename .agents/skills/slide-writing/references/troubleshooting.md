\# Troubleshooting



Read this file when diagrams are missing, builds fail, or syntax errors occur.



\## Diagrams Missing After Build



1\. Confirm mslides is available: `mslides --version`

2\. Confirm Graphviz is available when using DOT: `dot -V`

3\. Confirm the `<!-- diagram:X -->` tag matches `filename: X.svg` in `diagrams/diagrams.md`.

4\. Re-run `mslides build` before `mslides export`.



\## Syntax Issues



\- Validate DOT separately: `dot -Tsvg input.dot -o output.svg`

\- Validate Mermaid separately at \[mermaid.live](https://mermaid.live) if needed.



\## Common Pitfalls



\- Marp CSS footer `content:` does not auto-update from frontmatter — manually sync it every time `deck\_footer` changes.

\- Exporting without building first produces stale or missing diagrams.

\- DOT tag/filename mismatches silently skip diagrams with no error.

