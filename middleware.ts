import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE, isAdminToken } from './lib/auth';

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/manage/login')) return NextResponse.next();
  if (await isAdminToken(req.cookies.get(COOKIE)?.value)) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = '/manage/login';
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/manage', '/manage/:path*'] };
