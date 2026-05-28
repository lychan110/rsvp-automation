# Convene · Roster — Engineering Handoff

This file documents the design system and the gaps the design left for
implementation. Use this when wiring real data and APIs into the prototype.

## Design system: where things live

All shared building blocks for the Roster (phone B) direction are defined at
the top of `roster.jsx`:

| Symbol           | What it is                                                                |
| ---------------- | ------------------------------------------------------------------------- |
| `RT`             | Design tokens. Spacing, type, radii. Mutate here, never inline.            |
| `R_LIGHT`/`R_DARK` | Color palettes (light/dark).                                            |
| `rPalette(dark)` | Returns the palette to use given current mode.                            |
| `<PageHeader>`   | Universal header. Back button · eyebrow + italic serif title · right action. |
| `<HeaderAction>` | Square bordered icon button (right-side action, e.g. menu, filter).       |
| `<MetaLine>`     | Mono caps run with status dot, used right under the header.               |
| `<SectionEyebrow>` | Small mono caps label above a Card (with optional count).               |
| `<Card>`         | Bordered surface container; renders children with hairline separators.    |
| `<CardRow>`      | Canonical row inside a Card — chip · title · sub · right · chevron.       |
| `<RowChip>`      | Square chip used in a CardRow's left slot (number or icon, optionally filled). |
| `<ActivityRow>`  | Row in a "Recent activity" feed: time · type stamp · sentence.            |
| `<FieldLabel>`   | Mono caps label above an input.                                           |
| `<FieldInput>`   | Bordered input/textarea matching surfaces.                                |
| `<StatChip>`     | Small bordered tile: mono caps label + serif value.                       |
| `<StatusPill>`   | Mono caps pill used as right-side status indicator.                       |
| `<TabSwitcher>`  | Pill toggle (edit/preview, pre-flight/batches/log).                       |
| `<FilterChip>`   | Mono caps pill used in horizontal filter rows.                            |
| `<PrimaryButton>`| Sticky-bottom primary CTA (terracotta).                                   |

### Rules
1. **Never hardcode spacing, type, or color.** Always reach for `RT.*` and
   `p.*` (the palette). If you find yourself writing `padding: '14px 18px'`,
   that's `RT.rowPad` (or extend `RT`).
2. **Never duplicate a row pattern.** If something looks like a row in a
   card, it should be a `<CardRow>`. If it can't be one because it has
   custom controls, *inherit*: build a thin wrapper that returns a
   `<CardRow>` with a custom `right` slot.
3. **Headers are italic everywhere.** `RT.headerTitle.fontStyle = 'italic'`
   is the single source of truth. Do not pass an italic span as `title`.
4. **Hamburger is universal.** `<PageHeader>` defaults `right` to a menu
   button that navigates to `r-settings`. Pass `right={<...>}` to override
   (e.g. status pill on Compose, filter on Track). Pass `right={null}` to
   hide entirely (Settings itself does this).

## Routes

Wire in `app.jsx`'s `__convene_navigate` handler. Roster keys:

| Key          | Component         | Notes                                |
| ------------ | ----------------- | ------------------------------------ |
| `r-events`   | `<RosterEvents>`  | Landing — list of events             |
| `r-home`     | `<RosterHome>`    | Event dashboard (one event)          |
| `r-event-X`  | `<RosterHome>`    | Same; X is the event id (TODO: fetch by id) |
| `r-scout`    | `<RosterScout>`   | Find more officials                  |
| `r-compose`  | `<RosterCompose>` | Template editor                      |
| `r-send`     | `<RosterSend>`    | Bulk send (scaffold)                 |
| `r-track`    | `<RosterTracker>` | RSVP roster                          |
| `r-settings` | `<RosterSettings>`| Account & defaults                   |

## TODO for engineering

Search for `TODO[claude-code]` in source. Current items:

### `RosterSend` (scaffold only)
- Wire **sender connection** to Gmail OAuth flow (`account.email`,
  `account.provider`, `account.dailyCap`, `account.sentToday`).
- Wire **pre-flight checks** to real validators:
  - Sender connected → OAuth status
  - Template saved → template state from Compose store
  - Recipients validated → contact list missing-email count
  - Daily quota → live `sentToday/dailyCap` from provider
- Wire **batch list** to scheduler. Batch sizing must respect Gmail's
  per-second rate limit; current scaffold is purely visual.
- Wire **schedule "send now" / "schedule for later"** radio to scheduler.
  When "Schedule for later" is picked, replace the chevron with a
  date/time picker (use `<FieldInput>` for now; ideal: a custom
  popover that fits the visual language — tracked in design backlog).
- Wire **log tab** to delivery log API. Each entry is a `<CardRow>`
  with chip = status icon, title = recipient, sub = timestamp.
- Wire **PrimaryButton** to actually trigger the send.

### `RosterSettings`
- Wire **Mail provider** row to OAuth manage screen.
- Wire **Daily quota** to provider tier; the value is currently static.
- Wire **Dark mode** row to actually toggle dark mode (currently it
  reflects the prop only — the toggle lives in the design canvas Tweaks).
  When implementing as a real setting, pull from user preferences and
  persist back via your settings API. Replace `<StatusPill>` with a
  proper toggle (extend the design system; suggested name: `<TweakInline>`).
- Wire **Export** to actually download CSV/JSON.
- Wire **Import** to a contacts importer modal.

### `RosterHome` (event dashboard)
- Wire **stats card** to real numbers (currently `47 / 18 / 12`).
- Wire **+3 new replies today** delta footer to a live diff vs.
  yesterday's snapshot.
- Wire **workflow row counts** (`47 ready`, `0 sent`, etc.) to live data.

### `RosterEvents` (landing)
- Wire event list to backend; current 4 events are static.
- Search affordance was removed — add it back as a `<HeaderAction icon="search"/>`
  *if* you want; Settings is currently the only right-action target.

### Cross-cutting
- The dark-mode toggle is a Tweak (canvas-level), not a real preference.
  Connect Settings → user prefs → app shell theme.
- All routes use a global `window.__convene_navigate` shim because the
  design canvas hosts three phones at once. In a real app, this becomes
  a proper router (React Router / Next.js).

## Conventions

- **Files** are kept under ~1000 lines each. If `roster.jsx` outgrows
  this, extract per-screen files (`roster/send.jsx`, `roster/settings.jsx`)
  and `Object.assign(window, …)` them the same way.
- **No inline `padding: '0 18px ...'`** — use `RT.pagePadX` or `RT.cardMargin`.
- **No inline `border: '1px solid #...'`** — read from `p.rule` or `p.rule2`.
- **No new font-stack strings inline.** If you need a new one, add it
  to `RT.fontXxx` and reuse.
