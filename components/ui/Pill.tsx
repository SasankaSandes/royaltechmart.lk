'use client';

import type { CSSProperties, ReactNode } from 'react';

/* Novatek Pill — a rounded chip. The `filter` variant is the shop's
   category selector: haze-filled, ink when active. */

export function Pill({
  children,
  active = false,
  onClick,
  style,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '7px 16px',
        borderRadius: 'var(--pill)',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        cursor: 'pointer',
        border: 'none',
        background: active ? 'var(--ink)' : 'var(--surface)',
        color: active ? '#fff' : 'var(--ink-2)',
        transition: 'background var(--dur-base) var(--ease-standard), color var(--dur-base) var(--ease-standard)',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
