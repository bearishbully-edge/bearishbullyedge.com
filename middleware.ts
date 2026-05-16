// middleware.ts

import { NextRequest, NextResponse } from 'next/server';

const TERMINAL_HOSTS = [
  'bearishbullyedge.io',
  'www.bearishbullyedge.io',
];

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? '';
  const pathname = request.nextUrl.pathname;

  const isTerminalHost = TERMINAL_HOSTS.includes(hostname);

  /*
    IO DOMAIN
    → force terminal/dashboard experience
  */

  if (isTerminalHost) {
    if (pathname === '/') {
      return NextResponse.redirect(
        new URL('/dashboard', request.url),
      );
    }

    return NextResponse.next();
  }

  /*
    .COM DOMAIN
    → sales/marketing site
  */

  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/settings')
  ) {
    const hasSupabaseSession =
      request.cookies.has('sb-access-token') ||
      request.cookies
        .getAll()
        .some((cookie) => cookie.name.startsWith('sb-'));

    if (!hasSupabaseSession) {
      return NextResponse.redirect(
        new URL('/auth/login', request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/settings/:path*',
  ],
};