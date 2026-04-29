// Atelier — warm letterpress / stationery studio aesthetic.
// Single accent: terracotta. Type: Fraunces serif + Geist sans + Geist Mono.
// Density: comfortable. Tone: warm + slightly playful.

const A_PALETTE = {
  paper: '#f4ede0', paper2: '#ebe2d1', cream: '#fffbf2',
  ink: '#1a1612', ink2: '#3a322a', ink3: '#6b5d4d',
  rule: '#d6c9b3', accent: '#c8553d', accentDeep: '#9b3a26',
  gold: '#b8860b',
};

// ───────────────────────── Atelier · Home (workflow stages) ─────────────────────────
function AtelierHome({ showScout = true, density = 'comfortable', persona = 'nontech' }) {
  const stages = [
    { n: '01', title: 'Build the list', sub: showScout ? 'Discover & verify officials' : 'Import your contacts', key: 'list', count: '47 contacts', accent: true, scout: showScout },
    { n: '02', title: 'Compose the note', sub: 'Personalize with merge tokens', key: 'compose', count: 'Draft saved · 2 min ago' },
    { n: '03', title: 'Send the invitations', sub: 'Through your Gmail, in batches', key: 'send', count: 'Ready when you are' },
    { n: '04', title: 'Track who\'s coming', sub: 'RSVPs sync from Google Forms', key: 'track', count: '18 attending · 12 pending' },
  ];

  return (
    <div className="scr" style={{ background: A_PALETTE.paper, paddingTop: 50 }}>
      {/* Hero header */}
      <div style={{ padding: '24px 24px 28px' }}>
        <div className="eyebrow" style={{ color: A_PALETTE.ink3, marginBottom: 14 }}>
          ✻ &nbsp; Convene Suite &nbsp; ✻
        </div>
        <h1 className="display" style={{ fontSize: 38, lineHeight: 1.05, color: A_PALETTE.ink, letterSpacing: '-0.01em', fontWeight: 400 }}>
          Good morning, <em style={{ fontStyle: 'italic', color: A_PALETTE.accent }}>Lenya</em>.
        </h1>
        <p style={{ fontSize: 14, color: A_PALETTE.ink3, lineHeight: 1.55, marginTop: 10, fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>
          {persona === 'nontech'
            ? "Let's get your guests on the list and on their way."
            : 'Active campaign · 47 contacts · 12 sent today'}
        </p>
      </div>

      {/* Active event card */}
      <div style={{ margin: '0 20px 20px', background: A_PALETTE.cream, border: `1px solid ${A_PALETTE.rule}`, borderRadius: 14, padding: 18, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 12, right: 14, fontFamily: 'Geist Mono, monospace', fontSize: 9, color: A_PALETTE.ink3, letterSpacing: '0.14em' }}>ACTIVE</div>
        <div className="eyebrow" style={{ color: A_PALETTE.gold, marginBottom: 6 }}>The event</div>
        <div className="display" style={{ fontSize: 22, lineHeight: 1.15, color: A_PALETTE.ink, fontWeight: 400 }}>
          Annual Civic Leadership <em style={{ color: A_PALETTE.accent }}>Reception</em>
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 11, color: A_PALETTE.ink2, fontFamily: 'Geist Mono, monospace' }}>
          <span><Icon name="calendar" size={11} stroke={1.6} style={{ verticalAlign: -1, marginRight: 4 }}/>Jun 14</span>
          <span><Icon name="pin" size={11} stroke={1.6} style={{ verticalAlign: -1, marginRight: 4 }}/>Veterans Hall</span>
          <span><Icon name="users" size={11} stroke={1.6} style={{ verticalAlign: -1, marginRight: 4 }}/>47 invited</span>
        </div>
      </div>

      {/* Stages */}
      <div style={{ padding: '0 20px 16px' }}>
        <div className="ornament" style={{ fontFamily: 'Fraunces, serif', fontSize: 11, color: A_PALETTE.ink3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
          The four stages
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {stages.map((s, i) => (
            <button
              key={s.key}
              className="tap"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px',
                background: s.accent ? A_PALETTE.cream : 'transparent',
                border: `1px solid ${s.accent ? A_PALETTE.accent : A_PALETTE.rule}`,
                borderRadius: 12, textAlign: 'left',
                position: 'relative',
              }}
              onClick={() => window.__convene_navigate?.(s.key)}
            >
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: s.accent ? A_PALETTE.accent : 'transparent',
                color: s.accent ? '#fff' : A_PALETTE.ink2,
                border: s.accent ? 'none' : `1px solid ${A_PALETTE.rule}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Fraunces, serif', fontSize: 13, fontWeight: 600, flexShrink: 0,
              }}>{s.n}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="serif" style={{ fontSize: 17, color: A_PALETTE.ink, fontWeight: 500, letterSpacing: '-0.01em' }}>
                  {s.title}
                  {s.scout && <span className="stamp" style={{ marginLeft: 8, color: A_PALETTE.gold, fontSize: 8 }}>+ Scout</span>}
                </div>
                <div style={{ fontSize: 12, color: A_PALETTE.ink3, marginTop: 2 }}>{s.sub}</div>
                <div style={{ fontSize: 10, color: A_PALETTE.ink3, marginTop: 6, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.04em' }}>{s.count}</div>
              </div>
              <Icon name="chevron-right" size={16} stroke={1.5} style={{ color: A_PALETTE.ink3, flexShrink: 0 }}/>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 24px 32px', textAlign: 'center', fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 11, color: A_PALETTE.ink3 }}>
        ✻ &nbsp; A serverless suite &nbsp; ✻
      </div>
    </div>
  );
}

// ───────────────────────── Atelier · Scout (Discover) ─────────────────────────
function AtelierScout({ density = 'comfortable' }) {
  const [scanning, setScanning] = React.useState({});
  const [scanned, setScanned] = React.useState({ congress: true, 'state-senate': true });
  const [discovered, setDiscovered] = React.useState([
    { id: 'd1', name: 'Carla Mendez', title: 'Council Member, Hayward', cat: 'City', email: 'cmendez@hayward-ca.gov', verified: true, fresh: true },
    { id: 'd2', name: 'Theo Ostrowski', title: 'School Board, Berkeley USD', cat: 'Education', email: 'tostrowski@berkeley.net', verified: false, fresh: true },
    { id: 'd3', name: 'Mei-Lin Park', title: 'Mayor of Alameda', cat: 'City', email: '', verified: false, fresh: true },
  ]);

  function handleScan(id) {
    setScanning(s => ({ ...s, [id]: true }));
    setTimeout(() => {
      setScanning(s => ({ ...s, [id]: false }));
      setScanned(s => ({ ...s, [id]: true }));
    }, 1800);
  }

  function add(id) { setDiscovered(d => d.filter(x => x.id !== id)); }
  function dismiss(id) { setDiscovered(d => d.filter(x => x.id !== id)); }

  return (
    <div className="scr" style={{ background: A_PALETTE.paper, paddingTop: 50, paddingBottom: 24 }}>
      <div style={{ padding: '14px 20px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="tap" onClick={() => window.__convene_navigate?.('home')} style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${A_PALETTE.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: A_PALETTE.ink2 }}>
          <Icon name="chevron-right" size={14} style={{ transform: 'rotate(180deg)' }}/>
        </button>
        <div style={{ flex: 1 }}>
          <div className="eyebrow" style={{ color: A_PALETTE.gold }}>Stage 01 · Scout</div>
          <div className="serif" style={{ fontSize: 18, fontWeight: 500, color: A_PALETTE.ink }}>Discover officials</div>
        </div>
      </div>

      {/* Jurisdiction strip */}
      <div style={{ margin: '0 20px 16px', padding: '10px 12px', background: A_PALETTE.cream, border: `1px dashed ${A_PALETTE.rule}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="pin" size={14} stroke={1.6} style={{ color: A_PALETTE.accent }}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: A_PALETTE.ink3, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.06em' }}>SCANNING IN</div>
          <div style={{ fontSize: 13, color: A_PALETTE.ink, fontWeight: 500 }}>California · Alameda County · 4 cities</div>
        </div>
        <button style={{ fontSize: 11, color: A_PALETTE.accent, fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>Edit</button>
      </div>

      {/* Scan targets */}
      <div style={{ padding: '0 20px' }}>
        <div className="ornament" style={{ fontFamily: 'Fraunces, serif', fontSize: 11, color: A_PALETTE.ink3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          Where to look
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SCAN_TARGETS.map(t => {
            const isScanning = scanning[t.id];
            const isDone = scanned[t.id];
            return (
              <div key={t.id} className="tap" style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', background: isDone ? A_PALETTE.cream : 'transparent',
                border: `1px solid ${isDone ? A_PALETTE.rule : A_PALETTE.rule}`, borderRadius: 10,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="serif" style={{ fontSize: 14, fontWeight: 500, color: A_PALETTE.ink }}>{t.label}</div>
                  <div style={{ fontSize: 10, color: A_PALETTE.ink3, marginTop: 2, fontFamily: 'Geist Mono, monospace' }}>{t.hint}</div>
                </div>
                {isDone && (
                  <span className="stamp" style={{ color: A_PALETTE.accentDeep, borderColor: A_PALETTE.accentDeep }}>
                    <Icon name="check" size={9} stroke={2.2}/> {t.count} new
                  </span>
                )}
                <button
                  onClick={() => handleScan(t.id)}
                  disabled={isScanning}
                  className={isScanning ? 'scanning' : ''}
                  style={{
                    padding: '8px 14px', borderRadius: 99,
                    background: isDone ? 'transparent' : A_PALETTE.ink,
                    color: isDone ? A_PALETTE.ink2 : '#fff',
                    border: isDone ? `1px solid ${A_PALETTE.rule}` : 'none',
                    fontSize: 11, fontWeight: 500, fontFamily: 'Geist, sans-serif',
                  }}>
                  {isScanning ? 'Scanning…' : isDone ? 'Re-scan' : 'Scan'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fresh discoveries */}
      {discovered.length > 0 && (
        <div style={{ marginTop: 24, padding: '0 20px' }}>
          <div className="ornament" style={{ fontFamily: 'Fraunces, serif', fontSize: 11, color: A_PALETTE.accent, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            ✦ &nbsp; {discovered.length} fresh finds &nbsp; ✦
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {discovered.map(d => (
              <div key={d.id} style={{ background: A_PALETTE.cream, border: `1px solid ${A_PALETTE.accent}40`, borderRadius: 12, padding: 14, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <span className="stamp" style={{ color: A_PALETTE.accent, fontSize: 8 }}>NEW</span>
                </div>
                <div className="serif" style={{ fontSize: 16, fontWeight: 500, color: A_PALETTE.ink, paddingRight: 50 }}>{d.name}</div>
                <div style={{ fontSize: 12, color: A_PALETTE.ink2, marginTop: 2 }}>{d.title}</div>
                {d.email ? (
                  <div style={{ fontSize: 11, color: A_PALETTE.ink3, marginTop: 6, fontFamily: 'Geist Mono, monospace' }}>{d.email}</div>
                ) : (
                  <div style={{ fontSize: 11, color: A_PALETTE.gold, marginTop: 6, fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>No email yet · we'll infer one</div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={() => add(d.id)} className="tap" style={{ flex: 1, padding: '10px 14px', borderRadius: 99, background: A_PALETTE.accent, color: '#fff', fontSize: 13, fontWeight: 500 }}>
                    Add to list
                  </button>
                  <button onClick={() => dismiss(d.id)} className="tap" style={{ padding: '10px 14px', borderRadius: 99, background: 'transparent', color: A_PALETTE.ink3, fontSize: 13, border: `1px solid ${A_PALETTE.rule}` }}>
                    Skip
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ───────────────────────── Atelier · Compose ─────────────────────────
function AtelierCompose() {
  const [body, setBody] = React.useState(DEFAULT_TEMPLATE);
  const [subject, setSubject] = React.useState('You\'re invited — {{EventName}}');
  const taRef = React.useRef(null);

  function insertToken(t) {
    const ta = taRef.current; if (!ta) { setBody(b => b + ` {{${t}}}`); return; }
    const start = ta.selectionStart, end = ta.selectionEnd;
    const next = body.slice(0, start) + `{{${t}}}` + body.slice(end);
    setBody(next);
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = start + t.length + 4; }, 0);
  }

  // Live preview with one sample contact
  const sample = SAMPLE_OFFICIALS[0];
  const replacements = {
    FirstName: sample.name.split(' ')[0],
    LastName:  sample.name.split(' ').slice(-1)[0],
    FullTitle: 'Senator',
    EventName: 'Annual Civic Leadership Reception',
    EventDate: 'June 14, 2026',
    Venue: 'Veterans Memorial Hall',
    VIPStart: '5:30pm',
    VIPEnd: '6:30pm',
    RSVP_Link: 'rsvp.convene.app/abc123',
    ContactName: 'Lenya Chan',
    OrgName: 'Civic Foundation',
  };
  const preview = body.replace(/\{\{(\w+)\}\}/g, (_, k) => replacements[k] ?? `{{${k}}}`);
  const subjectPreview = subject.replace(/\{\{(\w+)\}\}/g, (_, k) => replacements[k] ?? `{{${k}}}`);

  return (
    <div className="scr" style={{ background: A_PALETTE.paper, paddingTop: 50, paddingBottom: 100 }}>
      <div style={{ padding: '14px 20px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => window.__convene_navigate?.('home')} className="tap" style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${A_PALETTE.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: A_PALETTE.ink2 }}>
          <Icon name="chevron-right" size={14} style={{ transform: 'rotate(180deg)' }}/>
        </button>
        <div style={{ flex: 1 }}>
          <div className="eyebrow" style={{ color: A_PALETTE.gold }}>Stage 02 · Compose</div>
          <div className="serif" style={{ fontSize: 18, fontWeight: 500, color: A_PALETTE.ink }}>Write the invitation</div>
        </div>
      </div>

      {/* Subject */}
      <div style={{ padding: '8px 20px 4px' }}>
        <label className="eyebrow" style={{ color: A_PALETTE.ink3, display: 'block', marginBottom: 6 }}>Subject line</label>
        <input
          value={subject}
          onChange={e => setSubject(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px', border: `1px solid ${A_PALETTE.rule}`,
            borderRadius: 8, background: A_PALETTE.cream, fontSize: 13, color: A_PALETTE.ink,
            fontFamily: 'Geist, sans-serif',
          }}
        />
      </div>

      {/* Body */}
      <div style={{ padding: '12px 20px 0' }}>
        <label className="eyebrow" style={{ color: A_PALETTE.ink3, display: 'block', marginBottom: 6 }}>Letter body</label>
        <textarea
          ref={taRef}
          value={body}
          onChange={e => setBody(e.target.value)}
          style={{
            width: '100%', minHeight: 180, padding: 14, border: `1px solid ${A_PALETTE.rule}`,
            borderRadius: 8, background: A_PALETTE.cream, fontSize: 13, lineHeight: 1.6,
            color: A_PALETTE.ink, fontFamily: 'Fraunces, serif', resize: 'none',
          }}
        />
      </div>

      {/* Token chips */}
      <div style={{ padding: '14px 20px 0' }}>
        <div className="eyebrow" style={{ color: A_PALETTE.ink3, marginBottom: 8 }}>Tap to insert a placeholder</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {TOKENS.map(t => (
            <button key={t} onClick={() => insertToken(t)}
              style={{
                padding: '6px 11px', borderRadius: 99,
                background: A_PALETTE.cream, border: `1px solid ${A_PALETTE.rule}`,
                fontFamily: 'Geist Mono, monospace', fontSize: 10, color: A_PALETTE.ink2,
                letterSpacing: '0.03em',
              }}>
              {`{{${t}}}`}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div style={{ padding: '20px 20px 0' }}>
        <div className="ornament" style={{ fontFamily: 'Fraunces, serif', fontSize: 11, color: A_PALETTE.ink3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
          Preview · as Sen. Hernandez will see it
        </div>
        <div style={{
          background: A_PALETTE.cream, border: `1px solid ${A_PALETTE.rule}`, borderRadius: 12,
          padding: 18, position: 'relative',
        }}>
          {/* Wax seal */}
          <div style={{ position: 'absolute', top: -10, right: 18, width: 28, height: 28, borderRadius: '50%', background: A_PALETTE.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
            <span style={{ color: '#fff', fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 13 }}>C</span>
          </div>
          <div style={{ fontSize: 11, color: A_PALETTE.ink3, fontFamily: 'Geist Mono, monospace', marginBottom: 4 }}>Subject</div>
          <div className="serif" style={{ fontSize: 14, color: A_PALETTE.ink, fontWeight: 500, marginBottom: 14, paddingRight: 36 }}>{subjectPreview}</div>
          <div style={{ borderTop: `1px solid ${A_PALETTE.rule}`, paddingTop: 14, fontFamily: 'Fraunces, serif', fontSize: 13, lineHeight: 1.7, color: A_PALETTE.ink2, whiteSpace: 'pre-wrap' }}>
            {preview}
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 20px 24px', background: `linear-gradient(to top, ${A_PALETTE.paper} 60%, transparent)` }}>
        <button className="tap" style={{ width: '100%', padding: '14px', borderRadius: 99, background: A_PALETTE.accent, color: '#fff', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="check" size={14} stroke={2}/> Save & continue to Send
        </button>
      </div>
    </div>
  );
}

// ───────────────────────── Atelier · Tracker ─────────────────────────
function AtelierTracker() {
  const [filter, setFilter] = React.useState('all');
  const counts = {
    all: SAMPLE_OFFICIALS.length,
    attending: SAMPLE_OFFICIALS.filter(o => o.rsvp === 'attending').length,
    pending: SAMPLE_OFFICIALS.filter(o => o.rsvp === 'pending').length,
    declined: SAMPLE_OFFICIALS.filter(o => o.rsvp === 'declined').length,
  };
  const filtered = filter === 'all' ? SAMPLE_OFFICIALS : SAMPLE_OFFICIALS.filter(o => o.rsvp === filter);

  return (
    <div className="scr" style={{ background: A_PALETTE.paper, paddingTop: 50, paddingBottom: 24 }}>
      <div style={{ padding: '14px 20px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => window.__convene_navigate?.('home')} className="tap" style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${A_PALETTE.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: A_PALETTE.ink2 }}>
          <Icon name="chevron-right" size={14} style={{ transform: 'rotate(180deg)' }}/>
        </button>
        <div style={{ flex: 1 }}>
          <div className="eyebrow" style={{ color: A_PALETTE.gold }}>Stage 04 · Track</div>
          <div className="serif" style={{ fontSize: 18, fontWeight: 500, color: A_PALETTE.ink }}>Who's coming</div>
        </div>
      </div>

      {/* Big number hero */}
      <div style={{ padding: '4px 20px 16px', textAlign: 'center' }}>
        <div className="display" style={{ fontSize: 76, lineHeight: 1, color: A_PALETTE.ink, letterSpacing: '-0.03em', fontWeight: 400 }}>
          <em style={{ color: A_PALETTE.accent }}>{counts.attending}</em>
          <span style={{ fontSize: 28, color: A_PALETTE.ink3 }}> / {counts.all}</span>
        </div>
        <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 14, color: A_PALETTE.ink3, marginTop: 6 }}>
          confirmed guests so far
        </div>

        {/* Visual bar (papercut style) */}
        <div style={{ display: 'flex', height: 8, marginTop: 18, borderRadius: 99, overflow: 'hidden', border: `1px solid ${A_PALETTE.rule}` }}>
          <div style={{ width: `${counts.attending / counts.all * 100}%`, background: A_PALETTE.accent }}/>
          <div style={{ width: `${counts.pending / counts.all * 100}%`, background: A_PALETTE.gold, opacity: 0.4 }}/>
          <div style={{ width: `${counts.declined / counts.all * 100}%`, background: A_PALETTE.ink2, opacity: 0.3 }}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: A_PALETTE.ink3, marginTop: 6, fontFamily: 'Geist Mono, monospace' }}>
          <span>{counts.attending} yes</span>
          <span>{counts.pending} pending</span>
          <span>{counts.declined} no</span>
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ padding: '0 20px 12px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {[
          { k: 'all', l: 'Everyone', c: counts.all },
          { k: 'attending', l: 'Attending', c: counts.attending },
          { k: 'pending', l: 'No reply', c: counts.pending },
          { k: 'declined', l: 'Declined', c: counts.declined },
        ].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)} className="tap" style={{
            padding: '8px 14px', borderRadius: 99,
            background: filter === f.k ? A_PALETTE.ink : 'transparent',
            color: filter === f.k ? A_PALETTE.cream : A_PALETTE.ink2,
            border: `1px solid ${filter === f.k ? A_PALETTE.ink : A_PALETTE.rule}`,
            fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {f.l} <span style={{ opacity: 0.6, marginLeft: 4 }}>{f.c}</span>
          </button>
        ))}
      </div>

      {/* Guest list */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.map((o, i) => {
            const meta = o.rsvp === 'attending' ? { label: 'Attending', color: A_PALETTE.accent }
                       : o.rsvp === 'declined'  ? { label: 'Declined',  color: A_PALETTE.ink3 }
                       : { label: 'No reply yet', color: A_PALETTE.gold };
            return (
              <div key={o.id} className="tap" style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0',
                borderBottom: i < filtered.length - 1 ? `1px solid ${A_PALETTE.rule}` : 'none',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: A_PALETTE.cream, border: `1px solid ${A_PALETTE.rule}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Fraunces, serif', fontSize: 13, color: A_PALETTE.ink2, fontWeight: 500,
                  flexShrink: 0,
                }}>
                  {o.name.split(' ').map(p => p[0]).slice(0, 2).join('')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="serif" style={{ fontSize: 14, fontWeight: 500, color: A_PALETTE.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.name}</div>
                  <div style={{ fontSize: 11, color: A_PALETTE.ink3, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.title}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span className="seal" style={{ color: meta.color, width: 6, height: 6 }}/>
                  <span style={{ fontSize: 10, color: meta.color, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.06em' }}>{meta.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AtelierHome, AtelierScout, AtelierCompose, AtelierTracker, A_PALETTE });
