'use client';

import React, { forwardRef } from 'react';
import { CANVAS_SIZE, ToolTab } from '@/types/spinart';

interface SpinArtCanvasProps {
  displaySize: number;
  activeTab: ToolTab;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerLeave: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
}

export const SpinArtCanvas = forwardRef<HTMLCanvasElement, SpinArtCanvasProps>(
  function SpinArtCanvas(
    {
      displaySize,
      activeTab,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerLeave,
      onPointerCancel,
    },
    ref
  ) {
    return (
      <div 
        className="relative shadow-2xl rounded-full overflow-hidden bg-white dark:bg-gray-900 cursor-crosshair transition-all duration-200"
        style={{ width: displaySize, height: displaySize }}
      >
        <canvas
          ref={ref}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerLeave}
          onPointerCancel={onPointerCancel}
          className={`touch-none select-none ${activeTab === 'shape' ? 'cursor-none' : 'cursor-crosshair'}`}
          style={{ 
            width: displaySize, 
            height: displaySize,
            touchAction: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
          }}
        />
      </div>
    );
  }
);
