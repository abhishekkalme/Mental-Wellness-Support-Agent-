import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import CommunityNotification from '@/lib/db/models/CommunityNotification';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    const [notifications, unreadCount] = await Promise.all([
      CommunityNotification.find({ user: session.user.id })
        .populate('sourceUser', 'name username image')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      CommunityNotification.countDocuments({ user: session.user.id, read: false }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    await CommunityNotification.updateMany({ user: session.user.id, read: false }, { read: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to mark notifications read' },
      { status: 500 }
    );
  }
}
