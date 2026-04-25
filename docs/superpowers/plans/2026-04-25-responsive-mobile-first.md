# InviteFlow v3.1 — Responsive Mobile-First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate InviteFlow v3 to a responsive, mobile-first React app with Tailwind CSS v4, light-theme default, dark-mode toggle, hamburger drawer nav, and WCAG AA touch targets.

**Architecture:** Full replacement of inline styles with Tailwind utility classes + `dark:` variants. Dark mode is class-based (`<html class="dark">`), toggled by a button in the header and persisted in `localStorage`. Mobile nav collapses to a hamburger drawer below the `md:` breakpoint (768px).

**Tech Stack:** React 18, TypeScript, Vite 6, Tailwind CSS v4 (`@tailwindcss/vite`), PrimeReact 10 (DataTable), TipTap 2 (rich text editor)

---

## Color Reference

Use this table throughout every task. Never invent new colors.

| Role | Light class | Dark class |
|---|---|---|
| App background | `bg-gray-50` | `dark:bg-[#080c10]` |
| Card / surface | `bg-white` | `dark:bg-[#0d1117]` |
| Subtle surface | `bg-gray-100` | `dark:bg-[#161b22]` |
| Border | `border-gray-200` | `dark:border-[#21262d]` |
| Primary text | `text-gray-900` | `dark:text-[#c9d1d9]` |
| Muted text | `text-gray-500` | `dark:text-[#6e7681]` |
| Secondary text | `text-gray-400` | `dark:text-[#8b949e]` |
| Blue link | `text-blue-600` | `dark:text-[#58a6ff]` |
| Blue bg (active tab) | `bg-blue-600 text-white` | `dark:bg-[#1f6feb]` |
| Gold accent | `text-[#C8A84B]` | `dark:text-[#C8A84B]` |
| Green success | `text-green-600` | `dark:text-[#3fb950]` |
| Red error | `text-red-600` | `dark:text-[#f85149]` |
| Input | `bg-white border-gray-300` | `dark:bg-[#0d1117] dark:border-[#21262d]` |

## Button Classes Reference

Reuse these exact class strings in every task:

```
// Default (ghost)
"min-h-[44px] px-3 py-1 rounded border border-gray-300 bg-transparent text-gray-700 text-xs font-mono tracking-wide cursor-pointer hover:bg-gray-100 dark:border-[#21262d] dark:text-[#8b949e] dark:hover:bg-[#161b22] disabled:opacity-50 disabled:cursor-not-allowed"

// Primary (blue fill)
"min-h-[44px] px-3 py-1 rounded border border-blue-600 bg-blue-600 text-white text-xs font-mono tracking-wide cursor-pointer hover:bg-blue-700 dark:border-[#1f6feb] dark:bg-[#1f6feb] dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"

// Success (green fill)
"min-h-[44px] px-3 py-1 rounded border border-green-600 bg-green-600 text-white text-xs font-mono tracking-wide cursor-pointer hover:bg-green-700 dark:border-[#238636] dark:bg-[#238636] disabled:opacity-50 disabled:cursor-not-allowed"

// Danger (red ghost)
"min-h-[44px] px-3 py-1 rounded border border-red-500 bg-transparent text-red-600 text-xs font-mono tracking-wide cursor-pointer hover:bg-red-50 dark:border-[#f85149] dark:text-[#f85149] dark:hover:bg-[#2d0f0e] disabled:opacity-50 disabled:cursor-not-allowed"

// Blue ghost
"min-h-[44px] px-3 py-1 rounded border border-blue-400 bg-transparent text-blue-600 text-xs font-mono tracking-wide cursor-pointer hover:bg-blue-50 dark:border-[#58a6ff] dark:text-[#58a6ff] dark:hover:bg-[#0d1f3c] disabled:opacity-50 disabled:cursor-not-allowed"
```

## Input Classes Reference

```
// Standard input
"w-full bg-white border border-gray-300 text-gray-900 text-xs font-mono px-2.5 py-1.5 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-[#0d1117] dark:border-[#21262d] dark:text-[#c9d1d9] dark:focus:border-[#58a6ff]"
```

## Section Label Classes Reference

```
// Section divider label
"text-[10px] text-gray-500 tracking-widest font-mono uppercase mt-5 mb-2.5 border-b border-gray-200 pb-1.5 dark:text-[#6e7681] dark:border-[#21262d]"

// Small muted label
"text-[10px] text-gray-500 tracking-widest font-mono uppercase mb-1 dark:text-[#6e7681]"
```

---

## Task 1: Tailwind v4 Installation

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `src/index.css`
- Modify: `src/inviteflow/index.html`

- [ ] **Step 1: Install Tailwind v4 packages**

```bash
cd "C:\Users\lycha\Desktop\projects\Asian_Focus\VIPs\automate-invite-emails\.claude\worktrees\dreamy-kirch-ae0dc6"
npm install tailwindcss @tailwindcss/vite
```

Expected: packages added to `node_modules`, `package.json` updated.

- [ ] **Step 2: Update vite.config.ts**

Replace entire `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  base: process.env.VITE_BASE_URL ?? './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        inviteflow: 'src/inviteflow/index.html',
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
```

- [ ] **Step 3: Create src/index.css**

```css
@import "tailwindcss";

@variant dark (&:where(.dark, .dark *));

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}
```

- [ ] **Step 4: Update index.html title and viewport**

Replace `src/inviteflow/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>InviteFlow v3.1</title>
  <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/inviteflow/main.tsx"></script>
</body>
</html>
```

- [ ] **Step 5: Verify build passes**

```bash
npm run build
```

Expected: build completes without errors. Tailwind generates CSS in dist.

- [ ] **Step 6: Commit**

```bash
git add vite.config.ts src/index.css src/inviteflow/index.html package.json package-lock.json
git commit -m "feat(v3.1): install Tailwind v4, update vite config, add index.css"
```

---

## Task 2: Theme System — State, Reducer, Actions

**Files:**
- Modify: `src/inviteflow/types.ts`
- Modify: `src/inviteflow/state/actions.ts`
- Modify: `src/inviteflow/state/reducer.ts`
- Modify: `src/inviteflow/state/AppContext.tsx`

- [ ] **Step 1: Add darkMode to AppState in types.ts**

Add `darkMode: boolean;` to the `AppState` interface. Full replacement of `src/inviteflow/types.ts`:

```ts
export type TabId = 'events' | 'setup' | 'invitees' | 'compose' | 'send' | 'tracker' | 'sync';

export interface AppEvent {
  id: string;
  name: string;
  date: string;
  venue: string;
  orgName: string;
  contactName: string;
  contactEmail: string;
  formUrl: string;
  rsvpResponseUrl: string;
  masterSheetUrl: string;
  entryEmail: string;
  imgEmblemUrl: string;
  vipStart: string;
  vipEnd: string;
  googleClientId: string;
}

export interface Invitee {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  category: string;
  email: string;
  rsvpLink: string;
  inviteStatus: 'pending' | 'sent' | 'failed';
  sentAt: string;
  rsvpStatus: 'No Response' | 'Attending' | 'Declined';
  rsvpDate: string;
  notes: string;
}

export interface SendLogEntry {
  id: string;
  email: string;
  name: string;
  status: 'sent' | 'failed';
  timestamp: string;
  error?: string;
}

export interface AppState {
  activeEventId: string | null;
  events: AppEvent[];
  invitees: Invitee[];
  tab: TabId;
  textSubject: string;
  htmlBody: string;
  sendLog: SendLogEntry[];
  sending: boolean;
  sendProgress: { current: number; total: number };
  unsaved: boolean;
  darkMode: boolean;
}
```

- [ ] **Step 2: Add TOGGLE_DARK action to actions.ts**

Replace `src/inviteflow/state/actions.ts`:

```ts
import type { AppEvent, AppState, Invitee, SendLogEntry, TabId } from '../types';

export type Action =
  | { type: 'SET_TAB'; tab: TabId }
  | { type: 'SET_EVENTS'; events: AppEvent[] }
  | { type: 'ADD_EVENT'; event: AppEvent }
  | { type: 'UPDATE_EVENT'; event: AppEvent }
  | { type: 'DELETE_EVENT'; id: string }
  | { type: 'SET_ACTIVE_EVENT'; id: string | null }
  | { type: 'SET_INVITEES'; invitees: Invitee[] }
  | { type: 'ADD_INVITEE'; invitee: Invitee }
  | { type: 'UPDATE_INVITEE'; invitee: Invitee }
  | { type: 'DELETE_INVITEES'; ids: string[] }
  | { type: 'SET_COMPOSE'; subject: string; html: string }
  | { type: 'START_SEND'; total: number }
  | { type: 'SEND_PROGRESS'; current: number }
  | { type: 'LOG_SEND'; entry: SendLogEntry }
  | { type: 'STOP_SEND' }
  | { type: 'SET_UNSAVED'; unsaved: boolean }
  | { type: 'TOGGLE_DARK' }
  | { type: 'LOAD_STATE'; partial: Partial<AppState> };
```

- [ ] **Step 3: Handle TOGGLE_DARK in reducer.ts**

Replace `src/inviteflow/state/reducer.ts`:

```ts
import type { AppState } from '../types';
import type { Action } from './actions';

function loadDarkPref(): boolean {
  return localStorage.getItem('inviteflow_theme') === 'dark';
}

export const INITIAL_STATE: AppState = {
  activeEventId: null,
  events: [],
  invitees: [],
  tab: 'tracker',
  textSubject: '',
  htmlBody: '',
  sendLog: [],
  sending: false,
  sendProgress: { current: 0, total: 0 },
  unsaved: false,
  darkMode: loadDarkPref(),
};

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, tab: action.tab };
    case 'SET_EVENTS':
      return { ...state, events: action.events };
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.event], unsaved: true };
    case 'UPDATE_EVENT':
      return { ...state, events: state.events.map(e => e.id === action.event.id ? action.event : e), unsaved: true };
    case 'DELETE_EVENT': {
      const events = state.events.filter(e => e.id !== action.id);
      const activeEventId = state.activeEventId === action.id ? (events[0]?.id ?? null) : state.activeEventId;
      return { ...state, events, activeEventId, unsaved: true };
    }
    case 'SET_ACTIVE_EVENT':
      return { ...state, activeEventId: action.id, invitees: [], unsaved: false };
    case 'SET_INVITEES':
      return { ...state, invitees: action.invitees, unsaved: true };
    case 'ADD_INVITEE':
      return { ...state, invitees: [...state.invitees, action.invitee], unsaved: true };
    case 'UPDATE_INVITEE':
      return { ...state, invitees: state.invitees.map(i => i.id === action.invitee.id ? action.invitee : i), unsaved: true };
    case 'DELETE_INVITEES':
      return { ...state, invitees: state.invitees.filter(i => !action.ids.includes(i.id)), unsaved: true };
    case 'SET_COMPOSE':
      return { ...state, textSubject: action.subject, htmlBody: action.html, unsaved: true };
    case 'START_SEND':
      return { ...state, sending: true, sendLog: [], sendProgress: { current: 0, total: action.total } };
    case 'SEND_PROGRESS':
      return { ...state, sendProgress: { ...state.sendProgress, current: action.current } };
    case 'LOG_SEND':
      return { ...state, sendLog: [...state.sendLog, action.entry] };
    case 'STOP_SEND':
      return { ...state, sending: false };
    case 'SET_UNSAVED':
      return { ...state, unsaved: action.unsaved };
    case 'TOGGLE_DARK': {
      const next = !state.darkMode;
      localStorage.setItem('inviteflow_theme', next ? 'dark' : 'light');
      return { ...state, darkMode: next };
    }
    case 'LOAD_STATE':
      return { ...state, ...action.partial };
    default:
      return state;
  }
}
```

- [ ] **Step 4: Sync darkMode class to <html> in AppContext.tsx**

Replace `src/inviteflow/state/AppContext.tsx`:

```tsx
import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AppState } from '../types';
import type { Action } from './actions';
import { reducer, INITIAL_STATE } from './reducer';

const STORAGE_KEY = 'inviteflow_v3_state';

function saveState(state: AppState) {
  const { sendLog: _sl, sending: _s, sendProgress: _sp, darkMode: _d, ...rest } = state;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rest)); } catch { /* quota */ }
}

function loadPersistedState(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

const StateCtx = createContext<AppState>(INITIAL_STATE);
const DispatchCtx = createContext<React.Dispatch<Action>>(() => {});

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE, () => ({
    ...INITIAL_STATE,
    ...loadPersistedState(),
  }));

  useEffect(() => { saveState(state); }, [state]);

  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>
        {children}
      </DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export const useAppState = () => useContext(StateCtx);
export const useAppDispatch = () => useContext(DispatchCtx);
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: PASS — no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add src/inviteflow/types.ts src/inviteflow/state/actions.ts src/inviteflow/state/reducer.ts src/inviteflow/state/AppContext.tsx
git commit -m "feat(v3.1): add darkMode state, TOGGLE_DARK action, sync class to <html>"
```

---

## Task 3: Style Overrides (PrimeReact + TipTap)

**Files:**
- Modify: `src/inviteflow/main.tsx`
- Create: `src/inviteflow/styles/tiptap.css`
- Create: `src/inviteflow/styles/primereact-reset.css`

- [ ] **Step 1: Update main.tsx — switch to light PrimeReact theme and import overrides**

Replace `src/inviteflow/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../index.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './styles/primereact-reset.css';
import './styles/tiptap.css';
import App from './App';

const root = document.getElementById('root');
if (!root) throw new Error('No #root element');
createRoot(root).render(<StrictMode><App /></StrictMode>);
```

- [ ] **Step 2: Create src/inviteflow/styles/primereact-reset.css**

This overrides PrimeReact lara-light-indigo CSS variables in dark mode so the DataTable inherits the app's dark palette:

```css
/* Override PrimeReact lara-light-indigo vars for dark mode */
.dark {
  --surface-ground: #080c10;
  --surface-section: #080c10;
  --surface-card: #0d1117;
  --surface-overlay: #0d1117;
  --surface-border: #21262d;
  --surface-hover: #161b22;
  --surface-0: #0d1117;
  --surface-50: #0d1117;
  --surface-100: #161b22;
  --surface-200: #21262d;
  --surface-300: #30363d;
  --surface-400: #484f58;
  --surface-500: #6e7681;
  --surface-600: #8b949e;
  --surface-700: #b1bac4;
  --surface-800: #c9d1d9;
  --surface-900: #f0f6fc;
  --text-color: #c9d1d9;
  --text-color-secondary: #6e7681;
  --primary-color: #6366F1;
  --primary-color-text: #ffffff;
  color-scheme: dark;
}

/* Remove PrimeReact's default body background so app background shows */
.p-datatable .p-datatable-thead > tr > th {
  background: var(--surface-card);
  color: var(--text-color-secondary);
  border-color: var(--surface-border);
  font-size: 10px;
  letter-spacing: 0.1em;
  font-family: monospace;
}

.p-datatable .p-datatable-tbody > tr {
  background: var(--surface-card);
  color: var(--text-color);
  font-size: 11px;
  font-family: monospace;
}

.p-datatable .p-datatable-tbody > tr:hover {
  background: var(--surface-hover) !important;
}

.p-datatable .p-datatable-tbody > tr > td {
  border-color: var(--surface-border);
  padding: 6px 10px;
}

.p-datatable .p-datatable-thead > tr > th {
  padding: 6px 10px;
}
```

- [ ] **Step 3: Create src/inviteflow/styles/tiptap.css**

```css
/* TipTap editor content styles */
.tiptap {
  outline: none;
  min-height: 200px;
  font-size: 13px;
  line-height: 1.8;
  color: #111827;
}

.dark .tiptap {
  color: #c9d1d9;
}

.tiptap p {
  margin: 0.5em 0;
}

.tiptap ul,
.tiptap ol {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.tiptap.ProseMirror-focused {
  outline: none;
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: PASS — CSS imports resolve, no missing module errors.

- [ ] **Step 5: Commit**

```bash
git add src/inviteflow/main.tsx src/inviteflow/styles/tiptap.css src/inviteflow/styles/primereact-reset.css
git commit -m "feat(v3.1): switch to light PrimeReact theme, add dark-mode CSS var overrides, TipTap styles"
```

---

## Task 4: App.tsx — Header, Hamburger Drawer, Theme Toggle

**Files:**
- Modify: `src/inviteflow/App.tsx`

- [ ] **Step 1: Replace App.tsx with full Tailwind + hamburger drawer + theme toggle**

```tsx
import { useState } from 'react';
import { AppProvider, useAppState, useAppDispatch } from './state/AppContext';
import type { TabId } from './types';
import EventsTab from './tabs/EventsTab';
import SetupTab from './tabs/SetupTab';
import InviteesTab from './tabs/InviteesTab';
import ComposeTab from './tabs/ComposeTab';
import SendTab from './tabs/SendTab';
import TrackerTab from './tabs/TrackerTab';
import SyncTab from './tabs/SyncTab';

const TABS: { id: TabId; label: string }[] = [
  { id: 'events', label: 'Events' },
  { id: 'setup', label: 'Setup' },
  { id: 'invitees', label: 'Invitees' },
  { id: 'compose', label: 'Compose' },
  { id: 'send', label: 'Send' },
  { id: 'tracker', label: 'Tracker' },
  { id: 'sync', label: 'Sync' },
];

function TabContent() {
  const { tab } = useAppState();
  switch (tab) {
    case 'events': return <EventsTab />;
    case 'setup': return <SetupTab />;
    case 'invitees': return <InviteesTab />;
    case 'compose': return <ComposeTab />;
    case 'send': return <SendTab />;
    case 'tracker': return <TrackerTab />;
    case 'sync': return <SyncTab />;
  }
}

function AppInner() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeEvent = state.events.find(e => e.id === state.activeEventId);

  function selectTab(id: TabId) {
    dispatch({ type: 'SET_TAB', tab: id });
    setDrawerOpen(false);
  }

  return (
    <div className="h-screen bg-gray-50 text-gray-900 font-mono flex flex-col overflow-hidden dark:bg-[#080c10] dark:text-[#c9d1d9]">
      {/* Header */}
      <header className="border-b border-gray-200 px-4 py-2 flex items-center gap-3 shrink-0 bg-white dark:bg-[#0d1117] dark:border-[#21262d]">
        {/* Left zone */}
        <span className="font-black text-sm text-gray-900 tracking-tight dark:text-[#f0f6fc]">INVITEFLOW</span>
        <span className="text-[9px] text-gray-400 tracking-[0.12em] dark:text-[#6e7681]">v3.1</span>
        {activeEvent && (
          <span className="text-[10px] text-[#C8A84B] tracking-[0.08em] border-l border-gray-200 pl-3 truncate max-w-[160px] dark:border-[#21262d]">
            {activeEvent.name}
          </span>
        )}
        {state.unsaved && (
          <span className="text-[9px] text-gray-400 tracking-[0.1em] dark:text-[#6e7681]">●</span>
        )}

        {/* Right zone */}
        <div className="ml-auto flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_DARK' })}
            aria-label={state.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-sm text-gray-500 hover:text-gray-900 dark:text-[#6e7681] dark:hover:text-[#c9d1d9] rounded"
          >
            {state.darkMode ? '☀' : '☾'}
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-1" role="tablist">
            {TABS.map(t => (
              <button
                key={t.id}
                role="tab"
                aria-selected={state.tab === t.id}
                onClick={() => selectTab(t.id)}
                className={[
                  'min-h-[44px] px-2.5 py-1 rounded border text-[10px] font-mono tracking-[0.07em] uppercase cursor-pointer',
                  state.tab === t.id
                    ? 'bg-blue-600 border-blue-600 text-white dark:bg-[#1f6feb] dark:border-[#1f6feb]'
                    : 'bg-transparent border-transparent text-gray-500 hover:text-gray-900 dark:text-[#8b949e] dark:hover:text-[#c9d1d9]',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {/* Hamburger (mobile only) */}
          <button
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 dark:text-[#8b949e]"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 flex flex-col md:hidden motion-safe:transition-transform dark:bg-[#0d1117] dark:border-[#21262d]"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#21262d]">
              <span className="font-black text-sm text-gray-900 tracking-tight dark:text-[#f0f6fc]">INVITEFLOW</span>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 dark:text-[#6e7681]"
              >
                ✕
              </button>
            </div>
            <nav role="tablist" className="flex flex-col py-2">
              {TABS.map(t => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={state.tab === t.id}
                  onClick={() => selectTab(t.id)}
                  className={[
                    'min-h-[44px] flex items-center px-5 text-xs font-mono tracking-[0.07em] uppercase cursor-pointer border-l-2',
                    state.tab === t.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-[#1f6feb] dark:bg-[#0d1f3c] dark:text-[#58a6ff]'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 dark:text-[#8b949e] dark:hover:bg-[#161b22]',
                  ].join(' ')}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto flex flex-col">
        <TabContent />
      </main>
    </div>
  );
}

export default function App() {
  return <AppProvider><AppInner /></AppProvider>;
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 3: Verify dev server visually**

```bash
npm run dev
```

Open `http://localhost:5173/src/inviteflow/index.html`. Verify:
- Light theme loads by default
- Header shows INVITEFLOW v3.1
- Theme toggle (☾/☀) switches dark/light and persists after page reload
- On narrow viewport (< 768px): hamburger ☰ appears, desktop nav hides
- Drawer opens on ☰ tap, closes on backdrop or tab selection

- [ ] **Step 4: Commit**

```bash
git add src/inviteflow/App.tsx
git commit -m "feat(v3.1): rebuild App.tsx — Tailwind classes, hamburger drawer, theme toggle"
```

---

## Task 5: EventsTab

**Files:**
- Modify: `src/inviteflow/tabs/EventsTab.tsx`

- [ ] **Step 1: Replace EventsTab.tsx with Tailwind classes**

```tsx
import { useEffect, useState } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { getToken } from '../api/auth';
import { listAppDataFiles, getAppDataFile, createAppDataFile, deleteAppDataFile } from '../api/drive';
import type { AppEvent } from '../types';

function blankEvent(id: string): AppEvent {
  return {
    id,
    name: 'New Event',
    date: '',
    venue: '',
    orgName: '',
    contactName: '',
    contactEmail: '',
    formUrl: '',
    rsvpResponseUrl: '',
    masterSheetUrl: '',
    entryEmail: '',
    imgEmblemUrl: '',
    vipStart: '',
    vipEnd: '',
    googleClientId: localStorage.getItem('gClientId') ?? '',
  };
}

export default function EventsTab() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function loadEvents() {
    setLoading(true);
    setErr('');
    try {
      const token = await getToken('drive.appdata');
      const files = await listAppDataFiles(token);
      const configs = await Promise.all(
        files
          .filter(f => f.name.endsWith('.json'))
          .map(async f => {
            const data = await getAppDataFile(token, f.id) as AppEvent;
            return { ...data, id: f.id };
          })
      );
      dispatch({ type: 'SET_EVENTS', events: configs });
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEvents(); }, []);

  async function createEvent() {
    setErr('');
    try {
      const token = await getToken('drive.appdata');
      const tempId = crypto.randomUUID();
      const ev = blankEvent(tempId);
      const realId = await createAppDataFile(token, tempId + '.json', ev);
      ev.id = realId;
      dispatch({ type: 'ADD_EVENT', event: ev });
      dispatch({ type: 'SET_ACTIVE_EVENT', id: realId });
      dispatch({ type: 'SET_TAB', tab: 'setup' });
    } catch (e) {
      setErr(String(e));
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    setErr('');
    try {
      const token = await getToken('drive.appdata');
      await deleteAppDataFile(token, id);
      dispatch({ type: 'DELETE_EVENT', id });
    } catch (e) {
      setErr(String(e));
    }
  }

  return (
    <div className="p-5 max-w-[860px] mx-auto w-full">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-bold tracking-[0.08em] text-gray-900 dark:text-[#f0f6fc]">EVENTS</span>
        <div className="flex gap-2">
          <button
            onClick={loadEvents}
            disabled={loading}
            className="min-h-[44px] px-3 py-1 rounded border border-gray-300 bg-transparent text-gray-700 text-xs font-mono tracking-wide cursor-pointer hover:bg-gray-100 dark:border-[#21262d] dark:text-[#8b949e] dark:hover:bg-[#161b22] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
          <button
            onClick={createEvent}
            className="min-h-[44px] px-3 py-1 rounded border border-blue-600 bg-blue-600 text-white text-xs font-mono tracking-wide cursor-pointer hover:bg-blue-700 dark:border-[#1f6feb] dark:bg-[#1f6feb]"
          >
            + New Event
          </button>
        </div>
      </div>

      {err && <div className="text-xs text-red-600 mb-3 dark:text-[#f85149]">{err}</div>}

      {state.events.length === 0 && !loading && (
        <div className="text-gray-500 text-xs text-center py-10 dark:text-[#6e7681]">
          No events yet. Click &ldquo;+ New Event&rdquo; to create one.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {state.events.map(ev => (
          <div
            key={ev.id}
            className={[
              'bg-white border rounded-lg p-4 cursor-pointer transition-colors dark:bg-[#0d1117]',
              state.activeEventId === ev.id
                ? 'border-[#C8A84B]'
                : 'border-gray-200 hover:border-gray-400 dark:border-[#21262d] dark:hover:border-[#484f58]',
            ].join(' ')}
            onClick={() => { dispatch({ type: 'SET_ACTIVE_EVENT', id: ev.id }); dispatch({ type: 'SET_TAB', tab: 'setup' }); }}
          >
            <div className="text-sm font-bold text-gray-900 mb-1 dark:text-[#f0f6fc]">{ev.name || 'Unnamed Event'}</div>
            <div className="text-[10px] text-gray-500 mb-3 dark:text-[#6e7681]">
              {ev.date || 'No date'} · {ev.venue || 'No venue'}
            </div>
            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => { dispatch({ type: 'SET_ACTIVE_EVENT', id: ev.id }); dispatch({ type: 'SET_TAB', tab: 'setup' }); }}
                className="min-h-[44px] px-3 py-1 rounded border border-blue-600 bg-blue-600 text-white text-xs font-mono tracking-wide cursor-pointer hover:bg-blue-700 dark:border-[#1f6feb] dark:bg-[#1f6feb]"
              >
                {state.activeEventId === ev.id ? '✓ Active' : 'Activate'}
              </button>
              <button
                onClick={() => deleteEvent(ev.id)}
                className="min-h-[44px] px-3 py-1 rounded border border-red-500 bg-transparent text-red-600 text-xs font-mono tracking-wide cursor-pointer hover:bg-red-50 dark:border-[#f85149] dark:text-[#f85149] dark:hover:bg-[#2d0f0e]"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build and commit**

```bash
npm run build && git add src/inviteflow/tabs/EventsTab.tsx && git commit -m "feat(v3.1): EventsTab — Tailwind classes, responsive card grid"
```

---

## Task 6: SetupTab

**Files:**
- Modify: `src/inviteflow/tabs/SetupTab.tsx`

- [ ] **Step 1: Replace SetupTab.tsx**

```tsx
import { useState } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { getToken, setClientId } from '../api/auth';
import { updateAppDataFile } from '../api/drive';
import type { AppEvent } from '../types';

const FIELDS: Array<{ key: keyof AppEvent; label: string; type?: string; placeholder?: string }> = [
  { key: 'name', label: 'Event Name', placeholder: 'Greater Triangle Dragon Boat Festival' },
  { key: 'date', label: 'Event Date', type: 'date' },
  { key: 'venue', label: 'Venue', placeholder: 'Jordan Lake State Recreation Area' },
  { key: 'orgName', label: 'Organization Name', placeholder: 'Asian Focus NC' },
  { key: 'contactName', label: 'Contact Name', placeholder: 'Lenya Chan' },
  { key: 'contactEmail', label: 'Contact Email', type: 'email', placeholder: 'contact@org.com' },
  { key: 'vipStart', label: 'VIP Start Time', placeholder: '10:00 AM' },
  { key: 'vipEnd', label: 'VIP End Time', placeholder: '12:00 PM' },
  { key: 'formUrl', label: 'Google Form Base URL', placeholder: 'https://docs.google.com/forms/d/e/…/viewform' },
  { key: 'entryEmail', label: 'Form Email Entry ID', placeholder: 'entry.123456789' },
  { key: 'rsvpResponseUrl', label: 'RSVP Response Sheet URL', placeholder: 'https://docs.google.com/spreadsheets/d/…' },
  { key: 'masterSheetUrl', label: 'Master Sheet URL', placeholder: 'https://docs.google.com/spreadsheets/d/…' },
  { key: 'imgEmblemUrl', label: 'Emblem Image URL', placeholder: 'https://drive.google.com/…' },
];

const INPUT = "w-full bg-white border border-gray-300 text-gray-900 text-xs font-mono px-2.5 py-1.5 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-[#0d1117] dark:border-[#21262d] dark:text-[#c9d1d9] dark:focus:border-[#58a6ff]";
const LABEL = "text-[10px] text-gray-500 tracking-widest font-mono uppercase mb-1 block dark:text-[#6e7681]";
const SECTION = "text-[10px] text-gray-500 tracking-widest font-mono uppercase mt-5 mb-2.5 border-b border-gray-200 pb-1.5 dark:text-[#6e7681] dark:border-[#21262d]";

export default function SetupTab() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [clientIdDraft, setClientIdDraft] = useState(localStorage.getItem('gClientId') ?? '');

  const ev = state.events.find(e => e.id === state.activeEventId);

  if (!ev) {
    return (
      <div className="p-10 text-gray-500 text-xs text-center dark:text-[#6e7681]">
        No active event. Go to{' '}
        <button
          className="text-blue-600 bg-none border-none cursor-pointer font-mono text-xs dark:text-[#58a6ff]"
          onClick={() => dispatch({ type: 'SET_TAB', tab: 'events' })}
        >
          Events
        </button>{' '}
        to create or activate one.
      </div>
    );
  }

  function update(key: keyof AppEvent, value: string) {
    dispatch({ type: 'UPDATE_EVENT', event: { ...ev!, [key]: value } });
  }

  async function save() {
    setSaving(true);
    setStatus('');
    try {
      const token = await getToken('drive.appdata');
      await updateAppDataFile(token, ev!.id, ev);
      setClientId(clientIdDraft);
      dispatch({ type: 'UPDATE_EVENT', event: { ...ev!, googleClientId: clientIdDraft } });
      setStatus('Saved.');
    } catch (e) {
      setStatus('Error: ' + String(e));
    } finally {
      setSaving(false);
    }
  }

  async function authorize(scope: string) {
    setStatus('');
    try {
      await getToken(scope);
      setStatus(`${scope} authorized.`);
    } catch (e) {
      setStatus('Auth error: ' + String(e));
    }
  }

  return (
    <div className="p-5 max-w-[640px] mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold tracking-[0.08em] text-gray-900 dark:text-[#f0f6fc]">SETUP</span>
        <button
          onClick={save}
          disabled={saving}
          className="min-h-[44px] px-3 py-1 rounded border border-green-600 bg-green-600 text-white text-xs font-mono tracking-wide cursor-pointer hover:bg-green-700 dark:border-[#238636] dark:bg-[#238636] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {status && (
        <div className={`text-xs mb-3 ${status.startsWith('Error') ? 'text-red-600 dark:text-[#f85149]' : 'text-green-600 dark:text-[#3fb950]'}`}>
          {status}
        </div>
      )}

      <div className={SECTION}>GOOGLE OAUTH</div>
      <div className="mb-3">
        <label className={LABEL}>Google Client ID</label>
        <input
          className={INPUT}
          value={clientIdDraft}
          onChange={e => setClientIdDraft(e.target.value)}
          placeholder="123456789-abc.apps.googleusercontent.com"
        />
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          className="min-h-[44px] px-3 py-1 rounded border border-blue-400 bg-transparent text-blue-600 text-xs font-mono tracking-wide cursor-pointer hover:bg-blue-50 dark:border-[#58a6ff] dark:text-[#58a6ff] dark:hover:bg-[#0d1f3c]"
          onClick={() => authorize('spreadsheets')}
        >Authorize Sheets</button>
        <button
          className="min-h-[44px] px-3 py-1 rounded border border-blue-400 bg-transparent text-blue-600 text-xs font-mono tracking-wide cursor-pointer hover:bg-blue-50 dark:border-[#58a6ff] dark:text-[#58a6ff] dark:hover:bg-[#0d1f3c]"
          onClick={() => authorize('gmail.send')}
        >Authorize Gmail</button>
        <button
          className="min-h-[44px] px-3 py-1 rounded border border-blue-400 bg-transparent text-blue-600 text-xs font-mono tracking-wide cursor-pointer hover:bg-blue-50 dark:border-[#58a6ff] dark:text-[#58a6ff] dark:hover:bg-[#0d1f3c]"
          onClick={() => authorize('drive.appdata')}
        >Authorize Drive</button>
      </div>

      <div className={SECTION}>EVENT DETAILS</div>
      <div className="grid gap-3">
        {FIELDS.map(f => (
          <div key={f.key}>
            <label className={LABEL}>{f.label}</label>
            <input
              className={INPUT}
              type={f.type ?? 'text'}
              value={String(ev[f.key] ?? '')}
              onChange={e => update(f.key, e.target.value)}
              placeholder={f.placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build and commit**

```bash
npm run build && git add src/inviteflow/tabs/SetupTab.tsx && git commit -m "feat(v3.1): SetupTab — Tailwind classes, responsive stacked form"
```

---

## Task 7: InviteesTab + ContactScoutPanel

**Files:**
- Modify: `src/inviteflow/tabs/InviteesTab.tsx`
- Modify: `src/inviteflow/components/ContactScoutPanel.tsx`

### InviteesTab

- [ ] **Step 1: Replace InviteesTab.tsx**

Key changes: all inline styles → Tailwind, DataTable wrapped in `overflow-x-auto`, modal uses `max-w-sm w-full mx-4`.

```tsx
import { useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { getToken } from '../api/auth';
import { sheetsGet, extractSheetId } from '../api/sheets';
import type { Invitee } from '../types';
import ContactScoutPanel from '../components/ContactScoutPanel';

function makeInvitee(partial: Partial<Invitee> = {}): Invitee {
  return {
    id: crypto.randomUUID(),
    firstName: '',
    lastName: '',
    title: '',
    category: '',
    email: '',
    rsvpLink: '',
    inviteStatus: 'pending',
    sentAt: '',
    rsvpStatus: 'No Response',
    rsvpDate: '',
    notes: '',
    ...partial,
  };
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-gray-500 dark:text-[#6e7681]',
  sent: 'text-green-600 dark:text-[#3fb950]',
  failed: 'text-red-600 dark:text-[#f85149]',
};
const RSVP_COLORS: Record<string, string> = {
  'No Response': 'text-gray-500 dark:text-[#6e7681]',
  Attending: 'text-green-600 dark:text-[#3fb950]',
  Declined: 'text-red-600 dark:text-[#f85149]',
};

const INPUT = "w-full bg-white border border-gray-300 text-gray-900 text-xs font-mono px-2.5 py-1.5 rounded outline-none focus:border-blue-500 dark:bg-[#0d1117] dark:border-[#21262d] dark:text-[#c9d1d9]";

export default function InviteesTab() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState<Invitee[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<Partial<Invitee>>({});
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const ev = state.events.find(e => e.id === state.activeEventId);

  async function importFromSheets() {
    if (!sheetsUrl.trim()) return;
    setImporting(true);
    setImportStatus('');
    try {
      const token = await getToken('spreadsheets');
      const id = extractSheetId(sheetsUrl);
      const rows = await sheetsGet(token, id, 'Sheet1!A:K');
      if (rows.length < 2) { setImportStatus('Sheet appears empty (need header + data rows).'); return; }
      const [header, ...data] = rows;
      const col = (name: string) => header.findIndex(h => h.trim().toLowerCase() === name.toLowerCase());
      const ci = { fn: col('FirstName'), ln: col('LastName'), title: col('Title'), cat: col('Category'), email: col('Email'), rsvp: col('RSVP_Link'), sent: col('InviteSent'), sentDate: col('InviteSentDate'), rsvpStatus: col('RSVP_Status'), rsvpDate: col('RSVP_Date'), notes: col('Notes') };

      const incoming = data.map(r => makeInvitee({
        firstName: r[ci.fn] ?? '',
        lastName: r[ci.ln] ?? '',
        title: r[ci.title] ?? '',
        category: r[ci.cat] ?? '',
        email: r[ci.email] ?? '',
        rsvpLink: r[ci.rsvp] ?? '',
        inviteStatus: r[ci.sent]?.toLowerCase() === 'true' ? 'sent' : 'pending',
        sentAt: r[ci.sentDate] ?? '',
        rsvpStatus: (['Attending', 'Declined'].includes(r[ci.rsvpStatus]) ? r[ci.rsvpStatus] : 'No Response') as Invitee['rsvpStatus'],
        rsvpDate: r[ci.rsvpDate] ?? '',
        notes: r[ci.notes] ?? '',
      })).filter(i => i.email);

      const merged = [...state.invitees];
      for (const inc of incoming) {
        const idx = merged.findIndex(m => m.email.toLowerCase() === inc.email.toLowerCase());
        if (idx >= 0) merged[idx] = { ...merged[idx], ...inc, id: merged[idx].id };
        else merged.push(inc);
      }
      dispatch({ type: 'SET_INVITEES', invitees: merged });
      setImportStatus(`Imported ${incoming.length} rows (${merged.length - state.invitees.length} new, rest merged).`);
    } catch (e) {
      setImportStatus('Error: ' + String(e));
    } finally {
      setImporting(false);
    }
  }

  function importJSON(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result as string) as Array<Record<string, string>>;
        const parsed = raw.map(r => {
          const full = r.name ?? `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim();
          const parts = full.split(' ');
          return makeInvitee({
            firstName: r.firstName ?? parts[0] ?? '',
            lastName: r.lastName ?? parts.slice(1).join(' ') ?? '',
            title: r.title ?? '',
            category: r.category ?? '',
            email: r.email ?? '',
          });
        }).filter(i => i.email);
        const merged = [...state.invitees];
        for (const inc of parsed) {
          const idx = merged.findIndex(m => m.email.toLowerCase() === inc.email.toLowerCase());
          if (idx < 0) merged.push(inc);
        }
        dispatch({ type: 'SET_INVITEES', invitees: merged });
        setImportStatus(`JSON import: ${parsed.length} rows.`);
      } catch (e) { setImportStatus('JSON parse error: ' + String(e)); }
    };
    reader.readAsText(file);
  }

  function exportCSV() {
    const header = 'FirstName,LastName,Title,Category,Email,RSVP_Link,InviteSent,InviteSentDate,RSVP_Status,RSVP_Date,Notes';
    const rows = state.invitees.map(i =>
      [i.firstName, i.lastName, i.title, i.category, i.email, i.rsvpLink, i.inviteStatus === 'sent' ? 'TRUE' : 'FALSE', i.sentAt, i.rsvpStatus, i.rsvpDate, i.notes]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `invitees-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function addManually() {
    if (!draft.email) return;
    dispatch({ type: 'ADD_INVITEE', invitee: makeInvitee(draft) });
    setDraft({});
    setShowAdd(false);
  }

  function buildRsvpLink(inv: Invitee) {
    if (!ev?.formUrl || !ev?.entryEmail) return '';
    return `${ev.formUrl}?${ev.entryEmail}=${encodeURIComponent(inv.email)}`;
  }

  function generateAllRsvpLinks() {
    const updated = state.invitees.map(i => ({ ...i, rsvpLink: i.rsvpLink || buildRsvpLink(i) }));
    dispatch({ type: 'SET_INVITEES', invitees: updated });
  }

  function bulkMarkSent() {
    const ids = new Set(selected.map(s => s.id));
    const updated = state.invitees.map(i => ids.has(i.id) ? { ...i, inviteStatus: 'sent' as const, sentAt: new Date().toISOString() } : i);
    dispatch({ type: 'SET_INVITEES', invitees: updated });
    setSelected([]);
  }

  function bulkReset() {
    const ids = new Set(selected.map(s => s.id));
    const updated = state.invitees.map(i => ids.has(i.id) ? { ...i, inviteStatus: 'pending' as const, sentAt: '' } : i);
    dispatch({ type: 'SET_INVITEES', invitees: updated });
    setSelected([]);
  }

  function bulkDelete() {
    if (!confirm(`Delete ${selected.length} invitee(s)?`)) return;
    dispatch({ type: 'DELETE_INVITEES', ids: selected.map(s => s.id) });
    setSelected([]);
  }

  return (
    <div className="flex flex-col h-full px-4 py-3 gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-bold tracking-[0.08em] text-gray-900 mr-2 dark:text-[#f0f6fc]">
          INVITEES <span className="text-[10px] text-gray-500 dark:text-[#6e7681]">({state.invitees.length})</span>
        </span>
        <button onClick={() => setShowAdd(true)} className="min-h-[44px] px-3 py-1 rounded border border-green-600 bg-green-600 text-white text-xs font-mono tracking-wide cursor-pointer hover:bg-green-700 dark:border-[#238636] dark:bg-[#238636]">+ Add</button>
        <button onClick={exportCSV} className="min-h-[44px] px-3 py-1 rounded border border-gray-300 bg-transparent text-gray-700 text-xs font-mono tracking-wide cursor-pointer hover:bg-gray-100 dark:border-[#21262d] dark:text-[#8b949e] dark:hover:bg-[#161b22]">Export CSV</button>
        <button onClick={generateAllRsvpLinks} className="min-h-[44px] px-3 py-1 rounded border border-gray-300 bg-transparent text-gray-700 text-xs font-mono tracking-wide cursor-pointer hover:bg-gray-100 dark:border-[#21262d] dark:text-[#8b949e] dark:hover:bg-[#161b22]">Gen RSVP Links</button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={e => e.target.files?.[0] && importJSON(e.target.files[0])} />
        <button onClick={() => fileRef.current?.click()} className="min-h-[44px] px-3 py-1 rounded border border-gray-300 bg-transparent text-gray-700 text-xs font-mono tracking-wide cursor-pointer hover:bg-gray-100 dark:border-[#21262d] dark:text-[#8b949e] dark:hover:bg-[#161b22]">Import JSON</button>
      </div>

      {/* Sheets import row */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          className="flex-1 min-w-[200px] bg-white border border-gray-300 text-gray-900 text-xs font-mono px-2.5 py-1.5 rounded outline-none focus:border-blue-500 dark:bg-[#0d1117] dark:border-[#21262d] dark:text-[#c9d1d9]"
          placeholder="Paste Google Sheets URL to import…"
          value={sheetsUrl}
          onChange={e => setSheetsUrl(e.target.value)}
        />
        <button
          onClick={importFromSheets}
          disabled={importing}
          className="min-h-[44px] px-3 py-1 rounded border border-blue-400 bg-transparent text-blue-600 text-xs font-mono tracking-wide cursor-pointer hover:bg-blue-50 dark:border-[#58a6ff] dark:text-[#58a6ff] dark:hover:bg-[#0d1f3c] disabled:opacity-50"
        >
          {importing ? 'Importing…' : 'Import Sheets'}
        </button>
        {importStatus && (
          <span className={`text-[10px] ${importStatus.startsWith('Error') ? 'text-red-600 dark:text-[#f85149]' : 'text-green-600 dark:text-[#3fb950]'}`}>
            {importStatus}
          </span>
        )}
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center bg-white border border-gray-200 rounded-lg px-3 py-2 dark:bg-[#0d1117] dark:border-[#21262d]">
          <span className="text-[10px] text-[#C8A84B]">{selected.length} selected</span>
          <button onClick={bulkMarkSent} className="min-h-[44px] px-3 py-1 rounded border border-gray-300 bg-transparent text-green-600 text-xs font-mono cursor-pointer hover:bg-gray-100 dark:border-[#21262d] dark:hover:bg-[#161b22]">Mark Sent</button>
          <button onClick={bulkReset} className="min-h-[44px] px-3 py-1 rounded border border-gray-300 bg-transparent text-gray-600 text-xs font-mono cursor-pointer hover:bg-gray-100 dark:border-[#21262d] dark:text-[#8b949e] dark:hover:bg-[#161b22]">Reset Status</button>
          <button onClick={() => dispatch({ type: 'SET_TAB', tab: 'send' })} className="min-h-[44px] px-3 py-1 rounded border border-green-500 bg-transparent text-green-600 text-xs font-mono cursor-pointer hover:bg-green-50 dark:border-[#3fb950] dark:text-[#3fb950]">Send Selected →</button>
          <button onClick={bulkDelete} className="min-h-[44px] px-3 py-1 rounded border border-red-500 bg-transparent text-red-600 text-xs font-mono cursor-pointer hover:bg-red-50 dark:border-[#f85149] dark:text-[#f85149]">Delete</button>
        </div>
      )}

      {/* DataTable — overflow-x-auto for mobile scroll */}
      <div
        className="flex-1 overflow-hidden"
        role="region"
        aria-label="Invitees table"
        tabIndex={0}
      >
        <div className="overflow-x-auto h-full">
          <DataTable
            value={state.invitees}
            selection={selected}
            onSelectionChange={e => setSelected(e.value as Invitee[])}
            selectionMode="multiple"
            dataKey="id"
            scrollable
            scrollHeight="flex"
            virtualScrollerOptions={{ itemSize: 36 }}
            size="small"
            filterDisplay="row"
            emptyMessage="No invitees yet."
            style={{ fontSize: 11, minWidth: 700 }}
            onRowEditComplete={e => dispatch({ type: 'UPDATE_INVITEE', invitee: e.newData as Invitee })}
            editMode="row"
          >
            <Column selectionMode="multiple" style={{ width: 40 }} />
            <Column field="firstName" header="First" sortable filter filterPlaceholder="Search" style={{ minWidth: 90 }} />
            <Column field="lastName" header="Last" sortable filter filterPlaceholder="Search" style={{ minWidth: 90 }} />
            <Column field="title" header="Title" sortable style={{ minWidth: 120 }} />
            <Column field="category" header="Category" sortable filter filterPlaceholder="Filter" style={{ minWidth: 100 }} />
            <Column field="email" header="Email" sortable style={{ minWidth: 160 }} />
            <Column
              field="inviteStatus"
              header="Status"
              sortable
              filter
              filterPlaceholder="Filter"
              style={{ minWidth: 90 }}
              body={(r: Invitee) => (
                <span className={`text-[10px] tracking-[0.07em] font-mono ${STATUS_COLORS[r.inviteStatus] ?? 'text-gray-500'}`}>
                  {r.inviteStatus.toUpperCase()}
                </span>
              )}
            />
            <Column field="sentAt" header="Sent At" sortable style={{ minWidth: 110 }} body={(r: Invitee) => r.sentAt ? new Date(r.sentAt).toLocaleDateString() : '—'} />
            <Column
              field="rsvpStatus"
              header="RSVP"
              sortable
              filter
              filterPlaceholder="Filter"
              style={{ minWidth: 110 }}
              body={(r: Invitee) => (
                <span className={`text-[10px] font-mono ${RSVP_COLORS[r.rsvpStatus] ?? 'text-gray-500'}`}>
                  {r.rsvpStatus}
                </span>
              )}
            />
            <Column field="notes" header="Notes" style={{ minWidth: 140 }} editor={(opts) => (
              <input className={INPUT} value={opts.value} onChange={e => opts.editorCallback?.(e.target.value)} />
            )} />
            <Column rowEditor style={{ width: 70 }} />
          </DataTable>
        </div>
      </div>

      {/* ContactScout */}
      <ContactScoutPanel />

      {/* Add manually modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/85 z-[300] flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6 w-full max-w-sm dark:bg-[#0d1117] dark:border-[#21262d]">
            <div className="text-xs font-bold text-gray-900 mb-4 dark:text-[#f0f6fc]">ADD INVITEE</div>
            {(['firstName', 'lastName', 'title', 'category', 'email'] as const).map(k => (
              <div key={k} className="mb-2.5">
                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block mb-1 dark:text-[#6e7681]">{k}</label>
                <input className={INPUT} value={String(draft[k] ?? '')} onChange={e => setDraft(d => ({ ...d, [k]: e.target.value }))} />
              </div>
            ))}
            <div className="flex gap-2 mt-4">
              <button onClick={addManually} className="min-h-[44px] px-3 py-1 rounded border border-green-600 bg-green-600 text-white text-xs font-mono cursor-pointer hover:bg-green-700 dark:border-[#238636] dark:bg-[#238636]">Add</button>
              <button onClick={() => { setShowAdd(false); setDraft({}); }} className="min-h-[44px] px-3 py-1 rounded border border-gray-300 bg-transparent text-gray-700 text-xs font-mono cursor-pointer hover:bg-gray-100 dark:border-[#21262d] dark:text-[#8b949e] dark:hover:bg-[#161b22]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### ContactScoutPanel

- [ ] **Step 2: Migrate ContactScoutPanel.tsx inline styles to Tailwind**

`ContactScoutPanel.tsx` is a large file (~500 lines). Migrate every inline style object using the same pattern as other tabs:
- Replace all `style={{ ... }}` attributes with `className="..."` Tailwind strings
- Use the same color reference table from the plan header
- Use the same button/input/label/section class strings
- The panel wrapper: `className="mt-2 border-t border-gray-200 pt-3 dark:border-[#21262d]"`
- The collapsible header button: `className="flex items-center gap-2 text-[10px] text-gray-500 tracking-widest font-mono uppercase cursor-pointer min-h-[44px] dark:text-[#6e7681]"`
- Scan target cards: `className="bg-white border border-gray-200 rounded-lg p-3 dark:bg-[#0d1117] dark:border-[#21262d]"`
- Status badges: map `pending` → `text-gray-400`, `checking`/`scanning` → `text-blue-600 dark:text-[#58a6ff]`, `done` → `text-green-600 dark:text-[#3fb950]`, `error` → `text-red-600 dark:text-[#f85149]`
- Textarea: `className="w-full bg-white border border-gray-300 text-gray-900 text-xs font-mono px-2.5 py-1.5 rounded resize-y dark:bg-[#0d1117] dark:border-[#21262d] dark:text-[#c9d1d9]"`
- Do NOT change any logic, state, API calls, or function bodies — only style attributes

- [ ] **Step 3: Build and commit**

```bash
npm run build && git add src/inviteflow/tabs/InviteesTab.tsx src/inviteflow/components/ContactScoutPanel.tsx && git commit -m "feat(v3.1): InviteesTab + ContactScoutPanel — Tailwind classes, overflow-x-auto DataTable"
```

---

## Task 8: ComposeTab

**Files:**
- Modify: `src/inviteflow/tabs/ComposeTab.tsx`

- [ ] **Step 1: Replace ComposeTab.tsx — add editor/preview mobile toggle**

```tsx
import { useEffect, useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { personalize } from '../api/gmail';

const TOKENS = [
  'FirstName', 'LastName', 'FullName', 'FullTitle',
  'EventName', 'EventDate', 'Venue', 'OrgName',
  'ContactName', 'ContactEmail',
  'VIPStart', 'VIPEnd', 'RSVP_Link', 'Date_Sent',
];

type Pane = 'editor' | 'preview';

export default function ComposeTab() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [activePane, setActivePane] = useState<Pane>('editor');

  const ev = state.events.find(e => e.id === state.activeEventId);
  const sample = state.invitees[0];

  const editor = useEditor({
    extensions: [StarterKit],
    content: state.htmlBody || '<p>Dear Honorable {{FirstName}} {{LastName}},</p><p></p><p>{{RSVP_Link}}</p>',
    onUpdate({ editor }) {
      dispatch({ type: 'SET_COMPOSE', subject: state.textSubject, html: editor.getHTML() });
    },
  });

  useEffect(() => {
    if (editor && state.htmlBody && editor.getHTML() !== state.htmlBody) {
      editor.commands.setContent(state.htmlBody, false);
    }
  }, []);

  const insertToken = useCallback((token: string) => {
    editor?.commands.insertContent(`{{${token}}}`);
  }, [editor]);

  function updateSubject(val: string) {
    dispatch({ type: 'SET_COMPOSE', subject: val, html: state.htmlBody });
  }

  const preview = ev && sample
    ? personalize(state.htmlBody, sample, ev)
    : state.htmlBody;

  const fmtBtn = (active = false) => [
    'min-h-[44px] px-2 py-1 rounded text-xs font-mono cursor-pointer',
    active
      ? 'border border-[#C8A84B] bg-[#2a1a00] text-[#C8A84B] dark:border-[#C8A84B] dark:bg-[#2a1a00] dark:text-[#C8A84B]'
      : 'border border-gray-200 bg-transparent text-gray-600 hover:bg-gray-100 dark:border-[#21262d] dark:text-[#8b949e] dark:hover:bg-[#161b22]',
  ].join(' ');

  const paneToggleBtn = (pane: Pane) => [
    'min-h-[44px] px-4 py-1 text-xs font-mono tracking-wide cursor-pointer border-b-2',
    activePane === pane
      ? 'border-blue-600 text-blue-700 dark:border-[#1f6feb] dark:text-[#58a6ff]'
      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-[#6e7681] dark:hover:text-[#8b949e]',
  ].join(' ');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="px-4 py-3 border-b border-gray-200 flex flex-col gap-2.5 dark:border-[#21262d]">
        {/* Subject line */}
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] text-gray-500 tracking-widest font-mono uppercase min-w-[56px] dark:text-[#6e7681]">SUBJECT</span>
          <input
            className="flex-1 bg-white border border-gray-300 text-gray-900 text-xs font-mono px-2.5 py-1.5 rounded outline-none focus:border-blue-500 dark:bg-[#0d1117] dark:border-[#21262d] dark:text-[#c9d1d9] dark:focus:border-[#58a6ff]"
            value={state.textSubject}
            onChange={e => updateSubject(e.target.value)}
            placeholder="You are cordially invited to {{EventName}}"
          />
        </div>
        {/* Token insert bar */}
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-[10px] text-gray-500 tracking-widest font-mono uppercase mr-1 dark:text-[#6e7681]">INSERT</span>
          {TOKENS.map(t => (
            <button key={t} className={fmtBtn()} onClick={() => insertToken(t)}>{`{{${t}}}`}</button>
          ))}
        </div>
        {/* Format bar */}
        <div className="flex flex-wrap gap-1">
          <button className={fmtBtn(editor?.isActive('bold'))} onClick={() => editor?.chain().focus().toggleBold().run()}>B</button>
          <button className={fmtBtn(editor?.isActive('italic'))} onClick={() => editor?.chain().focus().toggleItalic().run()}>I</button>
          <button className={fmtBtn(editor?.isActive('bulletList'))} onClick={() => editor?.chain().focus().toggleBulletList().run()}>• List</button>
          <button className={fmtBtn(editor?.isActive('orderedList'))} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1. List</button>
        </div>
      </div>

      {/* Mobile pane toggle (hidden on md+) */}
      <div className="flex md:hidden border-b border-gray-200 dark:border-[#21262d]">
        <button className={paneToggleBtn('editor')} onClick={() => setActivePane('editor')}>EDITOR</button>
        <button className={paneToggleBtn('preview')} onClick={() => setActivePane('preview')}>PREVIEW</button>
      </div>

      {/* Editor + Preview */}
      <div className="flex-1 overflow-hidden md:grid md:grid-cols-2">
        {/* Editor pane */}
        <div className={[
          'border-gray-200 overflow-auto p-4 dark:border-[#21262d]',
          'md:block md:border-r',
          activePane === 'editor' ? 'block' : 'hidden md:block',
        ].join(' ')}>
          <div className="text-[10px] text-gray-500 tracking-widest font-mono uppercase mb-2 dark:text-[#6e7681]">EDITOR</div>
          <EditorContent editor={editor} />
        </div>
        {/* Preview pane */}
        <div className={[
          'overflow-auto p-4 bg-gray-50 dark:bg-[#080c10]',
          activePane === 'preview' ? 'block' : 'hidden md:block',
        ].join(' ')}>
          <div className="text-[10px] text-gray-500 tracking-widest font-mono uppercase mb-2 dark:text-[#6e7681]">
            PREVIEW {sample ? `(${sample.firstName} ${sample.lastName})` : '(no invitees)'}
          </div>
          <div
            className="bg-white rounded p-4 text-gray-900 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build and commit**

```bash
npm run build && git add src/inviteflow/tabs/ComposeTab.tsx && git commit -m "feat(v3.1): ComposeTab — Tailwind classes, mobile editor/preview toggle"
```

---

## Task 9: SendTab

**Files:**
- Modify: `src/inviteflow/tabs/SendTab.tsx`

- [ ] **Step 1: Replace SendTab.tsx**

```tsx
import { useState } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { getToken } from '../api/auth';
import { buildMimeRaw, personalize, sendEmail } from '../api/gmail';
import type { Invitee } from '../types';

type Filter = 'all' | 'pending' | 'failed';

const BATCH_SIZE = 80;
const BATCH_DELAY_MS = 61000;

export default function SendTab() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [filter, setFilter] = useState<Filter>('pending');
  const [err, setErr] = useState('');

  const ev = state.events.find(e => e.id === state.activeEventId);

  const filtered = state.invitees.filter(i => {
    if (filter === 'all') return true;
    if (filter === 'pending') return i.inviteStatus === 'pending';
    return i.inviteStatus === 'failed';
  });

  async function sendBulk() {
    if (!ev) { setErr('No active event — go to Setup.'); return; }
    if (!state.htmlBody.trim()) { setErr('No email body — go to Compose.'); return; }
    if (filtered.length === 0) { setErr('No invitees match the current filter.'); return; }
    setErr('');

    dispatch({ type: 'START_SEND', total: filtered.length });

    let token: string;
    try { token = await getToken('gmail.send'); }
    catch (e) { setErr(String(e)); dispatch({ type: 'STOP_SEND' }); return; }

    const from = ev.contactEmail || 'me';
    let sent = 0;

    for (let i = 0; i < filtered.length; i++) {
      const inv = filtered[i];
      const personalizedHtml = personalize(state.htmlBody, inv, ev);
      const personalizedSubject = personalize(state.textSubject, inv, ev);
      const raw = buildMimeRaw(from, inv.email, personalizedSubject, personalizedHtml);

      try {
        await sendEmail(token, raw);
        dispatch({ type: 'UPDATE_INVITEE', invitee: { ...inv, inviteStatus: 'sent', sentAt: new Date().toISOString() } });
        dispatch({ type: 'LOG_SEND', entry: { id: crypto.randomUUID(), email: inv.email, name: `${inv.firstName} ${inv.lastName}`, status: 'sent', timestamp: new Date().toISOString() } });
      } catch (e) {
        dispatch({ type: 'UPDATE_INVITEE', invitee: { ...inv, inviteStatus: 'failed' } });
        dispatch({ type: 'LOG_SEND', entry: { id: crypto.randomUUID(), email: inv.email, name: `${inv.firstName} ${inv.lastName}`, status: 'failed', timestamp: new Date().toISOString(), error: String(e) } });
      }

      sent++;
      dispatch({ type: 'SEND_PROGRESS', current: sent });

      if (sent % BATCH_SIZE === 0 && i < filtered.length - 1) {
        await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
      }
    }

    dispatch({ type: 'STOP_SEND' });
  }

  const progress = state.sendProgress.total > 0
    ? Math.round((state.sendProgress.current / state.sendProgress.total) * 100)
    : 0;

  const filterBtn = (f: Filter) => [
    'min-h-[44px] px-3 py-1 rounded border text-xs font-mono tracking-wide cursor-pointer',
    filter === f
      ? 'border-blue-600 bg-blue-600 text-white dark:border-[#1f6feb] dark:bg-[#1f6feb]'
      : 'border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100 dark:border-[#21262d] dark:text-[#8b949e] dark:hover:bg-[#161b22]',
  ].join(' ');

  return (
    <div className="p-5 max-w-[800px] mx-auto w-full">
      <div className="text-sm font-bold tracking-[0.08em] text-gray-900 mb-4 dark:text-[#f0f6fc]">SEND</div>

      {/* Filter + Send controls */}
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest dark:text-[#6e7681]">FILTER</span>
        {(['all', 'pending', 'failed'] as Filter[]).map(f => (
          <button key={f} className={filterBtn(f)} onClick={() => setFilter(f)}>{f.toUpperCase()}</button>
        ))}
        <span className="text-[10px] text-gray-500 font-mono ml-2 dark:text-[#6e7681]">{filtered.length} invitees</span>
        <button
          onClick={sendBulk}
          disabled={state.sending}
          className="min-h-[44px] px-3 py-1 rounded border border-green-600 bg-green-600 text-white text-xs font-mono tracking-wide cursor-pointer hover:bg-green-700 dark:border-[#238636] dark:bg-[#238636] disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
        >
          {state.sending ? 'Sending…' : `Send to ${filtered.length} →`}
        </button>
      </div>

      {err && <div className="text-xs text-red-600 mb-3 dark:text-[#f85149]">{err}</div>}

      {/* Progress bar */}
      {state.sending && (
        <div className="mb-4">
          <div className="text-[10px] text-gray-500 font-mono mb-1.5 dark:text-[#6e7681]">
            {state.sendProgress.current} / {state.sendProgress.total} sent ({progress}%)
          </div>
          <div className="h-1 bg-gray-200 rounded overflow-hidden dark:bg-[#161b22]">
            <div
              className="h-full bg-[#C8A84B] rounded transition-[width_.3s]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Send log */}
      {state.sendLog.length > 0 && (
        <div>
          <div className="text-[10px] text-gray-500 tracking-widest font-mono uppercase mb-2 dark:text-[#6e7681]">SEND LOG</div>
          <div
            className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg dark:border-[#21262d]"
            role="region"
            aria-label="Send log"
            tabIndex={0}
          >
            {state.sendLog.map(entry => (
              <div key={entry.id} className="flex flex-wrap gap-2.5 items-baseline px-3 py-1.5 border-b border-gray-100 text-xs dark:border-[#161b22]">
                <span className={`text-[10px] font-mono tracking-[0.07em] min-w-[40px] ${entry.status === 'sent' ? 'text-green-600 dark:text-[#3fb950]' : 'text-red-600 dark:text-[#f85149]'}`}>
                  {entry.status.toUpperCase()}
                </span>
                <span className="text-gray-900 min-w-[140px] dark:text-[#c9d1d9]">{entry.name}</span>
                <span className="text-gray-500 flex-1 dark:text-[#6e7681]">{entry.email}</span>
                {entry.error && <span className="text-red-600 text-[10px] dark:text-[#f85149]">{entry.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {state.sendLog.length === 0 && !state.sending && (
        <div className="text-gray-500 text-xs text-center py-10 dark:text-[#6e7681]">
          No sends yet. Choose a filter and click Send.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build and commit**

```bash
npm run build && git add src/inviteflow/tabs/SendTab.tsx && git commit -m "feat(v3.1): SendTab — Tailwind classes, flex-wrap controls"
```

---

## Task 10: TrackerTab

**Files:**
- Modify: `src/inviteflow/tabs/TrackerTab.tsx`

- [ ] **Step 1: Replace TrackerTab.tsx**

```tsx
import { useAppState } from '../state/AppContext';
import type { Invitee } from '../types';

interface CategoryRow {
  category: string;
  total: number;
  sent: number;
  attending: number;
  declined: number;
  noResponse: number;
}

export default function TrackerTab() {
  const state = useAppState();
  const inv = state.invitees;

  const total = inv.length;
  const sent = inv.filter(i => i.inviteStatus === 'sent').length;
  const pending = inv.filter(i => i.inviteStatus === 'pending').length;
  const failed = inv.filter(i => i.inviteStatus === 'failed').length;
  const attending = inv.filter(i => i.rsvpStatus === 'Attending').length;
  const declined = inv.filter(i => i.rsvpStatus === 'Declined').length;
  const noResponse = inv.filter(i => i.rsvpStatus === 'No Response').length;

  const cats = Array.from(new Set(inv.map(i => i.category).filter(Boolean))).sort();
  const byCategory: CategoryRow[] = cats.map(cat => {
    const rows = inv.filter(i => i.category === cat);
    return {
      category: cat,
      total: rows.length,
      sent: rows.filter(i => i.inviteStatus === 'sent').length,
      attending: rows.filter(i => i.rsvpStatus === 'Attending').length,
      declined: rows.filter(i => i.rsvpStatus === 'Declined').length,
      noResponse: rows.filter(i => i.rsvpStatus === 'No Response').length,
    };
  });

  type StatCard = { label: string; value: number; color: string };
  const statCard = ({ label, value, color }: StatCard) => (
    <div key={label} className={`bg-white border border-gray-200 rounded-lg p-4 border-l-[3px] dark:bg-[#0d1117] dark:border-[#21262d]`} style={{ borderLeftColor: color }}>
      <div className="text-[9px] text-gray-500 tracking-[0.12em] font-mono uppercase mb-1.5 dark:text-[#6e7681]">{label}</div>
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
    </div>
  );

  if (total === 0) {
    return (
      <div className="p-10 text-center text-gray-500 text-xs dark:text-[#6e7681]">
        No invitees yet. Add them in the Invitees tab.
      </div>
    );
  }

  return (
    <div className="p-5 max-w-[900px] mx-auto w-full">
      <div className="text-sm font-bold tracking-[0.08em] text-gray-900 mb-5 dark:text-[#f0f6fc]">TRACKER</div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mb-7">
        {statCard({ label: 'TOTAL', value: total, color: '#8b949e' })}
        {statCard({ label: 'PENDING', value: pending, color: '#6e7681' })}
        {statCard({ label: 'SENT', value: sent, color: '#3fb950' })}
        {statCard({ label: 'FAILED', value: failed, color: '#f85149' })}
        {statCard({ label: 'ATTENDING', value: attending, color: '#C8A84B' })}
        {statCard({ label: 'DECLINED', value: declined, color: '#f85149' })}
        {statCard({ label: 'NO RESPONSE', value: noResponse, color: '#6e7681' })}
      </div>

      {byCategory.length > 0 && (
        <>
          <div className="text-[10px] text-gray-500 tracking-[0.12em] font-mono uppercase mb-2.5 dark:text-[#6e7681]">BY CATEGORY</div>
          <div
            className="border border-gray-200 rounded-lg overflow-x-auto dark:border-[#21262d]"
            role="region"
            aria-label="RSVP by category"
            tabIndex={0}
          >
            <table className="w-full border-collapse min-w-[500px]">
              <thead>
                <tr>
                  {['Category', 'Total', 'Sent', 'Attending', 'Declined', 'No Response'].map(h => (
                    <th key={h} className="text-[10px] text-gray-500 tracking-[0.1em] font-mono uppercase px-3 py-1.5 text-left border-b border-gray-200 dark:text-[#6e7681] dark:border-[#21262d]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {byCategory.map(row => (
                  <tr key={row.category}>
                    <td className="text-xs text-gray-900 font-mono px-3 py-1.5 border-b border-gray-100 dark:text-[#c9d1d9] dark:border-[#161b22]">{row.category}</td>
                    <td className="text-xs text-gray-900 font-mono px-3 py-1.5 border-b border-gray-100 dark:text-[#c9d1d9] dark:border-[#161b22]">{row.total}</td>
                    <td className="text-xs font-mono px-3 py-1.5 border-b border-gray-100 text-green-600 dark:text-[#3fb950] dark:border-[#161b22]">{row.sent}</td>
                    <td className="text-xs font-mono px-3 py-1.5 border-b border-gray-100 text-[#C8A84B] dark:border-[#161b22]">{row.attending}</td>
                    <td className="text-xs font-mono px-3 py-1.5 border-b border-gray-100 text-red-600 dark:text-[#f85149] dark:border-[#161b22]">{row.declined}</td>
                    <td className="text-xs font-mono px-3 py-1.5 border-b border-gray-100 text-gray-500 dark:text-[#6e7681] dark:border-[#161b22]">{row.noResponse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build and commit**

```bash
npm run build && git add src/inviteflow/tabs/TrackerTab.tsx && git commit -m "feat(v3.1): TrackerTab — Tailwind classes, responsive grid, overflow-x-auto table"
```

---

## Task 11: SyncTab

**Files:**
- Modify: `src/inviteflow/tabs/SyncTab.tsx`

- [ ] **Step 1: Replace SyncTab.tsx**

```tsx
import { useState } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { getToken } from '../api/auth';
import { sheetsGet, sheetsUpdate, sheetsClear, extractSheetId } from '../api/sheets';
import type { Invitee } from '../types';

const MASTER_COLUMNS = ['FirstName', 'LastName', 'Title', 'Category', 'Email', 'RSVP_Link', 'InviteSent', 'InviteSentDate', 'RSVP_Status', 'RSVP_Date', 'Notes'];

const GAS_CODE = `// InviteFlow v3.1 — RSVP ingest trigger
// Deploy: Extensions → Apps Script → add trigger: onFormSubmit (Form Submit)
// Set script property MASTER_SHEET_URL via Project Settings → Script Properties

function onFormSubmit(e) {
  const props = PropertiesService.getScriptProperties();
  const sheetUrl = props.getProperty('MASTER_SHEET_URL');
  if (!sheetUrl) return;

  const ss = SpreadsheetApp.openByUrl(sheetUrl);
  const sheet = ss.getSheets()[0];
  const responses = e.response.getItemResponses();

  let email = '';
  let attending = '';
  for (const r of responses) {
    const title = r.getItem().getTitle().toLowerCase();
    if (title.includes('email')) email = r.getResponse().trim();
    if (title.includes('attend') || title.includes('rsvp')) attending = r.getResponse().trim();
  }
  if (!email) return;

  const data = sheet.getDataRange().getValues();
  const header = data[0];
  const emailCol = header.indexOf('Email');
  const statusCol = header.indexOf('RSVP_Status');
  const dateCol = header.indexOf('RSVP_Date');
  if (emailCol < 0) return;

  const today = new Date().toISOString().slice(0, 10);
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][emailCol]).toLowerCase() === email.toLowerCase()) {
      if (statusCol >= 0) sheet.getRange(i + 1, statusCol + 1).setValue(attending || 'Attending');
      if (dateCol >= 0) sheet.getRange(i + 1, dateCol + 1).setValue(today);
      break;
    }
  }
}`;

export default function SyncTab() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState('');
  const [pushing, setPushing] = useState(false);
  const [pulling, setPulling] = useState(false);

  const ev = state.events.find(e => e.id === state.activeEventId);

  async function pushToSheets() {
    if (!ev?.masterSheetUrl) { setStatus('Error: Master Sheet URL not set — go to Setup.'); return; }
    setPushing(true);
    setStatus('');
    try {
      const token = await getToken('spreadsheets');
      const id = extractSheetId(ev.masterSheetUrl);
      await sheetsClear(token, id, 'Sheet1!A:K');
      const rows = state.invitees.map(i => [
        i.firstName, i.lastName, i.title, i.category, i.email, i.rsvpLink,
        i.inviteStatus === 'sent' ? 'TRUE' : 'FALSE',
        i.sentAt, i.rsvpStatus, i.rsvpDate, i.notes,
      ]);
      await sheetsUpdate(token, id, 'Sheet1!A1', [MASTER_COLUMNS, ...rows]);
      setStatus(`Pushed ${rows.length} rows to master sheet.`);
    } catch (e) {
      setStatus('Error: ' + String(e));
    } finally {
      setPushing(false);
    }
  }

  async function pullRsvp() {
    if (!ev?.rsvpResponseUrl) { setStatus('Error: RSVP Response Sheet URL not set — go to Setup.'); return; }
    setPulling(true);
    setStatus('');
    try {
      const token = await getToken('spreadsheets');
      const id = extractSheetId(ev.rsvpResponseUrl);
      const rows = await sheetsGet(token, id, 'Sheet1!A:K');
      if (rows.length < 2) { setStatus('RSVP sheet appears empty.'); return; }
      const [header, ...data] = rows;
      const emailCol = header.findIndex(h => h.toLowerCase().includes('email'));
      const statusCol = header.findIndex(h => h.toLowerCase().includes('attend') || h.toLowerCase().includes('rsvp'));
      const dateCol = header.findIndex(h => h.toLowerCase().includes('date'));
      if (emailCol < 0) { setStatus('Cannot find Email column in RSVP sheet.'); return; }

      let updated = 0;
      const invitees = state.invitees.map(inv => {
        const match = data.find(r => r[emailCol]?.toLowerCase() === inv.email.toLowerCase());
        if (!match) return inv;
        const rawStatus = match[statusCol] ?? '';
        const rsvpStatus: Invitee['rsvpStatus'] = rawStatus.toLowerCase().includes('yes') || rawStatus.toLowerCase().includes('attend')
          ? 'Attending'
          : rawStatus.toLowerCase().includes('no') || rawStatus.toLowerCase().includes('declin')
            ? 'Declined'
            : 'No Response';
        const rsvpDate = dateCol >= 0 ? (match[dateCol] ?? '') : new Date().toISOString().slice(0, 10);
        updated++;
        return { ...inv, rsvpStatus, rsvpDate };
      });
      dispatch({ type: 'SET_INVITEES', invitees });
      setStatus(`Updated ${updated} RSVP responses.`);
    } catch (e) {
      setStatus('Error: ' + String(e));
    } finally {
      setPulling(false);
    }
  }

  const SECTION = "text-[10px] text-gray-500 tracking-[0.12em] font-mono uppercase mt-5 mb-2.5 dark:text-[#6e7681]";

  return (
    <div className="p-5 max-w-[760px] mx-auto w-full">
      <div className="text-sm font-bold tracking-[0.08em] text-gray-900 mb-4 dark:text-[#f0f6fc]">SYNC</div>

      {status && (
        <div className={`text-xs mb-3.5 ${status.startsWith('Error') ? 'text-red-600 dark:text-[#f85149]' : 'text-green-600 dark:text-[#3fb950]'}`}>
          {status}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
        {/* Push card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 dark:bg-[#0d1117] dark:border-[#21262d]">
          <div className={SECTION}>PUSH TO MASTER SHEET</div>
          <div className="text-xs text-gray-500 mb-3.5 leading-relaxed dark:text-[#6e7681]">
            Clears and rewrites all {state.invitees.length} invitees to your master Google Sheet.
            {ev?.masterSheetUrl
              ? <><br /><a href={ev.masterSheetUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-[10px] dark:text-[#58a6ff]">Open sheet ↗</a></>
              : <><br /><span className="text-red-600 text-[10px] dark:text-[#f85149]">Master Sheet URL not set in Setup.</span></>
            }
          </div>
          <button
            onClick={pushToSheets}
            disabled={pushing}
            className="min-h-[44px] px-3 py-1 rounded border border-green-600 bg-green-600 text-white text-xs font-mono tracking-wide cursor-pointer hover:bg-green-700 dark:border-[#238636] dark:bg-[#238636] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pushing ? 'Pushing…' : `Push ${state.invitees.length} rows`}
          </button>
        </div>

        {/* Pull card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 dark:bg-[#0d1117] dark:border-[#21262d]">
          <div className={SECTION}>PULL RSVP RESPONSES</div>
          <div className="text-xs text-gray-500 mb-3.5 leading-relaxed dark:text-[#6e7681]">
            Reads RSVP statuses from your response sheet and updates invitee records.
            {ev?.rsvpResponseUrl
              ? <><br /><a href={ev.rsvpResponseUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-[10px] dark:text-[#58a6ff]">Open sheet ↗</a></>
              : <><br /><span className="text-red-600 text-[10px] dark:text-[#f85149]">RSVP Response Sheet URL not set in Setup.</span></>
            }
          </div>
          <button
            onClick={pullRsvp}
            disabled={pulling}
            className="min-h-[44px] px-3 py-1 rounded border border-blue-400 bg-transparent text-blue-600 text-xs font-mono tracking-wide cursor-pointer hover:bg-blue-50 dark:border-[#58a6ff] dark:text-[#58a6ff] dark:hover:bg-[#0d1f3c] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pulling ? 'Pulling…' : 'Pull RSVP Responses'}
          </button>
        </div>
      </div>

      <div className={SECTION}>GAS RSVP INGEST TRIGGER</div>
      <div className="text-xs text-gray-500 leading-relaxed mb-3 dark:text-[#6e7681]">
        Paste this script into your Google Form&rsquo;s Apps Script project. Add a trigger on{' '}
        <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-[10px] dark:bg-[#161b22] dark:text-[#c9d1d9]">onFormSubmit</code>{' '}
        (Form Submit event). Set script property{' '}
        <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-[10px] dark:bg-[#161b22] dark:text-[#c9d1d9]">MASTER_SHEET_URL</code>{' '}
        to your master sheet URL.
      </div>
      <div className="relative">
        <pre
          className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3.5 text-[10px] text-gray-800 overflow-x-auto leading-relaxed font-mono dark:bg-[#0d1117] dark:border-[#21262d] dark:text-[#c9d1d9]"
          role="region"
          aria-label="Google Apps Script code"
          tabIndex={0}
        >
          {GAS_CODE}
        </pre>
        <button
          className="absolute top-2 right-2 min-h-[44px] px-3 py-1 rounded border border-gray-300 bg-transparent text-gray-600 text-xs font-mono cursor-pointer hover:bg-gray-100 dark:border-[#21262d] dark:text-[#8b949e] dark:hover:bg-[#161b22]"
          onClick={() => { navigator.clipboard.writeText(GAS_CODE); setStatus('Copied GAS code to clipboard.'); }}
        >
          Copy
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build and commit**

```bash
npm run build && git add src/inviteflow/tabs/SyncTab.tsx && git commit -m "feat(v3.1): SyncTab — Tailwind classes, responsive 2-col sync cards"
```

---

## Task 12: Version Bump + Git Tag

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Update package.json version and name**

Edit `package.json` — change `"name"` and `"version"`:

```json
{
  "name": "inviteflow-v3.1",
  "version": "3.1.0",
  ...
}
```

(Leave all other fields unchanged.)

- [ ] **Step 2: Final build**

```bash
npm run build
```

Expected: PASS. Verify no TypeScript errors, no missing module errors.

- [ ] **Step 3: Commit version bump**

```bash
git add package.json package-lock.json
git commit -m "chore(v3.1): bump version to 3.1.0"
```

- [ ] **Step 4: Create annotated git tag**

```bash
git tag -a v3.1.0 -m "InviteFlow v3.1.0 — responsive mobile-first, light/dark theme, Tailwind CSS"
```

- [ ] **Step 5: Final smoke-test checklist**

Run `npm run dev`, open `http://localhost:5173/src/inviteflow/index.html`, and verify:

- [ ] Light theme loads on first visit
- [ ] ☾ button switches to dark mode; ☀ switches back; preference survives page reload
- [ ] At < 768px width: hamburger ☰ shows; desktop tabs hidden
- [ ] Drawer opens, closes on backdrop tap and tab select
- [ ] All 7 tabs render without white boxes or unstyled elements
- [ ] ComposeTab: EDITOR/PREVIEW toggle visible on mobile; both panes show on desktop
- [ ] InviteesTab: DataTable scrolls horizontally on narrow viewport
- [ ] TrackerTab: category table scrolls horizontally on narrow viewport
- [ ] SyncTab: two sync cards stack to single column on narrow viewport
- [ ] All buttons meet 44px minimum height (inspect with browser devtools)
