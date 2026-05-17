import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Report from '@/lib/db/models/Report';
import CommunityPost from '@/lib/db/models/CommunityPost';
import CommunityComment from '@/lib/db/models/CommunityComment';
import CommunityNotification from '@/lib/db/models/CommunityNotification';
import { auth } from '@/auth';
import { z } from 'zod';

const ReportSchema = z.object({
  targetType: z.enum(['post', 'comment', 'user']),
  targetId: z.string().min(1),
  reason: z.string().min(1, 'Reason is required').max(500),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    const parsed = ReportSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const { targetType, targetId, reason } = parsed.data;

    if (targetType === 'post') {
      const post = await CommunityPost.findById(targetId);
      if (!post || post.deletedAt) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      await CommunityPost.findByIdAndUpdate(targetId, {
        $inc: { reportCount: 1 },
        $addToSet: { reportedBy: session.user.id },
        moderationStatus: 'flagged',
      });
    } else if (targetType === 'comment') {
      const comment = await CommunityComment.findById(targetId);
      if (!comment || comment.deletedAt) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      }
      comment.moderationStatus = 'flagged';
      await comment.save();
    }

    await Report.create({
      reporter: session.user.id,
      targetType,
      targetId,
      reason,
    });

    return NextResponse.json({ reported: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to report content' },
      { status: 500 }
    );
  }
}
