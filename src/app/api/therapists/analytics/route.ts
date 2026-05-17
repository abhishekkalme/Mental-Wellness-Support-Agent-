import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Booking from '@/lib/db/models/Booking';
import Review from '@/lib/db/models/Review';
import SessionNote from '@/lib/db/models/SessionNote';
import TherapistProfile from '@/lib/db/models/TherapistProfile';
import AvailabilitySlot from '@/lib/db/models/AvailabilitySlot';
import { auth } from '@/auth';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.roles?.includes('therapist')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const profile = await TherapistProfile.findOne({ userId: session.user.id });
    if (!profile) {
      return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
    }

    const therapistId = profile._id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalSessions,
      completedSessions,
      cancelledSessions,
      noShowSessions,
      recentSessions,
      ratingAgg,
      totalSlots,
      uniqueClients,
      clientAgg,
    ] = await Promise.all([
      Booking.countDocuments({ therapistProfileId: therapistId }),
      Booking.countDocuments({ therapistProfileId: therapistId, status: 'completed' }),
      Booking.countDocuments({ therapistProfileId: therapistId, status: 'cancelled' }),
      Booking.countDocuments({ therapistProfileId: therapistId, status: 'no-show' }),
      Booking.find({
        therapistProfileId: therapistId,
        createdAt: { $gte: thirtyDaysAgo },
      })
        .sort({ date: 1 })
        .lean(),
      Review.aggregate([
        {
          $match: {
            therapistId: new mongoose.Types.ObjectId(String(therapistId)),
            isFlagged: false,
          },
        },
        { $group: { _id: null, averageRating: { $avg: '$rating' } } },
      ]),
      AvailabilitySlot.countDocuments({ therapistId, isBooked: false }),
      Booking.distinct('userId', { therapistProfileId: therapistId }),
      Booking.aggregate([
        { $match: { therapistProfileId: therapistId, status: 'completed' } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
      ]),
    ]);

    const currency: string = profile.currency;

    const weeklyMap = new Map<string, number>();
    for (const s of recentSessions) {
      const d = new Date(s.date).toISOString().split('T')[0];
      weeklyMap.set(d, (weeklyMap.get(d) || 0) + 1);
    }

    const periodSessions = Array.from(weeklyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalEarnings = recentSessions
      .filter((s) => s.status === 'completed' && s.paymentStatus === 'paid')
      .reduce((sum, s) => sum + (s.amount || 0), 0);

    const returningClients = clientAgg.filter((c) => c.count > 1).length;
    const clientRetentionRate =
      uniqueClients.length > 0 ? Math.round((returningClients / uniqueClients.length) * 100) : 0;

    const totalAvailableSlots = await AvailabilitySlot.countDocuments({ therapistId });

    const averageRating = ratingAgg[0] ? Math.round(ratingAgg[0].averageRating * 10) / 10 : 0;

    return NextResponse.json({
      totalSessions,
      completedSessions,
      cancelledSessions,
      noShowSessions,
      totalEarnings,
      currency,
      averageRating,
      clientRetentionRate,
      responseTimeHours: 0,
      utilizationRate:
        totalAvailableSlots > 0 ? Math.round((totalSlots / totalAvailableSlots) * 100) : 0,
      periodSessions,
      totalClients: uniqueClients.length,
      returningClients,
    });
  } catch (e) {
    console.error('[therapists/analytics]', e);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
