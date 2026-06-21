'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        height: 38, padding: '0 20px', background: '#111110', color: '#fff',
        border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
      }}
    >
      Print
    </button>
  );
}
