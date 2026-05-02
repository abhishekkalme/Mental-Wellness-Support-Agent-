import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import type { MindCareRole } from "@/types/next-auth-augmentation";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      id: "guest",
      name: "Guest",
      credentials: {
        name: { label: "Name", type: "text", placeholder: "Alex" },
      },
      async authorize(credentials) {
        const name = credentials?.name?.toString().trim();
        if (!name) return null;
        return {
          id: "guest",
          name,
          email: "guest@mindcare.local",
          role: "user" as MindCareRole,
          isGuest: true,
        };
      },
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString() ?? "";
        const password = credentials?.password?.toString() ?? "";
        const { authenticateEmailPassword } = await import("@/lib/auth/emailPassword");
        const user = await authenticateEmailPassword(email, password);
        if (!user) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as MindCareRole,
          isGuest: user.isGuest,
        };
      },
    }),
  ],
});
