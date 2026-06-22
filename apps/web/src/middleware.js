import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { routing, locales, defaultLocale } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Default landing route per role (section 3.4)
const ROLE_HOME = {
  admin: '/dashboard/admin',
  trip_manager: '/dashboard/trips',
  finance_manager: '/dashboard/finance',
  account_manager: '/dashboard/accounts/clients',
  driver: '/dashboard/driver',
};

const AUTH_PAGES = ['/login', '/verify-otp'];

function decodeJwtPayload(token) {
  try {
    const part = token.split('.')[1];
    const json = Buffer.from(
      part.replace(/-/g, '+').replace(/_/g, '/'),
      'base64',
    ).toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function stripLocale(pathname) {
  const segments = pathname.split('/');
  if (locales.includes(segments[1])) {
    const rest = '/' + segments.slice(2).join('/');
    return { locale: segments[1], path: rest === '/' ? '/' : rest.replace(/\/$/, '') };
  }
  return { locale: defaultLocale, path: pathname };
}

export default function middleware(request) {
  const { pathname } = request.nextUrl;
  const { locale, path } = stripLocale(pathname);

  const token = request.cookies.get('accessToken')?.value;
  const payload = token ? decodeJwtPayload(token) : null;
  const isAuthed = Boolean(payload?.role);

  const isAuthPage = AUTH_PAGES.some((p) => path === p || path.startsWith(p + '/'));
  const isDashboard = path.startsWith('/dashboard');

  // Guest-only: authed users hitting auth pages -> their dashboard home
  if (isAuthPage && isAuthed) {
    const home = ROLE_HOME[payload.role] || '/dashboard/admin';
    return NextResponse.redirect(new URL(`/${locale}${home}`, request.url));
  }

  // Protected: unauthenticated users hitting dashboard -> login
  if (isDashboard && !isAuthed) {
    const url = new URL(`/${locale}/login`, request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(en|hi|gu)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
