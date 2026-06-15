'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface Option { value: string; label: string; }

/**
 * Controlled searchable combobox. Renders no form field of its own — the parent
 * owns `value` and submits it via its own hidden input(s).
 *
 * The dropdown is rendered through a portal with fixed positioning so it is never
 * clipped by an ancestor's `overflow: hidden` (e.g. the admin cards).
 */
export default function SearchSelect({
  options,
  value,
  onChange,
  placeholder = 'Search…',
  maxResults = 50,
}: {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxResults?: number;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const selected = useMemo(() => options.find(o => o.value === value), [options, value]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? options.filter(o => o.label.toLowerCase().includes(q)) : options;
    return list.slice(0, maxResults);
  }, [options, query, maxResults]);

  const reposition = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.bottom + 4, left: r.left, width: r.width });
  }, []);

  // Keep the portal menu aligned with the input while open.
  useLayoutEffect(() => {
    if (!open) return;
    reposition();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, reposition]);

  // Close on outside click (account for the portalled menu living outside the wrapper).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const inp: React.CSSProperties = {
    width: '100%', height: 44, padding: '0 36px 0 12px',
    border: '1.5px solid #e5e5e3', borderRadius: 10,
    fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none',
    background: '#fff', boxSizing: 'border-box',
  };

  const menu = open && mounted && rect ? createPortal(
    <div
      ref={menuRef}
      style={{
        position: 'fixed', zIndex: 1000,
        top: rect.top, left: rect.left, width: rect.width,
        maxHeight: 260, overflowY: 'auto',
        background: '#fff', border: '1.5px solid #e5e5e3', borderRadius: 10,
        boxShadow: '0 8px 24px rgba(0,0,0,.12)',
      }}
    >
      {results.length === 0 ? (
        <div style={{ padding: '12px 14px', fontSize: 13, color: '#aaa' }}>No matches</div>
      ) : (
        results.map(o => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              // onMouseDown (not onClick) so the selection fires before the input blur.
              onMouseDown={(e) => { e.preventDefault(); onChange(o.value); setQuery(''); setOpen(false); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '9px 14px', fontSize: 14, border: 'none', cursor: 'pointer',
                background: active ? '#FDEA0A' : '#fff',
                color: '#111110', borderBottom: '1px solid #f5f5f3',
              }}
            >
              {o.label}
            </button>
          );
        })
      )}
    </div>,
    document.body,
  ) : null;

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        value={open ? query : (selected?.label ?? '')}
        placeholder={placeholder}
        onFocus={() => { setOpen(true); setQuery(''); }}
        onChange={e => { setQuery(e.target.value); if (!open) setOpen(true); }}
        onKeyDown={e => { if (e.key === 'Escape') setOpen(false); }}
        style={inp}
      />
      {value && (
        <button
          type="button"
          onClick={() => { onChange(''); setQuery(''); setOpen(false); }}
          aria-label="Clear"
          style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            width: 22, height: 22, border: 'none', borderRadius: 6, background: 'transparent',
            cursor: 'pointer', fontSize: 16, color: '#aaa', lineHeight: 1,
          }}
        >×</button>
      )}
      {menu}
    </div>
  );
}
