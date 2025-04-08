import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// Define paths that don't require authentication
const publicPaths = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is public
  const isPublicPath = publicPaths.some((path) => path === pathname);
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Check for authentication token
  const token = await getToken({ req: request });
  
  if (!token) {
    // Redirect unauthenticated users to login
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