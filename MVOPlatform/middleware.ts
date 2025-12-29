import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // If the path is exactly "/", redirect to default locale
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url))
  }
  
  // If the path doesn't start with a locale, redirect to include the default locale
  if (!pathname.startsWith('/en/') && !pathname.startsWith('/es/') && !pathname.startsWith('/api/')) {
    return NextResponse.redirect(new URL(`/en${pathname}`, request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/((?!_next|api|favicon.ico).*)',
  ],
}