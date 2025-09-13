import { NextRequest, NextResponse } from "next/server";
import { withOrgAccess } from "@/lib/middleware/auth";
import { OrganizationService } from "@/lib/services/organization";
import { OrgRole } from "@prisma/client";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(OrgRole),
});

const updateRoleSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  role: z.nativeEnum(OrgRole),
});

// Invite user to organization
export const POST = withOrgAccess(
  async (req: NextRequest, { user, orgId, role }) => {
    try {
      const body = await req.json();
      const validatedData = inviteSchema.parse(body);

      const invitation = await OrganizationService.inviteUser({
        orgId,
        email: validatedData.email,
        role: validatedData.role,
        invitedBy: user.id,
      });

      // Here you would typically send an email invitation
      // await sendInvitationEmail(invitation)

      return NextResponse.json({ invitation }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid input", details: error.errors },
          { status: 400 }
        );
      }

      const errorMessage =
        error instanceof Error ? error.message : "Failed to invite user";
      const statusCode = errorMessage.includes("permission") ? 403 : 500;

      return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }
  },
  [OrgRole.ADMIN, OrgRole.OWNER]
);

// Update member role
export const PATCH = withOrgAccess(
  async (req: NextRequest, { user, orgId, role }) => {
    try {
      const body = await req.json();
      const validatedData = updateRoleSchema.parse(body);

      const updatedMember = await OrganizationService.updateMemberRole({
        orgId,
        userId: validatedData.userId,
        newRole: validatedData.role,
        updatedBy: user.id,
      });

      return NextResponse.json({ member: updatedMember });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid input", details: error.errors },
          { status: 400 }
        );
      }

      const errorMessage =
        error instanceof Error ? error.message : "Failed to update member role";
      const statusCode = errorMessage.includes("permission") ? 403 : 500;

      return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }
  },
  [OrgRole.ADMIN, OrgRole.OWNER]
);
