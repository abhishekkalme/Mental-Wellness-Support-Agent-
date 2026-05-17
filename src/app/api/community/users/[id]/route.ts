import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import CommunityPost from '@/lib/db/models/CommunityPost';
import Follow from '@/lib/db/models/Follow';
import { auth } from '@/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const { id } = await params;

    await connectDB();

    const user = await User.findById(id).select('name username image roles bio createdAt').lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [postCount, followerCount, followingCount, recentPosts] = await Promise.all([
      CommunityPost.countDocuments({ author: id, deletedAt: null }),
      Follow.countDocuments({ following: id }),
      Follow.countDocuments({ follower: id }),
      CommunityPost.find({ author: id, deletedAt: null, moderationStatus: { $ne: 'removed' } })
        .populate('author', 'name username image roles')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    let isFollowing = false;
    if (session?.user?.id && session.user.id !== id) {
      const rel = await Follow.findOne({
        follower: session.user.id,
        following: id,
      }).lean();
      if (rel) isFollowing = true;
    }

    const enrichedPosts = recentPosts.map((p) => ({
      ...p,
      isLiked: false,
      userReaction: null,
      isSaved: false,
    }));

    return NextResponse.json({
      user,
      stats: { postCount, followerCount, followingCount },
      isFollowing,
      recentPosts: enrichedPosts,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
