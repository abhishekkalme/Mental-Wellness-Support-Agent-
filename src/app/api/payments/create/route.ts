import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Booking from '@/lib/db/models/Booking';
import { auth } from '@/auth';
import { getGateway, createStripeCheckoutSession, createRazorpayOrder } from '@/lib/payment';
import type { SupportedCurrency } from '@/lib/currency';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    await connectDB();
    const booking = await Booking.findOne({ _id: bookingId, userId: session.user.id });
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    if (booking.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'Already paid' }, { status: 400 });
    }

    const currency = (booking.currency || 'USD') as SupportedCurrency;
    const amount = booking.amount || 0;
    if (amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const gateway = getGateway(currency);

    if (gateway === 'stripe') {
      const checkoutSession = await createStripeCheckoutSession(
        amount,
        currency,
        bookingId,
        booking.therapistName || 'Therapist'
      );
      return NextResponse.json({
        gateway: 'stripe',
        url: checkoutSession.url,
        sessionId: checkoutSession.id,
      });
    } else {
      const order = await createRazorpayOrder(amount, currency, bookingId);
      return NextResponse.json({
        gateway: 'razorpay',
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        name: 'MindCare',
        description: `Booking ${bookingId}`,
        prefill: { name: session.user.name || '', email: session.user.email || '' },
      });
    }
  } catch (e) {
    console.error('[payments/create]', e);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
