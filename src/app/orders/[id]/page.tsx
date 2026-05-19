import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { fmtMoney, fmtDate } from '@/lib/format';

const STEPS = ['PENDING','PAID','SHIPPED','DELIVERED'] as const;

export default async function OrderDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ demo?: string; ok?: string }> }) {
  const { id } = await params;
  const { demo, ok } = await searchParams;
  const s = await getSession();
  if (!s.userId) redirect('/login');
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order || (order.userId !== s.userId && s.role !== 'ADMIN')) notFound();
  const stepIdx = STEPS.indexOf(order.status as any);

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <Link href="/orders" className="text-sm text-slate-500 hover:underline">← Orders</Link>
      <h1 className="text-2xl font-bold">Order #{order.id.slice(-8)}</h1>
      {ok && <div className="text-sm bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded">Thanks! Stripe confirmed your payment.</div>}
      {demo && <div className="text-sm bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded">Demo order placed (Stripe not configured). Status auto-set to PAID.</div>}

      <div className="card p-4">
        <div className="text-sm font-semibold mb-2">Delivery progress</div>
        <div className="flex items-center gap-1 text-xs">
          {STEPS.map((step, i) => (
            <div key={step} className="flex-1">
              <div className={`h-2 rounded ${i <= stepIdx ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              <div className={`mt-1 ${i <= stepIdx ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>{step}</div>
            </div>
          ))}
        </div>
        {order.trackingNumber && <div className="text-xs mt-2">Tracking: <span className="font-mono">{order.trackingNumber}</span></div>}
      </div>

      <div className="card p-4">
        <div className="text-sm font-semibold mb-2">Shipping</div>
        <div className="text-sm text-slate-700">
          {order.shippingName}<br/>
          {order.shippingAddress}<br/>
          {order.shippingCity}, {order.shippingPostal}<br/>
          {order.shippingCountry}
        </div>
        <div className="text-xs text-slate-500 mt-2">Placed {fmtDate(order.createdAt)}</div>
      </div>

      <div className="card divide-y">
        {order.items.map(i => (
          <div key={i.id} className="p-3 flex justify-between text-sm">
            <span>{i.productName} × {i.quantity}</span>
            <span>{fmtMoney(i.quantity * i.unitPriceCents)}</span>
          </div>
        ))}
        <div className="p-3 flex justify-between font-semibold">
          <span>Total</span><span>{fmtMoney(order.totalCents)}</span>
        </div>
      </div>
    </div>
  );
}
