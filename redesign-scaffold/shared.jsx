// Shared data + primitives across the 3 directions

const SAMPLE_OFFICIALS = [
  { id: 'o1', name: 'Maria Hernandez', title: 'State Senator, District 23', cat: 'State Senate', email: 'maria.hernandez@senate.ca.gov', sched: 'Daniel Wu', schedEmail: 'dwu@senate.ca.gov', status: 'verified', rsvp: 'attending' },
  { id: 'o2', name: 'James Chen', title: 'Assemblymember, District 17', cat: 'State House', email: 'james.chen@asm.ca.gov', sched: 'Lila Park', schedEmail: 'lpark@asm.ca.gov', status: 'verified', rsvp: 'attending' },
  { id: 'o3', name: 'Aisha Okonkwo', title: 'County Supervisor, District 4', cat: 'County', email: 'aokonkwo@countyofalameda.gov', sched: '', schedEmail: '', status: 'verified', rsvp: 'declined' },
  { id: 'o4', name: 'Robert Patterson', title: 'Mayor of Berkeley', cat: 'City', email: 'mayor@cityofberkeley.gov', sched: 'Eve Ruiz', schedEmail: 'eruiz@cityofberkeley.gov', status: 'changed', rsvp: 'pending' },
  { id: 'o5', name: 'Sofia Reyes', title: 'Council Member, Oakland', cat: 'City', email: 'sreyes@oaklandca.gov', sched: '', schedEmail: '', status: 'verified', rsvp: 'attending' },
  { id: 'o6', name: 'Marcus Bell', title: 'School Board Trustee', cat: 'Education', email: 'mbell@bcsk12.org', sched: '', schedEmail: '', status: 'left_office', rsvp: 'pending' },
  { id: 'o7', name: 'Hannah Yoshida', title: 'Congresswoman, CA-12', cat: 'Congress', email: 'h.yoshida@mail.house.gov', sched: 'Tom Pierce', schedEmail: 'tom.pierce@mail.house.gov', status: 'verified', rsvp: 'pending' },
  { id: 'o8', name: 'Devon Greene', title: 'State Senator, District 11', cat: 'State Senate', email: 'devon.greene@senate.ca.gov', sched: '', schedEmail: '', status: 'pending', rsvp: 'pending' },
  { id: 'o9', name: 'Priya Anand', title: 'Council Member, San Jose', cat: 'City', email: 'priya.anand@sanjoseca.gov', sched: 'Carl Tate', schedEmail: 'ctate@sanjoseca.gov', status: 'verified', rsvp: 'pending' },
  { id: 'o10', name: 'Eleanor Briggs', title: 'County Supervisor, District 2', cat: 'County', email: 'ebriggs@sccgov.org', sched: '', schedEmail: '', status: 'verified', rsvp: 'attending' },
  { id: 'o11', name: 'Kenji Watanabe', title: 'Mayor of Fremont', cat: 'City', email: 'mayor@fremont.gov', sched: '', schedEmail: '', status: 'pending', rsvp: 'pending' },
  { id: 'o12', name: 'Yolanda Frazier', title: 'Assemblymember, District 14', cat: 'State House', email: 'yolanda.frazier@asm.ca.gov', sched: 'Ana Kohl', schedEmail: 'akohl@asm.ca.gov', status: 'verified', rsvp: 'attending' },
];

const SCAN_TARGETS = [
  { id: 'congress',     label: 'U.S. Congress',       count: 1, hint: 'Federal · House & Senate' },
  { id: 'state-senate', label: 'State Senate',        count: 2, hint: 'Open States API' },
  { id: 'state-house',  label: 'State Assembly',      count: 2, hint: 'Open States API' },
  { id: 'county',       label: 'County Supervisors',  count: 2, hint: 'AI-assisted scan' },
  { id: 'city',         label: 'Mayors & Councils',   count: 4, hint: 'AI-assisted scan' },
  { id: 'education',    label: 'School Boards',       count: 1, hint: 'AI-assisted scan' },
];

const DEFAULT_TEMPLATE = `Dear {{FullTitle}} {{LastName}},

You are warmly invited to attend our annual VIP reception celebrating community leadership in {{Venue}}.

The event will take place on {{EventDate}}, with VIP arrivals from {{VIPStart}} to {{VIPEnd}}.

Please RSVP at your earliest convenience: {{RSVP_Link}}

We would be honored by your presence.

Warmly,
{{ContactName}}
{{OrgName}}`;

const TOKENS = [
  'FirstName', 'LastName', 'FullTitle', 'EventName', 'EventDate', 'Venue',
  'VIPStart', 'VIPEnd', 'RSVP_Link', 'ContactName', 'OrgName',
];

// Light glyph icon set — line art only, never imagery.
function Icon({ name, size = 16, stroke = 1.5, style = {} }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  switch (name) {
    case 'envelope': return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
    case 'search': return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>;
    case 'send': return <svg {...props}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>;
    case 'check': return <svg {...props}><path d="M5 12l4 4L19 6"/></svg>;
    case 'x': return <svg {...props}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case 'plus': return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case 'sparkle': return <svg {...props}><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg>;
    case 'arrow-right': return <svg {...props}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'filter': return <svg {...props}><path d="M3 5h18M6 12h12M10 19h4"/></svg>;
    case 'chevron-down': return <svg {...props}><path d="M6 9l6 6 6-6"/></svg>;
    case 'chevron-right': return <svg {...props}><path d="M9 6l6 6-6 6"/></svg>;
    case 'menu': return <svg {...props}><path d="M3 6h18M3 12h18M3 18h18"/></svg>;
    case 'building': return <svg {...props}><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 8h6M9 12h6M9 16h6"/></svg>;
    case 'star': return <svg {...props}><path d="M12 3l2.6 6.2 6.7.5-5.1 4.4 1.6 6.5L12 17.3 6.2 20.6l1.6-6.5L2.7 9.7l6.7-.5z"/></svg>;
    case 'pen': return <svg {...props}><path d="M14 4l6 6L8 22H2v-6z"/></svg>;
    case 'sun': return <svg {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></svg>;
    case 'moon': return <svg {...props}><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>;
    case 'users': return <svg {...props}><circle cx="9" cy="8" r="4"/><path d="M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7"/><circle cx="17" cy="6" r="3"/><path d="M22 18c0-2.5-2-4.5-5-4.5"/></svg>;
    case 'calendar': return <svg {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>;
    case 'pin': return <svg {...props}><path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/></svg>;
    case 'mail-check': return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/><path d="M9 14l2 2 4-4" stroke="currentColor"/></svg>;
    case 'mail': return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
    case 'shield': return <svg {...props}><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z"/></svg>;
    case 'user': return <svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>;
    case 'lock': return <svg {...props}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>;
    case 'clock': return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'download': return <svg {...props}><path d="M12 4v12M7 11l5 5 5-5M4 21h16"/></svg>;
    case 'upload': return <svg {...props}><path d="M12 20V8M7 13l5-5 5 5M4 21h16"/></svg>;
    default: return <svg {...props}/>;
  }
}

// Status bar (light/dark)
function StatusBar({ dark = false, time = '9:41' }) {
  const c = dark ? '#fff' : '#000';
  return (
    <div className="ios-statusbar" style={{ color: c }}>
      <span>{time}</span>
      <div className="right">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
          <path d="M1 7c0-1 .8-2 2-2s2 1 2 2v2H1V7z M6 5c0-1 .8-2 2-2s2 1 2 2v4H6V5z M11 3c0-1 .8-2 2-2s2 1 2 2v6h-4V3z" fill={c}/>
        </svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
          <path d="M7.5 2c2.4 0 4.6 1 6.3 2.5l-.7.8C11.6 3.9 9.6 3 7.5 3S3.4 3.9 1.9 5.3l-.7-.8A8.8 8.8 0 017.5 2zm0 3c1.6 0 3.1.7 4.2 1.7l-.7.8a4.6 4.6 0 00-7 0l-.7-.8A5.7 5.7 0 017.5 5zm0 3a2 2 0 11-2 2 2 2 0 012-2z" fill={c}/>
        </svg>
        <div style={{ width: 25, height: 11, border: `1px solid ${c}`, borderRadius: 3, padding: 1, position: 'relative' }}>
          <div style={{ width: '85%', height: '100%', background: c, borderRadius: 1 }} />
          <div style={{ position: 'absolute', right: -3, top: 3, width: 2, height: 5, background: c, borderRadius: '0 1px 1px 0' }} />
        </div>
      </div>
    </div>
  );
}

function HomeIndicator({ dark = false }) {
  return <div className="ios-home" style={{ background: dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)' }} />;
}

// Phone wrapper used for every screen
function Phone({ children, dark = false, bg = '#fff', screenLabel }) {
  return (
    <div className="iphone-bezel" data-screen-label={screenLabel}>
      <div className="iphone-notch" />
      <div className="iphone-screen" style={{ background: bg }}>
        <StatusBar dark={dark} />
        <div style={{ position: 'absolute', inset: 0 }}>
          {children}
        </div>
        <HomeIndicator dark={dark} />
      </div>
    </div>
  );
}

Object.assign(window, { SAMPLE_OFFICIALS, SCAN_TARGETS, DEFAULT_TEMPLATE, TOKENS, Icon, StatusBar, HomeIndicator, Phone });
