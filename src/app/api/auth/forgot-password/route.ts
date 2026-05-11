import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { authRateLimit } from '@/lib/rateLimit';
import { getClientIdentifier } from '@/lib/rateLimit';

const bodySchema = z.object({
  email: z.string().trim().email(),
});

export async function POST(req: Request) {
  const ip = getClientIdentifier(req);
  const { success, resetIn } = await authRateLimit(ip);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait.' },
      { status: 429, headers: { 'Retry-After': String(resetIn) } }
    );
  }

  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const { email } = parsed.data;
    const emailLower = email.toLowerCase();

    await connectDB();
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return NextResponse.json({ ok: true, message: 'If that email exists, we sent a reset link' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetToken: resetToken,
          passwordResetExpiry: resetTokenExpiry,
          passwordResetUsedAt: null,
        },
      }
    );

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PASSWORD RESET] Token for ${email}: ${resetToken}`);
      console.log(`[PASSWORD RESET] Reset URL: ${resetUrl}`);
    }

    return NextResponse.json({
      ok: true,
      message: 'If that email exists, we sent a reset link',
    });
  } catch (e) {
    console.error('[forgot-password]', e);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
