import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const existingToken = request.headers.get('cookie')?.match(/__Host-csrf-token=([^;]+)/)?.[1];

  if (existingToken) {
    // Reuse existing token — client can read it from the cookie
    const resp = NextResponse.json({ token: existingToken });
    return resp;
  }

  // Generate a new token
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Buffer.from(array).toString('hex');

  const resp = NextResponse.json({ token });
  resp.cookies.set('__Host-csrf-token', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  return resp;
}
