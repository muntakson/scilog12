'use server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { stripe, stripeConfigured } from '@/lib/stripe';

export async function checkoutAction(formData: FormData) {
  const s = await getSession();
  if (!s.userId) redirect('/login');

  const shippingName    = String(formData.get('shippingName') || '').trim();
  const shippingAddress = String(formData.get('shippingAddress') || '').trim();
  const shippingCity    = String(formData.get('shippingCity') || '').trim();
  const shippingPostal  = String(formData.get('shippingPostal') || '').trim();
  const shippingCountry = String(formData.get('shippingCountry') || 'AU').trim();

  if (!shippingName || !shippingAddress || !shippingCity || !shippingPostal) {
    redirect('/checkout?error=' + encodeURIComponent('Please complete shipping details.'));
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: s.userId },
    include: { items: { include: { product: true } } },
  });
  if (!cart || cart.items.length === 0) redirect('/cart');

  const totalCents = cart.items.reduce((sum, i) => sum + i.quantity * i.product.priceCents, 0);

  const order = await prisma.order.create({
    data: {
      userId: s.userId, totalCents,
      shippingName, shippingAddress, shippingCity, shippingPostal, shippingCountry,
      status: stripeConfigured() ? 'PENDING' : 'PAID',
      items: { create: cart.items.map(i => ({
        productId: i.product.id, productName: i.product.name,
        unitPriceCents: i.product.priceCents, quantity: i.quantity,
      })) },
    },
  });

  if (!stripeConfigured()) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    redirect(`/orders/${order.id}?demo=1`);
  }

  const session = await stripe().checkout.sessions.create({
    mode: 'payment',
    line_items: cart.items.map(i => ({
      quantity: i.quantity,
      price_data: {
        currency: 'usd',
        product_data: { name: i.product.name, description: i.product.sku },
        unit_amount: i.product.priceCents,
      },
    })),
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?ok=1`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
    metadata: { orderId: order.id },
  });

  await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
  redirect(session.url!);
}
