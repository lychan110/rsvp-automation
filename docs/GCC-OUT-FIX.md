# GCC-OUT Fix: SMTP Email Integration

## Problem

Current implementation uses `VITE_GMAIL_API_KEY` which requires Google Cloud Console — violates the GCC-OUT goal.

## Solution: Gmail App Password (Option B)

**Problem:** Browser-based apps cannot directly use SMTP due to CORS and security restrictions. A server-side relay is needed.

**Option B实际情况 (Two choices):**

1. **Add a tiny relay server** — Self-hosted minimal server (Express/Node) that accepts requests from your app and forwards via SMTP using the App Password. This adds complexity.

2. **Use Resend + Gmail inbox** (Recommended) — Send via Resend API, set Gmail as the receiving inbox. True GCC-free, free tier 3k/month, 5 min setup.

Want to proceed with Resend instead? It's actually simpler and meets the "zero Google dependencies" goal.

---

## Implementation Plan

### Task 1: Add SMTP Config to .env

**File:** `.env`

Add:
```
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your-email@gmail.com
VITE_SMTP_PASS=xxxx xxxx xxxx xxxx
```

---

### Task 2: Create SMTP Email Service

**File:** `src/inviteflow/api/email.ts`

Replace/extend the current `gmail.ts`:

```typescript
import type { AppEvent, Invitee } from '../types';

const SMTP_HOST = import.meta.env.VITE_SMTP_HOST;
const SMTP_PORT = import.meta.env.VITE_SMTP_PORT;
const SMTP_USER = import.meta.env.VITE_SMTP_USER;
const SMTP_PASS = import.meta.env.VITE_SMTP_PASS;

function toBase64Url(s: string): string {
  return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function buildMimeRaw(from: string, to: string, subject: string, htmlBody: string): string {
  const mime = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    htmlBody,
  ].join('\r\n');
  return toBase64Url(mime);
}

export function personalize(template: string, invitee: Invitee, event: AppEvent): string {
  const now = new Date();
  const dateSent = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return template
    .replace(/\{\{FirstName\}\}/g, invitee.firstName)
    .replace(/\{\{LastName\}\}/g, invitee.lastName)
    .replace(/\{\{FullName\}\}/g, `${invitee.firstName} ${invitee.lastName}`)
    .replace(/\{\{FullTitle\}\}/g, invitee.title)
    .replace(/\{\{EventName\}\}/g, event.name)
    .replace(/\{\{EventDate\}\}/g, event.date)
    .replace(/\{\{Venue\}\}/g, event.venue)
    .replace(/\{\{RSVP_Link\}\}/g, invitee.rsvpLink)
    .replace(/\{\{OrgName\}\}/g, event.orgName)
    .replace(/\{\{ContactName\}\}/g, event.contactName)
    .replace(/\{\{ContactEmail\}\}/g, event.contactEmail)
    .replace(/\{\{VIPStart\}\}/g, event.vipStart)
    .replace(/\{\{VIPEnd\}\}/g, event.vipEnd)
    .replace(/\{\{Date_Sent\}\}/g, dateSent);
}

export async function sendEmail(to: string, raw: string): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: `${event.orgName} Invites <onboarding@resend.dev>`,
      to: [to],
      html: htmlBody,
      subject: subject,
    }),
  });
}

// TODO: Replace with actual SMTP implementation via a Node.js backend or
// using a client-side SMTP library like 'emailjs-com'.
// For now, this is a stub that shows the interface.
```

Actually, for SMTP from a browser, we need a server-side component or a service like Resend/SendGrid. The browser cannot directly send SMTP due to CORS and security restrictions.

**Revised approach:** Use Resend (free tier) which is the simplest non-GCC option.

---

## Alternative: Resend (Simpler)

**No Google dependencies at all.**

1. Sign up at resend.com
2. Get API key
3. Add to .env: `VITE_RESEND_API_KEY=re_xxxxx`
4. Update email.ts to use Resend API

This is cleaner and truly GCC-free.

---

## Let's do Resend instead

Want me to create a Resend implementation plan? It's simpler, free (3k/month), and has no Google ties.