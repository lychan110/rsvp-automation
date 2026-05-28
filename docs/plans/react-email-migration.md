# React Email Migration Plan — InviteFlow

## Goal
Replace TipTap drag-and-drop HTML templating with React Email components. Zero lock-in to Resend — render locally, send via any provider.

## Current Architecture
- `ComposeTab.tsx`: TipTap editor → stores raw HTML in `state.htmlBody`
- `email.ts`: `personalize()` does string `{{Token}}` replacement on raw HTML
- `SendTab.tsx`: loops invitees, calls `personalize()` + `sendEmail()`

## New Architecture
```
ComposeTab: template selector + param form → state.templateId + state.templateParams
SendTab:    for each invitee → renderTemplate(templateId, event, invitee) → HTML → sendEmail()
```

## Files to Change

### New
| File | Purpose |
|------|---------|
| `src/inviteflow/emails/render.ts` | `renderTemplate()` — async render React Email → HTML string |
| `src/inviteflow/emails/BaseLayout.tsx` | Shared wrapper: Asian Focus header/footer/signature |
| `src/inviteflow/emails/AsiaFestInvite.tsx` | Asia Fest 2026 red-themed template |
| `src/inviteflow/emails/GenericInvite.tsx` | Simple fallback template |
| `src/inviteflow/emails/index.ts` | Template registry + exports |

### Modified
| File | Change |
|------|--------|
| `package.json` | Add `@react-email/components`, `@react-email/render` |
| `src/inviteflow/types.ts` | Add `templateId`, `templateParams` to `AppState` |
| `src/inviteflow/state/actions.ts` | Add `SET_TEMPLATE` action |
| `src/inviteflow/state/reducer.ts` | Handle `SET_TEMPLATE`, persist to IndexedDB |
| `src/inviteflow/tabs/ComposeTab.tsx` | Remove TipTap. Template picker + param inputs + live preview |
| `src/inviteflow/tabs/SendTab.tsx` | Use `renderTemplate()` instead of `personalize()` |
| `src/inviteflow/api/email.ts` | Add `renderTemplate()`; keep `personalize()` for backward compat |

## Backward Compatibility
- If `state.templateId` is null/empty, fall back to legacy `state.htmlBody` + `personalize()`
- Existing saved events continue to work

## Token Strategy
React Email templates receive typed props (`event`, `invitee`) instead of string replacement. No more `{{Token}}` regex in the new pipeline.

## Render Pipeline
```ts
import { renderAsync } from '@react-email/render';

export async function renderTemplate(id: string, event: AppEvent, invitee: Invitee) {
  const Template = TEMPLATES[id];
  const html = await renderAsync(<Template event={event} invitee={invitee} />);
  return html;
}
```

## UI Changes in ComposeTab
1. **Template selector** dropdown (Asia Fest 2026, Generic, Legacy HTML)
2. **Param editor** — text inputs for template-specific fields (greeting, body paragraphs, etc.)
3. **Live preview** — rendered HTML in a white `<div>` (same as current preview pane)
4. **Subject editor** — kept as-is

## Lock-in Analysis
- `@react-email/components` is provider-agnostic. Swap `sendEmail()` to Mailgun/SendGrid/SES → zero template changes.
- Templates are local `.tsx` files, not hosted on Resend.
- Only dependency is React itself.
