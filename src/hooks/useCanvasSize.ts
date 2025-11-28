import { useState, useEffect } from 'react';
import { CANVAS_SIZE } from '@/types/spinart';

interface UseCanvasSizeReturn {
  displaySize: number;
  isTablet: boolean;
  isPortrait: boolean;
}

export function useCanvasSize(): UseCanvasSizeReturn {
  const [displaySize, setDisplaySize] = useState(CANVAS_SIZE);
  const [isTablet, setIsTablet] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const calculateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Detect tablet (iPad: 768-1366px typically)
      const tablet = width >= 768 && width <= 1366;
      const portrait = height > width;
      
      setIsTablet(tablet);
      setIsPortrait(portrait);
      
      // Layout dimensions
      const headerHeight = 56;
      const footerHeight = 40;
      const padding = 32;
      
      // For tablets, toolbar is at bottom or smaller
      // For desktop, toolbar is on the right (288px)
      const toolbarWidth = tablet ? 0 : 288;
      
      const availableWidth = width - toolbarWidth - padding;
      const availableHeight = height - headerHeight - footerHeight - padding;
      
      // For tablets in portrait, reserve space for bottom toolbar
      const adjustedHeight = tablet && portrait 
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

  return { displaySize, isTablet, isPortrait };
}
