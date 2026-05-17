import type { DefaultSession } from 'next-auth';

export type MindCareRole = 'user' | 'admin' | 'therapist';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      role: MindCareRole;
      onboarded: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    username?: string;
    role?: MindCareRole;
    onboarded?: boolean;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string;
    username?: string;
    role?: MindCareRole;
    onboarded?: boolean;
  }
}

export {};
