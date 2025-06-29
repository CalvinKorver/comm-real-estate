// middleware.ts
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Block access to signup page for early release
  if (path === '/auth/signup') {
    console.log(`[Middleware] Blocking access to signup page: ${path}`);
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
  
  // Define paths that are public (don't require authentication)
  const isPublicPath = 
    path === '/' || 
    path === '/marketing' ||
    path === '/privacy' || 
    path === '/contact' || 
    path === '/auth/signin' ||
    path === '/auth/signout' ||
    path.startsWith('/api/auth/');

  // Check if there is a valid session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log(`[Middleware] Path: ${path}, isPublicPath: ${isPublicPath}, hasToken: ${!!token}`);

  // Workout routes should be protected
  if (path.startsWith('/workouts') && !token) {
    console.log(`[Middleware] Redirecting to login: ${path}`);
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Redirect logic for auth pages (except signup which is blocked above)
  if (path.startsWith('/auth/') && token) {
    console.log(`[Middleware] User already logged in, redirecting to workouts`);
    return NextResponse.redirect(new URL('/workouts', request.url));
  }

  // For all other protected routes
  if (!isPublicPath && !token) {
    console.log(`[Middleware] Protected route, redirecting to login: ${path}`);
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/',
    '/marketing',
    '/workouts',
    '/workouts/:path*',
    '/auth/:path*',
    '/privacy',
    '/contact',
    '/profile/:path*',
  ],
};