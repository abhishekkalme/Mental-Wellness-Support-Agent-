import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import AvailabilitySlot from '@/lib/db/models/AvailabilitySlot';
import TherapistProfile from '@/lib/db/models/TherapistProfile';
import { auth } from '@/auth';
import { z } from 'zod';
import mongoose from 'mongoose';

const slotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isRecurring: z.boolean().default(true),
  specificDate: z.string().nullable().optional(),
  bufferMinutes: z.number().min(0).max(60).default(10),
});

const bulkSlotSchema = z.array(slotSchema);

export async function GET() {
  try {
    const session = await auth();
    if (
      !session?.user?.id ||
      !session.user.roles?.some((r) => r === 'therapist' || r === 'admin')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const profile = await TherapistProfile.findOne({ userId: session.user.id });
    if (!profile) {
      return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
    }

    const slots = await AvailabilitySlot.find({ therapistId: profile._id })
      .sort({ dayOfWeek: 1, startTime: 1 })
      .lean();

    return NextResponse.json(slots);
  } catch (e) {
    console.error('[therapists/availability]', e);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (
      !session?.user?.id ||
      !session.user.roles?.some((r) => r === 'therapist' || r === 'admin')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = bulkSlotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    await connectDB();
    let profile = await TherapistProfile.findOne({ userId: session.user.id });
    if (!profile) {
      profile = await TherapistProfile.create({ userId: session.user.id });
    }

    const therapistId = profile._id;

    await AvailabilitySlot.deleteMany({ therapistId });

    const slots = parsed.data.map((slot) => ({
      therapistId,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isRecurring: slot.isRecurring,
      specificDate: slot.specificDate ? new Date(slot.specificDate) : null,
      bufferMinutes: slot.bufferMinutes,
      isBooked: false,
    }));

    const created = await AvailabilitySlot.insertMany(slots);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error('[therapists/availability]', e);
    return NextResponse.json({ error: 'Failed to save availability' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (
      !session?.user?.id ||
      !session.user.roles?.some((r) => r === 'therapist' || r === 'admin')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const slotId = searchParams.get('id');
    if (!slotId || !mongoose.Types.ObjectId.isValid(slotId)) {
      return NextResponse.json({ error: 'Invalid slot ID' }, { status: 400 });
    }

    await connectDB();
    const profile = await TherapistProfile.findOne({ userId: session.user.id });
    if (!profile) {
      return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
    }

    await AvailabilitySlot.deleteOne({ _id: slotId, therapistId: profile._id });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[therapists/availability]', e);
    return NextResponse.json({ error: 'Failed to delete slot' }, { status: 500 });
  }
}
