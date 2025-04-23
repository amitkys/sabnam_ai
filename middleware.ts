import type { NextRequest } from "next/server";

import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// Define paths that don't require authentication
const publicPaths = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for authentication token
  const token = await getToken({ req: request });

  // Check if the path is public
  const isPublicPath = publicPaths.some((path) => path === pathname);

  // If user is logged in and trying to access login page, redirect to home
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // If user is not logged in and trying to access protected routes, redirect to login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that might handle authentication
     */
    "/((?!_next/static|_next/image|favicon.ico|public|.*\\..*|api/auth).*)",
  ],
};
