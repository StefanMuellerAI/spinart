'use client';

import { useSignIn } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { Locale } from '@/i18n/config';

interface ForgotPasswordCardProps {
  locale: Locale;
}

type Step = 'request' | 'verify' | 'complete';

export default function ForgotPasswordCard({ locale }: ForgotPasswordCardProps) {
  const { isLoaded, signIn } = useSignIn();
  const t = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<Step>('request');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequest = async (event: FormEvent) => {
    event.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    setError(null);

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setStep('verify');
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? t('auth_reset_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (event: FormEvent) => {
    event.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });

      if (result.status === 'complete') {
        setStep('complete');
        setTimeout(() => router.push(`/${locale}/gallery`), 800);
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? t('auth_reset_error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('auth_forgot_heading')}</h2>
          <p className="text-sm text-gray-600">{t('auth_forgot_subtitle')}</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
          {t('auth_secure_badge')}
        </div>
      </div>

      {step === 'request' && (
        <form className="space-y-4" onSubmit={handleRequest}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="email">
              {t('auth_email')}
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              placeholder="you@example.com"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-semibold rounded-xl shadow-md py-2.5 transition-colors"
          >
            {isLoading ? t('auth_loading') : t('auth_reset_send')}
          </button>
        </form>
      )}

      {step === 'verify' && (
        <form className="space-y-4" onSubmit={handleReset}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="code">
              {t('auth_reset_code')}
            </label>
            <input
              id="code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              placeholder="123456"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="password">
              {t('auth_new_password')}
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-semibold rounded-xl shadow-md py-2.5 transition-colors"
          >
            {isLoading ? t('auth_loading') : t('auth_reset_submit')}
          </button>
          <p className="text-xs text-gray-500 text-center">{t('auth_reset_hint')}</p>
        </form>
      )}

      {step === 'complete' && (
        <div className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{t('auth_reset_done_title')}</h3>
          <p className="text-sm text-gray-600">{t('auth_reset_done_text')}</p>
        </div>
      )}
    </div>
  );
}
