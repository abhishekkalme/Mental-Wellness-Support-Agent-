import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { authConfig } from '@/auth.config';
import type { MindCareRole } from '@/types/next-auth-augmentation';
import { validateEnv } from '@/lib/validateEnv';

validateEnv();

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      id: 'credentials',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString() ?? '';
        const password = credentials?.password?.toString() ?? '';
        const { authenticateEmailPassword } = await import('@/lib/auth/emailPassword');
        const user = await authenticateEmailPassword(email, password);
        if (!user) return null;
        return {
          id: user.id,
          name: user.name,
          username: (user as { username?: string }).username ?? '',
          email: user.email,
          roles: user.roles as MindCareRole[],
          onboarded: user.onboarded,
        };
      },
    }),
  ],
});
