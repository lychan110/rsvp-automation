# Design Language Standardization — InviteFlow & ContactScout

Author: Claude Code
Date: 2026-04-28

## Problem Statement

InviteFlow and ContactScout are built with different design approaches:
- **InviteFlow:** Mixed light/dark theme, light is default, Tailwind v4, external CSS modules, PrimeReact DataTable
- **ContactScout:** Dark-only, CSS embedded in JS, inline styles, custom components

Both claim to mirror each other's design language, but have diverging implementation patterns, naming conventions, and component structures. This creates confusion during development and inconsistent UX across the suite.

## Goal

Standardize both applications to:
1. Share a single, documented design system (DESIGN.md)
2. Use consistent component naming and structure
3. Apply the same dark-only, terminal-inspired aesthetic throughout
4. Enable code reuse and faster feature development
5. Ensure all UX/interaction patterns follow consistent principles

## Scope

**In scope:**
- CSS variables and color palette alignment
- Component class naming conventions (`.if-*` vs `.cs-*` → unified naming)
- Typography and spacing scale
- Button variants and states
- Form inputs and labels
- Cards, panels, modals
- Status tags and empty states
- Responsive breakpoints
- Animation and transitions

**Out of scope:**
- Component logic refactoring (keep InviteFlow's `useReducer` + Context, ContactScout's local state)
- Tailwind → vanilla CSS migration (InviteFlow stays with Tailwind; ContactScout uses vanilla)
- Google API integration changes
- Data persistence layer changes

## Phases

### Phase 1 — Design System Documentation (1–2 days)
- [x] Audit both apps' current design implementations
- [ ] Create unified DESIGN_SYSTEM.md that consolidates both DESIGN.md and if.css patterns
- [ ] Define naming conventions and class prefixes for both apps
- [ ] Document all breakpoints, spacing scales, and animation timing

### Phase 2 — InviteFlow Alignment (2–3 days)
- [ ] Remove light-mode support; dark-only going forward (matches CLAUDE.md guidance)
- [ ] Simplify theme.css to dark-only palette
- [ ] Standardize if.css button/input sizes, spacing, animation timing to match ContactScout
- [ ] Update responsive breakpoints to match ContactScout's 768px / 1024px thresholds
- [ ] Audit and update all component files to use unified class naming

### Phase 3 — ContactScout Alignment (2–3 days)
- [ ] Extract CSS from css.ts into separate stylesheet(s)
- [ ] Rename all `.cs-*` classes to follow unified naming scheme
- [ ] Align typography, spacing, and animation timing with the unified system
- [ ] Standardize button/input sizes and focus states
- [ ] Update responsive breakpoints

### Phase 4 — Cross-app Verification (1 day)
- [ ] Run both apps side-by-side at 1440px and 900px viewports
- [ ] Verify all tabs render correctly
- [ ] Check all interactive states (hover, focus, disabled)
- [ ] Confirm all links in documentation are working
- [ ] Test form inputs, buttons, and validation flows

### Phase 5 — Final Cleanup & Merge (1 day)
- [ ] Remove any unused CSS or redundant definitions
- [ ] Commit and push to feature branch
- [ ] Create pull request with comprehensive change summary

## Success Criteria

1. Both apps use the same color palette from DESIGN.md
2. Both apps use consistent class naming (either `.if-*` or unified prefix — TBD)
3. All components have identical hover/focus/disabled states
4. Button sizes match across both apps
5. Spacing and typography scale identically
6. Both apps work correctly at 900px, 1024px, and 1440px viewports
7. No visual regressions in either app
8. All navigation links and external references work
9. All commit messages are clear and reference this plan

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Tailwind utilities conflict with custom classes | Audit if.css to ensure classes don't duplicate Tailwind behavior; document class-only vs. utility-only patterns |
| ContactScout CSS extraction introduces bugs | Extract CSS in a separate branch; test thoroughly before merging |
| Breakpoint changes break existing layouts | Test at 900px, 1024px, 1440px after each phase; use sticky breakpoints in code comments |
| DESIGN.md is incomplete | Update DESIGN.md as unified system is defined; keep both apps in sync with documentation |

## Next Steps

1. Create DESIGN_SYSTEM.md with unified rules
2. Begin Phase 2 (InviteFlow simplification)
3. Follow phases 3–5 in sequence
4. Merge feature branch after all verification passes
