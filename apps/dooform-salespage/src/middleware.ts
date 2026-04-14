import { NextRequest, NextResponse } from 'next/server';
import { i18n } from './i18n/config';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the pathname already has a locale
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Detect locale from Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') || '';
  const locale = acceptLanguage.includes('th')
    ? 'th'
    : i18n.defaultLocale;

  // Redirect to the locale-prefixed path
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
