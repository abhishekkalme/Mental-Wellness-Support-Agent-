import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';

const UserSettingsSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  preferredLanguage: z
    .enum(['en', 'hi', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'pa', 'ml', 'or', 'as'])
    .optional(),
  agentGender: z.enum(['male', 'female', 'neutral']).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findOne({ email: session.user.email }).select(
      'name preferredLanguage agentGender'
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name,
      preferredLanguage: user.preferredLanguage,
      agentGender: user.agentGender,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const parsed = UserSettingsSchema.safeParse(data);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: parsed.data },
      { new: true }
    ).select('name preferredLanguage agentGender');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name,
      preferredLanguage: user.preferredLanguage,
      agentGender: user.agentGender,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}