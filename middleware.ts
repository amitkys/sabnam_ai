import type { NextRequest } from "next/server";

import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// Define paths that don't require authentication
const publicPaths = [
  "/login", 
  "/home", 
  "/apptest",
  "/exams", 
  "/board",
  "/past10year",
  "/api/board",
  "/api/exams",
  "/api/past10thyear",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request });

  // Handle root path separately with exact match
  const isRootPath = pathname === "/";
  const isPublicPath = isRootPath || publicPaths.some((path) => pathname.startsWith(path));

  // If user is logged in and trying to access login page, redirect to home
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // If user is not logged in and trying to access any non-public route, redirect to login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// middleware would run on everything expect routes that given in matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder contents
     * - api/auth routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|json)$).*)',
  ],
};
