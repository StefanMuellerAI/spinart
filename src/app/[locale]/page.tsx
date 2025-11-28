import { setRequestLocale } from 'next-intl/server';
import SpinArt from '@/components/SpinArt';
import LegalFooter from '@/components/LegalFooter';
import Header from '@/components/Header';

interface HomeProps {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);

  return (
    <main className="flex flex-col min-h-screen bg-white dark:bg-gray-800 transition-colors duration-300">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center">
        <SpinArt />
      </div>
      <LegalFooter />
    </main>
  );
}
