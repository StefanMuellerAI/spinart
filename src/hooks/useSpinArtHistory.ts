import { useState, useCallback, useRef, MutableRefObject } from 'react';
import { CANVAS_SIZE, DISC_RADIUS } from '@/types/spinart';

interface UseSpinArtHistoryReturn {
  history: ImageData[];
  historyIndex: number;
  addToHistory: () => void;
  undo: () => void;
  redo: () => void;
  eraseAll: () => void;
  canUndo: boolean;
  canRedo: boolean;
  initializeHistory: (imageData: ImageData) => void;
}

export function useSpinArtHistory(
  paperCanvasRef: MutableRefObject<HTMLCanvasElement | null>
): UseSpinArtHistoryReturn {
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addToHistory = useCallback(() => {
    const paper = paperCanvasRef.current;
    const ctx = paper?.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(imageData);
      if (newHistory.length > 20) {
        newHistory.shift();
      }
      return newHistory;
    });
    
    setHistoryIndex(prev => {
      const newLen = (prev + 1) + 1;
      if (newLen > 20) return 19;
      return prev + 1;
    });
  }, [historyIndex, paperCanvasRef]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const paper = paperCanvasRef.current;
      const ctx = paper?.getContext('2d');
      if (ctx && history[newIndex]) {
        ctx.putImageData(history[newIndex], 0, 0);
      }
    }
  }, [history, historyIndex, paperCanvasRef]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const paper = paperCanvasRef.current;
      const ctx = paper?.getContext('2d');
      if (ctx && history[newIndex]) {
        ctx.putImageData(history[newIndex], 0, 0);
      }
    }
  }, [history, historyIndex, paperCanvasRef]);

  const eraseAll = useCallback(() => {
    const pc = paperCanvasRef.current;
    const ctx = pc?.getContext('2d');
    if (pc && ctx) {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.beginPath();
      ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, DISC_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      addToHistory();
    }
  }, [addToHistory, paperCanvasRef]);

  const initializeHistory = useCallback((imageData: ImageData) => {
    setHistory([imageData]);
    setHistoryIndex(0);
  }, []);

  return {
    history,
    historyIndex,
    addToHistory,
    undo,
    redo,
    eraseAll,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    initializeHistory,
  };
}

