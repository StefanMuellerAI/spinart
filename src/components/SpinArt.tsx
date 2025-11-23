'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

// Configuration constants
const CANVAS_SIZE = 600;
const DISC_RADIUS = 250;

type ShapeType = 'circle' | 'square' | 'triangle' | 'star';

interface ShapeConfig {
  id: ShapeType;
  name: string;
  // Icon could be added here
}

const SHAPES: ShapeConfig[] = [
  { id: 'circle', name: 'Kreis' },
  { id: 'square', name: 'Quadrat' },
  { id: 'triangle', name: 'Dreieck' },
  { id: 'star', name: 'Stern' },
];

export default function SpinArt() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paperCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const exportRequestRef = useRef<number | null>(null);
  
  const [speedLevel, setSpeedLevel] = useState(0); // 0: stop, 1: slow, 2: medium, 3: fast
  const [color, setColor] = useState('#000000');
  const [direction, setDirection] = useState(1); // 1 for right (positive), -1 for left (negative)
  const [showIntro, setShowIntro] = useState(true);
  
  const [isExporting, setIsExporting] = useState(false);

  // Tool State
  const [toolSize, setToolSize] = useState(5);
  const [toolTipShape, setToolTipShape] = useState<ShapeType>('circle');
  const [toolBlur, setToolBlur] = useState(0);
  const [isEraser, setIsEraser] = useState(false);

  // Shape State
  const [activeMode, setActiveMode] = useState<'draw' | 'shape'>('draw');
  const [selectedShape, setSelectedShape] = useState<ShapeType>('circle');
  const [shapeColor, setShapeColor] = useState('#FF0000');
  const [shapeSize, setShapeSize] = useState(50);
  const [shapeRotation, setShapeRotation] = useState(0);
  const [isShapeFilled, setIsShapeFilled] = useState(true);

  // Speed configuration state
  const [configSpeeds, setConfigSpeeds] = useState<number[]>([0.02, 0.05, 0.1]);
  
  // Refs
  const rotationRef = useRef(0);
  const speedLevelRef = useRef(0);
  const animationFrameRef = useRef<number>(0);
  const speedsConfigRef = useRef<number[]>([0, 0.02, 0.05, 0.1]);
  
  // Key hold logic
  const isArrowRightHeldRef = useRef(false);
  const isArrowLeftHeldRef = useRef(false);
  const baseSpeedLevelRef = useRef(0);
  const directionRef = useRef(1);
  
  // Drawing state refs
  const isDrawingRef = useRef(false);
  const currentMouseScreenPosRef = useRef<{x: number, y: number} | null>(null);
  const prevMouseScreenPosRef = useRef<{x: number, y: number} | null>(null);
  const prevRotationRef = useRef(0);
  
  // Shift lock logic
  const isShiftDownRef = useRef(false);
  const lineStartPaperPosRef = useRef<{x: number, y: number} | null>(null);

  // Sync state to refs for loop access
  const colorRef = useRef('#000000');
  
  // Sync shape state to refs (if needed in loop, but click handler uses state directly mostly or refs)
  const shapeSettingsRef = useRef({ color: '#FF0000', size: 50, type: 'circle' as ShapeType, rotation: 0, filled: true });
  
  // Sync tool state to refs
  const toolSettingsRef = useRef({ size: 5, tipShape: 'circle' as ShapeType, blur: 0, isEraser: false });

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    toolSettingsRef.current = { size: toolSize, tipShape: toolTipShape, blur: toolBlur, isEraser: isEraser };
  }, [toolSize, toolTipShape, toolBlur, isEraser]);

  useEffect(() => {
    shapeSettingsRef.current = { color: shapeColor, size: shapeSize, type: selectedShape, rotation: shapeRotation, filled: isShapeFilled };
  }, [shapeColor, shapeSize, selectedShape, shapeRotation, isShapeFilled]);

  // Initialize paper canvas
  useEffect(() => {
    if (!paperCanvasRef.current) {
      const pc = document.createElement('canvas');
      pc.width = CANVAS_SIZE;
      pc.height = CANVAS_SIZE;
      const ctx = pc.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(CANVAS_SIZE/2, CANVAS_SIZE/2, DISC_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }
      paperCanvasRef.current = pc;
    }
  }, []);

  const setManualSpeed = useCallback((level: number, newDirection: number = 1) => {
    setSpeedLevel(level);
    setDirection(newDirection);
    speedLevelRef.current = level;
    baseSpeedLevelRef.current = level;
    directionRef.current = newDirection;
  }, []);

  // Handle Arrow Keys and Shift
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setSpeedLevel(0);
        speedLevelRef.current = 0;
        baseSpeedLevelRef.current = 0;
        rotationRef.current = 0; 
        return;
      }

      if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
        e.preventDefault();
        
        const newDir = e.code === 'ArrowRight' ? 1 : -1;
        if (directionRef.current !== newDir && speedLevelRef.current > 0) {
             directionRef.current = newDir;
             setDirection(newDir);
        } else {
             directionRef.current = newDir;
             setDirection(newDir);
        }

        const isHeldRef = e.code === 'ArrowRight' ? isArrowRightHeldRef : isArrowLeftHeldRef;

        if (!e.repeat) {
          setSpeedLevel(prev => {
            const next = (prev + 1) % 4;
            speedLevelRef.current = next;
            baseSpeedLevelRef.current = next;
            return next;
          });
          
          setTimeout(() => {
            if (isHeldRef.current) {
              setSpeedLevel(3);
              speedLevelRef.current = 3;
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
        setSpeedLevel(baseSpeedLevelRef.current);
        speedLevelRef.current = baseSpeedLevelRef.current;
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
  }, []);

  // Update speeds ref when config changes
  useEffect(() => {
    speedsConfigRef.current = [0, ...configSpeeds];
  }, [configSpeeds]);

  const updateConfigSpeed = (index: number, value: number) => {
    const newSpeeds = [...configSpeeds];
    newSpeeds[index] = value;
    setConfigSpeeds(newSpeeds);
  };

  // Helper to transform screen coords to paper coords
  const getPaperCoordinates = useCallback((screenX: number, screenY: number, currentRotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const dx = (screenX - rect.left) * scaleX - cx;
    const dy = (screenY - rect.top) * scaleY - cy;

    const angle = -currentRotation;
    const rx = dx * Math.cos(angle) - dy * Math.sin(angle);
    const ry = dx * Math.sin(angle) + dy * Math.cos(angle);

    return { x: rx + cx, y: ry + cy };
  }, []);

  // Helper to draw specific shapes
  const drawShape = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    size: number, 
    type: ShapeType, 
    color: string,
    rotation: number,
    filled: boolean,
    compensateRotation: number = 0,
    shadowBlur: number = 0,
    isEraser: boolean = false
  ) => {
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    
    ctx.translate(x, y);
    const totalRotation = (rotation * Math.PI / 180) - compensateRotation;
    ctx.rotate(totalRotation);
    
    ctx.beginPath();
    
    if (type === 'circle') {
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    } else if (type === 'square') {
      ctx.rect(-size / 2, -size / 2, size, size);
    } else if (type === 'triangle') {
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(size / 2, size / 2);
      ctx.lineTo(-size / 2, size / 2);
      ctx.closePath();
    } else if (type === 'star') {
        const spikes = 5;
        const outerRadius = size / 2;
        const innerRadius = size / 4;
        let rot = Math.PI / 2 * 3;
        let cx = 0;
        let cy = 0;
        let step = Math.PI / spikes;

        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            cx = Math.cos(rot) * outerRadius;
            cy = Math.sin(rot) * outerRadius;
            ctx.lineTo(cx, cy);
            rot += step;

            cx = Math.cos(rot) * innerRadius;
            cy = Math.sin(rot) * innerRadius;
            ctx.lineTo(cx, cy);
            rot += step;
        }
        ctx.lineTo(0, -outerRadius);
        ctx.closePath();
    }
    
    if (isEraser) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.fill();
    } else {
        if (filled) {
            ctx.fillStyle = color;
            ctx.shadowBlur = shadowBlur;
            ctx.shadowColor = color;
            ctx.fill();
        } else {
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(2, size / 20);
            ctx.shadowBlur = shadowBlur;
            ctx.shadowColor = color;
            ctx.stroke();
        }
    }
    
    ctx.restore();
  };

  // Export Video Function
  const handleExportVideo = async () => {
    if (!paperCanvasRef.current) return;
    setIsExporting(true);

    const ROTATIONS = 20;
    const SPEED = 0.1; // Max speed per frame (approx)
    const FPS = 60;
    const TOTAL_FRAMES = Math.ceil((ROTATIONS * 2 * Math.PI) / SPEED);
    
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1920;
    exportCanvas.height = 1080;
    const ctx = exportCanvas.getContext('2d');
    
    if (!ctx) {
        setIsExporting(false);
        return;
    }

    // Setup MediaRecorder
    const stream = exportCanvas.captureStream(FPS);
    let mimeType = 'video/webm';
    if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
        mimeType = 'video/webm;codecs=h264';
    }

    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    const chunks: BlobPart[] = [];
    
    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
    };
    
    mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spin-art-export.${mimeType === 'video/mp4' ? 'mp4' : 'webm'}`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
    };

    mediaRecorder.start();

    let frame = 0;
    let currentRot = 0;

    const drawFrame = () => {
        if (frame >= TOTAL_FRAMES) {
            mediaRecorder.stop();
            return;
        }

        // Clear background
        ctx.fillStyle = '#1f2937'; // Match bg-gray-800
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // Draw paper
        ctx.save();
        ctx.translate(exportCanvas.width / 2, exportCanvas.height / 2);
        ctx.rotate(currentRot);
        
        const scale = 1.2;
        ctx.scale(scale, scale);
        ctx.translate(-CANVAS_SIZE / 2, -CANVAS_SIZE / 2);
        
        if (paperCanvasRef.current) {
            ctx.drawImage(paperCanvasRef.current, 0, 0);
        }
        
        ctx.restore();

        // Advance rotation
        currentRot += SPEED;
        frame++;

        setTimeout(drawFrame, 1000 / FPS);
    };

    drawFrame();
  };

  // Animation Loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const paper = paperCanvasRef.current;
    if (!canvas || !paper) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prevRotation = rotationRef.current;
    const currentSpeedVal = speedsConfigRef.current[speedLevelRef.current];
    const currentSpeed = currentSpeedVal * directionRef.current;
    
    rotationRef.current += currentSpeed;
    const currentRotation = rotationRef.current;

    // Drawing Logic
    if (isDrawingRef.current && currentMouseScreenPosRef.current) {
      const paperCtx = paper.getContext('2d');
      if (paperCtx) {
        const toolSettings = toolSettingsRef.current;
        const currentMousePos = currentMouseScreenPosRef.current;
        const prevMousePos = prevMouseScreenPosRef.current || currentMousePos;
        
        const dist = Math.hypot(currentMousePos.x - prevMousePos.x, currentMousePos.y - prevMousePos.y);
        const stepSize = Math.max(1, toolSettings.size / 4); 
        const distSteps = Math.ceil(dist / stepSize);
        const rotSteps = Math.max(1, Math.ceil(Math.abs(currentSpeed) / 0.02));
        const steps = Math.max(distSteps, rotSteps);

        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            
            const interpRotation = prevRotation + (currentRotation - prevRotation) * t;
            const interpMouseX = prevMousePos.x + (currentMousePos.x - prevMousePos.x) * t;
            const interpMouseY = prevMousePos.y + (currentMousePos.y - prevMousePos.y) * t;
            
            const p = getPaperCoordinates(interpMouseX, interpMouseY, interpRotation);
            
            drawShape(
                paperCtx,
                p.x,
                p.y,
                toolSettings.size,
                toolSettings.tipShape,
                colorRef.current,
                0,
                true,
                interpRotation,
                toolSettings.blur,
                toolSettings.isEraser
            );
        }
      }
    }

    // Update refs for next frame
    if (isDrawingRef.current) {
        prevMouseScreenPosRef.current = currentMouseScreenPosRef.current;
    } else {
        prevMouseScreenPosRef.current = null;
    }
    prevRotationRef.current = currentRotation;

    // Render to screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotationRef.current);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(paper, 0, 0);

    if (lineStartPaperPosRef.current) {
      ctx.beginPath();
      ctx.arc(lineStartPaperPosRef.current.x, lineStartPaperPosRef.current.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444'; 
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore(); 

    // Ghost Shape
    if (activeMode === 'shape' && currentMouseScreenPosRef.current) {
        const mx = currentMouseScreenPosRef.current.x;
        const my = currentMouseScreenPosRef.current.y;
        const rect = canvas.getBoundingClientRect();
        
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const gx = (mx - rect.left) * scaleX;
        const gy = (my - rect.top) * scaleY;
        
        if (gx >= 0 && gx <= CANVAS_SIZE && gy >= 0 && gy <= CANVAS_SIZE) {
            ctx.save();
            ctx.translate(gx, gy);
            ctx.rotate(shapeSettingsRef.current.rotation * Math.PI / 180);
            
            ctx.beginPath();
            const sz = shapeSettingsRef.current.size;
            const filled = shapeSettingsRef.current.filled;
            
            if (shapeSettingsRef.current.type === 'circle') ctx.arc(0, 0, sz/2, 0, Math.PI*2);
            else if (shapeSettingsRef.current.type === 'square') ctx.rect(-sz/2, -sz/2, sz, sz);
            else if (shapeSettingsRef.current.type === 'triangle') {
                ctx.moveTo(0, -sz/2);
                ctx.lineTo(sz/2, sz/2);
                ctx.lineTo(-sz/2, sz/2);
                ctx.closePath();
            } else if (shapeSettingsRef.current.type === 'star') {
                const spikes = 5;
                const outerRadius = sz / 2;
                const innerRadius = sz / 4;
                let rot = Math.PI / 2 * 3;
                let cx = 0;
                let cy = 0;
                let step = Math.PI / spikes;
                ctx.moveTo(cx, cy - outerRadius);
                for (let i = 0; i < spikes; i++) {
                    cx = Math.cos(rot) * outerRadius;
                    cy = Math.sin(rot) * outerRadius;
                    ctx.lineTo(cx, cy);
                    rot += step;
                    cx = Math.cos(rot) * innerRadius;
                    cy = Math.sin(rot) * innerRadius;
                    ctx.lineTo(cx, cy);
                    rot += step;
                }
                ctx.lineTo(0, -outerRadius);
                ctx.closePath();
            }

            if (filled) {
                ctx.fillStyle = shapeSettingsRef.current.color;
                ctx.globalAlpha = 0.8;
                ctx.fill();
            } else {
                ctx.strokeStyle = shapeSettingsRef.current.color;
                ctx.lineWidth = Math.max(2, sz / 20);
                ctx.stroke();
            }
            
            ctx.restore();
        }
    }

    // Intro Overlay
    if (showIntro) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('Willkommen bei Spin Art!', canvas.width / 2, canvas.height / 2 - 40);
      
      ctx.font = '16px sans-serif';
      const lines = [
        "Wählen Sie einen Stift und drücken Sie",
        "Pfeil nach links oder nach rechts.",
        "Auf höchster Geschwindigkeit entstehen",
        "aus Ihren Zeichnungen mit etwas Übung",
        "unverwechselbare Animationen!"
      ];
      
      lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, canvas.height / 2 + 10 + (i * 25));
      });
      
      ctx.font = 'italic 14px sans-serif';
      ctx.fillStyle = '#cccccc';
      ctx.fillText('(Klicke zum Starten)', canvas.width / 2, canvas.height / 2 + 150);
    }

    animationFrameRef.current = requestAnimationFrame(render);
  }, [getPaperCoordinates, activeMode, showIntro]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [render]);

  // Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (showIntro) {
      setShowIntro(false);
      return;
    }

    if (activeMode === 'shape') {
        const pos = getPaperCoordinates(e.clientX, e.clientY, rotationRef.current);
        const paperCtx = paperCanvasRef.current?.getContext('2d');
        if (paperCtx) {
            drawShape(
                paperCtx, 
                pos.x, 
                pos.y, 
                shapeSettingsRef.current.size, 
                shapeSettingsRef.current.type, 
                shapeSettingsRef.current.color,
                shapeSettingsRef.current.rotation,
                shapeSettingsRef.current.filled,
                rotationRef.current // Compensate for current rotation
            );
        }
        return;
    }

    if (isShiftDownRef.current) {
      const pos = getPaperCoordinates(e.clientX, e.clientY, rotationRef.current);
      if (!lineStartPaperPosRef.current) {
        lineStartPaperPosRef.current = pos;
      } else {
        const paperCtx = paperCanvasRef.current?.getContext('2d');
        if (paperCtx) {
          const toolSettings = toolSettingsRef.current;
          paperCtx.save();
          paperCtx.globalCompositeOperation = 'source-atop';
          
          const dx = pos.x - lineStartPaperPosRef.current.x;
          const dy = pos.y - lineStartPaperPosRef.current.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const stepSize = Math.max(1, toolSettings.size / 4);
          const steps = Math.ceil(dist / stepSize);

          for (let i = 0; i <= steps; i++) {
              const t = i / steps;
              const px = lineStartPaperPosRef.current.x + dx * t;
              const py = lineStartPaperPosRef.current.y + dy * t;
              
              drawShape(
                paperCtx,
                px,
                py,
                toolSettings.size,
                toolSettings.tipShape,
                colorRef.current,
                0,
                true,
                0, // No rotation compensation for drawn lines usually
                toolSettings.blur,
                toolSettings.isEraser
              );
          }
          
          paperCtx.restore();
        }
        lineStartPaperPosRef.current = null;
      }
      return;
    }

    isDrawingRef.current = true;
    const pos = { x: e.clientX, y: e.clientY };
    currentMouseScreenPosRef.current = pos;
    prevMouseScreenPosRef.current = pos; // Initialize previous pos
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    currentMouseScreenPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
    if (activeMode === 'draw') {
        currentMouseScreenPosRef.current = null;
    }
    prevMouseScreenPosRef.current = null;
  };

  const handleMouseLeave = () => {
      handleMouseUp();
      currentMouseScreenPosRef.current = null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white p-4 select-none">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Spin Art</h1>
        <p className="text-gray-300">
          <span className="font-bold text-yellow-400 border px-2 py-0.5 rounded border-gray-600 mr-1">←</span>
          <span className="font-bold text-yellow-400 border px-2 py-0.5 rounded border-gray-600 mr-2">→</span>
          Pfeiltasten steuern die Rotation (Tippen: Stufe ändern, Halten: Max-Speed)
          <br />
          Halte <span className="font-bold text-blue-400 border px-2 py-0.5 rounded border-gray-600 ml-2">Shift</span> und klicke zwei Punkte, um sie mit einer Linie zu verbinden.
          <br />
          Drücke <span className="font-bold text-yellow-400 border px-2 py-0.5 rounded border-gray-600 ml-2">Leertaste</span> um zu Stoppen & Zurückzusetzen.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
        {/* Left Sidebar - Shapes */}
        <div className="flex flex-col gap-6 bg-gray-700 p-6 rounded-xl shadow-xl min-w-[200px]">
            <span className="font-medium text-lg">Formen</span>
            
            {/* Shape Color Picker */}
            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-300">Farbe</label>
                <input
                    type="color"
                    value={shapeColor}
                    onChange={(e) => setShapeColor(e.target.value)}
                    className="w-full h-10 rounded cursor-pointer border-none bg-gray-600 p-1"
                />
            </div>

            {/* Shape Size Slider */}
            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-300 flex justify-between">
                    <span>Größe</span>
                    <span>{shapeSize}px</span>
                </label>
                <input
                    type="range"
                    min="10"
                    max="200"
                    value={shapeSize}
                    onChange={(e) => setShapeSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
            </div>

            {/* Shape Rotation Slider */}
            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-300 flex justify-between">
                    <span>Rotation</span>
                    <span>{shapeRotation}°</span>
                </label>
                <input
                    type="range"
                    min="0"
                    max="360"
                    value={shapeRotation}
                    onChange={(e) => setShapeRotation(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
            </div>

            {/* Fill Toggle */}
            <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Füllung</label>
                <button
                    onClick={() => setIsShapeFilled(!isShapeFilled)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${isShapeFilled ? 'bg-purple-600' : 'bg-gray-500'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isShapeFilled ? 'left-7' : 'left-1'}`} />
                </button>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-gray-600">
                {SHAPES.map(shape => (
                    <button
                        key={shape.id}
                        onClick={() => {
                            setSelectedShape(shape.id);
                            setActiveMode('shape');
                        }}
                        className={`
                            flex items-center justify-between px-4 py-3 rounded-lg transition-all
                            ${activeMode === 'shape' && selectedShape === shape.id 
                            ? 'bg-purple-600 text-white ring-2 ring-purple-400 scale-105' 
                            : 'bg-gray-600 hover:bg-gray-500 text-gray-200'}
                        `}
                    >
                        <span>{shape.name}</span>
                        <div className="w-6 h-6 flex items-center justify-center">
                            {shape.id === 'circle' && <div className="w-4 h-4 rounded-full bg-current" />}
                            {shape.id === 'square' && <div className="w-4 h-4 bg-current" />}
                            {shape.id === 'triangle' && <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[16px] border-b-current" />}
                            {shape.id === 'star' && <span className="text-xl leading-none">★</span>}
                        </div>
                    </button>
                ))}
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col gap-4 items-center">
          <div className="relative shadow-2xl rounded-full overflow-hidden border-4 border-gray-700 bg-gray-900 cursor-crosshair">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              className={`touch-none ${activeMode === 'shape' ? 'cursor-none' : 'cursor-crosshair'}`}
              style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
            />
          </div>

          {/* Speed Controls */}
          <div className="w-full max-w-[600px] bg-gray-700 p-4 rounded-lg flex justify-between gap-4 shadow-lg">
             {[0, 1, 2].map((level) => (
               <div key={level} className="flex flex-col flex-1 gap-1">
                 <div className="flex gap-1">
                    <button 
                    onClick={() => setManualSpeed(level + 1, -1)}
                    className={`text-xs font-medium px-1 rounded transition-colors ${speedLevel === level + 1 && direction === -1 ? 'bg-yellow-500/20 text-yellow-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-gray-600'}`}
                    >
                    ←
                    </button>
                    <span className="text-xs font-medium text-gray-300">Stufe {level + 1}</span>
                    <button 
                    onClick={() => setManualSpeed(level + 1, 1)}
                    className={`text-xs font-medium px-1 rounded transition-colors ${speedLevel === level + 1 && direction === 1 ? 'bg-yellow-500/20 text-yellow-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-gray-600'}`}
                    >
                    →
                    </button>
                 </div>
                 <input
                    type="range"
                    min="0.01"
                    max="0.5"
                    step="0.01"
                    value={configSpeeds[level]}
                    onChange={(e) => updateConfigSpeed(level, parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                 />
                 <span className="text-xs text-gray-400 text-right">{configSpeeds[level].toFixed(2)}</span>
               </div>
             ))}
             
             {/* Stop Button */}
             <div className="flex items-center justify-center px-2 border-l border-gray-600">
                <button 
                   onClick={() => setManualSpeed(0)}
                   className={`px-3 py-1 rounded border transition-colors ${speedLevel === 0 ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-gray-500 text-gray-400 hover:bg-gray-600'}`}
                >
                   Stop
                </button>
             </div>
          </div>
        </div>

        {/* Right Sidebar Tools */}
        <div className="flex flex-col gap-6 bg-gray-700 p-6 rounded-xl shadow-xl min-w-[200px]">
          <span className="font-medium text-lg">Stifte</span>
          
          {/* Color Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300">Farbe</label>
            <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 rounded cursor-pointer border-none bg-gray-600 p-1"
            />
          </div>

          {/* Size Slider */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300 flex justify-between">
                <span>Größe</span>
                <span>{toolSize}px</span>
            </label>
            <input
                type="range"
                min="1"
                max="100"
                value={toolSize}
                onChange={(e) => {
                    setToolSize(parseInt(e.target.value));
                    setActiveMode('draw');
                }}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Tip Shape Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300">Spitze</label>
            <div className="grid grid-cols-4 gap-2">
                {SHAPES.map(shape => (
                    <button
                        key={shape.id}
                        onClick={() => {
                            setToolTipShape(shape.id);
                            setActiveMode('draw');
                        }}
                        className={`
                            flex items-center justify-center p-2 rounded-lg transition-all
                            ${toolTipShape === shape.id 
                            ? 'bg-blue-600 text-white ring-2 ring-blue-400 scale-105' 
                            : 'bg-gray-600 hover:bg-gray-500 text-gray-200'}
                        `}
                        title={shape.name}
                    >
                        <div className="w-4 h-4 flex items-center justify-center">
                            {shape.id === 'circle' && <div className="w-3 h-3 rounded-full bg-current" />}
                            {shape.id === 'square' && <div className="w-3 h-3 bg-current" />}
                            {shape.id === 'triangle' && <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-current" />}
                            {shape.id === 'star' && <span className="text-xs leading-none">★</span>}
                        </div>
                    </button>
                ))}
            </div>
          </div>

          {/* Blur Slider */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300 flex justify-between">
                <span>Blur</span>
                <span>{toolBlur}px</span>
            </label>
            <input
                type="range"
                min="0"
                max="20"
                value={toolBlur}
                onChange={(e) => {
                    setToolBlur(parseInt(e.target.value));
                    setActiveMode('draw');
                }}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Eraser Checkbox */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-600">
            <label className="text-sm text-gray-300">Radierer</label>
            <button
                onClick={() => {
                    setIsEraser(!isEraser);
                    setActiveMode('draw');
                }}
                className={`w-12 h-6 rounded-full transition-colors relative ${isEraser ? 'bg-blue-600' : 'bg-gray-500'}`}
            >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isEraser ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-600">
            <button 
              onClick={() => {
                const pc = paperCanvasRef.current;
                const ctx = pc?.getContext('2d');
                if(pc && ctx) {
                  ctx.save();
                  ctx.fillStyle = '#ffffff';
                  // Reset logic: clear everything first then redraw circle to be safe
                  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
                  ctx.beginPath();
                  ctx.arc(CANVAS_SIZE/2, CANVAS_SIZE/2, DISC_RADIUS, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.restore();
                }
              }}
              className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 rounded-lg text-white font-bold transition-colors flex items-center justify-center gap-2 mb-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              Papier leeren
            </button>

            <button 
              onClick={handleExportVideo}
              disabled={isExporting}
              className={`w-full px-4 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${isExporting ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            >
              {isExporting ? (
                <span>Export läuft...</span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export als Video
                </>
              )}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
