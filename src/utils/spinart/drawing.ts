import { TipShape, StampShape, DISC_RADIUS, CANVAS_SIZE } from '@/types/spinart';

/**
 * Draws a pen tip shape at the specified position
 */
export function drawPenTip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  tip: TipShape,
  color: string,
  compensateRotation: number = 0,
  shadowBlur: number = 0,
  isEraser: boolean = false,
  opacity: number = 100
): void {
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  ctx.globalAlpha = isEraser ? 1 : opacity / 100;
  ctx.translate(x, y);
  ctx.rotate(-compensateRotation);
  
  if (isEraser) {
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = color;
    ctx.shadowBlur = shadowBlur;
    ctx.shadowColor = color;
  }

  ctx.beginPath();
  
  switch (tip) {
    case 'round':
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      break;
    case 'flat':
      ctx.rect(-size / 2, -size / 6, size, size / 3);
      break;
    case 'calligraphy':
      ctx.ellipse(0, 0, size / 2, size / 6, Math.PI / 4, 0, Math.PI * 2);
      break;
    case 'marker':
      ctx.roundRect(-size / 2, -size / 2, size, size, size / 4);
      break;
    case 'spray':
      // Spray creates multiple random dots
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * size / 2;
        const dotX = Math.cos(angle) * radius;
        const dotY = Math.sin(angle) * radius;
        ctx.moveTo(dotX + 1.5, dotY);
        ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2);
      }
      break;
  }
  
  ctx.fill();
  ctx.restore();
}

/**
 * Draws a stamp shape at the specified position
 */
export function drawStampShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  sizeX: number,
  sizeY: number,
  type: StampShape,
  color: string,
  angle: number,
  strokeOnly: boolean,
  compensateRotation: number = 0
): void {
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  ctx.translate(x, y);
  const totalRotation = (angle * Math.PI / 180) - compensateRotation;
  ctx.rotate(totalRotation);
  
  ctx.beginPath();
  
  switch (type) {
    case 'rectangle':
      ctx.rect(-sizeX / 2, -sizeY / 2, sizeX, sizeY);
      break;
    case 'ellipse':
      ctx.ellipse(0, 0, sizeX / 2, sizeY / 2, 0, 0, Math.PI * 2);
      break;
    case 'triangle':
      ctx.moveTo(0, -sizeY / 2);
      ctx.lineTo(sizeX / 2, sizeY / 2);
      ctx.lineTo(-sizeX / 2, sizeY / 2);
      ctx.closePath();
      break;
    case 'line':
      ctx.moveTo(-sizeX / 2, 0);
      ctx.lineTo(sizeX / 2, 0);
      break;
    case 'arrow':
      ctx.moveTo(-sizeX / 2, 0);
      ctx.lineTo(sizeX / 4, 0);
      ctx.lineTo(sizeX / 4, -sizeY / 4);
      ctx.lineTo(sizeX / 2, 0);
      ctx.lineTo(sizeX / 4, sizeY / 4);
      ctx.lineTo(sizeX / 4, 0);
      break;
    case 'star':
      const spikes = 5;
      const outerRadiusX = sizeX / 2;
      const outerRadiusY = sizeY / 2;
      const innerRadiusX = sizeX / 4;
      const innerRadiusY = sizeY / 4;
      let rot = Math.PI / 2 * 3;
      const step = Math.PI / spikes;
      ctx.moveTo(0, -outerRadiusY);
      for (let i = 0; i < spikes; i++) {
        let sx = Math.cos(rot) * outerRadiusX;
        let sy = Math.sin(rot) * outerRadiusY;
        ctx.lineTo(sx, sy);
        rot += step;
        sx = Math.cos(rot) * innerRadiusX;
        sy = Math.sin(rot) * innerRadiusY;
        ctx.lineTo(sx, sy);
        rot += step;
      }
      ctx.lineTo(0, -outerRadiusY);
      ctx.closePath();
      break;
  }
  
  const avgSize = (sizeX + sizeY) / 2;
  if (type === 'line' || type === 'arrow') {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, avgSize / 20);
    ctx.stroke();
  } else if (strokeOnly) {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, avgSize / 20);
    ctx.stroke();
  } else {
    ctx.fillStyle = color;
    ctx.fill();
  }
  
  ctx.restore();
}

/**
 * Draws the ghost shape preview for stamp mode
 */
export function drawGhostShape(
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  sizeX: number,
  sizeY: number,
  type: StampShape,
  color: string,
  angle: number,
  strokeOnly: boolean
): void {
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.translate(gx, gy);
  ctx.rotate(angle * Math.PI / 180);
  
  ctx.beginPath();
  switch (type) {
    case 'rectangle':
      ctx.rect(-sizeX / 2, -sizeY / 2, sizeX, sizeY);
      break;
    case 'ellipse':
      ctx.ellipse(0, 0, sizeX / 2, sizeY / 2, 0, 0, Math.PI * 2);
      break;
    case 'triangle':
      ctx.moveTo(0, -sizeY / 2);
      ctx.lineTo(sizeX / 2, sizeY / 2);
      ctx.lineTo(-sizeX / 2, sizeY / 2);
      ctx.closePath();
      break;
    case 'line':
      ctx.moveTo(-sizeX / 2, 0);
      ctx.lineTo(sizeX / 2, 0);
      break;
    case 'arrow':
      ctx.moveTo(-sizeX / 2, 0);
      ctx.lineTo(sizeX / 4, 0);
      ctx.lineTo(sizeX / 4, -sizeY / 4);
      ctx.lineTo(sizeX / 2, 0);
      ctx.lineTo(sizeX / 4, sizeY / 4);
      ctx.lineTo(sizeX / 4, 0);
      break;
    case 'star':
      const spikes = 5;
      const outerRadiusX = sizeX / 2;
      const outerRadiusY = sizeY / 2;
      const innerRadiusX = sizeX / 4;
      const innerRadiusY = sizeY / 4;
      let rot = Math.PI / 2 * 3;
      const step = Math.PI / spikes;
      ctx.moveTo(0, -outerRadiusY);
      for (let i = 0; i < spikes; i++) {
        let sx = Math.cos(rot) * outerRadiusX;
        let sy = Math.sin(rot) * outerRadiusY;
        ctx.lineTo(sx, sy);
        rot += step;
        sx = Math.cos(rot) * innerRadiusX;
        sy = Math.sin(rot) * innerRadiusY;
        ctx.lineTo(sx, sy);
        rot += step;
      }
      ctx.lineTo(0, -outerRadiusY);
      ctx.closePath();
      break;
  }
  
  const avgSize = (sizeX + sizeY) / 2;
  if (type === 'line' || type === 'arrow' || strokeOnly) {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, avgSize / 20);
    ctx.stroke();
  } else {
    ctx.fillStyle = color;
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draws the outer ring with degree ticks
 */
export function drawOuterRing(ctx: CanvasRenderingContext2D): void {
  // Draw outer ring (scale area) with distinct background
  ctx.save();
  ctx.beginPath();
  ctx.arc(300, 300, 300, 0, Math.PI * 2); // Outer edge
  ctx.arc(300, 300, DISC_RADIUS, 0, Math.PI * 2, true); // Inner edge (drawing area)
  ctx.fillStyle = '#374151'; // Dark gray ring
  ctx.fill();
  ctx.restore();

  // Draw Degree Ticks
  ctx.save();
  ctx.strokeStyle = '#9ca3af';
  for (let i = 0; i < 360; i++) {
    const angle = (i * Math.PI) / 180;
    const isCardinal = i % 90 === 0;
    const isMajor = i % 10 === 0;
    const outerR = 295;
    const innerR = isCardinal ? 260 : (isMajor ? 270 : 280);
    if (i > 355 || i < 5) continue;
    const x1 = 300 + Math.cos(angle) * innerR;
    const y1 = 300 + Math.sin(angle) * innerR;
    const x2 = 300 + Math.cos(angle) * outerR;
    const y2 = 300 + Math.sin(angle) * outerR;
    ctx.beginPath();
    ctx.lineWidth = isCardinal ? 2 : (isMajor ? 1.5 : 0.5);
    ctx.globalAlpha = isMajor ? 0.9 : 0.5;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();

  // Draw Handle
  ctx.beginPath();
  ctx.arc(300 + 275, 300, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#22c55e';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.stroke();
}

/**
 * Draws the line tool start point indicator
 */
export function drawLineStartIndicator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
): void {
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * Draws the intro overlay
 */
export function drawIntroOverlay(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  t: (key: string) => string
): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(t('intro_title'), canvasWidth / 2, canvasHeight / 2 - 40);
  
  ctx.font = '16px sans-serif';
  const lines = [
    t('intro_l1'),
    t('intro_l2'),
    t('intro_l3'),
    t('intro_l4'),
    t('intro_l5')
  ];
  
  lines.forEach((line, i) => {
    ctx.fillText(line, canvasWidth / 2, canvasHeight / 2 + 10 + (i * 25));
  });
  
  ctx.font = 'italic 14px sans-serif';
  ctx.fillStyle = '#cccccc';
  ctx.fillText(t('click_to_start'), canvasWidth / 2, canvasHeight / 2 + 150);
}

/**
 * Initializes the paper canvas with a white disc
 */
export function initializePaperCanvas(canvas: HTMLCanvasElement): ImageData | null {
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, DISC_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    return ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }
  return null;
}

/**
 * Clears the paper canvas to white disc
 */
export function clearPaperCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, DISC_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

