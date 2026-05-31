// Single source of truth for Quick Start guide content
// Merged from HelpPage.tsx and docs/QUICKSTART.md

export interface HelpSection {
  id: string;
  label: string;
  content?: string;
  steps?: Array<{ num: string; title: string; body: string }>;
  tokens?: Array<[string, string]>;
  bullets?: string[];
}

export const helpSections: HelpSection[] = [
  {
    id: 'what',
    label: 'WHAT IS INVITEFLOW?',
    content: 'InviteFlow manages VIP event invitations end-to-end — from drafting personalized emails to tracking RSVPs. All data stays in your browser or Google account; nothing is stored on external servers.',
  },
  {
    id: 'workflow',
    label: 'THE WORKFLOW',
    steps: [
      {
        num: '01',
        title: 'Create an Event',
        body: 'Set up your event details — name, date, venue, organization, contact name and email. Save to create the event. You can also optionally connect a Google Sheet for your guest list and a Google Form for RSVP tracking.',
      },
      {
        num: '02',
        title: 'Add Invitees',
        body: 'Add guests manually, import from a CSV or JSON file, or pull from an existing Google Sheet. Each guest needs an email address. You can assign titles, categories, and notes.',
      },
      {
        num: '03',
        title: 'Compose Email',
        body: 'Write your invitation email using {{template tokens}} like {{FirstName}}, {{EventDate}}, or {{Venue}}. InviteFlow merges each guest\'s data before sending. Preview your emails to verify they look correct.',
      },
      {
        num: '04',
        title: 'Send Invitations',
        body: 'Send invitations in batches with automatic rate limiting. Track which invitations were sent and which failed. Monitor opens and RSVP responses in the Tracker tab.',
      },
      {
        num: '05',
        title: 'Discover Officials (Optional)',
        body: 'Use the Discover page to find and verify elected officials for your jurisdiction. Configure your AI provider API key, endpoint, and web search key in Settings, then run scans. Add discovered officials directly to your invitees.',
      },
    ],
  },
  {
    id: 'setup',
    label: 'BEFORE YOU START',
    steps: [
      {
        num: '01',
        title: 'Configure Event Details',
        body: 'Go to Setup tab and fill in: Event name, date, venue, organization, contact name and email. Save. Your event is now stored in your browser.',
      },
      {
        num: '02',
        title: 'Prepare Your Guest List',
        body: 'Add guests manually via the Invitees tab, or import from a CSV file (columns: FirstName, LastName, Email, Title, Category, Notes). Email is required for all guests.',
      },
      {
        num: '03',
        title: 'Set Up Compose Email',
        body: 'Go to Compose tab and write your invitation template. Use {{template tokens}} to personalize. Preview before sending to verify token replacement works correctly.',
      },
      {
        num: '04',
        title: 'Send Invitations',
        body: 'Go to Send tab, review pre-flight checks, then send invitations. InviteFlow sends in batches to respect rate limits. Monitor progress and any failures.',
      },
      {
        num: '05',
        title: 'Track RSVPs (Optional)',
        body: 'If you connected a Google Form for RSVPs, responses will populate the RSVP fields in your guest list. The Tracker tab shows RSVP statistics and breakdowns by category.',
      },
      {
        num: '06',
        title: 'Configure Discover (Optional)',
        body: 'To discover elected officials: 1) Get a web search API key (e.g. serpapi.com — 100 free/month); 2) Get an AI provider API key (OpenAI, Anthropic, or any compatible provider); 3) Go to Discover → Settings and enter your endpoint, AI key, and web search key.',
      },
    ],
  },
  {
    id: 'tokens',
    label: 'TEMPLATE TOKENS',
    tokens: [
      ['{{FirstName}}', 'Guest first name'],
      ['{{LastName}}', 'Guest last name'],
      ['{{FullName}}', 'First + Last'],
      ['{{EventName}}', 'Event name'],
      ['{{EventDate}}', 'Event date'],
      ['{{Venue}}', 'Venue'],
      ['{{RSVP_Link}}', 'RSVP form link'],
      ['{{FullTitle}}', 'Guest title'],
      ['{{OrgName}}', 'Organization'],
      ['{{ContactName}}', 'Your name'],
      ['{{ContactEmail}}', 'Your email'],
      ['{{VIPStart}}', 'VIP window start'],
      ['{{VIPEnd}}', 'VIP window end'],
      ['{{Date_Sent}}', 'Send date'],
    ],
  },
  {
    id: 'tips',
    label: 'TIPS',
    bullets: [
      'Start small — test with 3–5 guests before your full list.',
      'Use Discover to find officials for your jurisdiction — search results are grounded with real-time web data.',
      'Use Compose → Preview to check merged emails before sending.',
      'InviteFlow sends in batches with delays to respect rate limits.',
      'Connect a Google Form to RSVP tracking and responses will auto-populate in the Tracker.',
      'Use Settings → Export all data for a JSON backup of all events and settings.',
      'Everything is stored locally in your browser — clear your cache and lose your data. Export regularly!',
    ],
  },
  {
    id: 'troubleshooting',
    label: 'TROUBLESHOOTING',
    bullets: [
      'Data gone after refresh? Data is local to your browser. Import your JSON backup to restore.',
      'Emails not sending? Check that all required fields are configured in Setup.',
      'Template tokens not merging? Verify token names match exactly (case-sensitive: {{FirstName}}, not {{firstname}}).',
      'CSV import failed? Ensure CSV has a header row and email column. Check for proper CSV formatting.',
      'Discover page not working? Configure your AI provider API key, endpoint, and jurisdiction in Discover → Settings. Web search requires a separate web search key.',
    ],
  },
];
