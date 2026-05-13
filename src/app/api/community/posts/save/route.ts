import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import CommunityPost from '@/lib/db/models/CommunityPost';
import { auth } from '@/auth';
import { z } from 'zod';

const SaveSchema = z.object({
  _id: z.string().min(1, 'Post ID is required'),
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

    const post = await CommunityPost.findById(parsed.data._id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const userId = session.user.id;
    const isSaved = post.savedBy.includes(userId);

    const updated = await CommunityPost.findByIdAndUpdate(
      parsed.data._id,
      isSaved
        ? { $pull: { savedBy: userId } }
        : { $addToSet: { savedBy: userId } },
      { new: true }
    );

    return NextResponse.json({ saved: !isSaved, post: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
