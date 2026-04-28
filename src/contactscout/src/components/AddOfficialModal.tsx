import { useState } from 'react';
import { inferEmail } from '../emailPatterns';
import { CATS } from '../constants';
import type { CSOfficial, CSJurisdiction } from '../types';

interface Props {
  jx: CSJurisdiction;
  onAdd: (o: CSOfficial) => void;
  onClose: () => void;
}

type Draft = Omit<CSOfficial, 'status' | 'result' | '_scanId'>;

const EMPTY: Draft = {
  name: '', title: '', district: '', county: '', category: 'City Council',
  directEmail: '', officeEmail: '', officePhone: '',
  schedulerName: '', schedulerEmail: '', appearanceFormUrl: '',
  emailSource: 'manual',
};

const CATEGORY_OPTS = CATS.filter(c => c !== 'All') as string[];

export default function AddOfficialModal({ jx, onAdd, onClose }: Props) {
  const [d, setD] = useState<Draft>(EMPTY);
  const [err, setErr] = useState('');

  // Auto-infer email when name + category change and direct email is empty
  function handleNameOrCat(patch: Partial<Draft>) {
    setD(prev => {
      const next = { ...prev, ...patch };
      if (!next.directEmail) {
        const inf = inferEmail(
          { ...next, status: 'pending', result: null } as CSOfficial,
          jx,
        );
        if (inf) {
          return { ...next, directEmail: inf, emailSource: 'inferred' as const };
        }
      }
      return next;
    });
  }

  function field<K extends keyof Draft>(key: K, value: Draft[K]) {
    if (key === 'name' || key === 'category') {
      handleNameOrCat({ [key]: value } as Partial<Draft>);
    } else {
      setD(prev => ({ ...prev, [key]: value }));
    }
    setErr('');
  }

  function save() {
    if (!d.name.trim()) { setErr('Name is required.'); return; }
    const official: CSOfficial = { ...d, status: 'pending', result: null };
    onAdd(official);
    onClose();
  }

  const inf = !d.directEmail
    ? inferEmail({ ...d, status: 'pending', result: null } as CSOfficial, jx)
    : '';

  return (
    <div className="if-modal-backdrop" onClick={onClose}>
      <div className="if-modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="if-modal-title">Add Official Manually</div>
        <div className="if-modal-sub">
          All fields except Name are optional. Email is inferred from name + category
          where a standard pattern exists (federal, NC state legislature).
        </div>

        {err && (
          <div style={{ fontSize: 10, color: 'var(--danger)', marginBottom: 10, padding: '6px 10px', background: 'rgba(218,54,51,0.08)', border: '1px solid var(--danger-dark)', borderRadius: 5 }}>
            {err}
          </div>
        )}

        {/* Row 1: Name + Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 10, marginBottom: 10 }}>
          <div className="if-field">
            <div className="if-field-label">Full name *</div>
            <input className="if-input" placeholder="Jane Doe" value={d.name}
              onChange={e => field('name', e.target.value)} autoFocus />
          </div>
          <div className="if-field">
            <div className="if-field-label">Category</div>
            <select className="if-input" value={d.category}
              onChange={e => field('category', e.target.value)}
              style={{ appearance: 'none' }}>
              {CATEGORY_OPTS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Row 2: Title + District + County */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px', gap: 10, marginBottom: 10 }}>
          <div className="if-field">
            <div className="if-field-label">Title</div>
            <input className="if-input" placeholder="Mayor / Senator / Rep." value={d.title}
              onChange={e => field('title', e.target.value)} />
          </div>
          <div className="if-field">
            <div className="if-field-label">District</div>
            <input className="if-input" placeholder="12" value={d.district}
              onChange={e => field('district', e.target.value)} />
          </div>
          <div className="if-field">
            <div className="if-field-label">County</div>
            <input className="if-input" placeholder="Wake" value={d.county}
              onChange={e => field('county', e.target.value)} />
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="if-section-label" style={{ paddingTop: 10 }}>Contact info</span>
        </div>

        {/* Row 3: Direct email + Office email */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div className="if-field">
            <div className="if-field-label">Direct email</div>
            <input className="if-input" placeholder={inf || 'jane.doe@mail.house.gov'} value={d.directEmail}
              onChange={e => {
                setD(prev => ({ ...prev, directEmail: e.target.value, emailSource: 'manual' }));
                setErr('');
              }} />
            {inf && !d.directEmail && (
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 3 }}>
                Will be inferred: <span style={{ color: 'var(--blue)' }}>{inf}</span>
              </div>
            )}
          </div>
          <div className="if-field">
            <div className="if-field-label">Office email</div>
            <input className="if-input" placeholder="office@example.gov" value={d.officeEmail}
              onChange={e => field('officeEmail', e.target.value)} />
          </div>
        </div>

        {/* Row 4: Phone + Appearance form */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div className="if-field">
            <div className="if-field-label">Office phone</div>
            <input className="if-input" placeholder="(919) 555-0100" value={d.officePhone}
              onChange={e => field('officePhone', e.target.value)} />
          </div>
          <div className="if-field">
            <div className="if-field-label">Appearance request form</div>
            <input className="if-input" placeholder="https://example.house.gov/contact" value={d.appearanceFormUrl}
              onChange={e => field('appearanceFormUrl', e.target.value)} />
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="if-section-label" style={{ paddingTop: 10 }}>Scheduler / Staff</span>
          <span style={{ paddingTop: 10, fontSize: 9, color: 'var(--text-muted)' }}>— the person who handles event invitations</span>
        </div>

        {/* Row 5: Scheduler name + email */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div className="if-field">
            <div className="if-field-label">Scheduler name</div>
            <input className="if-input" placeholder="Mary Smith" value={d.schedulerName}
              onChange={e => field('schedulerName', e.target.value)} />
          </div>
          <div className="if-field">
            <div className="if-field-label">Scheduler email</div>
            <input className="if-input" placeholder="mary.smith@doe.senate.gov" value={d.schedulerEmail}
              onChange={e => field('schedulerEmail', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="if-btn" onClick={onClose}>Cancel</button>
          <button className="if-btn pri" onClick={save}>Add to List</button>
        </div>
      </div>
    </div>
  );
}
