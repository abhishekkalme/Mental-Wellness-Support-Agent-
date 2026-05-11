import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { hashPassword } from '@/lib/auth/emailPassword';
import { authRateLimit } from '@/lib/rateLimit';
import { getClientIdentifier } from '@/lib/rateLimit';

const DISPOSABLE_DOMAINS = [
  'mailinator.com',
  'guerrillamail.com',
  '10minutemail.com',
  'tempmail.com',
  'throwawaymail.com',
  'yopmail.com',
  'fakeinbox.com',
  'temp-mail.org',
  'guerrillamailblock.com',
];

const bodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  // Rate limiting check
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
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { name, username, email, password } = parsed.data;
    const emailLower = email.toLowerCase();
    const usernameLower = username.trim().toLowerCase();

    // Disposable email check
    const domain = emailLower.split('@')[1];
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      return NextResponse.json(
        { error: 'Disposable email addresses are not allowed.' },
        { status: 400 }
      );
    }

    await connectDB();
    const existingEmail = await User.findOne({ email: emailLower });
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const existingUsername = await User.findOne({ username: usernameLower });
    if (existingUsername) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    await User.create({
      name,
      username: usernameLower,
      email: emailLower,
      passwordHash,
      emailVerified: false,
      emailVerificationToken: verificationToken,
      role: 'user',
    });

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[EMAIL VERIFICATION] Token for ${email}: ${verificationToken}`);
      console.log(`[EMAIL VERIFICATION] Verify URL: ${verifyUrl}`);
    }

    return NextResponse.json({
      ok: true,
      verified: false,
    });
  } catch (e) {
    console.error('[register]', e);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
