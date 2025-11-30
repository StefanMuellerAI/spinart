import { getTranslations, setRequestLocale } from 'next-intl/server';
import AuthShell from '@/components/auth/AuthShell';
import SignInCard from '@/components/auth/SignInCard';
import type { Locale } from '@/i18n/config';

interface SignInPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function SignInPage({ params }: SignInPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale });

  return (
    <AuthShell
      locale={locale}
      title={t('auth_sign_in_heading')}
      subtitle={t('auth_sign_in_subtitle')}
      backLabel={t('auth_back_home')}
      pills={[t('auth_pill_fast'), t('auth_pill_secure'), t('auth_pill_editor')]}
    >
      <SignInCard locale={locale} />
    </AuthShell>
  );
}
