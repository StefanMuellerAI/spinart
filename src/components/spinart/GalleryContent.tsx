'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight, Download, Loader2, RefreshCcw, Sparkles, Trash2, Video } from 'lucide-react';

import { useGalleryStorage } from '@/hooks';
import { exportCanvasAnimation, type ExportFormat } from '@/hooks/useSpinArtExport';
import { CANVAS_SIZE } from '@/types/spinart';
import type { Locale } from '@/i18n/config';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface GalleryContentProps {
  locale: Locale;
}

async function createCanvasFromDataUrl(imageDataUrl: string) {
  const image = new Image();
  image.src = imageDataUrl;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Failed to load draft image'));
  });

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to prepare export canvas');

  ctx.drawImage(image, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
  return canvas;
}

export function GalleryContent({ locale }: GalleryContentProps) {
  const t = useTranslations();
  const { drafts, isReady, deleteDraft } = useGalleryStorage();
  const [exporting, setExporting] = useState<{ id: string; format: ExportFormat } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteDraftId, setDeleteDraftId] = useState<string | null>(null);
  const [exportedFormat, setExportedFormat] = useState<ExportFormat | null>(null);

  const handleExport = useCallback(async (draftId: string, format: ExportFormat) => {
    const draft = drafts.find(item => item.id === draftId);
    if (!draft) return;
    setExporting({ id: draftId, format });
    setErrorMessage('');
    try {
      const canvas = await createCanvasFromDataUrl(draft.imageDataUrl);
      await exportCanvasAnimation(canvas, draft.playbackSpeed, draft.direction, format);
      setExportedFormat(format);
    } catch (error) {
      console.error('Export failed', error);
      setErrorMessage(t('export_failed'));
    } finally {
      setExporting(null);
    }
  }, [drafts, t]);

  const handleDelete = useCallback((draftId: string) => {
    setDeleteDraftId(draftId);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteDraftId) return;
    if (exporting?.id === deleteDraftId) {
      setExporting(null);
    }
    deleteDraft(deleteDraftId);
    setDeleteDraftId(null);
  }, [deleteDraft, deleteDraftId, exporting]);

  const closeDeleteModal = useCallback(() => {
    setDeleteDraftId(null);
  }, []);

  const cards = useMemo(() => [...drafts].sort((a, b) => b.updatedAt - a.updatedAt), [drafts]);

  if (!isReady) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
        <div className="flex items-center justify-center gap-3 text-gray-500">
          <Loader2 className="size-5 animate-spin" />
          <span>{t('loading')}</span>
        </div>
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60 p-8 shadow-inner min-h-[280px] flex flex-col items-center justify-center text-center gap-4">
          <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-200 flex items-center justify-center">
            <Sparkles className="size-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('gallery_empty_title')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl">{t('gallery_empty_text')}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/${locale}`}
              className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition-colors"
            >
              {t('gallery_to_editor')}
            </Link>
            <Button variant="outline" className="rounded-full">
              {t('gallery_empty_cta')}
            </Button>
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Video className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t('gallery_quickstart_title')}</h3>
              <p className="text-sm text-white/80">{t('gallery_quickstart_text')}</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-white" />
              <span>{t('gallery_quickstart_1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-white" />
              <span>{t('gallery_quickstart_2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-white" />
              <span>{t('gallery_quickstart_3')}</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Modal
        open={!!deleteDraftId}
        onClose={closeDeleteModal}
        title={t('gallery_delete_title')}
        description={t('gallery_delete_confirm')}
        actions={(
          <>
            <Button variant="ghost" onClick={closeDeleteModal}>
              {t('gallery_delete_cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t('gallery_delete_confirm_label')}
            </Button>
          </>
        )}
      />

      <Modal
        open={!!exportedFormat}
        onClose={() => setExportedFormat(null)}
        title={t('export_success_title')}
        description={t('export_success_description')}
        actions={(
          <Button onClick={() => setExportedFormat(null)}>
            {t('export_success_close')}
          </Button>
        )}
      >
        {exportedFormat === 'gif' ? t('export_success_gif') : t('export_success_mp4')}
      </Modal>

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/30 dark:border-red-800 text-red-700 dark:text-red-100 px-4 py-3">
          {errorMessage}
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((draft) => {
          const isExporting = exporting?.id === draft.id;
          const rotationSpeed = Math.max(6, 14 - Math.abs(draft.playbackSpeed) * 2);
          const exportLabel = (format: ExportFormat) =>
            isExporting && exporting?.format === format ? t('export_running') : format === 'gif' ? t('export_gif') : t('export_mp4');

          return (
            <div key={draft.id} className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60 shadow-sm overflow-hidden">
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 via-white to-indigo-50 dark:from-gray-800 dark:via-gray-900 dark:to-indigo-900/40 flex items-center justify-center">
                <div className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full bg-black/60 text-white shadow-sm backdrop-blur">
                  {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(draft.updatedAt)}
                </div>
                <div className="relative h-[78%] w-[78%] rounded-full overflow-hidden border-8 border-white/80 dark:border-gray-800 shadow-inner">
                  <div
                    className="absolute inset-0 flex items-center justify-center animate-[spin_12s_linear_infinite]"
                    style={{
                      animationDuration: `${rotationSpeed}s`,
                      animationDirection: draft.direction >= 0 ? 'normal' : 'reverse',
                    }}
                  >
                    <NextImage
                      src={draft.imageDataUrl}
                      alt={t('gallery_preview_alt')}
                      fill
                      sizes="320px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-300">
                  <span className="flex items-center gap-2">
                    <RefreshCcw className="size-4" />
                    {t('gallery_preview_hint')}
                  </span>
                  <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-300">
                    <Sparkles className="size-4" />
                    {t('gallery_editable')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/${locale}?draftId=${draft.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition-colors"
                  >
                    <ArrowRight className="size-4" />
                    {t('continue_editing')}
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(draft.id)}
                    disabled={isExporting}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    <Trash2 className="size-4" />
                    <span className="ml-2">{t('gallery_delete')}</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExport(draft.id, 'gif')}
                    disabled={isExporting}
                    className="flex-1 min-w-[140px]"
                  >
                    {isExporting && exporting?.format === 'gif' ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                    <span className="ml-2">{exportLabel('gif')}</span>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleExport(draft.id, 'mp4')}
                    disabled={isExporting}
                    className="flex-1 min-w-[140px]"
                  >
                    {isExporting && exporting?.format === 'mp4' ? <Loader2 className="size-4 animate-spin" /> : <Video className="size-4" />}
                    <span className="ml-2">{exportLabel('mp4')}</span>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GalleryContent;
