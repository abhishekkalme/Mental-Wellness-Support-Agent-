import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import CommunityPost from '@/lib/db/models/CommunityPost';
import CommunityReaction from '@/lib/db/models/CommunityReaction';
import SavedPost from '@/lib/db/models/SavedPost';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    await connectDB();

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const posts = await CommunityPost.aggregate([
      {
        $match: {
          deletedAt: null,
          moderationStatus: { $ne: 'removed' },
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $addFields: {
          engagementScore: {
            $add: [
              { $multiply: [{ $ifNull: ['$stats.likes', 0] }, 3] },
              { $multiply: [{ $ifNull: ['$stats.comments', 0] }, 5] },
              { $multiply: [{ $ifNull: ['$stats.saves', 0] }, 2] },
            ],
          },
          isRecent: { $gte: ['$createdAt', twentyFourHoursAgo] },
        },
      },
      {
        $match: { engagementScore: { $gt: 0 } },
      },
      { $sort: { engagementScore: -1, createdAt: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
        },
      },
      { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          'author.passwordHash': 0,
          'author.email': 0,
          'author.emailVerified': 0,
        },
      },
    ]);

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

    return NextResponse.json({ data: enriched });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch trending' },
      { status: 500 }
    );
  }
}
