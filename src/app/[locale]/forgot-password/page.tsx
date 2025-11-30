import { getTranslations, setRequestLocale } from 'next-intl/server';
import AuthShell from '@/components/auth/AuthShell';
import ForgotPasswordCard from '@/components/auth/ForgotPasswordCard';
import type { Locale } from '@/i18n/config';

interface ForgotPasswordPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale });

  return (
    <AuthShell
      locale={locale}
      title={t('auth_forgot_heading')}
      subtitle={t('auth_forgot_subtitle')}
      backLabel={t('auth_back_home')}
      pills={[t('auth_pill_fast'), t('auth_pill_secure'), t('auth_pill_editor')]}
    >
      <ForgotPasswordCard locale={locale} />
    </AuthShell>
  );
}
