import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['de', 'en', 'ja'],
  defaultLocale: 'de',
  localePrefix: 'always',
});

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Debug logging
  console.log('=== MIDDLEWARE DEBUG ===');
  console.log('Pathname:', pathname);
  console.log('Full URL:', request.url);
  console.log('Headers Accept-Language:', request.headers.get('accept-language'));
  
  // Check if pathname starts with a locale
  const pathnameHasLocale = ['de', 'en', 'ja'].some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  console.log('Has locale prefix:', pathnameHasLocale);
  
  // Let next-intl middleware handle the request
  const response = intlMiddleware(request);
  
  console.log('Response status:', response?.status);
  console.log('Response headers Location:', response?.headers.get('location'));
  console.log('=========================');
  
  return response;
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
