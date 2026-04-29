# Color Tokens — Full Reference

## Source

Derived from `sie-colors-overview-V1-4-4.pdf` in the slide-writing skill's brand PDF assets.

---

## Dark Theme Full Token Set

```css
[data-theme="dark"] {
  /* Backgrounds */
  --surface-bg:         #000028;   /* Deep Blue — full-page background */
  --surface-panel:      #1B2A4A;   /* Elevated surface: nav, sidebar, header */
  --surface-card:       #0D1B2E;   /* Card/widget surface */
  --surface-overlay:    rgba(0,0,40,0.85); /* Modal overlay */

  /* Text */
  --text-primary:       #FFFFFF;
  --text-secondary:     #B0BEC5;
  --text-disabled:      #607D8B;
  --text-inverse:       #000028;

  /* Accent */
  --accent:             #009999;   /* Siemens Petrol — primary CTA */
  --accent-hover:       #00C1B6;   /* Light Petrol */
  --accent-active:      #007A7A;   /* Darker petrol for pressed state */

  /* Status / semantic */
  --status-success:     #00FFB9;   /* Bold Green */
  --status-info:        #00E6DC;   /* Bold Blue */
  --status-warning:     #FFF3CD;   /* Light gold */
  --status-error:       #FF5252;   /* Not in brand core — use sparingly */

  /* Borders */
  --border-subtle:      rgba(0,153,153,0.2);
  --border-default:     rgba(0,153,153,0.5);
  --border-strong:      #009999;

  /* Focus */
  --focus-ring:         #00C1B6;
}
```

## Light Theme Full Token Set

```css
[data-theme="light"] {
  /* Backgrounds */
  --surface-bg:         #F3F3F0;   /* Light Sand */
  --surface-panel:      #DDEEF7;   /* Light blue-grey panel */
  --surface-card:       #FFFFFF;
  --surface-overlay:    rgba(243,243,240,0.9);

  /* Text */
  --text-primary:       #000028;   /* Deep Blue */
  --text-secondary:     #4A5568;
  --text-disabled:      #9E9E9E;
  --text-inverse:       #FFFFFF;

  /* Accent (same hue, readable on light) */
  --accent:             #007A7A;   /* Darker petrol for light bg AA contrast */
  --accent-hover:       #009999;
  --accent-active:      #005E5E;

  /* Status */
  --status-success:     #00875A;
  --status-info:        #0084A0;
  --status-warning:     #C07A00;
  --status-error:       #C0392B;

  /* Borders */
  --border-subtle:      rgba(0,40,80,0.1);
  --border-default:     rgba(0,40,80,0.3);
  --border-strong:      #007A7A;

  /* Focus */
  --focus-ring:         #009999;
}
```

## High-Contrast Override (Accessibility)

```css
@media (forced-colors: active) {
  :root {
    --accent:        ButtonText;
    --surface-bg:    Canvas;
    --text-primary:  CanvasText;
    --border-strong: ButtonText;
  }
}
```

## Contrast Pairings (WCAG AA ≥ 4.5:1)

| Foreground          | Background        | Ratio  | Pass |
|---------------------|-------------------|--------|------|
| `#FFFFFF`           | `#000028`         | 18.5:1 | ✓    |
| `#009999` (petrol)  | `#000028`         | 4.6:1  | ✓    |
| `#00FFB9` (bold grn)| `#000028`         | 12.4:1 | ✓    |
| `#000028`           | `#F3F3F0`         | 18.5:1 | ✓    |
| `#007A7A`           | `#F3F3F0`         | 4.7:1  | ✓    |
| `#009999`           | `#FFFFFF`         | 3.0:1  | ✗ (large text only) |

> **Note:** Raw `#009999` on white does NOT meet AA for body text. Use `#007A7A` on light surfaces.
