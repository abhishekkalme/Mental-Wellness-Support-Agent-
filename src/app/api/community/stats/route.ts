import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import CommunityPost from '@/lib/db/models/CommunityPost';
import User from '@/lib/db/models/User';

export async function GET() {
  try {
    await connectDB();

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalPosts, activeUsers, totalUsers] = await Promise.all([
      CommunityPost.countDocuments({ deletedAt: null, moderationStatus: { $ne: 'removed' } }),
      User.countDocuments({ updatedAt: { $gte: twentyFourHoursAgo } }),
      User.countDocuments({}),
    ]);

    const discussionsToday = await CommunityPost.countDocuments({
      deletedAt: null,
      createdAt: { $gte: twentyFourHoursAgo },
    });

    return NextResponse.json({
      totalMembers: totalUsers,
      activeNow: Math.max(1, Math.round(activeUsers * 0.15)),
      totalDiscussions: totalPosts,
      discussionsToday,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
