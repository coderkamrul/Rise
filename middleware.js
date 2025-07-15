import { NextResponse } from "next/server"

export function middleware(request) {
  const token = request.cookies.get("token")?.value
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register", "/rules"]

  // API routes should be handled separately
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Static files and Next.js internals
  if (pathname.startsWith("/_next/") || pathname.startsWith("/favicon.ico") || pathname.includes(".")) {
    return NextResponse.next()
  }

  // If it's a public route, allow access
  if (publicRoutes.includes(pathname)) {
    // If user has a token and tries to access login/register, redirect to dashboard
    if (token && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  // For protected routes, check if token exists
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Let the token verification happen in API routes
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
