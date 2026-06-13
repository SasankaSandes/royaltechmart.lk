'use client';

import type { CSSProperties } from 'react';
import { Icons } from '../Icons';

/* Novatek SearchField — a rounded pill search control with a leading glyph.
   The wrapper IS the visible control (background / border / radius), so
   `style` overrides apply to the whole pill and the icon + input stay
   vertically centred via flex. */

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
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        height: 48, paddingLeft: 16, paddingRight: 8,
        border: '1.5px solid var(--line)', borderRadius: 'var(--pill)',
        background: 'var(--surface-card)',
        ...style,
      }}
    >
      <span style={{ display: 'flex', flexShrink: 0, color: 'var(--muted)' }}>
        {Icons.search}
      </span>
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          flex: 1, minWidth: 0, height: '100%',
          border: 'none', outline: 'none', background: 'transparent',
          fontSize: 15, fontFamily: 'var(--font-body)', color: 'var(--text-default)',
          padding: 0,
        }}
      />
    </div>
  );
}
