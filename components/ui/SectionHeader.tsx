import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Icons } from '../Icons';

/* Novatek SectionHeader — an optional eyebrow + display title with an
   optional "View all →" action link. The repeating header for home and
   product sections. */

export function SectionHeader({
  eyebrow,
  title,
  actionLabel,
  actionHref,
  align = 'flex-end',
  titleStyle,
  style,
}: {
  eyebrow?: string;
  title: string;
  actionLabel?: string;
  actionHref?: string;
  align?: CSSProperties['alignItems'];
  titleStyle?: CSSProperties;
  style?: CSSProperties;
}) {
  return (
    <div style={{ display: 'flex', alignItems: align, justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 40, ...style }}>
      <div>
        {eyebrow && <p className="eyebrow" style={{ marginBottom: 10 }}>{eyebrow}</p>}
        <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', ...titleStyle }}>{title}</h2>
      </div>
      {actionLabel && actionHref && (
        <Link href={actionHref} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: 'var(--ink-2)' }}>
          {actionLabel} {Icons.arrow}
        </Link>
      )}
    </div>
  );
}
