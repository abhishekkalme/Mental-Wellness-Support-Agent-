import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      needsOnboarding: !user.onboarded,
      onboarded: user.onboarded,
      username: user.username,
    });
  } catch (e) {
    console.error('[auth/me]', e);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
