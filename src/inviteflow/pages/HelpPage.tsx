import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';

const sections = [
  {
    id: 'what',
    label: 'WHAT IS INVITEFLOW?',
    content: 'InviteFlow manages VIP event invitations end-to-end — from drafting personalized emails to tracking RSVPs. All data lives in your Google account (Sheets + Drive); nothing is stored on external servers.',
  },
  {
    id: 'workflow',
    label: 'THE 4-STEP WORKFLOW',
    steps: [
      {
        num: '01',
        title: 'Create',
        body: 'Set up your event details — name, date, venue, org, contact info — and connect a Google Sheet that holds your guest list. InviteFlow stores the config in your Google Drive.',
      },
      {
        num: '02',
        title: 'Discover',
        body: 'Use the Discover page to find and verify elected officials for your jurisdiction. Configure LiteLLM endpoint, API key, and SerpAPI key in the Settings modal, then run a scan. Add discovered officials directly to your guest list.',
      },
      {
        num: '03',
        title: 'Compose',
        body: 'Write your invite email using {{template tokens}} like {{FirstName}}, {{EventDate}}, or {{Venue}}. InviteFlow merges each guest\'s data before sending.',
      },
      {
        num: '04',
        title: 'Send',
        body: 'InviteFlow sends personalized emails from your Gmail account in batches. Track opens, RSVPs, and responses from the Tracker tab.',
      },
    ],
  },
  {
    id: 'setup',
    label: 'BEFORE YOU START',
    steps: [
      {
        num: '01',
        title: 'Get a Google Client ID',
        body: 'Go to console.cloud.google.com → APIs & Services → Credentials → Create Credentials → OAuth client ID → Web application. Add your origin and redirect URIs, then copy the Client ID (e.g. 123456789-abc.apps.googleusercontent.com).',
      },
      {
        num: '02',
        title: 'Enter Client ID in Settings',
        body: 'Go to Settings → Client ID, paste your Client ID, and click Save.',
      },
      {
        num: '03',
        title: 'Authorize Google Services',
        body: 'In Settings → Google OAuth, click Authorize for all three: Gmail · Send, Google Sheets, and Google Drive AppData.',
      },
      {
        num: '04',
        title: 'Set Up Your Guest Sheet',
        body: 'Create a Google Sheet with these columns in order: FirstName · LastName · Title · Category · Email · RSVP_Link · InviteSent · InviteSentDate · RSVP_Status · RSVP_Date · Notes. Email is the primary key — every guest needs a unique email.',
      },
      {
        num: '05',
        title: 'Configure LiteLLM + SerpAPI (Optional)',
        body: 'To use the Discover page for official discovery: 1) Get a SerpAPI key from https://serpapi.com/; 2) Set up LiteLLM proxy (default: http://127.0.0.1:4000/v1); 3) Go to Discover → Settings and enter your LiteLLM endpoint, API key, and SerpAPI key. These are stored in session memory only — never persisted.',
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
      'Use Discover to find officials for your jurisdiction — search results are grounded with real-time web data via SerpAPI.',
      'Use Compose → Preview to check merged emails before sending.',
      'InviteFlow sends in batches with delays to respect Gmail\'s rate limits.',
      'Connect a Google Form to RSVP_Link and RSVPs surface automatically in the Tracker.',
      'Use Settings → Export all data for a JSON backup of all events and settings.',
    ],
  },
];

export default function HelpPage() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-root)' }}>
      <PageHeader eyebrow="HELP" title="Quick Start Guide" showBack />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 48px' }}>

        {sections.map(section => (
          <div key={section.id}>
            <div className="if-section-label" style={{ padding: '20px 0 10px' }}>
              {section.label}
            </div>

            {section.content && (
              <div className="if-card" style={{ padding: 16, marginBottom: 4 }}>
                <p style={{ margin: 0, fontFamily: 'var(--rf-mono)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {section.content}
                </p>
              </div>
            )}

            {section.steps && (
              <div className="if-card" style={{ marginBottom: 4 }}>
                {section.steps.map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 14, padding: '14px 16px',
                    borderBottom: i < section.steps!.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                      background: 'var(--accent)', color: 'var(--bg-root)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--rf-mono)', fontSize: 10, fontWeight: 600,
                    }}>
                      {step.num}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 12, color: 'var(--text-heading)', fontWeight: 600, marginBottom: 4 }}>
                        {step.title}
                      </div>
                      <div style={{ fontFamily: 'var(--rf-mono)', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                        {step.body}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {section.tokens && (
              <div className="if-card" style={{ marginBottom: 4, padding: 0, overflow: 'hidden' }}>
                {section.tokens.map(([token, desc], i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '9px 16px',
                    borderBottom: i < section.tokens!.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <code style={{
                      fontFamily: 'var(--rf-mono)', fontSize: 11, color: 'var(--accent)',
                      background: 'rgba(0,217,205,0.06)', padding: '2px 7px', borderRadius: 4,
                      border: '1px solid rgba(0,217,205,0.15)', flexShrink: 0,
                    }}>
                      {token}
                    </code>
                    <span style={{ fontFamily: 'var(--rf-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                      {desc}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {section.bullets && (
              <div className="if-card" style={{ padding: 16, marginBottom: 4 }}>
                {section.bullets.map((b, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 10, marginBottom: i < section.bullets!.length - 1 ? 10 : 0,
                    alignItems: 'flex-start',
                  }}>
                    <Icon name="chevron-right" size={11} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontFamily: 'var(--rf-mono)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {b}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
