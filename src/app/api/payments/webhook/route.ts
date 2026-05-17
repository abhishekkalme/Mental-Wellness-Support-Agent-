import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Booking from '@/lib/db/models/Booking';
import { getStripe, verifyRazorpaySignature } from '@/lib/payment';

export async function POST(req: Request) {
  const body = await req.text();
  const stripeSignature = req.headers.get('stripe-signature');

  if (stripeSignature) {
    return handleStripeWebhook(body, stripeSignature);
  }

  return handleRazorpayWebhook(body);
}

async function handleStripeWebhook(body: string, signature: string) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as { id: string; metadata: { bookingId?: string } };
      const bookingId = intent.metadata?.bookingId;
      if (bookingId) {
        await connectDB();
        await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid' });
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error('[payments/webhook/stripe]', e);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}

async function handleRazorpayWebhook(body: string) {
  try {
    const payload = JSON.parse(body);
    const event = payload.event;

    if (event === 'payment.captured' || event === 'order.paid') {
      const payment = payload.payload?.payment?.entity;
      const order = payload.payload?.order?.entity;
      const bookingId = payment?.notes?.bookingId || order?.receipt;
      if (bookingId) {
        await connectDB();
        await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid' });
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error('[payments/webhook/razorpay]', e);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}
