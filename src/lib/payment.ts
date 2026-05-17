import Stripe from 'stripe';
import Razorpay from 'razorpay';
import { createHmac } from 'crypto';
import type { SupportedCurrency } from './currency';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

function getStripeInstance(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

function getRazorpay(): Razorpay | null {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
}

const RAZORPAY_CURRENCIES: SupportedCurrency[] = ['INR'];

export function getGateway(currency: SupportedCurrency): 'stripe' | 'razorpay' {
  if (RAZORPAY_CURRENCIES.includes(currency)) return 'razorpay';
  return 'stripe';
}

export function getStripe(): Stripe | null {
  return getStripeInstance();
}

export async function createRazorpayOrder(
  amount: number,
  currency: SupportedCurrency,
  bookingId: string
) {
  const rp = getRazorpay();
  if (!rp) throw new Error('Razorpay is not configured');
  return rp.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt: bookingId,
    notes: { bookingId },
  });
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  return expected === signature;
}

export async function createStripeCheckoutSession(
  amount: number,
  currency: SupportedCurrency,
  bookingId: string,
  therapistName: string
) {
  const stripe = getStripeInstance();
  if (!stripe) throw new Error('Stripe is not configured');
  const cents = currency === 'JPY' ? Math.round(amount) : Math.round(amount * 100);
  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: { name: `Therapy Session with ${therapistName}` },
          unit_amount: cents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: { bookingId },
    success_url: `${BASE_URL}/therapists/sessions?payment=success`,
    cancel_url: `${BASE_URL}/therapists/sessions?payment=cancelled`,
  });
}
