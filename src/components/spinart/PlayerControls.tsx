'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Play, Pause, ArrowLeft, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface PlayerControlsProps {
  isPlaying: boolean;
  playbackSpeed: number;
  direction: number;
  onTogglePlay: () => void;
  onSetPlaybackSpeed: (speed: number) => void;
  onSetDirection: (direction: number) => void;
  compact?: boolean;
  minimal?: boolean;
}

export function PlayerControls({
  isPlaying,
  playbackSpeed,
  direction,
  onTogglePlay,
  onSetPlaybackSpeed,
  onSetDirection,
  compact = false,
  minimal = false,
}: PlayerControlsProps) {
  const t = useTranslations();

  // Minimal mode for collapsed sidebar - just play button
  if (minimal) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onTogglePlay}
            size="icon"
            variant={isPlaying ? 'destructive' : 'default'}
            className={!isPlaying ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
          >
            {isPlaying ? (
              <Pause className="size-5" />
            ) : (
              <Play className="size-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          {isPlaying ? t('stop') : t('play')}
        </TooltipContent>
      </Tooltip>
    );
  }

  // Compact mode for tablet layout
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={() => onSetDirection(-1)}
          variant={direction === -1 ? 'secondary' : 'ghost'}
          size="icon-sm"
          className={`min-w-[44px] min-h-[44px] ${direction === -1 ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' : ''}`}
        >
          <ArrowLeft className="size-5" />
        </Button>
        
        <Button
          onClick={onTogglePlay}
          size="icon-lg"
          variant={isPlaying ? 'destructive' : 'default'}
          className={`min-w-[48px] min-h-[48px] ${!isPlaying ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
        >
          {isPlaying ? (
            <Pause className="size-5" />
          ) : (
            <Play className="size-5" />
          )}
        </Button>
        
        <Button
          onClick={() => onSetDirection(1)}
          variant={direction === 1 ? 'secondary' : 'ghost'}
          size="icon-sm"
          className={`min-w-[44px] min-h-[44px] ${direction === 1 ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' : ''}`}
        >
          <ArrowRight className="size-5" />
        </Button>
        
        {/* Speed slider - smaller width for compact */}
        <div className="flex items-center gap-2 min-w-[100px]">
          <Slider
            value={[playbackSpeed]}
            onValueChange={([value]) => onSetPlaybackSpeed(value)}
            min={0.1}
            max={50}
            step={0.5}
            className="w-20"
          />
          <span className="text-xs font-medium w-12">{playbackSpeed.toFixed(1)}x</span>
        </div>
      </div>
    );
  }

  // Full layout for desktop
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Button
          onClick={onTogglePlay}
          size="icon-lg"
          variant={isPlaying ? 'destructive' : 'default'}
          className={!isPlaying ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
        >
          {isPlaying ? (
            <Pause className="size-5" />
          ) : (
            <Play className="size-5" />
          )}
        </Button>
        
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">{t('speed')}</Label>
            <span className="text-xs font-medium">{playbackSpeed.toFixed(1)}x</span>
          </div>
          <Slider
            value={[playbackSpeed]}
            onValueChange={([value]) => onSetPlaybackSpeed(value)}
            min={0.1}
            max={50}
            step={0.5}
          />
        </div>
      </div>
      
      {/* Direction Toggle */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant={direction === -1 ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onSetDirection(-1)}
          className={direction === -1 ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/30' : ''}
        >
          <ArrowLeft className="size-4 mr-1" />
          {t('left')}
        </Button>
        <Button
          variant={direction === 1 ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onSetDirection(1)}
          className={direction === 1 ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/30' : ''}
        >
          {t('right')}
          <ArrowRight className="size-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
