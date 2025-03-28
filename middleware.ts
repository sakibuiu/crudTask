import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuth } from "./lib/edge-auth"

export async function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const publicPaths = ["/login", "/register", "/api/auth/login", "/api/auth/register"]

  // Check if the path is public
  const isPublicPath = publicPaths.some(
    (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + "/"),
  )

  if (isPublicPath) {
    return NextResponse.next()
  }

  // Get the session using edge-compatible function
  const session = await verifyAuth(request)

  // If no session, redirect to login
  if (!session) {
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Allow access to the requested resource
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

