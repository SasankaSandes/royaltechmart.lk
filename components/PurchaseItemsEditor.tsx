'use client';

import { useMemo, useState } from 'react';
import SearchSelect from '@/components/SearchSelect';

interface PickerProduct { id: number; name: string; code: string; }
interface LineRow { productId: string; qty: number; unitCost: number | '' }

function money(n: number): string {
  return 'Rs. ' + Number(n).toLocaleString('en-LK');
}

export default function PurchaseItemsEditor({
  products,
  costById = {},
}: {
  products: PickerProduct[];
  costById?: Record<number, number>;
}) {
  const [rows, setRows] = useState<LineRow[]>([{ productId: '', qty: 1, unitCost: '' }]);

  const options = useMemo(
    () => products.map(p => ({ value: String(p.id), label: `${p.code} · ${p.name}` })),
    [products],
  );

  const add = () => setRows(r => [...r, { productId: '', qty: 1, unitCost: '' }]);
  const remove = (i: number) => setRows(r => (r.length > 1 ? r.filter((_, j) => j !== i) : r));
  const update = (i: number, patch: Partial<LineRow>) =>
    setRows(r => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));

  const pick = (i: number, productId: string) =>
    update(i, { productId, unitCost: productId ? (costById[Number(productId)] ?? '') : '' });

  const grandTotal = rows.reduce((sum, r) => sum + (Number(r.unitCost) || 0) * r.qty, 0);

  const inp: React.CSSProperties = {
    height: 44, padding: '0 10px', border: '1.5px solid #e5e5e3',
    borderRadius: 8, fontSize: 14, fontFamily: 'var(--font-body)',
    outline: 'none', background: '#fff', boxSizing: 'border-box',
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, padding: '0 2px 6px', fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        <span style={{ flex: 1 }}>Product</span>
        <span style={{ width: 60, textAlign: 'center' }}>Qty</span>
        <span style={{ width: 110, textAlign: 'right' }}>Unit cost</span>
        <span style={{ width: 110, textAlign: 'right' }}>Total</span>
        <span style={{ width: 32 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((row, i) => {
          const lineTotal = (Number(row.unitCost) || 0) * row.qty;
          return (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="hidden" name={`pitem_product_${i}`} value={row.productId} />
              <div style={{ flex: 1 }}>
                <SearchSelect
                  options={options}
                  value={row.productId}
                  onChange={(v) => pick(i, v)}
                  placeholder="Search product…"
                />
              </div>
              <input
                name={`pitem_qty_${i}`}
                type="number"
                min={1}
                value={row.qty}
                onChange={e => update(i, { qty: Math.max(1, Number(e.target.value) || 1) })}
                style={{ ...inp, width: 60, textAlign: 'center' }}
              />
              <input
                name={`pitem_cost_${i}`}
                type="number"
                min={0}
                value={row.unitCost}
                onChange={e => update(i, { unitCost: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) })}
                placeholder="Cost"
                style={{ ...inp, width: 110, textAlign: 'right' }}
              />
              <div style={{ width: 110, textAlign: 'right', fontSize: 14, fontWeight: 600, color: '#111110', whiteSpace: 'nowrap' }}>
                {money(lineTotal)}
              </div>
              <button type="button" onClick={() => remove(i)} disabled={rows.length === 1} style={{
                width: 32, height: 32, border: '1.5px solid #e5e5e3', borderRadius: 8,
                background: '#fff', cursor: rows.length === 1 ? 'not-allowed' : 'pointer',
                fontSize: 16, color: '#aaa', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: rows.length === 1 ? 0.4 : 1,
              }}>×</button>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
        <button type="button" onClick={add} style={{
          fontSize: 13, color: '#555', background: 'transparent',
          border: '1.5px dashed #ddd', borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
        }}>
          + Add item
        </button>
        <div style={{ fontSize: 14, color: '#888' }}>
          Total&nbsp;&nbsp;
          <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-head)', color: '#111110' }}>
            {money(grandTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
