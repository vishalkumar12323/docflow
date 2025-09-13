import { OrgPlan, OrgRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils/auth";
import crypto from "crypto";

export interface CreateOrgData {
  name: string;
  plan?: OrgPlan;
  createdBy: string;
}

export interface InviteUserData {
  orgId: string;
  email: string;
  role: OrgRole;
  invitedBy: string;
}

export interface UpdateMemberRoleData {
  orgId: string;
  userId: string;
  newRole: OrgRole;
  updatedBy: string;
}

export class OrganizationService {
  static async createOrganization(data: CreateOrgData) {
    const { name, plan = OrgPlan.FREE, createdBy } = data;

    const slug = generateSlug(name);

    // Check if slug exists
    const existingOrg = await prisma.org.findUnique({
      where: { slug },
    });

    const finalSlug = existingOrg ? `${slug}-${Date.now()}` : slug;

    const org = await prisma.org.create({
      data: {
        name,
        slug: finalSlug,
        plan,
        members: {
          create: {
            userId: createdBy,
            role: OrgRole.OWNER,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    // Log organization creation
    await prisma.auditLog.create({
      data: {
        orgId: org.id,
        userId: createdBy,
        action: "ORG_CREATED",
        resource: "organization",
        resourceId: org.id,
        metadata: {
          name: org.name,
          plan: org.plan,
        },
      },
    });

    return org;
  }

  static async getOrganization(orgId: string, userId: string) {
    const member = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId,
        },
      },
    });

    if (!member) {
      throw new Error("Access denied");
    }

    const org = await prisma.org.findUnique({
      where: { id: orgId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        invitations: {
          where: {
            acceptedAt: null,
            expiresAt: {
              gt: new Date(),
            },
          },
        },
        _count: {
          select: {
            documents: true,
            jobs: true,
          },
        },
      },
    });

    return { ...org, userRole: member.role };
  }

  static async inviteUser(data: InviteUserData) {
    const { orgId, email, role, invitedBy } = data;

    // Check if inviter has permission
    const inviter = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId: invitedBy,
        },
      },
    });

    if (!inviter || ![OrgRole.OWNER, OrgRole.ADMIN].includes(inviter.role)) {
      throw new Error("Insufficient permissions to invite users");
    }

    const existingMember = await prisma.orgMember.findFirst({
      where: {
        orgId,
        user: {
          email,
        },
      },
    });

    if (existingMember) {
      throw new Error("User is already a member of this organization");
    }

    const existingInvitation = await prisma.orgInvitation.findUnique({
      where: {
        orgId_email: {
          orgId,
          email,
        },
      },
    });

    if (existingInvitation && existingInvitation.expiresAt > new Date()) {
      throw new Error("Invitation already sent to this email");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation
    const invitation = await prisma.orgInvitation.create({
      data: {
        orgId,
        email,
        role,
        token,
        invitedBy,
        expiresAt,
      },
      include: {
        org: {
          select: {
            name: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        orgId,
        userId: invitedBy,
        action: "USER_INVITED",
        resource: "invitation",
        resourceId: invitation.id,
        metadata: {
          email,
          role,
        },
      },
    });

    return invitation;
  }

  static async acceptInvitation(token: string, userId: string) {
    const invitation = await prisma.orgInvitation.findUnique({
      where: { token },
      include: {
        org: true,
      },
    });

    if (!invitation) {
      throw new Error("Invalid invitation");
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error("Invitation has expired");
    }

    if (invitation.acceptedAt) {
      throw new Error("Invitation has already been accepted");
    }

    // Check if user email matches
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.email !== invitation.email) {
      throw new Error("Email mismatch");
    }

    // Check if already a member
    const existingMember = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId: invitation.orgId,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new Error("Already a member of this organization");
    }

    // Accept invitation
    const result = await prisma.$transaction([
      // Mark invitation as accepted
      prisma.orgInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      }),
      // Add user to organization
      prisma.orgMember.create({
        data: {
          orgId: invitation.orgId,
          userId,
          role: invitation.role,
        },
      }),
      // Log acceptance
      prisma.auditLog.create({
        data: {
          orgId: invitation.orgId,
          userId,
          action: "INVITATION_ACCEPTED",
          resource: "organization",
          resourceId: invitation.orgId,
          metadata: {
            role: invitation.role,
          },
        },
      }),
    ]);

    return result[1]; // Return the new member
  }

  static async updateMemberRole(data: UpdateMemberRoleData) {
    const { orgId, userId, newRole, updatedBy } = data;

    // Check if updater has permission
    const updater = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId: updatedBy,
        },
      },
    });

    if (!updater || ![OrgRole.OWNER, OrgRole.ADMIN].includes(updater.role)) {
      throw new Error("Insufficient permissions");
    }

    // Get target member
    const targetMember = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId,
        },
      },
    });

    if (!targetMember) {
      throw new Error("Member not found");
    }

    // Prevent demoting the last owner
    if (targetMember.role === OrgRole.OWNER && newRole !== OrgRole.OWNER) {
      const ownerCount = await prisma.orgMember.count({
        where: {
          orgId,
          role: OrgRole.OWNER,
        },
      });

      if (ownerCount === 1) {
        throw new Error("Cannot remove the last owner");
      }
    }

    // Update role
    const updatedMember = await prisma.orgMember.update({
      where: {
        orgId_userId: {
          orgId,
          userId,
        },
      },
      data: { role: newRole },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log role change
    await prisma.auditLog.create({
      data: {
        orgId,
        userId: updatedBy,
        action: "MEMBER_ROLE_UPDATED",
        resource: "member",
        resourceId: updatedMember.id,
        metadata: {
          targetUserId: userId,
          oldRole: targetMember.role,
          newRole,
        },
      },
    });

    return updatedMember;
  }

  // Remove member from organization
  static async removeMember(orgId: string, userId: string, removedBy: string) {
    // Check if remover has permission
    const remover = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId: removedBy,
        },
      },
    });

    if (!remover || ![OrgRole.OWNER, OrgRole.ADMIN].includes(remover.role)) {
      throw new Error("Insufficient permissions");
    }

    // Get target member
    const targetMember = await prisma.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId,
        },
      },
    });

    if (!targetMember) {
      throw new Error("Member not found");
    }

    // Prevent removing the last owner
    if (targetMember.role === OrgRole.OWNER) {
      const ownerCount = await prisma.orgMember.count({
        where: {
          orgId,
          role: OrgRole.OWNER,
        },
      });

      if (ownerCount === 1) {
        throw new Error("Cannot remove the last owner");
      }
    }

    // Remove member
    await prisma.orgMember.delete({
      where: {
        orgId_userId: {
          orgId,
          userId,
        },
      },
    });

    // Log removal
    await prisma.auditLog.create({
      data: {
        orgId,
        userId: removedBy,
        action: "MEMBER_REMOVED",
        resource: "member",
        resourceId: targetMember.id,
        metadata: {
          removedUserId: userId,
          role: targetMember.role,
        },
      },
    });

    return true;
  }

  static async getOrgStats(orgId: string) {
    const stats = await prisma.$transaction([
      prisma.orgMember.count({ where: { orgId } }),
      prisma.document.count({ where: { orgId, isDeleted: false } }),
      prisma.job.count({ where: { orgId } }),
      prisma.document.aggregate({
        where: { orgId, isDeleted: false },
        _sum: { bytes: true },
      }),
      //@ts-ignore
      prisma.job.groupBy({
        by: ["status"],
        where: { orgId },
        _count: true,
      }),
    ]);

    return {
      memberCount: stats[0],
      documentCount: stats[1],
      jobCount: stats[2],
      totalStorage: stats[3]._sum.bytes || 0n,
      jobsByStatus: stats[4].reduce((acc, item) => {
        //@ts-ignore
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
