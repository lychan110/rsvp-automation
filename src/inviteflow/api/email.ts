import type { AppEvent, Invitee } from '../types';

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;

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

export async function sendEmail(
  from: string,
  to: string,
  subject: string,
  html: string
): Promise<void> {
  if (!RESEND_API_KEY) {
    throw new Error('Resend API key not configured. Add VITE_RESEND_API_KEY to .env');
  }

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

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend error ${response.status}: ${error}`);
  }
}