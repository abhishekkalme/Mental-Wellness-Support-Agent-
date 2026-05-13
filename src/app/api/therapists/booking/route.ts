import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Booking from '@/lib/db/models/Booking';
import { auth } from '@/auth';
import { z } from 'zod';

const bookingSchema = z.object({
  therapistId: z.string().min(1),
  therapistName: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  type: z.enum(['chat', 'video', 'phone']).default('chat'),
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
      therapistId: parsed.data.therapistId,
      date: parsed.data.date,
      time: parsed.data.time,
      status: { $ne: 'cancelled' },
    });
    if (existing) {
      return new NextResponse('Slot already booked', { status: 409 });
    }
    const booking = await Booking.create({
      ...parsed.data,
      userId: session.user.id,
      status: 'confirmed',
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
    if (!id) {
      return new NextResponse('Missing id', { status: 400 });
    }
    await connectDB();
    await Booking.updateOne({ _id: id, userId: session.user.id }, { status: 'cancelled' });
    return NextResponse.json({ success: true });
  } catch {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
