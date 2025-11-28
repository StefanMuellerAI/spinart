import { useCallback, useEffect, useRef, MutableRefObject } from 'react';
import { CANVAS_SIZE, DISC_RADIUS, ToolTab, Point, PenSettings, ShapeSettings } from '@/types/spinart';
import { 
  drawPenTip, 
  drawGhostShape, 
  drawOuterRing, 
  drawLineStartIndicator, 
  drawIntroOverlay 
} from '@/utils/spinart/drawing';
import { getPaperCoordinates } from '@/utils/spinart/coordinates';

interface AnimationRefs {
  isDrawingRef: MutableRefObject<boolean>;
  currentMouseScreenPosRef: MutableRefObject<Point | null>;
  prevMouseScreenPosRef: MutableRefObject<Point | null>;
  prevRotationRef: MutableRefObject<number>;
  lineStartPaperPosRef: MutableRefObject<Point | null>;
  penColorRef: MutableRefObject<string>;
  penSettingsRef: MutableRefObject<PenSettings>;
  shapeSettingsRef: MutableRefObject<ShapeSettings>;
  physicsEnabledRef: MutableRefObject<boolean>;
  isPlayingRef: MutableRefObject<boolean>;
  playbackSpeedRef: MutableRefObject<number>;
  directionRef: MutableRefObject<number>;
  // Apple Pencil / Stylus pressure support
  currentPressureRef: MutableRefObject<number>;
  pressureSensitivityEnabledRef: MutableRefObject<boolean>;
  // Gradient support
  gradientEnabledRef: MutableRefObject<boolean>;
  gradientStartColorRef: MutableRefObject<string>;
  gradientEndColorRef: MutableRefObject<string>;
  gradientProgressRef: MutableRefObject<number>;
}

export interface IntroTexts {
  intro_title: string;
  intro_l1: string;
  intro_l2: string;
  intro_l3: string;
  intro_l4: string;
  intro_l5: string;
  click_to_start: string;
}

interface UseSpinArtAnimationProps {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  paperCanvasRef: MutableRefObject<HTMLCanvasElement | null>;
  refs: AnimationRefs;
  activeTab: ToolTab;
  showIntro: boolean;
  introTexts: IntroTexts;
}

interface UseSpinArtAnimationReturn {
  rotationRef: MutableRefObject<number>;
  getPaperCoordinatesForCanvas: (screenX: number, screenY: number, currentRotation: number) => Point;
}

/**
 * Interpolates between two hex colors
 * @param color1 Start color (hex, e.g. "#FF0000")
 * @param color2 End color (hex, e.g. "#0000FF")
 * @param factor Interpolation factor (0-1)
 * @returns Interpolated color as hex string
 */
function interpolateColor(color1: string, color2: string, factor: number): string {
  // Parse hex colors to RGB
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);
  
  // Interpolate
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function useSpinArtAnimation({
  canvasRef,
  paperCanvasRef,
  refs,
  activeTab,
  showIntro,
  introTexts,
}: UseSpinArtAnimationProps): UseSpinArtAnimationReturn {
  const rotationRef = useRef(0);
  const animationFrameRef = useRef<number>(0);

  const getPaperCoordinatesForCanvas = useCallback((screenX: number, screenY: number, currentRotation: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    return getPaperCoordinates(screenX, screenY, currentRotation, canvas);
  }, [canvasRef]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const paper = paperCanvasRef.current;
    if (!canvas || !paper) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prevRotation = rotationRef.current;
    
    // Calculate speed based on playback
    const baseSpeed = 0.02;
    const currentSpeed = refs.isPlayingRef.current 
      ? baseSpeed * refs.playbackSpeedRef.current * refs.directionRef.current 
      : 0;
    
    rotationRef.current += currentSpeed;
    const currentRotation = rotationRef.current;

    // Drawing Logic
    if (refs.isDrawingRef.current && refs.currentMouseScreenPosRef.current && activeTab === 'pen') {
      const paperCtx = paper.getContext('2d');
      if (paperCtx) {
        const settings = refs.penSettingsRef.current;
        const currentMousePos = refs.currentMouseScreenPosRef.current;
        const prevMousePos = refs.prevMouseScreenPosRef.current || currentMousePos;
        
        // Get current pressure for Apple Pencil support
        const pressure = refs.currentPressureRef.current;
        const pressureEnabled = refs.pressureSensitivityEnabledRef.current;
        
        // Calculate actual size based on pressure (if enabled)
        // Formula: size varies from 30% to 100% of base size based on pressure
        const actualSize = pressureEnabled 
          ? settings.size * (0.3 + pressure * 0.7)
          : settings.size;
        
        // Determine current color (gradient or solid)
        let currentColor = refs.penColorRef.current;
        if (refs.gradientEnabledRef.current && !settings.isEraser) {
          currentColor = interpolateColor(
            refs.gradientStartColorRef.current,
            refs.gradientEndColorRef.current,
            refs.gradientProgressRef.current
          );
          // Increase gradient progress (0.005 per frame = ~3 seconds for full gradient)
          refs.gradientProgressRef.current = Math.min(1, refs.gradientProgressRef.current + 0.005);
        }
        
        const dist = Math.hypot(currentMousePos.x - prevMousePos.x, currentMousePos.y - prevMousePos.y);
        const stepSize = Math.max(1, actualSize / 4);
        const distSteps = Math.ceil(dist / stepSize);
        const rotSteps = Math.max(1, Math.ceil(Math.abs(currentSpeed) / 0.02));
        const steps = Math.max(distSteps, rotSteps);

        // Physics simulation - centrifugal force pushes paint OUTWARD
        const isPhysicsMode = refs.physicsEnabledRef.current;
        const normalizedSpeed = Math.min(refs.playbackSpeedRef.current / 50, 1);
        const smearLength = isPhysicsMode ? normalizedSpeed * 80 : 0;
        const smearSteps = isPhysicsMode && smearLength > 2 ? Math.ceil(smearLength / 2) : 0;

        for (let i = 1; i <= steps; i++) {
          const ti = i / steps;
          const interpRotation = prevRotation + (currentRotation - prevRotation) * ti;
          const interpMouseX = prevMousePos.x + (currentMousePos.x - prevMousePos.x) * ti;
          const interpMouseY = prevMousePos.y + (currentMousePos.y - prevMousePos.y) * ti;
          const p = getPaperCoordinatesForCanvas(interpMouseX, interpMouseY, interpRotation);
          
          // Draw main stroke with pressure-adjusted size and gradient color
          drawPenTip(
            paperCtx,
            p.x,
            p.y,
            actualSize,
            settings.tip,
            currentColor,
            interpRotation,
            settings.blur,
            settings.isEraser,
            settings.opacity
          );

          // Physics mode: Centrifugal force - paint flies OUTWARD from center
          if (isPhysicsMode && smearSteps > 0 && !settings.isEraser && refs.isPlayingRef.current) {
            const centerX = CANVAS_SIZE / 2;
            const centerY = CANVAS_SIZE / 2;
            const dx = p.x - centerX;
            const dy = p.y - centerY;
            const currentRadius = Math.sqrt(dx * dx + dy * dy);
            
            if (currentRadius < 10) continue;
            
            const outwardDirX = dx / currentRadius;
            const outwardDirY = dy / currentRadius;

            for (let s = 1; s <= smearSteps; s++) {
              const smearT = s / smearSteps;
              const outwardOffset = smearT * smearLength;
              const smearX = p.x + outwardDirX * outwardOffset;
              const smearY = p.y + outwardDirY * outwardOffset;
              
              const smearRadius = Math.sqrt((smearX - centerX) ** 2 + (smearY - centerY) ** 2);
              if (smearRadius > DISC_RADIUS - 5) continue;
              
              const smearOpacity = 0.7 * (1 - smearT * 0.8);
              const smearSize = actualSize * (1 - smearT * 0.6);

              paperCtx.save();
              paperCtx.globalAlpha = smearOpacity * (settings.opacity / 100);
              drawPenTip(
                paperCtx,
                smearX,
                smearY,
                smearSize,
                settings.tip,
                currentColor,
                interpRotation,
                settings.blur + smearT * 15,
                false,
                100
              );
              paperCtx.restore();
            }
          }
        }
      }
    }

    // Update refs for next frame
    if (refs.isDrawingRef.current) {
      refs.prevMouseScreenPosRef.current = refs.currentMouseScreenPosRef.current;
    } else {
      refs.prevMouseScreenPosRef.current = null;
    }
    refs.prevRotationRef.current = currentRotation;

    // Render to screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotationRef.current);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(paper, 0, 0);

    // Line tool start point indicator
    if (refs.lineStartPaperPosRef.current) {
      drawLineStartIndicator(ctx, refs.lineStartPaperPosRef.current.x, refs.lineStartPaperPosRef.current.y);
    }

    // Draw outer ring with degree ticks
    drawOuterRing(ctx);

    ctx.restore();

    // Ghost Shape for stamp mode
    if (activeTab === 'shape' && refs.currentMouseScreenPosRef.current) {
      const mx = refs.currentMouseScreenPosRef.current.x;
      const my = refs.currentMouseScreenPosRef.current.y;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const gx = (mx - rect.left) * scaleX;
      const gy = (my - rect.top) * scaleY;
      if (gx >= 0 && gx <= CANVAS_SIZE && gy >= 0 && gy <= CANVAS_SIZE) {
        drawGhostShape(
          ctx,
          gx,
          gy,
          refs.shapeSettingsRef.current.sizeX,
          refs.shapeSettingsRef.current.sizeY,
          refs.shapeSettingsRef.current.type,
          refs.shapeSettingsRef.current.color,
          refs.shapeSettingsRef.current.angle,
          refs.shapeSettingsRef.current.strokeOnly
        );
      }
    }

    // Intro Overlay
    if (showIntro) {
      drawIntroOverlay(ctx, canvas.width, canvas.height, introTexts);
    }

    animationFrameRef.current = requestAnimationFrame(render);
  }, [canvasRef, paperCanvasRef, refs, activeTab, showIntro, introTexts, getPaperCoordinatesForCanvas]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [render]);

  return {
    rotationRef,
    getPaperCoordinatesForCanvas,
  };
}
