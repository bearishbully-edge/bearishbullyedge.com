// middleware.ts

import { NextRequest, NextResponse } from 'next/server';

const TERMINAL_HOSTS = ['bearishbullyedge.io', 'www.bearishbullyedge.io'];

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? '';
  const pathname = request.nextUrl.pathname;

  const isTerminalHost = TERMINAL_HOSTS.includes(hostname);

  if (isTerminalHost && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};