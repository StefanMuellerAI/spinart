import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { AppProvider } from "@/context/AppContext";
import type { Locale } from "@/i18n/config";
import "../globals.css";

export const metadata: Metadata = {
  title: "Spinart by StefanAI",
  description: "Create beautiful spin art with your Apple Pencil or mouse",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Spinart",
  },
};

// Viewport configuration for iPad / touch devices
// Prevents unwanted zooming and gestures while drawing
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

// Generate static params for all locales
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client side
  const messages = await getMessages();

  const publishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY or CLERK_PUBLISHABLE_KEY. Please add your Clerk publishable key to .env.local."
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang={locale} suppressHydrationWarning>
        <body className="antialiased">
          <NextIntlClientProvider locale={locale} messages={messages}>
            <AppProvider locale={locale as Locale}>
              {children}
            </AppProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
