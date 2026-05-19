import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { fmtMoney, fmtDate } from '@/lib/format';
import { OrderStatus } from '@prisma/client';

async function updateStatus(formData: FormData) {
  'use server';
  const s = await getSession();
  if (s.role !== 'ADMIN') redirect('/');
  const orderId = String(formData.get('orderId'));
  const status = String(formData.get('status')) as OrderStatus;
  const trackingNumber = String(formData.get('trackingNumber') || '') || null;
  await prisma.order.update({ where: { id: orderId }, data: { status, trackingNumber } });
  redirect('/admin');
}

export default async function AdminPage() {
  const s = await getSession();
  if (!s.userId) redirect('/login');
  if (s.role !== 'ADMIN') redirect('/dashboard');
  const orders = await prisma.order.findMany({ include: { user: true, items: true }, orderBy: { createdAt: 'desc' } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin · orders</h1>
      <ul className="space-y-3">
        {orders.map(o => (
          <li key={o.id} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">#{o.id.slice(-8)} · {o.user.name} · {fmtMoney(o.totalCents)}</div>
              <div className="text-xs text-slate-500">{fmtDate(o.createdAt)}</div>
            </div>
            <div className="text-sm text-slate-600 mb-2">
              {o.items.map(i => `${i.productName} × ${i.quantity}`).join(', ')}
            </div>
            <form action={updateStatus} className="flex flex-wrap items-center gap-2 text-sm">
              <input type="hidden" name="orderId" value={o.id} />
              <select className="input max-w-[160px]" name="status" defaultValue={o.status}>
                {(['PENDING','PAID','SHIPPED','DELIVERED','CANCELLED'] as const).map(x => <option key={x} value={x}>{x}</option>)}
              </select>
              <input className="input flex-1" name="trackingNumber" placeholder="Tracking #" defaultValue={o.trackingNumber || ''} />
              <button className="btn-primary">Update</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
