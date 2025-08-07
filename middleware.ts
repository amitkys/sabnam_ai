import type { NextRequest } from "next/server";

import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// Define paths that don't require authentication (including dynamic paths)
const publicPaths = [
  "/login",
  "/home",
  "/analysis/*", // Dynamic path with wildcard
  "/apptest",
  "/exams",
  "/board",
  "/past10year",
  "/api/board",
  "/api/exams",
  "/api/past10thyear",
  "/user/*/profile", // Example: another dynamic path
];

function matchesPath(pathname: string, pattern: string): boolean {
  // Convert pattern with wildcards to regex
  const regexPattern = pattern
    .replace(/\*/g, "[^/]+") // Replace * with one or more non-slash characters
    .replace(/\//g, "\\/"); // Escape forward slashes

  const regex = new RegExp(`^${regexPattern}$`);

  return regex.test(pathname);
}

function isPublicPath(pathname: string): boolean {
  // Check for root path
  if (pathname === "/") return true;

  // Check against all public paths (including dynamic ones)
  return publicPaths.some((path) => {
    if (path.includes("*")) {
      return matchesPath(pathname, path);
    }

    return pathname.startsWith(path);
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request });

  const isPublic = isPublicPath(pathname);

  // If user is logged in and trying to access login page, redirect to home
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // If user is not logged in and trying to access any non-public route, redirect to login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|json)$).*)",
  ],
};
