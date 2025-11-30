'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useApp } from '../context/AppContext';
import { locales, localeNames, type Locale } from '@/i18n/config';

export default function Header() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { locale, theme, setTheme } = useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLanguage = (newLocale: Locale) => {
    // Get the path without the locale prefix
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    router.push(`/${newLocale}${pathWithoutLocale}`);
    setIsSettingsOpen(false);
  };

  const localeFlags: Record<Locale, string> = {
    de: '🇩🇪',
    en: '🇬🇧',
    ja: '🇯🇵',
  };

  const navItems = [
    { href: `/${locale}`, label: t('nav_home') },
    { href: `/${locale}/gallery`, label: t('nav_gallery') },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-4 py-3 flex justify-between items-center shadow-lg transition-colors duration-300 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}`} className="font-extrabold text-lg sm:text-xl tracking-tight drop-shadow-sm">
          {t('title')}
        </Link>
        <nav className="hidden sm:flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${isActive(item.href)
                  ? 'bg-white/90 text-indigo-700 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Settings Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-2 rounded-full bg-white/15 hover:bg-white/25 transition-colors border border-white/20"
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isSettingsOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Theme Toggle */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
                <div className="text-xs text-gray-500 mb-2">Theme</div>
                <div className="flex gap-2 bg-white rounded-lg p-1 shadow-inner">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-colors ${theme === 'light' ? 'bg-indigo-100 text-indigo-800 shadow' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>
                    {t('theme_light')}
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-colors ${theme === 'dark' ? 'bg-gray-900 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                    {t('theme_dark')}
                  </button>
                </div>
              </div>

              {/* Language Selector */}
              <div className="p-4 bg-white">
                <div className="text-xs text-gray-500 mb-2">Sprache / Language</div>
                <div className="flex flex-col gap-1">
                  {locales.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => switchLanguage(loc)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${locale === loc ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      <span className="text-base">{localeFlags[loc]}</span>
                      {localeNames[loc]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <SignedOut>
          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/sign-in`}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-white text-indigo-700 hover:bg-indigo-50 shadow-sm transition-colors"
            >
              {t('nav_sign_in')}
            </Link>
            <Link
              href={`/${locale}/sign-up`}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-indigo-900/80 text-white hover:bg-indigo-900 shadow-md transition-colors"
            >
              {t('nav_sign_up')}
            </Link>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/gallery`}
              className="hidden sm:inline-flex px-4 py-2 rounded-full text-sm font-semibold bg-white text-indigo-700 hover:bg-indigo-50 shadow-sm transition-colors"
            >
              {t('nav_gallery')}
            </Link>
            <UserButton afterSignOutUrl={`/${locale}`} appearance={{ elements: { avatarBox: 'w-9 h-9 border-2 border-white/40 shadow-md' } }} />
          </div>
        </SignedIn>
      </div>
    </header>
  );
}
