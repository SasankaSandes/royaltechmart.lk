import { requireAdmin } from '@/lib/admin-auth';
import { getSalesOrders } from '@/lib/db';

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: Request) {
  await requireAdmin('owner');

  const url = new URL(request.url);
  const from = url.searchParams.get('from') || undefined;
  const to = url.searchParams.get('to') || undefined;

  const orders = await getSalesOrders({ from, to });

  const header = ['Ref', 'Date', 'Customer', 'Status', 'Payment', 'Revenue', 'Cost', 'Margin'];
  const lines = [header.join(',')];
  for (const o of orders) {
    lines.push([
      csvCell(o.ref),
      csvCell(o.date.toISOString().slice(0, 10)),
      csvCell(o.customer),
      csvCell(o.status),
      csvCell(o.paymentType),
      o.revenue,
      o.cost,
      o.margin,
    ].join(','));
  }
  const csv = lines.join('\n');

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="novatek-sales-${stamp}.csv"`,
    },
  });
}
