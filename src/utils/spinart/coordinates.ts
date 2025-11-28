import { Point } from '@/types/spinart';

/**
 * Transforms screen coordinates to paper coordinates accounting for canvas rotation
 */
export function getPaperCoordinates(
  screenX: number,
  screenY: number,
  currentRotation: number,
  canvas: HTMLCanvasElement
): Point {
  const rect = canvas.getBoundingClientRect();
  
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  const dx = (screenX - rect.left) * scaleX - cx;
  const dy = (screenY - rect.top) * scaleY - cy;

  const angle = -currentRotation;
  const rx = dx * Math.cos(angle) - dy * Math.sin(angle);
  const ry = dx * Math.sin(angle) + dy * Math.cos(angle);

  return { x: rx + cx, y: ry + cy };
}

/**
 * Converts screen coordinates to canvas coordinates (without rotation compensation)
 */
export function getCanvasCoordinates(
  screenX: number,
  screenY: number,
  canvas: HTMLCanvasElement
): Point {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  return {
    x: (screenX - rect.left) * scaleX,
    y: (screenY - rect.top) * scaleY
  };
}

/**
 * Calculates the angle from canvas center to a screen point
 */
export function getAngleFromCenter(
  screenX: number,
  screenY: number,
  canvas: HTMLCanvasElement
): number {
  const rect = canvas.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return Math.atan2(screenY - cy, screenX - cx);
}

/**
 * Calculates distance between two points
 */
export function getDistance(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

