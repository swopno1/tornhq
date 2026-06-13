import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";
import { encrypt } from "./crypto";
import { validateApiKey } from "./torn-api";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "torn-api-key",
      name: "Torn API Key",
      credentials: {
        apiKey: { label: "API Key", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.apiKey?.trim()) return null;

        const result = await validateApiKey(credentials.apiKey.trim());
        if (!result) return null;

        const { playerId, name } = result;
        const apiKeyEnc = encrypt(credentials.apiKey.trim());

        const user = await prisma.user.upsert({
          where: { tornId: playerId },
          update: { apiKeyEnc },
          create: { tornId: playerId, apiKeyEnc },
        });

        return { id: user.id, tornId: user.tornId, name };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.tornId = (user as { id: string; tornId: number }).tornId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.userId = token.userId;
      session.user.tornId = token.tornId;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
