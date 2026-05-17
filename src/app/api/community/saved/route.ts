import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import SavedPost from '@/lib/db/models/SavedPost';
import CommunityReaction from '@/lib/db/models/CommunityReaction';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    await connectDB();

    let query = SavedPost.find({ user: session.user.id })
      .populate({
        path: 'post',
        match: { deletedAt: null, moderationStatus: { $ne: 'removed' } },
        populate: { path: 'author', select: 'name username image role' },
      })
      .sort({ createdAt: -1 });

    if (cursor) {
      const cursorDoc = await SavedPost.findById(cursor).select('createdAt');
      if (cursorDoc) {
        query = query.where('createdAt').lt(cursorDoc.createdAt);
      }
    }

    const savedPosts = await query.limit(limit + 1).lean();
    const hasMore = savedPosts.length > limit;
    if (hasMore) savedPosts.pop();

    const posts: Array<Record<string, unknown>> = savedPosts
      .filter((s) => s.post && typeof s.post === 'object' && '_id' in s.post)
      .map((s) => {
        const post = s.post as Record<string, unknown>;
        return {
          ...post,
          _id: post._id,
          isSaved: true,
          isLiked: false,
          userReaction: null,
          savedAt: s.createdAt,
        };
      });

    const postIds = posts.map((p) => p._id as string);
    if (postIds.length > 0) {
      const reactions = await CommunityReaction.find({
        user: session.user.id,
        targetType: 'post',
        targetId: { $in: postIds },
      }).lean();

      const reactionMap = new Map<string, string>();
      for (const r of reactions) {
        reactionMap.set(r.targetId.toString(), r.emoji);
      }

      for (const post of posts) {
        const id = post._id as string;
        if (reactionMap.has(id)) {
          post.isLiked = true;
          post.userReaction = reactionMap.get(id);
        }
      }
    }

    return NextResponse.json({
      data: posts,
      nextCursor: hasMore ? savedPosts[savedPosts.length - 1]?._id.toString() : null,
      hasMore,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch saved posts' },
      { status: 500 }
    );
  }
}
