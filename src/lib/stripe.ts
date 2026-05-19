import Stripe from 'stripe';

let _client: Stripe | null = null;
export function stripe(): Stripe {
  if (!_client) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not configured');
    _client = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _client;
}
export function stripeConfigured() { return !!process.env.STRIPE_SECRET_KEY; }
