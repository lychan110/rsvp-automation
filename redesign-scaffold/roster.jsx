// Roster — data-dense list-forward direction with light + dark toggle.
// Power-user feel; tighter than Atelier. Same warm palette, same accent.

const R_LIGHT = {
  bg: '#f7f4ee', surface: '#ffffff', surface2: '#fbf8f1',
  rule: '#e7e1d4', rule2: '#d8cfbb',
  ink: '#14110d', ink2: '#4a4339', ink3: '#8a8170',
  accent: '#c8553d', good: '#4f7a4a', warn: '#b8860b', bad: '#a14237',
};
const R_DARK = {
  bg: '#14110d', surface: '#1c1814', surface2: '#221d18',
  rule: '#2c2620', rule2: '#3d342c',
  ink: '#f4ede0', ink2: '#c8bda9', ink3: '#8a8170',
  accent: '#e57158', good: '#7ba577', warn: '#d4a942', bad: '#cc6555',
};

function rPalette(dark) { return dark ? R_DARK : R_LIGHT; }

// ───────────────────────── Roster · Design Tokens ─────────────────────────
// Single source of truth for layout/spacing/type across every Roster page.
const RT = {
  // Layout
  pagePadX: 18,                    // horizontal page padding
  pagePadTop: 50,                  // status bar offset
  // Header
  headerPad: '12px 18px 14px',     // back · eyebrow+title · action
  headerGap: 10,
  headerBtn: 32,                   // back/action button size
  headerEyebrow: { fontFamily: 'Geist Mono, monospace', fontSize: 10, letterSpacing: '0.14em' },
  headerTitle:   { fontSize: 18, fontWeight: 500, lineHeight: 1.15, letterSpacing: '-0.01em', fontStyle: 'italic' },
  // Section eyebrow (above a card)
  sectionEyebrow: { fontFamily: 'Geist Mono, monospace', fontSize: 10, letterSpacing: '0.16em' },
  sectionPad: '0 18px 8px',
  // Card
  card: { borderRadius: 10, overflow: 'hidden' },
  cardMargin: '0 18px 14px',
  // Row inside a card
  rowPad: '12px 14px',
  rowGap: 10,
  // Numbered/icon chip in a CardRow
  rowChip: 28,
  rowChipRadius: 6,
  // Type
  fontTitle: { fontSize: 14, fontWeight: 500, letterSpacing: '-0.005em' }, // serif row title
  fontSub:   { fontFamily: 'Geist Mono, monospace', fontSize: 10, letterSpacing: '0.08em' }, // mono sub
  fontMicro: { fontFamily: 'Geist Mono, monospace', fontSize: 9,  letterSpacing: '0.12em' },
  fontBody:  { fontSize: 12, lineHeight: 1.5 },
  // Misc
  chipRadius: 6,
  // Layout aliases (so consumers can spread instead of computing strings)
  get cardPadX() { return 14; },   // horizontal padding inside Cards (matches rowPad x)
};

// ───────────────────────── Roster · Shared Primitives ─────────────────────────

// PageHeader — used on every screen. Back button + eyebrow + serif italic title + right action.
// `right` defaults to a menu button that opens Settings; pass `right={null}` to hide.
function PageHeader({ p, eyebrow, title, onBack, right }) {
  const rightEl = right === undefined
    ? <HeaderAction p={p} icon="menu" onClick={() => window.__convene_navigate?.('r-settings')}/>
    : right;
  return (
    <div style={{ padding: RT.headerPad, display: 'flex', alignItems: 'center', gap: RT.headerGap }}>
      {onBack && (
        <button onClick={onBack} style={{
          width: RT.headerBtn, height: RT.headerBtn, borderRadius: 8,
          border: `1px solid ${p.rule}`, background: 'transparent', color: p.ink2,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name="chevron-right" size={14} style={{ transform: 'rotate(180deg)' }}/>
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...RT.headerEyebrow, color: p.ink3 }}>{eyebrow}</div>
        <div className="serif" style={{ ...RT.headerTitle, color: p.ink, marginTop: 3 }}>{title}</div>
      </div>
      {rightEl}
    </div>
  );
}

// SectionEyebrow — small mono caps row above a card
function SectionEyebrow({ p, label, count }) {
  return (
    <div style={{ padding: RT.sectionPad, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
      <div style={{ ...RT.sectionEyebrow, color: p.ink3 }}>{label}</div>
      {count != null && <div style={{ ...RT.sectionEyebrow, fontSize: 9, letterSpacing: '0.1em', color: p.ink3 }}>{count}</div>}
    </div>
  );
}

// Card — bordered surface container; renders children with hairline separators
function Card({ p, children, style }) {
  return (
    <div style={{
      margin: RT.cardMargin,
      background: p.surface, border: `1px solid ${p.rule}`,
      ...RT.card, ...style,
    }}>
      {children}
    </div>
  );
}

// Header right-action button — square, bordered, icon
function HeaderAction({ p, icon, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: RT.headerBtn, height: RT.headerBtn, borderRadius: 8,
      border: `1px solid ${p.rule}`, background: 'transparent', color: p.ink2,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon name={icon} size={15}/>
    </button>
  );
}

// CardRow — single canonical row inside a <Card>. Use for workflow steps,
// scout link, recent activity, settings entries, send batches, etc.
// Props:
//   chip:     <RowChip number="01" /> | <RowChip icon="search" filled /> | any node
//   title:    string (rendered serif)
//   sub:      string (rendered mono caps via fontSub) — pass already-cased text if you want mixed case
//   right:    string | node — small mono count or chevron-flanking value
//   chevron:  bool (default true)
//   tone:     'default' | 'accent' — accent tints the right value
//   isLast:   bool — suppresses bottom border
//   onClick:  fn
function CardRow({ p, chip, title, sub, right, chevron = true, tone = 'default', isLast = false, onClick }) {
  return (
    <button onClick={onClick} className="tap" style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: RT.rowGap,
      padding: RT.rowPad,
      background: 'transparent', border: 'none',
      borderBottom: isLast ? 'none' : `1px solid ${p.rule}`,
      textAlign: 'left',
    }}>
      {chip}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div className="serif" style={{ ...RT.fontTitle, color: p.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>}
        {sub && <div style={{ ...RT.fontSub, color: p.ink3, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>}
      </div>
      {right != null && (typeof right === 'string' || typeof right === 'number'
        ? <div style={{ flexShrink: 0, fontFamily: 'Geist Mono, monospace', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: tone === 'accent' ? p.accent : p.ink2 }}>{right}</div>
        : right
      )}
      {chevron && <Icon name="chevron-right" size={13} style={{ color: p.ink3, flexShrink: 0 }}/>}
    </button>
  );
}

// RowChip — square chip used in a CardRow's left slot. Either a number or an icon.
function RowChip({ p, number, icon, filled = false }) {
  const bg = filled ? p.accent : p.bg;
  const border = filled ? 'none' : `1px solid ${p.rule}`;
  const color = filled ? '#fff' : p.ink2;
  return (
    <div style={{
      width: RT.rowChip, height: RT.rowChip, borderRadius: RT.rowChipRadius,
      background: bg, border, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      fontFamily: 'Geist Mono, monospace', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
    }}>
      {number != null ? number : <Icon name={icon} size={14} stroke={2} style={{ color }}/>}
    </div>
  );
}

// MetaLine — single inline mono caps run with a status dot. Used under PageHeader.
function MetaLine({ p, dot, items, style }) {
  return (
    <div style={{ padding: `0 ${RT.pagePadX}px 16px`, display: 'flex', alignItems: 'center', flexWrap: 'wrap', ...RT.fontMicro, fontSize: 10, color: p.ink3, letterSpacing: '0.14em', ...style }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, marginRight: 8, flexShrink: 0, boxShadow: `0 0 0 3px ${dot}1a` }}/>}
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ margin: '0 10px', color: p.rule2 }}>·</span>}
          <span style={{ color: it.accent ? p.accent : p.ink3 }}>{it.label}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

// ActivityRow — single row in a "Recent activity" feed: time · type chip · sentence.
function ActivityRow({ p, t, a, n, e, c, isLast }) {
  return (
    <div style={{
      display: 'flex', gap: 10, padding: RT.rowPad,
      borderBottom: isLast ? 'none' : `1px solid ${p.rule}`,
      alignItems: 'center',
    }}>
      <span style={{ ...RT.fontMicro, fontSize: 9, color: p.ink3, width: 26, flexShrink: 0 }}>{t}</span>
      <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, padding: '2px 5px', border: `1px solid ${c}`, color: c, borderRadius: 3, letterSpacing: '0.08em', flexShrink: 0 }}>{a}</span>
      <span style={{ flex: 1, fontSize: 12, color: p.ink2, lineHeight: 1.4 }}>
        <span style={{ color: p.ink, fontWeight: 500 }}>{n}</span> {e}
      </span>
    </div>
  );
}

// FieldLabel — small mono-caps label above an input. Used in Compose, Settings, Send.
function FieldLabel({ p, children, style }) {
  return (
    <div style={{ ...RT.fontMicro, fontSize: 9, color: p.ink3, letterSpacing: '0.12em', marginBottom: 4, ...style }}>
      {children}
    </div>
  );
}

// FieldInput — bordered input that matches the rest of the surfaces.
function FieldInput({ p, value, onChange, multiline = false, rows = 6, style, inputRef, font = 'sans', placeholder }) {
  const fontFamily = font === 'mono' ? 'Geist Mono, monospace' : 'inherit';
  const sharedStyle = {
    width: '100%', padding: '10px 12px', border: `1px solid ${p.rule}`,
    borderRadius: 6, background: p.surface, fontSize: 12, color: p.ink,
    fontFamily, lineHeight: 1.6, ...style,
  };
  if (multiline) {
    return (
      <textarea ref={inputRef} value={value} onChange={onChange} rows={rows} placeholder={placeholder}
        style={{ ...sharedStyle, minHeight: rows * 22, padding: 12, resize: 'none' }}/>
    );
  }
  return <input ref={inputRef} value={value} onChange={onChange} placeholder={placeholder} style={sharedStyle}/>;
}

// StatChip — small bordered tile with mono caps label + serif value. Used in Compose summary, Send pre-flight, Track summary.
function StatChip({ p, label, value, color }) {
  return (
    <div style={{ flex: 1, padding: '8px 10px', background: p.surface, border: `1px solid ${p.rule}`, borderRadius: 6 }}>
      <div style={{ ...RT.fontMicro, fontSize: 8, letterSpacing: '0.1em', color: p.ink3 }}>{label}</div>
      <div className="serif" style={{ fontSize: 18, fontWeight: 500, color: color || p.ink }}>{value}</div>
    </div>
  );
}

// TabSwitcher — pill toggle; current segment is filled with ink.
function TabSwitcher({ p, value, onChange, options }) {
  return (
    <div style={{ margin: `0 ${RT.pagePadX}px 12px`, display: 'flex', background: p.surface, border: `1px solid ${p.rule}`, borderRadius: 8, padding: 3 }}>
      {options.map(opt => {
        const k = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const active = value === k;
        return (
          <button key={k} onClick={() => onChange(k)} className="tap" style={{
            flex: 1, padding: '8px', borderRadius: 5, fontSize: 12, fontWeight: 500,
            background: active ? p.ink : 'transparent',
            color: active ? p.bg : p.ink2,
            textTransform: 'capitalize',
            border: 'none',
          }}>{label}</button>
        );
      })}
    </div>
  );
}

// StatusPill — small mono caps pill (bordered). Used in headers, list rows.
function StatusPill({ p, label, tone = 'default' }) {
  const colors = { default: p.ink2, accent: p.accent, good: p.good, warn: p.warn, bad: p.bad };
  const c = colors[tone] || colors.default;
  return (
    <span style={{ padding: '6px 10px', borderRadius: 6, background: 'transparent', border: `1px solid ${p.rule2}`, fontSize: 10, color: c, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.08em' }}>{label}</span>
  );
}

// PrimaryButton — sticky-bottom CTA used on Compose, Send, Scout.
function PrimaryButton({ p, children, onClick, sticky = false }) {
  const inner = (
    <button onClick={onClick} className="tap" style={{
      width: '100%', padding: '13px', borderRadius: 8,
      background: p.accent, color: '#fff', fontSize: 13, fontWeight: 600,
      fontFamily: 'Geist Mono, monospace', letterSpacing: '0.06em',
      border: 'none',
    }}>{children}</button>
  );
  if (!sticky) return <div style={{ padding: `4px ${RT.pagePadX}px 16px` }}>{inner}</div>;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: `10px ${RT.pagePadX}px 18px`, background: `linear-gradient(to top, ${p.bg} 60%, transparent)` }}>
      {inner}
    </div>
  );
}

// ───────────────────────── Roster · Events Overview (landing) ─────────────────────────
function RosterEvents({ dark = false, density = 'compact' }) {
  const p = rPalette(dark);
  const events = [
    {
      id: 'civic',
      status: 'active',
      title: 'Civic Leadership Reception',
      kind: 'Annual gala',
      date: 'Jun 14',
      dateFull: 'Saturday, Jun 14 · 6:00 PM',
      venue: 'Veterans Hall, Oakland',
      days: 8,
      invited: 47, sent: 35, yes: 18, no: 5, pending: 12,
      lastActivity: '2m ago · Sen. Hernandez confirmed',
    },
    {
      id: 'mayors',
      status: 'draft',
      title: 'Mayors\' Roundtable',
      kind: 'Working session',
      date: 'Jul 02',
      dateFull: 'Wednesday, Jul 2 · 10:00 AM',
      venue: 'City Hall, Berkeley',
      days: 26,
      invited: 12, sent: 0, yes: 0, no: 0, pending: 12,
      lastActivity: 'Draft · last edit 3h ago',
    },
    {
      id: 'volunteer',
      status: 'sending',
      title: 'Volunteer Appreciation Brunch',
      kind: 'Community',
      date: 'May 18',
      dateFull: 'Sunday, May 18 · 11:00 AM',
      venue: 'Lakeside Park Pavilion',
      days: 19,
      invited: 124, sent: 89, yes: 41, no: 6, pending: 77,
      lastActivity: 'Sending · 89/124 delivered',
    },
    {
      id: 'gala-2025',
      status: 'past',
      title: 'Annual Civic Reception 2025',
      kind: 'Annual gala',
      date: 'Jun 14, 2025',
      dateFull: 'Past · last year',
      venue: 'Veterans Hall, Oakland',
      days: -319,
      invited: 52, sent: 52, yes: 38, no: 11, pending: 3,
      lastActivity: 'Closed · 73% attendance',
    },
  ];

  // Group: upcoming (active, sending, draft) and past
  const upcoming = events.filter(e => e.status !== 'past');
  const past = events.filter(e => e.status === 'past');

  return (
    <div className="scr" style={{ background: p.bg, paddingTop: RT.pagePadTop, color: p.ink }}>
      <PageHeader
        p={p}
        eyebrow="CONVENE · ROSTER"
        title="Events"
      />

      {/* Upcoming section */}
      <SectionEyebrow p={p} label="UPCOMING" count={upcoming.length}/>
      <Card p={p}>
        <div style={{ padding: '0 14px' }}>
          {upcoming.map((e, i) => <EventRow key={e.id} e={e} p={p} dark={dark} last={i === upcoming.length - 1}/>)}
        </div>
      </Card>

      {/* Past section */}
      <SectionEyebrow p={p} label="PAST" count={past.length}/>
      <Card p={p}>
        <div style={{ padding: '0 14px' }}>
          {past.map((e, i) => <EventRow key={e.id} e={e} p={p} dark={dark} last={i === past.length - 1}/>)}
        </div>
      </Card>

      {/* New event CTA — quiet text link */}
      <div style={{ padding: `8px ${RT.pagePadX}px 32px` }}>
        <button className="tap" style={{
          width: '100%', padding: '14px',
          background: 'transparent', border: `1px solid ${p.rule}`,
          borderRadius: 10, color: p.ink2,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Icon name="plus" size={13} stroke={1.8}/>
          <span style={{ fontSize: 13, fontWeight: 500 }}>New event</span>
        </button>
      </div>
    </div>
  );
}

function EventRow({ e, p, dark, last }) {
  const isPast = e.status === 'past';
  const isActive = e.status === 'active';
  const isSending = e.status === 'sending';
  const showDot = isActive || isSending;
  const dotColor = isSending ? p.warn : p.accent;

  const subtitle = isPast
    ? `${e.invited} invited · ${e.yes} attended`
    : isSending
      ? `Sending · ${e.sent}/${e.invited} delivered`
      : e.status === 'draft'
        ? `Draft · ${e.invited} on the list`
        : `${e.yes} yes · ${e.pending} pending · ${e.invited} invited`;

  const statusWord = isActive ? 'Active' : isSending ? 'Sending' : e.status === 'draft' ? 'Draft' : null;

  return (
    <button onClick={() => window.__convene_navigate?.('r-event-' + e.id)} className="tap" style={{
      width: '100%', textAlign: 'left',
      background: 'transparent',
      border: 'none',
      borderBottom: last ? 'none' : `1px solid ${p.rule}`,
      padding: '14px 0',
      display: 'grid',
      gridTemplateColumns: '40px 1fr auto',
      alignItems: 'center',
      columnGap: 12,
      opacity: isPast ? 0.55 : 1,
      position: 'relative',
    }}>
      {/* Active edge accent — cheeky tick, sits in card padding gutter */}
      {isActive && (
        <span style={{ position: 'absolute', left: -14, top: '50%', transform: 'translateY(-50%)', width: 3, height: 26, background: p.accent, borderRadius: 2 }}/>
      )}

      {/* Date — strictly aligned column */}
      <div style={{ minWidth: 0 }}>
        <div className="serif" style={{ fontSize: 20, fontWeight: 500, lineHeight: 1, color: isActive ? p.accent : p.ink, letterSpacing: '-0.015em' }}>
          {e.date.split(' ')[1] || e.date.split(' ')[0]}
        </div>
        <div style={{ ...RT.fontMicro, fontSize: 9, color: p.ink3, marginTop: 5 }}>
          {e.date.split(' ')[0].toUpperCase()}
        </div>
      </div>

      {/* Title + subtitle */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div className="serif" style={{ ...RT.fontTitle, color: p.ink, lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>
            {e.title}
          </div>
          {statusWord && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0, ...RT.fontMicro, fontSize: 9, color: p.ink3 }}>
              {showDot && (
                <span style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: dotColor,
                  animation: isSending ? 'rosterPulse 1.6s ease-in-out infinite' : 'none',
                  boxShadow: isActive ? `0 0 0 3px ${p.accent}1a` : 'none',
                }}/>
              )}
              <span style={{ color: isActive ? p.accent : isSending ? p.warn : p.ink3 }}>{statusWord.toUpperCase()}</span>
            </span>
          )}
        </div>
        <div style={{ ...RT.fontSub, color: p.ink3, marginTop: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {subtitle}
        </div>
      </div>

      {/* Right column — countdown for upcoming, chevron for past */}
      {!isPast ? (
        <div style={{ textAlign: 'right', minWidth: 36 }}>
          <div className="serif" style={{ fontSize: 18, fontWeight: 500, color: isActive ? p.ink : p.ink2, lineHeight: 1 }}>
            {e.days}
          </div>
          <div style={{ ...RT.fontMicro, fontSize: 9, color: p.ink3, marginTop: 5 }}>
            DAYS
          </div>
        </div>
      ) : (
        <Icon name="chevron-right" size={14} style={{ color: p.ink3 }}/>
      )}
    </button>
  );
}

// ───────────────────────── Roster · Event Dashboard (was Home) ─────────────────────────
function RosterHome({ dark = false, showScout = true, density = 'compact' }) {
  const p = rPalette(dark);
  const tabs = [
    { k: 'list',     l: 'Build the list',     n: 47, sub: 'invitees · 4 unverified' },
    { k: 'compose',  l: 'Compose the note',   n: 1,  sub: 'draft · 2 min ago' },
    { k: 'send',     l: 'Send invitations',   n: 12, sub: 'sent today · 12 left' },
    { k: 'track',    l: 'Track replies',      n: 18, sub: 'attending · 12 pending' },
  ];
  const stats = [
    { l: 'Invited',   v: 47,  c: p.ink2 },
    { l: 'Sent',      v: 35,  c: p.accent },
    { l: 'Yes',       v: 18,  c: p.good },
    { l: 'No reply',  v: 12,  c: p.warn },
    { l: 'Declined',  v: 5,   c: p.bad },
  ];

  return (
    <div className="scr" style={{ background: p.bg, paddingTop: RT.pagePadTop, color: p.ink }}>
      <PageHeader
        p={p}
        eyebrow="EVENT"
        title="Civic Leadership Reception"
        onBack={() => window.__convene_navigate?.('r-events')}
      />

      {/* Meta line — directly under header */}
      <MetaLine
        p={p}
        dot={p.accent}
        items={[
          { label: 'SAT · JUN 14' },
          { label: 'VETERANS HALL' },
          { label: '8 DAYS OUT', accent: true },
        ]}
      />

      {/* Stats card — 3 columns + tiny in-card delta footer */}
      <Card p={p}>
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: `14px ${RT.cardPadX}px`,
          fontFamily: 'Geist Mono, monospace', fontSize: 11, letterSpacing: '0.06em',
        }}>
          <span style={{ color: p.ink2, flex: 1, textAlign: 'center' }}>
            <span style={{ color: p.ink, fontWeight: 600 }}>47</span>
            <span style={{ marginLeft: 6 }}>INVITED</span>
          </span>
          <span style={{ width: 1, height: 16, background: p.rule }}/>
          <span style={{ color: p.accent, flex: 1, textAlign: 'center' }}>
            <span style={{ fontWeight: 600 }}>18</span>
            <span style={{ marginLeft: 6 }}>ATTENDING</span>
          </span>
          <span style={{ width: 1, height: 16, background: p.rule }}/>
          <span style={{ color: p.ink2, flex: 1, textAlign: 'center' }}>
            <span style={{ color: p.ink, fontWeight: 600 }}>12</span>
            <span style={{ marginLeft: 6 }}>PENDING</span>
          </span>
        </div>
        <div style={{
          padding: `7px ${RT.cardPadX}px`,
          background: p.surface2,
          borderTop: `1px solid ${p.rule}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          ...RT.fontMicro, fontSize: 9, color: p.ink3,
        }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: p.accent, marginRight: 6 }}/>
          <span><span style={{ color: p.accent, fontWeight: 600 }}>+3</span> NEW REPLIES TODAY</span>
        </div>
      </Card>

      {/* Workflow — built from CardRow primitive */}
      <SectionEyebrow p={p} label="WORKFLOW"/>
      <Card p={p}>
        {tabs.map((t, i) => {
          const isCurrent = t.k === 'send';
          return (
            <CardRow
              key={t.k}
              p={p}
              chip={<RowChip p={p} number={`0${i+1}`} filled={isCurrent}/>}
              title={t.l}
              sub={t.sub.toUpperCase()}
              right={t.n}
              tone={isCurrent ? 'accent' : 'default'}
              isLast={i === tabs.length - 1}
              onClick={() => window.__convene_navigate?.('r-' + t.k)}
            />
          );
        })}
      </Card>

      {showScout && (
        <>
          <SectionEyebrow p={p} label="DISCOVER"/>
          <Card p={p}>
            <CardRow
              p={p}
              chip={<RowChip p={p} icon="search" filled/>}
              title="Scout · Find more officials"
              sub="3 JURISDICTIONS · LAST SCAN 4D AGO"
              isLast
              onClick={() => window.__convene_navigate?.('r-scout')}
            />
          </Card>
        </>
      )}

      {/* Recent activity */}
      <SectionEyebrow p={p} label="RECENT ACTIVITY"/>
      <Card p={p} style={{ marginBottom: 28 }}>
        {[
          { t: '2m', a: 'RSVP', n: 'Sen. Hernandez', e: 'confirmed attending', c: p.good },
          { t: '14m', a: 'SEND', n: 'Mayor Patterson', e: 'invitation delivered', c: p.accent },
          { t: '1h', a: 'RSVP', n: 'Sup. Okonkwo', e: 'declined with regrets', c: p.bad },
          { t: '3h', a: 'SCAN', n: 'City Councils', e: '4 new officials found', c: p.warn },
        ].map((r, i, arr) => (
          <ActivityRow key={i} p={p} {...r} isLast={i === arr.length - 1}/>
        ))}
      </Card>
    </div>
  );
}

// ───────────────────────── Roster · Scout ─────────────────────────
function RosterScout({ dark = false }) {
  const p = rPalette(dark);
  const [scanning, setScanning] = React.useState({});
  const [scanned, setScanned] = React.useState({ congress: 1, 'state-senate': 2 });
  const [discovered, setDiscovered] = React.useState([
    { id: 'd1', name: 'Carla Mendez', title: 'Council Member, Hayward', cat: 'CITY', email: 'cmendez@hayward-ca.gov', confidence: 'high' },
    { id: 'd2', name: 'Theo Ostrowski', title: 'School Board, Berkeley USD', cat: 'EDU', email: 'tostrowski@berkeley.net', confidence: 'med' },
    { id: 'd3', name: 'Mei-Lin Park', title: 'Mayor of Alameda', cat: 'CITY', email: '', confidence: 'low' },
    { id: 'd4', name: 'Jorge Saldaña', title: 'Council Member, San Leandro', cat: 'CITY', email: 'jsaldana@sanleandro.org', confidence: 'high' },
  ]);
  const [selected, setSelected] = React.useState(new Set());

  function scan(id) {
    setScanning(s => ({ ...s, [id]: true }));
    setTimeout(() => {
      setScanning(s => ({ ...s, [id]: false }));
      setScanned(s => ({ ...s, [id]: (s[id] || 0) + Math.floor(Math.random() * 3 + 1) }));
    }, 1600);
  }
  function toggle(id) { setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  return (
    <div className="scr" style={{ background: p.bg, paddingTop: RT.pagePadTop, color: p.ink }}>
      <PageHeader
        p={p}
        eyebrow="SCOUT"
        title="Discover officials"
        onBack={() => window.__convene_navigate?.('r-home')}
      />

      {/* Jurisdiction strip */}
      <Card p={p} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
        <Icon name="pin" size={12} style={{ color: p.accent }}/>
        <span style={{ fontSize: 11, color: p.ink2 }}>California · Alameda · Berkeley, Oakland, Hayward, Alameda</span>
        <span style={{ flex: 1 }}/>
        <button style={{ fontSize: 10, color: p.accent, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.1em' }}>EDIT</button>
      </Card>

      {/* Targets table */}
      <Card p={p}>
        {SCAN_TARGETS.map((t, i) => {
          const isScan = scanning[t.id];
          const got = scanned[t.id];
          return (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px',
              borderBottom: i < SCAN_TARGETS.length - 1 ? `1px solid ${p.rule}` : 'none',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: p.ink }}>{t.label}</div>
                <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, color: p.ink3, marginTop: 1, letterSpacing: '0.06em' }}>{t.hint}</div>
              </div>
              {got !== undefined && (
                <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, padding: '2px 6px', border: `1px solid ${p.good}`, color: p.good, borderRadius: 3, letterSpacing: '0.08em' }}>+{got}</span>
              )}
              <button
                onClick={() => scan(t.id)}
                disabled={isScan}
                className={isScan ? 'scanning' : ''}
                style={{
                  padding: '6px 12px', borderRadius: 6,
                  background: got !== undefined ? 'transparent' : p.ink,
                  color: got !== undefined ? p.ink2 : p.bg,
                  border: got !== undefined ? `1px solid ${p.rule2}` : 'none',
                  fontFamily: 'Geist Mono, monospace', fontSize: 10, letterSpacing: '0.06em',
                }}>
                {isScan ? 'SCAN…' : got !== undefined ? 'AGAIN' : 'SCAN'}
              </button>
            </div>
          );
        })}
      </Card>

      {/* Found list with bulk select */}
      <SectionEyebrow p={p} label={`NEW · ${discovered.length}`} count={selected.size > 0 ? `${selected.size} SELECTED` : null}/>

      <Card p={p}>        {discovered.map((d, i) => {
          const cConf = d.confidence === 'high' ? p.good : d.confidence === 'med' ? p.warn : p.bad;
          const sel = selected.has(d.id);
          return (
            <button
              key={d.id}
              onClick={() => toggle(d.id)}
              className="tap"
              style={{
                width: '100%', display: 'flex', gap: 10, padding: '10px 12px',
                borderBottom: i < discovered.length - 1 ? `1px solid ${p.rule}` : 'none',
                background: sel ? p.surface2 : 'transparent', textAlign: 'left',
                alignItems: 'center',
              }}>
              <div style={{
                width: 18, height: 18, borderRadius: 4,
                border: `1.5px solid ${sel ? p.accent : p.rule2}`,
                background: sel ? p.accent : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {sel && <Icon name="check" size={10} stroke={2.5} style={{ color: '#fff' }}/>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: p.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</span>
                  <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 8, padding: '1px 4px', background: p.bg, color: p.ink3, borderRadius: 2, letterSpacing: '0.08em' }}>{d.cat}</span>
                </div>
                <div style={{ fontSize: 10, color: p.ink3, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.title}</div>
                <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, color: d.email ? p.ink3 : p.warn, marginTop: 2 }}>
                  {d.email || '— email pending inference —'}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 8, color: cConf, letterSpacing: '0.08em' }}>{d.confidence.toUpperCase()}</span>
              </div>
            </button>
          );
        })}
      </Card>

      {/* Sticky bulk action */}
      {selected.size > 0 && (
        <div style={{ position: 'absolute', left: 18, right: 18, bottom: 18, display: 'flex', gap: 8 }}>
          <button onClick={() => { setDiscovered(d => d.filter(x => !selected.has(x.id))); setSelected(new Set()); }} className="tap" style={{
            flex: 1, padding: '12px', borderRadius: 8,
            background: p.accent, color: '#fff', fontSize: 13, fontWeight: 500,
          }}>
            Add {selected.size} to roster
          </button>
          <button onClick={() => setSelected(new Set())} className="tap" style={{
            padding: '12px 14px', borderRadius: 8,
            border: `1px solid ${p.rule2}`, background: p.surface, color: p.ink2, fontSize: 13,
          }}>Cancel</button>
        </div>
      )}
    </div>
  );
}

// ───────────────────────── Roster · Compose ─────────────────────────
function RosterCompose({ dark = false }) {
  const p = rPalette(dark);
  const [body, setBody] = React.useState(DEFAULT_TEMPLATE);
  const [subject, setSubject] = React.useState('You\'re invited — {{EventName}}');
  const taRef = React.useRef(null);
  const [tab, setTab] = React.useState('edit');

  function insertToken(t) {
    const ta = taRef.current; if (!ta) { setBody(b => b + ` {{${t}}}`); return; }
    const start = ta.selectionStart, end = ta.selectionEnd;
    const next = body.slice(0, start) + `{{${t}}}` + body.slice(end);
    setBody(next);
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = start + t.length + 4; }, 0);
  }

  const sample = SAMPLE_OFFICIALS[0];
  const reps = {
    FirstName: sample.name.split(' ')[0], LastName: sample.name.split(' ').slice(-1)[0],
    FullTitle: 'Senator', EventName: 'Annual Civic Leadership Reception',
    EventDate: 'June 14, 2026', Venue: 'Veterans Memorial Hall',
    VIPStart: '5:30pm', VIPEnd: '6:30pm',
    RSVP_Link: 'rsvp.convene.app/abc123', ContactName: 'Lenya Chan', OrgName: 'Civic Foundation',
  };
  const fill = s => s.replace(/\{\{(\w+)\}\}/g, (_, k) => reps[k] ?? `{{${k}}}`);

  return (
    <div className="scr" style={{ background: p.bg, paddingTop: RT.pagePadTop, color: p.ink, paddingBottom: 100 }}>
      <PageHeader
        p={p}
        eyebrow="COMPOSE"
        title="Invitation template"
        onBack={() => window.__convene_navigate?.('r-home')}
        right={<StatusPill p={p} label="SAVED" tone="default"/>}
      />

      {/* edit/preview toggle */}
      <TabSwitcher p={p} value={tab} onChange={setTab} options={['edit', 'preview']}/>

      {tab === 'edit' && (
        <>
          <div style={{ padding: `0 ${RT.pagePadX}px 8px` }}>
            <FieldLabel p={p}>SUBJECT</FieldLabel>
            <FieldInput p={p} value={subject} onChange={e => setSubject(e.target.value)}/>
          </div>
          <div style={{ padding: `6px ${RT.pagePadX}px 0` }}>
            <FieldLabel p={p}>BODY</FieldLabel>
            <FieldInput p={p} value={body} onChange={e => setBody(e.target.value)} multiline rows={11} font="mono" inputRef={taRef}/>
          </div>

          <div style={{ padding: `12px ${RT.pagePadX}px 0` }}>
            <FieldLabel p={p} style={{ marginBottom: 6 }}>MERGE TOKENS</FieldLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {TOKENS.map(t => (
                <button key={t} onClick={() => insertToken(t)}
                  style={{
                    padding: '4px 8px', borderRadius: 4,
                    background: p.surface, border: `1px solid ${p.rule2}`,
                    fontFamily: 'Geist Mono, monospace', fontSize: 9, color: p.accent,
                    letterSpacing: '0.04em',
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: `14px ${RT.pagePadX}px 0`, display: 'flex', gap: 10 }}>
            <StatChip p={p} label="WORDS" value={body.trim().split(/\s+/).length}/>
            <StatChip p={p} label="TOKENS" value={(body.match(/\{\{\w+\}\}/g) || []).length}/>
            <StatChip p={p} label="READY" value={47} color={p.good}/>
          </div>
        </>
      )}

      {tab === 'preview' && (
        <div style={{ padding: `0 ${RT.pagePadX}px` }}>
          <div style={{ background: p.surface, border: `1px solid ${p.rule}`, borderRadius: 8, padding: 16 }}>
            <FieldLabel p={p} style={{ marginBottom: 4, letterSpacing: '0.1em' }}>TO</FieldLabel>
            <div style={{ fontSize: 12, color: p.ink, marginBottom: 10 }}>{sample.name} · {sample.email}</div>
            <FieldLabel p={p} style={{ marginBottom: 4, letterSpacing: '0.1em' }}>SUBJECT</FieldLabel>
            <div className="serif" style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>{fill(subject)}</div>
            <div style={{ borderTop: `1px solid ${p.rule}`, paddingTop: 14, fontFamily: 'Fraunces, serif', fontSize: 13, lineHeight: 1.65, whiteSpace: 'pre-wrap', color: p.ink2 }}>
              {fill(body)}
            </div>
          </div>
          <div style={{ marginTop: 12, padding: '10px 12px', background: p.surface, border: `1px dashed ${p.rule2}`, borderRadius: 8, fontSize: 11, color: p.ink2 }}>
            <Icon name="users" size={11} style={{ verticalAlign: -1, marginRight: 6, color: p.accent }}/>
            Will be sent to <strong style={{ color: p.ink }}>47 recipients</strong>, each personalized with their own data.
          </div>
        </div>
      )}

      <PrimaryButton p={p} sticky onClick={() => window.__convene_navigate?.('r-send')}>
        CONTINUE TO SEND →
      </PrimaryButton>
    </div>
  );
}

// ───────────────────────── Roster · Tracker (data-dense) ─────────────────────────
function RosterTracker({ dark = false }) {
  const p = rPalette(dark);
  const [filter, setFilter] = React.useState('all');
  const counts = {
    all: SAMPLE_OFFICIALS.length,
    attending: SAMPLE_OFFICIALS.filter(o => o.rsvp === 'attending').length,
    pending: SAMPLE_OFFICIALS.filter(o => o.rsvp === 'pending').length,
    declined: SAMPLE_OFFICIALS.filter(o => o.rsvp === 'declined').length,
  };
  const filtered = filter === 'all' ? SAMPLE_OFFICIALS : SAMPLE_OFFICIALS.filter(o => o.rsvp === filter);

  return (
    <div className="scr" style={{ background: p.bg, paddingTop: RT.pagePadTop, color: p.ink, paddingBottom: 16 }}>
      <PageHeader
        p={p}
        eyebrow="TRACK"
        title="RSVP roster"
        onBack={() => window.__convene_navigate?.('r-home')}
        right={<HeaderAction p={p} icon="filter"/>}
      />

      {/* Big number split */}
      <Card p={p} style={{ padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="serif" style={{ fontSize: 44, fontWeight: 500, color: p.accent, lineHeight: 1, letterSpacing: '-0.02em' }}>{counts.attending}</span>
          <span style={{ fontSize: 14, color: p.ink3 }}>of {counts.all} confirmed</span>
        </div>
        {/* Stacked bar */}
        <div style={{ display: 'flex', height: 10, marginTop: 12, borderRadius: 4, overflow: 'hidden', background: p.rule }}>
          <div style={{ width: `${counts.attending / counts.all * 100}%`, background: p.accent }}/>
          <div style={{ width: `${counts.pending / counts.all * 100}%`, background: p.warn, opacity: 0.5 }}/>
          <div style={{ width: `${counts.declined / counts.all * 100}%`, background: p.bad, opacity: 0.5 }}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: 'Geist Mono, monospace', fontSize: 9, color: p.ink3, letterSpacing: '0.08em' }}>
          <span><span style={{ display: 'inline-block', width: 6, height: 6, background: p.accent, borderRadius: '50%', marginRight: 4 }}/>{counts.attending} YES</span>
          <span><span style={{ display: 'inline-block', width: 6, height: 6, background: p.warn, borderRadius: '50%', marginRight: 4, opacity: 0.7 }}/>{counts.pending} PEND</span>
          <span><span style={{ display: 'inline-block', width: 6, height: 6, background: p.bad, borderRadius: '50%', marginRight: 4, opacity: 0.7 }}/>{counts.declined} NO</span>
        </div>
      </Card>

      {/* Filter chips */}
      <div style={{ padding: `0 ${RT.pagePadX}px 10px`, display: 'flex', gap: 6, overflowX: 'auto' }}>
        {[
          { k: 'all', l: 'All', c: counts.all },
          { k: 'attending', l: 'Yes', c: counts.attending },
          { k: 'pending', l: 'Pending', c: counts.pending },
          { k: 'declined', l: 'No', c: counts.declined },
        ].map(f => (
          <FilterChip key={f.k} p={p} active={filter === f.k} onClick={() => setFilter(f.k)} label={f.l} count={f.c}/>
        ))}
      </div>

      {/* Dense list */}
      <Card p={p}>        {filtered.map((o, i) => {
          const c = o.rsvp === 'attending' ? p.good : o.rsvp === 'declined' ? p.bad : p.warn;
          const lbl = o.rsvp === 'attending' ? 'YES' : o.rsvp === 'declined' ? 'NO' : 'WAIT';
          return (
            <div key={o.id} className="tap" style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
              borderBottom: i < filtered.length - 1 ? `1px solid ${p.rule}` : 'none',
            }}>
              <div style={{ width: 4, alignSelf: 'stretch', background: c, borderRadius: 2 }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: p.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.name}</span>
                  <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 8, color: p.ink3, letterSpacing: '0.08em' }}>{o.cat.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: 10, color: p.ink3, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.title}</div>
              </div>
              <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, padding: '3px 6px', border: `1px solid ${c}`, color: c, borderRadius: 3, letterSpacing: '0.1em' }}>{lbl}</span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ───────────────────────── Roster · Send (scaffold) ─────────────────────────
// Scaffolded from primitives. Real send orchestration (Gmail OAuth, batching,
// retries, rate-limit handling) lives in the backend — see handoff notes.
function RosterSend({ dark = false }) {
  const p = rPalette(dark);
  const [tab, setTab] = React.useState('preflight');

  // STUB DATA — replace with API in production. See handoff notes (CLAUDE_CODE.md)
  const stats = { ready: 47, missing: 0, sent: 0, queued: 47, failed: 0 };
  const account = { email: 'lenya@civicfoundation.org', provider: 'Gmail', dailyCap: 500, sentToday: 0 };
  const batches = [
    { id: 'b1', label: 'BATCH 01', size: 25, when: 'now', status: 'pending' },
    { id: 'b2', label: 'BATCH 02', size: 22, when: '+5 min', status: 'pending' },
  ];

  return (
    <div className="scr" style={{ background: p.bg, paddingTop: RT.pagePadTop, color: p.ink, paddingBottom: 100 }}>
      <PageHeader
        p={p}
        eyebrow="SEND"
        title="Bulk send"
        onBack={() => window.__convene_navigate?.('r-home')}
      />

      <MetaLine
        p={p}
        dot={p.warn}
        items={[
          { label: 'GMAIL · LENYA@…' },
          { label: `${stats.ready} READY`, accent: true },
          { label: 'NOT SENT' },
        ]}
      />

      <TabSwitcher p={p} value={tab} onChange={setTab} options={[
        { value: 'preflight', label: 'Pre-flight' },
        { value: 'batches', label: 'Batches' },
        { value: 'log', label: 'Log' },
      ]}/>

      {tab === 'preflight' && (
        <>
          {/* Pre-flight checklist */}
          <SectionEyebrow p={p} label="PRE-FLIGHT CHECKS"/>
          <Card p={p}>
            <CardRow p={p} chip={<RowChip p={p} icon="check" filled/>} title="Sender connected" sub={`${account.email.toUpperCase()}`} chevron={false}/>
            <CardRow p={p} chip={<RowChip p={p} icon="check" filled/>} title="Template saved" sub="LAST EDIT 4M AGO · 3 TOKENS" chevron={false}/>
            <CardRow p={p} chip={<RowChip p={p} icon="check" filled/>} title="Recipients validated" sub={`${stats.ready} READY · ${stats.missing} MISSING EMAIL`} chevron={false}/>
            <CardRow p={p} chip={<RowChip p={p} number="!"/>} title="Daily quota" sub={`${account.sentToday}/${account.dailyCap} USED TODAY · 453 REMAINING`} chevron={false} isLast/>
          </Card>

          {/* Stat strip */}
          <SectionEyebrow p={p} label="THIS SEND"/>
          <div style={{ padding: `0 ${RT.pagePadX}px 14px`, display: 'flex', gap: 10 }}>
            <StatChip p={p} label="QUEUED" value={stats.queued} color={p.accent}/>
            <StatChip p={p} label="SENT" value={stats.sent}/>
            <StatChip p={p} label="FAILED" value={stats.failed} color={p.bad}/>
          </div>

          {/* Schedule */}
          <SectionEyebrow p={p} label="SCHEDULE"/>
          <Card p={p}>
            {/* TODO[claude-code]: wire to scheduler API; today renders static options */}
            <CardRow p={p} chip={<RowChip p={p} number="◉"/>} title="Send now" sub="STAGGERED · 1 EVERY ~2 SEC" chevron={false}/>
            <CardRow p={p} chip={<RowChip p={p} number="○"/>} title="Schedule for later" sub="CHOOSE DATE & TIME" chevron isLast/>
          </Card>
        </>
      )}

      {tab === 'batches' && (
        <>
          <SectionEyebrow p={p} label={`BATCHES · ${batches.length}`}/>
          <Card p={p}>
            {batches.map((b, i) => (
              <CardRow
                key={b.id}
                p={p}
                chip={<RowChip p={p} number={String(i+1).padStart(2,'0')}/>}
                title={`${b.size} recipients`}
                sub={`${b.label} · ${b.when.toUpperCase()}`}
                right={<StatusPill p={p} label={b.status.toUpperCase()} tone="default"/>}
                chevron={false}
                isLast={i === batches.length - 1}
              />
            ))}
          </Card>
          <div style={{ padding: `8px ${RT.pagePadX}px 14px` }}>
            <div style={{ ...RT.fontMicro, color: p.ink3 }}>
              {/* TODO[claude-code]: batch sizing should respect Gmail per-second quota */}
              BATCHES STAGGER TO STAY UNDER GMAIL'S RATE LIMIT.
            </div>
          </div>
        </>
      )}

      {tab === 'log' && (
        <>
          <SectionEyebrow p={p} label="ACTIVITY"/>
          <Card p={p}>
            {/* Empty state — log populates after first send */}
            <div style={{ padding: '32px 18px', textAlign: 'center' }}>
              <div className="serif" style={{ fontStyle: 'italic', fontSize: 14, color: p.ink2 }}>No sends yet</div>
              <div style={{ ...RT.fontMicro, color: p.ink3, marginTop: 6 }}>RUN A BATCH TO SEE DELIVERY LOG</div>
            </div>
          </Card>
        </>
      )}

      <PrimaryButton p={p} sticky onClick={() => {}}>
        SEND {stats.queued} INVITATIONS →
      </PrimaryButton>
    </div>
  );
}

// ───────────────────────── Roster · Settings ─────────────────────────
function RosterSettings({ dark = false }) {
  const p = rPalette(dark);
  return (
    <div className="scr" style={{ background: p.bg, paddingTop: RT.pagePadTop, color: p.ink, paddingBottom: 24 }}>
      <PageHeader
        p={p}
        eyebrow="SETTINGS"
        title="Account & defaults"
        onBack={() => window.history && window.__convene_navigate?.('r-home')}
        right={null}
      />

      <SectionEyebrow p={p} label="ACCOUNT"/>
      <Card p={p}>
        <CardRow p={p} chip={<RowChip p={p} icon="user"/>} title="Lenya Chan" sub="LENYA@CIVICFOUNDATION.ORG"/>
        <CardRow p={p} chip={<RowChip p={p} icon="users"/>} title="Civic Foundation" sub="WORKSPACE · 3 MEMBERS"/>
        <CardRow p={p} chip={<RowChip p={p} icon="lock"/>} title="Sign-in & security" sub="2FA ENABLED" isLast/>
      </Card>

      <SectionEyebrow p={p} label="SENDING"/>
      <Card p={p}>
        <CardRow p={p} chip={<RowChip p={p} icon="mail"/>} title="Mail provider" sub="GMAIL · CONNECTED" right={<StatusPill p={p} label="OK" tone="good"/>}/>
        <CardRow p={p} chip={<RowChip p={p} icon="clock"/>} title="Daily quota" sub="500 / DAY · GMAIL FREE TIER"/>
        <CardRow p={p} chip={<RowChip p={p} icon="filter"/>} title="Default scout jurisdictions" sub="CALIFORNIA · ALAMEDA" isLast/>
      </Card>

      <SectionEyebrow p={p} label="APPEARANCE"/>
      <Card p={p}>
        <CardRow p={p} chip={<RowChip p={p} icon="moon"/>} title="Dark mode" sub={dark ? 'ON' : 'OFF'} chevron={false} right={<StatusPill p={p} label={dark ? 'ON' : 'OFF'} tone={dark ? 'accent' : 'default'}/>} isLast/>
      </Card>

      <SectionEyebrow p={p} label="DATA"/>
      <Card p={p}>
        <CardRow p={p} chip={<RowChip p={p} icon="download"/>} title="Export all events" sub="CSV · JSON"/>
        <CardRow p={p} chip={<RowChip p={p} icon="upload"/>} title="Import contacts" sub="CSV · GOOGLE CONTACTS" isLast/>
      </Card>

      <div style={{ padding: `12px ${RT.pagePadX}px 24px`, ...RT.fontMicro, color: p.ink3, textAlign: 'center' }}>
        CONVENE · ROSTER · v3.2
      </div>
    </div>
  );
}

// FilterChip — pill toggle in a horizontal scroll row. Used in Track filters.
function FilterChip({ p, active, onClick, label, count }) {
  return (
    <button onClick={onClick} className="tap" style={{
      padding: '6px 12px', borderRadius: 6, fontFamily: 'Geist Mono, monospace', fontSize: 10,
      background: active ? p.ink : 'transparent',
      color: active ? p.bg : p.ink2,
      border: `1px solid ${active ? p.ink : p.rule2}`,
      letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {label}{count != null && <span style={{ opacity: 0.6, marginLeft: 4 }}>{count}</span>}
    </button>
  );
}

Object.assign(window, { RosterHome, RosterEvents, RosterScout, RosterCompose, RosterTracker, RosterSend, RosterSettings, R_LIGHT, R_DARK });
