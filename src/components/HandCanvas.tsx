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
} from '@/lib/supabase';
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
  const [mode, setMode] = useState<'pin' | 'draw' | 'pan' | 'measure'>('pin');
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
      // Spacebar: enable temporary pan mode
      else if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
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

    if (mode === 'measure') return;

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
      };
      const updated = [...drawings, newDrawing];
      onChangeDrawings(updated);
      pushHistory(updated, pins);
    }
    setCurrentPoints([]);
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    setSelectedDrawingId(null);
    if (hasMovedSignificantlyRef.current || isPanning || isPanActive) return;
    if (mode === 'measure') return;
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
                            onMouseDown={(e) => e.stopPropagation()}
                            onMouseUp={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            onTouchEnd={(e) => {
                              e.stopPropagation();
                              setSelectedDrawingId(isSelected ? null : drawing.id);
                              onSelectPin(null);
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDrawingId(isSelected ? null : drawing.id);
                              onSelectPin(null);
                            }}
                            className="hover:stroke-rose-500/10 cursor-pointer"
                          >
                            <title>
                              {isSelected ? 'Selected line (Delete to remove)' : 'Click to select this line'}
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
                        className={`w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 border border-white shadow ${selectedPinId === pin.id
                            ? 'scale-125 ring-2 ring-offset-1 ring-offset-white ring-accent-gold shadow-md'
                            : 'hover:scale-110 shadow-sm'
                          }`}
                        style={{ backgroundColor: pin.color }}
                        title={pin.label}
                      >
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>

                      {/* Floating Pin Label Tooltip */}
                      <div
                        className={`absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none bg-stone-900/90 backdrop-blur px-2 py-0.5 rounded text-[9px] font-medium tracking-wide whitespace-nowrap text-white shadow-md z-30 transition-all duration-200 ${selectedPinId === pin.id
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
                          className="absolute -top-3.5 -right-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full px-1.5 py-0.5 border border-white transition-transform active:scale-95 shadow-md z-40 text-[8px] font-bold"
                          title="Remove marker (Delete key)"
                        >
                          Del
                        </button>
                      )}
                    </div>
                  ))}
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

            {/* Peeking Badge (when layers are hidden) */}
            {!showLayers && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-amber-600/90 backdrop-blur text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl animate-pulse flex items-center gap-1.5 pointer-events-none select-none">
                <EyeOff className="w-4 h-4" />
                Markings Hidden • Clean Hand View
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
    </div>
  );
}

// Quick helper
function HAND_VIEW_LAB_ATTR(view: HandView): string {
  if (view === 'd1_chart') return 'D-1 Rasi Chart';
  return view.includes('palm') ? 'palm' : 'back of hand';
}
