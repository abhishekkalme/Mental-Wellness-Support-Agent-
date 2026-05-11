import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { onboardingData, wellnessMetrics } = body;

    await connectDB();

    await User.findByIdAndUpdate(session.user.id, {
      $set: {
        onboarded: true,
        onboardingData,
        wellnessMetrics,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[complete-onboarding]', e);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
