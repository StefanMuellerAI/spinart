import { useEffect, useRef, MutableRefObject } from 'react';
import { Point } from '@/types/spinart';

interface UseKeyboardControlsProps {
  rotationRef: MutableRefObject<number>;
  lineStartPaperPosRef: MutableRefObject<Point | null>;
  setIsPlaying: (value: boolean) => void;
  setDirection: (value: number) => void;
  setPlaybackSpeed: (value: number) => void;
  directionRef: MutableRefObject<number>;
}

interface UseKeyboardControlsReturn {
  isArrowRightHeldRef: MutableRefObject<boolean>;
  isArrowLeftHeldRef: MutableRefObject<boolean>;
  isShiftDownRef: MutableRefObject<boolean>;
}

export function useKeyboardControls({
  rotationRef,
  lineStartPaperPosRef,
  setIsPlaying,
  setDirection,
  setPlaybackSpeed,
  directionRef,
}: UseKeyboardControlsProps): UseKeyboardControlsReturn {
  const isArrowRightHeldRef = useRef(false);
  const isArrowLeftHeldRef = useRef(false);
  const isShiftDownRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(false);
        rotationRef.current = 0;
        return;
      }

      if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
        e.preventDefault();
        
        const newDir = e.code === 'ArrowRight' ? 1 : -1;
        setDirection(newDir);
        directionRef.current = newDir;

        const isHeldRef = e.code === 'ArrowRight' ? isArrowRightHeldRef : isArrowLeftHeldRef;

        if (!e.repeat) {
          setIsPlaying(true);
          
          setTimeout(() => {
            if (isHeldRef.current) {
              setPlaybackSpeed(4.0);
            }
          }, 200);
          
          isHeldRef.current = true;
        }
      }
      if (e.key === 'Shift') {
        isShiftDownRef.current = true;
      }
      if (e.key === 'Control') {
        rotationRef.current = 0;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
        e.preventDefault();
        if (e.code === 'ArrowRight') isArrowRightHeldRef.current = false;
        if (e.code === 'ArrowLeft') isArrowLeftHeldRef.current = false;
        setPlaybackSpeed(1.0);
      }
      if (e.key === 'Shift') {
        isShiftDownRef.current = false;
        lineStartPaperPosRef.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [rotationRef, lineStartPaperPosRef, setIsPlaying, setDirection, setPlaybackSpeed, directionRef]);

  return {
    isArrowRightHeldRef,
    isArrowLeftHeldRef,
    isShiftDownRef,
  };
}

