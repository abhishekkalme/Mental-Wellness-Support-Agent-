import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';

const bodySchema = z.object({
  token: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const { token } = parsed.data;

    await connectDB();
    const user = await User.findOne({
      emailVerificationToken: token,
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 400 });
    }

    await User.updateOne(
      { _id: user._id },
      {
        $set: { emailVerified: true },
        $unset: { emailVerificationToken: 1 },
      }
    );

    return NextResponse.json({ ok: true, message: 'Email verified successfully' });
  } catch (e) {
    console.error('[verify-email]', e);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
