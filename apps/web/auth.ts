import Credentials from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/database/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credential",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // @ts-ignore
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        const isPasswordMatch = await bcrypt.compare(
          password,
          user.passwordHash as string
        );
        if (isPasswordMatch)
          return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            profilePictureUrl: user.profilePictureUrl,
            isVerified: user.isVerified,
            lastLogin: user.lastLogin,
          };
        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          profilePictureUrl: user.profilePictureUrl,
          isVerified: user.isVerified,
          lastLogin: user.lastLogin,
        };
      },
    }),
    Google({
      name: "google",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      name: "github",
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              lastLogin: new Date(),
            },
          });
          return true;
        }
      } catch (error) {
        console.log("signIn callback:: ", error);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.picture = user?.profilePictureUrl;
        token.lastLoginAt = user.lastLogin as Date;
        token.emailVerified = user.isVerified as boolean;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.userId = token.id as string;
        session.user.image = token.picture as string;
        session.user.lastLogin = token.lastLoginAt as Date;
        session.user.isVerified = token.isVerified as any;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET as string,
});
