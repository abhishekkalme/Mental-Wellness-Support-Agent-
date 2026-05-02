import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import type { MindCareRole } from "@/types/next-auth-augmentation";

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/signin",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      if (path.startsWith("/admin")) {
        if (!auth?.user || auth.user.role !== "admin") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }
      if (path.startsWith("/mentor")) {
        const role = auth?.user?.role;
        if (!auth?.user || (role !== "mentor" && role !== "admin")) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user.role as MindCareRole) ?? "user";
        token.isGuest = user.isGuest ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? session.user.id ?? "";
        session.user.role = (token.role as MindCareRole) ?? "user";
        session.user.isGuest = Boolean(token.isGuest);
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
