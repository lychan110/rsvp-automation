# CSS Variables Reference

Comprehensive Obsidian CSS variables for consistent theming.

## Color Variables

### Primary Colors
```css
--color-accent: #7c3aed;          /* Primary accent */
--color-accent-1: #a78bfa;        /* Light accent (hover states) */
--color-accent-2: #ddd6fe;        /* Very light accent (backgrounds) */
```

### Text Colors
```css
--text-normal: #000;              /* Body text */
--text-muted: #555;               /* Secondary text */
--text-faint: #999;               /* Tertiary/disabled text */
--text-error: #e5746d;            /* Error messages */
--text-success: #27b589;          /* Success notifications */
--text-warning: #f5a623;          /* Warning messages */
--text-selection: rgba(51, 151, 255, 0.3); /* Text selection color */
```

### Background Colors
```css
--bg-primary: #fff;               /* Main background */
--bg-secondary: #f8f8f8;          /* Secondary backgrounds (code, quotes) */
--bg-tertiary: #f0f0f0;           /* Tertiary (hover, focus states) */
--scrollbar-background: rgba(0, 0, 0, 0.05);
--scrollbar-thumb-background: rgba(0, 0, 0, 0.1);
```

## Element-Specific Colors

### Editor
```css
--font-monospace: Menlo, SFMono, Consolas, monospace;
--font-text: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
--code-background: var(--bg-secondary);
--code-normal: var(--text-normal);
```

### Links & Buttons
```css
--link-color: var(--color-accent);
--link-unresolved: #e5746d;       /* Broken wiki links */
--interactive-normal: var(--bg-secondary);
--interactive-hover: var(--bg-tertiary);
--interactive-accent: var(--color-accent);
--interactive-accent-hover: var(--color-accent-1);
```

### Checkboxes & Forms
```css
--checkbox-size: 1.3em;
--checkbox-radius: 0.25em;
--checkbox-marker-color: #fff;
--input-border-color: var(--bg-tertiary);
--input-border-hover: var(--text-faint);
--input-shadow: 0 0 0 0.15rem rgba(123, 60, 237, 0.25);
```

### Notifications & Modals
```css
--notice-background: var(--bg-secondary);
--modal-background: var(--bg-primary);
--modal-border-color: var(--bg-tertiary);
--shadow-1: 0 1px 2px rgba(0, 0, 0, 0.1);
--shadow-2: 0 4px 6px rgba(0, 0, 0, 0.1);
```

## Spacing Variables

```css
--size-4-1: 4px;
--size-4-2: 8px;
--size-4-3: 12px;
--size-4-4: 16px;
--size-4-5: 20px;
--size-4-6: 24px;
--size-4-7: 28px;
--size-4-8: 32px;
--size-4-9: 36px;
--size-4-10: 40px;
```

## Sizing

```css
--icon-size: 1rem;
--icon-size-s: 0.875rem;
--icon-size-l: 1.25rem;
--font-size-s: 12px;
--font-size-m: 13px;
--font-size-l: 14px;
--line-height: 1.5;
--line-height-tight: 1.3;
```

## Borders & Dividers

```css
--border-radius: 4px;
--divider-width: 1px;
--divider-color: var(--bg-tertiary);
--table-border-width: 1px;
--table-border-color: var(--bg-tertiary);
```

## Layout

```css
--ribbon-width: 44px;
--sidebar-width: 250px;
--tab-stack-space: 0;
--header-height: 39px;
--status-bar-height: 29px;
```

## Dark Theme Overrides

When styling for dark mode, these variables typically change:

```css
.theme-dark {
  --text-normal: #e0e0e0;
  --text-muted: #aaa;
  --text-faint: #666;
  --bg-primary: #1e1e1e;
  --bg-secondary: #2a2a2a;
  --bg-tertiary: #333;
  --color-accent: #a78bfa;  /* Lighter for dark mode */
}
```

## Plugin Integration Variables

Style Settings plugin creates custom variables:

```css
/* Pattern: --plugin-{plugin-name}-{variable-name} */
--plugin-dataview-accent: var(--color-accent);
--plugin-tasks-completed-color: #27b589;
--plugin-templater-inline-color: #f5a623;
```

## Usage Examples

### Consistent Color Scheme
```css
.my-component {
  color: var(--text-normal);
  background: var(--bg-secondary);
  border: var(--divider-width) solid var(--divider-color);
  border-radius: var(--border-radius);
  padding: var(--size-4-2);
  font-size: var(--font-size-m);
}

.my-component:hover {
  background: var(--bg-tertiary);
}

.my-component.is-active {
  color: var(--color-accent);
}
```

### Theme-Aware Styling
```css
.my-highlight {
  background: var(--color-accent-2);
}

.theme-dark .my-highlight {
  background: rgba(167, 139, 250, 0.2);  /* Adjusted for dark mode */
}
```

## Finding New Variables

Open DevTools in Obsidian (Ctrl+Shift+I) and inspect computed styles:

```javascript
// In browser console
const styles = getComputedStyle(document.body);
// Filter variables
Array.from(styles).filter(s => s.startsWith('--')).slice(0, 20)
```
