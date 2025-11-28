import { useState, useEffect } from 'react';
import { CANVAS_SIZE } from '@/types/spinart';

interface UseCanvasSizeReturn {
  displaySize: number;
  isTablet: boolean;
  isPortrait: boolean;
  useBottomToolbar: boolean; // Only true for tablets in portrait mode
}

export function useCanvasSize(): UseCanvasSizeReturn {
  const [displaySize, setDisplaySize] = useState(CANVAS_SIZE);
  const [isTablet, setIsTablet] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [useBottomToolbar, setUseBottomToolbar] = useState(false);

  useEffect(() => {
    const calculateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Detect tablet (iPad: 768-1366px typically)
      // Also check for touch capability
      const tablet = width >= 768 && width <= 1366;
      const portrait = height > width;
      
      // Only use bottom toolbar for tablets in portrait mode
      // In landscape, use sidebar like desktop for better space usage
      const bottomToolbar = tablet && portrait;
      
      setIsTablet(tablet);
      setIsPortrait(portrait);
      setUseBottomToolbar(bottomToolbar);
      
      // Layout dimensions
      const headerHeight = 56;
      const footerHeight = 40;
      const padding = 32;
      
      // Toolbar takes space on right for desktop/landscape, bottom for portrait tablets
      const toolbarWidth = bottomToolbar ? 0 : 288;
      
      const availableWidth = width - toolbarWidth - padding;
      const availableHeight = height - headerHeight - footerHeight - padding;
      
      // For tablets in portrait, reserve space for bottom toolbar
      const adjustedHeight = bottomToolbar 
        ? availableHeight - 200 // Space for bottom toolbar
        : availableHeight;
      
      // Use the smaller dimension to keep it circular
      const maxSize = Math.min(availableWidth, adjustedHeight);
      // Reduce by 10% for better visual balance, minimum 350px for usability
      const newSize = Math.max(350, maxSize * 0.9);
      
      setDisplaySize(newSize);
    };

    calculateSize();
    window.addEventListener('resize', calculateSize);
    // Also listen for orientation changes on mobile
    window.addEventListener('orientationchange', calculateSize);
    
    return () => {
      window.removeEventListener('resize', calculateSize);
      window.removeEventListener('orientationchange', calculateSize);
    };
  }, []);

  return { displaySize, isTablet, isPortrait, useBottomToolbar };
}
