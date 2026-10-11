'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Edit3,
  RotateCcw,
  RotateCw,
  Palette,
  UploadCloud,
  Eye,
  EyeOff,
  Trash2,
  Ruler,
  Sparkles,
  Hand,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Clock,
  Calendar,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  Pin,
  Drawing,
  HandView,
  HAND_VIEW_LABELS,
  HandProfile,
  parseVedicData,
  serializeVedicData,
  VedicData,
  LineAnalysisData,
} from '@/lib/supabase';
import {
  AgingMethod,
  LineCategory,
  AGING_METHODS,
  LINE_LABELS,
  computeAgeTicks,
  getNearestPointOnPolyline,
  calculatePolylineLength,
  getAgeForFraction,
  Point2D,
} from '@/lib/agingCalculator';
import ConfirmModal from './ConfirmModal';

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
  onUploadImageForView: (view: HandView | 'd1_chart', file: File) => Promise<void>;
  onRemoveImageForView: (view: HandView | 'd1_chart') => void;
  isUploading: boolean;
  profile?: HandProfile;
  onChangeProfile?: (profile: HandProfile) => void;
}

interface CanvasHistoryEntry {
  drawings: Drawing[];
  pins: Pin[];
  measurements?: VedicData['measurements'];
}

const COLORS = [
  { name: 'Gold', value: '#b88d21' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Red', value: '#e11d48' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'White', value: '#f8fafc' },
];

const THICKNESS_OPTIONS = [
  { label: 'Fine', value: 1.8, desc: '1.8px (Fine creases & signs)' },
  { label: 'Med', value: 3.2, desc: '3.2px (Standard lines)' },
  { label: 'Bold', value: 5.5, desc: '5.5px (Mounts & major paths)' },
];

const FILTERS = [
  { id: 'normal', label: 'Normal', icon: '🎨' },
  { id: 'contrast', label: 'High Contrast', icon: '⚡' },
  { id: 'bw', label: 'Forensic B&W', icon: '🔬' },
  { id: 'invert', label: 'Inverted Relief', icon: '🌓' },
] as const;

type ImageFilterId = typeof FILTERS[number]['id'];

const IMAGE_FILTER_MAP: Record<ImageFilterId, string> = {
  normal: 'none',
  contrast: 'contrast(1.45) saturate(1.2) brightness(0.98)',
  bw: 'grayscale(1) contrast(1.7) brightness(1.02)',
  invert: 'invert(1) grayscale(1) contrast(1.4)',
};

const VIEWS: HandView[] = ['right_palm', 'right_back', 'left_palm', 'left_back', 'd1_chart'];

const DEFAULT_MEASUREMENTS = {
  palm_start: { x: 50, y: 70 },
  palm_end: { x: 50, y: 45 },
  finger_start: { x: 50, y: 45 },
  finger_end: { x: 50, y: 20 },
  width_start: { x: 35, y: 58 },
  width_end: { x: 65, y: 58 },
};

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
  const containerWrapperRef = useRef<HTMLDivElement>(null);

  // Tools & Styling
  const [mode, setMode] = useState<'pin' | 'draw' | 'pan' | 'measure' | 'aging'>('pin');
  const [currentColor, setCurrentColor] = useState('#b88d21');
  const [thickness, setThickness] = useState<number>(3.2);
  const [strokeStyle, setStrokeStyle] = useState<'solid' | 'dashed'>('solid');
  const [imageFilter, setImageFilter] = useState<ImageFilterId>('normal');
  const [showLayers, setShowLayers] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedSignificantlyRef = useRef(false);
  const touchDistanceRef = useRef<number | null>(null);
  const touchMidpointRef = useRef<{ x: number; y: number } | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const scrollHintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Measurement handle drag
  const [draggingNode, setDraggingNode] = useState<
    'palm_start' | 'palm_end' | 'finger_start' | 'finger_end' | 'width_start' | 'width_end' | null
  >(null);
  const measurementModifiedRef = useRef(false);

  // Aging Tool & Calibrator state
  const [agingMethod, setAgingMethod] = useState<AgingMethod>('30-midpoint');
  const [agingLineCategory, setAgingLineCategory] = useState<LineCategory>('line_life');
  const [selectedAgingDrawingId, setSelectedAgingDrawingId] = useState<string | null>(null);
  const [showAllMethodsComparison, setShowAllMethodsComparison] = useState(false);
  const [showArvindJiAxialGrid, setShowArvindJiAxialGrid] = useState(false);
  const [axialGrid, setAxialGrid] = useState<{
    wrist: Point2D;
    midpoint: Point2D;
    saturn: Point2D;
    jupiter: Point2D;
  }>({
    wrist: { x: 50, y: 88 },
    midpoint: { x: 50, y: 52 },
    saturn: { x: 50, y: 22 },
    jupiter: { x: 38, y: 23 },
  });
  const returnToAgingAfterTraceRef = useRef(false);
  const [draggingAxialNode, setDraggingAxialNode] = useState<
    'wrist' | 'midpoint' | 'saturn' | 'jupiter' | null
  >(null);
  const [hoveredAgeData, setHoveredAgeData] = useState<{
    age: number;
    point: Point2D;
    fraction: number;
    label: string;
  } | null>(null);
  const [ageEventModal, setAgeEventModal] = useState<{
    isOpen: boolean;
    age: number;
    point: Point2D;
    lineCategory: LineCategory;
    sign: string;
    note: string;
  } | null>(null);

  // Modals & confirmation
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmClearPins, setConfirmClearPins] = useState(false);
  const [confirmRemovePhoto, setConfirmRemovePhoto] = useState(false);
  const [showClearDrawingsConfirm, setShowClearDrawingsConfirm] = useState(false);

  const vedicData = profile ? parseVedicData(profile.general_notes) : null;
  const measurements = vedicData?.measurements;
  const imageUrl = images[activeView] || '';

  // ─── Universal Undo / Redo History Stack ───
  const [history, setHistory] = useState<CanvasHistoryEntry[]>(() => [
    {
      drawings: [...drawings],
      pins: [...pins],
      measurements: measurements ? { ...measurements } : undefined,
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const isUndoRedoActionRef = useRef(false);

  // Push a state change to the history stack
  const pushHistory = useCallback(
    (newDrawings: Drawing[], newPins: Pin[], newMeasurements?: VedicData['measurements']) => {
      if (isUndoRedoActionRef.current) return;
      const entry: CanvasHistoryEntry = {
        drawings: [...newDrawings],
        pins: [...newPins],
        measurements:
          newMeasurements ??
          (measurements ? { ...measurements } : undefined),
      };

      setHistory((prev) => {
        const nextBase = prev.slice(0, historyIndex + 1);
        const updated = [...nextBase, entry];
        return updated.slice(-40); // Keep last 40 actions
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 39));
    },
    [historyIndex, measurements]
  );

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    const targetIndex = historyIndex - 1;
    const targetEntry = history[targetIndex];
    if (!targetEntry) return;

    isUndoRedoActionRef.current = true;
    setHistoryIndex(targetIndex);
    onChangeDrawings(targetEntry.drawings);
    onChangePins(targetEntry.pins);
    setSelectedDrawingId(null);
    onSelectPin(null);

    if (targetEntry.measurements && profile && onChangeProfile) {
      const v = parseVedicData(profile.general_notes);
      v.measurements = targetEntry.measurements;
      onChangeProfile({
        ...profile,
        general_notes: serializeVedicData(v),
      });
    }

    setTimeout(() => {
      isUndoRedoActionRef.current = false;
    }, 50);
  }, [canUndo, history, historyIndex, onChangeDrawings, onChangePins, onSelectPin, profile, onChangeProfile]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    const targetIndex = historyIndex + 1;
    const targetEntry = history[targetIndex];
    if (!targetEntry) return;

    isUndoRedoActionRef.current = true;
    setHistoryIndex(targetIndex);
    onChangeDrawings(targetEntry.drawings);
    onChangePins(targetEntry.pins);
    setSelectedDrawingId(null);
    onSelectPin(null);

    if (targetEntry.measurements && profile && onChangeProfile) {
      const v = parseVedicData(profile.general_notes);
      v.measurements = targetEntry.measurements;
      onChangeProfile({
        ...profile,
        general_notes: serializeVedicData(v),
      });
    }

    setTimeout(() => {
      isUndoRedoActionRef.current = false;
    }, 50);
  }, [canRedo, history, historyIndex, onChangeDrawings, onChangePins, onSelectPin, profile, onChangeProfile]);

  // Global Keyboard shortcuts (Ctrl+Z, Space to Pan, Delete, Escape, H to peek)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable ||
          target.closest('input, textarea, select, [contenteditable="true"]'))
      ) {
        return;
      }

      // Undo: Cmd+Z (Mac) or Ctrl+Z (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo: Cmd+Shift+Z or Ctrl+Shift+Z or Ctrl+Y
      else if (
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && e.shiftKey) ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        handleRedo();
      }
      // Spacebar: enable temporary pan mode without scrolling the page
      else if (e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat) {
          setIsSpacePressed(true);
        }
      }
      // Delete / Backspace: delete currently selected line or pin
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedDrawingId) {
          e.preventDefault();
          const next = drawings.filter((d) => d.id !== selectedDrawingId);
          onChangeDrawings(next);
          pushHistory(next, pins);
          setSelectedDrawingId(null);
        } else if (selectedPinId) {
          e.preventDefault();
          const next = pins.filter((p) => p.id !== selectedPinId);
          onChangePins(next);
          pushHistory(drawings, next);
          onSelectPin(null);
        }
      }
      // Escape: clear selection
      else if (e.key === 'Escape') {
        setSelectedDrawingId(null);
        onSelectPin(null);
      }
      // H key: Toggle peek at clean hand
      else if (e.key.toLowerCase() === 'h' && !e.metaKey && !e.ctrlKey) {
        setShowLayers((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    handleUndo,
    handleRedo,
    selectedDrawingId,
    selectedPinId,
    drawings,
    pins,
    onChangeDrawings,
    onChangePins,
    pushHistory,
    onSelectPin,
  ]);

  // Fullscreen change listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerWrapperRef.current) return;
    if (!document.fullscreenElement) {
      containerWrapperRef.current.requestFullscreen().catch(() => { });
    } else {
      document.exitFullscreen().catch(() => { });
    }
  };

  // Clean switch view helper
  const handleSwitchView = (view: HandView) => {
    onChangeActiveView(view);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedDrawingId(null);
    onSelectPin(null);
    if (mode === 'measure') setMode('pin');
  };

  // Pixel distance calculation
  const pxDist = (ax: number, ay: number, bx: number, by: number): number => {
    const W = 500;
    const H = 600;
    return Math.sqrt(Math.pow(((bx - ax) * W) / 100, 2) + Math.pow(((by - ay) * H) / 100, 2));
  };

  const displayPalmLength = measurements
    ? parseFloat(
      (
        pxDist(
          measurements.palm_start.x,
          measurements.palm_start.y,
          measurements.palm_end.x,
          measurements.palm_end.y
        ) * 0.04
      ).toFixed(1)
    )
    : 10.0;

  // Local filter for selected hand view
  const visiblePins = pins.filter((p) => p.view === activeView);
  const visibleDrawings = drawings.filter((d) => d.view === activeView);

  // ─── Inverted Zoom/Pan Coordinates Calculation (0 to 100%) ───
  const getPointCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const offsetX = clientX - rect.left;
      const offsetY = clientY - rect.top;

      // Invert pan and zoom
      const contentX = (offsetX - pan.x) / zoom;
      const contentY = (offsetY - pan.y) / zoom;

      const x = (contentX / rect.width) * 100;
      const y = (contentY / rect.height) * 100;

      return {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      };
    },
    [pan, zoom]
  );

  // ─── Zoom Controls (1x to 4.5x) ───
  const clampPan = (newPanX: number, newPanY: number, currentZoom: number) => {
    if (!containerRef.current) return { x: newPanX, y: newPanY };
    const rect = containerRef.current.getBoundingClientRect();
    if (currentZoom <= 1.02) return { x: 0, y: 0 };

    const maxPanX = rect.width * 0.85;
    const minPanX = -rect.width * (currentZoom - 0.15);
    const maxPanY = rect.height * 0.85;
    const minPanY = -rect.height * (currentZoom - 0.15);

    return {
      x: Math.min(maxPanX, Math.max(minPanX, newPanX)),
      y: Math.min(maxPanY, Math.max(minPanY, newPanY)),
    };
  };

  const handleZoomIn = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const newZoom = Math.min(4.5, zoom * 1.3);
    const scaleChange = newZoom / zoom;
    const nextPan = clampPan(
      centerX - (centerX - pan.x) * scaleChange,
      centerY - (centerY - pan.y) * scaleChange,
      newZoom
    );
    setZoom(newZoom);
    setPan(nextPan);
  };

  const handleZoomOut = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const newZoom = Math.max(1, zoom / 1.3);

    if (newZoom <= 1.05) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }
    const scaleChange = newZoom / zoom;
    const nextPan = clampPan(
      centerX - (centerX - pan.x) * scaleChange,
      centerY - (centerY - pan.y) * scaleChange,
      newZoom
    );
    setZoom(newZoom);
    setPan(nextPan);
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Wheel zoom towards cursor (Only when holding Cmd/Ctrl, trackpad pinching, or in Fullscreen)
  const handleWheel = (e: React.WheelEvent) => {
    // Zoom if:
    // 1. In Fullscreen mode
    // 2. OR holding Cmd / Ctrl
    // 3. OR trackpad pinch gesture (macOS trackpad pinch natively sets e.ctrlKey = true)
    const isPinchOrCmd = e.ctrlKey || e.metaKey;

    if (!isPinchOrCmd && !isFullscreen) {
      // Allow natural page scrolling! Do NOT preventDefault!
      if (!showScrollHint) {
        setShowScrollHint(true);
        if (scrollHintTimeoutRef.current) clearTimeout(scrollHintTimeoutRef.current);
        scrollHintTimeoutRef.current = setTimeout(() => setShowScrollHint(false), 1600);
      }
      return;
    }

    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
    const newZoom = Math.min(Math.max(1, zoom * zoomFactor), 4.5);

    if (newZoom <= 1.02) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }

    const scaleChange = newZoom / zoom;
    const nextPan = clampPan(
      offsetX - (offsetX - pan.x) * scaleChange,
      offsetY - (offsetY - pan.y) * scaleChange,
      newZoom
    );
    setZoom(newZoom);
    setPan(nextPan);
  };

  // ─── Interaction Handlers (Mouse & Touch) ───
  const isPanActive = mode === 'pan' || isSpacePressed;

  const handleMouseDown = (e: React.MouseEvent) => {
    hasMovedSignificantlyRef.current = false;
    // Middle click, pan mode, or spacebar held
    if (e.button === 1 || isPanActive) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    if (mode === 'measure' || mode === 'aging') return;

    if (mode === 'draw' && imageUrl) {
      setIsDrawing(true);
      const coords = getPointCoords(e.clientX, e.clientY);
      setCurrentPoints([coords]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      hasMovedSignificantlyRef.current = true;
      const nextX = e.clientX - panStartRef.current.x;
      const nextY = e.clientY - panStartRef.current.y;
      setPan(clampPan(nextX, nextY, zoom));
      return;
    }

    if (mode === 'measure') {
      const coords = getPointCoords(e.clientX, e.clientY);
      handleMeasurementDrag(coords);
      return;
    }

    if (mode === 'aging') {
      const coords = getPointCoords(e.clientX, e.clientY);
      if (draggingAxialNode) {
        setAxialGrid((prev) => ({ ...prev, [draggingAxialNode]: coords }));
        return;
      }
      if (activeAgingDrawing && activeAgingDrawing.points.length > 1) {
        const nearest = getNearestPointOnPolyline(activeAgingDrawing.points, coords);
        const hoverThreshold = Math.max(4.5, 7.0 / zoom);
        if (nearest && nearest.distance < hoverThreshold) {
          const age = getAgeForFraction(
            agingMethod,
            nearest.fraction,
            activeAgingDrawing.lineCategory || agingLineCategory,
            vedicData?.max_age ?? 75
          );
          setHoveredAgeData({
            age,
            point: nearest.point,
            fraction: nearest.fraction,
            label: `Age ~${age} yrs`,
          });
          return;
        }
      }
      if (hoveredAgeData) setHoveredAgeData(null);
      return;
    }

    if (mode === 'draw' && isDrawing) {
      hasMovedSignificantlyRef.current = true;
      const coords = getPointCoords(e.clientX, e.clientY);
      setCurrentPoints((prev) => [...prev, coords]);
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    handleEndInteraction();
  };

  // Touch handlers (including 2-finger pinch-zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    hasMovedSignificantlyRef.current = false;

    // Two finger pinch / pan
    if (e.touches.length === 2) {
      setIsDrawing(false);
      setCurrentPoints([]);
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      touchDistanceRef.current = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchMidpointRef.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
      return;
    }

    // Single touch
    if (e.touches.length === 1) {
      if (isPanActive) {
        setIsPanning(true);
        panStartRef.current = {
          x: e.touches[0].clientX - pan.x,
          y: e.touches[0].clientY - pan.y,
        };
        return;
      }

      if (mode === 'measure') return;

      if (mode === 'draw' && imageUrl) {
        setIsDrawing(true);
        const coords = getPointCoords(e.touches[0].clientX, e.touches[0].clientY);
        setCurrentPoints([coords]);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Two-finger pinch-zoom & pan
    if (e.touches.length === 2 && touchDistanceRef.current !== null && touchMidpointRef.current !== null) {
      e.preventDefault();
      hasMovedSignificantlyRef.current = true;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const newDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const newMid = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const factor = newDist / touchDistanceRef.current;
      const newZoom = Math.min(Math.max(1, zoom * factor), 4.5);

      const midDeltaX = newMid.x - touchMidpointRef.current.x;
      const midDeltaY = newMid.y - touchMidpointRef.current.y;

      if (newZoom <= 1.02) {
        setZoom(1);
        setPan({ x: 0, y: 0 });
      } else {
        const offsetX = newMid.x - rect.left;
        const offsetY = newMid.y - rect.top;
        const scaleChange = newZoom / zoom;
        const nextX = offsetX - (offsetX - pan.x) * scaleChange + midDeltaX;
        const nextY = offsetY - (offsetY - pan.y) * scaleChange + midDeltaY;
        setZoom(newZoom);
        setPan(clampPan(nextX, nextY, newZoom));
      }

      touchDistanceRef.current = newDist;
      touchMidpointRef.current = newMid;
      return;
    }

    // Single finger
    if (e.touches.length === 1) {
      if (isPanning) {
        hasMovedSignificantlyRef.current = true;
        const nextX = e.touches[0].clientX - panStartRef.current.x;
        const nextY = e.touches[0].clientY - panStartRef.current.y;
        setPan(clampPan(nextX, nextY, zoom));
        return;
      }

      const coords = getPointCoords(e.touches[0].clientX, e.touches[0].clientY);

      if (mode === 'measure') {
        handleMeasurementDrag(coords);
        return;
      }

      if (mode === 'aging') {
        if (draggingAxialNode) {
          setAxialGrid((prev) => ({ ...prev, [draggingAxialNode]: coords }));
          return;
        }
        if (activeAgingDrawing && activeAgingDrawing.points.length > 1) {
          const nearest = getNearestPointOnPolyline(activeAgingDrawing.points, coords);
          const hoverThreshold = Math.max(5.0, 7.5 / zoom);
          if (nearest && nearest.distance < hoverThreshold) {
            const age = getAgeForFraction(
              agingMethod,
              nearest.fraction,
              activeAgingDrawing.lineCategory || agingLineCategory,
              vedicData?.max_age ?? 75
            );
            setHoveredAgeData({
              age,
              point: nearest.point,
              fraction: nearest.fraction,
              label: `Age ~${age} yrs`,
            });
            return;
          }
        }
        if (hoveredAgeData) setHoveredAgeData(null);
        return;
      }

      if (mode === 'draw' && isDrawing) {
        hasMovedSignificantlyRef.current = true;
        setCurrentPoints((prev) => [...prev, coords]);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchDistanceRef.current !== null) {
      touchDistanceRef.current = null;
      touchMidpointRef.current = null;
    }
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    // Handle pin placement on quick touch tap
    if (
      mode === 'pin' &&
      imageUrl &&
      !hasMovedSignificantlyRef.current &&
      e.changedTouches.length === 1 &&
      !isDrawing
    ) {
      const touch = e.changedTouches[0];
      const target = typeof document !== 'undefined' ? document.elementFromPoint(touch.clientX, touch.clientY) : null;
      if (!target?.closest('.annotation-pin-trigger')) {
        const coords = getPointCoords(touch.clientX, touch.clientY);
        const newPin: Pin = {
          id: crypto.randomUUID(),
          view: activeView,
          x: coords.x,
          y: coords.y,
          label: 'New Marker',
          description: 'Enter notes about this sign/location.',
          color: currentColor,
        };
        const updated = [...pins, newPin];
        onChangePins(updated);
        pushHistory(drawings, updated);
        onSelectPin(newPin);
        setSelectedDrawingId(null);
      }
    }

    handleEndInteraction();
  };

  const handleMeasurementDrag = (coords: { x: number; y: number }) => {
    if (draggingNode && profile && onChangeProfile && measurements) {
      measurementModifiedRef.current = true;
      const updatedMeasurements = {
        ...measurements,
        [draggingNode]: coords,
      };

      if (draggingNode === 'palm_end') {
        updatedMeasurements.finger_start = coords;
      } else if (draggingNode === 'finger_start') {
        updatedMeasurements.palm_end = coords;
      }

      if (!updatedMeasurements.width_start) {
        updatedMeasurements.width_start = { ...DEFAULT_MEASUREMENTS.width_start };
      }
      if (!updatedMeasurements.width_end) {
        updatedMeasurements.width_end = { ...DEFAULT_MEASUREMENTS.width_end };
      }

      const rect = containerRef.current!.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      const px = (ax: number, ay: number, bx: number, by: number) =>
        Math.sqrt(Math.pow(((bx - ax) * W) / 100, 2) + Math.pow(((by - ay) * H) / 100, 2));

      const currentVedic = parseVedicData(profile.general_notes);
      currentVedic.measurements = updatedMeasurements;

      const calculatedPalmLength = parseFloat(
        (
          px(
            updatedMeasurements.palm_start.x,
            updatedMeasurements.palm_start.y,
            updatedMeasurements.palm_end.x,
            updatedMeasurements.palm_end.y
          ) * 0.04
        ).toFixed(1)
      );
      const calculatedFingerLength = parseFloat(
        (
          px(
            updatedMeasurements.finger_start.x,
            updatedMeasurements.finger_start.y,
            updatedMeasurements.finger_end.x,
            updatedMeasurements.finger_end.y
          ) * 0.04
        ).toFixed(1)
      );
      const calculatedPalmWidth = parseFloat(
        (
          px(
            updatedMeasurements.width_start.x,
            updatedMeasurements.width_start.y,
            updatedMeasurements.width_end.x,
            updatedMeasurements.width_end.y
          ) * 0.04
        ).toFixed(1)
      );

      currentVedic.palm_length = calculatedPalmLength;
      currentVedic.finger_length = calculatedFingerLength;
      currentVedic.palm_width = calculatedPalmWidth;

      const shapeRatio = calculatedPalmWidth / Math.max(0.1, calculatedPalmLength);
      currentVedic.palm_shape = shapeRatio >= 0.9 ? 'Square' : 'Rectangular';

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
  };

  const handleEndInteraction = () => {
    if (mode === 'measure') {
      if (draggingNode && measurementModifiedRef.current) {
        measurementModifiedRef.current = false;
        pushHistory(drawings, pins);
      }
      setDraggingNode(null);
      return;
    }

    if (mode === 'aging') {
      if (draggingAxialNode) {
        setDraggingAxialNode(null);
      }
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
        thickness: thickness,
        label: strokeStyle === 'dashed' ? 'dashed' : undefined,
        lineCategory: agingLineCategory || 'line_life',
      };
      const updated = [...drawings, newDrawing];
      onChangeDrawings(updated);
      pushHistory(updated, pins);
      setSelectedDrawingId(newDrawing.id);
      setSelectedAgingDrawingId(newDrawing.id);

      if (returnToAgingAfterTraceRef.current) {
        returnToAgingAfterTraceRef.current = false;
        setMode('aging');
      }
    }
    setCurrentPoints([]);
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    setSelectedDrawingId(null);
    if (hasMovedSignificantlyRef.current || isPanning || isPanActive) return;
    if (mode === 'measure') return;
    if (mode === 'aging') {
      const lineToUse = activeAgingDrawing;
      if (hoveredAgeData) {
        setAgeEventModal({
          isOpen: true,
          age: hoveredAgeData.age,
          point: hoveredAgeData.point,
          lineCategory: lineToUse?.lineCategory || agingLineCategory,
          sign: 'Triangle △ (Property / Shield)',
          note: '',
        });
        setHoveredAgeData(null);
        return;
      }
      if (lineToUse && lineToUse.points.length > 1) {
        const coords = getPointCoords(e.clientX, e.clientY);
        const nearest = getNearestPointOnPolyline(lineToUse.points, coords);
        if (nearest && nearest.distance < 6.0) {
          const age = getAgeForFraction(
            agingMethod,
            nearest.fraction,
            lineToUse.lineCategory || agingLineCategory,
            vedicData?.max_age ?? 75
          );
          setAgeEventModal({
            isOpen: true,
            age,
            point: nearest.point,
            lineCategory: lineToUse.lineCategory || agingLineCategory,
            sign: 'Triangle △ (Property / Shield)',
            note: '',
          });
        }
      }
      return;
    }
    if (mode !== 'pin' || !imageUrl) return;

    const target = e.target as SVGElement;
    if (target.closest('.annotation-pin-trigger')) return;

    const coords = getPointCoords(e.clientX, e.clientY);
    const newPin: Pin = {
      id: crypto.randomUUID(),
      view: activeView,
      x: coords.x,
      y: coords.y,
      label: 'New Marker',
      description: 'Enter notes about this sign/location.',
      color: currentColor,
    };

    const updated = [...pins, newPin];
    onChangePins(updated);
    pushHistory(drawings, updated);
    onSelectPin(newPin);
  };

  const handlePinClick = (pin: Pin, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectPin(pin);
    setSelectedDrawingId(null);
  };

  const removePin = (id: string) => {
    const next = pins.filter((p) => p.id !== id);
    onChangePins(next);
    pushHistory(drawings, next);
    if (selectedPinId === id) onSelectPin(null);
  };

  const removeDrawing = (id: string) => {
    const next = drawings.filter((d) => d.id !== id);
    onChangeDrawings(next);
    pushHistory(next, pins);
    if (selectedDrawingId === id) setSelectedDrawingId(null);
  };

  const clearAllPinsForView = () => {
    const next = pins.filter((p) => p.view !== activeView);
    onChangePins(next);
    pushHistory(drawings, next);
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

        const initRect = containerRef.current?.getBoundingClientRect();
        const W = initRect?.width ?? 500;
        const H = initRect?.height ?? 600;
        const initPx = (ax: number, ay: number, bx: number, by: number) =>
          Math.sqrt(Math.pow(((bx - ax) * W) / 100, 2) + Math.pow(((by - ay) * H) / 100, 2));

        currentVedic.palm_length = parseFloat(
          (
            initPx(
              DEFAULT_MEASUREMENTS.palm_start.x,
              DEFAULT_MEASUREMENTS.palm_start.y,
              DEFAULT_MEASUREMENTS.palm_end.x,
              DEFAULT_MEASUREMENTS.palm_end.y
            ) * 0.04
          ).toFixed(1)
        );
        currentVedic.finger_length = parseFloat(
          (
            initPx(
              DEFAULT_MEASUREMENTS.finger_start.x,
              DEFAULT_MEASUREMENTS.finger_start.y,
              DEFAULT_MEASUREMENTS.finger_end.x,
              DEFAULT_MEASUREMENTS.finger_end.y
            ) * 0.04
          ).toFixed(1)
        );
        currentVedic.palm_width = parseFloat(
          (
            initPx(
              DEFAULT_MEASUREMENTS.width_start.x,
              DEFAULT_MEASUREMENTS.width_start.y,
              DEFAULT_MEASUREMENTS.width_end.x,
              DEFAULT_MEASUREMENTS.width_end.y
            ) * 0.04
          ).toFixed(1)
        );

        const shapeRatio = currentVedic.palm_width / Math.max(0.1, currentVedic.palm_length);
        currentVedic.palm_shape = shapeRatio >= 0.9 ? 'Square' : 'Rectangular';

        onChangeProfile({
          ...profile,
          general_notes: serializeVedicData(currentVedic),
        });
      }
    }
  };

  const handleSetAgingMode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (mode === 'aging') {
      setMode('pin');
      setHoveredAgeData(null);
      return;
    }
    setMode('aging');
    if (!selectedAgingDrawingId && visibleDrawings.length > 0) {
      setSelectedAgingDrawingId(visibleDrawings[0].id);
    }
  };

  const handleSelectAgingMethod = (method: AgingMethod) => {
    setAgingMethod(method);
    if (profile && onChangeProfile) {
      const currentVedic = parseVedicData(profile.general_notes);
      currentVedic.age_method = method;
      onChangeProfile({
        ...profile,
        general_notes: serializeVedicData(currentVedic),
      });
    }
  };

  const handleUpdateMaxAge = (newMax: number) => {
    if (profile && onChangeProfile) {
      const currentVedic = parseVedicData(profile.general_notes);
      currentVedic.max_age = newMax;
      onChangeProfile({
        ...profile,
        general_notes: serializeVedicData(currentVedic),
      });
    }
  };

  const handleTagDrawingLineCategory = (drawingId: string, category: LineCategory) => {
    const updated = drawings.map((d) =>
      d.id === drawingId ? { ...d, lineCategory: category } : d
    );
    onChangeDrawings(updated);
    pushHistory(updated, pins);
    setAgingLineCategory(category);
  };

  const handleSaveAgeEvent = () => {
    if (!ageEventModal || !profile || !onChangeProfile) return;
    const { age, point, lineCategory, sign, note } = ageEventModal;

    const currentVedic = parseVedicData(profile.general_notes);
    const lineKey = lineCategory as keyof VedicData;
    const existingLine = (currentVedic[lineKey] as LineAnalysisData | null) || {
      quality: '',
      origin: '',
      terminus: '',
      signs: [],
      features: [],
      age_events: [],
      notes: '',
    };

    existingLine.age_events = [
      ...(existingLine.age_events || []),
      { age, event: `${sign}${note ? `: ${note}` : ''}` },
    ];
    if (lineKey === 'line_life') currentVedic.line_life = existingLine;
    else if (lineKey === 'line_fate') currentVedic.line_fate = existingLine;
    else if (lineKey === 'line_head') currentVedic.line_head = existingLine;
    else if (lineKey === 'line_heart') currentVedic.line_heart = existingLine;
    else if (lineKey === 'line_sun') currentVedic.line_sun = existingLine;

    // Place a new Pin on canvas at that exact position
    const newPin: Pin = {
      id: crypto.randomUUID(),
      view: activeView,
      x: point.x,
      y: point.y,
      label: `Age ${age}: ${sign.split(' ')[0]}`,
      description: `${sign} on ${LINE_LABELS[lineCategory]}${note ? ` — ${note}` : ''}`,
      color: AGING_METHODS[agingMethod].color,
    };

    const nextPins = [...pins, newPin];
    onChangePins(nextPins);
    pushHistory(drawings, nextPins);

    onChangeProfile({
      ...profile,
      general_notes: serializeVedicData(currentVedic),
    });

    setAgeEventModal(null);
  };

  // Active aging line computations
  const activeAgingDrawing =
    visibleDrawings.find((d) => d.id === selectedAgingDrawingId) ||
    visibleDrawings.find((d) => d.lineCategory === agingLineCategory) ||
    visibleDrawings[0] ||
    null;

  const currentAgingTicks =
    activeAgingDrawing && activeAgingDrawing.points.length > 1
      ? computeAgeTicks(
        activeAgingDrawing.points,
        agingMethod,
        activeAgingDrawing.lineCategory || agingLineCategory,
        vedicData?.max_age ?? 75
      )
      : [];

  const comparisonCheiroTicks =
    activeAgingDrawing && showAllMethodsComparison && activeAgingDrawing.points.length > 1
      ? computeAgeTicks(
        activeAgingDrawing.points,
        'cheiro-98',
        activeAgingDrawing.lineCategory || agingLineCategory,
        98
      )
      : [];

  const comparisonShadamshaTicks =
    activeAgingDrawing && showAllMethodsComparison && activeAgingDrawing.points.length > 1
      ? computeAgeTicks(
        activeAgingDrawing.points,
        'shadamsha-72',
        activeAgingDrawing.lineCategory || agingLineCategory,
        72
      )
      : [];

  return (
    <div
      ref={containerWrapperRef}
      className={`flex flex-col h-full gap-2 transition-all ${isFullscreen ? 'fixed inset-0 z-50 bg-stone-900 p-4' : ''
        }`}
    >
      {/* Hand View Selector Tab Header */}
      <div
        className={`flex flex-wrap items-center justify-between gap-1 border-b pb-2 px-2 pt-1 ${isFullscreen ? 'border-stone-800 bg-stone-900' : 'border-stone-200'
          }`}
      >
        <div className="flex flex-wrap gap-1">
          {VIEWS.map((view) => (
            <button
              key={view}
              onClick={() => handleSwitchView(view)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${activeView === view
                ? 'bg-accent-gold text-white border-accent-gold shadow-sm'
                : isFullscreen
                  ? 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
            >
              {images[view] ? <Eye className="w-3.5 h-3.5" /> : null}
              {HAND_VIEW_LABELS[view]}
            </button>
          ))}
        </div>

        {/* Fullscreen & Layer Toggle in Header */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={() => setShowLayers((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition ${!showLayers
              ? 'bg-amber-500 text-white border-amber-600 shadow-sm font-bold'
              : isFullscreen
                ? 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            title={showLayers ? 'Hide Markings (Peek clean hand • Press H)' : 'Show Markings (Press H)'}
          >
            {showLayers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px] font-medium">
              {showLayers ? 'Markings' : 'Peeking'}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className={`p-1.5 rounded-lg border text-xs flex items-center justify-center transition ${isFullscreen
              ? 'bg-stone-800 border-stone-700 text-amber-400 hover:bg-stone-700'
              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Canvas'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {imageUrl ? (
        <>
          {/* Main Action Toolbars */}
          {activeView === 'd1_chart' ? (
            <div className="flex items-center justify-end p-2 bg-stone-50 rounded-xl border border-stone-200 shadow-sm m-2">
              {confirmRemovePhoto ? (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-lg p-1 animate-pulse">
                  <span className="text-[10px] text-rose-700 font-bold px-1">Remove D-1 Chart?</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onRemoveImageForView(activeView);
                      setConfirmRemovePhoto(false);
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 text-[10px] font-bold rounded shadow-sm"
                  >
                    Yes, Remove
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmRemovePhoto(false)}
                    className="text-stone-500 hover:text-stone-700 px-2 py-1 text-[10px] font-bold rounded"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmRemovePhoto(true);
                    setTimeout(() => setConfirmRemovePhoto(false), 5000);
                  }}
                  className="btn-outline border-rose-200 text-rose-600 hover:bg-rose-50 px-3 py-2 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove D-1 Chart
                </button>
              )}
            </div>
          ) : (
            <div
              className={`flex flex-col gap-2 p-2 rounded-xl border shadow-sm mx-2 transition ${isFullscreen
                ? 'bg-stone-850 border-stone-750 text-white'
                : 'bg-stone-50/90 border-stone-200'
                }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Tools & Undo/Redo Group */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Universal Undo & Redo */}
                  <div className="flex items-center gap-0.5 border-r border-stone-200 pr-1.5 mr-0.5">
                    <button
                      type="button"
                      onClick={handleUndo}
                      disabled={!canUndo}
                      className={`px-2 py-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${canUndo
                        ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100 cursor-pointer shadow-xs active:scale-95'
                        : 'bg-stone-100/60 border-stone-200/40 text-stone-350 cursor-not-allowed opacity-40'
                        }`}
                      title="Undo (Ctrl+Z / ⌘Z)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px] font-semibold">Undo</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRedo}
                      disabled={!canRedo}
                      className={`px-2 py-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${canRedo
                        ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100 cursor-pointer shadow-xs active:scale-95'
                        : 'bg-stone-100/60 border-stone-200/40 text-stone-350 cursor-not-allowed opacity-40'
                        }`}
                      title="Redo (Ctrl+Y / ⌘⇧Z)"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px] font-semibold">Redo</span>
                    </button>
                  </div>

                  {/* Mode buttons */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setMode('pin');
                    }}
                    className={`btn-outline px-2.5 py-1.5 text-xs flex items-center gap-1.5 ${mode === 'pin'
                      ? 'border-accent-gold text-accent-gold bg-amber-500/10 font-bold shadow-xs'
                      : ''
                      }`}
                    title="Place Pins (Click on hand to place markers)"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Pins
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setMode('draw');
                    }}
                    className={`btn-outline px-2.5 py-1.5 text-xs flex items-center gap-1.5 ${mode === 'draw'
                      ? 'border-accent-gold text-accent-gold bg-amber-500/10 font-bold shadow-xs'
                      : ''
                      }`}
                    title="Trace Lines (Click & drag to trace palm lines)"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Trace
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setMode('pan');
                    }}
                    className={`btn-outline px-2.5 py-1.5 text-xs flex items-center gap-1.5 ${mode === 'pan'
                      ? 'border-accent-gold text-accent-gold bg-amber-500/10 font-bold shadow-xs'
                      : ''
                      }`}
                    title="Pan Hand (Click & drag to move hand, or hold Spacebar)"
                  >
                    <Hand className="w-3.5 h-3.5" />
                    Pan
                  </button>

                  <button
                    type="button"
                    onClick={handleSetMeasureMode}
                    className={`btn-outline px-2.5 py-1.5 text-xs flex items-center gap-1.5 ${mode === 'measure'
                      ? 'border-accent-gold text-accent-gold bg-amber-500/10 font-bold shadow-xs'
                      : ''
                      }`}
                    title="Measure Hand (Align handles for palm/finger ratios)"
                    disabled={!profile}
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    Measure
                  </button>

                  <button
                    type="button"
                    onClick={handleSetAgingMode}
                    className={`btn-outline px-2.5 py-1.5 text-xs flex items-center gap-1.5 ${mode === 'aging'
                      ? 'border-accent-gold text-accent-gold bg-amber-500/10 font-bold shadow-xs'
                      : ''
                      }`}
                    title="Aging Ruler & Grid (Calculate age milestones along lines & axial geometry)"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Aging Ruler
                  </button>
                </div>

                {/* Image Filters & Right Actions */}
                <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                  {/* Forensic Image Filters */}
                  <div className="flex items-center gap-0.5 bg-stone-200/70 p-0.5 rounded-lg border border-stone-300/60 text-[11px]">
                    {FILTERS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setImageFilter(f.id)}
                        className={`px-1.5 py-1 rounded-md text-[11px] font-medium transition ${imageFilter === f.id
                          ? 'bg-white text-stone-900 shadow-xs font-bold'
                          : 'text-stone-600 hover:text-stone-900'
                          }`}
                        title={`Filter: ${f.label}`}
                      >
                        <span>{f.icon}</span>
                        <span className="hidden xl:inline ml-1">{f.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Delete Selected Line */}
                  {selectedDrawingId && (
                    <button
                      type="button"
                      onClick={() => removeDrawing(selectedDrawingId)}
                      className="btn-outline border-rose-500 text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 text-xs flex items-center gap-1 font-bold shadow-xs"
                      title="Delete Selected Line (Delete key)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Line
                    </button>
                  )}

                  {/* Clear View Lines */}
                  {confirmClear ? (
                    <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg p-0.5 animate-pulse">
                      <span className="text-[10px] text-rose-700 font-bold px-1">Clear lines?</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = drawings.filter((d) => d.view !== activeView);
                          onChangeDrawings(next);
                          pushHistory(next, pins);
                          setConfirmClear(false);
                        }}
                        className="bg-rose-600 text-white px-2 py-0.5 text-[10px] font-bold rounded shadow-xs"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmClear(false)}
                        className="text-stone-500 px-1.5 py-0.5 text-[10px]"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmClear(true);
                        setTimeout(() => setConfirmClear(false), 5000);
                      }}
                      className="btn-outline border-rose-200 text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 text-xs flex items-center gap-1"
                      disabled={visibleDrawings.length === 0}
                      title="Clear all lines on this view"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear Lines
                    </button>
                  )}

                  {/* Clear View Pins */}
                  {confirmClearPins ? (
                    <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg p-0.5 animate-pulse">
                      <span className="text-[10px] text-rose-700 font-bold px-1">Clear pins?</span>
                      <button
                        type="button"
                        onClick={() => {
                          clearAllPinsForView();
                          setConfirmClearPins(false);
                        }}
                        className="bg-rose-600 text-white px-2 py-0.5 text-[10px] font-bold rounded shadow-xs"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmClearPins(false)}
                        className="text-stone-500 px-1.5 py-0.5 text-[10px]"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmClearPins(true);
                        setTimeout(() => setConfirmClearPins(false), 5000);
                      }}
                      className="btn-outline border-rose-200 text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 text-xs flex items-center gap-1"
                      disabled={visiblePins.length === 0}
                      title="Clear all markers on this view"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear Pins
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-bar: Color Palette & Line Settings (When Draw or Pin Mode is active) */}
              {(mode === 'draw' || mode === 'pin') && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-stone-200/80">
                  <div className="flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-stone-500" />
                    <div className="flex gap-1">
                      {COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setCurrentColor(color.value)}
                          className="relative w-5 h-5 rounded-full flex items-center justify-center border border-stone-300 transition-transform active:scale-95 shadow-xs"
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        >
                          {currentColor === color.value && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full shadow" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {mode === 'draw' && (
                    <div className="flex items-center gap-3 text-xs">
                      {/* Thickness Selector */}
                      <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                        {THICKNESS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setThickness(opt.value)}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${thickness === opt.value
                              ? 'bg-white text-stone-900 shadow-xs font-bold'
                              : 'text-stone-500 hover:text-stone-800'
                              }`}
                            title={opt.desc}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {/* Line Style (Solid vs Dashed) */}
                      <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                        <button
                          type="button"
                          onClick={() => setStrokeStyle('solid')}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${strokeStyle === 'solid'
                            ? 'bg-white text-stone-900 shadow-xs font-bold'
                            : 'text-stone-500 hover:text-stone-800'
                            }`}
                          title="Solid continuous line"
                        >
                          Solid
                        </button>
                        <button
                          type="button"
                          onClick={() => setStrokeStyle('dashed')}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${strokeStyle === 'dashed'
                            ? 'bg-white text-stone-900 shadow-xs font-bold'
                            : 'text-stone-500 hover:text-stone-800'
                            }`}
                          title="Dashed / broken line (ideal for interrupted creases)"
                        >
                          Dashed
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Canvas Viewport Area */}
          <div
            ref={containerRef}
            className={`canvas-wrapper flex-1 relative min-h-[460px] shadow-sm select-none border rounded-xl m-2 touch-none overflow-hidden transition-colors ${isFullscreen
              ? 'bg-stone-950 border-stone-800'
              : 'bg-stone-100/50 border-stone-200'
              }`}
            style={{
              touchAction: 'none',
              cursor: isPanning
                ? 'grabbing'
                : isPanActive
                  ? 'grab'
                  : mode === 'draw'
                    ? 'crosshair'
                    : mode === 'pin'
                      ? 'pointer'
                      : 'default',
            }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              if (isPanning) setIsPanning(false);
              setDraggingNode(null);
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            {/* Zoomable & Pannable Content Container */}
            <div
              className="w-full h-full relative"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                transition: isPanning || isDrawing ? 'none' : 'transform 0.08s ease-out',
              }}
            >
              {/* Base Hand Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={HAND_VIEW_LABELS[activeView]}
                className="w-full h-full object-contain pointer-events-none max-h-[75vh]"
                style={{
                  filter: IMAGE_FILTER_MAP[imageFilter],
                  transition: 'filter 0.2s ease',
                }}
              />

              {/* Layer Wrapper: Hidden when Peeking Clean Hand */}
              <div
                className={`absolute inset-0 transition-opacity duration-150 ${showLayers ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
              >
                {activeView !== 'd1_chart' && (
                  <svg
                    className="canvas-element"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    onClick={handleSvgClick}
                  >
                    {/* Render already drawn lines */}
                    {visibleDrawings.map((drawing) => {
                      const pointsString = drawing.points
                        .map((p) => `${p.x},${p.y}`)
                        .join(' ');
                      const isSelected = selectedDrawingId === drawing.id;
                      const isDashed = drawing.label === 'dashed';

                      return (
                        <g key={drawing.id} className="group cursor-pointer">
                          {/* Glowing highlight under selected line */}
                          {isSelected && (
                            <polyline
                              points={pointsString}
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth={drawing.thickness + 4}
                              strokeDasharray={isDashed ? '4,3' : undefined}
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
                            stroke={isSelected ? '#d97706' : drawing.color}
                            strokeWidth={drawing.thickness}
                            strokeDasharray={isDashed ? '4,3' : undefined}
                            vectorEffect="non-scaling-stroke"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-all"
                            style={{
                              filter: isSelected
                                ? 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.4))'
                                : `drop-shadow(0 1px 2px rgba(0,0,0,0.2))`,
                            }}
                          />
                          {/* Thick overlay for easy click selection */}
                          <polyline
                            points={pointsString}
                            fill="none"
                            stroke="transparent"
                            strokeWidth={16}
                            vectorEffect="non-scaling-stroke"
                            onMouseDown={(e) => {
                              if (mode !== 'aging') e.stopPropagation();
                            }}
                            onMouseUp={(e) => {
                              if (mode !== 'aging') e.stopPropagation();
                            }}
                            onTouchStart={(e) => {
                              if (mode !== 'aging') e.stopPropagation();
                            }}
                            onTouchEnd={(e) => {
                              e.stopPropagation();
                              if (mode === 'aging') {
                                setSelectedAgingDrawingId(drawing.id);
                                if (drawing.lineCategory) setAgingLineCategory(drawing.lineCategory);
                                if (e.changedTouches.length > 0) {
                                  const t = e.changedTouches[0];
                                  const coords = getPointCoords(t.clientX, t.clientY);
                                  const nearest = getNearestPointOnPolyline(drawing.points, coords);
                                  if (nearest) {
                                    const age = getAgeForFraction(
                                      agingMethod,
                                      nearest.fraction,
                                      drawing.lineCategory || agingLineCategory,
                                      vedicData?.max_age ?? 75
                                    );
                                    setAgeEventModal({
                                      isOpen: true,
                                      age,
                                      point: nearest.point,
                                      lineCategory: drawing.lineCategory || agingLineCategory,
                                      sign: 'Triangle △ (Property / Shield)',
                                      note: '',
                                    });
                                    setHoveredAgeData(null);
                                  }
                                }
                                return;
                              }
                              setSelectedDrawingId(isSelected ? null : drawing.id);
                              onSelectPin(null);
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (mode === 'aging') {
                                setSelectedAgingDrawingId(drawing.id);
                                if (drawing.lineCategory) setAgingLineCategory(drawing.lineCategory);
                                const coords = getPointCoords(e.clientX, e.clientY);
                                const nearest = getNearestPointOnPolyline(drawing.points, coords);
                                if (nearest) {
                                  const age = getAgeForFraction(
                                    agingMethod,
                                    nearest.fraction,
                                    drawing.lineCategory || agingLineCategory,
                                    vedicData?.max_age ?? 75
                                  );
                                  setAgeEventModal({
                                    isOpen: true,
                                    age,
                                    point: nearest.point,
                                    lineCategory: drawing.lineCategory || agingLineCategory,
                                    sign: 'Triangle △ (Property / Shield)',
                                    note: '',
                                  });
                                  setHoveredAgeData(null);
                                }
                                return;
                              }
                              setSelectedDrawingId(isSelected ? null : drawing.id);
                              onSelectPin(null);
                            }}
                            className={mode === 'aging' ? 'cursor-pointer' : 'hover:stroke-rose-500/10 cursor-pointer'}
                          >
                            <title>
                              {mode === 'aging'
                                ? 'Click anywhere on this line to log an age milestone'
                                : isSelected
                                  ? 'Selected line (Delete to remove)'
                                  : 'Click to select this line'}
                            </title>
                          </polyline>
                        </g>
                      );
                    })}

                    {/* Render current live drawing path */}
                    {isDrawing && currentPoints.length > 0 && (
                      <polyline
                        points={currentPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke={currentColor}
                        strokeWidth={thickness}
                        strokeDasharray={strokeStyle === 'dashed' ? '4,3' : undefined}
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Measurement Mode Lines Overlay */}
                    {mode === 'measure' && measurements && (
                      <g className="measurement-overlay">
                        {/* Palm Height Line */}
                        <line
                          x1={measurements.palm_start.x}
                          y1={measurements.palm_start.y}
                          x2={measurements.palm_end.x}
                          y2={measurements.palm_end.y}
                          stroke="#3b82f6"
                          strokeWidth="1.8"
                          strokeDasharray="2,2"
                          vectorEffect="non-scaling-stroke"
                          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
                        />
                        {/* Palm Width Line */}
                        <line
                          x1={measurements.width_start?.x ?? DEFAULT_MEASUREMENTS.width_start.x}
                          y1={measurements.width_start?.y ?? DEFAULT_MEASUREMENTS.width_start.y}
                          x2={measurements.width_end?.x ?? DEFAULT_MEASUREMENTS.width_end.x}
                          y2={measurements.width_end?.y ?? DEFAULT_MEASUREMENTS.width_end.y}
                          stroke="#f59e0b"
                          strokeWidth="1.8"
                          strokeDasharray="2,2"
                          vectorEffect="non-scaling-stroke"
                          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
                        />
                        {/* Finger Length Line */}
                        <line
                          x1={measurements.finger_start.x}
                          y1={measurements.finger_start.y}
                          x2={measurements.finger_end.x}
                          y2={measurements.finger_end.y}
                          stroke="#10b981"
                          strokeWidth="1.8"
                          strokeDasharray="2,2"
                          vectorEffect="non-scaling-stroke"
                          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
                        />

                        {/* Line Labels */}
                        <rect
                          x={(measurements.palm_start.x + measurements.palm_end.x) / 2 - 5}
                          y={(measurements.palm_start.y + measurements.palm_end.y) / 2 - 1.5}
                          width="10"
                          height="3.0"
                          rx="0.6"
                          fill="#3b82f6"
                          opacity="0.9"
                        />
                        <text
                          x={(measurements.palm_start.x + measurements.palm_end.x) / 2}
                          y={(measurements.palm_start.y + measurements.palm_end.y) / 2 + 0.4}
                          fill="white"
                          fontSize="0.85"
                          fontWeight="bold"
                          textAnchor="middle"
                          style={{ pointerEvents: 'none', userSelect: 'none' }}
                        >
                          Palm: {displayPalmLength}u
                        </text>

                        <rect
                          x={(measurements.finger_start.x + measurements.finger_end.x) / 2 - 5}
                          y={(measurements.finger_start.y + measurements.finger_end.y) / 2 - 1.5}
                          width="10"
                          height="3.0"
                          rx="0.6"
                          fill="#10b981"
                          opacity="0.9"
                        />
                        <text
                          x={(measurements.finger_start.x + measurements.finger_end.x) / 2}
                          y={(measurements.finger_start.y + measurements.finger_end.y) / 2 + 0.4}
                          fill="white"
                          fontSize="0.95"
                          fontWeight="bold"
                          textAnchor="middle"
                          style={{ pointerEvents: 'none', userSelect: 'none' }}
                        >
                          Finger: {vedicData?.finger_length || '0.0'}u
                        </text>

                        <rect
                          x={
                            ((measurements.width_start?.x ?? DEFAULT_MEASUREMENTS.width_start.x) +
                              (measurements.width_end?.x ?? DEFAULT_MEASUREMENTS.width_end.x)) /
                            2 -
                            5
                          }
                          y={
                            ((measurements.width_start?.y ?? DEFAULT_MEASUREMENTS.width_start.y) +
                              (measurements.width_end?.y ?? DEFAULT_MEASUREMENTS.width_end.y)) /
                            2 -
                            1.5
                          }
                          width="10"
                          height="3.0"
                          rx="0.6"
                          fill="#f59e0b"
                          opacity="0.9"
                        />
                        <text
                          x={
                            ((measurements.width_start?.x ?? DEFAULT_MEASUREMENTS.width_start.x) +
                              (measurements.width_end?.x ?? DEFAULT_MEASUREMENTS.width_end.x)) /
                            2
                          }
                          y={
                            ((measurements.width_start?.y ?? DEFAULT_MEASUREMENTS.width_start.y) +
                              (measurements.width_end?.y ?? DEFAULT_MEASUREMENTS.width_end.y)) /
                            2 +
                            0.4
                          }
                          fill="white"
                          fontSize="0.95"
                          fontWeight="bold"
                          textAnchor="middle"
                          style={{ pointerEvents: 'none', userSelect: 'none' }}
                        >
                          Width: {vedicData?.palm_width || '0.0'}u
                        </text>
                      </g>
                    )}

                    {/* Aging Mode Overlays */}
                    {mode === 'aging' && (
                      <g className="aging-overlay">
                        {/* 1. Primary Line Aging Ticks */}
                        {currentAgingTicks.map((tick, idx) => {
                          const tickLen = tick.isMajor ? 2.6 : 1.5;
                          const x1 = tick.point.x - tick.normal.x * tickLen;
                          const y1 = tick.point.y - tick.normal.y * tickLen;
                          const x2 = tick.point.x + tick.normal.x * tickLen;
                          const y2 = tick.point.y + tick.normal.y * tickLen;

                          // Text badge offset along normal
                          const textOffset = tickLen + 1.8;
                          const textX = tick.point.x + tick.normal.x * textOffset;
                          const textY = tick.point.y + tick.normal.y * textOffset;
                          const badgeW = tick.label.length > 2 ? 5.2 : 3.8;

                          return (
                            <g
                              key={`primary-tick-${idx}`}
                              className="aging-tick-group cursor-pointer hover:opacity-90"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAgeEventModal({
                                  isOpen: true,
                                  age: tick.age,
                                  point: tick.point,
                                  lineCategory: activeAgingDrawing?.lineCategory || agingLineCategory,
                                  sign: 'Triangle △ (Property / Shield)',
                                  note: '',
                                });
                                setHoveredAgeData(null);
                              }}
                            >
                              {/* Perpendicular tick line */}
                              <line
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke={tick.color}
                                strokeWidth={tick.isMajor ? '2.0' : '1.3'}
                                vectorEffect="non-scaling-stroke"
                                strokeLinecap="round"
                              />
                              {/* Anchor dot on curve */}
                              <circle
                                cx={tick.point.x}
                                cy={tick.point.y}
                                r={tick.isMajor ? 0.7 : 0.45}
                                fill={tick.color}
                                stroke="#ffffff"
                                strokeWidth="0.25"
                              />
                              {/* Label badge */}
                              <rect
                                x={textX - badgeW / 2}
                                y={textY - 1.2}
                                width={badgeW}
                                height="2.4"
                                rx="0.5"
                                fill="#1c1917"
                                opacity="0.9"
                                stroke={tick.color}
                                strokeWidth="0.2"
                              />
                              <text
                                x={textX}
                                y={textY + 0.3}
                                fill="#ffffff"
                                fontSize="1.0"
                                fontWeight="bold"
                                textAnchor="middle"
                                style={{ pointerEvents: 'none', userSelect: 'none' }}
                              >
                                {tick.label}
                              </text>
                            </g>
                          );
                        })}

                        {/* 2. Multi-Method Comparison Ticks */}
                        {showAllMethodsComparison && (
                          <>
                            {/* Cheiro 7-year ticks (Blue, offset on opposite normal side) */}
                            {comparisonCheiroTicks.map((tick, idx) => {
                              const tickLen = 2.0;
                              const x1 = tick.point.x;
                              const y1 = tick.point.y;
                              const x2 = tick.point.x - tick.normal.x * tickLen;
                              const y2 = tick.point.y - tick.normal.y * tickLen;
                              const textX = tick.point.x - tick.normal.x * (tickLen + 1.8);
                              const textY = tick.point.y - tick.normal.y * (tickLen + 1.8);
                              return (
                                <g key={`cheiro-tick-${idx}`}>
                                  <line
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke="#2563eb"
                                    strokeWidth="1.5"
                                    strokeDasharray="1,1"
                                    vectorEffect="non-scaling-stroke"
                                  />
                                  <rect
                                    x={textX - 2.0}
                                    y={textY - 1.1}
                                    width="4.0"
                                    height="2.2"
                                    rx="0.5"
                                    fill="#1e3a8a"
                                    opacity="0.9"
                                  />
                                  <text
                                    x={textX}
                                    y={textY + 0.3}
                                    fill="#93c5fd"
                                    fontSize="0.85"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                                  >
                                    {tick.label}
                                  </text>
                                </g>
                              );
                            })}

                            {/* Ṣaḍaṁśa 6-year markers (Purple dots along curve) */}
                            {comparisonShadamshaTicks.map((tick, idx) => (
                              <circle
                                key={`shadamsha-dot-${idx}`}
                                cx={tick.point.x}
                                cy={tick.point.y}
                                r="0.6"
                                fill="#9333ea"
                                stroke="#ffffff"
                                strokeWidth="0.2"
                              />
                            ))}
                          </>
                        )}

                        {/* 3. Geometric Axial Grid */}
                        {showArvindJiAxialGrid && (() => {
                          const { wrist, midpoint, saturn, jupiter } = axialGrid;

                          // Halving calculations along 30->75 (midpoint to wrist)
                          const p52_5 = {
                            x: (midpoint.x + wrist.x) / 2,
                            y: (midpoint.y + wrist.y) / 2,
                          };
                          const p41_25 = {
                            x: (midpoint.x + p52_5.x) / 2,
                            y: (midpoint.y + p52_5.y) / 2,
                          };
                          const p47 = {
                            x: (p41_25.x + p52_5.x) / 2,
                            y: (p41_25.y + p52_5.y) / 2,
                          };

                          // Upper Fate points along midpoint to saturn (30 to 80)
                          const getUpperPoint = (age: number) => {
                            const ratio = (age - 30) / (80 - 30);
                            return {
                              x: midpoint.x + (saturn.x - midpoint.x) * ratio,
                              y: midpoint.y + (saturn.y - midpoint.y) * ratio,
                            };
                          };
                          const p42 = getUpperPoint(42);
                          const p46 = getUpperPoint(46);
                          const p49 = getUpperPoint(49);
                          const p55 = getUpperPoint(55);

                          return (
                            <g className="arvind-ji-grid">
                              {/* Central Vertical Axis */}
                              <line
                                x1={wrist.x}
                                y1={wrist.y}
                                x2={saturn.x}
                                y2={saturn.y}
                                stroke="#d97706"
                                strokeWidth="2.2"
                                strokeDasharray="3,2"
                                vectorEffect="non-scaling-stroke"
                              />

                              {/* Diagonal Axis (Wrist to Jupiter/Saturn Cleft) */}
                              <line
                                x1={wrist.x}
                                y1={wrist.y}
                                x2={jupiter.x}
                                y2={jupiter.y}
                                stroke="#7c3aed"
                                strokeWidth="1.8"
                                strokeDasharray="2,2"
                                vectorEffect="non-scaling-stroke"
                              />

                              {/* Transverse Axis through Midpoint 30 */}
                              <line
                                x1={Math.max(5, midpoint.x - 35)}
                                y1={midpoint.y + 10}
                                x2={Math.min(95, midpoint.x + 35)}
                                y2={midpoint.y - 10}
                                stroke="#64748b"
                                strokeWidth="1.5"
                                strokeDasharray="2,2"
                                vectorEffect="non-scaling-stroke"
                              />

                              {/* Horizontal Projection Lines with arrows towards Life Line */}
                              {[
                                { pt: p41_25, label: '41.25' },
                                { pt: p47, label: '47' },
                                { pt: p52_5, label: '52.5' },
                              ].map(({ pt, label }) => (
                                <g key={`proj-${label}`}>
                                  <line
                                    x1={pt.x}
                                    y1={pt.y}
                                    x2={pt.x - 12}
                                    y2={pt.y}
                                    stroke="#d97706"
                                    strokeWidth="1.4"
                                    strokeDasharray="1.5,1.5"
                                    vectorEffect="non-scaling-stroke"
                                  />
                                  <polygon
                                    points={`${pt.x - 12},${pt.y} ${pt.x - 10.5},${pt.y - 0.7} ${pt.x - 10.5},${pt.y + 0.7}`}
                                    fill="#d97706"
                                  />
                                  <text
                                    x={pt.x + 2}
                                    y={pt.y + 0.4}
                                    fill="#d97706"
                                    fontSize="0.9"
                                    fontWeight="bold"
                                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                                  >
                                    {label}
                                  </text>
                                </g>
                              ))}

                              {/* Upper Fate points (42, 46, 49, 55) */}
                              {[
                                { pt: p42, label: '42' },
                                { pt: p46, label: '46' },
                                { pt: p49, label: '49 (Heart)' },
                                { pt: p55, label: '55' },
                              ].map(({ pt, label }) => (
                                <g key={`upper-${label}`}>
                                  <line
                                    x1={pt.x - 1.5}
                                    y1={pt.y}
                                    x2={pt.x + 1.5}
                                    y2={pt.y}
                                    stroke="#b45309"
                                    strokeWidth="1.6"
                                    vectorEffect="non-scaling-stroke"
                                  />
                                  <text
                                    x={pt.x + 2.5}
                                    y={pt.y + 0.3}
                                    fill="#b45309"
                                    fontSize="0.85"
                                    fontWeight="bold"
                                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                                  >
                                    {label}
                                  </text>
                                </g>
                              ))}

                              {/* Main Hub Badges */}
                              {/* 30 Center Crossing */}
                              <rect
                                x={midpoint.x - 3.2}
                                y={midpoint.y - 1.4}
                                width="6.4"
                                height="2.8"
                                rx="0.6"
                                fill="#d97706"
                              />
                              <text
                                x={midpoint.x}
                                y={midpoint.y + 0.4}
                                fill="#ffffff"
                                fontSize="1.1"
                                fontWeight="bold"
                                textAnchor="middle"
                                style={{ pointerEvents: 'none', userSelect: 'none' }}
                              >
                                30
                              </text>

                              {/* 75 Wrist Base */}
                              <rect
                                x={wrist.x - 3.2}
                                y={wrist.y - 1.4}
                                width="6.4"
                                height="2.8"
                                rx="0.6"
                                fill="#78350f"
                              />
                              <text
                                x={wrist.x}
                                y={wrist.y + 0.4}
                                fill="#ffffff"
                                fontSize="1.1"
                                fontWeight="bold"
                                textAnchor="middle"
                                style={{ pointerEvents: 'none', userSelect: 'none' }}
                              >
                                75
                              </text>

                              {/* 80 Saturn Base */}
                              <rect
                                x={saturn.x - 3.2}
                                y={saturn.y - 1.4}
                                width="6.4"
                                height="2.8"
                                rx="0.6"
                                fill="#78350f"
                              />
                              <text
                                x={saturn.x}
                                y={saturn.y + 0.4}
                                fill="#ffffff"
                                fontSize="1.1"
                                fontWeight="bold"
                                textAnchor="middle"
                                style={{ pointerEvents: 'none', userSelect: 'none' }}
                              >
                                80
                              </text>
                            </g>
                          );
                        })()}

                        {/* 4. Hover Age Target & Tooltip */}
                        {hoveredAgeData && !ageEventModal?.isOpen && (
                          <g className="hover-age-cursor" style={{ pointerEvents: 'none' }}>
                            <circle
                              cx={hoveredAgeData.point.x}
                              cy={hoveredAgeData.point.y}
                              r="1.4"
                              fill="#f59e0b"
                              fillOpacity="0.25"
                              stroke="#f59e0b"
                              strokeWidth="0.3"
                            />
                            <circle
                              cx={hoveredAgeData.point.x}
                              cy={hoveredAgeData.point.y}
                              r="0.7"
                              fill="#d97706"
                              stroke="#ffffff"
                              strokeWidth="0.3"
                            />
                            <rect
                              x={hoveredAgeData.point.x - 8.5}
                              y={hoveredAgeData.point.y - 4.5}
                              width="17"
                              height="3.4"
                              rx="0.6"
                              fill="#1c1917"
                              stroke="#f59e0b"
                              strokeWidth="0.3"
                            />
                            <text
                              x={hoveredAgeData.point.x}
                              y={hoveredAgeData.point.y - 2.3}
                              fill="#fef08a"
                              fontSize="1.0"
                              fontWeight="bold"
                              textAnchor="middle"
                              style={{ pointerEvents: 'none', userSelect: 'none' }}
                            >
                              ⏳ {hoveredAgeData.label} (Click)
                            </text>
                          </g>
                        )}
                      </g>
                    )}
                  </svg>
                )}

                {/* Measurement Handles (Scaled with container) */}
                {activeView !== 'd1_chart' && mode === 'measure' && measurements && (
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
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        setDraggingNode('palm_start');
                      }}
                    >
                      <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md hover:scale-125 flex items-center justify-center transition-transform">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
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
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        setDraggingNode('palm_end');
                      }}
                    >
                      <div className="w-4.5 h-4.5 rounded-full bg-indigo-600 border-2 border-white shadow-md hover:scale-125 flex items-center justify-center transition-transform">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
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
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        setDraggingNode('finger_end');
                      }}
                    >
                      <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-md hover:scale-125 flex items-center justify-center transition-transform">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    </div>

                    {/* Palm Width Left */}
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
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        setDraggingNode('width_start');
                      }}
                    >
                      <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-md hover:scale-125 flex items-center justify-center transition-transform">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    </div>

                    {/* Palm Width Right */}
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
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        setDraggingNode('width_end');
                      }}
                    >
                      <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-md hover:scale-125 flex items-center justify-center transition-transform">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    </div>
                  </>
                )}

                {/* Marker Pins Overlay */}
                {activeView !== 'd1_chart' &&
                  visiblePins.map((pin) => (
                    <div
                      key={pin.id}
                      className="absolute annotation-pin-trigger group z-20"
                      style={{
                        left: `${pin.x}%`,
                        top: `${pin.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div
                        onClick={(e) => handlePinClick(pin, e)}
                        onTouchStart={(e) => e.stopPropagation()}
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 border border-white shadow ${selectedPinId === pin.id
                          ? 'scale-115 ring-2 ring-offset-1 ring-offset-white ring-accent-gold shadow-md'
                          : 'hover:scale-110 shadow-sm'
                          }`}
                        style={{ backgroundColor: pin.color }}
                        title={pin.label}
                      >
                        <div className="w-1 h-1 bg-white rounded-full" />
                      </div>

                      {/* Floating Pin Label Tooltip */}
                      <div
                        className={`absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none bg-stone-900/90 backdrop-blur px-1.5 py-0.5 rounded text-[8.5px] font-medium tracking-wide whitespace-nowrap text-white shadow-md z-30 transition-all duration-200 ${selectedPinId === pin.id
                          ? 'opacity-100 translate-y-0 visible'
                          : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible invisible'
                          }`}
                      >
                        {pin.label}
                      </div>

                      {/* Quick delete marker button */}
                      {selectedPinId === pin.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePin(pin.id);
                          }}
                          onTouchStart={(e) => e.stopPropagation()}
                          className="absolute -top-3 -right-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full px-1.5 py-0.2 border border-white transition-transform active:scale-95 shadow-md z-40 text-[7.5px] font-bold leading-tight"
                          title="Remove marker (Delete key)"
                        >
                          Del
                        </button>
                      )}
                    </div>
                  ))}

                {/* Grid Handles */}
                {activeView !== 'd1_chart' && mode === 'aging' && showArvindJiAxialGrid && (
                  <>
                    {/* Wrist Node (75) */}
                    <div
                      className="absolute cursor-move z-30 group"
                      style={{
                        left: `${axialGrid.wrist.x}%`,
                        top: `${axialGrid.wrist.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggingAxialNode('wrist');
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        setDraggingAxialNode('wrist');
                      }}
                      title="Wrist Base (Age 75) - Drag to align"
                    >
                      <div className="w-5 h-5 rounded-full bg-amber-600 border-2 border-white shadow-lg hover:scale-125 flex items-center justify-center transition-transform">
                        <span className="text-[9px] font-bold text-white leading-none">75</span>
                      </div>
                    </div>

                    {/* Midpoint Node (30) */}
                    <div
                      className="absolute cursor-move z-30 group"
                      style={{
                        left: `${axialGrid.midpoint.x}%`,
                        top: `${axialGrid.midpoint.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggingAxialNode('midpoint');
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        setDraggingAxialNode('midpoint');
                      }}
                      title="Center Midpoint (Age 30) - Drag to align"
                    >
                      <div className="w-5 h-5 rounded-full bg-amber-500 border-2 border-white shadow-lg hover:scale-125 flex items-center justify-center transition-transform">
                        <span className="text-[9px] font-bold text-white leading-none">30</span>
                      </div>
                    </div>

                    {/* Saturn Node (80) */}
                    <div
                      className="absolute cursor-move z-30 group"
                      style={{
                        left: `${axialGrid.saturn.x}%`,
                        top: `${axialGrid.saturn.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggingAxialNode('saturn');
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        setDraggingAxialNode('saturn');
                      }}
                      title="Saturn Mount Base (Age 80) - Drag to align"
                    >
                      <div className="w-5 h-5 rounded-full bg-amber-700 border-2 border-white shadow-lg hover:scale-125 flex items-center justify-center transition-transform">
                        <span className="text-[9px] font-bold text-white leading-none">80</span>
                      </div>
                    </div>

                    {/* Jupiter/Saturn Cleft Node */}
                    <div
                      className="absolute cursor-move z-30 group"
                      style={{
                        left: `${axialGrid.jupiter.x}%`,
                        top: `${axialGrid.jupiter.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggingAxialNode('jupiter');
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        setDraggingAxialNode('jupiter');
                      }}
                      title="Jupiter/Saturn Cleft - Drag to align diagonal axis"
                    >
                      <div className="w-4.5 h-4.5 rounded-full bg-purple-600 border-2 border-white shadow-lg hover:scale-125 flex items-center justify-center transition-transform">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Fixed HUD: Vedic Tattva Ratio HUD Overlay (stays anchored on screen) */}
            {activeView !== 'd1_chart' && mode === 'measure' && measurements && vedicData && (
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
                    <span className="text-stone-400">Palm Width:</span>
                    <span className="font-mono font-bold text-amber-500">
                      {vedicData.palm_width || '0.0'} units
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-stone-400">Finger Length:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {vedicData.finger_length || '0.0'} units
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-stone-800/50">
                    <span className="text-stone-400">Palm Shape:</span>
                    <span className="font-mono font-bold text-purple-400">
                      {vedicData.palm_shape || 'Calculating...'}
                    </span>
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

            {/* Fixed HUD: Vedic Aging Calibrator HUD Overlay */}
            {activeView !== 'd1_chart' && mode === 'aging' && (
              <div className="absolute top-4 left-4 bg-stone-900/95 backdrop-blur-md border border-stone-800 text-white rounded-2xl p-4 shadow-2xl z-30 text-xs space-y-3 font-sans w-72 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                  <div className="flex items-center gap-2 text-accent-gold font-bold">
                    <Clock className="w-4 h-4 text-accent-gold" />
                    <span>Aging Calibrator</span>
                  </div>
                  <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full font-mono">
                    {visibleDrawings.length} lines
                  </span>
                </div>

                {/* Method Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-300 block">
                    Classical Method
                  </label>
                  <select
                    className="w-full bg-stone-800 border border-stone-700 text-stone-100 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden focus:border-amber-500 cursor-pointer"
                    value={agingMethod}
                    onChange={(e) => handleSelectAgingMethod(e.target.value as AgingMethod)}
                  >
                    <option value="30-midpoint">30-Midpoint (Class Standard)</option>
                    <option value="cheiro-98">Cheiro Saptāṁśa (98 yrs, 14 parts)</option>
                    <option value="shadamsha-72">Ṣaḍaṁśa (72 yrs, 12 parts)</option>
                    <option value="three-line-avg">Three-Line Average (100y scale)</option>
                    <option value="18-6-cadence">18 + 6 Cadence (Heart & Head)</option>
                  </select>
                  <p className="text-[10px] text-stone-400 italic leading-tight pt-0.5">
                    {AGING_METHODS[agingMethod].description}
                  </p>
                </div>

                {/* Line Selection & Tagging */}
                <div className="space-y-1.5 pt-2 border-t border-stone-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-stone-300">
                      Line to Age
                    </label>
                    {activeAgingDrawing && (
                      <span className="text-[10px] text-amber-400 font-mono">
                        {calculatePolylineLength(activeAgingDrawing.points).toFixed(1)}% length
                      </span>
                    )}
                  </div>

                  {visibleDrawings.length > 0 ? (
                    <div className="space-y-1.5">
                      <select
                        className="w-full bg-stone-800 border border-stone-700 text-stone-100 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden focus:border-amber-500 cursor-pointer"
                        value={activeAgingDrawing?.id || ''}
                        onChange={(e) => setSelectedAgingDrawingId(e.target.value)}
                      >
                        {visibleDrawings.map((d, i) => (
                          <option key={d.id} value={d.id}>
                            Line {i + 1} {d.lineCategory ? `— ${LINE_LABELS[d.lineCategory]}` : ''}
                          </option>
                        ))}
                      </select>

                      {/* Tag Active Line Category */}
                      {activeAgingDrawing && (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] text-stone-400 shrink-0">Classify:</span>
                          <select
                            className="w-full bg-stone-800/80 border border-stone-700/80 text-stone-200 rounded px-1.5 py-1 text-[11px] cursor-pointer"
                            value={activeAgingDrawing.lineCategory || agingLineCategory}
                            onChange={(e) =>
                              handleTagDrawingLineCategory(activeAgingDrawing.id, e.target.value as LineCategory)
                            }
                          >
                            <option value="line_life">Life Line (Āyur Rekhā)</option>
                            <option value="line_fate">Fate Line (Bhāgya Rekhā)</option>
                            <option value="line_heart">Heart Line (Hṛdaya Rekhā)</option>
                            <option value="line_head">Head Line (Mastiska Rekhā)</option>
                            <option value="line_sun">Sun Line (Sūrya Rekhā)</option>
                            <option value="other">Other Crease</option>
                          </select>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          returnToAgingAfterTraceRef.current = true;
                          setAgingLineCategory('line_life');
                          setMode('draw');
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-1 px-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded text-[10px] font-semibold transition-all cursor-pointer border border-stone-700/60"
                      >
                        <Edit3 className="w-3 h-3 text-amber-400" />
                        + Trace Another Line on Hand
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl space-y-2.5">
                      <div className="text-[11px] text-amber-200 font-medium leading-relaxed">
                        Cheiro's method requires a traced line to divide into <strong>14 equal 7-year cycles</strong> (7, 14, 21 ... 98 yrs).
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          returnToAgingAfterTraceRef.current = true;
                          setAgingLineCategory('line_life');
                          setMode('draw');
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Trace Line on Hand Now
                      </button>
                      <div className="text-[10px] text-stone-400 leading-tight">
                        Click above, drag along the line on the palm, and release. The 14-part Cheiro scale will automatically appear!
                      </div>
                    </div>
                  )}
                </div>

                {/* Lifespan Scale Setting */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                  <span className="text-[11px] text-stone-300">Max Lifespan (deśa-kāla):</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="50"
                      max="120"
                      className="w-14 bg-stone-800 border border-stone-700 text-stone-100 rounded px-1.5 py-0.5 text-xs text-center font-bold"
                      value={vedicData?.max_age ?? 75}
                      onChange={(e) => handleUpdateMaxAge(parseInt(e.target.value, 10) || 75)}
                    />
                    <span className="text-[10px] text-stone-400">yrs</span>
                  </div>
                </div>

                {/* Feature Toggles */}
                <div className="space-y-1.5 pt-2 border-t border-stone-800">
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-stone-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={showAllMethodsComparison}
                      onChange={(e) => setShowAllMethodsComparison(e.target.checked)}
                      className="rounded bg-stone-800 border-stone-700 text-amber-500 cursor-pointer"
                    />
                    <span>Compare All 3 Scales (Gold / Blue / Purple)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-stone-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={showArvindJiAxialGrid}
                      onChange={(e) => setShowArvindJiAxialGrid(e.target.checked)}
                      className="rounded bg-stone-800 border-stone-700 text-amber-500 cursor-pointer"
                    />
                    <span>Axial Grid (30-75-80 Geometry)</span>
                  </label>
                </div>

                {/* Milestone Summary & Helper */}
                {currentAgingTicks.length > 0 && (
                  <div className="pt-2 border-t border-stone-800 space-y-1">
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      Calculated Milestones ({currentAgingTicks.length} ticks)
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {currentAgingTicks.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-stone-800 border border-stone-700 text-amber-400"
                        >
                          Age {t.label}
                        </span>
                      ))}
                    </div>
                    <div className="text-[10px] text-stone-400 italic pt-1">
                      💡 Hover along the line to inspect age, or click on the line to log a milestone/event.
                    </div>
                  </div>
                )}

                {/* Logged Milestones on this Line */}
                {(() => {
                  const hudLineCategory = activeAgingDrawing?.lineCategory || agingLineCategory;
                  const hudLineData = (vedicData?.[hudLineCategory as keyof VedicData] as LineAnalysisData | null);
                  const loggedEvents = hudLineData?.age_events || [];

                  return (
                    <div className="pt-2 border-t border-stone-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1 text-amber-300">
                          <span>📍</span> Logged Events ({loggedEvents.length})
                        </span>
                        <span className="text-stone-400 font-normal">
                          {LINE_LABELS[hudLineCategory]?.split(' ')[0]}
                        </span>
                      </div>
                      {loggedEvents.length > 0 ? (
                        <div className="space-y-1 max-h-32 overflow-y-auto pr-0.5">
                          {loggedEvents.map((evt, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-1.5 p-1.5 bg-stone-800/90 rounded border border-stone-700/70 text-[11px]"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 shrink-0 border border-amber-500/30">
                                  Age {evt.age}
                                </span>
                                <span className="text-stone-200 truncate font-medium text-[10.5px]">
                                  {evt.event}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[10px] text-stone-400 italic">
                          Click anywhere on the line to log an age event or sign.
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Peeking Badge (when layers are hidden) */}
            {!showLayers && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-amber-600/90 backdrop-blur text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl animate-pulse flex items-center gap-1.5 pointer-events-none select-none">
                <EyeOff className="w-4 h-4" />
                Markings Hidden • Clean Hand View
              </div>
            )}

            {/* Aging Trace Mode Floating Hint */}
            {mode === 'draw' && returnToAgingAfterTraceRef.current && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-stone-900/95 backdrop-blur-md border border-amber-500/50 text-amber-200 px-4 py-2 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2.5">
                <span>✏️ Click &amp; drag on the palm to trace the line — release to plot Cheiro scale</span>
                <button
                  type="button"
                  onClick={() => {
                    returnToAgingAfterTraceRef.current = false;
                    setMode('aging');
                  }}
                  className="text-stone-400 hover:text-white underline text-[11px] cursor-pointer ml-1"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Scroll vs Zoom guidance hint */}
            {showScrollHint && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-stone-900/90 backdrop-blur text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xl border border-stone-700 pointer-events-none select-none flex items-center gap-2">
                <span>💡</span>
                <span>Hold <strong className="text-accent-gold">⌘</strong> or <strong className="text-accent-gold">pinch</strong> to zoom hand</span>
              </div>
            )}

            {/* Floating Zoom & Pan Controls HUD (Fixed at bottom right) */}
            <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1 bg-stone-900/90 backdrop-blur text-white px-2 py-1.5 rounded-xl border border-stone-750 shadow-2xl select-none">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 1.05}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Zoom Out (Mouse Wheel Down)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2 py-1 rounded-md text-[11px] font-mono font-bold hover:bg-stone-800 transition cursor-pointer"
                title="Reset to 100% Fit"
              >
                {Math.round(zoom * 100)}%
              </button>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 4.45}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Zoom In (Mouse Wheel Up)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              {zoom > 1.05 && (
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="ml-1 text-[10px] bg-accent-gold/25 hover:bg-accent-gold/40 text-accent-gold px-2 py-0.5 rounded font-bold transition cursor-pointer"
                  title="Fit image to screen"
                >
                  Fit
                </button>
              )}
            </div>

            {/* Subtle Zoom Hint at bottom left */}
            {zoom > 1.05 && mode !== 'pan' && (
              <div className="absolute bottom-3 left-3 z-30 bg-stone-900/70 backdrop-blur text-stone-300 text-[10px] px-2.5 py-1 rounded-lg border border-stone-800 pointer-events-none select-none">
                💡 Hold <span className="font-bold text-white">Spacebar</span> or use <span className="font-bold text-accent-gold">Pan</span> tool to move
              </div>
            )}
          </div>

          {/* Bottom status and tips bar */}
          <div
            className={`text-center text-xs font-medium px-2 py-1 transition ${isFullscreen ? 'text-stone-400 bg-stone-900' : 'text-stone-500'
              }`}
          >
            {activeView === 'd1_chart'
              ? '☸️ Viewing D-1 Rasi Chart.'
              : mode === 'pin'
                ? `Pin Mode: Click on the ${HAND_VIEW_LAB_ATTR(activeView)} to drop an analytical marker pin.`
                : mode === 'draw'
                  ? `Trace Mode: Click & drag to trace lines. Press Ctrl+Z / ⌘Z to undo mistakes anytime.`
                  : mode === 'pan'
                    ? `Pan Mode: Click & drag to pan around the zoomed image. Scroll wheel to zoom.`
                    : `Measure Mode: Drag the Blue line (Palm Height) and Green line (Finger Length) endpoints.`}
          </div>
        </>
      ) : (
        /* Upload Photo Placeholder */
        <div className="flex-1 min-h-[400px] border-2 border-dashed border-stone-250 bg-stone-50/50 rounded-xl flex flex-col items-center justify-center p-6 text-center gap-4 m-1">
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

      {/* Clear Drawings Confirm Modal */}
      <ConfirmModal
        isOpen={showClearDrawingsConfirm}
        title="Clear Drawn Lines?"
        message={`Are you sure you want to clear all drawn lines and strokes on the ${HAND_VIEW_LABELS[activeView]}? You can undo this action with Ctrl+Z.`}
        confirmText="Clear Lines"
        variant="danger"
        onConfirm={() => {
          const next = drawings.filter((d) => d.view !== activeView);
          onChangeDrawings(next);
          pushHistory(next, pins);
          setShowClearDrawingsConfirm(false);
        }}
        onCancel={() => setShowClearDrawingsConfirm(false)}
      />

      {/* Age Event Logging Modal */}
      {ageEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-stone-900">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-base">
                <Calendar className="w-5 h-5 text-accent-gold" />
                <span>Log Age Milestone</span>
              </div>
              <button
                type="button"
                onClick={() => setAgeEventModal(null)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Line & Location
                </label>
                <div className="p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 font-medium">
                  {LINE_LABELS[ageEventModal.lineCategory]}
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Estimated Age
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="120"
                    value={ageEventModal.age}
                    onChange={(e) =>
                      setAgeEventModal({
                        ...ageEventModal,
                        age: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="form-input text-sm font-bold text-stone-900 w-28 text-center"
                  />
                  <span className="text-stone-600 font-semibold">years</span>
                  <span className="text-[11px] text-stone-400 ml-auto font-mono">
                    ({AGING_METHODS[agingMethod].title})
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Palmistry Sign / Feature Observed
                </label>
                <select
                  value={ageEventModal.sign}
                  onChange={(e) =>
                    setAgeEventModal({
                      ...ageEventModal,
                      sign: e.target.value,
                    })
                  }
                  className="form-input text-xs w-full font-semibold cursor-pointer"
                >
                  <option value="Triangle △ (Property / Shield)">Triangle △ (Property / Shield / Wealth)</option>
                  <option value="Fish 🐟 (Spiritual / Prosperity)">Fish 🐟 (Spiritual / Prosperity)</option>
                  <option value="Star ✳ (Sudden impact / Renown)">Star ✳ (Sudden impact / Renown)</option>
                  <option value="Cross ✝ (Obstacle / Conflict)">Cross ✝ (Obstacle / Conflict / Heartbreak)</option>
                  <option value="Square □ (Protection / Bandhana)">Square □ (Protection / Shield / Bandhana)</option>
                  <option value="Island ⬭ (Health decline / Illness)">Island ⬭ (Health decline / Loss of vitality)</option>
                  <option value="Break / Gap (Life shift)">Break / Gap (Life shift / Relocation / Expansion)</option>
                  <option value="Upward Branch (Ambition / Rise)">Upward Branch (Ambition / Rise in career)</option>
                  <option value="Downward Branch (Loss of vitality)">Downward Branch (Loss of vitality / Sadness)</option>
                  <option value="Enemy Line / Cut (Rahu / Mars affliction)">Enemy Line / Cut (Rahu / Mars affliction)</option>
                  <option value="Supportive Line (Family support)">Supportive Line (Family support / Mars guardian)</option>
                  <option value="General Milestone">General Milestone / Life Event</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Event / Client Verification Notes
                </label>
                <textarea
                  rows={3}
                  value={ageEventModal.note}
                  onChange={(e) =>
                    setAgeEventModal({
                      ...ageEventModal,
                      note: e.target.value,
                    })
                  }
                  placeholder="e.g. Client bought commercial property in Pune; verified during consultation."
                  className="form-input text-xs w-full resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setAgeEventModal(null)}
                className="btn-outline px-3 py-2 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAgeEvent}
                className="btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Milestone & Place Pin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Quick helper
function HAND_VIEW_LAB_ATTR(view: HandView): string {
  if (view === 'd1_chart') return 'D-1 Rasi Chart';
  return view.includes('palm') ? 'palm' : 'back of hand';
}
