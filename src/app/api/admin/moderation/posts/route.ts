import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/db/mongoose';
import CommunityPost from '@/lib/db/models/CommunityPost';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const filterType = searchParams.get('filter') || 'reported';

    await connectDB();

    const filter: Record<string, unknown> = {};
    if (filterType === 'reported') {
      filter.reports = { $gt: 0 };
    }
    filter.deletedAt = null;

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      CommunityPost.find(filter).sort({ reports: -1, time: -1 }).skip(skip).limit(limit).lean(),
      CommunityPost.countDocuments(filter),
    ]);

    return NextResponse.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error('[admin/moderation/posts]', e);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('id');
    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    await connectDB();
    const post = await CommunityPost.findByIdAndUpdate(
      postId,
      { deletedAt: new Date() },
      { new: true }
    ).lean();

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin/moderation/posts]', e);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
