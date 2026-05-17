import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import crypto from 'crypto';
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
      return NextResponse.json({
        ok: true,
        message: 'If that email exists and is unverified, we sent a new verification link',
      });
    }

    if (user.emailVerified) {
      return NextResponse.json({ ok: true, message: 'This email is already verified' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    await User.updateOne(
      { _id: user._id },
      { $set: { emailVerificationToken: verificationToken } }
    );

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    return NextResponse.json({
      ok: true,
      message: 'Verification email sent',
    });
  } catch (e) {
    console.error('[resend-verification]', e);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
