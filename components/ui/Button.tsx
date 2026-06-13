'use client';

import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

/* Novatek Button — soft fully-rounded pill, ported from the design system.
   Polymorphic: renders a Next <Link> for internal hrefs, an <a> for external
   hrefs (wa.me / facebook), or a <button> otherwise.
   Variants mirror the DS (primary/secondary/ghost/mist) plus `whatsapp`
   (green) — the app's functional CTA color. */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'mist' | 'whatsapp';
export type ButtonSize = 'sm' | 'md' | 'lg';

const SIZES: Record<ButtonSize, { height: number; padding: string; font: number }> = {
  sm: { height: 40, padding: '0 22px', font: 14 },
  md: { height: 48, padding: '0 30px', font: 16 },
  lg: { height: 53, padding: '0 36px', font: 18 },
};

const VARIANTS: Record<ButtonVariant, CSSProperties> = {
  primary:   { background: 'var(--surface-ink)', color: '#fff', border: '1px solid var(--surface-ink)' },
  secondary: { background: 'var(--surface-control)', color: 'var(--text-default)', border: '1px solid var(--surface-control)' },
  ghost:     { background: 'transparent', color: 'var(--text-default)', border: '1px solid var(--border-hairline)' },
  mist:      { background: 'var(--accent-mist)', color: 'var(--surface-raised)', border: '1px solid var(--accent-mist)' },
  whatsapp:  { background: 'var(--wa)', color: '#fff', border: '1px solid var(--wa)' },
};

type CommonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: CSSProperties;
};

type ButtonProps = CommonProps & {
  href?: string;
  external?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
};

function pressHandlers(disabled?: boolean) {
  return {
    onMouseDown: (e: React.MouseEvent<HTMLElement>) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; },
    onMouseUp: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.transform = 'scale(1)'; },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.transform = 'scale(1)'; },
  };
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  fullWidth = false,
  href,
  external,
  onClick,
  type = 'button',
  disabled = false,
  style,
}: ButtonProps) {
  const s = SIZES[size];
  const baseStyle: CSSProperties = {
    display: fullWidth ? 'flex' : 'inline-flex',
    width: fullWidth ? '100%' : undefined,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: s.height,
    padding: s.padding,
    fontFamily: 'var(--font-body)',
    fontSize: s.font,
    fontWeight: 500,
    lineHeight: 1,
    borderRadius: 'var(--pill)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    whiteSpace: 'nowrap',
    transition: 'transform var(--dur-fast) var(--ease-standard), filter var(--dur-base) var(--ease-standard)',
    ...VARIANTS[variant],
    ...style,
  };

  const inner = (
    <>
      {icon && iconPosition === 'left' ? <span style={{ display: 'flex' }}>{icon}</span> : null}
      {children}
      {icon && iconPosition === 'right' ? <span style={{ display: 'flex' }}>{icon}</span> : null}
    </>
  );

  // External link (wa.me, facebook, tel:) or explicitly external
  const isExternal = external ?? (href ? /^(https?:|tel:|mailto:)/.test(href) : false);

  if (href && isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={baseStyle} {...pressHandlers()}>
        {inner}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} style={baseStyle} {...pressHandlers()}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type} disabled={disabled} onClick={onClick} style={baseStyle} {...pressHandlers(disabled)}>
      {inner}
    </button>
  );
}
