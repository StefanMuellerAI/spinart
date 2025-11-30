import Link from 'next/link';
import React from 'react';
import type { Locale } from '@/i18n/config';

interface AuthShellProps {
  title: string;
  subtitle: string;
  locale: Locale;
  backLabel: string;
  pills: string[];
  children: React.ReactNode;
}

export default function AuthShell({ title, subtitle, locale, backLabel, pills, children }: AuthShellProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.12),transparent_20%),radial-gradient(circle_at_50%_60%,rgba(0,0,0,0.08),transparent_35%)] pointer-events-none" />
      <header className="flex items-center justify-between px-6 py-4 text-white/90">
        <Link href={`/${locale}`} className="font-bold tracking-tight text-lg drop-shadow">
          Spinart
        </Link>
        <Link
          href={`/${locale}`}
          className="text-sm font-semibold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full transition-colors"
        >
          {backLabel}
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-10">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
          <div className="hidden lg:flex flex-col justify-center gap-4 text-white drop-shadow-sm">
            <p className="uppercase text-xs tracking-[0.2em] text-white/80">Spinart</p>
            <h1 className="text-3xl font-extrabold leading-tight">{title}</h1>
            <p className="text-base text-white/80 leading-relaxed">{subtitle}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/80">
              {pills.map((pill) => (
                <span key={pill} className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
                  {pill}
                </span>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-1 bg-white/20 blur-3xl rounded-3xl" aria-hidden />
            <div className="relative bg-white rounded-3xl shadow-2xl border border-white/40 overflow-hidden">
              <div className="absolute -right-14 -top-14 h-36 w-36 bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 rounded-full opacity-60" />
              <div className="absolute -left-10 -bottom-10 h-28 w-28 bg-gradient-to-tr from-indigo-100 via-purple-200 to-pink-200 rounded-full opacity-60" />
              <div className="relative p-6 sm:p-8">
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
