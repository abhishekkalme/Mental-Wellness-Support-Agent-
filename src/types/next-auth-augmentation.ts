import type { DefaultSession } from "next-auth";

export type MindCareRole = "user" | "admin" | "mentor";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: MindCareRole;
      isGuest: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: MindCareRole;
    isGuest?: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: MindCareRole;
    isGuest?: boolean;
  }
}

export {};
