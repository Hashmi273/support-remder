import { NextResponse } from 'next/server';

export async function POST(req) {
  const { password } = await req.json();
  const envPass = (process.env.ADMIN_PASSWORD || 'admin123').trim();
  const inputPass = (password || '').trim();
  if (inputPass !== envPass)
    return NextResponse.json({ error: 'wrong password' }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set('auth', envPass, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/' });
  return res;
}
