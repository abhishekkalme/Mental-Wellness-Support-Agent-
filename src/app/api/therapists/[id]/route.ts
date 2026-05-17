import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import TherapistProfile from '@/lib/db/models/TherapistProfile';
import Review from '@/lib/db/models/Review';
import AvailabilitySlot from '@/lib/db/models/AvailabilitySlot';
import FavoriteTherapist from '@/lib/db/models/FavoriteTherapist';
import Booking from '@/lib/db/models/Booking';
import { auth } from '@/auth';
import mongoose from 'mongoose';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid therapist ID' }, { status: 400 });
    }

    await connectDB();

    const profile = await TherapistProfile.findById(id)
      .populate('userId', 'name email image')
      .lean();

    if (!profile) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    const reviews = await Review.find({ therapistId: id, isFlagged: false })
      .populate('userId', 'name image')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const aggregation = await Review.aggregate([
      { $match: { therapistId: new mongoose.Types.ObjectId(id), isFlagged: false } },
      { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
    ]);

    const now = new Date();
    const dayOfWeek = now.getDay();
    const todayStr = now.toISOString().split('T')[0];

    const [recurringSlots, dateSpecificSlots] = await Promise.all([
      AvailabilitySlot.find({
        therapistId: id,
        isRecurring: true,
        isBooked: false,
      })
        .sort({ dayOfWeek: 1, startTime: 1 })
        .lean(),
      AvailabilitySlot.find({
        therapistId: id,
        specificDate: { $gte: new Date(todayStr) },
        isRecurring: false,
        isBooked: false,
      })
        .sort({ specificDate: 1, startTime: 1 })
        .lean(),
    ]);

    const upcomingSlots = [
      ...recurringSlots.filter((s) => s.dayOfWeek >= dayOfWeek),
      ...recurringSlots.map((s) => ({ ...s, dayOfWeek: s.dayOfWeek + 7 })),
      ...dateSpecificSlots,
    ].slice(0, 14);

    let isFavorited = false;
    if (session?.user?.id) {
      const fav = await FavoriteTherapist.findOne({
        userId: session.user.id,
        therapistId: id,
      });
      isFavorited = !!fav;
    }

    const completedBookings = await Booking.countDocuments({
      therapistProfileId: id,
      status: 'completed',
    });

    const avg = aggregation[0] || { averageRating: 0, totalReviews: 0 };

    return NextResponse.json({
      profile,
      reviews,
      averageRating: Math.round(avg.averageRating * 10) / 10,
      totalReviews: avg.totalReviews,
      completedSessions: completedBookings,
      upcomingSlots,
      isFavorited,
    });
  } catch (e) {
    console.error('[therapists/[id]]', e);
    return NextResponse.json({ error: 'Failed to fetch therapist' }, { status: 500 });
  }
}
