import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";

export const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          role: "user",
        };
      },
    }),
  ],
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return true;

      try {
        // Check if this GitHub account already exists
        const existingAccount = await prisma.account.findFirst({
          where: {
            provider: "github",
            providerAccountId: account?.providerAccountId,
          },
          include: {
            user: true,
          },
        });

        if (existingAccount) {
          // If the account exists, allow sign in
          return true;
        }

        // Check if a user with this email exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: {
            accounts: true,
          },
        });

        if (existingUser) {
          // If user exists but no GitHub account is linked, link it
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account?.type || "oauth",
              provider: "github",
              providerAccountId: account?.providerAccountId || "",
              access_token: account?.access_token,
              token_type: account?.token_type,
              scope: account?.scope,
            },
          });
          return true;
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (user?.id) {
        token.id = user.id;
        token.role = user.role || "user";
      }
      if (account?.provider) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role || "user";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
} satisfies NextAuthConfig;
