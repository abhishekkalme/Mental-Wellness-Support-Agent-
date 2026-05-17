import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import ConsentRecord from '@/lib/db/models/ConsentRecord';
import TherapistProfile from '@/lib/db/models/TherapistProfile';
import { auth } from '@/auth';
import { z } from 'zod';
import mongoose from 'mongoose';

const consentSchema = z.object({
  therapistId: z.string().min(1),
  type: z.enum([
    'teletherapy',
    'session-recording',
    'data-sharing',
    'emergency-contact',
    'payment',
    'general',
  ]),
  granted: z.boolean(),
  consentVersion: z.string().default('1.0'),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const therapistId = searchParams.get('therapistId');

    if (!therapistId || !mongoose.Types.ObjectId.isValid(therapistId)) {
      return NextResponse.json({ error: 'Invalid therapist ID' }, { status: 400 });
    }

    await connectDB();

    const consents = await ConsentRecord.find({
      userId: session.user.id,
      therapistId,
      granted: true,
      revokedAt: null,
    }).lean();

    return NextResponse.json({ consents });
  } catch (e) {
    console.error('[therapists/consent]', e);
    return NextResponse.json({ error: 'Failed to fetch consents' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = consentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    await connectDB();

    const existing = await ConsentRecord.findOne({
      userId: session.user.id,
      therapistId: parsed.data.therapistId,
      type: parsed.data.type,
      revokedAt: null,
    });

    if (existing && parsed.data.granted) {
      return NextResponse.json(existing);
    }

    if (existing && !parsed.data.granted) {
      existing.granted = false;
      existing.revokedAt = new Date();
      await existing.save();
      return NextResponse.json(existing);
    }

    const consent = await ConsentRecord.create({
      userId: session.user.id,
      therapistId: parsed.data.therapistId,
      type: parsed.data.type,
      granted: parsed.data.granted,
      grantedAt: parsed.data.granted ? new Date() : undefined,
      consentVersion: parsed.data.consentVersion,
      ipAddress: req.headers.get('x-forwarded-for') || '',
    });

    return NextResponse.json(consent, { status: 201 });
  } catch (e) {
    console.error('[therapists/consent]', e);
    return NextResponse.json({ error: 'Failed to record consent' }, { status: 500 });
  }
}
