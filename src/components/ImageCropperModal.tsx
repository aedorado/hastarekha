'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, RotateCcw, Check, X, RefreshCw } from 'lucide-react';

interface ImageCropperModalProps {
  file: File;
  view?: string;
  onConfirm: (croppedFile: File) => void;
  onCancel: () => void;
}

interface Crop {
  x: number; // percentage
  y: number; // percentage
  w: number; // percentage
  h: number; // percentage
}

interface DragState {
  type: 'move' | 'resize';
  handle?: string;
  startX: number;
  startY: number;
  startCrop: Crop;
}

export default function ImageCropperModal({ file, view, onConfirm, onCancel }: ImageCropperModalProps) {
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [crop, setCrop] = useState<Crop>({ x: 15, y: 15, w: 70, h: 70 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);

  // Load image file
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImageElement(img);
      setCrop({ x: 15, y: 15, w: 70, h: 70 });
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
    };
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Adjust preview canvas size when image loads or rotates, fitting container bounds
  useEffect(() => {
    if (!imageElement) return;

    const updateSize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      const naturalWidth = imageElement.naturalWidth;
      const naturalHeight = imageElement.naturalHeight;

      // Fit rotated dimensions
      const isRotated = rotation % 180 !== 0;
      const w = isRotated ? naturalHeight : naturalWidth;
      const h = isRotated ? naturalWidth : naturalHeight;

      const imageRatio = w / h;
      const containerRatio = containerWidth / containerHeight;

      let cw = 0;
      let ch = 0;

      if (imageRatio > containerRatio) {
        cw = containerWidth;
        ch = containerWidth / imageRatio;
      } else {
        cw = containerHeight * imageRatio;
        ch = containerHeight;
      }

      setCanvasSize({ width: cw, height: ch });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [imageElement, rotation]);

  // Draw image on preview canvas
  useEffect(() => {
    if (!imageElement || !previewCanvasRef.current || canvasSize.width === 0) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    const dw = rotation % 180 !== 0 ? canvas.height : canvas.width;
    const dh = rotation % 180 !== 0 ? canvas.width : canvas.height;

    ctx.drawImage(imageElement, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  }, [imageElement, rotation, flipH, flipV, canvasSize]);

  // Dragging and resizing crop box handlers
  const startDrag = (clientX: number, clientY: number, type: 'move' | 'resize', handle?: string) => {
    dragStateRef.current = {
      type,
      handle,
      startX: clientX,
      startY: clientY,
      startCrop: { ...crop },
    };
  };

  const handleMouseDown = (e: React.MouseEvent, type: 'move' | 'resize', handle?: string) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY, type, handle);
  };

  const handleTouchStart = (e: React.TouchEvent, type: 'move' | 'resize', handle?: string) => {
    e.stopPropagation();
    if (e.touches.length > 0) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY, type, handle);
    }
  };

  const performDrag = (clientX: number, clientY: number) => {
    const ds = dragStateRef.current;
    if (!ds || !overlayRef.current) return;

    const rect = overlayRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dx = clientX - ds.startX;
    const dy = clientY - ds.startY;

    const pctDx = (dx / rect.width) * 100;
    const pctDy = (dy / rect.height) * 100;

    let { x, y, w, h } = ds.startCrop;

    if (ds.type === 'move') {
      x += pctDx;
      y += pctDy;

      // Keep inside bounds
      x = Math.max(0, Math.min(100 - w, x));
      y = Math.max(0, Math.min(100 - h, y));

      setCrop({ x, y, w, h });
    } else if (ds.type === 'resize' && ds.handle) {
      const handle = ds.handle;

      if (handle.includes('l')) {
        const nextX = x + pctDx;
        const nextW = w - pctDx;
        if (nextX >= 0 && nextW >= 10) {
          x = nextX;
          w = nextW;
        } else if (nextX < 0) {
          w = w + x;
          x = 0;
        } else if (nextW < 10) {
          x = x + w - 10;
          w = 10;
        }
      }

      if (handle.includes('r')) {
        const nextW = w + pctDx;
        if (x + nextW <= 100 && nextW >= 10) {
          w = nextW;
        } else if (x + nextW > 100) {
          w = 100 - x;
        } else if (nextW < 10) {
          w = 10;
        }
      }

      if (handle.includes('t')) {
        const nextY = y + pctDy;
        const nextH = h - pctDy;
        if (nextY >= 0 && nextH >= 10) {
          y = nextY;
          h = nextH;
        } else if (nextY < 0) {
          h = h + y;
          y = 0;
        } else if (nextH < 10) {
          y = y + h - 10;
          h = 10;
        }
      }

      if (handle.includes('b')) {
        const nextH = h + pctDy;
        if (y + nextH <= 100 && nextH >= 10) {
          h = nextH;
        } else if (y + nextH > 100) {
          h = 100 - y;
        } else if (nextH < 10) {
          h = 10;
        }
      }

      setCrop({ x, y, w, h });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStateRef.current) return;
    e.preventDefault();
    performDrag(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragStateRef.current) return;
    if (e.touches.length > 0) {
      performDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleMouseUp = () => {
    dragStateRef.current = null;
  };

  // Generate final cropped, rotated, and flipped image
  const handleApply = () => {
    if (!imageElement) return;

    const naturalWidth = imageElement.naturalWidth;
    const naturalHeight = imageElement.naturalHeight;

    const isRotated = rotation % 180 !== 0;
    const finalW = isRotated ? naturalHeight : naturalWidth;
    const finalH = isRotated ? naturalWidth : naturalHeight;

    // Canvas 1: oriented full resolution image
    const fullCanvas = document.createElement('canvas');
    fullCanvas.width = finalW;
    fullCanvas.height = finalH;
    const ctx = fullCanvas.getContext('2d');
    if (!ctx) return;

    ctx.translate(finalW / 2, finalH / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    const dw = isRotated ? finalH : finalW;
    const dh = isRotated ? finalW : finalH;

    ctx.drawImage(imageElement, -dw / 2, -dh / 2, dw, dh);

    // Canvas 2: crop target region
    const cropX = (crop.x / 100) * finalW;
    const cropY = (crop.y / 100) * finalH;
    const cropW = (crop.w / 100) * finalW;
    const cropH = (crop.h / 100) * finalH;

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropW;
    cropCanvas.height = cropH;
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return;

    cropCtx.drawImage(fullCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    cropCanvas.toBlob(
      (blob) => {
        if (blob) {
          const fileType = file.type || 'image/jpeg';
          const fileName = file.name || 'cropped-hand.jpg';
          const croppedFile = new File([blob], fileName, { type: fileType });
          onConfirm(croppedFile);
        }
      },
      'image/jpeg',
      0.9
    );
  };

  const handleRotate = (clockwise: boolean) => {
    setRotation((prev) => {
      const next = clockwise ? prev + 90 : prev - 90;
      // normalize to [0, 90, 180, 270]
      return ((next % 360) + 360) % 365; // Modulo math
    });
  };

  // Wait, let's fix that rotation calculation so it's clean
  const rotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const rotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setCrop({ x: 15, y: 15, w: 70, h: 70 });
  };

  if (!imageElement) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-10 h-10 border-4 border-accent-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-300 text-sm font-semibold">Loading Image Details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-4 md:p-6">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col text-stone-100 max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-stone-850 flex items-center justify-between bg-stone-900">
          <div>
            <h3 className="font-bold text-base md:text-lg text-white">
              {view === 'd1_chart' ? 'Adjust D-1 Chart Photo' : 'Adjust Hand Photo'}
            </h3>
            <p className="text-stone-400 text-[11px] md:text-xs mt-0.5">
              {view === 'd1_chart'
                ? 'Orient and crop the photo to center the astrological chart.'
                : 'Orient and crop the photo to center the hand before performing palmistry annotations.'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-white transition-colors cursor-pointer"
            title="Cancel"
            type="button"
          >
            <X className="w-4 h-4 md:w-5 h-5" />
          </button>
        </div>

        {/* Workspace Canvas viewport */}
        <div
          ref={containerRef}
          className="flex-1 min-h-[300px] md:min-h-[400px] bg-stone-950 p-4 flex items-center justify-center relative overflow-hidden border-b border-stone-800"
          style={{ height: 'calc(70vh - 180px)' }}
        >
          {canvasSize.width > 0 && (
            <div
              style={{
                position: 'relative',
                width: canvasSize.width,
                height: canvasSize.height,
              }}
            >
              <canvas
                ref={previewCanvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="block shadow-lg rounded"
              />
              
              {/* Interaction Overlay */}
              <div
                ref={overlayRef}
                className="absolute inset-0 overflow-hidden rounded select-none"
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                onMouseUp={handleMouseUp}
                onTouchEnd={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Crop Box Container */}
                <div
                  className="absolute border-2 border-dashed border-amber-500 cursor-move shadow-[0_0_0_9999px_rgba(12,10,9,0.7)]"
                  style={{
                    left: `${crop.x}%`,
                    top: `${crop.y}%`,
                    width: `${crop.w}%`,
                    height: `${crop.h}%`,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'move')}
                  onTouchStart={(e) => handleTouchStart(e, 'move')}
                >
                  {/* Grid Lines for Helper Guides */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                    <div className="border-r border-b border-dashed border-white" />
                    <div className="border-r border-b border-dashed border-white" />
                    <div className="border-b border-dashed border-white" />
                    <div className="border-r border-b border-dashed border-white" />
                    <div className="border-r border-b border-dashed border-white" />
                    <div className="border-b border-dashed border-white" />
                  </div>

                  {/* Handles */}
                  {/* Top-Left */}
                  <div
                    className="absolute -top-2 -left-2 w-6 h-6 cursor-nwse-resize flex items-center justify-center"
                    onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'resize', 'tl'); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, 'resize', 'tl'); }}
                  >
                    <div className="w-3.5 h-3.5 bg-amber-500 border border-white rounded shadow-md" />
                  </div>
                  {/* Top-Right */}
                  <div
                    className="absolute -top-2 -right-2 w-6 h-6 cursor-nesw-resize flex items-center justify-center"
                    onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'resize', 'tr'); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, 'resize', 'tr'); }}
                  >
                    <div className="w-3.5 h-3.5 bg-amber-500 border border-white rounded shadow-md" />
                  </div>
                  {/* Bottom-Left */}
                  <div
                    className="absolute -bottom-2 -left-2 w-6 h-6 cursor-nesw-resize flex items-center justify-center"
                    onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'resize', 'bl'); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, 'resize', 'bl'); }}
                  >
                    <div className="w-3.5 h-3.5 bg-amber-500 border border-white rounded shadow-md" />
                  </div>
                  {/* Bottom-Right */}
                  <div
                    className="absolute -bottom-2 -right-2 w-6 h-6 cursor-nwse-resize flex items-center justify-center"
                    onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'resize', 'br'); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, 'resize', 'br'); }}
                  >
                    <div className="w-3.5 h-3.5 bg-amber-500 border border-white rounded shadow-md" />
                  </div>
                  
                  {/* Edges - top, bottom, left, right */}
                  <div
                    className="absolute -top-1 left-4 right-4 h-2.5 cursor-ns-resize"
                    onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'resize', 't'); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, 'resize', 't'); }}
                  />
                  <div
                    className="absolute -bottom-1 left-4 right-4 h-2.5 cursor-ns-resize"
                    onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'resize', 'b'); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, 'resize', 'b'); }}
                  />
                  <div
                    className="absolute top-4 bottom-4 -left-1 w-2.5 cursor-ew-resize"
                    onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'resize', 'l'); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, 'resize', 'l'); }}
                  />
                  <div
                    className="absolute top-4 bottom-4 -right-1 w-2.5 cursor-ew-resize"
                    onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'resize', 'r'); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, 'resize', 'r'); }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Toolbar & Footer controls */}
        <div className="bg-stone-900 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Operations: Rotate & Flip */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={rotateLeft}
              className="px-3 py-2 bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-stone-750"
              title="Rotate 90° Counter-Clockwise"
              type="button"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Rotate Left
            </button>
            <button
              onClick={rotateRight}
              className="px-3 py-2 bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-stone-750"
              title="Rotate 90° Clockwise"
              type="button"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Rotate Right
            </button>
            
            <span className="w-[1px] h-6 bg-stone-800 mx-1 hidden sm:inline-block" />

            <button
              onClick={() => setFlipH((prev) => !prev)}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer border ${
                flipH 
                  ? 'bg-amber-500/10 border-amber-500/35 text-amber-500' 
                  : 'bg-stone-800 hover:bg-stone-750 border-stone-750 text-stone-300 hover:text-white'
              }`}
              title="Flip Horizontally"
              type="button"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12,2A10,10,0,0,0,2,12a10,10,0,0,0,10,10V2M14,4.16L19.84,12,14,19.84V4.16Z" />
              </svg>
              Flip Horizontal
            </button>
            <button
              onClick={() => setFlipV((prev) => !prev)}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer border ${
                flipV 
                  ? 'bg-amber-500/10 border-amber-500/35 text-amber-500' 
                  : 'bg-stone-800 hover:bg-stone-750 border-stone-750 text-stone-300 hover:text-white'
              }`}
              title="Flip Vertically"
              type="button"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M22,12A10,10,0,0,0,12,2a10,10,0,0,0-10,10H22M19.84,14,12,19.84,4.16,14H19.84Z" />
              </svg>
              Flip Vertical
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-2 bg-stone-800 hover:bg-stone-750 text-rose-400 hover:text-rose-350 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-stone-750 ml-auto sm:ml-0"
              title="Reset Adjustments"
              type="button"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 justify-end border-t border-stone-850 pt-3 md:pt-0 md:border-0">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-stone-800 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer text-xs md:text-sm font-semibold"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 bg-accent-gold hover:bg-amber-600 text-white rounded-lg transition-colors cursor-pointer text-xs md:text-sm font-semibold shadow-md flex items-center gap-1.5"
              type="button"
            >
              <Check className="w-4 h-4" />
              Apply Adjustments
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
