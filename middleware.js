import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/api/cron') || pathname.startsWith('/api/login') || pathname.startsWith('/api/logout') || pathname === '/login')
    return NextResponse.next();
  if (req.cookies.get('auth')?.value === process.env.ADMIN_PASSWORD) return NextResponse.next();
  if (pathname.startsWith('/api/'))
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.redirect(new URL('/login', req.url));
}

export const config = { matcher: ['/((?!_next|favicon.ico).*)'] };
