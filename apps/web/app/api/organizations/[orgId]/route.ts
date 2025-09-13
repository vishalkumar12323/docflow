import { NextRequest, NextResponse } from "next/server";
import { withOrgAccess } from "@/lib/middleware/auth";
import { OrganizationService } from "@/lib/services/organization";
import { OrgRole } from "@prisma/client";

// Get organization details
export const GET = withOrgAccess(
  async (req: NextRequest, { user, orgId, role }) => {
    try {
      const organization = await OrganizationService.getOrganization(
        orgId,
        user.id
      );
      const stats = await OrganizationService.getOrgStats(orgId);

      return NextResponse.json({
        organization: {
          ...organization,
          stats,
        },
      });
    } catch (error) {
      console.error("Error fetching organization:", error);
      return NextResponse.json(
        { error: "Failed to fetch organization" },
        { status: 500 }
      );
    }
  },
  [OrgRole.VIEWER]
);

// Update organization
export const PATCH = withOrgAccess(
  async (req: NextRequest, { user, orgId, role }) => {
    try {
      const body = await req.json();

      // Only owners and admins can update organization details
      if (![OrgRole.OWNER, OrgRole.ADMIN].includes(role)) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        );
      }

      // Implementation for updating organization
      // This would include validation and update logic

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error updating organization:", error);
      return NextResponse.json(
        { error: "Failed to update organization" },
        { status: 500 }
      );
    }
  },
  [OrgRole.ADMIN, OrgRole.OWNER]
);
