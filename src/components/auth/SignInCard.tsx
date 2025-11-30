'use client';

import { SignIn } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';

interface SignInCardProps {
  locale: Locale;
}

export default function SignInCard({ locale }: SignInCardProps) {
  const t = useTranslations();

  const appearance = {
    elements: {
      rootBox: 'w-full',
      card: 'shadow-none border-0 bg-transparent p-0',
      headerTitle: 'text-xl font-semibold text-gray-900',
      headerSubtitle: 'text-sm text-gray-500',
      formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md py-2 transition-colors',
      formFieldLabel: 'text-sm font-medium text-gray-700',
      formFieldInput: 'rounded-xl border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200',
      footerAction__signUp: 'text-indigo-700 font-semibold',
      footerAction__forgotPassword: 'text-indigo-700 font-semibold',
      socialButtonsBlockButton: 'rounded-xl border border-gray-200 hover:border-indigo-300 text-gray-700 font-semibold',
    },
    layout: {
      socialButtonsPlacement: 'bottom',
    },
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('auth_sign_in_heading')}</h2>
          <p className="text-sm text-gray-600">{t('auth_sign_in_subtitle')}</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
          {t('auth_secure_badge')}
        </div>
      </div>
      <SignIn
        path={`/${locale}/sign-in`}
        routing="path"
        signUpUrl={`/${locale}/sign-up`}
        afterSignInUrl={`/${locale}/gallery`}
        appearance={appearance}
      />
      <div className="text-center text-sm text-gray-600">
        <a className="text-indigo-700 font-semibold hover:underline" href={`/${locale}/forgot-password`}>
          {t('auth_forgot_link')}
        </a>
      </div>
    </div>
  );
}
