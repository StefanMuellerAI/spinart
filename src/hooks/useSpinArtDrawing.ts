import { useState, useRef, useEffect, MutableRefObject } from 'react';
import { TipShape, StampShape, PenSettings, ShapeSettings, Point } from '@/types/spinart';

export interface PenState {
  color: string;
  size: number;
  blur: number;
  opacity: number;
  tip: TipShape;
  isEraser: boolean;
  physicsEnabled: boolean;
  lineToolEnabled: boolean;
  pressureSensitivityEnabled: boolean;
  // Gradient
  gradientEnabled: boolean;
  gradientStartColor: string;
  gradientEndColor: string;
  // Symmetry
  symmetryEnabled: boolean;
  symmetryCount: number;
}

export interface ShapeState {
  color: string;
  sizeX: number;
  sizeY: number;
  angle: number;
  type: StampShape;
  strokeOnly: boolean;
}

export interface DrawingRefs {
  isDrawingRef: MutableRefObject<boolean>;
  isDraggingDiscRef: MutableRefObject<boolean>;
  currentMouseScreenPosRef: MutableRefObject<Point | null>;
  prevMouseScreenPosRef: MutableRefObject<Point | null>;
  prevRotationRef: MutableRefObject<number>;
  lineStartPaperPosRef: MutableRefObject<Point | null>;
  penColorRef: MutableRefObject<string>;
  penSettingsRef: MutableRefObject<PenSettings>;
  shapeSettingsRef: MutableRefObject<ShapeSettings>;
  physicsEnabledRef: MutableRefObject<boolean>;
  // Apple Pencil / Stylus pressure support
  currentPressureRef: MutableRefObject<number>;
  pressureSensitivityEnabledRef: MutableRefObject<boolean>;
  // Gradient refs
  gradientEnabledRef: MutableRefObject<boolean>;
  gradientStartColorRef: MutableRefObject<string>;
  gradientEndColorRef: MutableRefObject<string>;
  gradientProgressRef: MutableRefObject<number>;
  // Symmetry refs
  symmetryEnabledRef: MutableRefObject<boolean>;
  symmetryCountRef: MutableRefObject<number>;
}

interface UseSpinArtDrawingReturn {
  // Pen State
  penState: PenState;
  setPenColor: (color: string) => void;
  setPenSize: (size: number) => void;
  setPenBlur: (blur: number) => void;
  setPenOpacity: (opacity: number) => void;
  setPenTip: (tip: TipShape) => void;
  setIsEraser: (value: boolean) => void;
  setPhysicsEnabled: (value: boolean) => void;
  setLineToolEnabled: (value: boolean) => void;
  // Gradient setters
  setGradientStartColor: (color: string) => void;
  setGradientEndColor: (color: string) => void;
  // Symmetry setter
  setSymmetryCount: (count: number) => void;
  
  // Shape State
  shapeState: ShapeState;
  setShapeColor: (color: string) => void;
  setShapeSizeX: (size: number) => void;
  setShapeSizeY: (size: number) => void;
  setShapeAngle: (angle: number) => void;
  setShapeType: (type: StampShape) => void;
  setStrokeOnly: (value: boolean) => void;
  
  // Refs
  refs: DrawingRefs;
  
  // Toggle helpers with mutual exclusivity
  toggleEraser: () => void;
  togglePhysics: () => void;
  toggleLineTool: () => void;
  togglePressureSensitivity: () => void;
  toggleGradient: () => void;
  toggleSymmetry: () => void;
}

export function useSpinArtDrawing(): UseSpinArtDrawingReturn {
  // Pen Tool State
  const [penColor, setPenColor] = useState('#000000');
  const [penSize, setPenSize] = useState(4);
  const [penBlur, setPenBlur] = useState(0);
  const [penOpacity, setPenOpacity] = useState(100);
  const [penTip, setPenTip] = useState<TipShape>('round');
  const [isEraser, setIsEraser] = useState(false);
  const [physicsEnabled, setPhysicsEnabled] = useState(false);
  const [lineToolEnabled, setLineToolEnabled] = useState(false);
  const [pressureSensitivityEnabled, setPressureSensitivityEnabled] = useState(true);

  // Gradient State
  const [gradientEnabled, setGradientEnabled] = useState(false);
  const [gradientStartColor, setGradientStartColor] = useState('#FF0000');
  const [gradientEndColor, setGradientEndColor] = useState('#0000FF');

  // Symmetry State
  const [symmetryEnabled, setSymmetryEnabled] = useState(false);
  const [symmetryCount, setSymmetryCount] = useState(4); // 2, 4, 6, or 8

  // Shape Tool State
  const [shapeColor, setShapeColor] = useState('#FF0000');
  const [shapeSizeX, setShapeSizeX] = useState(80);
  const [shapeSizeY, setShapeSizeY] = useState(80);
  const [shapeAngle, setShapeAngle] = useState(0);
  const [shapeType, setShapeType] = useState<StampShape>('rectangle');
  const [strokeOnly, setStrokeOnly] = useState(false);

  // Drawing state refs
  const isDrawingRef = useRef(false);
  const isDraggingDiscRef = useRef(false);
  const currentMouseScreenPosRef = useRef<Point | null>(null);
  const prevMouseScreenPosRef = useRef<Point | null>(null);
  const prevRotationRef = useRef(0);
  const lineStartPaperPosRef = useRef<Point | null>(null);

  // Apple Pencil / Stylus pressure refs
  const currentPressureRef = useRef(0.5); // Default pressure for mouse
  const pressureSensitivityEnabledRef = useRef(pressureSensitivityEnabled);

  // Gradient refs
  const gradientEnabledRef = useRef(gradientEnabled);
  const gradientStartColorRef = useRef(gradientStartColor);
  const gradientEndColorRef = useRef(gradientEndColor);
  const gradientProgressRef = useRef(0);

  // Symmetry refs
  const symmetryEnabledRef = useRef(symmetryEnabled);
  const symmetryCountRef = useRef(symmetryCount);

  // Sync state to refs for use in animation loop
  const penColorRef = useRef(penColor);
  const penSettingsRef = useRef<PenSettings>({ 
    size: penSize, 
    tip: penTip, 
    blur: penBlur, 
    opacity: penOpacity, 
    isEraser 
  });
  const shapeSettingsRef = useRef<ShapeSettings>({ 
    color: shapeColor, 
    sizeX: shapeSizeX, 
    sizeY: shapeSizeY,
    type: shapeType, 
    angle: shapeAngle, 
    strokeOnly 
  });
  const physicsEnabledRef = useRef(physicsEnabled);

  // Keep refs in sync with state
  useEffect(() => {
    penColorRef.current = penColor;
  }, [penColor]);

  useEffect(() => {
    penSettingsRef.current = { 
      size: penSize, 
      tip: penTip, 
      blur: penBlur, 
      opacity: penOpacity, 
      isEraser 
    };
  }, [penSize, penTip, penBlur, penOpacity, isEraser]);

  useEffect(() => {
    physicsEnabledRef.current = physicsEnabled;
  }, [physicsEnabled]);

  useEffect(() => {
    pressureSensitivityEnabledRef.current = pressureSensitivityEnabled;
  }, [pressureSensitivityEnabled]);

  // Gradient refs sync
  useEffect(() => {
    gradientEnabledRef.current = gradientEnabled;
  }, [gradientEnabled]);

  useEffect(() => {
    gradientStartColorRef.current = gradientStartColor;
  }, [gradientStartColor]);

  useEffect(() => {
    gradientEndColorRef.current = gradientEndColor;
  }, [gradientEndColor]);

  // Symmetry refs sync
  useEffect(() => {
    symmetryEnabledRef.current = symmetryEnabled;
  }, [symmetryEnabled]);

  useEffect(() => {
    symmetryCountRef.current = symmetryCount;
  }, [symmetryCount]);

  useEffect(() => {
    shapeSettingsRef.current = { 
      color: shapeColor, 
      sizeX: shapeSizeX,
      sizeY: shapeSizeY,
      type: shapeType, 
      angle: shapeAngle, 
      strokeOnly 
    };
  }, [shapeColor, shapeSizeX, shapeSizeY, shapeType, shapeAngle, strokeOnly]);

  // Toggle helpers with mutual exclusivity
  const toggleEraser = () => {
    const newValue = !isEraser;
    setIsEraser(newValue);
    if (newValue) {
      setPhysicsEnabled(false);
      setLineToolEnabled(false);
      lineStartPaperPosRef.current = null;
    }
  };

  const togglePhysics = () => {
    const newValue = !physicsEnabled;
    setPhysicsEnabled(newValue);
    if (newValue) {
      setIsEraser(false);
      setLineToolEnabled(false);
      lineStartPaperPosRef.current = null;
    }
  };

  const toggleLineTool = () => {
    const newValue = !lineToolEnabled;
    setLineToolEnabled(newValue);
    lineStartPaperPosRef.current = null;
    if (newValue) {
      setIsEraser(false);
      setPhysicsEnabled(false);
    }
  };

  const togglePressureSensitivity = () => {
    setPressureSensitivityEnabled(!pressureSensitivityEnabled);
  };

  const toggleGradient = () => {
    setGradientEnabled(!gradientEnabled);
  };

  const toggleSymmetry = () => {
    setSymmetryEnabled(!symmetryEnabled);
  };

  const penState: PenState = {
    color: penColor,
    size: penSize,
    blur: penBlur,
    opacity: penOpacity,
    tip: penTip,
    isEraser,
    physicsEnabled,
    lineToolEnabled,
    pressureSensitivityEnabled,
    gradientEnabled,
    gradientStartColor,
    gradientEndColor,
    symmetryEnabled,
    symmetryCount,
  };

  const shapeState: ShapeState = {
    color: shapeColor,
    sizeX: shapeSizeX,
    sizeY: shapeSizeY,
    angle: shapeAngle,
    type: shapeType,
    strokeOnly,
  };

  const refs: DrawingRefs = {
    isDrawingRef,
    isDraggingDiscRef,
    currentMouseScreenPosRef,
    prevMouseScreenPosRef,
    prevRotationRef,
    lineStartPaperPosRef,
    penColorRef,
    penSettingsRef,
    shapeSettingsRef,
    physicsEnabledRef,
    currentPressureRef,
    pressureSensitivityEnabledRef,
    gradientEnabledRef,
    gradientStartColorRef,
    gradientEndColorRef,
    gradientProgressRef,
    symmetryEnabledRef,
    symmetryCountRef,
  };

  return {
    penState,
    setPenColor,
    setPenSize,
    setPenBlur,
    setPenOpacity,
    setPenTip,
    setIsEraser,
    setPhysicsEnabled,
    setLineToolEnabled,
    setGradientStartColor,
    setGradientEndColor,
    setSymmetryCount,
    
    shapeState,
    setShapeColor,
    setShapeSizeX,
    setShapeSizeY,
    setShapeAngle,
    setShapeType,
    setStrokeOnly,
    
    refs,
    
    toggleEraser,
    togglePhysics,
    toggleLineTool,
    togglePressureSensitivity,
    toggleGradient,
    toggleSymmetry,
  };
}
