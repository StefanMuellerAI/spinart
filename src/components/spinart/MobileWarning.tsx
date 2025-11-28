'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileWarningProps {
  onClose: () => void;
}

export function MobileWarning({ onClose }: MobileWarningProps) {
  const t = useTranslations();

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-card p-8 rounded-2xl shadow-2xl max-w-md border border-border">
        <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="size-8" />
        </div>
        <h2 className="text-2xl font-bold mb-4">{t('mobile_warning_title')}</h2>
        <p className="text-muted-foreground mb-6">{t('mobile_warning_text')}</p>
        <Button
          onClick={onClose}
          variant="outline"
          className="w-full min-h-[44px]"
        >
          {t('continue_anyway')}
        </Button>
      </div>
    </div>
  );
}

/**
 * Utility function to check if device should show mobile warning
 * - iPad with Apple Pencil should NOT show warning (has fine pointer)
 * - Small smartphones without stylus SHOULD show warning
 */
export function shouldShowMobileWarning(): boolean {
  if (typeof window === 'undefined') return false;
  
  const isSmallScreen = window.innerWidth < 768;
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const hasFinePointer = window.matchMedia('(any-pointer: fine)').matches;
  
  // Show warning only on small screens without stylus/fine pointer support
  // iPad with Apple Pencil reports (any-pointer: fine) = true
  return isSmallScreen && hasCoarsePointer && !hasFinePointer;
}
