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

export async function getCurrentUser() {
  const { getUser } = require("@kinde-oss/kinde-auth-nextjs/server");

  try {
    const kindeUser = await getUser();

    if (!kindeUser) return null;

    const user = await prisma.user.findUnique({
      where: { kindeId: kindeUser.id },
      include: {
        orgMembers: {
          include: {
            org: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}

export async function getUserOrganizations(userId: string) {
  const orgMembers = await prisma.orgMember.findMany({
    where: { userId },
    include: {
      org: true,
    },
    orderBy: {
      org: {
        createdAt: "asc",
      },
    },
  });

  return orgMembers.map((member) => ({
    ...member.org,
    role: member.role,
    joinedAt: member.joinedAt,
  }));
}

export async function checkOrgPermission(
  userId: string,
  orgId: string,
  requiredRole: OrgRole[] = [
    OrgRole.OWNER,
    OrgRole.ADMIN,
    OrgRole.EDITOR,
    OrgRole.VIEWER,
  ]
) {
  const member = await prisma.orgMember.findUnique({
    where: {
      orgId_userId: {
        orgId,
        userId,
      },
    },
  });

  if (!member) {
    return { hasPermission: false, role: null };
  }

  const hasPermission = requiredRole.includes(member.role);

  return { hasPermission, role: member.role };
}

export async function requireOrgAccess(
  userId: string,
  orgId: string,
  requiredRole: OrgRole[] = [OrgRole.VIEWER]
) {
  const { hasPermission, role } = await checkOrgPermission(
    userId,
    orgId,
    requiredRole
  );

  if (!hasPermission) {
    throw new Error("Insufficient permissions");
  }

  return role!;
}

// Role hierarchy helper
export function getRoleHierarchy(role: OrgRole): number {
  const hierarchy = {
    [OrgRole.VIEWER]: 1,
    [OrgRole.EDITOR]: 2,
    [OrgRole.ADMIN]: 3,
    [OrgRole.OWNER]: 4,
  };
  return hierarchy[role];
}

export function hasHigherRole(userRole: OrgRole, targetRole: OrgRole): boolean {
  return getRoleHierarchy(userRole) > getRoleHierarchy(targetRole);
}

export function canManageRole(userRole: OrgRole, targetRole: OrgRole): boolean {
  // Owners can manage all roles
  if (userRole === OrgRole.OWNER) return true;

  // Admins can manage editors and viewers
  if (userRole === OrgRole.ADMIN) {
    return targetRole === OrgRole.EDITOR || targetRole === OrgRole.VIEWER;
  }

  return false;
}
