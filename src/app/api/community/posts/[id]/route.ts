import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import CommunityPost from '@/lib/db/models/CommunityPost';
import CommunityComment from '@/lib/db/models/CommunityComment';
import CommunityReaction from '@/lib/db/models/CommunityReaction';
import SavedPost from '@/lib/db/models/SavedPost';
import { auth } from '@/auth';
import { sanitizeAndTrim, moderateContent } from '@/lib/utils';
import { z } from 'zod';

const UpdatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  isAnonymous: z.boolean().optional(),
  type: z.enum(['discussion', 'support', 'achievement', 'question', 'resource']).optional(),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { id } = await params;

    await connectDB();

    const post = await CommunityPost.findOne({
      _id: id,
      deletedAt: null,
      moderationStatus: { $ne: 'removed' },
    })
      .populate('author', 'name username image roles')
      .lean();

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    let userReaction = null;
    let isSaved = false;

    if (userId) {
      const reaction = await CommunityReaction.findOne({
        user: userId,
        targetType: 'post',
        targetId: id,
      }).lean();
      if (reaction) userReaction = reaction.emoji;

      const saved = await SavedPost.findOne({ user: userId, post: id }).lean();
      if (saved) isSaved = true;
    }

    const comments = await CommunityComment.find({
      post: id,
      parentComment: null,
      deletedAt: null,
      moderationStatus: { $ne: 'removed' },
    })
      .populate('author', 'name username image roles')
      .sort({ createdAt: 'asc' })
      .lean();

    const commentIds = comments.map((c) => c._id.toString());
    const replies = await CommunityComment.find({
      post: id,
      parentComment: { $in: commentIds },
      deletedAt: null,
      moderationStatus: { $ne: 'removed' },
    })
      .populate('author', 'name username image roles')
      .sort({ createdAt: 'asc' })
      .lean();

    const commentsWithReplies = comments.map((c) => ({
      ...c,
      replies: replies.filter((r) => r.parentComment?.toString() === c._id.toString()),
    }));

    const reactionAgg = await CommunityReaction.aggregate([
      { $match: { targetType: 'post', targetId: post._id } },
      { $group: { _id: '$emoji', count: { $sum: 1 } } },
    ]);

    return NextResponse.json({
      post: { ...post, userReaction, isSaved },
      comments: commentsWithReplies,
      reactions: reactionAgg,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const post = await CommunityPost.findById(id);
    if (!post || post.deletedAt) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.author.toString() !== session.user.id && !session.user.roles?.includes('admin')) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const data = await req.json();
    const parsed = UpdatePostSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    if (parsed.data.content) {
      const content = sanitizeAndTrim(parsed.data.content);
      const mod = moderateContent(content);
      if (!mod.safe) return NextResponse.json({ error: mod.reason }, { status: 400 });
      update.content = content;
    }
    if (parsed.data.title) {
      update.title = sanitizeAndTrim(parsed.data.title);
    }
    if (parsed.data.tags !== undefined) update.tags = parsed.data.tags;
    if (parsed.data.isAnonymous !== undefined) update.isAnonymous = parsed.data.isAnonymous;
    if (parsed.data.type !== undefined) update.type = parsed.data.type;

    const updated = await CommunityPost.findByIdAndUpdate(id, update, { new: true })
      .populate('author', 'name username image roles')
      .lean();

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const post = await CommunityPost.findById(id);
    if (!post || post.deletedAt) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.author.toString() !== session.user.id && !session.user.roles?.includes('admin')) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    post.deletedAt = new Date();
    await post.save();

    await CommunityComment.updateMany({ post: id }, { deletedAt: new Date() });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete post' },
      { status: 500 }
    );
  }
}
