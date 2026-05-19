import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { fmtMoney } from '@/lib/format';
import { stripeConfigured } from '@/lib/stripe';
import { checkoutAction } from './action';

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const s = await getSession();
  if (!s.userId) redirect('/login');
  const cart = await prisma.cart.findUnique({
    where: { userId: s.userId },
    include: { items: { include: { product: true } } },
  });
  const items = cart?.items ?? [];
  if (items.length === 0) redirect('/cart');
  const total = items.reduce((sum, i) => sum + i.quantity * i.product.priceCents, 0);

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold mb-4">Shipping & checkout</h1>
        <form action={checkoutAction} className="space-y-3 card p-5">
          <div><label className="label">Full name</label><input className="input" name="shippingName" defaultValue={s.name} required /></div>
          <div><label className="label">Address</label><input className="input" name="shippingAddress" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">City</label><input className="input" name="shippingCity" required /></div>
            <div><label className="label">Postal code</label><input className="input" name="shippingPostal" required /></div>
          </div>
          <div><label className="label">Country</label><input className="input" name="shippingCountry" defaultValue="AU" required /></div>
          {!stripeConfigured() && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
              Stripe isn't configured on this server. We'll record your order as a demo (status will skip straight to "paid") so you can see the rest of the flow.
            </p>
          )}
          {error && <p className="text-sm text-red-600">{decodeURIComponent(error)}</p>}
          <button className="btn-primary w-full">{stripeConfigured() ? 'Continue to Stripe' : 'Place demo order'}</button>
        </form>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Order summary</h2>
        <div className="card divide-y">
          {items.map(i => (
            <div key={i.id} className="p-3 flex justify-between text-sm">
              <span>{i.product.name} × {i.quantity}</span>
              <span>{fmtMoney(i.quantity * i.product.priceCents)}</span>
            </div>
          ))}
          <div className="p-3 flex justify-between font-semibold">
            <span>Total</span><span>{fmtMoney(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
