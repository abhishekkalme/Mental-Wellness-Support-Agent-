import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import SessionNote from '@/lib/db/models/SessionNote';
import Booking from '@/lib/db/models/Booking';
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
    if (!session?.user?.id || session.user.role !== 'therapist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');

    await connectDB();
    const profile = await TherapistProfile.findOne({ userId: session.user.id });
    if (!profile) {
      return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
    }

    const filter: Record<string, unknown> = { therapistId: profile._id };
    if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
      filter.bookingId = bookingId;
    }

    const notes = await SessionNote.find(filter).sort({ createdAt: -1 }).limit(50).lean();

    return NextResponse.json({ notes });
  } catch (e) {
    console.error('[therapists/notes]', e);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'therapist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = noteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    await connectDB();
    const profile = await TherapistProfile.findOne({ userId: session.user.id });
    if (!profile) {
      return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
    }

    const booking = await Booking.findOne({
      _id: parsed.data.bookingId,
      therapistProfileId: profile._id,
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const existingNote = await SessionNote.findOne({ bookingId: parsed.data.bookingId });
    if (existingNote) {
      Object.assign(existingNote, parsed.data);
      if (parsed.data.followUpDate) {
        existingNote.followUpDate = new Date(parsed.data.followUpDate);
      }
      existingNote.clientId = booking.userId;
      await existingNote.save();
      return NextResponse.json(existingNote);
    }

    const note = await SessionNote.create({
      therapistId: profile._id,
      bookingId: parsed.data.bookingId,
      clientId: booking.userId,
      content: parsed.data.content,
      moodBefore: parsed.data.moodBefore,
      moodAfter: parsed.data.moodAfter,
      goals: parsed.data.goals,
      progress: parsed.data.progress,
      followUpDate: parsed.data.followUpDate ? new Date(parsed.data.followUpDate) : null,
    });

    return NextResponse.json(note, { status: 201 });
  } catch (e) {
    console.error('[therapists/notes]', e);
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
  }
}
