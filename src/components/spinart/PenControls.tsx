'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { 
  Pencil, 
  Eraser, 
  Atom, 
  Minus, 
  Info,
  Circle,
  GripHorizontal,
  Feather,
  Highlighter,
  Sparkles,
  Palette
} from 'lucide-react';
import { TipShape } from '@/types/spinart';
import { PenState } from '@/hooks/useSpinArtDrawing';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PenControlsProps {
  penState: PenState;
  setPenColor: (color: string) => void;
  setPenSize: (size: number) => void;
  setPenBlur: (blur: number) => void;
  setPenOpacity: (opacity: number) => void;
  setPenTip: (tip: TipShape) => void;
  toggleEraser: () => void;
  togglePhysics: () => void;
  toggleLineTool: () => void;
  togglePressureSensitivity: () => void;
  toggleGradient: () => void;
  setGradientStartColor: (color: string) => void;
  setGradientEndColor: (color: string) => void;
}

// Tip configuration with icons
const tipConfigs: { id: TipShape; icon: React.ReactNode; labelKey: string }[] = [
  { id: 'round', icon: <Circle className="size-4" />, labelKey: 'round' },
  { id: 'flat', icon: <GripHorizontal className="size-4" />, labelKey: 'flat' },
  { id: 'calligraphy', icon: <Feather className="size-4" />, labelKey: 'calligraphy' },
  { id: 'marker', icon: <Highlighter className="size-4" />, labelKey: 'marker' },
  { id: 'spray', icon: <Sparkles className="size-4" />, labelKey: 'spray' },
];

export function PenControls({
  penState,
  setPenColor,
  setPenSize,
  setPenBlur,
  setPenOpacity,
  setPenTip,
  toggleEraser,
  togglePhysics,
  toggleLineTool,
  togglePressureSensitivity,
  toggleGradient,
  setGradientStartColor,
  setGradientEndColor,
}: PenControlsProps) {
  const t = useTranslations();

  return (
    <>
      {/* Color Section */}
      <div className="flex flex-col gap-3">
        {/* Gradient Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Palette className="size-3.5" />
            <Label htmlFor="gradient-switch" className="text-xs cursor-pointer">
              {t('gradient')}
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <p className="text-xs">{t('tooltip_gradient')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Switch
            id="gradient-switch"
            checked={penState.gradientEnabled}
            onCheckedChange={toggleGradient}
          />
        </div>

        {/* Conditional: Solid Color or Gradient Colors */}
        {penState.gradientEnabled ? (
          <>
            {/* Gradient Preview */}
            <div 
              className="h-6 rounded-md border border-input"
              style={{ 
                background: `linear-gradient(to right, ${penState.gradientStartColor}, ${penState.gradientEndColor})` 
              }} 
            />
            
            {/* Two Color Pickers */}
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">{t('gradient_start')}</Label>
                <input
                  type="color"
                  value={penState.gradientStartColor}
                  onChange={(e) => setGradientStartColor(e.target.value)}
                  className="w-full h-8 rounded-md cursor-pointer border border-input bg-transparent"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">{t('gradient_end')}</Label>
                <input
                  type="color"
                  value={penState.gradientEndColor}
                  onChange={(e) => setGradientEndColor(e.target.value)}
                  className="w-full h-8 rounded-md cursor-pointer border border-input bg-transparent"
                />
              </div>
            </div>
          </>
        ) : (
          /* Single Color Picker */
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">{t('color')}</Label>
            <input
              type="color"
              value={penState.color}
              onChange={(e) => setPenColor(e.target.value)}
              className="w-full h-9 rounded-md cursor-pointer border border-input bg-transparent"
            />
          </div>
        )}
      </div>

      {/* Pen Tip Selection - Grid with icons */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs text-muted-foreground">{t('tip')}</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {tipConfigs.map((tip) => (
            <Tooltip key={tip.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setPenTip(tip.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 p-2 rounded-md border transition-all",
                    "hover:bg-accent hover:border-accent-foreground/20",
                    penState.tip === tip.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-input"
                  )}
                >
                  {tip.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">{t(tip.labelKey)}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Pen Size */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">{t('pen_size')}</Label>
          <span className="text-xs font-medium">{penState.size}px</span>
        </div>
        <Slider
          value={[penState.size]}
          onValueChange={([value]) => setPenSize(value)}
          min={1}
          max={64}
          step={1}
        />
      </div>

      {/* Blur */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">{t('blur')}</Label>
          <span className="text-xs font-medium">{penState.blur}px</span>
        </div>
        <Slider
          value={[penState.blur]}
          onValueChange={([value]) => setPenBlur(value)}
          min={0}
          max={40}
          step={1}
        />
      </div>

      {/* Opacity */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">{t('opacity')}</Label>
          <span className="text-xs font-medium">{penState.opacity}%</span>
        </div>
        <Slider
          value={[penState.opacity]}
          onValueChange={([value]) => setPenOpacity(value)}
          min={1}
          max={100}
          step={1}
        />
      </div>

      <Separator />

      {/* Toggles with icons and tooltips */}
      <div className="flex flex-col gap-3">
        {/* Pressure Sensitivity - Apple Pencil */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Pencil className="size-3.5" />
            <Label htmlFor="pressure-switch" className="text-xs cursor-pointer">
              {t('pressure_sensitivity')}
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <p className="text-xs">{t('tooltip_pressure')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Switch
            id="pressure-switch"
            checked={penState.pressureSensitivityEnabled}
            onCheckedChange={togglePressureSensitivity}
          />
        </div>
        
        {/* Eraser */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Eraser className="size-3.5" />
            <Label htmlFor="eraser-switch" className="text-xs cursor-pointer">
              {t('eraser')}
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <p className="text-xs">{t('tooltip_eraser')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Switch
            id="eraser-switch"
            checked={penState.isEraser}
            onCheckedChange={toggleEraser}
          />
        </div>
        
        {/* Physics Pen */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Atom className="size-3.5" />
            <Label htmlFor="physics-switch" className="text-xs cursor-pointer">
              {t('physics_pen')}
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <p className="text-xs">{t('tooltip_physics')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Switch
            id="physics-switch"
            checked={penState.physicsEnabled}
            onCheckedChange={togglePhysics}
          />
        </div>
        
        {/* Line Tool */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Minus className="size-3.5" />
            <Label htmlFor="line-switch" className="text-xs cursor-pointer">
              {t('line_tool')}
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <p className="text-xs">{t('tooltip_line')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Switch
            id="line-switch"
            checked={penState.lineToolEnabled}
            onCheckedChange={toggleLineTool}
          />
        </div>
      </div>
    </>
  );
}
