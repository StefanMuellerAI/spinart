// Configuration constants
export const CANVAS_SIZE = 600;
export const DISC_RADIUS = 250;

// Shape types for drawing tool tips
export type TipShape = 'round' | 'flat' | 'calligraphy' | 'marker' | 'spray';

// Shape types for stamp tool
export type StampShape = 'rectangle' | 'ellipse' | 'triangle' | 'line' | 'arrow' | 'star';

// Tab types
export type ToolTab = 'pen' | 'shape';

export interface TipConfig {
  id: TipShape;
  name: string;
}

export interface StampConfig {
  id: StampShape;
  name: string;
}

export interface PenSettings {
  size: number;
  tip: TipShape;
  blur: number;
  opacity: number;
  isEraser: boolean;
}

export interface ShapeSettings {
  color: string;
  sizeX: number;
  sizeY: number;
  type: StampShape;
  angle: number;
  strokeOnly: boolean;
}

export interface Point {
  x: number;
  y: number;
}

// Pointer state for Apple Pencil / Stylus support
export type PointerType = 'mouse' | 'touch' | 'pen';

export interface PointerState {
  pressure: number;      // 0.0 - 1.0 (Apple Pencil pressure)
  tiltX: number;         // -90 to 90 degrees
  tiltY: number;         // -90 to 90 degrees
  pointerType: PointerType;
}

// Extended point with pressure data
export interface PointerPoint extends Point {
  pressure: number;
}

// Translation function type
export type TranslateFn = (key: string) => string;

// Getter functions for localized pen tips and stamp shapes
export const getPenTips = (t: TranslateFn): TipConfig[] => [
  { id: 'round', name: t('round') },
  { id: 'flat', name: t('flat') },
  { id: 'calligraphy', name: t('calligraphy') },
  { id: 'marker', name: t('marker') },
  { id: 'spray', name: t('spray') },
];

export const getStampShapes = (t: TranslateFn): StampConfig[] => [
  { id: 'rectangle', name: t('rectangle') },
  { id: 'ellipse', name: t('ellipse') },
  { id: 'triangle', name: t('triangle') },
  { id: 'line', name: t('line') },
  { id: 'arrow', name: t('arrow') },
  { id: 'star', name: t('star') },
];

