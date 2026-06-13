import type { CSSProperties, ReactNode } from 'react';

/* Novatek Badge — status capsule, ported from the design system.
   `md` is the DS capsule (soft tinted fill + inset border); `sm` is the
   app's tiny uppercase product tag. Solid tones (ink/success) use a filled
   background; soft tones (successSoft/sand/neutral) use a tinted fill. */

export type BadgeTone = 'ink' | 'success' | 'neutral' | 'successSoft' | 'sand';
export type BadgeSize = 'sm' | 'md';

const TONES: Record<BadgeTone, { fill: string; text: string; line?: string }> = {
  ink:         { fill: 'var(--surface-ink)', text: '#fff' },
  success:     { fill: 'var(--accent-success)', text: '#fff' },
  neutral:     { fill: 'var(--surface-control)', text: 'var(--ink-2)' },
  successSoft: { fill: 'var(--nv-green-50)', text: 'var(--accent-success)', line: 'var(--accent-success)' },
  sand:        { fill: 'var(--nv-sisal-300)', text: 'var(--nv-sisal-900)', line: 'var(--nv-sisal-700)' },
};

// Maps the catalog's product.badge values to a tone.
export const PRODUCT_BADGE_TONE: Record<string, BadgeTone> = {
  Trending: 'ink',
  Featured: 'success',
  New: 'neutral',
};

export function Badge({
  children,
  tone = 'success',
  size = 'md',
  style,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  size?: BadgeSize;
  style?: CSSProperties;
}) {
  const t = TONES[tone] || TONES.success;
  const sizeStyle: CSSProperties =
    size === 'sm'
      ? {
          fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.15em',
          padding: '4px 10px', borderRadius: 'var(--pill)',
        }
      : {
          height: 38, padding: '0 12px',
          fontFamily: 'var(--font-body)', fontSize: 19, fontWeight: 500,
          borderRadius: 'var(--radius-sm)',
        };
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', lineHeight: 1,
        color: t.text, background: t.fill,
        boxShadow: t.line ? `inset 0 0 0 1px ${t.line}` : undefined,
        ...sizeStyle,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
