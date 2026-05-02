import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Guest Mode",
      credentials: {
        name: { label: "Name", type: "text", placeholder: "Alex" },
      },
      async authorize(credentials) {
        if (credentials?.name) {
          // In a real app, you might sync with backend here
          // For now, we return a mock user that NextAuth will sign
          return { id: "guest", name: credentials.name as string, email: "guest@mindcare.ai" };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
});
