'use client';

import { SignUp } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';

interface SignUpCardProps {
  locale: Locale;
}

export default function SignUpCard({ locale }: SignUpCardProps) {
  const t = useTranslations();

  const appearance = {
    elements: {
      rootBox: 'w-full',
      card: 'shadow-none border-0 bg-transparent p-0',
      headerTitle: 'text-xl font-semibold text-gray-900',
      headerSubtitle: 'text-sm text-gray-500',
      formButtonPrimary: 'bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl shadow-md py-2 transition-colors',
      formFieldLabel: 'text-sm font-medium text-gray-700',
      formFieldInput: 'rounded-xl border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200',
      footerAction__signIn: 'text-pink-600 font-semibold',
      socialButtonsBlockButton: 'rounded-xl border border-gray-200 hover:border-pink-300 text-gray-700 font-semibold',
    },
    layout: {
      socialButtonsPlacement: 'bottom',
    },
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('auth_sign_up_heading')}</h2>
          <p className="text-sm text-gray-600">{t('auth_sign_up_subtitle')}</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-semibold">
          {t('auth_secure_badge')}
        </div>
      </div>
      <SignUp
        path={`/${locale}/sign-up`}
        routing="path"
        signInUrl={`/${locale}/sign-in`}
        afterSignUpUrl={`/${locale}/gallery`}
        appearance={appearance}
      />
    </div>
  );
}
