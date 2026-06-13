import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./db";
import { isSuperAdmin } from "./admin";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user || !user.passwordHash) return null;
        if (!user.emailVerified) return null;

        const valid = await compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          tornId: user.tornId ?? 0,
          name: user.email?.split("@")[0] ?? null,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.tornId = (user as { id: string; tornId: number }).tornId;
        token.isAdmin = isSuperAdmin(user.email);
        token.email = user.email ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.userId = token.userId;
      session.user.tornId = token.tornId;
      session.user.isAdmin = token.isAdmin;
      session.user.email = token.email ?? null;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
