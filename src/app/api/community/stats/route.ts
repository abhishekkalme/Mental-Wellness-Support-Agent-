import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import CommunityPost from '@/lib/db/models/CommunityPost';
import CommunityGroup from '@/lib/db/models/CommunityGroup';

export async function GET() {
  try {
    await connectDB();
    const [posts, groups] = await Promise.all([
      CommunityPost.find({ deletedAt: null }),
      CommunityGroup.find({}),
    ]);

    const totalMembers = groups.reduce((sum, g) => sum + (parseInt(g.members) || 0), 0);
    const activeNow = Math.max(1, Math.floor(totalMembers * 0.12));
    const totalDiscussions = posts.length;

    return NextResponse.json({
      totalMembers,
      activeNow,
      totalDiscussions,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
