# Component Library — Extended Patterns

## Form Inputs

```css
.sie-input {
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: 2px;
  color: var(--text-primary);
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  padding: 0.5rem 0.75rem;
  width: 100%;
  transition: border-color 0.15s ease;
}
.sie-input:focus {
  border-color: var(--accent);
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.sie-label {
  display: block;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

## Table

```css
.sie-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}
.sie-table th {
  background: var(--surface-panel);
  color: var(--text-secondary);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.625rem 1rem;
  text-align: left;
  border-bottom: 2px solid var(--border-strong);
}
.sie-table td {
  padding: 0.625rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-primary);
}
.sie-table tr:hover td {
  background: rgba(0, 153, 153, 0.07);
}
```

## Modal

```css
.sie-modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--surface-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.sie-modal {
  background: var(--surface-panel);
  border: 1px solid var(--border-strong);
  border-radius: 4px;
  max-width: 560px;
  width: 100%;
  padding: 2rem;
}
.sie-modal-title {
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0 0 1rem;
}
```

## Tabs

```css
.sie-tabs {
  display: flex;
  border-bottom: 2px solid var(--border-default);
  gap: 0;
}
.sie-tab {
  padding: 0.5rem 1.25rem;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.sie-tab:hover {
  color: var(--text-primary);
}
.sie-tab[aria-selected="true"] {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
```

## Alert / Banner

```css
.sie-alert {
  border-left: 4px solid;
  border-radius: 2px;
  padding: 0.75rem 1rem;
  font-size: var(--font-size-sm);
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}
.sie-alert--success { border-color: var(--status-success); background: rgba(0,255,185,0.07); }
.sie-alert--info    { border-color: var(--status-info);    background: rgba(0,230,220,0.07); }
.sie-alert--warning { border-color: var(--status-warning); background: rgba(255,243,205,0.07); }
.sie-alert--error   { border-color: var(--status-error);   background: rgba(255,82,82,0.07); }
```

## Secondary / Ghost Button

```css
.btn-secondary {
  background: transparent;
  border: 1px solid var(--accent);
  color: var(--accent);
  border-radius: 2px;
  padding: 0.5rem 1.25rem;
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-base);
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}
.btn-secondary:hover {
  background: var(--accent);
  color: var(--text-inverse);
}
```

## Sidebar Navigation

```css
.sie-sidebar {
  background: var(--surface-panel);
  border-right: 1px solid var(--border-subtle);
  width: 240px;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.sie-nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1.25rem;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.15s;
}
.sie-nav-item:hover {
  color: var(--text-primary);
  background: rgba(0,153,153,0.08);
}
.sie-nav-item[aria-current="page"] {
  color: var(--accent);
  border-left-color: var(--accent);
  background: rgba(0,153,153,0.12);
  font-weight: var(--font-weight-bold);
}
```
