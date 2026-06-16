'use client';

import { useState } from 'react';
import SearchSelect from '@/components/SearchSelect';
import { setSupplierProductAction } from '@/app/admin/actions';

interface PickerProduct { id: number; name: string; code: string; }

export default function SupplierProductAdder({
  supplierId,
  products,
}: {
  supplierId: number;
  products: PickerProduct[];
}) {
  const [productId, setProductId] = useState('');
  const options = products.map(p => ({ value: String(p.id), label: `${p.code} · ${p.name}` }));

  const inp: React.CSSProperties = {
    height: 44, padding: '0 12px', border: '1.5px solid #e5e5e3', borderRadius: 10,
    fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', background: '#fff', boxSizing: 'border-box',
  };

  return (
    <form action={setSupplierProductAction} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <input type="hidden" name="supplier_id" value={supplierId} />
      <input type="hidden" name="product_id" value={productId} />
      <div style={{ flex: '2 1 220px' }}>
        <label style={lbl}>Product</label>
        <SearchSelect options={options} value={productId} onChange={setProductId} placeholder="Search product…" />
      </div>
      <div style={{ flex: '1 1 120px' }}>
        <label style={lbl}>Cost price (Rs.)</label>
        <input name="cost_price" type="number" min={0} required placeholder="0" style={{ ...inp, width: '100%' }} />
      </div>
      <div style={{ flex: '1 1 140px' }}>
        <label style={lbl}>Supplier code</label>
        <input name="supplier_product_code" placeholder="optional" style={{ ...inp, width: '100%' }} />
      </div>
      <button type="submit" disabled={!productId} style={{
        height: 44, padding: '0 18px', background: productId ? '#111110' : '#bbb', color: '#fff',
        border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
        cursor: productId ? 'pointer' : 'not-allowed',
      }}>Add</button>
    </form>
  );
}

const lbl: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#666', display: 'block',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em',
};
