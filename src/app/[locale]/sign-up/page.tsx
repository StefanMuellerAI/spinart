import { getTranslations, setRequestLocale } from 'next-intl/server';
import AuthShell from '@/components/auth/AuthShell';
import SignUpCard from '@/components/auth/SignUpCard';
import type { Locale } from '@/i18n/config';

interface SignUpPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function SignUpPage({ params }: SignUpPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale });

  return (
    <AuthShell
      locale={locale}
      title={t('auth_sign_up_heading')}
      subtitle={t('auth_sign_up_subtitle')}
      backLabel={t('auth_back_home')}
      pills={[t('auth_pill_fast'), t('auth_pill_secure'), t('auth_pill_editor')]}
    >
      <SignUpCard locale={locale} />
    </AuthShell>
  );
}
