import { useState, useCallback, MutableRefObject } from 'react';
import { CANVAS_SIZE } from '@/types/spinart';

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

    const ROTATIONS = 20;
    const baseSpeed = 0.02;
    const userSpeed = playbackSpeed * baseSpeed * direction;
    const SPEED = Math.abs(userSpeed) || 0.02;
    const FPS = 60;
    const TOTAL_FRAMES = Math.ceil((ROTATIONS * 2 * Math.PI) / SPEED);
    const rotationDirection = userSpeed >= 0 ? 1 : -1;
    
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1920;
    exportCanvas.height = 1080;
    const ctx = exportCanvas.getContext('2d');
    
    if (!ctx) {
      setIsExporting(false);
      return;
    }

    const drawFrameToCanvas = (currentRot: number) => {
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      ctx.save();
      ctx.translate(exportCanvas.width / 2, exportCanvas.height / 2);
      ctx.rotate(currentRot);
      const scale = 1.2;
      ctx.scale(scale, scale);
      ctx.translate(-CANVAS_SIZE / 2, -CANVAS_SIZE / 2);
      if (paperCanvasRef.current) {
        ctx.drawImage(paperCanvasRef.current, 0, 0);
      }
      ctx.restore();
    };

    // Try WebCodecs API first
    if (typeof VideoEncoder !== 'undefined' && typeof VideoFrame !== 'undefined') {
      try {
        const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');
        
        const muxer = new Muxer({
          target: new ArrayBufferTarget(),
          video: {
            codec: 'avc',
            width: exportCanvas.width,
            height: exportCanvas.height
          },
          fastStart: 'in-memory',
          firstTimestampBehavior: 'offset'
        });

        const videoEncoder = new VideoEncoder({
          output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
          error: (e) => console.error(e)
        });

        videoEncoder.configure({
          codec: 'avc1.420033',
          width: exportCanvas.width,
          height: exportCanvas.height,
          bitrate: 12_000_000,
          framerate: FPS
        });

        let currentRot = 0;
        
        for (let i = 0; i < TOTAL_FRAMES; i++) {
          drawFrameToCanvas(currentRot);
          
          const videoFrame = new VideoFrame(exportCanvas, {
            timestamp: i * (1000000 / FPS)
          });
          
          videoEncoder.encode(videoFrame, { keyFrame: i % (FPS * 2) === 0 });
          videoFrame.close();
          
          currentRot += SPEED * rotationDirection;
          
          if (i % 10 === 0) await new Promise(r => setTimeout(r, 0));
        }

        await videoEncoder.flush();
        muxer.finalize();
        
        const { buffer } = muxer.target;
        const blob = new Blob([buffer], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'spin-art-export.mp4';
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
        return;

      } catch (e) {
        console.error("WebCodecs export failed, falling back to MediaRecorder", e);
      }
    }

    // Fallback MediaRecorder
    const stream = exportCanvas.captureStream(FPS);
    let mimeType = 'video/webm';
    if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
      mimeType = 'video/webm;codecs=h264';
    }

    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    const chunks: BlobPart[] = [];
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spin-art-export.${mimeType === 'video/mp4' ? 'mp4' : 'webm'}`;
      a.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
    };

    mediaRecorder.start();

    let frame = 0;
    let currentRot = 0;

    const drawFrame = () => {
      if (frame >= TOTAL_FRAMES) {
        mediaRecorder.stop();
        return;
      }

      drawFrameToCanvas(currentRot);
      currentRot += SPEED * rotationDirection;
      frame++;
      setTimeout(drawFrame, 1000 / FPS);
    };

    drawFrame();
  }, [paperCanvasRef, playbackSpeed, direction]);

  return {
    isExporting,
    handleExportVideo,
  };
}

