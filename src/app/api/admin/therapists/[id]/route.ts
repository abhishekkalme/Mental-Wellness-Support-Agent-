import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/db/mongoose';
import TherapistProfile from '@/lib/db/models/TherapistProfile';
import TherapistDocument from '@/lib/db/models/TherapistDocument';
import User from '@/lib/db/models/User';
import Booking from '@/lib/db/models/Booking';
import Review from '@/lib/db/models/Review';
import { createAuditLog, getClientInfo } from '@/lib/audit';
import { z } from 'zod';
import mongoose from 'mongoose';

const verifySchema = z.object({
  verificationStatus: z.enum(['pending', 'verified', 'rejected']),
  verificationNotes: z.string().optional(),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !session.user.roles?.includes('admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await connectDB();

    const profile = await TherapistProfile.findById(id)
      .populate('userId', 'name email image roles createdAt')
      .lean();

    if (!profile) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    const [documents, totalBookings, ratingAgg] = await Promise.all([
      TherapistDocument.find({ therapistId: id }).lean(),
      Booking.countDocuments({ therapistProfileId: id }),
      Review.aggregate([
        { $match: { therapistId: new mongoose.Types.ObjectId(id), isFlagged: false } },
        { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
      ]),
    ]);

    const avg = ratingAgg[0] || { averageRating: 0, totalReviews: 0 };

    return NextResponse.json({
      profile,
      documents,
      totalBookings,
      averageRating: Math.round(avg.averageRating * 10) / 10,
      totalReviews: avg.totalReviews,
    });
  } catch (e) {
    console.error('[admin/therapists/id]', e);
    return NextResponse.json({ error: 'Failed to fetch therapist' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !session.user.roles?.includes('admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    await connectDB();

    const updateData: Record<string, unknown> = {
      verificationStatus: parsed.data.verificationStatus,
    };
    if (parsed.data.verificationNotes !== undefined) {
      updateData.verificationNotes = parsed.data.verificationNotes;
    }

    const profile = await TherapistProfile.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )
      .populate('userId', 'name email')
      .lean();

    if (!profile) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    const { ipAddress, userAgent } = getClientInfo(req);
    await createAuditLog({
      actorId: session.user.id,
      action: 'verify_therapist',
      resource: 'therapist-profile',
      resourceId: id,
      details: { newStatus: parsed.data.verificationStatus, notes: parsed.data.verificationNotes },
      ipAddress,
      userAgent,
    });

    if (parsed.data.verificationStatus === 'verified') {
      const user = await User.findByIdAndUpdate(
        (profile.userId as Record<string, unknown>)?._id || profile.userId,
        { $addToSet: { roles: 'therapist' } },
        { new: true }
      );
    }

    return NextResponse.json(profile);
  } catch (e) {
    console.error('[admin/therapists/id]', e);
    return NextResponse.json({ error: 'Failed to update therapist' }, { status: 500 });
  }
}
