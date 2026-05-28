// app.jsx — root mount: design canvas with three direction columns + tweaks panel.

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "productName": "Convene",
  "showScout": true,
  "persona": "nontech",
  "density": "comfortable",
  "rosterDark": false
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(DEFAULTS);
  // Per-direction screen state
  const [aScreen, setAScreen] = React.useState('home');
  const [rScreen, setRScreen] = React.useState('events');
  const [sScreen, setSScreen] = React.useState('home');

  // Wire navigate callbacks for all three columns
  React.useEffect(() => {
    window.__convene_navigate = (key) => {
      if (key === 'home') return setAScreen('home');
      if (['list', 'compose', 'send', 'track'].includes(key)) {
        // Atelier route — list goes to scout
        if (key === 'list')    return setAScreen('scout');
        if (key === 'compose') return setAScreen('compose');
        if (key === 'track')   return setAScreen('track');
        if (key === 'send')    return setAScreen('send');
      }
      if (key.startsWith('r-')) {
        const k = key.slice(2);
        if (k === 'events') return setRScreen('events');
        if (k === 'home') return setRScreen('home');
        if (k.startsWith('event-')) return setRScreen('home'); // event card → dashboard
        if (k === 'scout' || k === 'list') return setRScreen('scout');
        if (k === 'compose') return setRScreen('compose');
        if (k === 'track') return setRScreen('track');
        if (k === 'send') return setRScreen('send');
        if (k === 'settings') return setRScreen('settings');
      }
      if (key.startsWith('s-')) {
        const k = key.slice(2);
        if (k === 'home') return setSScreen('home');
        if (k === 'list') return setSScreen('scout');
        if (k === 'compose') return setSScreen('compose');
        if (k === 'track') return setSScreen('track');
        if (k === 'send') return setSScreen('send');
      }
    };
  }, []);

  // Render the selected screen for each direction
  function renderAtelier() {
    const props = { showScout: tweaks.showScout, density: tweaks.density, persona: tweaks.persona };
    if (aScreen === 'scout')   return <AtelierScout {...props}/>;
    if (aScreen === 'compose') return <AtelierCompose {...props}/>;
    if (aScreen === 'track')   return <AtelierTracker {...props}/>;
    if (aScreen === 'send')    return <ComingSoon dir="atelier" title="The Send" sub="Stage 03 · Sending" onBack={() => setAScreen('home')}/>;
    return <AtelierHome {...props}/>;
  }
  function renderRoster() {
    const props = { dark: tweaks.rosterDark, showScout: tweaks.showScout, density: tweaks.density };
    if (rScreen === 'home')    return <RosterHome {...props}/>;
    if (rScreen === 'scout')   return <RosterScout {...props}/>;
    if (rScreen === 'compose') return <RosterCompose {...props}/>;
    if (rScreen === 'track')   return <RosterTracker {...props}/>;
    if (rScreen === 'send')    return <RosterSend {...props}/>;
    if (rScreen === 'settings') return <RosterSettings {...props}/>;
    return <RosterEvents {...props}/>;
  }
  function renderSalon() {
    const props = { showScout: tweaks.showScout, density: tweaks.density, persona: tweaks.persona };
    if (sScreen === 'scout')   return <SalonScout {...props}/>;
    if (sScreen === 'compose') return <SalonCompose {...props}/>;
    if (sScreen === 'track')   return <SalonTracker {...props}/>;
    if (sScreen === 'send')    return <ComingSoon dir="salon" title="The Send" sub="Section III" onBack={() => setSScreen('home')}/>;
    return <SalonHome {...props}/>;
  }

  // Capture-phase listener: when one phone navigates, the canvas captures
  // the click. We use a ref so navigate callback knows which column it came from.
  // Simplest approach: each direction's navigate handler sets state directly.
  // We override window.__convene_navigate per artboard hover via mouse events isn't
  // reliable, so we encode the prefix in nav keys (already done above).

  return (
    <>
      <DesignCanvas>
        <DCSection id="hero" title="Convene · Invitation Suite" subtitle="Three redesigns of ContactScout + InviteFlow with one shared design language. Mobile-first, built for 200+ guests. Tap stages on each home screen to explore.">
          <DCArtboard id="atelier" label="A · Atelier — letterpress studio" width={395} height={760} style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
            <div className="phone-shell">
              <Phone bg={A_PALETTE.paper} screenLabel="A · Atelier">{renderAtelier()}</Phone>
            </div>
          </DCArtboard>
          <DCArtboard id="roster" label={`B · Roster — power-user ${tweaks.rosterDark ? 'dark' : 'light'}`} width={395} height={760} style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
            <div className="phone-shell">
              <Phone bg={tweaks.rosterDark ? R_DARK.bg : R_LIGHT.bg} dark={tweaks.rosterDark} screenLabel="B · Roster">{renderRoster()}</Phone>
            </div>
          </DCArtboard>
          <DCArtboard id="salon" label="C · Salon — editorial journal" width={395} height={760} style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
            <div className="phone-shell">
              <Phone bg={S_PALETTE.bg} screenLabel="C · Salon">{renderSalon()}</Phone>
            </div>
          </DCArtboard>
        </DCSection>

        <DCSection id="system" title="The shared design system" subtitle="One palette, one type system, one component vocabulary — three personalities.">
          <DCArtboard id="tokens" label="Type · Color · Components" width={1240} height={620} style={{ background: '#faf6ec', border: `1px solid #ddd2bc` }}>
            <DesignSystemPoster/>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Product name">
          <TweakSelect label="Brand" value={tweaks.productName} onChange={v => setTweak('productName', v)}
            options={['Convene', 'Hostly', 'Roster', 'Salon', 'Quill']}/>
        </TweakSection>

        <TweakSection title="Persona">
          <TweakRadio value={tweaks.persona} onChange={v => setTweak('persona', v)}
            options={[{value: 'nontech', label: 'Non-tech'}, {value: 'power', label: 'Power'}]}/>
        </TweakSection>

        <TweakSection title="Density">
          <TweakRadio value={tweaks.density} onChange={v => setTweak('density', v)}
            options={[{value: 'compact', label: 'Compact'}, {value: 'comfortable', label: 'Comfortable'}]}/>
        </TweakSection>

        <TweakSection title="Workflow">
          <TweakToggle label="Show ContactScout step" value={tweaks.showScout} onChange={v => setTweak('showScout', v)}/>
        </TweakSection>

        <TweakSection title="B · Roster theme">
          <TweakToggle label="Dark mode (only B)" value={tweaks.rosterDark} onChange={v => setTweak('rosterDark', v)}/>
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

// Coming soon placeholder for unmocked screens
function ComingSoon({ dir, title, sub, onBack, dark = false }) {
  const ink = dark ? '#f4ede0' : '#1a1612';
  const ink3 = dark ? '#8a8170' : '#8a8170';
  const bg = dir === 'atelier' ? '#f4ede0' : dir === 'salon' ? '#f0e9da' : (dark ? '#14110d' : '#f7f4ee');
  const accent = '#c8553d';
  return (
    <div className="scr" style={{ background: bg, paddingTop: 50, height: '100%', color: ink }}>
      <div style={{ padding: '14px 20px 10px' }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${ink3}40`, color: ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chevron-right" size={14} style={{ transform: 'rotate(180deg)' }}/>
        </button>
      </div>
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div className="display" style={{ fontSize: 40, color: ink, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1 }}>{title}</div>
        <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 14, color: ink3, marginTop: 8 }}>{sub}</div>
        <div style={{ marginTop: 28, padding: '14px 16px', display: 'inline-block', border: `1px dashed ${accent}`, borderRadius: 12, color: accent, fontFamily: 'Geist Mono, monospace', fontSize: 11, letterSpacing: '0.1em' }}>
          ✻ MOCKED ON HOME · TRACKER · COMPOSE · SCOUT ✻
        </div>
        <p style={{ marginTop: 22, fontFamily: 'Fraunces, serif', fontSize: 13, lineHeight: 1.65, color: ink3, maxWidth: 280, margin: '22px auto 0' }}>
          Bulk send mirrors the same vocabulary — sticky bottom bar, batch progress strip,
          per-recipient retry. Tap back to return.
        </p>
      </div>
    </div>
  );
}

// ──────── Design system poster ────────
function DesignSystemPoster() {
  const swatches = [
    { n: 'Paper', v: '#f4ede0' }, { n: 'Cream', v: '#fffbf2' }, { n: 'Page', v: '#f7f4ee' },
    { n: 'Ink', v: '#1a1612' }, { n: 'Ink-2', v: '#4a4339' }, { n: 'Ink-3', v: '#8a8170' },
    { n: 'Accent', v: '#c8553d' }, { n: 'Gold', v: '#b8860b' }, { n: 'Sage', v: '#a8b89a' },
    { n: 'Sky', v: '#b8cfd6' }, { n: 'Blush', v: '#e8c5b4' }, { n: 'Butter', v: '#e8d4a8' },
  ];
  return (
    <div style={{ padding: 36, height: '100%', overflow: 'auto', color: '#1a1612' }}>
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div className="eyebrow" style={{ color: '#8a8170' }}>♦ DESIGN SYSTEM</div>
          <div className="display" style={{ fontSize: 56, lineHeight: 0.95, fontWeight: 400, letterSpacing: '-0.03em', marginTop: 8 }}>
            One language,<br/><em style={{ color: '#c8553d', fontStyle: 'italic' }}>three voices.</em>
          </div>
          <p style={{ fontFamily: 'Fraunces, serif', fontSize: 15, lineHeight: 1.6, color: '#4a4339', marginTop: 16, maxWidth: 460 }}>
            Atelier whispers in Fraunces serif. Roster speaks in Geist Mono. Salon
            sings in Instrument Serif italic. All three share the same warm paper,
            the same terracotta accent, the same way of marking a stage.
          </p>
        </div>
        <div style={{ width: 280 }}>
          <div className="eyebrow" style={{ color: '#8a8170', marginBottom: 12 }}>TYPE STACK</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div className="display" style={{ fontSize: 32, lineHeight: 1 }}>Display · Instrument</div>
              <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, color: '#8a8170', letterSpacing: '0.1em', marginTop: 2 }}>HEADLINES, BIG NUMBERS</div>
            </div>
            <div>
              <div className="serif" style={{ fontSize: 22, lineHeight: 1.2 }}>Body · Fraunces</div>
              <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, color: '#8a8170', letterSpacing: '0.1em', marginTop: 2 }}>READING, TEMPLATES</div>
            </div>
            <div>
              <div style={{ fontFamily: 'Geist, sans-serif', fontSize: 18, fontWeight: 500 }}>UI · Geist Sans</div>
              <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, color: '#8a8170', letterSpacing: '0.1em', marginTop: 2 }}>BUTTONS, LABELS</div>
            </div>
            <div>
              <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 14 }}>Mono · Geist Mono</div>
              <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, color: '#8a8170', letterSpacing: '0.1em', marginTop: 2 }}>DATA, METADATA, STAMPS</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 36 }}>
        <div>
          <div className="eyebrow" style={{ color: '#8a8170', marginBottom: 12 }}>PALETTE</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
            {swatches.map(s => (
              <div key={s.n}>
                <div style={{ width: '100%', aspectRatio: '1', background: s.v, borderRadius: 8, border: '1px solid #ddd2bc' }}/>
                <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, color: '#4a4339', marginTop: 4, letterSpacing: '0.06em' }}>{s.n.toUpperCase()}</div>
                <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 8, color: '#8a8170', marginTop: 1 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="eyebrow" style={{ color: '#8a8170', marginBottom: 12 }}>COMPONENT VOCABULARY</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <button style={{ padding: '10px 18px', borderRadius: 99, background: '#c8553d', color: '#fff', fontSize: 13 }}>Primary</button>
              <button style={{ padding: '10px 18px', borderRadius: 99, background: 'transparent', color: '#1a1612', border: '1px solid #d6c9b3', fontSize: 13 }}>Secondary</button>
              <button style={{ padding: '8px 14px', borderRadius: 6, background: '#1a1612', color: '#f4ede0', fontFamily: 'Geist Mono, monospace', fontSize: 11, letterSpacing: '0.08em' }}>SCAN</button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="stamp" style={{ color: '#c8553d' }}>NEW</span>
              <span className="stamp" style={{ color: '#4f7a4a' }}>VERIFIED</span>
              <span className="stamp" style={{ color: '#b8860b' }}>PENDING</span>
              <span className="stamp" style={{ color: '#a14237' }}>LEFT OFFICE</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TOKENS.slice(0, 6).map(t => (
                <span key={t} style={{ padding: '4px 10px', borderRadius: 99, background: '#fffbf2', border: '1px solid #d6c9b3', fontFamily: 'Geist Mono, monospace', fontSize: 10, color: '#4a4339' }}>{`{{${t}}}`}</span>
              ))}
            </div>
            <div style={{ padding: '12px 14px', background: '#fffbf2', border: '1px solid #d6c9b3', borderRadius: 10 }}>
              <div className="eyebrow" style={{ color: '#8a8170' }}>STAGE CARD</div>
              <div className="serif" style={{ fontSize: 17, fontWeight: 500, marginTop: 4 }}>Compose the note</div>
              <div style={{ fontSize: 12, color: '#8a8170', marginTop: 2 }}>Personalize with merge tokens</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid #ddd2bc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="eyebrow" style={{ color: '#8a8170' }}>♦ Mobile-first · 44px tap targets · 4px spacing scale · 10px radii</div>
        <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 13, color: '#8a8170' }}>Convene Suite · v3.2 redesign</div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
