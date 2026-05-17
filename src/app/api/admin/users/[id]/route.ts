import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { z } from 'zod';

const UpdateSchema = z.object({
  role: z.enum(['user', 'admin', 'therapist']).optional(),
  isPremium: z.boolean().optional(),
  onboarded: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(id, { $set: parsed.data }, { new: true })
      .select('name username email role onboarded isPremium')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (e) {
    console.error('[admin/users/id]', e);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
