import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'webhook secret not configured' }, { status: 500 });

  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'no signature' }, { status: 400 });
  const body = await req.text();

  let event;
  try {
    event = stripe().webhooks.constructEvent(body, sig, secret);
  } catch (e: any) {
    return NextResponse.json({ error: `bad signature: ${e.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const sess = event.data.object as any;
    const orderId = sess.metadata?.orderId;
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID', stripePaymentId: sess.payment_intent ?? null },
      });
      const order = await prisma.order.findUnique({ where: { id: orderId }, include: { user: { include: { cart: true } } } });
      if (order?.user.cart) await prisma.cartItem.deleteMany({ where: { cartId: order.user.cart.id } });
    }
  }
  return NextResponse.json({ received: true });
}
