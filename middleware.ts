import type { NextRequest } from "next/server";

import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// Define paths that don't require authentication
const publicPaths = [
  "/login", 
  "/", 
  "/home", 
  "/exams", 
  "/board",
  "/api/board",
  "/api/exams",
  "/api/past10thyear"
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for authentication token
  const token = await getToken({ req: request });

  // Check if the path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

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
     * - public folder
     * - api/auth routes
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)",
  ],
};
