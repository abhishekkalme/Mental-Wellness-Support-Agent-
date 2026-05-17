import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import CommunityPost from '@/lib/db/models/CommunityPost';
import Follow from '@/lib/db/models/Follow';
import CommunityReaction from '@/lib/db/models/CommunityReaction';
import SavedPost from '@/lib/db/models/SavedPost';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    await connectDB();

    const filter: Record<string, unknown> = {
      deletedAt: null,
      moderationStatus: { $ne: 'removed' },
    };

    if (userId) {
      const following = await Follow.find({ follower: userId }).select('following').lean();
      const followingIds = following.map((f) => f.following.toString());
      followingIds.push(userId);

      filter.$or = [{ author: { $in: followingIds } }, { type: 'support' }, { type: 'discussion' }];
    }

    let query = CommunityPost.find(filter).populate('author', 'name username image role');

    if (cursor) {
      const cursorDoc = await CommunityPost.findById(cursor).select('createdAt');
      if (cursorDoc) {
        query = query.where('createdAt').lt(cursorDoc.createdAt);
      }
    }

    const posts = await query
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();
    const hasMore = posts.length > limit;
    if (hasMore) posts.pop();

    const postIds = posts.map((p) => p._id.toString());

    const userReactions: Map<string, string | null> = new Map();
    const savedSet: Set<string> = new Set();

    if (userId) {
      const reactions = await CommunityReaction.find({
        user: userId,
        targetType: 'post',
        targetId: { $in: postIds },
      }).lean();
      for (const r of reactions) {
        userReactions.set(r.targetId.toString(), r.emoji);
      }

      const saved = await SavedPost.find({
        user: userId,
        post: { $in: postIds },
      }).lean();
      for (const s of saved) {
        savedSet.add(s.post.toString());
      }
    }

    const enriched = posts.map((post) => ({
      ...post,
      isLiked: userReactions.has(post._id.toString()),
      userReaction: userReactions.get(post._id.toString()) || null,
      isSaved: savedSet.has(post._id.toString()),
    }));

    return NextResponse.json({
      data: enriched,
      nextCursor: hasMore ? posts[posts.length - 1]?._id.toString() : null,
      hasMore,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}
