import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import CommunityPost from '@/lib/db/models/CommunityPost';
import Booking from '@/lib/db/models/Booking';
import Therapist from '@/lib/db/models/Therapist';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      usersByRole,
      onboardedCount,
      totalPosts,
      reportedPosts,
      totalBookings,
      totalTherapists,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ updatedAt: { $gte: sevenDaysAgo } }),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      User.countDocuments({ onboarded: true }),
      CommunityPost.countDocuments({ deletedAt: null }),
      CommunityPost.countDocuments({ reports: { $gt: 0 }, deletedAt: null }),
      Booking.countDocuments({}),
      Therapist.countDocuments({}),
    ]);

    const roleBreakdown: Record<string, number> = {};
    for (const r of usersByRole) {
      roleBreakdown[r._id || 'user'] = r.count;
    }

    return NextResponse.json({
      totalUsers,
      activeUsers,
      roleBreakdown,
      onboardedCount,
      pendingOnboarding: totalUsers - onboardedCount,
      totalPosts,
      reportedPosts,
      totalBookings,
      totalTherapists,
    });
  } catch (e) {
    console.error('[admin/stats]', e);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
