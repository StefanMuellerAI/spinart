'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Undo2, Redo2, Trash2, Paintbrush, Square, PanelRightClose, PanelRightOpen, ChevronUp, ChevronDown, Save, Loader2 } from 'lucide-react';
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
  // Tab state
  activeTab: ToolTab;
  setActiveTab: (tab: ToolTab) => void;
  
  // History actions
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onEraseAll: () => void;
  onSaveDraft: () => void;
  isSaving: boolean;
  saveMessage?: string;
  
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
  toggleGradient: () => void;
  setGradientStartColor: (color: string) => void;
  setGradientEndColor: (color: string) => void;
  toggleSymmetry: () => void;
  setSymmetryCount: (count: number) => void;
  
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
  useBottomToolbar?: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Toolbar({
  activeTab,
  setActiveTab,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onEraseAll,
  onSaveDraft,
  isSaving,
  saveMessage,
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
  toggleSymmetry,
  setSymmetryCount,
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
  useBottomToolbar = false,
  isCollapsed,
  onToggleCollapse,
}: ToolbarProps) {
  const t = useTranslations();
  const saveLabel = isSaving ? t('saving') : t('save_to_gallery');

  // Bottom toolbar layout (for tablets in portrait mode)
  if (useBottomToolbar) {
    return (
      <div className={`fixed bottom-0 left-0 right-0 flex flex-col bg-card shadow-2xl border-t border-border z-50 transition-transform duration-300 ${isCollapsed ? 'translate-y-[calc(100%-56px)]' : ''}`}>
        {/* Collapse toggle bar */}
        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-center gap-2 py-2 bg-muted/50 hover:bg-muted transition-colors border-b border-border"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="size-5" />
              <span className="text-sm font-medium">{t('show_toolbar')}</span>
            </>
          ) : (
            <>
              <ChevronDown className="size-5" />
              <span className="text-sm font-medium">{t('hide_toolbar')}</span>
            </>
          )}
        </button>

        {/* Compact horizontal toolbar for tablet */}
        <div className="flex items-center justify-between gap-2 p-3">
          {/* Left: Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onUndo}
              disabled={!canUndo || isSaving}
              className="min-w-[44px] min-h-[44px]"
            >
              <Undo2 className="size-5" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onRedo}
              disabled={!canRedo || isSaving}
              className="min-w-[44px] min-h-[44px]"
            >
              <Redo2 className="size-5" />
            </Button>
            <Button
              variant="destructive"
              size="icon-sm"
              onClick={onEraseAll}
              disabled={isSaving}
              className="min-w-[44px] min-h-[44px]"
            >
              <Trash2 className="size-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={onSaveDraft}
              disabled={isSaving}
              aria-label={saveLabel}
              className="text-purple-600 dark:text-purple-400 min-w-[44px] min-h-[44px]"
            >
              {isSaving ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
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
        <div className="p-3 max-h-[40vh] overflow-y-auto">
          {activeTab === 'pen' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <PenControls
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
                toggleGradient={toggleGradient}
                setGradientStartColor={setGradientStartColor}
                setGradientEndColor={setGradientEndColor}
                toggleSymmetry={toggleSymmetry}
                setSymmetryCount={setSymmetryCount}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ShapeControls
                shapeState={shapeState}
                setShapeColor={setShapeColor}
                setShapeSizeX={setShapeSizeX}
                setShapeSizeY={setShapeSizeY}
                setShapeAngle={setShapeAngle}
                setShapeType={setShapeType}
                setStrokeOnly={setStrokeOnly}
                symmetryEnabled={penState.symmetryEnabled}
                symmetryCount={penState.symmetryCount}
                toggleSymmetry={toggleSymmetry}
                setSymmetryCount={setSymmetryCount}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop/Landscape layout: right sidebar (z-30 so footer z-40 stays on top)
  // Collapsed state shows only a thin bar with toggle button
  if (isCollapsed) {
    return (
      <div className="fixed top-14 right-0 bottom-0 z-30 flex flex-col items-center bg-card shadow-2xl w-12 border-l border-border">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="mt-2"
            >
              <PanelRightOpen className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">{t('show_toolbar')}</TooltipContent>
        </Tooltip>
        
        <Separator className="my-2 w-8" />
        
        {/* Minimal controls when collapsed */}
        <div className="flex flex-col gap-2 items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={onUndo}
                disabled={!canUndo || isSaving}
              >
                <Undo2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">{t('undo')}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={onRedo}
                disabled={!canRedo || isSaving}
              >
                <Redo2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">{t('redo')}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon-sm"
                onClick={onEraseAll}
                disabled={isSaving}
              >
                <Trash2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">{t('erase_all')}</TooltipContent>
          </Tooltip>
        </div>
        
        {/* Play button at bottom */}
        <div className="mt-auto mb-16">
          <PlayerControls
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            direction={direction}
            onTogglePlay={onTogglePlay}
            onSetPlaybackSpeed={onSetPlaybackSpeed}
            onSetDirection={onSetDirection}
            minimal={true}
          />
        </div>
      </div>
    );
  }

  // Full sidebar
  return (
    <div className="fixed top-14 right-0 bottom-0 z-30 flex flex-col gap-3 bg-card p-4 pb-14 shadow-2xl w-72 border-l border-border overflow-y-auto">
      
      {/* Collapse toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{t('tools')}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleCollapse}
            >
              <PanelRightClose className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">{t('hide_toolbar')}</TooltipContent>
        </Tooltip>
      </div>

      <Separator />
      
      {/* Top Actions - Horizontal */}
      <div className="flex items-center justify-center gap-2 pb-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onUndo}
              disabled={!canUndo || isSaving}
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
              disabled={!canRedo || isSaving}
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
              disabled={isSaving}
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
              onClick={onSaveDraft}
              disabled={isSaving}
              aria-label={saveLabel}
              className="text-purple-600 dark:text-purple-400"
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {saveMessage || saveLabel}
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
            toggleGradient={toggleGradient}
            setGradientStartColor={setGradientStartColor}
            setGradientEndColor={setGradientEndColor}
            toggleSymmetry={toggleSymmetry}
            setSymmetryCount={setSymmetryCount}
          />
        </TabsContent>

        <TabsContent value="shape" className="flex flex-col gap-3 pt-2">
          <ShapeControls
            shapeState={shapeState}
            setShapeColor={setShapeColor}
            setShapeSizeX={setShapeSizeX}
            setShapeSizeY={setShapeSizeY}
            setShapeAngle={setShapeAngle}
            setShapeType={setShapeType}
            setStrokeOnly={setStrokeOnly}
            symmetryEnabled={penState.symmetryEnabled}
            symmetryCount={penState.symmetryCount}
            toggleSymmetry={toggleSymmetry}
            setSymmetryCount={setSymmetryCount}
          />
        </TabsContent>
      </Tabs>

      <Separator className="mt-auto" />

      {/* Player Controls */}
      <PlayerControls
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
