import { auth } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import LegalFooter from '@/components/LegalFooter';
import GalleryContent from '@/components/spinart/GalleryContent';
import type { Locale } from '@/i18n/config';

interface GalleryPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { userId } = await auth();
  if (!userId) {
    redirect(`/${locale}/sign-in`);
  }

  const t = await getTranslations({ locale });

  return (
    <main className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <section className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-8">
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-500 font-semibold">Spinart Studio</p>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('gallery_title')}</h1>
          <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl">{t('gallery_subtitle')}</p>
        </div>
        <GalleryContent locale={locale} />
      </section>
      <LegalFooter />
    </main>
  );
}
