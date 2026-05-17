import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import SavedPost from '@/lib/db/models/SavedPost';
import CommunityPost from '@/lib/db/models/CommunityPost';
import { auth } from '@/auth';
import { z } from 'zod';

const SaveSchema = z.object({
  postId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    const parsed = SaveSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const { postId } = parsed.data;

    const post = await CommunityPost.findById(postId);
    if (!post || post.deletedAt) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const existing = await SavedPost.findOne({ user: session.user.id, post: postId });

    if (existing) {
      await SavedPost.findByIdAndDelete(existing._id);
      await CommunityPost.findByIdAndUpdate(postId, { $inc: { 'stats.saves': -1 } });
      return NextResponse.json({ saved: false });
    }

    await SavedPost.create({ user: session.user.id, post: postId });
    await CommunityPost.findByIdAndUpdate(postId, { $inc: { 'stats.saves': 1 } });

    return NextResponse.json({ saved: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to toggle save' },
      { status: 500 }
    );
  }
}
