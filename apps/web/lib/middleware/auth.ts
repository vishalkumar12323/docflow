import { NextRequest } from "next/server";
// import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getCurrentUser, requireOrgAccess } from "@/lib/auth";
import { OrgRole } from "@prisma/client";

export async function withAuthApi(
  handler: (req: NextRequest, context: { user: any }) => Promise<Response>
) {
  return async (req: NextRequest) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        return new Response(
          JSON.stringify({ error: "Authentication required" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      // Extract orgId from URL params or body
      const url = new URL(req.url);
      const orgId =
        url.searchParams.get("orgId") ||
        url.pathname
          .split("/")
          .find((segment, index, arr) => arr[index - 1] === "organizations");

      if (!orgId) {
        return new Response(
          JSON.stringify({ error: "Organization ID required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const role = await requireOrgAccess(user.id, orgId);

      return handler(req, { user, orgId, role });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Access denied";
      const statusCode = errorMessage === "Authentication required" ? 401 : 403;

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}

export function withRateLimit(
  handler: (req: NextRequest, context: any) => Promise<Response>,
  options: { windowMs?: number; maxRequests?: number } = {}
) {
  const { windowMs = 60000, maxRequests = 100 } = options;
  const requests = new Map<string, { count: number; resetTime: number }>();

  return async (req: NextRequest, context: any) => {
    const clientId =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    const now = Date.now();
    const clientData = requests.get(clientId);

    if (!clientData || now > clientData.resetTime) {
      requests.set(clientId, { count: 1, resetTime: now + windowMs });
    } else {
      clientData.count++;

      if (clientData.count > maxRequests) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(
              clientData.resetTime / 1000
            ).toString(),
          },
        });
      }
    }

    return handler(req, context);
  };
}

export async function withOrgAccess(
  handler: (
    req: NextRequest,
    context: { user: any; orgId: string; role: OrgRole }
  ) => Promise<Response>,
  requiredRoles: OrgRole[] = [OrgRole.VIEWER]
) {
  return async (req: NextRequest) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        return new Response(
          JSON.stringify({ error: "Authentication required" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      return handler(req, { user });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}
