'use client';

import type { CSSProperties, ReactNode } from 'react';

/* A submit button that asks for confirmation before submitting its form.
   Use inside a <form>; pass a server action via `formAction` to target a
   specific action (so it can live in a single non-nested form). */
export default function ConfirmButton({
  message,
  formAction,
  children,
  style,
}: {
  message: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <button
      type="submit"
      formAction={formAction}
      formNoValidate
      onClick={e => { if (!confirm(message)) e.preventDefault(); }}
      style={style}
    >
      {children}
    </button>
  );
}
