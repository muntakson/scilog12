import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { fmtMoney } from '@/lib/format';

async function removeItem(formData: FormData) {
  'use server';
  const s = await getSession();
  if (!s.userId) redirect('/login');
  const id = String(formData.get('id'));
  await prisma.cartItem.delete({ where: { id } });
  redirect('/cart');
}

async function updateQty(formData: FormData) {
  'use server';
  const s = await getSession();
  if (!s.userId) redirect('/login');
  const id = String(formData.get('id'));
  const q = Math.max(1, Number(formData.get('quantity') || 1));
  await prisma.cartItem.update({ where: { id }, data: { quantity: q } });
  redirect('/cart');
}

export default async function CartPage() {
  const s = await getSession();
  if (!s.userId) redirect('/login');
  const cart = await prisma.cart.findUnique({
    where: { userId: s.userId },
    include: { items: { include: { product: true } } },
  });
  const items = cart?.items ?? [];
  const total = items.reduce((sum, i) => sum + i.quantity * i.product.priceCents, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Your cart</h1>
      {items.length === 0 ? (
        <p className="text-slate-600">Your cart is empty. <Link href="/shop" className="text-brand-600 hover:underline">Browse the shop →</Link></p>
      ) : (
        <>
          <ul className="card divide-y">
            {items.map(i => (
              <li key={i.id} className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center text-2xl">
                  {i.product.category === 'ELECTRICAL' ? '⚡' : i.product.category === 'CHEMICAL' ? '🧪' : i.product.category === 'BIOLOGICAL' ? '🧬' : '⚙️'}
                </div>
                <div className="flex-1">
                  <Link href={`/shop/${i.product.id}`} className="font-semibold hover:underline">{i.product.name}</Link>
                  <div className="text-xs text-slate-500">{fmtMoney(i.product.priceCents)} each</div>
                </div>
                <form action={updateQty} className="flex items-center gap-1">
                  <input type="hidden" name="id" value={i.id} />
                  <input type="number" name="quantity" defaultValue={i.quantity} min={1} className="input w-20" />
                  <button className="btn-ghost text-xs">Update</button>
                </form>
                <div className="w-24 text-right font-semibold">{fmtMoney(i.quantity * i.product.priceCents)}</div>
                <form action={removeItem}><input type="hidden" name="id" value={i.id} /><button className="text-slate-400 hover:text-red-600">✕</button></form>
              </li>
            ))}
          </ul>
          <div className="card p-4 flex items-center justify-between">
            <div className="text-lg">Subtotal: <strong>{fmtMoney(total)}</strong></div>
            <Link href="/checkout" className="btn-primary">Checkout</Link>
          </div>
        </>
      )}
    </div>
  );
}
