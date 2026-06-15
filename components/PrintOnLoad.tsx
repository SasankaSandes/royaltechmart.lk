'use client';

import { useEffect } from 'react';

/** Triggers the browser print dialog once on mount. Render only when ?print=1. */
export default function PrintOnLoad() {
  useEffect(() => {
    // Defer to next tick so fonts/layout settle before the dialog opens.
    const t = setTimeout(() => window.print(), 200);
    return () => clearTimeout(t);
  }, []);
  return null;
}
