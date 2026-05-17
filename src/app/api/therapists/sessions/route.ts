import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Booking from '@/lib/db/models/Booking';
import SessionNote from '@/lib/db/models/SessionNote';
import TherapistProfile from '@/lib/db/models/TherapistProfile';
import { auth } from '@/auth';
import { z } from 'zod';
import mongoose from 'mongoose';

const noteSchema = z.object({
  bookingId: z.string().min(1),
  content: z.string().default(''),
  moodBefore: z.number().min(1).max(10).optional(),
  moodAfter: z.number().min(1).max(10).optional(),
  goals: z.array(z.string()).default([]),
  progress: z.string().default(''),
  followUpDate: z.string().nullable().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') || session.user.role;
    const status = searchParams.get('status') || '';
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'));

    await connectDB();

    let bookings;
    if (session.user.role === 'therapist' || role === 'therapist') {
      const profile = await TherapistProfile.findOne({ userId: session.user.id });
      if (!profile) {
        return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
      }

      const filter: Record<string, unknown> = { therapistProfileId: profile._id };
      if (status) filter.status = status;

      bookings = await Booking.find(filter)
        .populate('userId', 'name email image')
        .sort({ date: -1, time: -1 })
        .limit(limit)
        .lean();
    } else {
      const filter: Record<string, unknown> = { userId: session.user.id };
      if (status) filter.status = status;

      bookings = await Booking.find(filter).sort({ date: -1, time: -1 }).limit(limit).lean();

      const profileIds = [
        ...new Set(bookings.map((b: any) => String(b.therapistProfileId)).filter(Boolean)),
      ];
      if (profileIds.length > 0) {
        const profiles = await TherapistProfile.find({ _id: { $in: profileIds } })
          .populate('userId', 'name')
          .lean();
        const nameMap = new Map<string, string>();
        for (const p of profiles) {
          const u = p.userId as { name?: string } | null;
          nameMap.set(String(p._id), u?.name || 'Therapist');
        }
        for (const b of bookings as any[]) {
          const realName = nameMap.get(String(b.therapistProfileId));
          if (realName) b.therapistName = realName;
        }
      }
    }

    return NextResponse.json({ sessions: bookings });
  } catch (e) {
    console.error('[therapists/sessions]', e);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (
      !session?.user?.id ||
      (session.user.role !== 'therapist' && session.user.role !== 'admin')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, status, notes, cancelledBy, cancelReason } = body;

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    await connectDB();

    const profile = await TherapistProfile.findOne({ userId: session.user.id });
    if (!profile && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (cancelledBy) updateData.cancelledBy = cancelledBy;
    if (cancelReason) updateData.cancelReason = cancelReason;

    const filter: Record<string, unknown> = { _id: bookingId };
    if (session.user.role !== 'admin' && profile) {
      filter.therapistProfileId = profile._id;
    }

    const updated = await Booking.findOneAndUpdate(
      filter,
      { $set: updateData },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (e) {
    console.error('[therapists/sessions]', e);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}
