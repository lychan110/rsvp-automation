// Salon — editorial / magazine direction. Big numbers, mixed rhythm.
// Same warm palette + accent. Soft pastel chip variations for category color-coding.

const S_PALETTE = {
  bg: '#f0e9da', paper: '#faf6ec',
  ink: '#1a1612', ink2: '#4a4339', ink3: '#8a8170',
  rule: '#ddd2bc',
  accent: '#c8553d', blush: '#e8c5b4', sage: '#a8b89a', sky: '#b8cfd6', butter: '#e8d4a8',
};
const CAT_TINT = {
  'Congress': '#e8c5b4', 'State Senate': '#b8cfd6', 'State House': '#a8b89a',
  'County': '#e8d4a8', 'City': '#d4bfdc', 'Education': '#c5dcc5',
};

// ──────── Salon · Home ────────
function SalonHome({ showScout = true, density = 'comfortable', persona = 'nontech' }) {
  return (
    <div className="scr" style={{ background: S_PALETTE.bg, paddingTop: 50 }}>
      {/* Magazine masthead */}
      <div style={{ padding: '20px 22px 18px', borderBottom: `1px solid ${S_PALETTE.rule}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="eyebrow" style={{ color: S_PALETTE.ink3 }}>VOL · 03 / SPRING</div>
          <div className="eyebrow" style={{ color: S_PALETTE.ink3 }}>APR · 28</div>
        </div>
        <div className="display" style={{ fontSize: 56, lineHeight: 0.95, color: S_PALETTE.ink, letterSpacing: '-0.03em', fontWeight: 400, marginTop: 14 }}>
          Convene<em style={{ color: S_PALETTE.accent }}>.</em>
        </div>
        <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 13, color: S_PALETTE.ink2, marginTop: 6 }}>
          A quarterly journal of your guest list.
        </div>
      </div>

      {/* Lead story — the active event */}
      <div style={{ padding: '20px 22px 12px' }}>
        <div className="eyebrow" style={{ color: S_PALETTE.accent, marginBottom: 8 }}>♢ Cover story</div>
        <div className="display" style={{ fontSize: 30, lineHeight: 1.05, color: S_PALETTE.ink, fontWeight: 400, letterSpacing: '-0.01em' }}>
          The Annual Civic <em style={{ color: S_PALETTE.accent }}>Reception</em>, in numbers.
        </div>
      </div>

      {/* Three-column big numbers */}
      <div style={{ padding: '12px 22px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {[
          { n: 47, l: 'invited' }, { n: 35, l: 'sent' }, { n: 18, l: 'attending' },
        ].map(s => (
          <div key={s.l} style={{ background: S_PALETTE.paper, border: `1px solid ${S_PALETTE.rule}`, borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
            <div className="display" style={{ fontSize: 36, lineHeight: 1, color: S_PALETTE.ink, fontWeight: 400, letterSpacing: '-0.02em' }}>{s.n}</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 11, color: S_PALETTE.ink3, marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Pull quote */}
      <div style={{ margin: '0 22px 22px', padding: '16px 18px', background: S_PALETTE.paper, borderLeft: `3px solid ${S_PALETTE.accent}`, borderRadius: '0 8px 8px 0' }}>
        <div className="display" style={{ fontSize: 18, lineHeight: 1.35, color: S_PALETTE.ink, fontStyle: 'italic', fontWeight: 400 }}>
          "12 invitations went out this morning. 4 replies already."
        </div>
        <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, color: S_PALETTE.ink3, marginTop: 8, letterSpacing: '0.12em' }}>— TODAY'S MOMENTUM</div>
      </div>

      {/* Sections grid */}
      <div style={{ padding: '0 22px 14px' }}>
        <div className="ornament" style={{ fontFamily: 'Fraunces, serif', fontSize: 11, color: S_PALETTE.ink3, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>
          In this issue
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { k: 'list',    n: 'I',   l: 'The Roster',  s: '47 names', c: S_PALETTE.blush, badge: showScout ? '+ Scout' : null },
            { k: 'compose', n: 'II',  l: 'The Letter',  s: 'draft saved', c: S_PALETTE.butter },
            { k: 'send',    n: 'III', l: 'The Send',    s: '12 today', c: S_PALETTE.sage },
            { k: 'track',   n: 'IV',  l: 'The Replies', s: '18 yes', c: S_PALETTE.sky },
          ].map(s => (
            <button key={s.k} onClick={() => window.__convene_navigate?.('s-' + s.k)} className="tap" style={{
              padding: '14px 12px', background: S_PALETTE.paper, border: `1px solid ${S_PALETTE.rule}`,
              borderRadius: 12, textAlign: 'left', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 28, height: 28, background: s.c, borderRadius: '0 12px 0 12px' }}/>
              <div className="display" style={{ fontSize: 22, color: S_PALETTE.ink3, fontWeight: 400, fontStyle: 'italic' }}>{s.n}</div>
              <div className="display" style={{ fontSize: 18, color: S_PALETTE.ink, fontWeight: 400, marginTop: 4 }}>{s.l}</div>
              <div style={{ fontSize: 10, color: S_PALETTE.ink3, marginTop: 4, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.06em' }}>{s.s}</div>
              {s.badge && <div style={{ marginTop: 6, fontSize: 9, color: S_PALETTE.accent, fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>{s.badge}</div>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 22px 28px', textAlign: 'center', fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 11, color: S_PALETTE.ink3 }}>
        ✻ &nbsp; continued on next page &nbsp; ✻
      </div>
    </div>
  );
}

// ──────── Salon · Scout ────────
function SalonScout() {
  const [scanning, setScanning] = React.useState({});
  const [scanned, setScanned] = React.useState({ congress: 1, 'state-senate': 2 });
  const [discovered, setDiscovered] = React.useState([
    { id: 'd1', name: 'Carla Mendez', title: 'Council Member, Hayward', cat: 'City', email: 'cmendez@hayward-ca.gov' },
    { id: 'd2', name: 'Theo Ostrowski', title: 'School Board, Berkeley USD', cat: 'Education', email: 'tostrowski@berkeley.net' },
    { id: 'd3', name: 'Mei-Lin Park', title: 'Mayor of Alameda', cat: 'City', email: '' },
  ]);
  function scan(id) {
    setScanning(s => ({ ...s, [id]: true }));
    setTimeout(() => { setScanning(s => ({ ...s, [id]: false })); setScanned(s => ({ ...s, [id]: (s[id] || 0) + 2 })); }, 1500);
  }

  return (
    <div className="scr" style={{ background: S_PALETTE.bg, paddingTop: 50, paddingBottom: 24 }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => window.__convene_navigate?.('s-home')} style={{ width: 32, height: 32, borderRadius: 99, border: `1px solid ${S_PALETTE.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S_PALETTE.ink2 }}>
          <Icon name="chevron-right" size={14} style={{ transform: 'rotate(180deg)' }}/>
        </button>
        <div className="eyebrow" style={{ color: S_PALETTE.ink3 }}>♦ SECTION I · THE ROSTER</div>
      </div>

      <div style={{ padding: '14px 22px 8px' }}>
        <div className="display" style={{ fontSize: 38, lineHeight: 1, color: S_PALETTE.ink, fontWeight: 400, letterSpacing: '-0.02em' }}>
          Scout<em style={{ fontStyle: 'italic', color: S_PALETTE.accent }}>.</em>
        </div>
        <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 14, color: S_PALETTE.ink2, marginTop: 4 }}>
          On finding the right people to invite.
        </div>
      </div>

      {/* Jurisdiction */}
      <div style={{ margin: '14px 22px 18px', padding: '10px 14px', background: S_PALETTE.paper, border: `1px solid ${S_PALETTE.rule}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="pin" size={14} style={{ color: S_PALETTE.accent }}/>
        <div style={{ flex: 1, fontSize: 12, color: S_PALETTE.ink2, fontFamily: 'Fraunces, serif' }}>
          California · Alameda County · 4 cities
        </div>
        <button style={{ fontSize: 11, color: S_PALETTE.accent, fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>change</button>
      </div>

      <div style={{ padding: '0 22px 6px' }}>
        <div className="ornament" style={{ fontFamily: 'Fraunces, serif', fontSize: 11, color: S_PALETTE.ink3, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
          Six places to look
        </div>
      </div>

      <div style={{ padding: '0 22px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SCAN_TARGETS.map(t => {
          const isScan = scanning[t.id];
          const got = scanned[t.id];
          const tint = CAT_TINT[t.label.includes('Congress') ? 'Congress' : t.label.includes('Senate') ? 'State Senate' : t.label.includes('Assembly') ? 'State House' : t.label.includes('County') ? 'County' : t.label.includes('Mayor') ? 'City' : 'Education'];
          return (
            <div key={t.id} className="tap" style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', background: S_PALETTE.paper,
              border: `1px solid ${S_PALETTE.rule}`, borderRadius: 12,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ width: 4, alignSelf: 'stretch', background: tint, borderRadius: 2 }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="serif" style={{ fontSize: 14, fontWeight: 500, color: S_PALETTE.ink }}>{t.label}</div>
                <div style={{ fontSize: 10, color: S_PALETTE.ink3, marginTop: 2, fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>{t.hint}</div>
              </div>
              {got !== undefined && (
                <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 12, color: S_PALETTE.accent }}>+{got} new</span>
              )}
              <button
                onClick={() => scan(t.id)} disabled={isScan}
                className={isScan ? 'scanning' : ''}
                style={{
                  padding: '8px 14px', borderRadius: 99,
                  background: got !== undefined ? 'transparent' : S_PALETTE.ink, color: got !== undefined ? S_PALETTE.ink2 : S_PALETTE.paper,
                  border: got !== undefined ? `1px solid ${S_PALETTE.rule}` : 'none',
                  fontSize: 11, fontWeight: 500, fontFamily: 'Fraunces, serif',
                }}>{isScan ? 'looking…' : got !== undefined ? 'again' : 'look'}</button>
            </div>
          );
        })}
      </div>

      {discovered.length > 0 && (
        <>
          <div style={{ padding: '0 22px 6px' }}>
            <div className="ornament" style={{ fontFamily: 'Fraunces, serif', fontSize: 11, color: S_PALETTE.accent, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
              ♢ {discovered.length} new arrivals ♢
            </div>
          </div>

          <div style={{ padding: '0 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {discovered.map(d => (
              <div key={d.id} style={{ background: S_PALETTE.paper, border: `1px solid ${S_PALETTE.rule}`, borderRadius: 12, padding: 14, display: 'flex', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: CAT_TINT[d.cat] || S_PALETTE.blush, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 14, color: S_PALETTE.ink, fontWeight: 500, flexShrink: 0 }}>
                  {d.name.split(' ').map(p => p[0]).slice(0, 2).join('')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="serif" style={{ fontSize: 15, fontWeight: 500, color: S_PALETTE.ink }}>{d.name}</div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 12, color: S_PALETTE.ink2, marginTop: 1 }}>{d.title}</div>
                  <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: d.email ? S_PALETTE.ink3 : S_PALETTE.accent, marginTop: 6 }}>
                    {d.email || 'inferring email…'}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button onClick={() => setDiscovered(arr => arr.filter(x => x.id !== d.id))} style={{ padding: '6px 14px', borderRadius: 99, background: S_PALETTE.accent, color: '#fff', fontSize: 11, fontWeight: 500 }}>Add</button>
                    <button onClick={() => setDiscovered(arr => arr.filter(x => x.id !== d.id))} style={{ padding: '6px 14px', borderRadius: 99, background: 'transparent', color: S_PALETTE.ink3, fontSize: 11, border: `1px solid ${S_PALETTE.rule}` }}>Skip</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ──────── Salon · Compose ────────
function SalonCompose() {
  const [body, setBody] = React.useState(DEFAULT_TEMPLATE);
  const [subject, setSubject] = React.useState("You're invited — {{EventName}}");
  const taRef = React.useRef(null);

  function insertToken(t) {
    const ta = taRef.current; if (!ta) { setBody(b => b + ` {{${t}}}`); return; }
    const start = ta.selectionStart, end = ta.selectionEnd;
    setBody(body.slice(0, start) + `{{${t}}}` + body.slice(end));
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = start + t.length + 4; }, 0);
  }

  const sample = SAMPLE_OFFICIALS[0];
  const reps = { FirstName: 'Maria', LastName: 'Hernandez', FullTitle: 'Senator', EventName: 'Annual Civic Leadership Reception', EventDate: 'June 14, 2026', Venue: 'Veterans Memorial Hall', VIPStart: '5:30pm', VIPEnd: '6:30pm', RSVP_Link: 'rsvp.convene.app/abc', ContactName: 'Lenya Chan', OrgName: 'Civic Foundation' };
  const fill = s => s.replace(/\{\{(\w+)\}\}/g, (_, k) => reps[k] ?? `{{${k}}}`);

  return (
    <div className="scr" style={{ background: S_PALETTE.bg, paddingTop: 50, paddingBottom: 110 }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => window.__convene_navigate?.('s-home')} style={{ width: 32, height: 32, borderRadius: 99, border: `1px solid ${S_PALETTE.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S_PALETTE.ink2 }}>
          <Icon name="chevron-right" size={14} style={{ transform: 'rotate(180deg)' }}/>
        </button>
        <div className="eyebrow" style={{ color: S_PALETTE.ink3 }}>♦ SECTION II · THE LETTER</div>
      </div>

      <div style={{ padding: '14px 22px 14px' }}>
        <div className="display" style={{ fontSize: 38, lineHeight: 1, color: S_PALETTE.ink, fontWeight: 400, letterSpacing: '-0.02em' }}>
          Compose<em style={{ fontStyle: 'italic', color: S_PALETTE.accent }}>.</em>
        </div>
        <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 14, color: S_PALETTE.ink2, marginTop: 4 }}>
          One letter. Forty-seven personal notes.
        </div>
      </div>

      {/* Subject */}
      <div style={{ padding: '0 22px 12px' }}>
        <div className="eyebrow" style={{ color: S_PALETTE.ink3, marginBottom: 6 }}>♢ Subject</div>
        <input
          value={subject} onChange={e => setSubject(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px', border: `1px solid ${S_PALETTE.rule}`,
            borderRadius: 8, background: S_PALETTE.paper, fontSize: 14,
            fontFamily: 'Fraunces, serif', color: S_PALETTE.ink,
          }}
        />
      </div>

      {/* Body */}
      <div style={{ padding: '0 22px 12px' }}>
        <div className="eyebrow" style={{ color: S_PALETTE.ink3, marginBottom: 6 }}>♢ Body of the letter</div>
        <textarea
          ref={taRef}
          value={body} onChange={e => setBody(e.target.value)}
          style={{
            width: '100%', minHeight: 200, padding: 16, border: `1px solid ${S_PALETTE.rule}`,
            borderRadius: 8, background: S_PALETTE.paper, fontSize: 14, lineHeight: 1.65,
            color: S_PALETTE.ink, fontFamily: 'Fraunces, serif', resize: 'none',
          }}
        />
      </div>

      {/* Tokens — palette-style */}
      <div style={{ padding: '0 22px 16px' }}>
        <div className="eyebrow" style={{ color: S_PALETTE.ink3, marginBottom: 8 }}>♢ Insert a placeholder</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {TOKENS.map((t, i) => (
            <button key={t} onClick={() => insertToken(t)}
              style={{
                padding: '6px 12px', borderRadius: 99,
                background: [S_PALETTE.blush, S_PALETTE.butter, S_PALETTE.sage, S_PALETTE.sky][i % 4],
                fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 12, color: S_PALETTE.ink,
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div style={{ padding: '0 22px 0' }}>
        <div className="ornament" style={{ fontFamily: 'Fraunces, serif', fontSize: 11, color: S_PALETTE.ink3, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
          ✻ A reading ✻
        </div>
        <div style={{ background: S_PALETTE.paper, border: `1px solid ${S_PALETTE.rule}`, borderRadius: 12, padding: 18, position: 'relative' }}>
          <div style={{ position: 'absolute', top: -12, left: 18, padding: '2px 8px', background: S_PALETTE.bg, fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 11, color: S_PALETTE.ink3 }}>
            for {sample.name}
          </div>
          <div className="serif" style={{ fontSize: 15, fontWeight: 500, color: S_PALETTE.ink, marginBottom: 12, paddingTop: 4 }}>
            {fill(subject)}
          </div>
          <div style={{ borderTop: `1px solid ${S_PALETTE.rule}`, paddingTop: 12, fontFamily: 'Fraunces, serif', fontSize: 13, lineHeight: 1.7, color: S_PALETTE.ink2, whiteSpace: 'pre-wrap' }}>
            {fill(body)}
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 22px 22px', background: `linear-gradient(to top, ${S_PALETTE.bg} 60%, transparent)` }}>
        <button className="tap" style={{ width: '100%', padding: '14px', borderRadius: 99, background: S_PALETTE.accent, color: '#fff', fontSize: 14, fontWeight: 500, fontFamily: 'Fraunces, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          Continue → The Send
        </button>
      </div>
    </div>
  );
}

// ──────── Salon · Tracker ────────
function SalonTracker() {
  const [filter, setFilter] = React.useState('all');
  const counts = {
    all: SAMPLE_OFFICIALS.length,
    attending: SAMPLE_OFFICIALS.filter(o => o.rsvp === 'attending').length,
    pending: SAMPLE_OFFICIALS.filter(o => o.rsvp === 'pending').length,
    declined: SAMPLE_OFFICIALS.filter(o => o.rsvp === 'declined').length,
  };
  const filtered = filter === 'all' ? SAMPLE_OFFICIALS : SAMPLE_OFFICIALS.filter(o => o.rsvp === filter);

  return (
    <div className="scr" style={{ background: S_PALETTE.bg, paddingTop: 50, paddingBottom: 24 }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => window.__convene_navigate?.('s-home')} style={{ width: 32, height: 32, borderRadius: 99, border: `1px solid ${S_PALETTE.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S_PALETTE.ink2 }}>
          <Icon name="chevron-right" size={14} style={{ transform: 'rotate(180deg)' }}/>
        </button>
        <div className="eyebrow" style={{ color: S_PALETTE.ink3 }}>♦ SECTION IV · THE REPLIES</div>
      </div>

      <div style={{ padding: '14px 22px 6px' }}>
        <div className="display" style={{ fontSize: 38, lineHeight: 1, color: S_PALETTE.ink, fontWeight: 400, letterSpacing: '-0.02em' }}>
          The Replies<em style={{ fontStyle: 'italic', color: S_PALETTE.accent }}>.</em>
        </div>
      </div>

      {/* Hero stat — magazine style */}
      <div style={{ padding: '14px 22px 18px' }}>
        <div style={{ background: S_PALETTE.paper, border: `1px solid ${S_PALETTE.rule}`, borderRadius: 14, padding: '20px 18px', position: 'relative', overflow: 'hidden' }}>
          {/* corner decoration */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: S_PALETTE.blush, borderRadius: '0 14px 0 60px' }}/>
          <div className="eyebrow" style={{ color: S_PALETTE.accent, marginBottom: 6 }}>So far</div>
          <div className="display" style={{ fontSize: 84, lineHeight: 0.9, color: S_PALETTE.ink, letterSpacing: '-0.04em', fontWeight: 400 }}>
            {counts.attending}<span style={{ fontSize: 32, color: S_PALETTE.ink3 }}>/{counts.all}</span>
          </div>
          <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 14, color: S_PALETTE.ink2, marginTop: 6 }}>
            have said yes.
          </div>

          {/* Donut-ish breakdown using stacked horiz bar */}
          <div style={{ display: 'flex', gap: 4, marginTop: 16 }}>
            <div style={{ flex: counts.attending, height: 6, background: S_PALETTE.accent, borderRadius: 3 }}/>
            <div style={{ flex: counts.pending, height: 6, background: S_PALETTE.butter, borderRadius: 3 }}/>
            <div style={{ flex: counts.declined, height: 6, background: S_PALETTE.ink2, borderRadius: 3, opacity: 0.4 }}/>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ padding: '0 22px 12px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {[
          { k: 'all', l: 'Everyone', c: counts.all },
          { k: 'attending', l: 'Yes', c: counts.attending },
          { k: 'pending', l: 'No reply', c: counts.pending },
          { k: 'declined', l: 'Regrets', c: counts.declined },
        ].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)} className="tap" style={{
            padding: '8px 14px', borderRadius: 99, fontFamily: 'Fraunces, serif', fontStyle: 'italic',
            background: filter === f.k ? S_PALETTE.ink : S_PALETTE.paper,
            color: filter === f.k ? S_PALETTE.paper : S_PALETTE.ink2,
            border: `1px solid ${filter === f.k ? S_PALETTE.ink : S_PALETTE.rule}`,
            fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {f.l} <span style={{ opacity: 0.6, marginLeft: 4 }}>{f.c}</span>
          </button>
        ))}
      </div>

      {/* Magazine-style guest list — paired rows with category color */}
      <div style={{ padding: '0 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(o => {
          const tint = CAT_TINT[o.cat] || S_PALETTE.blush;
          const meta = o.rsvp === 'attending' ? { l: 'attending', c: S_PALETTE.accent }
                     : o.rsvp === 'declined' ? { l: 'regrets', c: S_PALETTE.ink3 }
                     : { l: 'pending', c: S_PALETTE.ink3 };
          return (
            <div key={o.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', background: S_PALETTE.paper,
              border: `1px solid ${S_PALETTE.rule}`, borderRadius: 10,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 13, color: S_PALETTE.ink, fontWeight: 500, flexShrink: 0 }}>
                {o.name.split(' ').map(p => p[0]).slice(0, 2).join('')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="serif" style={{ fontSize: 14, fontWeight: 500, color: S_PALETTE.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.name}</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 11, color: S_PALETTE.ink3, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.title}</div>
              </div>
              <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 11, color: meta.c, flexShrink: 0 }}>
                {meta.l}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { SalonHome, SalonScout, SalonCompose, SalonTracker, S_PALETTE });
