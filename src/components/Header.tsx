'use client';

import React from 'react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { language, setLanguage, theme, setTheme, t } = useApp();

  return (
    <header className="w-full bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-white p-2 flex justify-between items-center shadow-md transition-colors duration-300 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <span className="font-bold text-lg px-2">{t('title')}</span>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <div className="flex gap-1 bg-gray-300 dark:bg-gray-800 rounded p-1">
          <button 
            onClick={() => setLanguage('de')} 
            className={`px-2 py-0.5 rounded text-sm transition-colors ${language === 'de' ? 'bg-white dark:bg-gray-600 shadow text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
          >
            DE
          </button>
          <button 
            onClick={() => setLanguage('en')} 
            className={`px-2 py-0.5 rounded text-sm transition-colors ${language === 'en' ? 'bg-white dark:bg-gray-600 shadow text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
          >
            EN
          </button>
          <button 
            onClick={() => setLanguage('ja')} 
            className={`px-2 py-0.5 rounded text-sm transition-colors ${language === 'ja' ? 'bg-white dark:bg-gray-600 shadow text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
          >
            JP
          </button>
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-1.5 rounded-full bg-gray-300 dark:bg-gray-800 hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors"
          title={theme === 'light' ? t('theme_dark') : t('theme_light')}
        >
          {theme === 'light' ? (
            // Moon icon for dark mode
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          ) : (
            // Sun icon for light mode
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>
          )}
        </button>
      </div>
    </header>
  );
}
