import { auth } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import LegalFooter from '@/components/LegalFooter';
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

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60 p-8 shadow-inner min-h-[280px] flex flex-col items-center justify-center text-center gap-4">
            <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('gallery_empty_title')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl">{t('gallery_empty_text')}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/${locale}`}
                className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition-colors"
              >
                {t('gallery_to_editor')}
              </Link>
              <button
                type="button"
                className="px-5 py-2.5 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-semibold shadow-sm"
              >
                {t('gallery_empty_cta')}
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t('gallery_quickstart_title')}</h3>
                <p className="text-sm text-white/80">{t('gallery_quickstart_text')}</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-white" />
                <span>{t('gallery_quickstart_1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-white" />
                <span>{t('gallery_quickstart_2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-white" />
                <span>{t('gallery_quickstart_3')}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
      <LegalFooter />
    </main>
  );
}
