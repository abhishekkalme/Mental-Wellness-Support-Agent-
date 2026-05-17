import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Review from '@/lib/db/models/Review';
import Booking from '@/lib/db/models/Booking';
import TherapistProfile from '@/lib/db/models/TherapistProfile';
import { auth } from '@/auth';
import { z } from 'zod';
import mongoose from 'mongoose';

const reviewSchema = z.object({
  therapistId: z.string().min(1),
  bookingId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(10).max(2000),
  isAnonymous: z.boolean().default(false),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const therapistId = searchParams.get('therapistId');

    if (!therapistId || !mongoose.Types.ObjectId.isValid(therapistId)) {
      return NextResponse.json({ error: 'Invalid therapist ID' }, { status: 400 });
    }

    await connectDB();

    const reviews = await Review.find({ therapistId, isFlagged: false })
      .populate('userId', 'name image')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const sanitized = reviews.map((r: Record<string, unknown>) => {
      const user = r.userId as Record<string, unknown> | null;
      return {
        _id: r._id,
        rating: r.rating,
        content: r.content,
        isVerified: r.isVerified,
        isAnonymous: r.isAnonymous,
        createdAt: r.createdAt,
        user: r.isAnonymous ? null : user ? { name: user.name, image: user.image } : null,
      };
    });

    const aggregation = await Review.aggregate([
      { $match: { therapistId: new mongoose.Types.ObjectId(therapistId), isFlagged: false } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          distribution: { $push: '$rating' },
        },
      },
    ]);

    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (aggregation[0]) {
      for (const r of aggregation[0].distribution) {
        if (dist[r as keyof typeof dist] !== undefined) dist[r as keyof typeof dist]++;
      }
    }

    return NextResponse.json({
      reviews: sanitized,
      averageRating: aggregation[0] ? Math.round(aggregation[0].averageRating * 10) / 10 : 0,
      totalReviews: aggregation[0]?.totalReviews || 0,
      distribution: dist,
    });
  } catch (e) {
    console.error('[therapists/reviews]', e);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    await connectDB();

    const booking = await Booking.findOne({
      _id: parsed.data.bookingId,
      userId: session.user.id,
      therapistProfileId: parsed.data.therapistId,
      status: 'completed',
    });

    if (!booking) {
      return NextResponse.json({ error: 'Can only review completed sessions' }, { status: 403 });
    }

    const existing = await Review.findOne({
      userId: session.user.id,
      bookingId: parsed.data.bookingId,
    });

    if (existing) {
      return NextResponse.json({ error: 'Already reviewed this session' }, { status: 409 });
    }

    const review = await Review.create({
      userId: session.user.id,
      therapistId: parsed.data.therapistId,
      bookingId: parsed.data.bookingId,
      rating: parsed.data.rating,
      content: parsed.data.content,
      isAnonymous: parsed.data.isAnonymous,
      isVerified: true,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (e) {
    console.error('[therapists/reviews]', e);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
