'use client';

import { useState } from 'react';

interface SpecRow { key: string; val: string; }

export default function SpecsEditor({ initial }: { initial: [string, string][] }) {
  const [specs, setSpecs] = useState<SpecRow[]>(
    initial.length ? initial.map(([key, val]) => ({ key, val })) : [{ key: '', val: '' }]
  );

  const add = () => setSpecs(s => [...s, { key: '', val: '' }]);
  const remove = (i: number) => setSpecs(s => s.filter((_, j) => j !== i));
  const update = (i: number, field: 'key' | 'val', value: string) =>
    setSpecs(s => s.map((row, j) => j === i ? { ...row, [field]: value } : row));

  const inp: React.CSSProperties = {
    height: 38, padding: '0 10px', border: '1.5px solid #e5e5e3',
    borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-body)',
    outline: 'none', background: '#fff',
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {specs.map((row, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              name={`spec_key_${i}`}
              value={row.key}
              onChange={e => update(i, 'key', e.target.value)}
              placeholder="e.g. Driver size"
              style={{ ...inp, flex: '0 0 40%' }}
            />
            <input
              name={`spec_val_${i}`}
              value={row.val}
              onChange={e => update(i, 'val', e.target.value)}
              placeholder="e.g. 13mm"
              style={{ ...inp, flex: 1 }}
            />
            <button type="button" onClick={() => remove(i)} style={{
              width: 32, height: 32, border: '1.5px solid #e5e5e3', borderRadius: 8,
              background: '#fff', cursor: 'pointer', fontSize: 16, color: '#aaa',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>×</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} style={{
        marginTop: 10, fontSize: 13, color: '#555', background: 'transparent',
        border: '1.5px dashed #ddd', borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
      }}>
        + Add spec row
      </button>
    </div>
  );
}
