'use client';

import { waLink } from '@/lib/catalog';
import { Icons } from './Icons';
import { useState } from 'react';

export default function WhatsAppFAB() {
  const [hovered, setHovered] = useState(false);

  return (
    <a href={waLink()} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 100,
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--wa)', color: '#fff',
        height: 56, borderRadius: 'var(--pill)',
        padding: hovered ? '0 22px' : '0 16px',
        boxShadow: '0 8px 32px rgba(37,211,102,.35)',
        fontWeight: 700, fontSize: 14,
        transition: 'padding .2s, box-shadow .2s',
        overflow: 'hidden', whiteSpace: 'nowrap',
      }}>
      <span style={{ display: 'flex', flexShrink: 0 }}>{Icons.whatsapp}</span>
      {hovered && <span>Order on WhatsApp</span>}
    </a>
  );
}
