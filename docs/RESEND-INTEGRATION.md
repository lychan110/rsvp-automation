# Resend Integration Plan

## Steps

### Task 1: Add Resend API Key to .env

Add to `.env`:
```
VITE_RESEND_API_KEY=re_xxxxxxxxxxxx
```

*(User needs to get this from resend.com)*

---

### Task 2: Update email.ts

**File:** Replace `src/inviteflow/api/gmail.ts` with `src/inviteflow/api/email.ts`

Use Resend API:
```typescript
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;

export async function sendEmail(from: string, to: string, subject: string, html: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    }),
  });
  if (!response.ok) throw new Error(`Resend error: ${response.status}`);
}
```

Keep `buildMimeRaw`, `personalize` functions (rename/modify as needed).

---

### Task 3: Update SendTab imports

Update `SendTab.tsx` to import from `email.ts` instead of `gmail.ts`.

---

### Task 4: Verify build

Run `npm run build` and fix any issues.

---

## Get Resend API Key

1. Go to https://resend.com
2. Sign up (free — 3,000 emails/month)
3. Go to "API Keys" → Create key
4. Copy and add to .env as above