import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextRequest, NextResponse } from "next/server";

// Protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/organizations",
  "/documents",
  "/jobs",
  "/settings",
  "/api/dashboard",
  "/api/organizations",
  "/api/documents",
  "/api/jobs",
];

// Public routes that don't require authentication
const publicRoutes = ["/", "/auth", "/api/auth", "/api/webhooks"];

export default withAuth(
  async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Skip middleware for static files and Next.js internals
    if (
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/api/_next") ||
      pathname.includes(".")
    ) {
      return NextResponse.next();
    }

    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // Check if route is public
    const isPublicRoute = publicRoutes.some(
      (route) => pathname.startsWith(route) || pathname === route
    );

    // If it's a protected route and user is not authenticated, redirect to login
    if (isProtectedRoute && !req.auth) {
      const loginUrl = new URL("/api/auth/login", req.url);
      loginUrl.searchParams.set("post_login_redirect_url", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (req.auth && pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    isReturnToCurrentPage: true,
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
