---
name: siemens-branding
description: >
  Apply Siemens brand identity to frontend UIs, components, and design systems.
  Use when styling web apps, dashboards, data tools, or internal tools with
  Siemens colors, typography, layout rules, and component patterns. Keywords:
  Siemens brand, CSS tokens, design system, petrol, deep blue, dark theme,
  light theme, component styling, brand colors, frontend branding, brand guide.
argument-hint: "What are you styling? (e.g., dashboard, form, nav, card, full app)"
---

# Siemens Frontend Branding

## Scope

Use for: CSS variable setup, component token mapping, layout structure, light/dark theming, branding review of existing UIs.

Do not use for: Marp slide decks (use the `slide-writing` skill instead), brand guideline PDFs, logo SVG generation.

## Brand Principles

1. **Clarity first** — minimal visual noise; every element earns its place.
2. **Purposeful layout** — one primary visual or action per view region.
3. **Dark-first impression** — prefer Deep Blue background when context allows.
4. **Strong hierarchy** — headline/title always dominant; supporting content secondary.
5. **Restraint over decoration** — use accent color sparingly to direct attention.

---

## Color Tokens

Define these as CSS custom properties at `:root`.

```css
:root {
  /* Core brand */
  --sie-deep-blue:     #000028;
  --sie-petrol:        #009999;
  --sie-light-petrol:  #00C1B6;
  --sie-bold-green:    #00FFB9;
  --sie-bold-blue:     #00E6DC;

  /* Neutral surfaces */
  --sie-light-sand:    #F3F3F0;
  --sie-white:         #FFFFFF;

  /* Semantic surface mapping (dark theme) */
  --surface-bg:        var(--sie-deep-blue);
  --surface-panel:     #1B2A4A;
  --surface-card:      #0D1B2E;
  --text-primary:      var(--sie-white);
  --text-secondary:    #B0BEC5;
  --accent:            var(--sie-petrol);
  --accent-light:      var(--sie-light-petrol);
  --highlight:         var(--sie-bold-green);

  /* Semantic surface mapping (light theme override) */
  /* Apply via [data-theme="light"] or @media (prefers-color-scheme: light) */
  /* --surface-bg: var(--sie-light-sand); */
  /* --text-primary: var(--sie-deep-blue); */
}
```

### Semantic Color Usage

| Token         | Use For                                    |
|---------------|--------------------------------------------|
| `--sie-deep-blue`   | Page/app background (dark mode)       |
| `--sie-petrol`      | Primary action, active states, borders|
| `--sie-light-petrol`| Hover states, highlights, links       |
| `--sie-bold-green`  | Success indicators, confirmation      |
| `--sie-bold-blue`   | Info/secondary accent                 |
| `--sie-light-sand`  | Light mode page background            |
| `--surface-panel`   | Sidebar, header, elevated surface     |
| `--surface-card`    | Card and widget background            |
| `--accent`          | CTA buttons, focus rings, active tab  |
| `--highlight`       | Success banners, positive KPIs        |

---

## Typography

```css
:root {
  --font-family-base: 'Siemens Sans', Arial, sans-serif;
  --font-size-xl:    2rem;     /* Page/hero title */
  --font-size-lg:    1.5rem;   /* Section heading */
  --font-size-md:    1.125rem; /* Sub-heading, card title */
  --font-size-base:  1rem;     /* Body */
  --font-size-sm:    0.875rem; /* Labels, captions */
  --font-weight-bold:   700;
  --font-weight-normal: 400;
  --line-height-base:   1.5;
}
```

Fallback: If Siemens Sans is unavailable, `Arial, Helvetica, sans-serif` is the approved substitute.

---

## Layout Rules

1. **One primary action per view** — do not compete headlines or CTAs.
2. **Navigation**: dark (`--surface-panel`) sidebar or top bar with petrol active indicator.
3. **Content area**: slightly lighter than nav (`--surface-bg` or `--surface-card`).
4. **Cards**: `--surface-card` background, `1px solid var(--sie-petrol)` border on hover.
5. **Max content width**: `1280px` centered; inner content cols use `gap: 1.5rem`.
6. **Footer**: always present on branded pages; see footer template below.

---

## Component Patterns

### Primary Button

```css
.btn-primary {
  background-color: var(--sie-petrol);
  color: var(--sie-white);
  border: none;
  border-radius: 2px;
  padding: 0.5rem 1.25rem;
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-base);
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.btn-primary:hover {
  background-color: var(--sie-light-petrol);
}
.btn-primary:focus-visible {
  outline: 2px solid var(--accent-light);
  outline-offset: 2px;
}
```

### Card

```css
.sie-card {
  background: var(--surface-card);
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 1.25rem;
  transition: border-color 0.15s ease;
}
.sie-card:hover {
  border-color: var(--sie-petrol);
}
```

### Data / Status Badges

```css
.badge-success  { background: #00FFB9; color: #000028; }
.badge-info     { background: #00E6DC; color: #000028; }
.badge-warning  { background: #FFF3CD; color: #000028; }
.badge-neutral  { background: #B0BEC5; color: #000028; }
```

### Page Header / Navbar

```css
.sie-header {
  background: var(--surface-panel);
  border-bottom: 2px solid var(--sie-petrol);
  padding: 0 2rem;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

### Footer (branded)

```html
<footer class="sie-footer">
  Restricted &nbsp;|&nbsp; &copy; Siemens 2026 &nbsp;|&nbsp; FT SDT DSS-US &nbsp;|&nbsp; SIEMENS
</footer>
```

```css
.sie-footer {
  background: var(--surface-panel);
  border-top: 1px solid var(--sie-petrol);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  padding: 0.75rem 2rem;
  text-align: center;
}
```

---

## Light Theme Override

```css
[data-theme="light"],
@media (prefers-color-scheme: light) {
  :root {
    --surface-bg:    var(--sie-light-sand);
    --surface-panel: #DDEEF7;
    --surface-card:  var(--sie-white);
    --text-primary:  var(--sie-deep-blue);
    --text-secondary: #4A5568;
    --accent:        var(--sie-petrol);
  }
}
```

---

## Procedure: Apply Branding to an Existing UI

1. Add CSS custom properties (`:root` block above) to the global stylesheet.
2. Replace hard-coded colors with semantic tokens (`--accent`, `--surface-bg`, etc.).
3. Update buttons, headers, and nav to use `--sie-petrol` / `--surface-panel`.
4. Add a branded footer using the footer template.
5. Validate contrast ratios — `--text-primary` on `--surface-bg` must meet WCAG AA (≥ 4.5:1).
6. Confirm dark and light modes render correctly; toggle `data-theme="light"` to test.
7. Check for un-branded colors (`#fff`, `blue`, `gray`) that slipped through — replace them.

---

## Quality Checklist

- [ ] CSS tokens defined at `:root`
- [ ] Deep Blue or Light Sand background applied
- [ ] All accent uses `--sie-petrol` or `--sie-light-petrol` only
- [ ] Primary buttons use `.btn-primary` pattern
- [ ] Focus rings visible (WCAG 2.4.7)
- [ ] Contrast AA met for all text/background pairs
- [ ] Footer present with correct Siemens attribution text
- [ ] No stray hard-coded color values remain
- [ ] Light theme tested if supported

---

## Reference Files

- [references/color-tokens.md](references/color-tokens.md) — full expanded token set, dark/light/high-contrast variants
- [references/component-library.md](references/component-library.md) — extended component patterns (table, form, modal, tabs, badge)

Brand source PDFs are in `~/.copilot/skills/slide-writing/assets/marp-brand/pdf/` — load on demand for color spec detail.
