'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Locale } from '@/i18n/config';

export type Theme = 'light' | 'dark';

interface AppContextType {
  locale: Locale;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
  locale: Locale;
}

export function AppProvider({ children, locale }: AppProviderProps) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved theme preference
    const savedTheme = localStorage.getItem('spinart-theme') as Theme;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('spinart-theme', theme);
      
      // Tailwind uses 'dark' class for dark mode
      const root = document.documentElement;
      
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    }
  }, [theme, mounted]);

  return (
    <AppContext.Provider value={{ locale, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
