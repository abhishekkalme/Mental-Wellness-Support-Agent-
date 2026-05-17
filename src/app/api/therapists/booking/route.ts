import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Booking from '@/lib/db/models/Booking';
import TherapistProfile from '@/lib/db/models/TherapistProfile';
import { auth } from '@/auth';
import { z } from 'zod';
import mongoose from 'mongoose';

const bookingSchema = z.object({
  therapistId: z.string().min(1),
  therapistProfileId: z.string().min(1),
  therapistName: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  type: z.enum(['chat', 'video', 'phone']).default('chat'),
  duration: z.number().optional(),
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    await connectDB();
    const bookings = await Booking.find({ userId: session.user.id }).sort({ date: -1 }).limit(50);
    return NextResponse.json(bookings);
  } catch {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const data = await req.json();
    const parsed = bookingSchema.safeParse(data);
    if (!parsed.success) {
      return new NextResponse('Invalid input', { status: 400 });
    }
    await connectDB();

    const existing = await Booking.findOne({
      therapistProfileId: parsed.data.therapistProfileId,
      date: parsed.data.date,
      time: parsed.data.time,
      status: { $ne: 'cancelled' },
    });
    if (existing) {
      return new NextResponse('Slot already booked', { status: 409 });
    }

    let amount = 0;
    let currency = 'USD';
    let therapistName = parsed.data.therapistName;
    if (mongoose.Types.ObjectId.isValid(parsed.data.therapistProfileId)) {
      const profile = await TherapistProfile.findById(parsed.data.therapistProfileId)
        .populate('userId', 'name')
        .lean();
      if (profile) {
        const user = profile.userId as { name?: string } | null;
        if (user?.name && user.name.length > 1) therapistName = user.name;
        if (profile.pricing) {
          amount = profile.pricing[parsed.data.type] || profile.pricing.chat || 0;
          currency = profile.currency || 'USD';
        }
      }
    }

    const booking = await Booking.create({
      ...parsed.data,
      therapistName,
      userId: session.user.id,
      status: 'confirmed',
      amount,
      currency,
      paymentStatus: 'pending',
    });
    return NextResponse.json(booking, { status: 201 });
  } catch {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const mode = searchParams.get('mode') || 'cancel';
    if (!id) {
      return new NextResponse('Missing id', { status: 400 });
    }
    await connectDB();
    if (mode === 'hard') {
      await Booking.deleteOne({ _id: id, userId: session.user.id });
    } else {
      await Booking.updateOne({ _id: id, userId: session.user.id }, { status: 'cancelled' });
    }
    return NextResponse.json({ success: true });
  } catch {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
