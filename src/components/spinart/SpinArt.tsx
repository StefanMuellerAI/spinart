'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { CANVAS_SIZE, ToolTab } from '@/types/spinart';
import { 
  useSpinArtHistory, 
  useSpinArtDrawing, 
  useSpinArtAnimation, 
  useSpinArtExport, 
  useKeyboardControls, 
  useCanvasSize 
} from '@/hooks';
import { drawPenTip, drawStampShape, initializePaperCanvas } from '@/utils/spinart/drawing';

import { MobileWarning } from './MobileWarning';
import { Toolbar } from './Toolbar';
import { SpinArtCanvas } from './SpinArtCanvas';

export default function SpinArt() {
  const { t } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paperCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [direction, setDirection] = useState(1);
  const [showIntro, setShowIntro] = useState(true);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Export restrictions state
  const [drawCount, setDrawCount] = useState(0);
  const [isTimeRequirementMet, setIsTimeRequirementMet] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<ToolTab>('pen');

  // Refs for playback state (used in animation loop)
  const isPlayingRef = useRef(false);
  const playbackSpeedRef = useRef(1.0);
  const directionRef = useRef(1);

  // Sync playback state to refs
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    playbackSpeedRef.current = playbackSpeed;
  }, [isPlaying, playbackSpeed]);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  // Custom hooks
  const { displaySize, isTablet } = useCanvasSize();
  
  const {
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
    refs: drawingRefs,
  } = useSpinArtDrawing();

  const {
    canUndo,
    canRedo,
    addToHistory,
    undo,
    redo,
    eraseAll,
    initializeHistory,
  } = useSpinArtHistory(paperCanvasRef);

  const { isExporting, handleExportVideo } = useSpinArtExport(
    paperCanvasRef, 
    playbackSpeed, 
    direction
  );

  // Animation refs need to include playback refs
  const animationRefs = {
    ...drawingRefs,
    isPlayingRef,
    playbackSpeedRef,
    directionRef,
  };

  const { rotationRef, getPaperCoordinatesForCanvas } = useSpinArtAnimation({
    canvasRef,
    paperCanvasRef,
    refs: animationRefs,
    activeTab,
    showIntro,
    t,
  });

  useKeyboardControls({
    rotationRef,
    lineStartPaperPosRef: drawingRefs.lineStartPaperPosRef,
    setIsPlaying,
    setDirection,
    setPlaybackSpeed,
    directionRef,
  });

  // Initialize on mount
  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => {
      setIsTimeRequirementMet(true);
    }, 120000);
    return () => clearTimeout(timer);
  }, []);

  // Check for mobile device - improved logic for iPad with stylus
  useEffect(() => {
    const checkDevice = () => {
      const isSmallScreen = window.innerWidth < 768;
      const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      const hasFinePointer = window.matchMedia('(any-pointer: fine)').matches;
      
      // Only warn on small screens without stylus support
      // iPad with Apple Pencil has fine pointer support
      const shouldWarn = isSmallScreen && hasCoarsePointer && !hasFinePointer;
      setShowMobileWarning(shouldWarn);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Initialize paper canvas
  useEffect(() => {
    if (!paperCanvasRef.current) {
      const pc = document.createElement('canvas');
      const initialData = initializePaperCanvas(pc);
      if (initialData) {
        initializeHistory(initialData);
      }
      paperCanvasRef.current = pc;
    }
  }, [initializeHistory]);

  // Pointer Event Handlers (support mouse, touch, and Apple Pencil)
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Prevent default to stop iOS Safari gestures
    e.preventDefault();
    
    // Capture pointer for smooth tracking
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    if (showIntro) {
      setShowIntro(false);
      return;
    }

    // Update pressure for Apple Pencil
    const pressure = e.pointerType === 'pen' ? e.pressure : 0.5;
    drawingRefs.currentPressureRef.current = pressure;

    const posPaper = getPaperCoordinatesForCanvas(e.clientX, e.clientY, rotationRef.current);
    const handleX = CANVAS_SIZE / 2 + 275;
    const handleY = CANVAS_SIZE / 2;
    const distToHandle = Math.hypot(posPaper.x - handleX, posPaper.y - handleY);
    
    if (distToHandle < 30) {
      drawingRefs.isDraggingDiscRef.current = true;
      setIsPlaying(false);
      return;
    }

    if (activeTab === 'shape') {
      const pos = getPaperCoordinatesForCanvas(e.clientX, e.clientY, rotationRef.current);
      const paperCtx = paperCanvasRef.current?.getContext('2d');
      if (paperCtx) {
        drawStampShape(
          paperCtx,
          pos.x,
          pos.y,
          drawingRefs.shapeSettingsRef.current.sizeX,
          drawingRefs.shapeSettingsRef.current.sizeY,
          drawingRefs.shapeSettingsRef.current.type,
          drawingRefs.shapeSettingsRef.current.color,
          drawingRefs.shapeSettingsRef.current.angle,
          drawingRefs.shapeSettingsRef.current.strokeOnly,
          rotationRef.current
        );
        addToHistory();
        setDrawCount(prev => prev + 1);
      }
      return;
    }

    // Line tool - click two points to draw a line
    if (penState.lineToolEnabled) {
      const pos = getPaperCoordinatesForCanvas(e.clientX, e.clientY, rotationRef.current);
      if (!drawingRefs.lineStartPaperPosRef.current) {
        drawingRefs.lineStartPaperPosRef.current = pos;
      } else {
        const paperCtx = paperCanvasRef.current?.getContext('2d');
        if (paperCtx) {
          const settings = drawingRefs.penSettingsRef.current;
          const startPos = drawingRefs.lineStartPaperPosRef.current;
          
          const dx = pos.x - startPos.x;
          const dy = pos.y - startPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const stepSize = Math.max(1, settings.size / 4);
          const steps = Math.ceil(dist / stepSize);

          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const px = startPos.x + dx * t;
            const py = startPos.y + dy * t;
            
            drawPenTip(
              paperCtx,
              px,
              py,
              settings.size,
              settings.tip,
              drawingRefs.penColorRef.current,
              0,
              settings.blur,
              settings.isEraser,
              settings.opacity
            );
          }
          
          addToHistory();
          setDrawCount(prev => prev + 1);
        }
        drawingRefs.lineStartPaperPosRef.current = null;
      }
      return;
    }

    drawingRefs.isDrawingRef.current = true;
    const pos = { x: e.clientX, y: e.clientY };
    drawingRefs.currentMouseScreenPosRef.current = pos;
    drawingRefs.prevMouseScreenPosRef.current = pos;
  }, [showIntro, activeTab, penState.lineToolEnabled, getPaperCoordinatesForCanvas, rotationRef, drawingRefs, addToHistory]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    // Update pressure continuously for smooth pressure-sensitive strokes
    if (e.pointerType === 'pen') {
      drawingRefs.currentPressureRef.current = e.pressure;
    }

    drawingRefs.currentMouseScreenPosRef.current = { x: e.clientX, y: e.clientY };

    if (drawingRefs.isDraggingDiscRef.current) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
        rotationRef.current = angle;
      }
    }
  }, [drawingRefs, rotationRef]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    // Release pointer capture
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    drawingRefs.isDraggingDiscRef.current = false;
    if (drawingRefs.isDrawingRef.current) {
      addToHistory();
      setDrawCount(prev => prev + 1);
    }
    drawingRefs.isDrawingRef.current = false;
    if (activeTab === 'pen') {
      drawingRefs.currentMouseScreenPosRef.current = null;
    }
    drawingRefs.prevMouseScreenPosRef.current = null;
    drawingRefs.currentPressureRef.current = 0.5; // Reset to default
  }, [activeTab, drawingRefs, addToHistory]);

  const handlePointerLeave = useCallback((e: React.PointerEvent) => {
    handlePointerUp(e);
    drawingRefs.currentMouseScreenPosRef.current = null;
  }, [handlePointerUp, drawingRefs]);

  const handlePointerCancel = useCallback((e: React.PointerEvent) => {
    handlePointerUp(e);
    drawingRefs.currentMouseScreenPosRef.current = null;
  }, [handlePointerUp, drawingRefs]);

  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white select-none transition-colors duration-300">
      {/* Mobile Warning Overlay */}
      {showMobileWarning && (
        <MobileWarning 
          t={t} 
          onClose={() => setShowMobileWarning(false)} 
        />
      )}

      {/* Main Content - Canvas takes full remaining space */}
      <div 
        ref={containerRef}
        className={`fixed top-14 left-0 bottom-10 flex items-center justify-center ${isTablet ? 'right-0' : 'right-72'}`}
      >
        <SpinArtCanvas
          ref={canvasRef}
          displaySize={displaySize}
          activeTab={activeTab}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onPointerCancel={handlePointerCancel}
        />
      </div>

      {/* Right Fixed Toolbar - responsive for tablet */}
      <Toolbar
        t={t}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        canUndo={canUndo}
        canRedo={canRedo}
        isExporting={isExporting}
        onUndo={undo}
        onRedo={redo}
        onEraseAll={eraseAll}
        onExportVideo={handleExportVideo}
        isTimeRequirementMet={isTimeRequirementMet}
        drawCount={drawCount}
        isMounted={isMounted}
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
        shapeState={shapeState}
        setShapeColor={setShapeColor}
        setShapeSizeX={setShapeSizeX}
        setShapeSizeY={setShapeSizeY}
        setShapeAngle={setShapeAngle}
        setShapeType={setShapeType}
        setStrokeOnly={setStrokeOnly}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        direction={direction}
        onTogglePlay={togglePlay}
        onSetPlaybackSpeed={setPlaybackSpeed}
        onSetDirection={setDirection}
        isTablet={isTablet}
      />
    </div>
  );
}
