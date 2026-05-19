import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { fmtMoney } from '@/lib/format';

async function addToCart(formData: FormData) {
  'use server';
  const s = await getSession();
  if (!s.userId) redirect('/login');
  const productId = String(formData.get('productId'));
  const quantity = Math.max(1, Number(formData.get('quantity') || 1));
  const cart = await prisma.cart.upsert({
    where: { userId: s.userId }, update: {}, create: { userId: s.userId },
  });
  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, productId, quantity },
  });
  redirect('/cart');
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) notFound();
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center text-7xl text-slate-400">
        {p.category === 'ELECTRICAL' ? '⚡' : p.category === 'CHEMICAL' ? '🧪' : p.category === 'BIOLOGICAL' ? '🧬' : '⚙️'}
      </div>
      <div>
        <Link href="/shop" className="text-sm text-slate-500 hover:underline">← Shop</Link>
        <h1 className="text-2xl font-bold mt-2">{p.name}</h1>
        <div className="text-xs text-slate-500 mt-1">{p.category} · SKU {p.sku} · {p.stock} in stock</div>
        <p className="text-3xl font-bold mt-4">{fmtMoney(p.priceCents)}</p>
        <p className="text-slate-700 mt-4">{p.description}</p>
        <form action={addToCart} className="mt-6 flex items-center gap-3">
          <input type="hidden" name="productId" value={p.id} />
          <label className="text-sm">Qty <input className="input w-20 ml-1" type="number" name="quantity" defaultValue={1} min={1} max={p.stock} /></label>
          <button className="btn-primary">Add to cart</button>
        </form>
      </div>
    </div>
  );
}
