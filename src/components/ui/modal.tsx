'use client';

import { X } from 'lucide-react';
import React, { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { Button } from './button';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  actions?: ReactNode;
  children?: ReactNode;
}

export function Modal({ open, title, description, onClose, actions, children }: ModalProps) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>

        {children && (
          <div className="mt-4 text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
            {children}
          </div>
        )}

        {actions && (
          <div className="mt-6 flex items-center justify-end gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
