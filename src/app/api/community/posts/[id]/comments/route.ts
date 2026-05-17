import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import CommunityPost from '@/lib/db/models/CommunityPost';
import CommunityComment from '@/lib/db/models/CommunityComment';
import CommunityReaction from '@/lib/db/models/CommunityReaction';
import CommunityNotification from '@/lib/db/models/CommunityNotification';
import { auth } from '@/auth';
import { chatRateLimit, getClientIdentifier } from '@/lib/rateLimit';
import { sanitizeAndTrim, moderateContent } from '@/lib/utils';
import { z } from 'zod';

const CreateCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(5000),
  parentComment: z.string().nullable().optional(),
  isAnonymous: z.boolean().default(false),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { id } = await params;

    await connectDB();

    const post = await CommunityPost.findById(id).select('_id deletedAt').lean();
    if (!post || post.deletedAt) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
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

    const userLikes: Set<string> = new Set();
    if (userId) {
      const allCommentIds = [...commentIds, ...replies.map((r) => r._id.toString())];
      const reactions = await CommunityReaction.find({
        user: userId,
        targetType: 'comment',
        targetId: { $in: allCommentIds },
      }).lean();
      for (const r of reactions) {
        userLikes.add(r.targetId.toString());
      }
    }

    const enriched = comments.map((c) => {
      const childReplies = replies
        .filter((r) => r.parentComment?.toString() === c._id.toString())
        .map((r) => ({
          ...r,
          isLiked: userLikes.has(r._id.toString()),
          replies: [],
        }));
      return {
        ...c,
        isLiked: userLikes.has(c._id.toString()),
        replies: childReplies,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ip = getClientIdentifier(req);
    const { success, resetIn } = await chatRateLimit(ip);
    if (!success) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${resetIn}s` },
        { status: 429 }
      );
    }

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

    const data = await req.json();
    const parsed = CreateCommentSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const content = sanitizeAndTrim(parsed.data.content);
    const mod = moderateContent(content);
    if (!mod.safe) {
      return NextResponse.json({ error: mod.reason }, { status: 400 });
    }

    if (parsed.data.parentComment) {
      const parentExists = await CommunityComment.findById(parsed.data.parentComment);
      if (!parentExists || parentExists.deletedAt) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }
    }

    const comment = await CommunityComment.create({
      post: id,
      author: session.user.id,
      parentComment: parsed.data.parentComment || null,
      content,
      isAnonymous: parsed.data.isAnonymous,
    });

    await CommunityPost.findByIdAndUpdate(id, { $inc: { 'stats.comments': 1 } });

    if (!parsed.data.isAnonymous && post.author.toString() !== session.user.id) {
      await CommunityNotification.create({
        user: post.author,
        type: 'reply',
        sourceUser: session.user.id,
        post: id,
        comment: comment._id,
        message: `${session.user.name || 'Someone'} replied to your post`,
      }).catch(() => {});
    }

    const populated = await CommunityComment.findById(comment._id)
      .populate('author', 'name username image roles')
      .lean();

    return NextResponse.json({ ...populated, isLiked: false, replies: [] }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create comment' },
      { status: 500 }
    );
  }
}
