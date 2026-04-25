import type { AppEvent, Invitee } from '../types';

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

async function fetchWithBackoff(url: string, init: RequestInit, maxRetries = 5): Promise<Response> {
  let delay = 2000;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, init);
    if (res.status !== 429 && res.status !== 503) return res;
    if (attempt === maxRetries) return res;
    const jitter = delay * 0.2 * (Math.random() * 2 - 1);
    await new Promise(r => setTimeout(r, delay + jitter));
    delay = Math.min(delay * 2, 64000);
  }
  throw new Error('Unreachable');
}

export async function sendEmail(token: string, raw: string): Promise<void> {
  const res = await fetchWithBackoff('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gmail send error ${res.status}: ${text}`);
  }
}
