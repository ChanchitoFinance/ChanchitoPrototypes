import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return NextResponse.next()
  }

  // If the path already has a locale (with or without trailing slash), let it pass through
  if (
    pathname === '/en' ||
    pathname === '/es' ||
    pathname.startsWith('/en/') ||
    pathname.startsWith('/es/')
  ) {
    return NextResponse.next()
  }

  // If the path doesn't start with a locale, redirect to include the default locale
  if (!pathname.startsWith('/en/') && !pathname.startsWith('/es/')) {
    return NextResponse.redirect(new URL(`/en${pathname}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/((?!_next|api|favicon.ico).*)'],
}
