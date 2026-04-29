# Obsidian CSS Guide

## CSS Architecture & Selectors

Obsidian's DOM follows this structure:
```
body.app
  ├── .workspace
  │   ├── .workspace-leaf (.is-active)
  │   │   └── .view-content
  │   │       └── .editor
  │   ├── .sidebar (.is-collapsed)
  │   └── .workspace-overlay
  ├── .titlebar
  ├── .status-bar
  └── .modals-container
```

### Core Workstyle Selectors

| Selector | Purpose |
|---|---|
| `.is-mobile` | Mobile viewport (< 770px) |
| `.is-phone` | Phone viewport (< 480px) |
| `.is-tablet` | Tablet viewport (480-770px) |
| `.theme-dark` / `.theme-light` | Theme variant |
| `.is-focused` | Focused editor pane |
| `.plugin-{name}` | Plugin is loaded |

### Layout Selectors

```css
/* Editor and sidebar */
.editor { /* Markdown editor container */ }
.cm-editor { /* CodeMirror 6 text area */ }
.sidebar-container { /* Sidebar pane */ }

/* Specific views */
.pane-relief-dragging-indicator { /* File explorer during drag */ }
.workspace-leaf.is-active .view-content { /* Active tab content */ }
```

## CSS Variables (Theme Integration)

Obsidian exposes theme variables via CSS custom properties:

```css
/* Colors - light theme defaults */
--color-accent: #7c3aed;           /* Accent/primary color */
--color-accent-1: #a78bfa;         /* Light variant */
--text-normal: #000;
--text-faint: #999;
--text-title-h1: #000;
--bg-primary: #fff;
--bg-secondary: #f8f8f8;
--bg-tertiary: #f0f0f0;

/* Spacing & sizing */
--size-4-1: 4px;
--size-4-2: 8px;
--size-4-3: 12px;
--size-4-4: 16px;
--size-4-5: 20px;
--size-4-6: 24px;

/* Borders & dividers */
--divider-width: 1px;
--table-border-width: 1px;
```

**Reference**: Check Obsidian's theme CSS files for complete variable list.

## Plugin-Aware Styling

### Detecting Active Plugins

```css
/* Dataview plugin styling */
.workspace:has(.dataview-container) .my-component {
  background: var(--color-accent);
}

/* Tasks plugin integration */
.workspace:has(.tasks-statusbar) .status-bar {
  background: var(--bg-tertiary);
}

/* Style Settings interop */
.mod-body {
  --custom-color: var(--color-accent);
}
```

## Performance Optimization

### What to Avoid

❌ `:has()` with deep nested selectors  
❌ `@import` for external stylesheets  
❌ Inline `<style>` tags (use snippet files)  
❌ Overly specific selectors (more than 4 levels)  
❌ `box-shadow` on large DOM trees  

### Best Practices

✅ Use CSS variables for theming  
✅ Scope to `.workspace` or specific containers  
✅ Class-based toggles instead of complex attribute selectors  
✅ `filter` instead of `opacity` for performance  
✅ `transform` instead of `top/left` for animations  

```css
/* GOOD: Scoped, performant */
.workspace .my-panel {
  animation: slidein 0.3s ease-out;
}

@keyframes slidein {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

/* AVOID: Expensive selectors */
.workspace div.pane div.content div.text { }
```

## Mobile Responsiveness

```css
/* Desktop-first approach */
.layout { display: grid; grid-template-columns: 1fr 2fr 1fr; }
.sidebar { width: 250px; }

/* Tablet */
@media (max-width: 770px) {
  .layout { grid-template-columns: 1fr 1fr; }
  .sidebar { width: 200px; }
}

/* Phone */
@media (max-width: 480px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar { display: none; } /* or toggle visibility */
}

/* Obsidian built-in classes */
body.is-mobile .sidebar { 
  position: absolute; 
  z-index: 10; 
}
```

## Style Settings Plugin Integration

Create a `styles.json` for Style Settings plugin to expose customizable options:

```json
{
  "obsidian-vault-dev": {
    "accent-color": {
      "type": "variable-themed-color",
      "format": "hsl-split",
      "default-light": "#7c3aed",
      "default-dark": "#a78bfa"
    },
    "sidebar-width": {
      "type": "variable-number",
      "default": 250,
      "value-unit": "px",
      "min": 150,
      "max": 400
    },
    "enable-animations": {
      "type": "variable-checkbox",
      "default": true
    }
  }
}
```

Then reference in CSS:
```css
.my-panel {
  background: rgb(var(--obsidian-vault-dev-accent-color));
  width: var(--obsidian-vault-dev-sidebar-width);
  animation: var(--obsidian-vault-dev-enable-animations) 0.3s ease;
}
```

## Common Patterns

### Hide Elements from Print

```css
@media print {
  .sidebar, .status-bar, .ribbon { display: none; }
  .workspace-leaf { width: 100%; }
}
```

### Dark Mode Overrides

```css
.theme-dark .my-component {
  background: var(--bg-secondary);
  color: var(--text-faint);
  border: 1px solid var(--divider-width);
}
```

### Hover States

```css
.button {
  background: var(--color-accent);
  transition: all 0.2s ease;
}

.button:hover {
  background: var(--color-accent-1);
  transform: scale(1.02);
}
```
