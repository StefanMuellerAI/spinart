import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['de', 'en', 'ja'],
  defaultLocale: 'en', // English as fallback
  localePrefix: 'always',
});

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
