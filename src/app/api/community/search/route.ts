import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import CommunityPost from '@/lib/db/models/CommunityPost';
import User from '@/lib/db/models/User';
import CommunityReaction from '@/lib/db/models/CommunityReaction';
import SavedPost from '@/lib/db/models/SavedPost';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    const type = searchParams.get('type') || 'all';
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    if (!q) {
      return NextResponse.json({ posts: [], users: [] });
    }

    await connectDB();

    let posts: Record<string, unknown>[] = [];
    let users: Record<string, unknown>[] = [];

    if (type === 'all' || type === 'posts') {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

      const postResults = await CommunityPost.find({
        deletedAt: null,
        moderationStatus: { $ne: 'removed' },
        $or: [{ title: regex }, { content: regex }, { tags: { $in: [regex] } }],
      })
        .populate('author', 'name username image role')
        .sort({ 'stats.likes': -1, createdAt: -1 })
        .limit(limit)
        .lean();

      const postIds = postResults.map((p) => p._id.toString());

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

      posts = postResults.map((p) => ({
        ...p,
        isLiked: userReactions.has(p._id.toString()),
        userReaction: userReactions.get(p._id.toString()) || null,
        isSaved: savedSet.has(p._id.toString()),
      }));
    }

    if (type === 'all' || type === 'users') {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

      users = await User.find({
        $or: [{ name: regex }, { username: regex }],
      })
        .select('name username image role bio')
        .limit(limit)
        .lean();
    }

    return NextResponse.json({ posts, users });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}
