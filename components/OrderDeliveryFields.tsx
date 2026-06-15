'use client';

import { useMemo, useState } from 'react';
import type { DeliveryMethod, PaymentType } from '@/lib/types';
import { CITIES, cityLabel } from '@/lib/cities';
import SearchSelect from '@/components/SearchSelect';

const inp: React.CSSProperties = {
  width: '100%', height: 44, padding: '0 12px',
  border: '1.5px solid #e5e5e3', borderRadius: 10,
  fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none',
  background: '#fff', boxSizing: 'border-box',
};

function label(text: string) {
  return (
    <span style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {text}
    </span>
  );
}

/** Segmented two-option toggle backed by a hidden input so the server action reads it. */
function Toggle<T extends string>({
  name, value, onChange, options,
}: {
  name: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <>
      <input type="hidden" name={name} value={value} />
      <div style={{ display: 'inline-flex', border: '1.5px solid #e5e5e3', borderRadius: 10, overflow: 'hidden' }}>
        {options.map((o, i) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              style={{
                padding: '10px 18px', fontSize: 14, fontWeight: active ? 600 : 500,
                background: active ? '#111110' : '#fff',
                color: active ? '#fff' : '#555',
                border: 'none',
                borderLeft: i > 0 ? '1.5px solid #e5e5e3' : 'none',
                cursor: 'pointer',
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </>
  );
}

export default function OrderDeliveryFields() {
  const [delivery, setDelivery] = useState<DeliveryMethod>('courier');
  const [payment, setPayment] = useState<PaymentType>('cod');
  const [cityCode, setCityCode] = useState('');

  const cityOptions = useMemo(
    () => CITIES.map(c => ({ value: c.code, label: cityLabel(c) })),
    [],
  );
  const selectedCity = useMemo(
    () => CITIES.find(c => c.code === cityCode),
    [cityCode],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          {label('Delivery method')}
          <Toggle
            name="delivery_method"
            value={delivery}
            onChange={setDelivery}
            options={[{ value: 'courier', label: 'Courier' }, { value: 'self', label: 'Self pickup' }]}
          />
        </div>
        <div>
          {label('Payment')}
          <Toggle
            name="payment_type"
            value={payment}
            onChange={setPayment}
            options={[{ value: 'cod', label: 'Cash on delivery' }, { value: 'paid', label: 'Paid' }]}
          />
        </div>
      </div>

      {delivery === 'courier' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              {label('Courier name')}
              <input name="courier_name" placeholder="e.g. Pronto, Domex" style={inp} />
            </div>
            <div>
              {label('Tracking number')}
              <input name="tracking_number" placeholder="AWB / tracking no. (optional)" style={inp} />
            </div>
          </div>
          <div>
            {label('Street address')}
            <textarea name="address" rows={2} placeholder="No. 42, Galle Road…"
              style={{ ...inp, height: 'auto', paddingTop: 10, paddingBottom: 10, resize: 'vertical' }} />
          </div>
          <div>
            {label('City')}
            {/* Hidden inputs carry the resolved city name + postal code to the server action. */}
            <input type="hidden" name="city" value={selectedCity?.city ?? ''} />
            <input type="hidden" name="postal_code" value={selectedCity?.code ?? ''} />
            <SearchSelect
              options={cityOptions}
              value={cityCode}
              onChange={setCityCode}
              placeholder="Search city or postal code… e.g. Colombo 02"
            />
          </div>
        </>
      )}
    </div>
  );
}
