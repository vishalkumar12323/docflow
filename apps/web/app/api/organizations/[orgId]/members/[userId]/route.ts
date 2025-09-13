import { NextRequest, NextResponse } from "next/server";
import { withOrgAccess } from "@/lib/middleware/auth";
import { OrganizationService } from "@/lib/services/organization";
import { OrgRole } from "@prisma/client";

export const DELETE = withOrgAccess(
  async (req: NextRequest, { user, orgId, role }) => {
    try {
      const url = new URL(req.url);
      const userId = url.pathname.split("/").pop()!;

      await OrganizationService.removeMember(orgId, userId, user.id);

      return NextResponse.json({ success: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove member";
      const statusCode = errorMessage.includes("permission") ? 403 : 500;

      return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }
  },
  [OrgRole.ADMIN, OrgRole.OWNER]
);
