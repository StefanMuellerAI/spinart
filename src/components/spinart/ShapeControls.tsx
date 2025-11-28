'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { 
  MoveHorizontal, 
  MoveVertical, 
  RotateCcw, 
  Square, 
  Info,
  RectangleHorizontal,
  Circle,
  Triangle,
  Minus,
  ArrowRight,
  Star,
  Snowflake
} from 'lucide-react';
import { StampShape } from '@/types/spinart';
import { ShapeState } from '@/hooks/useSpinArtDrawing';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ShapeControlsProps {
  shapeState: ShapeState;
  setShapeColor: (color: string) => void;
  setShapeSizeX: (size: number) => void;
  setShapeSizeY: (size: number) => void;
  setShapeAngle: (angle: number) => void;
  setShapeType: (type: StampShape) => void;
  setStrokeOnly: (value: boolean) => void;
  // Symmetry (shared with pen)
  symmetryEnabled: boolean;
  symmetryCount: number;
  toggleSymmetry: () => void;
  setSymmetryCount: (count: number) => void;
}

// Symmetry count options
const symmetryCounts = [2, 4, 6, 8];

// Shape configuration with icons
const shapeConfigs: { id: StampShape; icon: React.ReactNode; labelKey: string }[] = [
  { id: 'rectangle', icon: <RectangleHorizontal className="size-4" />, labelKey: 'rectangle' },
  { id: 'ellipse', icon: <Circle className="size-4" />, labelKey: 'ellipse' },
  { id: 'triangle', icon: <Triangle className="size-4" />, labelKey: 'triangle' },
  { id: 'star', icon: <Star className="size-4" />, labelKey: 'star' },
  { id: 'line', icon: <Minus className="size-4" />, labelKey: 'line' },
  { id: 'arrow', icon: <ArrowRight className="size-4" />, labelKey: 'arrow' },
];

export function ShapeControls({
  shapeState,
  setShapeColor,
  setShapeSizeX,
  setShapeSizeY,
  setShapeAngle,
  setShapeType,
  setStrokeOnly,
  symmetryEnabled,
  symmetryCount,
  toggleSymmetry,
  setSymmetryCount,
}: ShapeControlsProps) {
  const t = useTranslations();

  return (
    <>
      {/* Shape Color */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs text-muted-foreground">{t('color')}</Label>
        <input
          type="color"
          value={shapeState.color}
          onChange={(e) => setShapeColor(e.target.value)}
          className="w-full h-9 rounded-md cursor-pointer border border-input bg-transparent"
        />
      </div>

      {/* Shape Type Selection - Grid with icons */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs text-muted-foreground">{t('shapes')}</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {shapeConfigs.map((shape) => (
            <Tooltip key={shape.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShapeType(shape.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 p-2 rounded-md border transition-all",
                    "hover:bg-accent hover:border-accent-foreground/20",
                    shapeState.type === shape.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-input"
                  )}
                >
                  {shape.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">{t(shape.labelKey)}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Shape Size X (Width) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MoveHorizontal className="size-3.5" />
            {t('width')}
          </Label>
          <span className="text-xs font-medium">{shapeState.sizeX}</span>
        </div>
        <Slider
          value={[shapeState.sizeX]}
          onValueChange={([value]) => setShapeSizeX(value)}
          min={1}
          max={500}
          step={1}
        />
      </div>

      {/* Shape Size Y (Height) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MoveVertical className="size-3.5" />
            {t('height')}
          </Label>
          <span className="text-xs font-medium">{shapeState.sizeY}</span>
        </div>
        <Slider
          value={[shapeState.sizeY]}
          onValueChange={([value]) => setShapeSizeY(value)}
          min={1}
          max={500}
          step={1}
        />
      </div>

      {/* Shape Angle */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <RotateCcw className="size-3.5" />
            {t('angle')}
          </Label>
          <span className="text-xs font-medium">{shapeState.angle}°</span>
        </div>
        <Slider
          value={[shapeState.angle]}
          onValueChange={([value]) => setShapeAngle(value)}
          min={0}
          max={360}
          step={1}
        />
      </div>

      <Separator />

      {/* Stroke Only Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Square className="size-3.5" />
          <Label htmlFor="stroke-switch" className="text-xs cursor-pointer">
            {t('outline_only')}
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="size-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px]">
              <p className="text-xs">{t('tooltip_outline')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Switch
          id="stroke-switch"
          checked={shapeState.strokeOnly}
          onCheckedChange={setStrokeOnly}
        />
      </div>

      {/* Symmetry Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Snowflake className="size-3.5" />
          <Label htmlFor="shape-symmetry-switch" className="text-xs cursor-pointer">
            {t('symmetry')}
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="size-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px]">
              <p className="text-xs">{t('tooltip_symmetry')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Switch
          id="shape-symmetry-switch"
          checked={symmetryEnabled}
          onCheckedChange={toggleSymmetry}
        />
      </div>

      {/* Symmetry Count Selection (shown only when symmetry is enabled) */}
      {symmetryEnabled && (
        <div className="flex flex-col gap-2">
          <Label className="text-xs text-muted-foreground">{t('symmetry_count')}</Label>
          <div className="grid grid-cols-4 gap-1.5">
            {symmetryCounts.map((count) => (
              <button
                key={count}
                onClick={() => setSymmetryCount(count)}
                className={cn(
                  "flex items-center justify-center p-2 rounded-md border text-xs font-medium transition-all",
                  "hover:bg-accent hover:border-accent-foreground/20",
                  symmetryCount === count
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-input"
                )}
              >
                {count}x
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
