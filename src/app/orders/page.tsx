import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { fmtMoney, fmtDate } from '@/lib/format';

const STATUS_STYLE: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-700 border-amber-200',
  PAID:      'bg-sky-50 text-sky-700 border-sky-200',
  SHIPPED:   'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-slate-100 text-slate-600 border-slate-300',
};

export default async function OrdersPage() {
  const s = await getSession();
  if (!s.userId) redirect('/login');
  const orders = await prisma.order.findMany({
    where: { userId: s.userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Your orders</h1>
      {orders.length === 0 ? (
        <p className="text-slate-600">No orders yet. <Link href="/shop" className="text-brand-600 hover:underline">Browse the shop →</Link></p>
      ) : (
        <ul className="space-y-3">
          {orders.map(o => (
            <li key={o.id} className="card p-4">
              <div className="flex items-center justify-between">
                <Link href={`/orders/${o.id}`} className="font-semibold text-brand-600 hover:underline">Order #{o.id.slice(-8)}</Link>
                <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_STYLE[o.status]}`}>{o.status}</span>
              </div>
              <div className="text-sm text-slate-600 mt-1">
                {o.items.length} item{o.items.length === 1 ? '' : 's'} · {fmtMoney(o.totalCents)} · {fmtDate(o.createdAt)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
