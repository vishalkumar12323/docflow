import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Return user data without sensitive information
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      organizations: user.orgMembers.map((member) => ({
        id: member.org.id,
        name: member.org.name,
        slug: member.org.slug,
        role: member.role,
        plan: member.org.plan,
        logo: member.org.logo,
        joinedAt: member.joinedAt,
      })),
    };

    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
