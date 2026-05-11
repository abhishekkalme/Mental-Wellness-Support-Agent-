import type { DefaultSession } from 'next-auth';

export type MindCareRole = 'user' | 'admin' | 'mentor';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      role: MindCareRole;
    } & DefaultSession['user'];
  }

  interface User {
    username?: string;
    role?: MindCareRole;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string;
    username?: string;
    role?: MindCareRole;
  }
}

export {};
