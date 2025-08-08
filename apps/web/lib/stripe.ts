import Stripe from 'stripe';

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeSingleton) return stripeSingleton;
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error('Missing STRIPE_SECRET_KEY');
  }
  stripeSingleton = new Stripe(apiKey, { apiVersion: '2024-12-18.acacia' });
  return stripeSingleton;
}
