import bcrypt from 'bcryptjs';
import User from '@/lib/db/models/User';
import { connectDB } from '@/lib/db/mongoose';
import type { UserRole } from '@/lib/db/models/User';

const BCRYPT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function authenticateEmailPassword(
  email: string,
  password: string
): Promise<{ id: string; name: string; email: string; role: UserRole; onboarded: boolean } | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) return null;

  await connectDB();
  const user = await User.findOne({ email: normalized }).select('+passwordHash');
  if (!user?.passwordHash) return null;

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;

  return {
    id: String(user._id),
    name: user.name,
    email: user.email ?? normalized,
    role: user.role ?? 'user',
    onboarded: user.onboarded ?? false,
  };
}
