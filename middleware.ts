import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define paths that are public (don't require authentication)
  const isPublicPath =
    path === "/" ||
    path === "/privacy" ||
    path === "/contact" ||
    path.startsWith("/auth/") ||
    path.startsWith("/api/auth/")

  // Check if there is a valid session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  console.log(
    `[Middleware] Path: ${path}, isPublicPath: ${isPublicPath}, hasToken: ${!!token}`
  )

  // Redirect logic for auth pages
  if (path.startsWith("/auth/") && token) {
    console.log(
      `[Middleware] User already logged in, redirecting to properties`
    )
    return NextResponse.redirect(new URL("/properties/map", request.url))
  }

  // For all other protected routes
  if (!isPublicPath && !token) {
    console.log(`[Middleware] Protected route, redirecting to login: ${path}`)
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    "/",
    "/auth/:path*",
    "/privacy",
    "/contact",
    "/profile/:path*",
    "/properties",
    "/properties/:path*",
    "/csv-upload",
  ],
}
