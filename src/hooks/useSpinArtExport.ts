import { useState, useCallback, MutableRefObject } from 'react';
import { ArrayBufferTarget, Muxer } from 'mp4-muxer';
import { CANVAS_SIZE } from '@/types/spinart';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

export type ExportFormat = 'gif' | 'mp4';

const FPS = 15;
const GIF_SIZE = 480;
const FRAME_DELAY = Math.round(1000 / FPS);
const FRAME_DURATION_US = Math.round(1_000_000 / FPS);
const BASE_SPEED = 0.02;
const MAX_PLAYBACK_SPEED = 50;

type ExportSegment = {
  durationSeconds: number;
  speed: number;
};

const GIF_SEGMENTS: ExportSegment[] = [
  { durationSeconds: 5, speed: 9.1 },
];

const MP4_SEGMENTS: ExportSegment[] = [
  { durationSeconds: 5, speed: 9.1 },
  { durationSeconds: 5, speed: 20 },
  { durationSeconds: 5, speed: MAX_PLAYBACK_SPEED },
];

function drawFrame(
  ctx: CanvasRenderingContext2D,
  sourceCanvas: HTMLCanvasElement,
  currentRot: number,
) {
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(0, 0, GIF_SIZE, GIF_SIZE);

  ctx.save();
  ctx.translate(GIF_SIZE / 2, GIF_SIZE / 2);
  ctx.rotate(currentRot);

  const scale = (GIF_SIZE / CANVAS_SIZE) * 0.95;
  ctx.scale(scale, scale);
  ctx.translate(-CANVAS_SIZE / 2, -CANVAS_SIZE / 2);
  ctx.drawImage(sourceCanvas, 0, 0);
  ctx.restore();
}

async function exportAsGif(
  sourceCanvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  rotationDirection: number,
  segments: ExportSegment[],
) {
  const gif = GIFEncoder();
  let currentRot = 0;

  for (const segment of segments) {
    const framesInSegment = Math.round(segment.durationSeconds * FPS);
    const rotationStep = Math.max(BASE_SPEED * segment.speed, BASE_SPEED);

    for (let i = 0; i < framesInSegment; i++) {
      drawFrame(ctx, sourceCanvas, currentRot);

      const imageData = ctx.getImageData(0, 0, GIF_SIZE, GIF_SIZE);
      const palette = quantize(imageData.data, 256);
      const index = applyPalette(imageData.data, palette);

      gif.writeFrame(index, GIF_SIZE, GIF_SIZE, {
        palette,
        delay: FRAME_DELAY
      });

      currentRot += rotationStep * rotationDirection;
      if (i % 10 === 0) {
        await new Promise(r => setTimeout(r, 0));
      }
    }
  }

  gif.finish();
  const bytes = gif.bytes();
  const blob = new Blob([new Uint8Array(bytes)], { type: 'image/gif' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'spin-art-export.gif';
  a.click();
  URL.revokeObjectURL(url);
}

async function exportAsMp4(
  sourceCanvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  exportCanvas: HTMLCanvasElement,
  rotationDirection: number,
  segments: ExportSegment[],
) {
  if (typeof VideoEncoder === 'undefined') {
    throw new Error('Video export is not supported in this browser.');
  }

  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    fastStart: 'in-memory',
    video: {
      codec: 'avc',
      width: GIF_SIZE,
      height: GIF_SIZE,
      frameRate: FPS,
    },
  });

  const encoder = new VideoEncoder({
    output: (chunk, metadata) => muxer.addVideoChunk(chunk, metadata),
    error: (error) => console.error('MP4 encoding error', error),
  });

  encoder.configure({
    codec: 'avc1.4d401e',
    width: GIF_SIZE,
    height: GIF_SIZE,
    framerate: FPS,
    bitrate: 3_000_000,
  });

  let currentRot = 0;
  let frameIndex = 0;

  for (const segment of segments) {
    const framesInSegment = Math.round(segment.durationSeconds * FPS);
    const rotationStep = Math.max(BASE_SPEED * segment.speed, BASE_SPEED);

    for (let i = 0; i < framesInSegment; i++) {
      drawFrame(ctx, sourceCanvas, currentRot);

      const frame = new VideoFrame(exportCanvas, {
        timestamp: frameIndex * FRAME_DURATION_US,
        duration: FRAME_DURATION_US,
      });
      encoder.encode(frame);
      frame.close();

      currentRot += rotationStep * rotationDirection;
      frameIndex += 1;

      if (frameIndex % 10 === 0) {
        await new Promise(r => setTimeout(r, 0));
      }
    }
  }

  await encoder.flush();
  muxer.finalize();

  const buffer = target.buffer instanceof Uint8Array ? target.buffer : new Uint8Array(target.buffer);
  const blob = new Blob([buffer], { type: 'video/mp4' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'spin-art-export.mp4';
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportCanvasAnimation(
  sourceCanvas: HTMLCanvasElement,
  playbackSpeed: number,
  direction: number,
  format: ExportFormat = 'gif',
) {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = GIF_SIZE;
  exportCanvas.height = GIF_SIZE;
  const ctx = exportCanvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Unable to prepare export canvas.');
  }

  const segments = format === 'mp4' ? MP4_SEGMENTS : GIF_SEGMENTS;
  const rotationDirection = direction >= 0 ? 1 : -1;

  if (format === 'mp4') {
    await exportAsMp4(sourceCanvas, ctx, exportCanvas, rotationDirection, segments);
    return;
  }

  await exportAsGif(sourceCanvas, ctx, rotationDirection, segments);
}

interface UseSpinArtExportReturn {
  isExporting: boolean;
  handleExportVideo: (format?: ExportFormat) => Promise<void>;
}

export function useSpinArtExport(
  paperCanvasRef: MutableRefObject<HTMLCanvasElement | null>,
  playbackSpeed: number,
  direction: number
): UseSpinArtExportReturn {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportVideo = useCallback(async (format: ExportFormat = 'gif') => {
    if (!paperCanvasRef.current) return;
    setIsExporting(true);

    try {
      await exportCanvasAnimation(paperCanvasRef.current, playbackSpeed, direction, format);
    } catch (error) {
      console.error('Export failed:', error);
    }

    setIsExporting(false);
  }, [paperCanvasRef, playbackSpeed, direction]);

  return {
    isExporting,
    handleExportVideo,
  };
}
