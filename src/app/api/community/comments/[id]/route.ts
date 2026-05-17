import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import CommunityComment from '@/lib/db/models/CommunityComment';
import CommunityPost from '@/lib/db/models/CommunityPost';
import { auth } from '@/auth';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const comment = await CommunityComment.findById(id);
    if (!comment || comment.deletedAt) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (comment.author.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    comment.deletedAt = new Date();
    await comment.save();

    await CommunityPost.findByIdAndUpdate(comment.post, { $inc: { 'stats.comments': -1 } });

    if (comment.parentComment) {
      await CommunityComment.updateMany({ parentComment: id }, { deletedAt: new Date() });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
