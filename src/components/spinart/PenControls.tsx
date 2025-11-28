'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Pencil, Eraser, Atom, Minus, Info } from 'lucide-react';
import { TipShape, getPenTips } from '@/types/spinart';
import { PenState } from '@/hooks/useSpinArtDrawing';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

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
}

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
}: PenControlsProps) {
  const t = useTranslations();
  const penTips = getPenTips(t);

  return (
    <>
      {/* Pen Color */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs text-muted-foreground">{t('color')}</Label>
        <input
          type="color"
          value={penState.color}
          onChange={(e) => setPenColor(e.target.value)}
          className="w-full h-9 rounded-md cursor-pointer border border-input bg-transparent"
        />
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

      {/* Pen Tip */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs text-muted-foreground">{t('tip')}</Label>
        <Select value={penState.tip} onValueChange={(value) => setPenTip(value as TipShape)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {penTips.map((tip) => (
              <SelectItem key={tip.id} value={tip.id}>
                {tip.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
