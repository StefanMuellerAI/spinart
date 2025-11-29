import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  devIndicators: false,
  experimental: {
    // Allow Turbopack to use system TLS certificates so Google Fonts can be fetched in restricted environments
    turbopackUseSystemTlsCerts: true,
  },
};

export default withNextIntl(nextConfig);
