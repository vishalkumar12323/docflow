import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { OrganizationService } from "@/lib/services/organization";

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const member = await OrganizationService.acceptInvitation(
      params.token,
      user.id
    );

    return NextResponse.json({ member });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to accept invitation";

    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
