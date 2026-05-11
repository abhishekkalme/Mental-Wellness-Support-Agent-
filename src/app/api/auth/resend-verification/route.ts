import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import crypto from 'crypto';

const bodySchema = z.object({
  email: z.string().trim().email(),
});

export async function POST(req: Request) {
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
    console.log(`[EMAIL VERIFICATION] Token for ${email}: ${verificationToken}`);
    console.log(`[EMAIL VERIFICATION] Verify URL: ${verifyUrl}`);

    return NextResponse.json({
      ok: true,
      message: 'Verification email sent',
      devMode:
        process.env.NODE_ENV !== 'production'
          ? { token: verificationToken, url: verifyUrl }
          : undefined,
    });
  } catch (e) {
    console.error('[resend-verification]', e);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
