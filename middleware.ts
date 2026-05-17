// middleware.ts

import { NextRequest, NextResponse } from 'next/server';

const MARKETING_HOSTS = [
  'bearishbullyedge.com',
  'www.bearishbullyedge.com',
];

const TERMINAL_HOST = 'https://bearishbullyedge.io';

const TERMINAL_ONLY_PATHS = [
  '/auth/login',
  '/auth/callback',
  '/dashboard',
  '/settings',
];

function isTerminalOnlyPath(pathname: string): boolean {
  return TERMINAL_ONLY_PATHS.some((path) => pathname.startsWith(path));
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? '';
  const pathname = request.nextUrl.pathname;

  const isMarketingHost = MARKETING_HOSTS.includes(hostname);

  if (isMarketingHost && isTerminalOnlyPath(pathname)) {
    const redirectUrl = new URL(pathname, TERMINAL_HOST);
    redirectUrl.search = request.nextUrl.search;

    return NextResponse.redirect(redirectUrl);
  }

  if (
    (hostname === 'bearishbullyedge.io' ||
      hostname === 'www.bearishbullyedge.io') &&
    pathname === '/'
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/auth/login',
    '/auth/callback',
    '/dashboard/:path*',
    '/settings/:path*',
  ],
};