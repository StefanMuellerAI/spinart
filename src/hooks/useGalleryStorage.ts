import { useCallback, useState } from 'react';

export interface SpinArtDraft {
  id: string;
  createdAt: number;
  updatedAt: number;
  imageDataUrl: string;
  playbackSpeed: number;
  direction: number;
}

const STORAGE_KEY = 'spinart-gallery';

export function useGalleryStorage() {
  const [drafts, setDrafts] = useState<SpinArtDraft[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored) as SpinArtDraft[];
    } catch (error) {
      console.error('Failed to parse gallery storage', error);
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });
  const [isReady] = useState(() => typeof window !== 'undefined');

  const persist = useCallback((nextDrafts: SpinArtDraft[]) => {
    setDrafts(nextDrafts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDrafts));
  }, []);

  const saveDraftFromCanvas = useCallback(
    (
      canvas: HTMLCanvasElement,
      playbackSpeed: number,
      direction: number,
      draftId?: string,
    ) => {
      const now = Date.now();
      const id = draftId ?? (crypto.randomUUID ? crypto.randomUUID() : `${now}`);
      const imageDataUrl = canvas.toDataURL('image/png');
      let savedDraft: SpinArtDraft;

      setDrafts(prev => {
        const existing = prev.find(item => item.id === id);
        savedDraft = {
          id,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
          imageDataUrl,
          playbackSpeed,
          direction,
        };
        const next = [savedDraft, ...prev.filter(item => item.id !== id)];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });

      return savedDraft!;
    },
    []
  );

  const deleteDraft = useCallback((id: string) => {
    setDrafts(prev => {
      const next = prev.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const getDraftById = useCallback(
    (id: string) => drafts.find(item => item.id === id),
    [drafts]
  );

  const importDraftFromDataUrl = useCallback(
    (imageDataUrl: string, playbackSpeed: number, direction: number) => {
      const now = Date.now();
      const id = crypto.randomUUID ? crypto.randomUUID() : `${now}`;
      const draft: SpinArtDraft = {
        id,
        createdAt: now,
        updatedAt: now,
        imageDataUrl,
        playbackSpeed,
        direction,
      };
      persist([draft, ...drafts]);
      return draft;
    },
    [drafts, persist]
  );

  return {
    drafts,
    isReady,
    saveDraftFromCanvas,
    deleteDraft,
    getDraftById,
    importDraftFromDataUrl,
  };
}
