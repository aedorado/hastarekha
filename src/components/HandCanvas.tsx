'use client';

import React, { useRef, useState, MouseEvent } from 'react';
import { MapPin, Edit3, RotateCcw, Palette, UploadCloud, Eye, Trash2, Ruler, Sparkles } from 'lucide-react';
import { Pin, Drawing, HandView, HAND_VIEW_LABELS, HandProfile, parseVedicData, serializeVedicData } from '@/lib/supabase';

interface HandCanvasProps {
  images: Record<string, string>;
  activeView: HandView;
  onChangeActiveView: (view: HandView) => void;
  pins: Pin[];
  drawings: Drawing[];
  onChangePins: (pins: Pin[]) => void;
  onChangeDrawings: (drawings: Drawing[]) => void;
  onSelectPin: (pin: Pin | null) => void;
  selectedPinId: string | null;
  onUploadImageForView: (view: HandView, file: File) => Promise<void>;
  onRemoveImageForView: (view: HandView) => void;
  isUploading: boolean;
  profile?: HandProfile;
  onChangeProfile?: (profile: HandProfile) => void;
}

const COLORS = [
  { name: 'Gold', value: '#b88d21' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Red', value: '#e11d48' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Green', value: '#16a34a' },
];

const VIEWS: HandView[] = ['right_palm', 'right_back', 'left_palm', 'left_back'];

export default function HandCanvas({
  images,
  activeView,
  onChangeActiveView,
  pins,
  drawings,
  onChangePins,
  onChangeDrawings,
  onSelectPin,
  selectedPinId,
  onUploadImageForView,
  onRemoveImageForView,
  isUploading,
  profile,
  onChangeProfile,
}: HandCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'pin' | 'draw' | 'measure'>('pin');
  const [currentColor, setCurrentColor] = useState('#b88d21');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmClearPins, setConfirmClearPins] = useState(false);
  const [confirmRemovePhoto, setConfirmRemovePhoto] = useState(false);
  const [draggingNode, setDraggingNode] = useState<'palm_start' | 'palm_end' | 'finger_start' | 'finger_end' | 'width_start' | 'width_end' | null>(null);

  const DEFAULT_MEASUREMENTS = {
    palm_start: { x: 50, y: 70 },
    palm_end: { x: 50, y: 45 },
    finger_start: { x: 50, y: 45 },
    finger_end: { x: 50, y: 20 },
    width_start: { x: 35, y: 58 },
    width_end: { x: 65, y: 58 },
  };

  const vedicData = profile ? parseVedicData(profile.general_notes) : null;
  const measurements = vedicData?.measurements;

  // Helper: pixel-accurate distance between two percent-coordinate points
  const pxDist = (ax: number, ay: number, bx: number, by: number): number => {
    const rect = containerRef.current?.getBoundingClientRect();
    const W = rect?.width ?? 500;
    const H = rect?.height ?? 600;
    return Math.sqrt(Math.pow((bx - ax) * W / 100, 2) + Math.pow((by - ay) * H / 100, 2));
  };

  const displayPalmLength = measurements
    ? parseFloat((pxDist(
        measurements.palm_start.x, measurements.palm_start.y,
        measurements.palm_end.x,   measurements.palm_end.y
      ) * 0.04).toFixed(1))
    : 10.0;


  const imageUrl = images[activeView] || '';

  // Local filter for selected hand view
  const visiblePins = pins.filter((p) => p.view === activeView);
  const visibleDrawings = drawings.filter((d) => d.view === activeView);

  // Calculate coordinates relative to container percentage (0 to 100)
  const getRelativeCoords = (e: React.MouseEvent<any>) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  const handleSvgMouseDown = (e: React.MouseEvent<any>) => {
    if (mode === 'measure') return;
    if (mode !== 'draw' || !imageUrl) return;
    setIsDrawing(true);
    const coords = getRelativeCoords(e);
    setCurrentPoints([coords]);
  };

  const handleSvgMouseMove = (e: React.MouseEvent<any>) => {
    if (mode === 'measure') {
      if (draggingNode && profile && onChangeProfile && measurements) {
        const coords = getRelativeCoords(e);
        const updatedMeasurements = {
          ...measurements,
          [draggingNode]: coords,
        };

        // Align finger_start and palm_end when dragged together
        if (draggingNode === 'palm_end') {
          updatedMeasurements.finger_start = coords;
        } else if (draggingNode === 'finger_start') {
          updatedMeasurements.palm_end = coords;
        }

        // Fallback for missing width coordinates in older profiles
        if (!updatedMeasurements.width_start) {
          updatedMeasurements.width_start = { ...DEFAULT_MEASUREMENTS.width_start };
        }
        if (!updatedMeasurements.width_end) {
          updatedMeasurements.width_end = { ...DEFAULT_MEASUREMENTS.width_end };
        }

        // Get real container pixel dimensions for accurate distance
        const rect = containerRef.current!.getBoundingClientRect();
        const W = rect.width;
        const H = rect.height;
        const px = (ax: number, ay: number, bx: number, by: number) =>
          Math.sqrt(Math.pow((bx - ax) * W / 100, 2) + Math.pow((by - ay) * H / 100, 2));

        const currentVedic = parseVedicData(profile.general_notes);
        currentVedic.measurements = updatedMeasurements;

        // Independent pixel-accurate distances, scaled to display units (0.04 = 4 units per 100px)
        const calculatedPalmLength   = parseFloat((px(updatedMeasurements.palm_start.x,  updatedMeasurements.palm_start.y,  updatedMeasurements.palm_end.x,    updatedMeasurements.palm_end.y)   * 0.04).toFixed(1));
        const calculatedFingerLength = parseFloat((px(updatedMeasurements.finger_start.x, updatedMeasurements.finger_start.y, updatedMeasurements.finger_end.x, updatedMeasurements.finger_end.y) * 0.04).toFixed(1));
        const calculatedPalmWidth    = parseFloat((px(updatedMeasurements.width_start.x,  updatedMeasurements.width_start.y,  updatedMeasurements.width_end.x,  updatedMeasurements.width_end.y)   * 0.04).toFixed(1));

        currentVedic.palm_length = calculatedPalmLength;
        currentVedic.finger_length = calculatedFingerLength;
        currentVedic.palm_width = calculatedPalmWidth;

        // Auto-classify shape: width / length >= 0.9 => Square, else Rectangular
        const shapeRatio = calculatedPalmWidth / Math.max(0.1, calculatedPalmLength);
        currentVedic.palm_shape = shapeRatio >= 0.9 ? 'Square' : 'Rectangular';

        // Auto-classify Hand Tattva
        const ratio = calculatedFingerLength / Math.max(0.1, calculatedPalmLength);
        let computedType = '';
        if (currentVedic.palm_shape === 'Rectangular') {
          if (ratio < 0.85) computedType = 'Agni Tattva (Fiery Hand)';
          else if (ratio >= 0.9) computedType = 'Jala Tattva (Watery Hand)';
          else computedType = 'Mixed Hand (Agni-Jala Blend)';
        } else {
          if (ratio < 0.85) computedType = 'Pṛthvī Tattva (Earthy Hand)';
          else if (ratio >= 0.9) computedType = 'Vāyu Tattva (Airy Hand)';
          else computedType = 'Mixed Hand (Air-Earth Blend)';
        }
        currentVedic.hand_tattva = computedType;

        onChangeProfile({
          ...profile,
          general_notes: serializeVedicData(currentVedic),
        });
      }
      return;
    }

    if (mode !== 'draw' || !isDrawing) return;
    const coords = getRelativeCoords(e);
    setCurrentPoints((prev) => [...prev, coords]);
  };

  const handleSvgMouseUp = () => {
    if (mode === 'measure') {
      setDraggingNode(null);
      return;
    }
    if (mode !== 'draw' || !isDrawing) return;
    setIsDrawing(false);
    if (currentPoints.length > 2) {
      const newDrawing: Drawing = {
        id: crypto.randomUUID(),
        view: activeView,
        points: currentPoints,
        color: currentColor,
        thickness: 3,
      };
      onChangeDrawings([...drawings, newDrawing]);
    }
    setCurrentPoints([]);
  };

  const handleSvgClick = (e: React.MouseEvent<any>) => {
    setSelectedDrawingId(null);
    if (mode === 'measure') return;
    if (mode !== 'pin' || !imageUrl) return;

    // Prevent trigger if clicking directly on an existing pin
    const target = e.target as SVGElement;
    if (target.closest('.annotation-pin-trigger')) return;

    const coords = getRelativeCoords(e);
    const newPin: Pin = {
      id: crypto.randomUUID(),
      view: activeView,
      x: coords.x,
      y: coords.y,
      label: 'New Marker',
      description: 'Enter notes about this sign/location.',
      color: currentColor,
    };

    onChangePins([...pins, newPin]);
    onSelectPin(newPin);
  };

  const handlePinClick = (pin: Pin, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectPin(pin);
    setSelectedDrawingId(null);
  };

  const removePin = (id: string) => {
    onChangePins(pins.filter((p) => p.id !== id));
    if (selectedPinId === id) onSelectPin(null);
  };

  const removeDrawing = (id: string) => {
    onChangeDrawings(drawings.filter((d) => d.id !== id));
  };

  const clearAllDrawingsForView = () => {
    if (confirm(`Clear all lines on the ${HAND_VIEW_LABELS[activeView]}?`)) {
      onChangeDrawings(drawings.filter((d) => d.view !== activeView));
    }
  };

  const clearAllPinsForView = () => {
    onChangePins(pins.filter((p) => p.view !== activeView));
    onSelectPin(null);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUploadImageForView(activeView, file);
    }
  };

  const handleSetMeasureMode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (mode === 'measure') {
      setMode('pin');
      return;
    }
    setMode('measure');
    if (profile && onChangeProfile) {
      const currentVedic = parseVedicData(profile.general_notes);
      if (!currentVedic.measurements) {
        currentVedic.measurements = { ...DEFAULT_MEASUREMENTS };
        
        // Use real container pixel dimensions so distances are accurate regardless of aspect ratio
        const initRect = containerRef.current?.getBoundingClientRect();
        const W = initRect?.width ?? 500;
        const H = initRect?.height ?? 600;
        const initPx = (ax: number, ay: number, bx: number, by: number) =>
          Math.sqrt(Math.pow((bx - ax) * W / 100, 2) + Math.pow((by - ay) * H / 100, 2));

        currentVedic.palm_length   = parseFloat((initPx(DEFAULT_MEASUREMENTS.palm_start.x,   DEFAULT_MEASUREMENTS.palm_start.y,   DEFAULT_MEASUREMENTS.palm_end.x,    DEFAULT_MEASUREMENTS.palm_end.y)   * 0.04).toFixed(1));
        currentVedic.finger_length = parseFloat((initPx(DEFAULT_MEASUREMENTS.finger_start.x, DEFAULT_MEASUREMENTS.finger_start.y, DEFAULT_MEASUREMENTS.finger_end.x, DEFAULT_MEASUREMENTS.finger_end.y) * 0.04).toFixed(1));
        currentVedic.palm_width    = parseFloat((initPx(DEFAULT_MEASUREMENTS.width_start.x,  DEFAULT_MEASUREMENTS.width_start.y,  DEFAULT_MEASUREMENTS.width_end.x,  DEFAULT_MEASUREMENTS.width_end.y)   * 0.04).toFixed(1));

        // Auto-classify shape: width / length >= 0.9 => Square, else Rectangular
        const shapeRatio = currentVedic.palm_width / Math.max(0.1, currentVedic.palm_length);
        currentVedic.palm_shape = shapeRatio >= 0.9 ? 'Square' : 'Rectangular';

        onChangeProfile({
          ...profile,
          general_notes: serializeVedicData(currentVedic),
        });
      }
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Hand View Selector Tab Header */}
      <div className="flex flex-wrap gap-1 border-b border-stone-200 pb-2">
        {VIEWS.map((view) => (
          <button
            key={view}
            onClick={() => {
              onChangeActiveView(view);
              onSelectPin(null);
              setSelectedDrawingId(null);
              if (mode === 'measure') {
                setMode('pin');
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${activeView === view
              ? 'bg-accent-gold text-white border-accent-gold shadow-sm'
              : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
          >
            {images[view] ? <Eye className="w-3.5 h-3.5" /> : null}
            {HAND_VIEW_LABELS[view]}
          </button>
        ))}
      </div>

      {imageUrl ? (
        <>
          {/* Toolbars */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMode('pin');
                }}
                className={`btn-outline px-3 py-2 text-xs flex items-center gap-1.5 ${mode === 'pin' ? 'border-accent-gold text-accent-gold bg-amber-500/5' : ''
                  }`}
                title="Place Pins (Click on hand to place markers)"
              >
                <MapPin className="w-4 h-4" />
                Place Pins
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMode('draw');
                }}
                className={`btn-outline px-3 py-2 text-xs flex items-center gap-1.5 ${mode === 'draw' ? 'border-accent-gold text-accent-gold bg-amber-500/5' : ''
                  }`}
                title="Draw Lines (Click & drag to trace palm lines)"
              >
                <Edit3 className="w-4 h-4" />
                Trace Lines
              </button>

              <button
                type="button"
                onClick={handleSetMeasureMode}
                className={`btn-outline px-3 py-2 text-xs flex items-center gap-1.5 ${mode === 'measure' ? 'border-accent-gold text-accent-gold bg-amber-500/5' : ''
                  }`}
                title="Measure Hand (Align handles to calculate finger/palm ratio)"
                disabled={!profile}
              >
                <Ruler className="w-4 h-4" />
                Measure Hand
              </button>
            </div>

            {/* Color Palette */}
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-stone-500" />
              <div className="flex gap-1.5">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentColor(color.value);
                    }}
                    className="relative w-6 h-6 rounded-full flex items-center justify-center border border-stone-200 transition-transform active:scale-95 shadow-sm"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {currentColor === color.value && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedDrawingId && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeDrawing(selectedDrawingId);
                    setSelectedDrawingId(null);
                  }}
                  className="btn-outline border-rose-500 text-rose-600 hover:bg-rose-50 px-3 py-2 text-xs flex items-center gap-1.5 font-bold transition-all shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Selected Line
                </button>
              )}

              {confirmClear ? (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-lg p-1 animate-pulse">
                  <span className="text-[10px] text-rose-700 font-bold px-1">Clear all lines?</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onChangeDrawings(drawings.filter((d) => d.view !== activeView));
                      setConfirmClear(false);
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 text-[10px] font-bold rounded shadow-sm"
                  >
                    Yes, Clear
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setConfirmClear(false);
                    }}
                    className="text-stone-500 hover:text-stone-700 px-2 py-1 text-[10px] font-bold rounded"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setConfirmClear(true);
                    setTimeout(() => setConfirmClear(false), 5000);
                  }}
                  className="btn-outline border-rose-200 text-rose-600 hover:bg-rose-50 px-3 py-2 text-xs flex items-center gap-1"
                  disabled={visibleDrawings.length === 0}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear View Lines
                </button>
              )}

              {confirmClearPins ? (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-lg p-1 animate-pulse">
                  <span className="text-[10px] text-rose-700 font-bold px-1">Clear all markers?</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      clearAllPinsForView();
                      setConfirmClearPins(false);
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 text-[10px] font-bold rounded shadow-sm"
                  >
                    Yes, Clear
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setConfirmClearPins(false);
                    }}
                    className="text-stone-500 hover:text-stone-700 px-2 py-1 text-[10px] font-bold rounded"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setConfirmClearPins(true);
                    setTimeout(() => setConfirmClearPins(false), 5000);
                  }}
                  className="btn-outline border-rose-200 text-rose-600 hover:bg-rose-50 px-3 py-2 text-xs flex items-center gap-1"
                  disabled={visiblePins.length === 0}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear View Pins
                </button>
              )}

              {confirmRemovePhoto ? (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-lg p-1 animate-pulse">
                  <span className="text-[10px] text-rose-700 font-bold px-1">Remove photo?</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemoveImageForView(activeView);
                      setConfirmRemovePhoto(false);
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 text-[10px] font-bold rounded shadow-sm"
                  >
                    Yes, Remove
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setConfirmRemovePhoto(false);
                    }}
                    className="text-stone-500 hover:text-stone-700 px-2 py-1 text-[10px] font-bold rounded"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setConfirmRemovePhoto(true);
                    setTimeout(() => setConfirmRemovePhoto(false), 5000);
                  }}
                  className="btn-outline border-rose-200 text-rose-600 hover:bg-rose-50 px-3 py-2 text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Photo
                </button>
              )}
            </div>
          </div>

          {/* Canvas Area */}
          <div
            ref={containerRef}
            className="canvas-wrapper flex-1 relative min-h-[400px] shadow-sm select-none border border-stone-200 rounded-xl bg-stone-50/50"
            onMouseMove={handleSvgMouseMove}
            onMouseUp={handleSvgMouseUp}
            onMouseLeave={() => setDraggingNode(null)}
          >
            {/* The Base Hand Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={HAND_VIEW_LABELS[activeView]}
              className="w-full h-full object-contain pointer-events-none max-h-[70vh]"
            />

            {/* SVG Drawing Layer & Interactions */}
            <svg
              className="canvas-element"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              onMouseDown={handleSvgMouseDown}
              onClick={handleSvgClick}
            >
              {/* Render already drawn lines */}
              {visibleDrawings.map((drawing) => {
                const pointsString = drawing.points
                  .map((p) => `${p.x},${p.y}`)
                  .join(' ');
                const isSelected = selectedDrawingId === drawing.id;
                return (
                  <g key={drawing.id} className="group cursor-pointer">
                    {/* Glowing highlight under selected line */}
                    {isSelected && (
                      <polyline
                        points={pointsString}
                        fill="none"
                        stroke="#f59e0b" // gold/amber glow
                        strokeWidth={drawing.thickness + 4}
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-pulse"
                        style={{
                          filter: 'blur(2px)',
                          opacity: 0.8,
                        }}
                      />
                    )}
                    <polyline
                      points={pointsString}
                      fill="none"
                      stroke={isSelected ? '#d97706' : drawing.color} // amber-600 when selected
                      strokeWidth={drawing.thickness}
                      vectorEffect="non-scaling-stroke"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all"
                      style={{
                        filter: isSelected
                          ? 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.4))'
                          : `drop-shadow(0 1px 2px rgba(0,0,0,0.15))`,
                      }}
                    />
                    {/* Thick overlay for easy selection */}
                    <polyline
                      points={pointsString}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={15}
                      vectorEffect="non-scaling-stroke"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      onMouseUp={(e) => {
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDrawingId(isSelected ? null : drawing.id);
                        onSelectPin(null);
                      }}
                      className="hover:stroke-rose-500/5 cursor-pointer"
                    >
                      <title>{isSelected ? 'Selected line' : 'Click to select this line'}</title>
                    </polyline>
                  </g>
                );
              })}

              {/* Render current drawing path */}
              {isDrawing && currentPoints.length > 0 && (
                <polyline
                  points={currentPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={currentColor}
                  strokeWidth={3}
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Measurement Mode Overlay */}
              {mode === 'measure' && measurements && (
                <g className="measurement-overlay">
                  {/* Palm Height Line */}
                  <line
                    x1={measurements.palm_start.x}
                    y1={measurements.palm_start.y}
                    x2={measurements.palm_end.x}
                    y2={measurements.palm_end.y}
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeDasharray="1.5,1.5"
                    vectorEffect="non-scaling-stroke"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
                  />
                  {/* Palm Width Line */}
                  <line
                    x1={measurements.width_start?.x ?? DEFAULT_MEASUREMENTS.width_start.x}
                    y1={measurements.width_start?.y ?? DEFAULT_MEASUREMENTS.width_start.y}
                    x2={measurements.width_end?.x ?? DEFAULT_MEASUREMENTS.width_end.x}
                    y2={measurements.width_end?.y ?? DEFAULT_MEASUREMENTS.width_end.y}
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="1.5,1.5"
                    vectorEffect="non-scaling-stroke"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
                  />
                  {/* Finger Length Line */}
                  <line
                    x1={measurements.finger_start.x}
                    y1={measurements.finger_start.y}
                    x2={measurements.finger_end.x}
                    y2={measurements.finger_end.y}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="1.5,1.5"
                    vectorEffect="non-scaling-stroke"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
                  />

                  {/* Line Labels */}
                  <rect
                    x={((measurements.palm_start.x + measurements.palm_end.x) / 2) - 5}
                    y={((measurements.palm_start.y + measurements.palm_end.y) / 2) - 1.5}
                    width="10"
                    height="3.0"
                    rx="0.6"
                    fill="#3b82f6"
                    opacity="0.85"
                  />
                  <text
                    x={(measurements.palm_start.x + measurements.palm_end.x) / 2}
                    y={((measurements.palm_start.y + measurements.palm_end.y) / 2) + 0.4}
                    fill="white"
                    fontSize="0.85"
                    fontWeight="bold"
                    textAnchor="middle"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    Palm: {displayPalmLength} units
                  </text>

                  <rect
                    x={((measurements.finger_start.x + measurements.finger_end.x) / 2) - 5}
                    y={((measurements.finger_start.y + measurements.finger_end.y) / 2) - 1.5}
                    width="10"
                    height="3.0"
                    rx="0.6"
                    fill="#10b981"
                    opacity="0.85"
                  />
                  <text
                    x={(measurements.finger_start.x + measurements.finger_end.x) / 2}
                    y={((measurements.finger_start.y + measurements.finger_end.y) / 2) + 0.4}
                    fill="white"
                    fontSize="0.95"
                    fontWeight="bold"
                    textAnchor="middle"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    Finger: {vedicData?.finger_length || '0.0'} units
                  </text>

                  <rect
                    x={(((measurements.width_start?.x ?? DEFAULT_MEASUREMENTS.width_start.x) + (measurements.width_end?.x ?? DEFAULT_MEASUREMENTS.width_end.x)) / 2) - 5}
                    y={(((measurements.width_start?.y ?? DEFAULT_MEASUREMENTS.width_start.y) + (measurements.width_end?.y ?? DEFAULT_MEASUREMENTS.width_end.y)) / 2) - 1.5}
                    width="10"
                    height="3.0"
                    rx="0.6"
                    fill="#f59e0b"
                    opacity="0.85"
                  />
                  <text
                    x={((measurements.width_start?.x ?? DEFAULT_MEASUREMENTS.width_start.x) + (measurements.width_end?.x ?? DEFAULT_MEASUREMENTS.width_end.x)) / 2}
                    y={(((measurements.width_start?.y ?? DEFAULT_MEASUREMENTS.width_start.y) + (measurements.width_end?.y ?? DEFAULT_MEASUREMENTS.width_end.y)) / 2) + 0.4}
                    fill="white"
                    fontSize="0.95"
                    fontWeight="bold"
                    textAnchor="middle"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    Width: {vedicData?.palm_width || '0.0'} units
                  </text>

                </g>
              )}
            </svg>

            {/* Live Vedic Tattva Ratio HUD Overlay */}
            {mode === 'measure' && measurements && vedicData && (
              <div className="absolute top-4 left-4 bg-stone-900/95 backdrop-blur border border-stone-800 text-white rounded-xl p-3.5 shadow-2xl z-30 text-xs space-y-2 font-sans w-52 pointer-events-none select-none">
                <div className="flex items-center gap-1.5 text-accent-gold font-bold">
                  <Sparkles className="w-4 h-4 text-accent-gold" />
                  Vedic Tattva Analysis
                </div>
                <div className="text-[10px] text-stone-400 leading-normal">
                  Align nodes to measure palm height, width, and finger length:
                </div>
                <div className="space-y-1.5 pt-1 border-t border-stone-800">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-stone-400">Palm Height:</span>
                    <span className="font-mono font-bold text-blue-400">{displayPalmLength} units</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-stone-450">Palm Width:</span>
                    <span className="font-mono font-bold text-amber-500">{vedicData.palm_width || '0.0'} units</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-stone-455">Finger Length:</span>
                    <span className="font-mono font-bold text-emerald-450">{vedicData.finger_length || '0.0'} units</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-stone-800/50">
                    <span className="text-stone-400">Palm Shape:</span>
                    <span className="font-mono font-bold text-purple-400">{vedicData.palm_shape || 'Calculating...'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-0.5">
                    <span className="font-bold text-stone-300 font-serif">Tattva Ratio:</span>
                    <span className="font-mono font-bold text-accent-gold">
                      {vedicData.finger_length
                        ? (Number(vedicData.finger_length) / displayPalmLength).toFixed(2)
                        : '0.00'}
                    </span>
                  </div>
                </div>
                {vedicData.hand_tattva && (
                  <div className="mt-2 text-[10px] bg-amber-500/15 text-accent-gold font-bold px-2.5 py-1 rounded text-center border border-amber-500/25">
                    ✨ {vedicData.hand_tattva}
                  </div>
                )}
                {vedicData.hand_type && (
                  <div className="mt-1 text-[10px] bg-purple-500/15 text-purple-300 font-bold px-2.5 py-1 rounded text-center border border-purple-500/25">
                    ✋ {vedicData.hand_type}
                  </div>
                )}
              </div>
            )}

            {/* Measurement Handles (HTML Overlay to prevent aspect ratio stretching) */}
            {mode === 'measure' && measurements && (
              <>
                {/* Palm Start (Wrist Crease) */}
                <div
                  className="absolute cursor-move z-20 group"
                  style={{
                    left: `${measurements.palm_start.x}%`,
                    top: `${measurements.palm_start.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggingNode('palm_start');
                  }}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-md transition-transform duration-150 hover:scale-125 active:scale-110 flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full" />
                  </div>
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 pointer-events-none bg-stone-900/90 text-white text-[8px] font-bold px-1 py-0.5 rounded shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    Wrist Base
                  </div>
                </div>

                {/* Junction Node (Base of Middle Finger) */}
                <div
                  className="absolute cursor-move z-30 group"
                  style={{
                    left: `${measurements.palm_end.x}%`,
                    top: `${measurements.palm_end.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggingNode('palm_end');
                  }}
                >
                  <div className="w-4 h-4 rounded-full bg-indigo-600 border-2 border-white shadow-md transition-transform duration-150 hover:scale-125 active:scale-110 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  </div>
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 pointer-events-none bg-stone-900/90 text-white text-[8px] font-bold px-1 py-0.5 rounded shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    Finger Base
                  </div>
                </div>

                {/* Finger End (Middle Finger Tip) */}
                <div
                  className="absolute cursor-move z-20 group"
                  style={{
                    left: `${measurements.finger_end.x}%`,
                    top: `${measurements.finger_end.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggingNode('finger_end');
                  }}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-md transition-transform duration-150 hover:scale-125 active:scale-110 flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full" />
                  </div>
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 pointer-events-none bg-stone-900/90 text-white text-[8px] font-bold px-1 py-0.5 rounded shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    Finger Tip
                  </div>
                </div>

                {/* Palm Width Left (width_start) */}
                <div
                  className="absolute cursor-move z-20 group"
                  style={{
                    left: `${measurements.width_start?.x ?? DEFAULT_MEASUREMENTS.width_start.x}%`,
                    top: `${measurements.width_start?.y ?? DEFAULT_MEASUREMENTS.width_start.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggingNode('width_start');
                  }}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-md transition-transform duration-150 hover:scale-125 active:scale-110 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 pointer-events-none bg-stone-900/90 text-white text-[8px] font-bold px-1 py-0.5 rounded shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    Left Palm Edge
                  </div>
                </div>

                {/* Palm Width Right (width_end) */}
                <div
                  className="absolute cursor-move z-20 group"
                  style={{
                    left: `${measurements.width_end?.x ?? DEFAULT_MEASUREMENTS.width_end.x}%`,
                    top: `${measurements.width_end?.y ?? DEFAULT_MEASUREMENTS.width_end.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggingNode('width_end');
                  }}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-md transition-transform duration-150 hover:scale-125 active:scale-110 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 pointer-events-none bg-stone-900/90 text-white text-[8px] font-bold px-1 py-0.5 rounded shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    Right Palm Edge
                  </div>
                </div>
              </>
            )}

            {/* Marker Pins Overlay */}
            {visiblePins.map((pin) => (
              <div
                key={pin.id}
                className="absolute annotation-pin-trigger group z-20"
                style={{
                  left: `${pin.x}%`,
                  top: `${pin.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* The Dropped Pin Icon */}
                <div
                  onClick={(e) => handlePinClick(pin, e)}
                  className={`w-4.5 h-4.5 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 border border-white shadow ${selectedPinId === pin.id
                    ? 'scale-125 ring-2 ring-offset-1 ring-offset-white ring-accent-gold shadow-md'
                    : 'hover:scale-110 shadow-sm'
                    }`}
                  style={{ backgroundColor: pin.color }}
                  title={pin.label}
                >
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>

                {/* Float Badge Tooltip */}
                <div className={`absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none bg-stone-900/90 backdrop-blur px-2 py-0.5 rounded text-[9px] font-medium tracking-wide whitespace-nowrap text-white shadow-md z-30 transition-all duration-200 ${selectedPinId === pin.id
                  ? 'opacity-100 translate-y-0 visible'
                  : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible invisible'
                  }`}>
                  {pin.label}
                </div>

                {/* Quick delete indicator */}
                {selectedPinId === pin.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePin(pin.id);
                    }}
                    className="absolute -top-4 -right-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-0.5 border border-white transition-transform active:scale-95 shadow-md z-40"
                    title="Remove marker"
                  >
                    <span className="block text-[8px] px-1 font-bold">Delete</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="text-center text-xs text-stone-500 font-medium">
            {mode === 'pin'
              ? `Pin Mode: Click on the ${HAND_VIEW_LAB_ATTR(activeView)} to drop an analytical marker.`
              : mode === 'draw'
                ? `Trace Mode: Click and drag to draw lines along lines and mounts.`
                : `Measure Mode: Drag the Blue line (Palm Height) and Green line (Finger Length) endpoints to align them on the hand photo.`}
          </div>
        </>
      ) : (
        /* Upload Photo Placeholder */
        <div className="flex-1 min-h-[400px] border-2 border-dashed border-stone-250 bg-stone-50/50 rounded-xl flex flex-col items-center justify-center p-6 text-center gap-4">
          {isUploading ? (
            <div className="space-y-3">
              <div className="w-10 h-10 border-4 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-accent-gold">Uploading view photo...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-stone-800 text-sm">No Photo for {HAND_VIEW_LABELS[activeView]}</h3>
                <p className="text-stone-500 text-xs mt-1 max-w-xs mx-auto">
                  Upload a hand photo for this specific view to trace lines and add markers.
                </p>
              </div>
              <label className="btn-gold text-xs px-4 py-2.5 cursor-pointer shadow">
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Quick helper
function HAND_VIEW_LAB_ATTR(view: HandView): string {
  return view.includes('palm') ? 'palm' : 'back of hand';
}
