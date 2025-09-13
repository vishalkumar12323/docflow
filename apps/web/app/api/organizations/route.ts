import { NextRequest, NextResponse } from "next/server";
import { withAuthApi } from "@/lib/middleware/auth";
import { OrganizationService } from "@/lib/services/organization";
import { OrgPlan } from "@prisma/client";
import { z } from "zod";

export const GET = withAuthApi(async (req: NextRequest, { user }) => {
  try {
    const organizations = user.orgMembers.map((member: any) => ({
      id: member.org.id,
      name: member.org.name,
      slug: member.org.slug,
      role: member.role,
      plan: member.org.plan,
      logo: member.org.logo,
      memberCount: member.org._count?.members || 0,
      documentCount: member.org._count?.documents || 0,
      joinedAt: member.joinedAt,
      createdAt: member.org.createdAt,
    }));

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 }
    );
  }
});

export const POST = withAuthApi(async (req: NextRequest, { user }) => {
  try {
    const body = await req.json();
    const validatedData = createOrgSchema.parse(body);

    const organization = await OrganizationService.createOrganization({
      ...validatedData,
      createdBy: user.id,
    });

    return NextResponse.json({ organization }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
});
