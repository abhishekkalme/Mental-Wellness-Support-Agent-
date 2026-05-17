import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/db/mongoose';
import TherapistProfile from '@/lib/db/models/TherapistProfile';
import Review from '@/lib/db/models/Review';
import Booking from '@/lib/db/models/Booking';
import User from '@/lib/db/models/User';
import { createAuditLog, getClientInfo } from '@/lib/audit';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    await connectDB();

    const filter: Record<string, unknown> = {};
    if (status) filter.verificationStatus = status;
    if (search) {
      filter.$or = [
        { specializations: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    const [profiles, total] = await Promise.all([
      TherapistProfile.find(filter)
        .populate('userId', 'name email image role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TherapistProfile.countDocuments(filter),
    ]);

    const therapistIds = profiles.map((p) => p._id);

    const [bookingCounts, ratingAgg] = await Promise.all([
      Booking.aggregate([
        { $match: { therapistProfileId: { $in: therapistIds } } },
        { $group: { _id: '$therapistProfileId', count: { $sum: 1 } } },
      ]),
      Review.aggregate([
        { $match: { therapistId: { $in: therapistIds }, isFlagged: false } },
        {
          $group: {
            _id: '$therapistId',
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
          },
        },
      ]),
    ]);

    const bookingMap = new Map<string, number>();
    for (const b of bookingCounts) bookingMap.set(String(b._id), b.count);

    const ratingMap = new Map<string, { averageRating: number; totalReviews: number }>();
    for (const r of ratingAgg) {
      ratingMap.set(String(r._id), {
        averageRating: Math.round(r.averageRating * 10) / 10,
        totalReviews: r.totalReviews,
      });
    }

    const enriched = profiles.map((p: Record<string, unknown>) => {
      const id = String(p._id);
      const ratings = ratingMap.get(id);
      return {
        _id: id,
        user: p.userId,
        title: p.title,
        specializations: p.specializations,
        languages: p.languages,
        verificationStatus: p.verificationStatus,
        isActive: p.isActive,
        onboardingCompleted: p.onboardingCompleted,
        totalBookings: bookingMap.get(id) || 0,
        averageRating: ratings?.averageRating || 0,
        totalReviews: ratings?.totalReviews || 0,
        createdAt: p.createdAt,
      };
    });

    return NextResponse.json({
      therapists: enriched,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error('[admin/therapists]', e);
    return NextResponse.json({ error: 'Failed to fetch therapists' }, { status: 500 });
  }
}
