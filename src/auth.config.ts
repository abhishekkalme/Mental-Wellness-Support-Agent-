import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';
import type { MindCareRole } from '@/types/next-auth-augmentation';

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: '/signin',
  },
  providers: [],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        const { connectDB } = await import('@/lib/db/mongoose');
        const User = (await import('@/lib/db/models/User')).default;

        const email = profile?.email;
        if (!email) return true;

        await connectDB();

        let existingUser = await User.findOne({ email: email.toLowerCase() });

        if (!existingUser) {
          const name = profile?.name || user.name || 'User';
          const username = `${account.provider}_${account.providerAccountId.slice(0, 8)}`;

          existingUser = await User.create({
            name,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            emailVerified: true,
            image: profile?.image || user.image,
            role: 'user',
          });
        } else if (!existingUser.image && profile?.image) {
          await User.updateOne({ _id: existingUser._id }, { image: profile.image });
        }

        user.id = String(existingUser._id);
        user.username = existingUser.username;
        user.onboarded = existingUser.onboarded ?? false;
        user.role = existingUser.role ?? 'user';
      }
      return true;
    },
    async authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      if (path.startsWith('/admin')) {
        if (!auth?.user || auth.user.role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
      if (path.startsWith('/mentor')) {
        const role = auth?.user?.role;
        if (!auth?.user || (role !== 'mentor' && role !== 'admin')) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username ?? '';
        token.role = (user.role as MindCareRole) ?? 'user';
        token.onboarded = user.onboarded ?? false;
      }
      if (trigger === 'update' && session?.onboarded !== undefined) {
        token.onboarded = session.onboarded;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? session.user.id ?? '';
        session.user.username = (token.username as string) ?? '';
        session.user.role = (token.role as MindCareRole) ?? 'user';
        session.user.onboarded = (token.onboarded as boolean) ?? false;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
