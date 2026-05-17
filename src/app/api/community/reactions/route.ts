import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import CommunityReaction from '@/lib/db/models/CommunityReaction';
import CommunityPost from '@/lib/db/models/CommunityPost';
import CommunityComment from '@/lib/db/models/CommunityComment';
import CommunityNotification from '@/lib/db/models/CommunityNotification';
import { auth } from '@/auth';
import { z } from 'zod';

const ReactionSchema = z.object({
  targetType: z.enum(['post', 'comment']),
  targetId: z.string().min(1),
  emoji: z.string().min(1).max(10),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    const parsed = ReactionSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const { targetType, targetId, emoji } = parsed.data;

    if (targetType === 'post') {
      const post = await CommunityPost.findById(targetId);
      if (!post || post.deletedAt) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
    } else {
      const comment = await CommunityComment.findById(targetId);
      if (!comment || comment.deletedAt) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      }
    }

    const existing = await CommunityReaction.findOne({
      user: session.user.id,
      targetType,
      targetId,
    });

    if (existing) {
      if (existing.emoji === emoji) {
        await CommunityReaction.findByIdAndDelete(existing._id);
        const field = targetType === 'post' ? 'stats.likes' : 'likes';
        const Model = targetType === 'post' ? CommunityPost : CommunityComment;
        await Model.findByIdAndUpdate(targetId, { $inc: { [field]: -1 } });

        const count = await CommunityReaction.countDocuments({ targetType, targetId });
        return NextResponse.json({ active: false, emoji: null, count });
      }

      existing.emoji = emoji;
      await existing.save();

      const count = await CommunityReaction.countDocuments({ targetType, targetId });
      return NextResponse.json({ active: true, emoji, count });
    }

    await CommunityReaction.create({
      user: session.user.id,
      targetType,
      targetId,
      emoji,
    });

    const field = targetType === 'post' ? 'stats.likes' : 'likes';
    const Model = targetType === 'post' ? CommunityPost : CommunityComment;
    const target = await Model.findByIdAndUpdate(targetId, { $inc: { [field]: 1 } }, { new: true });

    if (target && 'author' in target && target.author?.toString() !== session.user.id) {
      await CommunityNotification.create({
        user: target.author,
        type: 'like',
        sourceUser: session.user.id,
        post: targetType === 'post' ? targetId : undefined,
        comment: targetType === 'comment' ? targetId : undefined,
        message: `${session.user.name || 'Someone'} reacted to your ${targetType}`,
      }).catch(() => {});
    }

    const count = await CommunityReaction.countDocuments({ targetType, targetId });
    return NextResponse.json({ active: true, emoji, count });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to toggle reaction' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetType = searchParams.get('targetType');
    const targetId = searchParams.get('targetId');

    if (!targetType || !targetId) {
      return NextResponse.json({ error: 'targetType and targetId required' }, { status: 400 });
    }

    await connectDB();

    const reactions = await CommunityReaction.aggregate([
      { $match: { targetType, targetId: targetId as any } },
      { $group: { _id: '$emoji', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return NextResponse.json(reactions);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch reactions' },
      { status: 500 }
    );
  }
}
