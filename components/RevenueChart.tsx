import { money } from '@/lib/catalog';

/** Pure inline-SVG weekly revenue bar chart. No client JS, no external libs. */
export default function RevenueChart({ data }: { data: { weekStart: Date; revenue: number }[] }) {
  const W = 720, H = 220;
  const padL = 8, padR = 8, padTop = 24, padBottom = 28;
  const plotW = W - padL - padR;
  const plotH = H - padTop - padBottom;
  const n = data.length || 1;
  const slot = plotW / n;
  const barW = Math.min(48, slot * 0.6);
  const max = Math.max(1, ...data.map(d => d.revenue));

  const fmtWeek = (d: Date) =>
    d.toLocaleDateString('en-LK', { day: 'numeric', month: 'short', timeZone: 'UTC' });

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Revenue by week" style={{ display: 'block' }}>
        {/* baseline */}
        <line x1={padL} y1={padTop + plotH} x2={W - padR} y2={padTop + plotH} stroke="#e5e5e3" strokeWidth={1} />
        {data.map((d, i) => {
          const h = (d.revenue / max) * plotH;
          const x = padL + i * slot + (slot - barW) / 2;
          const y = padTop + plotH - h;
          return (
            <g key={i}>
              {d.revenue > 0 && (
                <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize={10} fill="#888" fontFamily="var(--font-body)">
                  {money(d.revenue).replace('Rs. ', '')}
                </text>
              )}
              <rect x={x} y={y} width={barW} height={Math.max(h, d.revenue > 0 ? 2 : 0)} rx={4} fill="#FDEA0A" stroke="#111110" strokeWidth={1} />
              <text x={x + barW / 2} y={padTop + plotH + 16} textAnchor="middle" fontSize={10} fill="#aaa" fontFamily="var(--font-body)">
                {fmtWeek(d.weekStart)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
