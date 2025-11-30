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
  const [mounted] = useState<boolean>(() => typeof window !== 'undefined');
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark';
    const savedTheme = localStorage.getItem('spinart-theme') as Theme;
    return savedTheme ?? 'dark';
  });

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
