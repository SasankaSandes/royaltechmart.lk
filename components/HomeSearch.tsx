'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { SearchField } from './ui/SearchField';

/* Home hero search — submits the query to the shop page, where the real
   filtering lives. */
export default function HomeSearch({
  maxWidth = 440,
  fieldStyle,
}: {
  maxWidth?: number;
  fieldStyle?: CSSProperties;
}) {
  const router = useRouter();
  const [q, setQ] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : '/shop');
  }

  return (
    <form onSubmit={onSubmit} style={{ width: '100%', maxWidth }}>
      <SearchField value={q} onChange={setQ} style={fieldStyle} />
    </form>
  );
}
