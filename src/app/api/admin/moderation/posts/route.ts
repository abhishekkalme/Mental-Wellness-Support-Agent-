import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/db/mongoose';
import CommunityPost from '@/lib/db/models/CommunityPost';
import Report from '@/lib/db/models/Report';

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
      filter.reportCount = { $gt: 0 };
    }
    filter.deletedAt = null;

    const skip = (page - 1) * limit;

    const [posts, total, pendingReports] = await Promise.all([
      CommunityPost.find(filter)
        .populate('author', 'name username image role')
        .sort({ reportCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CommunityPost.countDocuments(filter),
      Report.countDocuments({ status: 'pending' }),
    ]);

    return NextResponse.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      pendingReports,
    });
  } catch (e) {
    console.error('[admin/moderation/posts]', e);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const { postId, action } = data;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    await connectDB();

    if (action === 'dismiss') {
      const post = await CommunityPost.findByIdAndUpdate(
        postId,
        { moderationStatus: 'approved', reportCount: 0, reportedBy: [] },
        { new: true }
      ).lean();
      await Report.updateMany(
        { targetType: 'post', targetId: postId, status: 'pending' },
        { status: 'dismissed', resolvedBy: session.user.id }
      );
      return NextResponse.json({ ok: true, post });
    }

    if (action === 'remove') {
      const post = await CommunityPost.findByIdAndUpdate(
        postId,
        { deletedAt: new Date(), moderationStatus: 'removed' },
        { new: true }
      ).lean();
      await Report.updateMany(
        { targetType: 'post', targetId: postId, status: 'pending' },
        { status: 'resolved', resolvedBy: session.user.id }
      );
      return NextResponse.json({ ok: true, post });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e) {
    console.error('[admin/moderation/posts]', e);
    return NextResponse.json({ error: 'Failed to moderate post' }, { status: 500 });
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
      { deletedAt: new Date(), moderationStatus: 'removed' },
      { new: true }
    ).lean();

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await Report.updateMany(
      { targetType: 'post', targetId: postId, status: 'pending' },
      { status: 'resolved', resolvedBy: session.user.id }
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin/moderation/posts]', e);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
