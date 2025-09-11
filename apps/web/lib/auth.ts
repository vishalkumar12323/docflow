import { NextAuthConfig } from "next-auth";
import KindeProvider from "next-auth/providers/kinde";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { OrgRole } from "@prisma/client";

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    KindeProvider({
      clientId: process.env.KINDE_CLIENT_ID!,
      clientSecret: process.env.KINDE_CLIENT_SECRET!,
      issuer: process.env.KINDE_ISSUER_URL!,
      authorization: { params: { scope: "openid profile email" } },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "kinde") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { orgMembers: true },
          });

          if (!existingUser) {
            const newUser = await prisma.user.create({
              data: {
                name: user.name,
                email: user.email!,
                avatar: user.image,
                kindeId: account.providerAccountId,
                emailVerified: true,
                lastLoginAt: new Date(),
              },
            });

            const personalOrg = await prisma.org.create({
              data: {
                name: `${user.name || user.email}'s Workspace`,
                slug: `${newUser.id}-workspace`,
                plan: "FREE",
                members: {
                  create: {
                    userId: newUser.id,
                    role: OrgRole.OWNER,
                  },
                },
              },
            });

            await prisma.auditLog.create({
              data: {
                orgId: personalOrg.id,
                userId: newUser.id,
                action: "USER_CREATED",
                resource: "user",
                resourceId: newUser.id,
                metadata: {
                  provider: "kinde",
                  email: user.email,
                },
              },
            });
          } else {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { lastLoginAt: new Date() },
            });
            return true;
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (account && user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: {
            orgMembers: {
              include: {
                org: true,
              },
            },
          },
        });

        if (dbUser) {
          token.userId = dbUser.id;
          token.organizations = dbUser.orgMembers.map((member) => ({
            id: member.org.id,
            name: member.org.name,
            slug: member.org.slug,
            role: member.role,
            plan: member.org.plan,
          }));
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        (session.user.id = token.userId as string),
          //@ts-ignore
          (session.user.organizations = token.organizations as any[]);
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
};
