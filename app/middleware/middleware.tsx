// middleware.ts
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define paths that are public (don't require authentication)
  const isPublicPath = 
    path === '/' || 
    path === '/privacy' || 
    path === '/contact' || 
    path.startsWith('/auth/') ||
    path.startsWith('/api/auth/');

  // Check if there is a valid session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect logic
  if (isPublicPath && token) {
    // If user is logged in and trying to access a public path like login/register
    // Redirect them to workouts page
    if (path.startsWith('/auth/')) {
      return NextResponse.redirect(new URL('/workouts', request.url));
    }
  }

  if (!isPublicPath && !token) {
    // If user is not logged in and trying to access a protected path
    // Redirect them to login page
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/',
    '/workouts/:path*',
    '/auth/:path*',
    '/privacy',
    '/contact',
  ],
};