import { NextResponse } from 'next/server';

export async function POST(req) {
  const { password } = await req.json();
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD)
    return NextResponse.json({ error: 'wrong password' }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set('auth', password, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/' });
  return res;
}
