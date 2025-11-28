'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MoveHorizontal, MoveVertical, RotateCcw, Square } from 'lucide-react';
import { StampShape, getStampShapes } from '@/types/spinart';
import { ShapeState } from '@/hooks/useSpinArtDrawing';

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

interface ShapeControlsProps {
  shapeState: ShapeState;
  setShapeColor: (color: string) => void;
  setShapeSizeX: (size: number) => void;
  setShapeSizeY: (size: number) => void;
  setShapeAngle: (angle: number) => void;
  setShapeType: (type: StampShape) => void;
  setStrokeOnly: (value: boolean) => void;
}

export function ShapeControls({
  shapeState,
  setShapeColor,
  setShapeSizeX,
  setShapeSizeY,
  setShapeAngle,
  setShapeType,
  setStrokeOnly,
}: ShapeControlsProps) {
  const t = useTranslations();
  const stampShapes = getStampShapes(t);

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

      {/* Shape Type */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs text-muted-foreground">{t('shapes')}</Label>
        <Select value={shapeState.type} onValueChange={(value) => setShapeType(value as StampShape)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {stampShapes.map((shape) => (
              <SelectItem key={shape.id} value={shape.id}>
                {shape.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Stroke Only Toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor="stroke-switch" className="text-xs cursor-pointer flex items-center gap-1.5">
          <Square className="size-3.5" />
          {t('outline_only')}
        </Label>
        <Switch
          id="stroke-switch"
          checked={shapeState.strokeOnly}
          onCheckedChange={setStrokeOnly}
        />
      </div>
    </>
  );
}
