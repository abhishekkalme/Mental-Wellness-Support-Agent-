import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import FavoriteTherapist from '@/lib/db/models/FavoriteTherapist';
import TherapistProfile from '@/lib/db/models/TherapistProfile';
import Review from '@/lib/db/models/Review';
import { auth } from '@/auth';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const favorites = await FavoriteTherapist.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const therapistIds = favorites.map((f) => f.therapistId);

    const profiles = await TherapistProfile.find({ _id: { $in: therapistIds }, isActive: true })
      .populate('userId', 'name email image')
      .lean();

    const aggregation = await Review.aggregate([
      { $match: { therapistId: { $in: therapistIds }, isFlagged: false } },
      {
        $group: {
          _id: '$therapistId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const ratingMap = new Map<string, { averageRating: number; totalReviews: number }>();
    for (const r of aggregation) {
      ratingMap.set(String(r._id), {
        averageRating: Math.round(r.averageRating * 10) / 10,
        totalReviews: r.totalReviews,
      });
    }

    const enriched = profiles.map((p: Record<string, unknown>) => {
      const ratings = ratingMap.get(String(p._id));
      return {
        ...p,
        averageRating: ratings?.averageRating || 0,
        totalReviews: ratings?.totalReviews || 0,
      };
    });

    return NextResponse.json({ favorites: enriched });
  } catch (e) {
    console.error('[therapists/favorites]', e);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { therapistId } = await req.json();
    if (!therapistId || !mongoose.Types.ObjectId.isValid(therapistId)) {
      return NextResponse.json({ error: 'Invalid therapist ID' }, { status: 400 });
    }

    await connectDB();

    const existing = await FavoriteTherapist.findOne({
      userId: session.user.id,
      therapistId,
    });

    if (existing) {
      await FavoriteTherapist.deleteOne({ _id: existing._id });
      return NextResponse.json({ favorited: false });
    }

    await FavoriteTherapist.create({
      userId: session.user.id,
      therapistId,
    });

    return NextResponse.json({ favorited: true });
  } catch (e) {
    console.error('[therapists/favorites]', e);
    return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 });
  }
}
