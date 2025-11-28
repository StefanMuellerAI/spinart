'use client';

import React from 'react';
import { Undo2, Redo2, Trash2, Video, Paintbrush, Square } from 'lucide-react';
import { ToolTab, TipShape, StampShape } from '@/types/spinart';
import { PenState, ShapeState } from '@/hooks/useSpinArtDrawing';
import { PenControls } from './PenControls';
import { ShapeControls } from './ShapeControls';
import { PlayerControls } from './PlayerControls';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface ToolbarProps {
  t: (key: string) => string;
  
  // Tab state
  activeTab: ToolTab;
  setActiveTab: (tab: ToolTab) => void;
  
  // History actions
  canUndo: boolean;
  canRedo: boolean;
  isExporting: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onEraseAll: () => void;
  onExportVideo: () => void;
  
  // Export restrictions
  isTimeRequirementMet: boolean;
  drawCount: number;
  isMounted: boolean;
  
  // Pen state
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
  
  // Shape state
  shapeState: ShapeState;
  setShapeColor: (color: string) => void;
  setShapeSizeX: (size: number) => void;
  setShapeSizeY: (size: number) => void;
  setShapeAngle: (angle: number) => void;
  setShapeType: (type: StampShape) => void;
  setStrokeOnly: (value: boolean) => void;
  
  // Player state
  isPlaying: boolean;
  playbackSpeed: number;
  direction: number;
  onTogglePlay: () => void;
  onSetPlaybackSpeed: (speed: number) => void;
  onSetDirection: (direction: number) => void;
  
  // Layout
  isTablet?: boolean;
}

export function Toolbar({
  t,
  activeTab,
  setActiveTab,
  canUndo,
  canRedo,
  isExporting,
  onUndo,
  onRedo,
  onEraseAll,
  onExportVideo,
  isTimeRequirementMet,
  drawCount,
  isMounted,
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
  shapeState,
  setShapeColor,
  setShapeSizeX,
  setShapeSizeY,
  setShapeAngle,
  setShapeType,
  setStrokeOnly,
  isPlaying,
  playbackSpeed,
  direction,
  onTogglePlay,
  onSetPlaybackSpeed,
  onSetDirection,
  isTablet = false,
}: ToolbarProps) {
  const canExport = isTimeRequirementMet && drawCount >= 15;

  // Tablet layout: bottom drawer style
  if (isTablet) {
    return (
      <div className="fixed bottom-0 left-0 right-0 flex flex-col bg-card shadow-2xl border-t border-border z-50 max-h-[50vh] overflow-y-auto">
        {/* Compact horizontal toolbar for tablet */}
        <div className="flex items-center justify-between gap-2 p-3">
          {/* Left: Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onUndo}
              disabled={!canUndo || isExporting}
              className="min-w-[44px] min-h-[44px]"
            >
              <Undo2 className="size-5" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onRedo}
              disabled={!canRedo || isExporting}
              className="min-w-[44px] min-h-[44px]"
            >
              <Redo2 className="size-5" />
            </Button>
            <Button
              variant="destructive"
              size="icon-sm"
              onClick={onEraseAll}
              disabled={isExporting}
              className="min-w-[44px] min-h-[44px]"
            >
              <Trash2 className="size-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={onExportVideo}
              disabled={isExporting || !canExport}
              className="text-purple-600 dark:text-purple-400 min-w-[44px] min-h-[44px]"
            >
              <Video className="size-5" />
            </Button>
          </div>
          
          {/* Center: Tool Tabs */}
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as ToolTab)}
            className="flex-1 max-w-xs"
          >
            <TabsList className="w-full">
              <TabsTrigger value="pen" className="flex-1 gap-1 min-h-[44px]">
                <Paintbrush className="size-4" />
                {t('pens')}
              </TabsTrigger>
              <TabsTrigger value="shape" className="flex-1 gap-1 min-h-[44px]">
                <Square className="size-4" />
                {t('shapes')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Right: Player controls */}
          <div className="flex items-center gap-2">
            <PlayerControls
              t={t}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              direction={direction}
              onTogglePlay={onTogglePlay}
              onSetPlaybackSpeed={onSetPlaybackSpeed}
              onSetDirection={onSetDirection}
              compact={true}
            />
          </div>
        </div>
        
        <Separator />
        
        {/* Tool-specific controls */}
        <div className="p-3">
          {activeTab === 'pen' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <PenControls
                t={t}
                penState={penState}
                setPenColor={setPenColor}
                setPenSize={setPenSize}
                setPenBlur={setPenBlur}
                setPenOpacity={setPenOpacity}
                setPenTip={setPenTip}
                toggleEraser={toggleEraser}
                togglePhysics={togglePhysics}
                toggleLineTool={toggleLineTool}
                togglePressureSensitivity={togglePressureSensitivity}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ShapeControls
                t={t}
                shapeState={shapeState}
                setShapeColor={setShapeColor}
                setShapeSizeX={setShapeSizeX}
                setShapeSizeY={setShapeSizeY}
                setShapeAngle={setShapeAngle}
                setShapeType={setShapeType}
                setStrokeOnly={setStrokeOnly}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop layout: right sidebar
  return (
    <div className="fixed top-14 right-0 bottom-12 flex flex-col gap-3 bg-card p-4 shadow-2xl w-72 border-l border-border overflow-y-auto">
      
      {/* Top Actions - Horizontal */}
      <div className="flex items-center justify-center gap-2 pb-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onUndo}
              disabled={!canUndo || isExporting}
            >
              <Undo2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t('undo')}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onRedo}
              disabled={!canRedo || isExporting}
            >
              <Redo2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t('redo')}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon-sm"
              onClick={onEraseAll}
              disabled={isExporting}
            >
              <Trash2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t('erase_all')}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={onExportVideo}
              disabled={isExporting || !canExport}
              className="text-purple-600 dark:text-purple-400"
            >
              <Video className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {isMounted ? (!canExport ? t('export_locked') : t('export_video')) : t('export_video')}
          </TooltipContent>
        </Tooltip>
      </div>

      <Separator />

      {/* Tool Tabs */}
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as ToolTab)}
        className="w-full"
      >
        <TabsList className="w-full">
          <TabsTrigger value="pen" className="flex-1 gap-2">
            <Paintbrush className="size-4" />
            {t('pens')}
          </TabsTrigger>
          <TabsTrigger value="shape" className="flex-1 gap-2">
            <Square className="size-4" />
            {t('shapes')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pen" className="flex flex-col gap-3 pt-2">
          <PenControls
            t={t}
            penState={penState}
            setPenColor={setPenColor}
            setPenSize={setPenSize}
            setPenBlur={setPenBlur}
            setPenOpacity={setPenOpacity}
            setPenTip={setPenTip}
            toggleEraser={toggleEraser}
            togglePhysics={togglePhysics}
            toggleLineTool={toggleLineTool}
            togglePressureSensitivity={togglePressureSensitivity}
          />
        </TabsContent>

        <TabsContent value="shape" className="flex flex-col gap-3 pt-2">
          <ShapeControls
            t={t}
            shapeState={shapeState}
            setShapeColor={setShapeColor}
            setShapeSizeX={setShapeSizeX}
            setShapeSizeY={setShapeSizeY}
            setShapeAngle={setShapeAngle}
            setShapeType={setShapeType}
            setStrokeOnly={setStrokeOnly}
          />
        </TabsContent>
      </Tabs>

      <Separator className="mt-auto" />

      {/* Player Controls */}
      <PlayerControls
        t={t}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        direction={direction}
        onTogglePlay={onTogglePlay}
        onSetPlaybackSpeed={onSetPlaybackSpeed}
        onSetDirection={onSetDirection}
      />
    </div>
  );
}
