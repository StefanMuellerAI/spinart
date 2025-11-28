import { useState, useCallback, MutableRefObject } from 'react';
import { CANVAS_SIZE } from '@/types/spinart';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

interface UseSpinArtExportReturn {
  isExporting: boolean;
  handleExportVideo: () => Promise<void>;
}

export function useSpinArtExport(
  paperCanvasRef: MutableRefObject<HTMLCanvasElement | null>,
  playbackSpeed: number,
  direction: number
): UseSpinArtExportReturn {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportVideo = useCallback(async () => {
    if (!paperCanvasRef.current) return;
    setIsExporting(true);

    // GIF Export Settings
    const DURATION_SECONDS = 10;
    const FPS = 15;
    const TOTAL_FRAMES = DURATION_SECONDS * FPS; // 150 frames
    const GIF_SIZE = 480;
    const FRAME_DELAY = Math.round(1000 / FPS); // ~67ms per frame

    // Calculate rotation speed for 10 seconds
    const baseSpeed = 0.02;
    const userSpeed = playbackSpeed * baseSpeed * direction;
    const SPEED = Math.abs(userSpeed) || 0.02;
    const rotationDirection = userSpeed >= 0 ? 1 : -1;
    
    // Create export canvas at GIF-friendly size
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = GIF_SIZE;
    exportCanvas.height = GIF_SIZE;
    const ctx = exportCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) {
      setIsExporting(false);
      return;
    }

    const drawFrameToCanvas = (currentRot: number) => {
      // Dark background
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, GIF_SIZE, GIF_SIZE);
      
      ctx.save();
      ctx.translate(GIF_SIZE / 2, GIF_SIZE / 2);
      ctx.rotate(currentRot);
      
      // Scale to fit the canvas nicely
      const scale = (GIF_SIZE / CANVAS_SIZE) * 0.95;
      ctx.scale(scale, scale);
      ctx.translate(-CANVAS_SIZE / 2, -CANVAS_SIZE / 2);
      
      if (paperCanvasRef.current) {
        ctx.drawImage(paperCanvasRef.current, 0, 0);
      }
      ctx.restore();
    };

    try {
      // Initialize GIF encoder
      const gif = GIFEncoder();
      
      let currentRot = 0;
      
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        // Draw the frame
        drawFrameToCanvas(currentRot);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, GIF_SIZE, GIF_SIZE);
        
        // Quantize to 256 colors (GIF limit)
        const palette = quantize(imageData.data, 256);
        
        // Apply palette to get indexed pixels
        const index = applyPalette(imageData.data, palette);
        
        // Write frame to GIF
        gif.writeFrame(index, GIF_SIZE, GIF_SIZE, { 
          palette, 
          delay: FRAME_DELAY 
        });
        
        // Update rotation for next frame
        currentRot += SPEED * rotationDirection;
        
        // Yield to UI every 10 frames to prevent freezing
        if (i % 10 === 0) {
          await new Promise(r => setTimeout(r, 0));
        }
      }
      
      // Finalize GIF
      gif.finish();
      
      // Create download
      const blob = new Blob([gif.bytes()], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'spin-art-export.gif';
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (e) {
      console.error("GIF export failed:", e);
    }
    
    setIsExporting(false);
  }, [paperCanvasRef, playbackSpeed, direction]);

  return {
    isExporting,
    handleExportVideo,
  };
}
