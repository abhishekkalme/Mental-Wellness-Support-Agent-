import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Follow from '@/lib/db/models/Follow';
import User from '@/lib/db/models/User';
import CommunityNotification from '@/lib/db/models/CommunityNotification';
import { auth } from '@/auth';
import { z } from 'zod';

const FollowSchema = z.object({
  userId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const data = await req.json();
    const parsed = FollowSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const targetId = parsed.data.userId;

    if (targetId === session.user.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    await connectDB();

    const targetUser = await User.findById(targetId).select('_id');
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existing = await Follow.findOne({
      follower: session.user.id,
      following: targetId,
    });

    if (existing) {
      await Follow.findByIdAndDelete(existing._id);
      return NextResponse.json({ following: false });
    }

    await Follow.create({
      follower: session.user.id,
      following: targetId,
    });

    await CommunityNotification.create({
      user: targetId,
      type: 'follow',
      sourceUser: session.user.id,
      message: `${session.user.name || 'Someone'} started following you`,
    }).catch(() => {});

    return NextResponse.json({ following: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to toggle follow' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    await connectDB();

    const followers = await Follow.countDocuments({ following: userId });
    const following = await Follow.countDocuments({ follower: userId });

    let isFollowing = false;
    if (session?.user?.id && session.user.id !== userId) {
      const rel = await Follow.findOne({
        follower: session.user.id,
        following: userId,
      });
      if (rel) isFollowing = true;
    }

    return NextResponse.json({ followers, following, isFollowing });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch follow data' },
      { status: 500 }
    );
  }
}
