declare module 'gifenc' {
  export function GIFEncoder(): GIFEncoderInstance;
  
  export function quantize(
    rgba: Uint8ClampedArray,
    maxColors: number,
    options?: { format?: string; oneBitAlpha?: boolean | number }
  ): number[][];
  
  export function applyPalette(
    rgba: Uint8ClampedArray,
    palette: number[][],
    format?: string
  ): Uint8Array;
  
  interface GIFEncoderInstance {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      options?: {
        palette?: number[][];
        delay?: number;
        dispose?: number;
        transparent?: boolean;
        transparentIndex?: number;
      }
    ): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
  }
}

