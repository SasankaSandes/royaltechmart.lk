'use client';

import { STATUS_LABEL, STATUS_COLOR, STATUS_BG, STATUS_ORDER } from '@/lib/orders-ui';
import type { OrderStatus } from '@/lib/types';

/** Status dropdown that auto-submits its enclosing server-action form on change. */
export default function StatusSelect({ value }: { value: OrderStatus }) {
  return (
    <select
      name="status"
      defaultValue={value}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      style={{
        fontSize: 12, fontWeight: 600, padding: '4px 8px', borderRadius: 8,
        color: STATUS_COLOR[value], background: STATUS_BG[value],
        border: '1px solid #e5e5e3', cursor: 'pointer',
      }}
    >
      {STATUS_ORDER.map(s => (
        <option key={s} value={s} style={{ color: '#111110', background: '#fff' }}>{STATUS_LABEL[s]}</option>
      ))}
    </select>
  );
}
