'use client';

import type { CSSProperties } from 'react';
import { Icons } from '../Icons';

/* Novatek SearchField — a rounded search input with a leading glyph.
   Matches the shop catalogue search control. */

export function SearchField({
  value,
  onChange,
  placeholder = 'Search products…',
  style,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: CSSProperties;
}) {
  return (
    <div style={{ position: 'relative', ...style }}>
      <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', display: 'flex' }}>
        {Icons.search}
      </span>
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', height: 48, paddingLeft: 48, paddingRight: 20,
          border: '1.5px solid var(--line)', borderRadius: 'var(--pill)',
          fontSize: 15, fontFamily: 'var(--font-body)', background: 'var(--surface-card)', outline: 'none',
        }}
      />
    </div>
  );
}
