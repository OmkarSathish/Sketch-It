
'use client';

import React, { useRef, useEffect, useState, type MouseEvent, type TouchEvent } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  brushColor?: string;
  brushSize?: number;
  className?: string;
  onDrawEnd: (dataUrl: string) => void;
  clearTrigger?: number; // Increment this prop to trigger a clear
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width = 512,
  height = 512,
  brushColor = '#000000',
  brushSize = 5,
  className,
  onDrawEnd,
  clearTrigger = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas dimensions accounting for device pixel ratio for higher resolution
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    context.scale(ratio, ratio);
    context.lineCap = 'round';
    context.strokeStyle = brushColor;
    context.lineWidth = brushSize;
    contextRef.current = context;

    // Initial clear / background fill
    clearCanvas();

  }, [width, height]);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = brushColor;
    }
  }, [brushColor]);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.lineWidth = brushSize;
    }
  }, [brushSize]);

  useEffect(() => {
    if (clearTrigger > 0) {
      clearCanvas();
    }
  }, [clearTrigger]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.fillStyle = 'white'; // Fill with white background
      context.fillRect(0, 0, canvas.width, canvas.height);
      // Ensure context settings are reapplied after clearing if needed
      context.lineCap = 'round';
      context.strokeStyle = brushColor;
      context.lineWidth = brushSize;
       if (onDrawEnd) {
         // Debounce or delay slightly to ensure canvas is ready
         setTimeout(() => {
            const dataUrl = canvas.toDataURL('image/png');
            onDrawEnd(dataUrl);
         }, 50);
       }
    }
  };

  const getCoordinates = (event: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>): { offsetX: number; offsetY: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in event) {
      // Touch event
      return {
        offsetX: event.touches[0].clientX - rect.left,
        offsetY: event.touches[0].clientY - rect.top,
      };
    } else {
      // Mouse event
      return {
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
      };
    }
  };

  const startDrawing = (event: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    const context = contextRef.current;
    if (!context) return;
    const { offsetX, offsetY } = getCoordinates(event);
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    event.preventDefault(); // Prevent scrolling on touch devices
  };

  const draw = (event: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current) return;
    const context = contextRef.current;
    const { offsetX, offsetY } = getCoordinates(event);
    context.lineTo(offsetX, offsetY);
    context.stroke();
     event.preventDefault(); // Prevent scrolling on touch devices
  };

  const stopDrawing = () => {
    if (!isDrawing || !contextRef.current) return;
    const context = contextRef.current;
    context.closePath();
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas && onDrawEnd) {
        const dataUrl = canvas.toDataURL('image/png');
        onDrawEnd(dataUrl);
    }
  };


  return (
     <Card className={cn("overflow-hidden border-2 border-border shadow-md", className)}>
      <CardContent className="p-0">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing} // Stop drawing if mouse leaves canvas
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair bg-white" // Ensure background is white
        />
      </CardContent>
    </Card>
  );
};

export default DrawingCanvas;

