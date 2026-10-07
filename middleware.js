import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/api/cron') || pathname.startsWith('/api/login') || pathname.startsWith('/api/logout') || pathname === '/login')
    return NextResponse.next();
  const envPass = (process.env.ADMIN_PASSWORD || 'admin123').trim();
  const cookiePass = (req.cookies.get('auth')?.value || '').trim();
  if (cookiePass === envPass) return NextResponse.next();
  if (pathname.startsWith('/api/'))
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.redirect(new URL('/login', req.url));
}

export const config = { matcher: ['/((?!_next|favicon.ico).*)'] };
