'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
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
  Target,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
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
  AgingCalibrationAnchors,
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
  getManibandhaMidpoint,
  Point2D,
  CADENCE_AGES,
  getDefaultCadencePoints,
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
  { name: 'Cyan (High Contrast)', value: '#06b6d4' },
  { name: 'Rose / Pink', value: '#f43f5e' },
  { name: 'Emerald Green', value: '#10b981' },
  { name: 'Electric Blue', value: '#3b82f6' },
  { name: 'Vivid Orange', value: '#f97316' },
  { name: 'Royal Purple', value: '#8b5cf6' },
  { name: 'Gold / Amber', value: '#f59e0b' },
  { name: 'Pure White', value: '#ffffff' },
  { name: 'Lime Green', value: '#84cc16' },
  { name: 'Deep Crimson', value: '#be123c' },
];

const OPACITY_OPTIONS = [
  { label: 'Ghost', value: 0.35, desc: '35% See-through (Maximum view of palm signs underneath)' },
  { label: 'Translucent', value: 0.65, desc: '65% Balanced (Clear line with visible palm creases)' },
  { label: 'Solid', value: 1.0, desc: '100% Solid line' },
];

const SIGN_OPTIONS = [
  'Triangle △ (Property / Shield / Wealth)',
  'Fish 🐟 (Spiritual / Prosperity)',
  'Star ✳ (Sudden impact / Renown)',
  'Cross ✝ (Obstacle / Conflict / Heartbreak)',
  'Square □ (Protection / Shield / Bandhana)',
  'Island ⬭ (Health decline / Loss of vitality)',
  'Break / Gap (Life shift / Relocation / Expansion)',
  'Upward Branch (Ambition / Rise in career)',
  'Downward Branch (Loss of vitality / Sadness)',
  'Enemy Line / Cut (Rahu / Mars affliction)',
  'Supportive Line (Family support / Mars guardian)',
  'General Milestone',
];

const THICKNESS_OPTIONS = [
  { label: 'Fine', value: 1.8, desc: '1.8px (Fine creases & signs)' },
  { label: 'Med', value: 2.8, desc: '2.8px (Standard lines)' },
  { label: 'Bold', value: 4.8, desc: '4.8px (Mounts & major paths)' },
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
  const { isAdmin } = useAdmin();
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWrapperRef = useRef<HTMLDivElement>(null);

  // Tools & Styling (default to 'pan' so clicking does not accidentally place pins)
  const [mode, setMode] = useState<'pin' | 'draw' | 'pan' | 'measure' | 'aging'>('pan');
  const [currentColor, setCurrentColor] = useState('#06b6d4');
  const [thickness, setThickness] = useState<number>(2.2);
  const [lineOpacity, setLineOpacity] = useState<number>(0.65);
  const [strokeStyle, setStrokeStyle] = useState<'solid' | 'dashed'>('solid');
  const [imageFilter, setImageFilter] = useState<ImageFilterId>('normal');
  const [showLayers, setShowLayers] = useState(true);
  const [showDrawings, setShowDrawings] = useState(true);
  const [showPins, setShowPins] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const isDrawingRef = useRef(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const currentPointsRef = useRef<{ x: number; y: number }[]>([]);
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
  const [agingTickDensity, setAgingTickDensity] = useState<'all' | 'major'>('major');
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

  // ─── 30-Midpoint Master & Cadence Calibration State ───
  const [activeCalibration, setActiveCalibration] = useState<{
    type: 'manibandha' | 'life' | 'fate' | 'cadence' | 'mercury';
    step: number;
    tempPoint?: Point2D | null;
    points?: Point2D[];
  } | null>(null);
  const [calibCursorPos, setCalibCursorPos] = useState<Point2D | null>(null);
  const [draggingCalibNode, setDraggingCalibNode] = useState<
    'manibandha_start' | 'manibandha_end' | 'life_start' | 'mercury_sandhi' | 'saturn_root' | 'mercury_heart_level' | 'mercury_base' | string | null
  >(null);
  const [showLifeCalibrationGrid, setShowLifeCalibrationGrid] = useState(true);
  const [showFateCalibrationGrid, setShowFateCalibrationGrid] = useState(true);
  const [showMercuryCalibrationScale, setShowMercuryCalibrationScale] = useState(true);
  const [isolateActiveAgingLine, setIsolateActiveAgingLine] = useState(true);
  const [showCadenceRays, setShowCadenceRays] = useState(true);
  const [showCadenceIntersections, setShowCadenceIntersections] = useState(true);
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
    editingIndex?: number;
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

  const handleEndInteractionRef = useRef<() => void>(() => {});
  useEffect(() => {
    handleEndInteractionRef.current = handleEndInteraction;
  });

  // Global pointer release listener to guarantee drawing/drag states terminate cleanly
  useEffect(() => {
    const handleGlobalPointerRelease = () => {
      handleEndInteractionRef.current();
    };
    window.addEventListener('mouseup', handleGlobalPointerRelease);
    window.addEventListener('touchend', handleGlobalPointerRelease);
    return () => {
      window.removeEventListener('mouseup', handleGlobalPointerRelease);
      window.removeEventListener('touchend', handleGlobalPointerRelease);
    };
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
    setActiveCalibration(null);
    setCalibCursorPos(null);
    returnToAgingAfterTraceRef.current = false;
    const isBackOrChart = view === 'right_back' || view === 'left_back' || view === 'd1_chart';
    if (isBackOrChart && (mode === 'measure' || mode === 'aging')) {
      setMode('pan');
    }
  };

  useEffect(() => {
    const isBackOrChart = activeView === 'right_back' || activeView === 'left_back' || activeView === 'd1_chart';
    if (isBackOrChart && (mode === 'measure' || mode === 'aging')) {
      setMode('pan');
    }
    setActiveCalibration(null);
    setCalibCursorPos(null);
  }, [activeView]);

  useEffect(() => {
    if (mode !== 'aging') {
      setActiveCalibration(null);
      setCalibCursorPos(null);
      setHoveredAgeData(null);
    }
  }, [mode]);

  // ─── Isometric Screen Distance & Vedic Measurement Unit Calculation ───
  // All measurements use the exact same Euclidean distance on screen, normalized to a standard 600px viewport baseline.
  // This guarantees that visual line lengths on screen are 100% proportional to their reported numerical units,
  // completely eliminating widescreen aspect-ratio distortions.
  const calcIsometricDistance = useCallback(
    (ax: number, ay: number, bx: number, by: number, overrideRect?: DOMRect | null): number => {
      const rect = overrideRect || containerRef.current?.getBoundingClientRect();
      const W = rect?.width && rect.width > 0 ? rect.width : 600;
      const H = rect?.height && rect.height > 0 ? rect.height : 600;
      // Convert percentage delta to actual physical screen pixels
      const dxScreen = ((bx - ax) * W) / 100;
      const dyScreen = ((by - ay) * H) / 100;
      const screenDist = Math.sqrt(dxScreen * dxScreen + dyScreen * dyScreen);
      // Normalize to 600px viewport reference height so units remain stable and invariant
      const normScale = H > 0 ? 600 / H : 1;
      return parseFloat((screenDist * normScale * 0.04).toFixed(1));
    },
    []
  );

  const computeMeasurements = useCallback(
    (m: typeof DEFAULT_MEASUREMENTS | null | undefined, overrideRect?: DOMRect | null) => {
      if (!m) return null;
      const palmLength = calcIsometricDistance(
        m.palm_start.x,
        m.palm_start.y,
        m.palm_end.x,
        m.palm_end.y,
        overrideRect
      );
      const fingerLength = calcIsometricDistance(
        m.finger_start.x,
        m.finger_start.y,
        m.finger_end.x,
        m.finger_end.y,
        overrideRect
      );
      const widthStartX = m.width_start?.x ?? DEFAULT_MEASUREMENTS.width_start.x;
      const widthStartY = m.width_start?.y ?? DEFAULT_MEASUREMENTS.width_start.y;
      const widthEndX = m.width_end?.x ?? DEFAULT_MEASUREMENTS.width_end.x;
      const widthEndY = m.width_end?.y ?? DEFAULT_MEASUREMENTS.width_end.y;
      const palmWidth = calcIsometricDistance(
        widthStartX,
        widthStartY,
        widthEndX,
        widthEndY,
        overrideRect
      );

      const shapeRatio = palmWidth / Math.max(0.1, palmLength);
      const palmShape: 'Square' | 'Rectangular' = shapeRatio >= 0.9 ? 'Square' : 'Rectangular';

      const ratio = fingerLength / Math.max(0.1, palmLength);
      let handTattva = '';
      if (palmShape === 'Rectangular') {
        if (ratio < 0.85) handTattva = 'Agni Tattva (Fiery Hand)';
        else if (ratio >= 0.9) handTattva = 'Jala Tattva (Watery Hand)';
        else handTattva = 'Mixed Hand (Agni-Jala Blend)';
      } else {
        if (ratio < 0.85) handTattva = 'Pṛthvī Tattva (Earthy Hand)';
        else if (ratio >= 0.9) handTattva = 'Vāyu Tattva (Airy Hand)';
        else handTattva = 'Mixed Hand (Air-Earth Blend)';
      }

      return {
        palmLength,
        palmWidth,
        fingerLength,
        palmShape,
        handTattva,
        shapeRatio,
        ratio,
      };
    },
    [calcIsometricDistance]
  );

  const liveMeasurements = useMemo(() => {
    return computeMeasurements(measurements);
  }, [computeMeasurements, measurements]);

  const livePalmLength =
    liveMeasurements?.palmLength ??
    (vedicData?.palm_length ? Number(vedicData.palm_length) : 10.0);
  const livePalmWidth =
    liveMeasurements?.palmWidth ??
    (vedicData?.palm_width ? Number(vedicData.palm_width) : 0.0);
  const liveFingerLength =
    liveMeasurements?.fingerLength ??
    (vedicData?.finger_length ? Number(vedicData.finger_length) : 0.0);
  const livePalmShape =
    liveMeasurements?.palmShape ?? vedicData?.palm_shape ?? 'Calculating...';
  const liveHandTattva =
    liveMeasurements?.handTattva ?? vedicData?.hand_tattva ?? '';
  const liveTattvaRatio = liveMeasurements
    ? (liveMeasurements.fingerLength / Math.max(0.1, liveMeasurements.palmLength)).toFixed(2)
    : vedicData?.finger_length && vedicData?.palm_length
      ? (Number(vedicData.finger_length) / Number(vedicData.palm_length)).toFixed(2)
      : '0.00';

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
    // Calibration tap mode takes precedence
    if (activeCalibration) {
      return;
    }

    // Middle click, pan mode, or spacebar held
    if (e.button === 1 || isPanActive) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    if (mode === 'measure' || mode === 'aging') return;

    if (mode === 'draw' && imageUrl) {
      if (agingLineCategory === 'line_manibandha') {
        const remaining = drawings.filter((d) => !(d.view === activeView && d.lineCategory === 'line_manibandha'));
        if (remaining.length !== drawings.length) {
          onChangeDrawings(remaining);
        }
      }
      isDrawingRef.current = true;
      const coords = getPointCoords(e.clientX, e.clientY);
      currentPointsRef.current = [coords];
      setIsDrawing(true);
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

    if (activeCalibration) {
      const coords = getPointCoords(e.clientX, e.clientY);
      setCalibCursorPos(coords);
      return;
    }

    if (draggingCalibNode) {
      const coords = getPointCoords(e.clientX, e.clientY);
      if (draggingCalibNode.startsWith('cadence_')) {
        const idx = parseInt(draggingCalibNode.replace('cadence_', ''), 10);
        if (!isNaN(idx) && calibAnchors?.cadence_points) {
          const updated = [...calibAnchors.cadence_points];
          updated[idx] = coords;
          updateAgingCalibration({ cadence_points: updated });
        }
      } else {
        updateAgingCalibration({ [draggingCalibNode]: coords });
      }
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
      if (agingMethod === 'mercury-56' && calibAnchors?.mercury_heart_level && calibAnchors?.mercury_base) {
        const p0 = calibAnchors.mercury_heart_level;
        const p56 = calibAnchors.mercury_base;
        const nearest = getNearestPointOnPolyline([p0, p56], coords);
        const hoverThreshold = Math.max(5.5, 9.0 / zoom);
        if (nearest && nearest.distance < hoverThreshold) {
          const age = parseFloat((nearest.fraction * 56).toFixed(1));
          setHoveredAgeData({
            age,
            point: nearest.point,
            fraction: nearest.fraction,
            label: age === 28 ? 'Age 28 (Marriage Midpoint)' : `Age ~${age} yrs`,
          });
          return;
        }
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

    if (mode === 'draw' && (isDrawing || isDrawingRef.current)) {
      hasMovedSignificantlyRef.current = true;
      const coords = getPointCoords(e.clientX, e.clientY);
      currentPointsRef.current.push(coords);
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
      if (activeCalibration) {
        return;
      }

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
        if (agingLineCategory === 'line_manibandha') {
          const remaining = drawings.filter((d) => !(d.view === activeView && d.lineCategory === 'line_manibandha'));
          if (remaining.length !== drawings.length) {
            onChangeDrawings(remaining);
          }
        }
        isDrawingRef.current = true;
        const coords = getPointCoords(e.touches[0].clientX, e.touches[0].clientY);
        currentPointsRef.current = [coords];
        setIsDrawing(true);
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

      if (activeCalibration && e.touches.length === 1) {
        const coords = getPointCoords(e.touches[0].clientX, e.touches[0].clientY);
        setCalibCursorPos(coords);
        return;
      }

      if (draggingCalibNode) {
        const coords = getPointCoords(e.touches[0].clientX, e.touches[0].clientY);
        if (draggingCalibNode.startsWith('cadence_')) {
          const idx = parseInt(draggingCalibNode.replace('cadence_', ''), 10);
          if (!isNaN(idx) && calibAnchors?.cadence_points) {
            const updated = [...calibAnchors.cadence_points];
            updated[idx] = coords;
            updateAgingCalibration({ cadence_points: updated });
          }
        } else {
          updateAgingCalibration({ [draggingCalibNode]: coords });
        }
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
        if (agingMethod === 'mercury-56' && calibAnchors?.mercury_heart_level && calibAnchors?.mercury_base) {
          const p0 = calibAnchors.mercury_heart_level;
          const p56 = calibAnchors.mercury_base;
          const nearest = getNearestPointOnPolyline([p0, p56], coords);
          const hoverThreshold = Math.max(6.0, 9.5 / zoom);
          if (nearest && nearest.distance < hoverThreshold) {
            const age = parseFloat((nearest.fraction * 56).toFixed(1));
            setHoveredAgeData({
              age,
              point: nearest.point,
              fraction: nearest.fraction,
              label: age === 28 ? 'Age 28 (Marriage Midpoint)' : `Age ~${age} yrs`,
            });
            return;
          }
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

      if (mode === 'draw' && (isDrawing || isDrawingRef.current)) {
        hasMovedSignificantlyRef.current = true;
        currentPointsRef.current.push(coords);
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

    // Handle calibration tap on quick touch
    if (
      activeCalibration &&
      imageUrl &&
      !hasMovedSignificantlyRef.current &&
      e.changedTouches.length === 1
    ) {
      const touch = e.changedTouches[0];
      const coords = getPointCoords(touch.clientX, touch.clientY);
      handleCalibrationClick(coords);
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

      const rect = containerRef.current?.getBoundingClientRect();
      const computed = computeMeasurements(updatedMeasurements, rect);

      const currentVedic = parseVedicData(profile.general_notes);
      currentVedic.measurements = updatedMeasurements;

      if (computed) {
        currentVedic.palm_length = computed.palmLength;
        currentVedic.finger_length = computed.fingerLength;
        currentVedic.palm_width = computed.palmWidth;
        currentVedic.palm_shape = computed.palmShape;
        currentVedic.hand_tattva = computed.handTattva;
      }

      onChangeProfile({
        ...profile,
        general_notes: serializeVedicData(currentVedic),
      });
    }
  };

  const handleEndInteraction = () => {
    if (draggingCalibNode) {
      if (
        (draggingCalibNode === 'manibandha_start' || draggingCalibNode === 'manibandha_end') &&
        calibAnchors?.manibandha_start &&
        calibAnchors?.manibandha_end
      ) {
        const cleanDrawings = drawings.filter(
          (d) => !(d.view === activeView && d.lineCategory === 'line_manibandha')
        );
        const updatedManibandha: Drawing = {
          id: crypto.randomUUID(),
          view: activeView,
          points: [calibAnchors.manibandha_start, calibAnchors.manibandha_end],
          color: '#f59e0b',
          thickness: 2.5,
          lineCategory: 'line_manibandha',
        };
        const updated = [...cleanDrawings, updatedManibandha];
        onChangeDrawings(updated);
        pushHistory(updated, pins);
      }
      setDraggingCalibNode(null);
      return;
    }

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

    const wasDrawing = isDrawing || isDrawingRef.current;
    isDrawingRef.current = false;
    setIsDrawing(false);

    if (mode === 'draw' && wasDrawing) {
      const finalPoints = currentPointsRef.current.length >= 2 ? currentPointsRef.current : currentPoints;
      if (finalPoints.length >= 2) {
        const isManibandha = agingLineCategory === 'line_manibandha';
        const newDrawing: Drawing = {
          id: crypto.randomUUID(),
          view: activeView,
          points: [...finalPoints],
          color: isManibandha ? '#f59e0b' : currentColor,
          thickness: thickness,
          label: strokeStyle === 'dashed' ? 'dashed' : undefined,
          lineCategory: agingLineCategory || 'line_life',
        };

        // Enforce ONLY ONE Maṇibandha Rekhā trace allowed per view: replace any existing one
        const baseDrawings = isManibandha
          ? drawings.filter((d) => !(d.view === activeView && d.lineCategory === 'line_manibandha'))
          : drawings;
        const updated = [...baseDrawings, newDrawing];

        onChangeDrawings(updated);
        pushHistory(updated, pins);
        setSelectedDrawingId(newDrawing.id);

        // Maṇibandha is only an anchor baseline to find its midpoint; do not select it for aging
        if (!isManibandha) {
          setSelectedAgingDrawingId(newDrawing.id);
        }

        if (returnToAgingAfterTraceRef.current) {
          returnToAgingAfterTraceRef.current = false;
          if (agingLineCategory === 'line_manibandha') {
            setAgingLineCategory(activeAgingDrawing?.lineCategory || 'line_life');
          }
          setShowDrawings(true);
          setMode('aging');
        }
      }
      currentPointsRef.current = [];
      setCurrentPoints([]);
    }
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    setSelectedDrawingId(null);
    if (hasMovedSignificantlyRef.current || isPanning || isPanActive) return;
    if (activeCalibration) {
      const coords = getPointCoords(e.clientX, e.clientY);
      handleCalibrationClick(coords);
      return;
    }
    if (mode === 'measure') return;
    if (mode === 'aging') {
      const lineToUse = activeAgingDrawing;
      if (hoveredAgeData) {
        setAgeEventModal({
          isOpen: true,
          age: hoveredAgeData.age,
          point: hoveredAgeData.point,
          lineCategory: agingMethod === 'mercury-56' ? 'line_marriage' : (lineToUse?.lineCategory || agingLineCategory),
          sign: agingMethod === 'mercury-56' ? 'Marriage Event / Union (Vivāha)' : 'Triangle △ (Property / Shield)',
          note: agingMethod === 'mercury-56' ? `Marriage / Vivāha timing at age ${hoveredAgeData.age}` : '',
        });
        setHoveredAgeData(null);
        return;
      }
      if (agingMethod === 'mercury-56' && calibAnchors?.mercury_heart_level && calibAnchors?.mercury_base) {
        const coords = getPointCoords(e.clientX, e.clientY);
        const p0 = calibAnchors.mercury_heart_level;
        const p56 = calibAnchors.mercury_base;
        const nearest = getNearestPointOnPolyline([p0, p56], coords);
        if (nearest && nearest.distance < 6.5) {
          const age = parseFloat((nearest.fraction * 56).toFixed(1));
          setAgeEventModal({
            isOpen: true,
            age,
            point: nearest.point,
            lineCategory: 'line_marriage',
            sign: 'Marriage Event / Union (Vivāha)',
            note: `Vivāha Rekhā mark at age ${age}`,
          });
          return;
        }
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
    returnToAgingAfterTraceRef.current = false;
    if (mode === 'measure') {
      setMode('pan');
      return;
    }
    setMode('measure');
    if (profile && onChangeProfile) {
      const currentVedic = parseVedicData(profile.general_notes);
      if (!currentVedic.measurements) {
        currentVedic.measurements = { ...DEFAULT_MEASUREMENTS };

        const initRect = containerRef.current?.getBoundingClientRect();
        const computed = computeMeasurements(DEFAULT_MEASUREMENTS, initRect);

        if (computed) {
          currentVedic.palm_length = computed.palmLength;
          currentVedic.finger_length = computed.fingerLength;
          currentVedic.palm_width = computed.palmWidth;
          currentVedic.palm_shape = computed.palmShape;
          currentVedic.hand_tattva = computed.handTattva;
        }

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
      setMode('pan');
      setHoveredAgeData(null);
      return;
    }
    setShowDrawings(true);
    setMode('aging');
    if (!selectedAgingDrawingId && visibleDrawings.length > 0) {
      setSelectedAgingDrawingId(visibleDrawings[0].id);
    }
  };

  const handleSelectAgingMethod = (method: AgingMethod) => {
    setAgingMethod(method);

    // Auto-focus the relevant palm line to prevent intermingling
    if (method === '18-6-cadence') {
      const heartD = visibleDrawings.find((d) => d.lineCategory === 'line_heart');
      if (heartD) {
        setSelectedAgingDrawingId(heartD.id);
        setAgingLineCategory('line_heart');
      }
    } else if (method === '30-midpoint') {
      const lifeOrFate = visibleDrawings.find(
        (d) => d.lineCategory === 'line_life' || d.lineCategory === 'line_fate'
      );
      if (lifeOrFate) {
        setSelectedAgingDrawingId(lifeOrFate.id);
        setAgingLineCategory(lifeOrFate.lineCategory || 'line_life');
      }
    } else if (method === 'mercury-56') {
      const marriageD = visibleDrawings.find(
        (d) => d.lineCategory === 'line_marriage' || d.lineCategory === 'line_mercury'
      );
      if (marriageD) {
        setSelectedAgingDrawingId(marriageD.id);
        setAgingLineCategory(marriageD.lineCategory || 'line_marriage');
      } else {
        setAgingLineCategory('line_marriage');
      }
    }

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
    const { age, point, lineCategory, sign, note, editingIndex } = ageEventModal;

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

    const eventText = `${sign}${note ? `: ${note}` : ''}`;

    if (editingIndex !== undefined && existingLine.age_events && existingLine.age_events[editingIndex]) {
      // Editing existing event
      const prevAge = existingLine.age_events[editingIndex].age;
      const updatedEvents = [...existingLine.age_events];
      updatedEvents[editingIndex] = { age, event: eventText };
      existingLine.age_events = updatedEvents;

      // Update matching pin label if any
      const nextPins = pins.map((p) => {
        if (p.view === activeView && (p.label.startsWith(`Age ${prevAge}:`) || p.label.startsWith(`Age ${age}:`))) {
          return {
            ...p,
            label: `Age ${age}: ${sign.split(' ')[0]}`,
            description: `${sign} on ${LINE_LABELS[lineCategory]}${note ? ` — ${note}` : ''}`,
          };
        }
        return p;
      });
      onChangePins(nextPins);
      pushHistory(drawings, nextPins);
    } else {
      // New event
      existingLine.age_events = [
        ...(existingLine.age_events || []),
        { age, event: eventText },
      ];

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
    }

    if (lineKey === 'line_life') currentVedic.line_life = existingLine;
    else if (lineKey === 'line_fate') currentVedic.line_fate = existingLine;
    else if (lineKey === 'line_head') currentVedic.line_head = existingLine;
    else if (lineKey === 'line_heart') currentVedic.line_heart = existingLine;
    else if (lineKey === 'line_sun') currentVedic.line_sun = existingLine;
    else if (lineKey === 'line_marriage') {
      if (!currentVedic.line_marriage) {
        currentVedic.line_marriage = {
          quality: 'Normal (Healthy)',
          formations: [],
          estimated_age: age,
          has_parasite_line_on_life: false,
          secondary_lines_count: '',
          venus_line_cutting: false,
          reaches_sun_mount: false,
          cuts_sun_mount: false,
          crosses_heart_line: false,
          notes: eventText,
        };
      } else {
        currentVedic.line_marriage.estimated_age = age;
        if (note) {
          currentVedic.line_marriage.notes = `${currentVedic.line_marriage.notes ? currentVedic.line_marriage.notes + '; ' : ''}${eventText}`;
        }
      }
    }

    onChangeProfile({
      ...profile,
      general_notes: serializeVedicData(currentVedic),
    });

    setAgeEventModal(null);
  };

  const handleDeleteAgeEvent = (lineCategory: LineCategory, eventIndex: number) => {
    if (!profile || !onChangeProfile) return;
    const currentVedic = parseVedicData(profile.general_notes);
    const lineKey = lineCategory as keyof VedicData;
    const existingLine = currentVedic[lineKey] as LineAnalysisData | null;
    if (!existingLine || !existingLine.age_events) return;

    const targetEvent = existingLine.age_events[eventIndex];
    const updatedEvents = existingLine.age_events.filter((_, i) => i !== eventIndex);
    existingLine.age_events = updatedEvents;

    if (lineKey === 'line_life') currentVedic.line_life = existingLine;
    else if (lineKey === 'line_fate') currentVedic.line_fate = existingLine;
    else if (lineKey === 'line_head') currentVedic.line_head = existingLine;
    else if (lineKey === 'line_heart') currentVedic.line_heart = existingLine;
    else if (lineKey === 'line_sun') currentVedic.line_sun = existingLine;

    if (targetEvent) {
      const remainingPins = pins.filter(
        (p) => !(p.view === activeView && p.label.startsWith(`Age ${targetEvent.age}:`))
      );
      if (remainingPins.length !== pins.length) {
        onChangePins(remainingPins);
        pushHistory(drawings, remainingPins);
      }
    }

    onChangeProfile({
      ...profile,
      general_notes: serializeVedicData(currentVedic),
    });

    setAgeEventModal(null);
  };

  // Active aging line computations
  const currentSelectedDrawing = visibleDrawings.find((d) => d.id === selectedAgingDrawingId) || null;
  const palmDrawings = visibleDrawings.filter((d) => d.lineCategory !== 'line_manibandha');
  const activeAgingDrawing =
    (currentSelectedDrawing && currentSelectedDrawing.lineCategory !== 'line_manibandha' ? currentSelectedDrawing : null) ||
    visibleDrawings.find((d) => d.lineCategory === agingLineCategory && d.lineCategory !== 'line_manibandha') ||
    palmDrawings[0] ||
    null;
  const lineToClassify = (currentSelectedDrawing && currentSelectedDrawing.lineCategory !== 'line_manibandha' ? currentSelectedDrawing : null) || activeAgingDrawing;

  // All classical aging methods available in system
  const allAgingMethods = useMemo(() => Object.values(AGING_METHODS), []);

  // ─── 30-Midpoint Master Calibration (Vedic Aging) Handlers ───
  const calibAnchors: AgingCalibrationAnchors | null = useMemo(() => {
    if (vedicData?.aging_calibrations?.[activeView]) {
      return vedicData.aging_calibrations[activeView] || null;
    }
    // Backward compatibility: if activeView is right_palm and legacy aging_calibration exists
    if (activeView === 'right_palm' && vedicData?.aging_calibration) {
      return vedicData.aging_calibration;
    }
    return null;
  }, [vedicData?.aging_calibrations, vedicData?.aging_calibration, activeView]);

  const updateAgingCalibration = useCallback(
    (patch: Partial<AgingCalibrationAnchors>) => {
      if (!profile || !onChangeProfile) return;
      const currentVedic = parseVedicData(profile.general_notes);
      const currentCalibs = { ...(currentVedic.aging_calibrations || {}) };
      const currentViewCalib =
        currentCalibs[activeView] ||
        (activeView === 'right_palm' ? currentVedic.aging_calibration : null) ||
        {};
      const updatedCalib: AgingCalibrationAnchors = {
        ...currentViewCalib,
        ...patch,
      };
      currentCalibs[activeView] = updatedCalib;
      currentVedic.aging_calibrations = currentCalibs;
      if (activeView === 'right_palm') {
        currentVedic.aging_calibration = updatedCalib;
      }
      onChangeProfile({
        ...profile,
        general_notes: serializeVedicData(currentVedic),
      });
    },
    [profile, onChangeProfile, activeView]
  );

  const clearAgingCalibration = useCallback(
    (keys?: Array<keyof AgingCalibrationAnchors>) => {
      if (!profile || !onChangeProfile) return;
      const currentVedic = parseVedicData(profile.general_notes);
      const currentCalibs = { ...(currentVedic.aging_calibrations || {}) };
      if (!keys) {
        delete currentCalibs[activeView];
        if (activeView === 'right_palm') {
          currentVedic.aging_calibration = null;
        }
      } else if (currentCalibs[activeView]) {
        const updated = { ...currentCalibs[activeView] };
        keys.forEach((k) => delete updated[k]);
        currentCalibs[activeView] = updated;
        if (activeView === 'right_palm') {
          currentVedic.aging_calibration = updated;
        }
      }
      currentVedic.aging_calibrations = currentCalibs;
      onChangeProfile({
        ...profile,
        general_notes: serializeVedicData(currentVedic),
      });
    },
    [profile, onChangeProfile, activeView]
  );

  const handleCalibrationClick = useCallback(
    (coords: Point2D) => {
      if (!activeCalibration) return;
      const { type, step, tempPoint } = activeCalibration;

      if (type === 'manibandha') {
        if (step === 1) {
          setActiveCalibration({ type: 'manibandha', step: 2, tempPoint: coords });
        } else {
          const p1 = tempPoint!;
          const p2 = coords;
          // Create or replace line_manibandha drawing as a clean straight 2-point line
          const cleanDrawings = drawings.filter(
            (d) => !(d.view === activeView && d.lineCategory === 'line_manibandha')
          );
          const newManibandha: Drawing = {
            id: crypto.randomUUID(),
            view: activeView,
            points: [p1, p2],
            color: '#f59e0b',
            thickness: 2.5,
            lineCategory: 'line_manibandha',
          };
          const updated = [...cleanDrawings, newManibandha];
          onChangeDrawings(updated);
          pushHistory(updated, pins);

          updateAgingCalibration({
            manibandha_start: p1,
            manibandha_end: p2,
          });
          setActiveCalibration(null);
        }
        return;
      }

      if (type === 'life') {
        if (step === 1) {
          setActiveCalibration({ type: 'life', step: 2, tempPoint: coords });
        } else {
          const p1 = tempPoint!;
          const p2 = coords;
          updateAgingCalibration({
            life_start: p1,
            mercury_sandhi: p2,
          });
          setActiveCalibration(null);
        }
        return;
      }

      if (type === 'fate') {
        updateAgingCalibration({
          saturn_root: coords,
        });
        setActiveCalibration(null);
        return;
      }

      if (type === 'mercury') {
        if (step === 1) {
          setActiveCalibration({ type: 'mercury', step: 2, tempPoint: coords });
        } else {
          const p1 = tempPoint!;
          const p2 = coords;
          // In screen coords, Y=0 is top (fingers) and Y=100 is bottom (wrist).
          // Heart line level on percussion is lower on palm (larger Y) = Age 0
          // Mercury finger root crease is higher on palm (smaller Y) = Age 56
          const heartLevel = p1.y >= p2.y ? p1 : p2;
          const fingerBase = p1.y >= p2.y ? p2 : p1;

          updateAgingCalibration({
            mercury_heart_level: heartLevel,
            mercury_base: fingerBase,
          });
          setActiveCalibration(null);
          setCalibCursorPos(null);
        }
        return;
      }

      if (type === 'cadence') {
        const prevPoints = activeCalibration.points || [];
        const nextPoints = [...prevPoints, coords];
        if (step < 8) {
          setActiveCalibration({
            type: 'cadence',
            step: step + 1,
            points: nextPoints,
          });
        } else {
          updateAgingCalibration({
            cadence_points: nextPoints,
          });
          setActiveCalibration(null);
          setCalibCursorPos(null);
        }
        return;
      }
    },
    [activeCalibration, drawings, activeView, pins, onChangeDrawings, pushHistory, updateAgingCalibration]
  );

  const getCalibrationPrompt = () => {
    if (!activeCalibration) return '';
    const { type, step } = activeCalibration;
    if (type === 'mercury') {
      return step === 1
        ? '📍 Tap 1 of 2: Tap Heart Line level on outer palm percussion (Age 0)'
        : '📍 Tap 2 of 2: Tap root crease of Mercury (little) finger (Age 56)';
    }
    if (type === 'cadence') {
      const stepIdx = (step as number) - 1;
      const age = CADENCE_AGES[stepIdx] ?? 0;
      const fingerNames = activeView === 'right_palm'
        ? [
            'Mercury outer edge / percussion (Age 0)',
            'Mercury / Sun cleft (Age 18)',
            'Sun finger base (Age 24)',
            'Sun / Saturn cleft (Age 42)',
            'Saturn finger base (Age 48)',
            'Saturn / Jupiter cleft (Age 66)',
            'Jupiter finger base (Age 72)',
            'Jupiter radial edge (Age 90)',
          ]
        : [
            'Mercury outer edge / percussion (Age 0)',
            'Mercury / Sun cleft (Age 18)',
            'Sun finger base (Age 24)',
            'Sun / Saturn cleft (Age 42)',
            'Saturn finger base (Age 48)',
            'Saturn / Jupiter cleft (Age 66)',
            'Jupiter finger base (Age 72)',
            'Jupiter radial edge (Age 90)',
          ];
      return `📍 Tap ${step} of 8: Age ${age} at finger base (${fingerNames[stepIdx] || ''})`;
    }
    if (type === 'manibandha') {
      return step === 1
        ? '📍 Tap 1 of 2: Tap LEFT edge of the 1st Maṇibandha wrist bracelet'
        : '📍 Tap 2 of 2: Tap RIGHT edge of the wrist bracelet';
    }
    if (type === 'life') {
      return step === 1
        ? '📍 Tap 1 of 2: Tap where Life Line starts (between thumb & index finger)'
        : '📍 Tap 2 of 2: Tap outer edge crease under Mercury (little) finger';
    }
    if (type === 'fate') {
      return '📍 Tap 1 of 1: Tap the base joint of middle (Saturn) finger on Saturn Mount';
    }
    return '';
  };

  // Maṇibandha Rekhā and Kendra (50% Midpoint) detection
  const manibandhaDrawing = visibleDrawings.find((d) => d.lineCategory === 'line_manibandha') || null;
  const manibandhaData = useMemo(() => {
    if (manibandhaDrawing && manibandhaDrawing.points.length >= 2) {
      return getManibandhaMidpoint(
        manibandhaDrawing.points,
        containerRef.current?.getBoundingClientRect()
      );
    }
    if (calibAnchors?.manibandha_start && calibAnchors?.manibandha_end) {
      return getManibandhaMidpoint(
        [calibAnchors.manibandha_start, calibAnchors.manibandha_end],
        containerRef.current?.getBoundingClientRect()
      );
    }
    return null;
  }, [manibandhaDrawing, calibAnchors?.manibandha_start, calibAnchors?.manibandha_end]);

  // Derived 30-Midpoint & T-Frame Geometry
  const calibrationGeometry = useMemo(() => {
    const mk = manibandhaData?.midpoint || null;
    const lifeStart = calibAnchors?.life_start || null;
    const mercurySandhi = calibAnchors?.mercury_sandhi || null;
    const saturnRoot = calibAnchors?.saturn_root || null;
    const maxAge = vedicData?.max_age ?? 75;

    // Dynamically calculate post-30 halving labels based on configurable max lifespan
    const midAfter30 = (30 + maxAge) / 2;
    const q1After30 = (30 + midAfter30) / 2;
    const q2After30 = (q1After30 + midAfter30) / 2;

    const label52_5 = Number.isInteger(midAfter30) ? `${midAfter30}` : `${midAfter30.toFixed(1)}`;
    const label41_25 = Number.isInteger(q1After30) ? `${q1After30}` : `${parseFloat(q1After30.toFixed(2))}`;
    const label47 = Number.isInteger(q2After30) ? `${q2After30}` : `${Math.round(q2After30)}`;

    let life7_5: Point2D | null = null;
    let life15: Point2D | null = null;
    let life22_5: Point2D | null = null;
    let life30: Point2D | null = null;
    let life41_25: Point2D | null = null;
    let life47: Point2D | null = null;
    let life52_5: Point2D | null = null;

    if (lifeStart && mk) {
      // Age 30 is the true 50% geometric midpoint between Life origin (L0) and Maṇibandha Kendra (MK)
      life30 = {
        x: (lifeStart.x + mk.x) / 2,
        y: (lifeStart.y + mk.y) / 2,
      };

      // Binary halving before Age 30 (towards L0 / Age 0):
      life15 = {
        x: (lifeStart.x + life30.x) / 2,
        y: (lifeStart.y + life30.y) / 2,
      };
      life7_5 = {
        x: (lifeStart.x + life15.x) / 2,
        y: (lifeStart.y + life15.y) / 2,
      };
      life22_5 = {
        x: (life15.x + life30.x) / 2,
        y: (life15.y + life30.y) / 2,
      };

      // Binary halving after Age 30 (towards MK / maxAge):
      life52_5 = {
        x: (life30.x + mk.x) / 2,
        y: (life30.y + mk.y) / 2,
      };
      life41_25 = {
        x: (life30.x + life52_5.x) / 2,
        y: (life30.y + life52_5.y) / 2,
      };
      life47 = {
        x: (life41_25.x + life52_5.x) / 2,
        y: (life41_25.y + life52_5.y) / 2,
      };
    }

    let fate15: Point2D | null = null;
    let fate22_5: Point2D | null = null;
    let fate30: Point2D | null = null;
    let fate41_25: Point2D | null = null;
    let fate47: Point2D | null = null;
    let fate52_5: Point2D | null = null;

    if (saturnRoot && mk) {
      // Midpoint: Age 30
      fate30 = {
        x: (mk.x + saturnRoot.x) / 2,
        y: (mk.y + saturnRoot.y) / 2,
      };

      // Halving before 30 (towards MK / Age 0):
      fate15 = {
        x: (mk.x + fate30.x) / 2,
        y: (mk.y + fate30.y) / 2,
      };
      fate22_5 = {
        x: (fate15.x + fate30.x) / 2,
        y: (fate15.y + fate30.y) / 2,
      };

      // Halving after 30 (towards Saturn Root / maxAge):
      fate52_5 = {
        x: (fate30.x + saturnRoot.x) / 2,
        y: (fate30.y + saturnRoot.y) / 2,
      };
      fate41_25 = {
        x: (fate30.x + fate52_5.x) / 2,
        y: (fate30.y + fate52_5.y) / 2,
      };
      fate47 = {
        x: (fate41_25.x + fate52_5.x) / 2,
        y: (fate41_25.y + fate52_5.y) / 2,
      };
    }

    return {
      mk,
      lifeStart,
      mercurySandhi,
      life7_5,
      life15,
      life22_5,
      life30,
      life41_25,
      life47,
      life52_5,
      saturnRoot,
      fate15,
      fate22_5,
      fate30,
      fate41_25,
      fate47,
      fate52_5,
      maxAge,
      label52_5,
      label41_25,
      label47,
    };
  }, [calibAnchors, manibandhaData, vedicData?.max_age]);

  const currentAgingTicks =
    activeAgingDrawing && activeAgingDrawing.points.length > 1 && agingMethod !== '18-6-cadence'
      ? computeAgeTicks(
        activeAgingDrawing.points,
        agingMethod,
        activeAgingDrawing.lineCategory || agingLineCategory,
        vedicData?.max_age ?? 75,
        containerRef.current?.getBoundingClientRect()
      )
      : [];

  const comparisonCheiroTicks =
    activeAgingDrawing && showAllMethodsComparison && activeAgingDrawing.points.length > 1
      ? computeAgeTicks(
        activeAgingDrawing.points,
        'cheiro-98',
        activeAgingDrawing.lineCategory || agingLineCategory,
        98,
        containerRef.current?.getBoundingClientRect()
      )
      : [];

  const comparisonShadamshaTicks =
    activeAgingDrawing && showAllMethodsComparison && activeAgingDrawing.points.length > 1
      ? computeAgeTicks(
        activeAgingDrawing.points,
        'shadamsha-72',
        activeAgingDrawing.lineCategory || agingLineCategory,
        72,
        containerRef.current?.getBoundingClientRect()
      )
      : [];

  // Collision-free, strictly monotonic layout for aging ticks & badges (no zigzag stalks, no overlaps, no order inversions)
  const agingTickLayouts = useMemo(() => {
    if (!currentAgingTicks || currentAgingTicks.length === 0) return [];

    // 1. Calculate base coordinates with uniform, clean tick lengths (no zigzag stalks!)
    const items = currentAgingTicks.map((tick, idx) => {
      const tickLen = tick.isMajor ? 1.6 : 1.1;
      const x1 = tick.point.x - tick.normal.x * 0.4;
      const y1 = tick.point.y - tick.normal.y * 0.4;
      const x2 = tick.point.x + tick.normal.x * tickLen;
      const y2 = tick.point.y + tick.normal.y * tickLen;

      // Badge sits cleanly at tick tip with uniform, gentle offset
      const textOffset = tickLen + 0.8;
      const textX = tick.point.x + tick.normal.x * textOffset;
      const textY = tick.point.y + tick.normal.y * textOffset;

      // Compact micro-badge dimensions (prevents bulky box collisions)
      const badgeW = tick.label.length > 2 ? 2.8 : tick.label.length === 2 ? 2.3 : 1.7;
      const badgeH = 1.3;

      return {
        tick,
        idx,
        x1,
        y1,
        x2,
        y2,
        textX,
        textY,
        badgeW,
        badgeH,
        showLabel: false,
      };
    });

    // 2. Pass 1: Prioritize MAJOR milestones first (14, 28, 42, 56, 70, 84, 98)
    const placedBadges: typeof items = [];

    for (const item of items) {
      if (item.tick.isMajor || item.tick.age === 0 || item.tick.age === 28 || item.tick.age === 56) {
        item.showLabel = true;
        placedBadges.push(item);
      }
    }

    // 3. Pass 2: If 'all' mode is selected, try to place minor milestones ONLY if they have clearance
    if (agingTickDensity === 'all') {
      for (const item of items) {
        if (!item.tick.isMajor) {
          // Check collision against all already-placed badges
          const collides = placedBadges.some((p) => {
            const dx = Math.abs(item.textX - p.textX);
            const dy = Math.abs(item.textY - p.textY);
            const reqX = (item.badgeW + p.badgeW) / 2 + 0.35;
            const reqY = (item.badgeH + p.badgeH) / 2 + 0.35;
            return dx < reqX && dy < reqY;
          });

          if (!collides) {
            item.showLabel = true;
            placedBadges.push(item);
          }
        }
      }
    }

    return items;
  }, [currentAgingTicks, agingTickDensity]);

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

        {/* Fullscreen & Granular Layer Visibility Controls */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Granular Visibility: Lines & Pins */}
          <div
            className={`flex items-center p-1 rounded-xl border gap-1 text-xs shadow-2xs ${isFullscreen
              ? 'bg-stone-850 border-stone-750'
              : 'bg-stone-100/90 border-stone-250/80'
              }`}
          >
            {/* Toggle Lines */}
            <button
              type="button"
              onClick={() => setShowDrawings((prev) => !prev)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${showDrawings
                ? isFullscreen
                  ? 'bg-stone-700 text-amber-300 shadow-2xs'
                  : 'bg-white text-stone-800 shadow-2xs'
                : 'text-stone-400 hover:text-stone-600 opacity-60 line-through'
                }`}
              title={showDrawings ? 'Hide traced lines' : 'Show traced lines'}
            >
              {showDrawings ? <Eye className="w-3.5 h-3.5 text-amber-500" /> : <EyeOff className="w-3.5 h-3.5 text-stone-400" />}
              <span>Lines</span>
              <span className="text-[10px] text-stone-400 font-mono">({visibleDrawings.length})</span>
            </button>

            {/* Toggle Pins */}
            <button
              type="button"
              onClick={() => setShowPins((prev) => !prev)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${showPins
                ? isFullscreen
                  ? 'bg-stone-700 text-amber-300 shadow-2xs'
                  : 'bg-white text-stone-800 shadow-2xs'
                : 'text-stone-400 hover:text-stone-600 opacity-60 line-through'
                }`}
              title={showPins ? 'Hide markers & pins' : 'Show markers & pins'}
            >
              {showPins ? <Eye className="w-3.5 h-3.5 text-amber-500" /> : <EyeOff className="w-3.5 h-3.5 text-stone-400" />}
              <span>Pins</span>
              <span className="text-[10px] text-stone-400 font-mono">({visiblePins.length})</span>
            </button>
          </div>

          {/* Master Peek (Clean Hand) Button */}
          <button
            type="button"
            onClick={() => setShowLayers((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${!showLayers
              ? 'bg-amber-600 text-white border-amber-700 shadow-xs font-bold'
              : isFullscreen
                ? 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            title={showLayers ? 'Hide All Markings (Peek clean hand • Press H)' : 'Show Markings (Press H)'}
          >
            {showLayers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-xs font-medium">
              {showLayers ? 'All Layers' : 'Peeking'}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl border text-xs flex items-center justify-center transition cursor-pointer ${isFullscreen
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
            isAdmin ? (
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
            ) : null
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

                  {/* Mode buttons with prominent active styling */}
                  <div className={`inline-flex items-center p-1 rounded-xl border gap-1 shadow-2xs ${isFullscreen
                    ? 'bg-stone-900 border-stone-750'
                    : 'bg-stone-100/90 border-stone-250/80'
                    }`}>
                    {/* 1. Pan (Default & primary navigation) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        returnToAgingAfterTraceRef.current = false;
                        setMode('pan');
                      }}
                      className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${mode === 'pan'
                        ? 'bg-amber-600 text-white font-bold shadow-xs ring-1 ring-amber-700/50'
                        : isFullscreen
                          ? 'bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 border border-stone-700 font-medium'
                          : 'bg-white text-stone-700 hover:text-stone-950 hover:bg-stone-50 border border-stone-200/90 font-medium shadow-2xs'
                        }`}
                      title="Pan & Zoom (Default: Drag to move hand, scroll to zoom)"
                    >
                      <Hand className={`w-3.5 h-3.5 ${mode === 'pan' ? 'text-white' : 'text-stone-500'}`} />
                      <span>Pan</span>
                      {mode === 'pan' && <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5"></span>}
                    </button>

                    {/* 2. Pins */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        returnToAgingAfterTraceRef.current = false;
                        setShowPins(true);
                        setMode('pin');
                      }}
                      className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${mode === 'pin'
                        ? 'bg-amber-600 text-white font-bold shadow-xs ring-1 ring-amber-700/50'
                        : isFullscreen
                          ? 'bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 border border-stone-700 font-medium'
                          : 'bg-white text-stone-700 hover:text-stone-950 hover:bg-stone-50 border border-stone-200/90 font-medium shadow-2xs'
                        }`}
                      title="Place Pins (Click on hand to place markers)"
                    >
                      <MapPin className={`w-3.5 h-3.5 ${mode === 'pin' ? 'text-white' : 'text-stone-500'}`} />
                      <span>Pins</span>
                      {mode === 'pin' && <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5"></span>}
                    </button>

                    {/* 3. Trace */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        returnToAgingAfterTraceRef.current = false;
                        setShowDrawings(true);
                        setMode('draw');
                      }}
                      className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${mode === 'draw'
                        ? 'bg-amber-600 text-white font-bold shadow-xs ring-1 ring-amber-700/50'
                        : isFullscreen
                          ? 'bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 border border-stone-700 font-medium'
                          : 'bg-white text-stone-700 hover:text-stone-950 hover:bg-stone-50 border border-stone-200/90 font-medium shadow-2xs'
                        }`}
                      title="Trace Lines (Click & drag to trace palm lines)"
                    >
                      <Edit3 className={`w-3.5 h-3.5 ${mode === 'draw' ? 'text-white' : 'text-stone-500'}`} />
                      <span>Trace</span>
                      {mode === 'draw' && <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5"></span>}
                    </button>

                    {/* 4. Measure & 5. Aging Ruler (Only for front palm views) */}
                    {(activeView === 'right_palm' || activeView === 'left_palm') && (
                      <>
                        <button
                          type="button"
                          onClick={handleSetMeasureMode}
                          className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${mode === 'measure'
                            ? 'bg-amber-600 text-white font-bold shadow-xs ring-1 ring-amber-700/50'
                            : !profile
                              ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed opacity-50'
                              : isFullscreen
                                ? 'bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 border border-stone-700 font-medium'
                                : 'bg-white text-stone-700 hover:text-stone-950 hover:bg-stone-50 border border-stone-200/90 font-medium shadow-2xs'
                            }`}
                          title="Measure Hand (Align handles for palm/finger ratios)"
                          disabled={!profile}
                        >
                          <Ruler className={`w-3.5 h-3.5 ${mode === 'measure' ? 'text-white' : 'text-stone-500'}`} />
                          <span>Measure</span>
                          {mode === 'measure' && <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5"></span>}
                        </button>

                        <button
                          type="button"
                          onClick={handleSetAgingMode}
                          className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${mode === 'aging'
                            ? 'bg-amber-600 text-white font-bold shadow-xs ring-1 ring-amber-700/50'
                            : isFullscreen
                              ? 'bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 border border-stone-700 font-medium'
                              : 'bg-white text-stone-700 hover:text-stone-950 hover:bg-stone-50 border border-stone-200/90 font-medium shadow-2xs'
                            }`}
                          title="Aging Ruler & Grid (Calculate age milestones along lines & axial geometry)"
                        >
                          <Clock className={`w-3.5 h-3.5 ${mode === 'aging' ? 'text-white' : 'text-stone-500'}`} />
                          <span>Aging Ruler</span>
                          {mode === 'aging' && <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5"></span>}
                        </button>
                      </>
                    )}
                  </div>
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

                  {/* Admin Photo Removal for Active View */}
                  {isAdmin && imageUrl && (
                    confirmRemovePhoto ? (
                      <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg p-0.5 animate-pulse">
                        <span className="text-[10px] text-rose-700 font-bold px-1">Remove photo?</span>
                        <button
                          type="button"
                          onClick={() => {
                            onRemoveImageForView(activeView);
                            setConfirmRemovePhoto(false);
                          }}
                          className="bg-rose-600 text-white px-2 py-0.5 text-[10px] font-bold rounded shadow-xs cursor-pointer"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmRemovePhoto(false)}
                          className="text-stone-500 px-1.5 py-0.5 text-[10px] cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmRemovePhoto(true);
                          setTimeout(() => setConfirmRemovePhoto(false), 5000);
                        }}
                        className="btn-outline border-rose-200 text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 text-xs flex items-center gap-1 cursor-pointer"
                        title="Remove uploaded photo for this view (Admin Only)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove Photo
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Sub-bar: Color Palette & Line Settings (When Draw, Pin, or Aging Mode is active) */}
              {(mode === 'draw' || mode === 'pin' || mode === 'aging') && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-stone-200/80">
                  <div className="flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-stone-500" />
                    <div className="flex gap-1 items-center">
                      {COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => {
                            setCurrentColor(color.value);
                            if (mode === 'aging' && activeAgingDrawing) {
                              const updated = drawings.map((d) =>
                                d.id === activeAgingDrawing.id ? { ...d, color: color.value } : d
                              );
                              onChangeDrawings(updated);
                            }
                          }}
                          className="relative w-5 h-5 rounded-full flex items-center justify-center border border-stone-300 transition-transform active:scale-95 shadow-xs"
                          style={{ backgroundColor: color.value }}
                          title={mode === 'aging' ? `Change line color to ${color.name}` : color.name}
                        >
                          {currentColor === color.value && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full shadow" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {/* Line Transparency / Opacity Selector (See-through so palm signs underneath are visible!) */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-stone-500 font-semibold hidden sm:inline">See-Through:</span>
                      <div className="flex items-center gap-0.5 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                        {OPACITY_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setLineOpacity(opt.value)}
                            className={`px-2 py-0.5 rounded text-[10.5px] font-medium transition ${lineOpacity === opt.value
                              ? 'bg-white text-stone-900 shadow-xs font-bold'
                              : 'text-stone-500 hover:text-stone-800'
                              }`}
                            title={opt.desc}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {mode === 'draw' && (
                      <>
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
                      </>
                    )}
                  </div>
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
                  : activeCalibration
                    ? 'crosshair'
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
                    {showDrawings &&
                      visibleDrawings.map((drawing) => {
                      const pointsString = drawing.points
                        .map((p) => `${p.x},${p.y}`)
                        .join(' ');
                      const isSelected = selectedDrawingId === drawing.id;
                      const isDashed = drawing.label === 'dashed';

                      return (
                        <g key={drawing.id} className={`group ${mode === 'draw' ? 'pointer-events-none' : 'cursor-pointer'}`}>
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
                            strokeOpacity={lineOpacity}
                            strokeDasharray={isDashed ? '4,3' : undefined}
                            vectorEffect="non-scaling-stroke"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-all"
                            style={{
                              opacity: lineOpacity,
                              filter: isSelected
                                ? 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.4))'
                                : `drop-shadow(0 1px 2px rgba(0,0,0,0.2))`,
                            }}
                          />
                          {/* Thick overlay for easy click selection (only rendered in pan or aging mode) */}
                          {mode !== 'draw' && (
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
                                if (drawing.lineCategory === 'line_manibandha') {
                                  // Maṇibandha is only an anchor baseline to find its midpoint; no aging on it
                                  return;
                                }
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
                                if (drawing.lineCategory === 'line_manibandha') {
                                  // Maṇibandha is only an anchor baseline to find its midpoint; no aging on it
                                  return;
                                }
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
                            className={
                              mode === 'aging'
                                ? drawing.lineCategory === 'line_manibandha'
                                  ? 'cursor-default'
                                  : 'cursor-pointer'
                                : 'hover:stroke-rose-500/10 cursor-pointer'
                            }
                          >
                            <title>
                              {drawing.lineCategory === 'line_manibandha'
                                ? 'Maṇibandha Rekhā (मणिबन्ध - Baseline Midpoint Anchor)'
                                : mode === 'aging'
                                  ? 'Click anywhere on this line to log an age milestone'
                                  : isSelected
                                    ? 'Selected line (Delete to remove)'
                                    : 'Click to select this line'}
                            </title>
                          </polyline>
                        )}
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
                        strokeOpacity={lineOpacity}
                        strokeDasharray={strokeStyle === 'dashed' ? '4,3' : undefined}
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ opacity: lineOpacity }}
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
                          Palm: {livePalmLength}u
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
                          Finger: {liveFingerLength}u
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
                          Width: {livePalmWidth}u
                        </text>
                      </g>
                    )}

                    {/* 0. Maṇibandha Rekhā (Wrist Crease) Persistent 50% Midpoint Guide Ray (Aging tab or when tracing lines) */}
                    {(mode === 'aging' || mode === 'draw') && manibandhaData && showDrawings && (
                      <g className="manibandha-kendra-overlay">
                        {/* Upward central guide ray from Kendra toward palm center / Saturn axis */}
                        <line
                          x1={manibandhaData.midpoint.x}
                          y1={manibandhaData.midpoint.y}
                          x2={manibandhaData.midpoint.x}
                          y2={Math.max(5, manibandhaData.midpoint.y - 12)}
                          stroke="#f59e0b"
                          strokeWidth="1.2"
                          strokeDasharray="2,2"
                          opacity="0.65"
                          vectorEffect="non-scaling-stroke"
                        />
                      </g>
                    )}

                    {/* Aging Mode Overlays */}
                    {mode === 'aging' && (
                      <g className="aging-overlay">

                        {/* 1. Primary Line Aging Ticks (Uniform, collision-free, strictly chronological) */}
                        {agingTickLayouts.map((item, idx) => {
                          const { tick, x1, y1, x2, y2, textX, textY, badgeW, badgeH, showLabel } = item;

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
                                  sign: 'Triangle △ (Property / Shield / Wealth)',
                                  note: '',
                                });
                                setHoveredAgeData(null);
                              }}
                            >
                              {/* Clean perpendicular tick mark across curve */}
                              <line
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke={tick.color}
                                strokeWidth={tick.isMajor ? '1.8' : '1.1'}
                                vectorEffect="non-scaling-stroke"
                                strokeLinecap="round"
                              />
                              {/* Anchor dot on curve */}
                              <circle
                                cx={tick.point.x}
                                cy={tick.point.y}
                                r={tick.isMajor ? 0.65 : 0.4}
                                fill={tick.color}
                                stroke="#ffffff"
                                strokeWidth="0.2"
                              />
                              {/* Label badge (compact, collision-free, strictly monotonic) */}
                              {showLabel && (
                                <>
                                  <rect
                                    x={textX - badgeW / 2}
                                    y={textY - badgeH / 2}
                                    width={badgeW}
                                    height={badgeH}
                                    rx="0.35"
                                    fill="#1c1917"
                                    opacity="0.92"
                                    stroke={tick.color}
                                    strokeWidth="0.18"
                                  />
                                  <text
                                    x={textX}
                                    y={textY + 0.24}
                                    fill="#ffffff"
                                    fontSize="0.70"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                                  >
                                    {tick.label}
                                  </text>
                                </>
                              )}
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

                        {/* 2.5 Life Line 30-Midpoint T-Frame Calibration Overlay */}
                        {agingMethod === '30-midpoint' && showLifeCalibrationGrid && (!isolateActiveAgingLine || activeAgingDrawing?.lineCategory === 'line_life') && calibrationGeometry.lifeStart && calibrationGeometry.mk && (
                          <g className="life-calibration-grid">
                            {/* Baseline chord connecting Life origin (0) to Maṇibandha Kendra (75) */}
                            <line
                              x1={calibrationGeometry.lifeStart.x}
                              y1={calibrationGeometry.lifeStart.y}
                              x2={calibrationGeometry.mk.x}
                              y2={calibrationGeometry.mk.y}
                              stroke="#0284c7"
                              strokeWidth="1.6"
                              strokeDasharray="3,2"
                              vectorEffect="non-scaling-stroke"
                            />

                            {/* Transverse T-Bar connecting Mercury Crease across to Age 30 Midpoint */}
                            {calibrationGeometry.mercurySandhi && calibrationGeometry.life30 && (
                              <line
                                x1={calibrationGeometry.mercurySandhi.x}
                                y1={calibrationGeometry.mercurySandhi.y}
                                x2={calibrationGeometry.life30.x}
                                y2={calibrationGeometry.life30.y}
                                stroke="#0284c7"
                                strokeWidth="1.6"
                                strokeDasharray="3,2"
                                opacity="0.9"
                                vectorEffect="non-scaling-stroke"
                              />
                            )}

                            {/* Age 30 Midpoint Crossing Hub - Compact badge with minor padding */}
                            {calibrationGeometry.life30 && (
                              <g>
                                <rect
                                  x={calibrationGeometry.life30.x - 1.5}
                                  y={calibrationGeometry.life30.y - 0.8}
                                  width="3.0"
                                  height="1.6"
                                  rx="0.4"
                                  fill="#0284c7"
                                />
                                <text
                                  x={calibrationGeometry.life30.x}
                                  y={calibrationGeometry.life30.y + 0.35}
                                  fill="#ffffff"
                                  fontSize="0.85"
                                  fontWeight="bold"
                                  textAnchor="middle"
                                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                                >
                                  30
                                </text>
                              </g>
                            )}

                            {/* Binary Halving Projection Lines (Before 30: 7.5, 15, 22.5; After 30: 41.25, 47, 52.5) */}
                            {(() => {
                              const isThumbOnRight = calibrationGeometry.lifeStart.x > calibrationGeometry.mk.x;
                              const projDir = isThumbOnRight ? 1 : -1;
                              const projLen = 8.5;

                              return [
                                { pt: calibrationGeometry.life7_5, label: '7.5' },
                                { pt: calibrationGeometry.life15, label: '15' },
                                { pt: calibrationGeometry.life22_5, label: '22.5' },
                                { pt: calibrationGeometry.life41_25, label: calibrationGeometry.label41_25 },
                                { pt: calibrationGeometry.life47, label: calibrationGeometry.label47 },
                                { pt: calibrationGeometry.life52_5, label: calibrationGeometry.label52_5 },
                              ]
                                .filter((item): item is { pt: Point2D; label: string } => !!item.pt)
                                .map(({ pt, label }) => {
                                  const xTarget = pt.x + projDir * projLen;
                                  return (
                                    <g key={`life-proj-${label}`}>
                                      <line
                                        x1={pt.x}
                                        y1={pt.y}
                                        x2={xTarget}
                                        y2={pt.y}
                                        stroke="#0284c7"
                                        strokeWidth="1.2"
                                        strokeDasharray="1.5,1.5"
                                        vectorEffect="non-scaling-stroke"
                                      />
                                      <polygon
                                        points={`${xTarget},${pt.y} ${xTarget - projDir * 1.6},${pt.y - 0.6} ${xTarget - projDir * 1.6},${pt.y + 0.6}`}
                                        fill="#0284c7"
                                      />
                                      <text
                                        x={pt.x - projDir * 1.2}
                                        y={pt.y - 0.4}
                                        fill="#0284c7"
                                        fontSize="0.75"
                                        fontWeight="bold"
                                        textAnchor={projDir > 0 ? 'end' : 'start'}
                                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                                      >
                                        {label}
                                      </text>
                                    </g>
                                  );
                                });
                            })()}
                          </g>
                        )}

                        {/* 2.6 Fate Line Saturn Axis & 30-Midpoint Calibration Overlay */}
                        {agingMethod === '30-midpoint' && showFateCalibrationGrid && (!isolateActiveAgingLine || activeAgingDrawing?.lineCategory === 'line_fate') && calibrationGeometry.saturnRoot && calibrationGeometry.mk && (
                          <g className="fate-calibration-grid">
                            {/* Vertical Axis from Maṇibandha Kendra (0) to Saturn Root (75) */}
                            <line
                              x1={calibrationGeometry.mk.x}
                              y1={calibrationGeometry.mk.y}
                              x2={calibrationGeometry.saturnRoot.x}
                              y2={calibrationGeometry.saturnRoot.y}
                              stroke="#d97706"
                              strokeWidth="2.0"
                              strokeDasharray="3,2"
                              vectorEffect="non-scaling-stroke"
                            />

                            {/* Fate Age 30 Midpoint Hub - Compact badge */}
                            {calibrationGeometry.fate30 && (
                              <g>
                                <rect
                                  x={calibrationGeometry.fate30.x - 1.5}
                                  y={calibrationGeometry.fate30.y - 0.8}
                                  width="3.0"
                                  height="1.6"
                                  rx="0.4"
                                  fill="#d97706"
                                />
                                <text
                                  x={calibrationGeometry.fate30.x}
                                  y={calibrationGeometry.fate30.y + 0.35}
                                  fill="#ffffff"
                                  fontSize="0.85"
                                  fontWeight="bold"
                                  textAnchor="middle"
                                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                                >
                                  30
                                </text>
                              </g>
                            )}

                            {/* Fate Binary Halving Milestones (15, 22.5, 41.25, 47, 52.5) */}
                            {[
                              { pt: calibrationGeometry.fate15, label: '15' },
                              { pt: calibrationGeometry.fate22_5, label: '22.5' },
                              { pt: calibrationGeometry.fate41_25, label: calibrationGeometry.label41_25 },
                              { pt: calibrationGeometry.fate47, label: calibrationGeometry.label47 },
                              { pt: calibrationGeometry.fate52_5, label: calibrationGeometry.label52_5 },
                            ]
                              .filter((item): item is { pt: Point2D; label: string } => !!item.pt)
                              .map(({ pt, label }) => (
                                <g key={`fate-halving-${label}`}>
                                  <line
                                    x1={pt.x - 1.5}
                                    y1={pt.y}
                                    x2={pt.x + 1.5}
                                    y2={pt.y}
                                    stroke="#d97706"
                                    strokeWidth="1.4"
                                    vectorEffect="non-scaling-stroke"
                                  />
                                  <text
                                    x={pt.x + 2.4}
                                    y={pt.y + 0.3}
                                    fill="#d97706"
                                    fontSize="0.75"
                                    fontWeight="bold"
                                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                                  >
                                    {label}
                                  </text>
                                </g>
                              ))}
                          </g>
                        )}

                        {/* 2.7 Active Calibration Interactive Rubberband Lines */}
                        {activeCalibration && (
                          <g className="calibration-rubberband-preview pointer-events-none">
                            {/* Rubberband line for Maṇibandha (Step 2: from Point 1 to cursor) */}
                            {activeCalibration.type === 'manibandha' && activeCalibration.tempPoint && calibCursorPos && (
                              <line
                                x1={activeCalibration.tempPoint.x}
                                y1={activeCalibration.tempPoint.y}
                                x2={calibCursorPos.x}
                                y2={calibCursorPos.y}
                                stroke="#f59e0b"
                                strokeWidth="2.0"
                                strokeDasharray="3,2"
                                opacity="0.8"
                                vectorEffect="non-scaling-stroke"
                              />
                            )}

                            {/* Rubberband line for Life Line (Step 2: from L0 to cursor) */}
                            {activeCalibration.type === 'life' && activeCalibration.tempPoint && calibCursorPos && (
                              <>
                                <line
                                  x1={activeCalibration.tempPoint.x}
                                  y1={activeCalibration.tempPoint.y}
                                  x2={calibCursorPos.x}
                                  y2={calibCursorPos.y}
                                  stroke="#0284c7"
                                  strokeWidth="1.8"
                                  strokeDasharray="2.5,2"
                                  opacity="0.8"
                                  vectorEffect="non-scaling-stroke"
                                />
                                {/* Preview baseline chord from L0 to MK if Kendra exists */}
                                {calibrationGeometry.mk && (
                                  <line
                                    x1={activeCalibration.tempPoint.x}
                                    y1={activeCalibration.tempPoint.y}
                                    x2={calibrationGeometry.mk.x}
                                    y2={calibrationGeometry.mk.y}
                                    stroke="#0284c7"
                                    strokeWidth="1.2"
                                    strokeDasharray="2,2"
                                    opacity="0.5"
                                    vectorEffect="non-scaling-stroke"
                                  />
                                )}
                              </>
                            )}

                            {/* Rubberband line for Fate Line (from MK to cursor on Saturn Mount) */}
                            {activeCalibration.type === 'fate' && calibrationGeometry.mk && calibCursorPos && (
                              <line
                                x1={calibrationGeometry.mk.x}
                                y1={calibrationGeometry.mk.y}
                                x2={calibCursorPos.x}
                                y2={calibCursorPos.y}
                                stroke="#d97706"
                                strokeWidth="1.8"
                                strokeDasharray="3,2"
                                opacity="0.8"
                                vectorEffect="non-scaling-stroke"
                              />
                            )}

                            {/* Rubberband line for Mercury 56-Year Scale (Step 2: from Point 1 to cursor) */}
                            {activeCalibration.type === 'mercury' && activeCalibration.tempPoint && calibCursorPos && (
                              <line
                                x1={activeCalibration.tempPoint.x}
                                y1={activeCalibration.tempPoint.y}
                                x2={calibCursorPos.x}
                                y2={calibCursorPos.y}
                                stroke="#f59e0b"
                                strokeWidth="2.0"
                                strokeDasharray="3,2"
                                opacity="0.85"
                                vectorEffect="non-scaling-stroke"
                              />
                            )}
                          </g>
                        )}

                        {/* 2.6. 18+6 Cadence Finger-Base Projections (Ages 0, 18, 24, 42, 48, 66, 72, 90) */}
                        {agingMethod === '18-6-cadence' && (!isolateActiveAgingLine || activeAgingDrawing?.lineCategory === 'line_heart' || activeAgingDrawing?.lineCategory === 'line_head') && (() => {
                          const pointsToRender = activeCalibration?.type === 'cadence'
                            ? activeCalibration.points || []
                            : calibAnchors?.cadence_points || [];

                          if (pointsToRender.length === 0 && !calibCursorPos) return null;

                          // Find Heart Line drawing if present to calculate intersections
                          const heartDrawing = visibleDrawings.find((d) => d.lineCategory === 'line_heart') || 
                            (activeAgingDrawing?.lineCategory === 'line_heart' ? activeAgingDrawing : null);
                          const heartPts = heartDrawing?.points;

                          return (
                            <g className="cadence-18-6-overlay">
                              {pointsToRender.map((pt, idx) => {
                                const age = CADENCE_AGES[idx];
                                if (!pt || age === undefined) return null;
                                const isGap = age === 24 || age === 48 || age === 72;
                                const strokeColor = isGap ? '#f59e0b' : '#f43f5e';

                                // Find intersection with Heart Line
                                let intersection: Point2D | null = null;
                                if (heartPts && heartPts.length >= 2) {
                                  for (let i = 0; i < heartPts.length - 1; i++) {
                                    const pA = heartPts[i];
                                    const pB = heartPts[i + 1];
                                    const minX = Math.min(pA.x, pB.x);
                                    const maxX = Math.max(pA.x, pB.x);
                                    if (pt.x >= minX - 0.05 && pt.x <= maxX + 0.05 && Math.abs(pB.x - pA.x) > 0.001) {
                                      const t = (pt.x - pA.x) / (pB.x - pA.x);
                                      const iy = pA.y + t * (pB.y - pA.y);
                                      if (iy >= pt.y - 1) {
                                        intersection = { x: pt.x, y: iy };
                                        break;
                                      }
                                    }
                                  }
                                }

                                const endY = intersection ? Math.min(95, intersection.y + 2.5) : Math.min(95, pt.y + 14);

                                return (
                                  <g key={`cadence-svg-${idx}`}>
                                    {/* Vertical downward projection line */}
                                    {showCadenceRays && (
                                      <line
                                        x1={pt.x}
                                        y1={pt.y}
                                        x2={pt.x}
                                        y2={endY}
                                        stroke={strokeColor}
                                        strokeWidth={isGap ? '1.2' : '1.8'}
                                        strokeDasharray={intersection ? '3,1.5' : '2.5,2'}
                                        opacity="0.85"
                                        vectorEffect="non-scaling-stroke"
                                      />
                                    )}

                                    {/* Arrowhead / tick if no intersection */}
                                    {showCadenceRays && !intersection && (
                                      <>
                                        <line
                                          x1={pt.x - 0.8}
                                          y1={endY - 0.8}
                                          x2={pt.x}
                                          y2={endY}
                                          stroke={strokeColor}
                                          strokeWidth="1.4"
                                          strokeLinecap="round"
                                          vectorEffect="non-scaling-stroke"
                                        />
                                        <line
                                          x1={pt.x + 0.8}
                                          y1={endY - 0.8}
                                          x2={pt.x}
                                          y2={endY}
                                          stroke={strokeColor}
                                          strokeWidth="1.4"
                                          strokeLinecap="round"
                                          vectorEffect="non-scaling-stroke"
                                        />
                                      </>
                                    )}

                                    {/* Intersection mark on the Heart Line */}
                                    {showCadenceIntersections && intersection && (
                                      <g>
                                        <circle
                                          cx={intersection.x}
                                          cy={intersection.y}
                                          r="0.9"
                                          fill={strokeColor}
                                          stroke="#ffffff"
                                          strokeWidth="0.3"
                                        />
                                        {/* Cross tick across the heart line */}
                                        <line
                                          x1={intersection.x - 1.4}
                                          y1={intersection.y}
                                          x2={intersection.x + 1.4}
                                          y2={intersection.y}
                                          stroke={strokeColor}
                                          strokeWidth="1.2"
                                          vectorEffect="non-scaling-stroke"
                                        />
                                        {/* Age badge on the Heart Line */}
                                        <rect
                                          x={intersection.x - 1.8}
                                          y={intersection.y + 0.8}
                                          width="3.6"
                                          height="1.8"
                                          rx="0.5"
                                          fill="#1c1917"
                                          stroke={strokeColor}
                                          strokeWidth="0.25"
                                        />
                                        <text
                                          x={intersection.x}
                                          y={intersection.y + 2.05}
                                          fill="#fecdd3"
                                          fontSize="0.95"
                                          fontWeight="bold"
                                          textAnchor="middle"
                                          style={{ pointerEvents: 'none', userSelect: 'none' }}
                                        >
                                          {age}
                                        </text>
                                      </g>
                                    )}
                                  </g>
                                );
                              })}

                              {/* Live preview line for active cadence tapping */}
                              {activeCalibration?.type === 'cadence' && calibCursorPos && (
                                <g>
                                  <line
                                    x1={calibCursorPos.x}
                                    y1={calibCursorPos.y}
                                    x2={calibCursorPos.x}
                                    y2={Math.min(95, calibCursorPos.y + 14)}
                                    stroke="#f43f5e"
                                    strokeWidth="1.5"
                                    strokeDasharray="2,2"
                                    opacity="0.75"
                                    vectorEffect="non-scaling-stroke"
                                  />
                                </g>
                              )}
                            </g>
                          );
                        })()}

                        {/* 2.8. Mercury Mount 56-Year Timing Scale (Lecture 28 §4.2: 0..56 yrs) */}
                        {agingMethod === 'mercury-56' && showMercuryCalibrationScale && (() => {
                          const p0 = calibAnchors?.mercury_heart_level;
                          const p56 = calibAnchors?.mercury_base;

                          if (!p0 || !p56) return null;

                          const dx = p56.x - p0.x;
                          const dy = p56.y - p0.y;
                          const len = Math.hypot(dx, dy) || 1;

                          // Compute perpendicular unit normal pointing inward towards the palm center (x ≈ 50%)
                          let nx = -dy / len;
                          let ny = dx / len;
                          if (p0.x > 50 && nx > 0) {
                            nx = -nx;
                            ny = -ny;
                          } else if (p0.x < 50 && nx < 0) {
                            nx = -nx;
                            ny = -ny;
                          }

                          // Classical milestones on 0..56 scale (Lecture 28 §4.2)
                          const milestones = [
                            { age: 0, frac: 0, isMajor: true, label: '0' },
                            { age: 14, frac: 14 / 56, isMajor: false, label: '14' },
                            { age: 21, frac: 21 / 56, isMajor: false, label: '21' },
                            { age: 28, frac: 28 / 56, isMajor: true, label: '28' },
                            { age: 35, frac: 35 / 56, isMajor: false, label: '35' },
                            { age: 42, frac: 42 / 56, isMajor: true, label: '42' },
                            { age: 49, frac: 49 / 56, isMajor: false, label: '49' },
                            { age: 56, frac: 1.0, isMajor: true, label: '56' },
                          ];

                          return (
                            <g className="mercury-56-scale-overlay">
                              {/* Main vertical scale axis */}
                              <line
                                x1={p0.x}
                                y1={p0.y}
                                x2={p56.x}
                                y2={p56.y}
                                stroke="#f59e0b"
                                strokeWidth="2.2"
                                vectorEffect="non-scaling-stroke"
                                strokeLinecap="round"
                                style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }}
                              />

                              {/* Clickable transparent hit area along the scale */}
                              <line
                                x1={p0.x}
                                y1={p0.y}
                                x2={p56.x}
                                y2={p56.y}
                                stroke="transparent"
                                strokeWidth="14"
                                vectorEffect="non-scaling-stroke"
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const coords = getPointCoords(e.clientX, e.clientY);
                                  const nearest = getNearestPointOnPolyline([p0, p56], coords);
                                  if (nearest) {
                                    const age = parseFloat((nearest.fraction * 56).toFixed(1));
                                    setAgeEventModal({
                                      isOpen: true,
                                      age,
                                      point: nearest.point,
                                      lineCategory: 'line_marriage',
                                      sign: 'Marriage Event / Union (Vivāha)',
                                      note: `Vivāha Rekhā mark at age ${age}`,
                                    });
                                    setHoveredAgeData(null);
                                  }
                                }}
                              >
                                <title>Click anywhere on Mercury Mount scale to log marriage event</title>
                              </line>

                              {/* Ticks and Age Badges */}
                              {milestones.map((m) => {
                                const pt = { x: p0.x + m.frac * dx, y: p0.y + m.frac * dy };
                                const tickLen = m.isMajor ? 3.0 : 1.8;
                                const x2 = pt.x + nx * tickLen;
                                const y2 = pt.y + ny * tickLen;
                                const textX = pt.x + nx * (tickLen + 1.6);
                                const textY = pt.y + ny * (tickLen + 1.6);
                                const isMidpoint = m.age === 28;

                                return (
                                  <g
                                    key={`mercury-tick-${m.age}`}
                                    className="cursor-pointer hover:opacity-90"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAgeEventModal({
                                        isOpen: true,
                                        age: m.age,
                                        point: pt,
                                        lineCategory: 'line_marriage',
                                        sign: isMidpoint ? 'Average Marriage Milestone (Vivāha Midpoint)' : 'Marriage Event / Union (Vivāha)',
                                        note: `Mercury 56-yr scale: Vivāha event timing at age ${m.age}`,
                                      });
                                      setHoveredAgeData(null);
                                    }}
                                  >
                                    {/* Perpendicular tick line extending into mount */}
                                    <line
                                      x1={pt.x}
                                      y1={pt.y}
                                      x2={x2}
                                      y2={y2}
                                      stroke={isMidpoint ? '#f59e0b' : m.isMajor ? '#fbbf24' : '#d97706'}
                                      strokeWidth={m.isMajor ? '2.0' : '1.2'}
                                      vectorEffect="non-scaling-stroke"
                                      strokeLinecap="round"
                                    />
                                    {/* Anchor dot on axis */}
                                    <circle
                                      cx={pt.x}
                                      cy={pt.y}
                                      r={isMidpoint ? 0.9 : m.isMajor ? 0.75 : 0.45}
                                      fill={isMidpoint ? '#f59e0b' : '#d97706'}
                                      stroke="#ffffff"
                                      strokeWidth="0.25"
                                    />
                                    {/* Horizontal alignment guide across Mercury mount */}
                                    {isMidpoint && (
                                      <line
                                        x1={pt.x}
                                        y1={pt.y}
                                        x2={pt.x + nx * 10}
                                        y2={pt.y}
                                        stroke="#f59e0b"
                                        strokeWidth="1.0"
                                        strokeDasharray="2,2"
                                        opacity="0.6"
                                        vectorEffect="non-scaling-stroke"
                                      />
                                    )}
                                    {/* Age Badge */}
                                    <rect
                                      x={textX - (isMidpoint ? 2.5 : 2.0)}
                                      y={textY - 1.1}
                                      width={isMidpoint ? 5.0 : 4.0}
                                      height="2.2"
                                      rx="0.5"
                                      fill={isMidpoint ? '#b45309' : '#1c1917'}
                                      stroke={isMidpoint ? '#fbbf24' : '#f59e0b'}
                                      strokeWidth={isMidpoint ? '0.35' : '0.2'}
                                      opacity="0.95"
                                    />
                                    <text
                                      x={textX}
                                      y={textY + 0.55}
                                      fill={isMidpoint ? '#ffffff' : '#fef08a'}
                                      fontSize={isMidpoint ? '1.1' : '0.95'}
                                      fontWeight="bold"
                                      textAnchor="middle"
                                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                                    >
                                      {m.label}
                                    </text>
                                  </g>
                                );
                              })}
                            </g>
                          );
                        })()}

                        {/* 3. Geometric Axial Grid */}
                        {showArvindJiAxialGrid && (() => {
                          const { wrist: defaultWrist, midpoint, saturn, jupiter } = axialGrid;
                          const wrist = manibandhaData ? manibandhaData.midpoint : defaultWrist;

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
                      <div className="w-3 h-3 rounded-full bg-blue-500/70 border border-white/80 shadow-xs hover:scale-125 flex items-center justify-center transition-transform">
                        <div className="w-1 h-1 bg-white/90 rounded-full" />
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
                      <div className="w-3 h-3 rounded-full bg-indigo-600/70 border border-white/80 shadow-xs hover:scale-125 flex items-center justify-center transition-transform">
                        <div className="w-1 h-1 bg-white/90 rounded-full animate-pulse" />
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
                      <div className="w-3 h-3 rounded-full bg-emerald-500/70 border border-white/80 shadow-xs hover:scale-125 flex items-center justify-center transition-transform">
                        <div className="w-1 h-1 bg-white/90 rounded-full" />
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
                      <div className="w-3 h-3 rounded-full bg-amber-500/70 border border-white/80 shadow-xs hover:scale-125 flex items-center justify-center transition-transform">
                        <div className="w-1 h-1 bg-white/90 rounded-full" />
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
                      <div className="w-3 h-3 rounded-full bg-amber-500/70 border border-white/80 shadow-xs hover:scale-125 flex items-center justify-center transition-transform">
                        <div className="w-1 h-1 bg-white/90 rounded-full" />
                      </div>
                    </div>
                  </>
                )}

                {/* Persistent Maṇibandha Rekhā 50% Kendra Midpoint Dot (Aging tab or when tracing lines) */}
                {activeView !== 'd1_chart' && (mode === 'aging' || mode === 'draw') && manibandhaData && showDrawings && (
                  <div
                    className="absolute pointer-events-none z-20"
                    style={{
                      left: `${manibandhaData.midpoint.x}%`,
                      top: `${manibandhaData.midpoint.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full bg-amber-500/70 border border-white/80 shadow-xs flex items-center justify-center"
                      title={`Maṇibandha Kendra (50% Midpoint: ${manibandhaData.midpoint.x.toFixed(1)}%, ${manibandhaData.midpoint.y.toFixed(1)}%)`}
                    >
                      <div className="w-0.5 h-0.5 rounded-full bg-white/90" />
                    </div>
                  </div>
                )}

                {/* Active Calibration Interactive Circular Markers (Smaller & Translucent HTML Overlay Circles - Only on Aging tab) */}
                {mode === 'aging' && activeCalibration && (
                  <>
                    {/* Step 2 Temporary Point 1 Indicator */}
                    {activeCalibration.tempPoint && (
                      <div
                        className="absolute pointer-events-none z-30"
                        style={{
                          left: `${activeCalibration.tempPoint.x}%`,
                          top: `${activeCalibration.tempPoint.y}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            activeCalibration.type === 'manibandha' || activeCalibration.type === 'mercury'
                              ? 'bg-amber-500/70 border border-white/80'
                              : 'bg-sky-500/70 border border-white/80'
                          } shadow-xs flex items-center justify-center`}
                        >
                          <div className="w-0.5 h-0.5 rounded-full bg-white/90" />
                        </div>
                        {activeCalibration.type === 'mercury' && (
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-950/90 text-amber-300 border border-amber-500/40 text-[8px] font-bold px-1 py-0.2 rounded whitespace-nowrap shadow-xs">
                            Age 0
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 2 Live Midpoint Dot Preview */}
                    {activeCalibration.tempPoint && calibCursorPos && (
                      <div
                        className="absolute pointer-events-none z-30"
                        style={{
                          left: `${(activeCalibration.tempPoint.x + calibCursorPos.x) / 2}%`,
                          top: `${(activeCalibration.tempPoint.y + calibCursorPos.y) / 2}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            activeCalibration.type === 'manibandha' || activeCalibration.type === 'mercury'
                              ? 'bg-amber-400/65 border border-white/70'
                              : 'bg-sky-400/65 border border-white/70'
                          } shadow-xs`}
                        />
                        {activeCalibration.type === 'mercury' && (
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-900 border border-amber-300 text-[8px] font-extrabold px-1 py-0.2 rounded whitespace-nowrap shadow-xs">
                            Age 28
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 2 Cursor Point Dot Preview */}
                    {activeCalibration.tempPoint && calibCursorPos && (
                      <div
                        className="absolute pointer-events-none z-30"
                        style={{
                          left: `${calibCursorPos.x}%`,
                          top: `${calibCursorPos.y}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            activeCalibration.type === 'manibandha' || activeCalibration.type === 'mercury'
                              ? 'bg-amber-500/70 border border-white/80'
                              : 'bg-sky-500/70 border border-white/80'
                          } shadow-xs animate-ping`}
                        />
                        {activeCalibration.type === 'mercury' && (
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-950/90 text-amber-200 border border-amber-400/50 text-[8px] font-bold px-1 py-0.2 rounded whitespace-nowrap shadow-xs">
                            Age 56
                          </div>
                        )}
                      </div>
                    )}

                    {/* Fate Calibration (Step 1: MK -> Saturn Root) */}
                    {activeCalibration.type === 'fate' && calibrationGeometry.mk && calibCursorPos && (
                      <>
                        <div
                          className="absolute pointer-events-none z-30"
                          style={{
                            left: `${calibrationGeometry.mk.x}%`,
                            top: `${calibrationGeometry.mk.y}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70 border border-white/80 shadow-xs flex items-center justify-center">
                            <div className="w-0.5 h-0.5 rounded-full bg-white/90" />
                          </div>
                        </div>
                        <div
                          className="absolute pointer-events-none z-30"
                          style={{
                            left: `${(calibrationGeometry.mk.x + calibCursorPos.x) / 2}%`,
                            top: `${(calibrationGeometry.mk.y + calibCursorPos.y) / 2}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          <div className="w-2 h-2 rounded-full bg-amber-400/65 border border-white/70 shadow-xs" />
                        </div>
                        <div
                          className="absolute pointer-events-none z-30"
                          style={{
                            left: `${calibCursorPos.x}%`,
                            top: `${calibCursorPos.y}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-purple-500/70 border border-white/80 shadow-xs" />
                        </div>
                      </>
                    )}

                    {/* Cadence active tapping points preview */}
                    {activeCalibration.type === 'cadence' && activeCalibration.points && (
                      <>
                        {activeCalibration.points.map((pt, idx) => {
                          const age = CADENCE_AGES[idx];
                          const isGap = age === 24 || age === 48 || age === 72;
                          return (
                            <div
                              key={`cadence-tapping-pt-${idx}`}
                              className="absolute pointer-events-none z-30"
                              style={{
                                left: `${pt.x}%`,
                                top: `${pt.y}%`,
                                transform: 'translate(-50%, -50%)',
                              }}
                            >
                              <div
                                className={`w-2.5 h-2.5 rounded-full ${
                                  isGap
                                    ? 'bg-amber-500/75 ring-1 ring-amber-300/60'
                                    : 'bg-rose-500/75 ring-1 ring-rose-300/60'
                                } border border-white/85 shadow-xs flex items-center justify-center`}
                              >
                                <div className="w-0.5 h-0.5 rounded-full bg-white/90" />
                              </div>
                              <div
                                className={`absolute -top-3.5 left-1/2 -translate-x-1/2 ${
                                  isGap
                                    ? 'bg-amber-950/90 text-amber-300 border-amber-500/40'
                                    : 'bg-stone-900/90 text-rose-300 border-rose-500/40'
                                } text-[8.5px] font-bold px-1.5 py-0.2 rounded whitespace-nowrap shadow-xs border leading-tight`}
                              >
                                {age}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}

                    {/* Cadence active tapping cursor preview */}
                    {activeCalibration.type === 'cadence' && calibCursorPos && (
                      <div
                        className="absolute pointer-events-none z-30"
                        style={{
                          left: `${calibCursorPos.x}%`,
                          top: `${calibCursorPos.y}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80 border border-white/90 shadow-xs animate-ping" />
                        <div
                          className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-rose-950/90 text-rose-200 border border-rose-400/50 text-[8px] font-bold px-1 py-0.2 rounded whitespace-nowrap shadow-xs"
                        >
                          Age {CADENCE_AGES[(activeCalibration.step || 1) - 1]}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* 30-Midpoint Master Calibration Draggable Anchor Handles (Small & Translucent) */}
                {activeView !== 'd1_chart' && (mode === 'aging' || mode === 'draw') && !activeCalibration && calibAnchors && (
                  <>
                    {/* Life Line Origin Anchor (L0) - Only on Aging tab for 30-Midpoint method */}
                    {mode === 'aging' && agingMethod === '30-midpoint' && (!isolateActiveAgingLine || activeAgingDrawing?.lineCategory === 'line_life') && calibAnchors.life_start && (
                      <div
                        className="absolute cursor-move z-30 group"
                        style={{
                          left: `${calibAnchors.life_start.x}%`,
                          top: `${calibAnchors.life_start.y}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setDraggingCalibNode('life_start');
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          setDraggingCalibNode('life_start');
                        }}
                        title="Life Line Origin (Age 0) - Drag to fine-tune"
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-sky-500/75 border border-white/85 shadow-xs hover:scale-125 flex items-center justify-center transition-transform">
                          <div className="w-0.5 h-0.5 bg-white/90 rounded-full" />
                        </div>
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-stone-900/80 text-[8px] text-sky-300 font-bold px-1 py-0.2 rounded whitespace-nowrap shadow-xs pointer-events-none border border-sky-500/30">
                          L0
                        </div>
                      </div>
                    )}

                    {/* Mercury Crease Sandhi Anchor (ME) - Only on Aging tab for 30-Midpoint method */}
                    {mode === 'aging' && agingMethod === '30-midpoint' && (!isolateActiveAgingLine || activeAgingDrawing?.lineCategory === 'line_life') && calibAnchors.mercury_sandhi && (
                      <div
                        className="absolute cursor-move z-30 group"
                        style={{
                          left: `${calibAnchors.mercury_sandhi.x}%`,
                          top: `${calibAnchors.mercury_sandhi.y}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setDraggingCalibNode('mercury_sandhi');
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          setDraggingCalibNode('mercury_sandhi');
                        }}
                        title="Mercury Crease (Level of Age 30) - Drag to fine-tune"
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-sky-500/75 border border-white/85 shadow-xs hover:scale-125 flex items-center justify-center transition-transform">
                          <div className="w-0.5 h-0.5 bg-white/90 rounded-full" />
                        </div>
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-stone-900/80 text-[8px] text-sky-300 font-bold px-1 py-0.2 rounded whitespace-nowrap shadow-xs pointer-events-none border border-sky-500/30">
                          ME
                        </div>
                      </div>
                    )}

                    {/* Saturn Mount / Middle Finger Base Joint Anchor (S75/80) - Only on Aging tab for 30-Midpoint method */}
                    {mode === 'aging' && agingMethod === '30-midpoint' && (!isolateActiveAgingLine || activeAgingDrawing?.lineCategory === 'line_fate') && calibAnchors.saturn_root && (
                      <div
                        className="absolute cursor-move z-30 group"
                        style={{
                          left: `${calibAnchors.saturn_root.x}%`,
                          top: `${calibAnchors.saturn_root.y}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setDraggingCalibNode('saturn_root');
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          setDraggingCalibNode('saturn_root');
                        }}
                        title={`Saturn Finger Root (Fate Age ${calibrationGeometry.maxAge}) - Drag to fine-tune`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500/75 border border-white/85 shadow-xs hover:scale-125 flex items-center justify-center transition-transform">
                          <div className="w-0.5 h-0.5 bg-white/90 rounded-full" />
                        </div>
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-stone-900/80 text-[8px] text-purple-300 font-bold px-1 py-0.2 rounded whitespace-nowrap shadow-xs pointer-events-none border border-purple-500/30">
                          S{calibrationGeometry.maxAge}
                        </div>
                      </div>
                    )}

                    {/* Maṇibandha Bracelet Edges (Wrist L & Wrist R) */}
                    {calibAnchors.manibandha_start && (
                      <div
                        className="absolute cursor-move z-30 group"
                        style={{
                          left: `${calibAnchors.manibandha_start.x}%`,
                          top: `${calibAnchors.manibandha_start.y}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setDraggingCalibNode('manibandha_start');
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          setDraggingCalibNode('manibandha_start');
                        }}
                        title="Maṇibandha Left End - Drag to adjust"
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/75 border border-white/85 shadow-xs hover:scale-125 flex items-center justify-center transition-transform">
                          <div className="w-0.5 h-0.5 bg-white/90 rounded-full" />
                        </div>
                      </div>
                    )}

                    {calibAnchors.manibandha_end && (
                      <div
                        className="absolute cursor-move z-30 group"
                        style={{
                          left: `${calibAnchors.manibandha_end.x}%`,
                          top: `${calibAnchors.manibandha_end.y}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setDraggingCalibNode('manibandha_end');
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          setDraggingCalibNode('manibandha_end');
                        }}
                        title="Maṇibandha Right End - Drag to adjust"
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/75 border border-white/85 shadow-xs hover:scale-125 flex items-center justify-center transition-transform">
                          <div className="w-0.5 h-0.5 bg-white/90 rounded-full" />
                        </div>
                      </div>
                    )}

                    {/* 18+6 Cadence Finger-Base Draggable Anchor Handles (Ages 0, 18, 24, 42, 48, 66, 72, 90) */}
                    {mode === 'aging' && agingMethod === '18-6-cadence' && (!isolateActiveAgingLine || activeAgingDrawing?.lineCategory === 'line_heart' || activeAgingDrawing?.lineCategory === 'line_head') && calibAnchors.cadence_points && (
                      <>
                        {calibAnchors.cadence_points.map((pt, idx) => {
                          const age = CADENCE_AGES[idx];
                          if (!pt || age === undefined) return null;
                          const isGap = age === 24 || age === 48 || age === 72;

                          return (
                            <div
                              key={`cadence-handle-${idx}`}
                              className="absolute cursor-move z-30 group"
                              style={{
                                left: `${pt.x}%`,
                                top: `${pt.y}%`,
                                transform: 'translate(-50%, -50%)',
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setDraggingCalibNode(`cadence_${idx}`);
                              }}
                              onTouchStart={(e) => {
                                e.stopPropagation();
                                setDraggingCalibNode(`cadence_${idx}`);
                              }}
                              title={`18+6 Cadence Age ${age} (Drag to adjust finger base position)`}
                            >
                              <div
                                className={`w-2.5 h-2.5 rounded-full ${
                                  isGap
                                    ? 'bg-amber-500/75 ring-1 ring-amber-300/60'
                                    : 'bg-rose-500/75 ring-1 ring-rose-300/60'
                                } border border-white/85 shadow-xs hover:scale-125 flex items-center justify-center transition-transform`}
                              >
                                <div className="w-0.5 h-0.5 bg-white/90 rounded-full" />
                              </div>
                              <div
                                className={`absolute -top-3.5 left-1/2 -translate-x-1/2 ${
                                  isGap
                                    ? 'bg-amber-950/90 text-amber-300 border-amber-500/40'
                                    : 'bg-stone-900/90 text-rose-300 border-rose-500/40'
                                } text-[8.5px] font-bold px-1.5 py-0.2 rounded whitespace-nowrap shadow-xs pointer-events-none border leading-tight`}
                              >
                                {age}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}

                    {/* Mercury Mount 56-Year Scale Draggable Anchor Handles (Age 0 and Age 56) */}
                    {mode === 'aging' && agingMethod === 'mercury-56' && showMercuryCalibrationScale && (
                      <>
                        {/* Age 0 Anchor (Heart Line Level on Percussion) */}
                        {calibAnchors.mercury_heart_level && (
                          <div
                            className="absolute cursor-move z-30 group"
                            style={{
                              left: `${calibAnchors.mercury_heart_level.x}%`,
                              top: `${calibAnchors.mercury_heart_level.y}%`,
                              transform: 'translate(-50%, -50%)',
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setDraggingCalibNode('mercury_heart_level');
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              setDraggingCalibNode('mercury_heart_level');
                            }}
                            title="Heart Line Level (Age 0) - Drag to fine-tune"
                          >
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 ring-1 ring-amber-300/70 border border-white/90 shadow-xs hover:scale-125 flex items-center justify-center transition-transform">
                              <div className="w-0.5 h-0.5 bg-white/90 rounded-full" />
                            </div>
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-950/90 text-amber-300 border border-amber-500/40 text-[8.5px] font-bold px-1.5 py-0.2 rounded whitespace-nowrap shadow-xs pointer-events-none leading-tight">
                              0
                            </div>
                          </div>
                        )}

                        {/* Age 56 Anchor (Mercury Finger Base Joint Crease) */}
                        {calibAnchors.mercury_base && (
                          <div
                            className="absolute cursor-move z-30 group"
                            style={{
                              left: `${calibAnchors.mercury_base.x}%`,
                              top: `${calibAnchors.mercury_base.y}%`,
                              transform: 'translate(-50%, -50%)',
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setDraggingCalibNode('mercury_base');
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              setDraggingCalibNode('mercury_base');
                            }}
                            title="Mercury Finger Root Crease (Age 56) - Drag to fine-tune"
                          >
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 ring-1 ring-amber-300/70 border border-white/90 shadow-xs hover:scale-125 flex items-center justify-center transition-transform">
                              <div className="w-0.5 h-0.5 bg-white/90 rounded-full" />
                            </div>
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-950/90 text-amber-300 border border-amber-500/40 text-[8.5px] font-bold px-1.5 py-0.2 rounded whitespace-nowrap shadow-xs pointer-events-none leading-tight">
                              56
                            </div>
                          </div>
                        )}

                        {/* Classical Midpoint Indicator (Age 28) */}
                        {calibAnchors.mercury_heart_level && calibAnchors.mercury_base && (
                          <div
                            className="absolute pointer-events-none z-30"
                            style={{
                              left: `${(calibAnchors.mercury_heart_level.x + calibAnchors.mercury_base.x) / 2}%`,
                              top: `${(calibAnchors.mercury_heart_level.y + calibAnchors.mercury_base.y) / 2}%`,
                              transform: 'translate(-50%, -50%)',
                            }}
                          >
                            <div className="w-2 h-2 rounded-full bg-amber-400 border border-white/90 shadow-xs" />
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-900 border border-amber-300 text-[8.5px] font-extrabold px-1.5 py-0.2 rounded whitespace-nowrap shadow-md leading-tight">
                              28
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {/* Marker Pins Overlay */}
                {activeView !== 'd1_chart' &&
                  showPins &&
                  visiblePins.map((pin) => (
                    <div
                      key={pin.id}
                      className={`absolute annotation-pin-trigger group z-20 ${activeCalibration ? 'pointer-events-none' : ''}`}
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
                    {/* Wrist Node (75 / Kendra) */}
                    {(() => {
                      const wristPos = manibandhaData ? manibandhaData.midpoint : axialGrid.wrist;
                      return (
                        <div
                          className={`absolute ${manibandhaData ? 'cursor-default' : 'cursor-move'} z-30 group`}
                          style={{
                            left: `${wristPos.x}%`,
                            top: `${wristPos.y}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                          onMouseDown={(e) => {
                            if (manibandhaData) return;
                            e.stopPropagation();
                            setDraggingAxialNode('wrist');
                          }}
                          onTouchStart={(e) => {
                            if (manibandhaData) return;
                            e.stopPropagation();
                            setDraggingAxialNode('wrist');
                          }}
                          title={
                            manibandhaData
                              ? 'Maṇibandha Kendra (Midpoint) - Locked to traced Maṇibandha Rekhā'
                              : 'Maṇibandha Base (Age 75) - Drag to align'
                          }
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded-full ${manibandhaData
                              ? 'bg-amber-500/75 ring-1 ring-amber-300/60'
                              : 'bg-amber-600/75'
                              } border border-white/85 shadow-xs hover:scale-125 flex items-center justify-center transition-transform`}
                          >
                            <span className="text-[7.5px] font-bold text-white leading-none">
                              {manibandhaData ? 'MK' : '75'}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

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
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-500/75 border border-white/85 shadow-xs hover:scale-125 flex items-center justify-center transition-transform">
                        <span className="text-[7.5px] font-bold text-white leading-none">30</span>
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
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-700/75 border border-white/85 shadow-xs hover:scale-125 flex items-center justify-center transition-transform">
                        <span className="text-[7.5px] font-bold text-white leading-none">80</span>
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
                      <div className="w-3 h-3 rounded-full bg-purple-600/75 border border-white/85 shadow-xs hover:scale-125 flex items-center justify-center transition-transform">
                        <div className="w-1 h-1 bg-white/90 rounded-full" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Fixed HUD: Vedic Tattva Ratio HUD Overlay (stays anchored on screen) */}
            {activeView !== 'd1_chart' && mode === 'measure' && measurements && vedicData && (
              <div className="absolute top-4 left-4 bg-stone-900/95 backdrop-blur border border-stone-800 text-white rounded-xl p-3 shadow-2xl z-30 text-xs space-y-2 font-sans w-52 pointer-events-none select-none">
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
                    <span className="font-mono font-bold text-blue-400">{livePalmLength} units</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-stone-400">Palm Width:</span>
                    <span className="font-mono font-bold text-amber-500">
                      {livePalmWidth} units
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-stone-400">Finger Length:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {liveFingerLength} units
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-stone-800/50">
                    <span className="text-stone-400">Palm Shape:</span>
                    <span className="font-mono font-bold text-purple-400">
                      {livePalmShape}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-0.5">
                    <span className="font-bold text-stone-300 font-serif">Tattva Ratio:</span>
                    <span className="font-mono font-bold text-accent-gold">
                      {liveTattvaRatio}
                    </span>
                  </div>
                </div>
                {liveHandTattva && (
                  <div className="mt-2 text-[10px] bg-amber-500/15 text-accent-gold font-bold px-3 py-1 rounded text-center border border-amber-500/25">
                    ✨ {liveHandTattva}
                  </div>
                )}
              </div>
            )}

            {/* Fixed HUD: Vedic Aging Calibrator HUD Overlay */}
            {activeView !== 'd1_chart' && mode === 'aging' && (
              <div
                className="absolute top-4 left-4 max-h-[calc(100%-2rem)] max-w-[calc(100%-2rem)] bg-stone-900/95 backdrop-blur-md border border-stone-800 text-white rounded-2xl p-4 pb-8 shadow-2xl z-30 text-xs space-y-3 font-sans w-80 overflow-y-auto scrollbar-thin [scrollbar-width:thin] overscroll-contain"
                onWheel={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
              >
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
                    className="w-full bg-stone-800 border border-stone-700 text-stone-100 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-amber-500 cursor-pointer"
                    value={agingMethod}
                    onChange={(e) => handleSelectAgingMethod(e.target.value as AgingMethod)}
                  >
                    {allAgingMethods.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-stone-400 italic leading-tight pt-0.5">
                    {AGING_METHODS[agingMethod]?.description}
                  </p>
                </div>

                {/* Line Selection & Tagging */}
                <div className="space-y-2 pt-3 border-t border-stone-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-stone-300">
                      Line to Age
                    </label>
                    {activeAgingDrawing && (() => {
                      let span = 0;
                      for (let i = 1; i < activeAgingDrawing.points.length; i++) {
                        const dx = activeAgingDrawing.points[i].x - activeAgingDrawing.points[i - 1].x;
                        const dy = activeAgingDrawing.points[i].y - activeAgingDrawing.points[i - 1].y;
                        span += Math.sqrt(dx * dx + dy * dy);
                      }
                      return (
                        <span
                          className="text-[10px] text-amber-400 font-mono"
                          title="Traced polyline length as a percentage of palm span"
                        >
                          {Math.round(span)}% palm span
                        </span>
                      );
                    })()}
                  </div>

                  {palmDrawings.length > 0 ? (
                    <div className="space-y-2">
                      <select
                        className="w-full bg-stone-800 border border-stone-700 text-stone-100 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-amber-500 cursor-pointer"
                        value={activeAgingDrawing?.id || palmDrawings[0]?.id || ''}
                        onChange={(e) => {
                          const drawingId = e.target.value;
                          setSelectedAgingDrawingId(drawingId);
                          const d = drawings.find((item) => item.id === drawingId);
                          if (d?.lineCategory) {
                            setAgingLineCategory(d.lineCategory);
                          }
                        }}
                      >
                        {palmDrawings.map((d, i) => (
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
                            className="w-full bg-stone-800/80 border border-stone-700/80 text-stone-200 rounded px-2 py-1 text-[11px] cursor-pointer"
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
                            <option value="line_mercury">Mercury Line (Budha Rekhā)</option>
                            <option value="line_marriage">Marriage Line (Vivāha Rekhā)</option>
                            <option value="other">Other Crease</option>
                          </select>
                        </div>
                      )}
                      {/* Active Line Isolation Toggle */}
                      <div className="pt-1.5 pb-0.5">
                        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-stone-300 hover:text-white select-none">
                          <input
                            type="checkbox"
                            checked={isolateActiveAgingLine}
                            onChange={(e) => setIsolateActiveAgingLine(e.target.checked)}
                            className="rounded bg-stone-800 border-stone-700 text-amber-500 cursor-pointer"
                          />
                          <span className="font-semibold text-stone-200">Focus Active Line Only</span>
                        </label>
                        <p className="text-[9.5px] text-stone-400 pl-5 leading-tight">
                          Hides markers from other lines to prevent intermingling.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          returnToAgingAfterTraceRef.current = true;
                          setAgingLineCategory('line_life');
                          setShowDrawings(true);
                          setMode('draw');
                        }}
                        className="w-full flex items-center justify-center gap-2 my-2 py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer border border-stone-700/60 shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        + Trace Another Line on Hand
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-500/15 border border-amber-500/30 rounded-xl space-y-3">
                      <div className="text-[11px] text-amber-200 font-medium leading-relaxed">
                        Cheiro's method requires a traced palm line to divide into <strong>14 equal 7-year cycles</strong> (7, 14, 21 ... 98 yrs).
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          returnToAgingAfterTraceRef.current = true;
                          setAgingLineCategory('line_life');
                          setShowDrawings(true);
                          setMode('draw');
                        }}
                        className="w-full flex items-center justify-center gap-2 my-2 py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Trace Palm Line on Hand Now
                      </button>
                      <div className="text-[10px] text-stone-400 leading-tight">
                        Click above, drag along the Life or Fate line on the palm, and release.
                      </div>
                    </div>
                  )}
                </div>

                {/* Method-Specific Calibration Suite */}
                <div className="space-y-3 pt-3 border-t border-stone-800/80">
                  {agingMethod === '30-midpoint' ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-stone-200">
                            30-Midpoint Calibration
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                          Tap-to-Plot
                        </span>
                      </div>

                      {/* 1. Maṇibandha Base Anchor (Prerequisite) */}
                      <div className="p-3 bg-stone-800/50 border border-stone-700/60 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-stone-200">
                            1. Maṇibandha (Wrist Base)
                          </span>
                          {manibandhaData ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Kendra Locked
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-400 font-medium">Prerequisite</span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-400 leading-tight">
                          Tap left &amp; right edges of the 1st wrist bracelet. The 50% midpoint establishes Age {vedicData?.max_age ?? 75} (Life) &amp; Age 0 (Fate).
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveCalibration({ type: 'manibandha', step: 1 });
                            }}
                            className="flex-1 py-1.5 px-3 bg-amber-600/30 hover:bg-amber-600/45 text-amber-200 rounded-lg text-xs font-semibold border border-amber-500/40 transition cursor-pointer active:scale-95 shadow-xs flex items-center justify-center gap-1.5"
                          >
                            <Target className="w-3.5 h-3.5 text-amber-400" />
                            {manibandhaData ? 'Re-tap (2 Taps)' : 'Tap 2 Points to Set'}
                          </button>
                          {manibandhaData && (
                            <button
                              type="button"
                              onClick={() => {
                                const clean = drawings.filter((d) => !(d.view === activeView && d.lineCategory === 'line_manibandha'));
                                onChangeDrawings(clean);
                                pushHistory(clean, pins);
                                clearAgingCalibration(['manibandha_start', 'manibandha_end']);
                              }}
                              className="py-1.5 px-2.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 rounded-lg text-xs font-semibold border border-red-500/30 transition cursor-pointer active:scale-95"
                              title="Clear Maṇibandha"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 2. Life Line Calibration */}
                      <div className="p-3 bg-stone-800/50 border border-stone-700/60 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-stone-200">
                            2. Life Line 30-Midpoint
                          </span>
                          {calibAnchors?.life_start && calibAnchors?.mercury_sandhi ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Calibrated
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-400">Not Set</span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-400 leading-tight">
                          Tap Life Line origin (thumb) and outer Mercury crease. Automatically plots Age 30 and binary halving scale (7.5 to 52.5).
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            disabled={!manibandhaData}
                            onClick={() => {
                              setActiveCalibration({ type: 'life', step: 1 });
                            }}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer active:scale-95 shadow-xs flex items-center justify-center gap-1.5 ${
                              !manibandhaData
                                ? 'bg-stone-800/40 text-stone-500 border-stone-700 cursor-not-allowed'
                                : 'bg-sky-600/30 hover:bg-sky-600/45 text-sky-200 border-sky-500/40'
                            }`}
                            title={!manibandhaData ? 'Set Maṇibandha first' : 'Calibrate Life Line'}
                          >
                            <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                            {calibAnchors?.life_start ? 'Re-tap (2 Taps)' : 'Calibrate Life Line (2 Taps)'}
                          </button>
                          {calibAnchors?.life_start && (
                            <button
                              type="button"
                              onClick={() => clearAgingCalibration(['life_start', 'mercury_sandhi'])}
                              className="py-1.5 px-2.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 rounded-lg text-xs font-semibold border border-red-500/30 transition cursor-pointer active:scale-95"
                              title="Clear Life Anchors"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 3. Fate Line Calibration */}
                      <div className="p-3 bg-stone-800/50 border border-stone-700/60 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-stone-200">
                            3. Fate Line (Saturn Axis)
                          </span>
                          {calibAnchors?.saturn_root ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Calibrated
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-400">Not Set</span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-400 leading-tight">
                          Tap Saturn middle finger root. Automatically plots Age 0 at Maṇibandha, Age 30 midpoint, and binary halving scale up to Age {vedicData?.max_age ?? 75}.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            disabled={!manibandhaData}
                            onClick={() => {
                              setActiveCalibration({ type: 'fate', step: 1 });
                            }}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer active:scale-95 shadow-xs flex items-center justify-center gap-1.5 ${
                              !manibandhaData
                                ? 'bg-stone-800/40 text-stone-500 border-stone-700 cursor-not-allowed'
                                : 'bg-amber-600/30 hover:bg-amber-600/45 text-amber-200 border-amber-500/40'
                            }`}
                            title={!manibandhaData ? 'Set Maṇibandha first' : 'Calibrate Fate Line'}
                          >
                            <Target className="w-3.5 h-3.5 text-amber-400" />
                            {calibAnchors?.saturn_root ? 'Re-tap (1 Tap)' : 'Calibrate Fate Line (1 Tap)'}
                          </button>
                          {calibAnchors?.saturn_root && (
                            <button
                              type="button"
                              onClick={() => clearAgingCalibration(['saturn_root'])}
                              className="py-1.5 px-2.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 rounded-lg text-xs font-semibold border border-red-500/30 transition cursor-pointer active:scale-95"
                              title="Clear Fate Anchor"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Display Toggles */}
                      <div className="space-y-1.5 pt-2 border-t border-stone-800">
                        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-stone-300 hover:text-white">
                          <input
                            type="checkbox"
                            checked={showLifeCalibrationGrid}
                            onChange={(e) => setShowLifeCalibrationGrid(e.target.checked)}
                            className="rounded bg-stone-800 border-stone-700 text-sky-500 cursor-pointer"
                          />
                          <span>Show Life Line T-Frame &amp; Aging Scale</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-stone-300 hover:text-white">
                          <input
                            type="checkbox"
                            checked={showFateCalibrationGrid}
                            onChange={(e) => setShowFateCalibrationGrid(e.target.checked)}
                            className="rounded bg-stone-800 border-stone-700 text-amber-500 cursor-pointer"
                          />
                          <span>Show Fate Line Saturn Axis &amp; Aging Scale</span>
                        </label>
                      </div>
                    </>
                  ) : agingMethod === '18-6-cadence' ? (
                    <div className="p-3 bg-stone-800/50 border border-stone-700/60 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-stone-200">
                          18 + 6 Cadence Calibration (8 Finger Base Points)
                        </span>
                        {calibAnchors?.cadence_points?.length === 8 ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            8 Points Calibrated
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400">Not Set</span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400 leading-tight">
                        Tap 8 points along the base of the fingers from Mercury to Jupiter (Ages 0, 18, 24, 42, 48, 66, 72, 90). Each point projects a straight line downwards to show where it meets the Heart Line.
                      </p>
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCalibration({ type: 'cadence', step: 1, points: [] });
                          }}
                          className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer active:scale-95 shadow-xs flex items-center justify-center gap-1.5 bg-rose-600/30 hover:bg-rose-600/45 text-rose-200 border-rose-500/40"
                          title="Tap 8 points sequentially across the finger bases"
                        >
                          <Target className="w-3.5 h-3.5 text-rose-400" />
                          {calibAnchors?.cadence_points?.length === 8 ? 'Re-tap 8 Points' : 'Tap 8 Points (0 → 90)'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const isRight = activeView === 'right_palm';
                            updateAgingCalibration({
                              cadence_points: getDefaultCadencePoints(isRight),
                            });
                          }}
                          className="py-1.5 px-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium border border-stone-600 transition cursor-pointer active:scale-95 shadow-xs"
                          title="Apply standard default finger base points and fine-tune by dragging"
                        >
                          Preset 8 Points
                        </button>
                        {calibAnchors?.cadence_points && (
                          <button
                            type="button"
                            onClick={() => clearAgingCalibration(['cadence_points'])}
                            className="py-1.5 px-2.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 rounded-lg text-xs font-semibold border border-red-500/30 transition cursor-pointer active:scale-95"
                            title="Clear 8 Cadence Points"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Cadence Display Toggles */}
                      <div className="space-y-1.5 pt-2 border-t border-stone-800">
                        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-stone-300 hover:text-white">
                          <input
                            type="checkbox"
                            checked={showCadenceRays}
                            onChange={(e) => setShowCadenceRays(e.target.checked)}
                            className="rounded bg-stone-800 border-stone-700 text-rose-500 cursor-pointer"
                          />
                          <span>Show Finger Projection Rays</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-stone-300 hover:text-white">
                          <input
                            type="checkbox"
                            checked={showCadenceIntersections}
                            onChange={(e) => setShowCadenceIntersections(e.target.checked)}
                            className="rounded bg-stone-800 border-stone-700 text-rose-500 cursor-pointer"
                          />
                          <span>Show Heart Line Age Badges</span>
                        </label>
                      </div>
                    </div>
                  ) : agingMethod === 'mercury-56' ? (
                    <div className="p-3 bg-stone-800/50 border border-stone-700/60 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Mercury Mount 56-Year Timing (0–56 yrs)
                        </span>
                        {calibAnchors?.mercury_heart_level && calibAnchors?.mercury_base ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            56-Yr Scale Active
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400">Not Calibrated</span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400 leading-tight">
                        Lecture 28 §4.2: Classical scale for dating marriage (Vivāha Rekhā) &amp; relationship unions along the outer percussion edge under the Mercury (little) finger.
                        Age 0 at Heart Line level, Age 28 midpoint, and Age 56 at the finger root crease. Move cursor over scale to see exact age.
                      </p>
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCalibration({ type: 'mercury', step: 1 });
                          }}
                          className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer active:scale-95 shadow-xs flex items-center justify-center gap-1.5 bg-amber-600/30 hover:bg-amber-600/45 text-amber-200 border-amber-500/40"
                          title="Tap 2 points: Heart Line level (Age 0) then Mercury root crease (Age 56)"
                        >
                          <Target className="w-3.5 h-3.5 text-amber-400" />
                          {calibAnchors?.mercury_heart_level && calibAnchors?.mercury_base
                            ? 'Re-tap (2 Taps: 0 → 56)'
                            : 'Tap 2 Points (0 → 56)'}
                        </button>
                        {calibAnchors?.mercury_heart_level && (
                          <button
                            type="button"
                            onClick={() => clearAgingCalibration(['mercury_heart_level', 'mercury_base'])}
                            className="py-1.5 px-2.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 rounded-lg text-xs font-semibold border border-red-500/30 transition cursor-pointer active:scale-95"
                            title="Clear Mercury Scale"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Display Toggles */}
                      <div className="space-y-1.5 pt-2 border-t border-stone-800">
                        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-stone-300 hover:text-white">
                          <input
                            type="checkbox"
                            checked={showMercuryCalibrationScale}
                            onChange={(e) => setShowMercuryCalibrationScale(e.target.checked)}
                            className="rounded bg-stone-800 border-stone-700 text-amber-500 cursor-pointer"
                          />
                          <span>Show 56-Yr Scale Axis &amp; Age Ticks</span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-stone-800/40 border border-stone-700/50 rounded-xl text-[11px] text-stone-300 space-y-2">
                      <div className="font-semibold text-amber-400 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Classical Line Traversal Scale
                        </span>
                        {manibandhaData && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Wrist Kendra Locked
                          </span>
                        )}
                      </div>
                      <p className="text-stone-400 leading-normal text-[10px]">
                        For {AGING_METHODS[agingMethod]?.title || 'this method'}, trace the line on the palm using the <strong className="text-stone-200">Trace</strong> tool. Age intervals and tick markers compute automatically along the polyline.
                      </p>
                      <div className="pt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveCalibration({ type: 'manibandha', step: 1 })}
                          className="flex-1 py-1 px-2.5 bg-amber-600/20 hover:bg-amber-600/35 text-amber-200 rounded-lg text-[10.5px] font-semibold border border-amber-500/30 transition cursor-pointer active:scale-95 flex items-center justify-center gap-1"
                        >
                          <Target className="w-3 h-3 text-amber-400" />
                          {manibandhaData ? 'Re-tap Wrist Midpoint' : 'Tap Wrist Bracelet Base'}
                        </button>
                        {manibandhaData && (
                          <button
                            type="button"
                            onClick={() => {
                              const clean = drawings.filter((d) => !(d.view === activeView && d.lineCategory === 'line_manibandha'));
                              onChangeDrawings(clean);
                              pushHistory(clean, pins);
                              clearAgingCalibration(['manibandha_start', 'manibandha_end']);
                            }}
                            className="py-1 px-2 bg-red-500/15 hover:bg-red-500/25 text-red-300 rounded-lg text-[10.5px] font-semibold border border-red-500/30 transition cursor-pointer active:scale-95"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Max Lifespan (deśa-kāla) Configurable Setting */}
                <div className="pt-2.5 border-t border-stone-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-300 font-medium">Max Lifespan (deśa-kāla):</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="50"
                        max="120"
                        className="w-14 bg-stone-800 border border-stone-700 text-amber-400 rounded px-1.5 py-0.5 text-xs text-center font-bold focus:border-amber-500 focus:outline-none"
                        value={vedicData?.max_age ?? 75}
                        onChange={(e) => handleUpdateMaxAge(parseInt(e.target.value, 10) || 75)}
                      />
                      <span className="text-[10px] text-stone-400 font-medium">yrs</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[70, 75, 80, 84, 90, 100].map((ageVal) => {
                      const isSelected = (vedicData?.max_age ?? 75) === ageVal;
                      return (
                        <button
                          key={ageVal}
                          type="button"
                          onClick={() => handleUpdateMaxAge(ageVal)}
                          className={`flex-1 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                            isSelected
                              ? 'bg-amber-600 text-white shadow-xs font-bold'
                              : 'bg-stone-800/80 hover:bg-stone-750 text-stone-400 hover:text-stone-200 border border-stone-700/60'
                          }`}
                          title={ageVal === 75 ? '75 yrs (Classical Default)' : `${ageVal} yrs`}
                        >
                          {ageVal}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Marker Density Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                  <span className="text-[11px] text-stone-300">Marker Density:</span>
                  <div className="flex items-center gap-1 bg-stone-800/80 p-0.5 rounded border border-stone-700/80 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setAgingTickDensity('major')}
                      className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${agingTickDensity === 'major'
                        ? 'bg-amber-500/25 text-amber-300 font-bold border border-amber-500/40'
                        : 'text-stone-400 hover:text-stone-200'
                        }`}
                      title="Key Milestones (14, 28, 42, 56, 70, 84, 98) — clean, non-overlapping"
                    >
                      Key (7)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAgingTickDensity('all')}
                      className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${agingTickDensity === 'all'
                        ? 'bg-amber-500/25 text-amber-300 font-bold border border-amber-500/40'
                        : 'text-stone-400 hover:text-stone-200'
                        }`}
                      title="All 14 seven-year divisions with smart anti-collision protection"
                    >
                      All 14 Cycles
                    </button>
                  </div>
                </div>

                {/* Milestone Summary & Helper */}
                {currentAgingTicks.length > 0 && (
                  <div className="pt-2 border-t border-stone-800 space-y-1">
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      Calculated Milestones ({currentAgingTicks.length} ticks)
                    </div>
                    <div className="flex flex-wrap gap-1">
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
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                          {loggedEvents.map((evt, idx) => {
                            const colonIdx = evt.event.indexOf(':');
                            const signPart = colonIdx !== -1 ? evt.event.substring(0, colonIdx).trim() : evt.event;
                            const notePart = colonIdx !== -1 ? evt.event.substring(colonIdx + 1).trim() : '';

                            return (
                              <div
                                key={idx}
                                className="group flex items-center justify-between gap-1.5 p-1.5 bg-stone-800/90 hover:bg-stone-750 rounded border border-stone-700/70 hover:border-amber-500/50 text-[11px] transition-all cursor-pointer"
                                onClick={() => {
                                  setAgeEventModal({
                                    isOpen: true,
                                    age: evt.age,
                                    point: { x: 50, y: 50 },
                                    lineCategory: hudLineCategory,
                                    sign: signPart,
                                    note: notePart,
                                    editingIndex: idx,
                                  });
                                }}
                                title="Click to edit milestone"
                              >
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 shrink-0 border border-amber-500/30">
                                    Age {evt.age}
                                  </span>
                                  <span className="text-stone-200 truncate font-medium text-[10.5px]">
                                    {evt.event}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAgeEventModal({
                                        isOpen: true,
                                        age: evt.age,
                                        point: { x: 50, y: 50 },
                                        lineCategory: hudLineCategory,
                                        sign: signPart,
                                        note: notePart,
                                        editingIndex: idx,
                                      });
                                    }}
                                    className="p-1 hover:bg-stone-700 rounded text-stone-400 hover:text-amber-300 transition"
                                    title="Edit Milestone"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteAgeEvent(hudLineCategory, idx);
                                    }}
                                    className="p-1 hover:bg-red-500/20 rounded text-stone-400 hover:text-red-400 transition"
                                    title="Delete Milestone"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
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

            {/* Aging Calibration Floating Top Banner */}
            {mode === 'aging' && activeCalibration && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-stone-900/95 backdrop-blur-md border border-cyan-500/70 text-cyan-200 px-4 py-2 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-3">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  {getCalibrationPrompt()}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveCalibration(null)}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white px-2 py-0.5 rounded text-[11px] font-medium border border-stone-600 cursor-pointer ml-1 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Aging Trace Mode Floating Hint */}
            {mode === 'draw' && returnToAgingAfterTraceRef.current && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-stone-900/95 backdrop-blur-md border border-amber-500/50 text-amber-200 px-4 py-2 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2">
                <span>
                  {agingLineCategory === 'line_manibandha'
                    ? '✏️ Trace along the first bracelet (Maṇibandha) — 50% Kendra midpoint will be automatically plotted'
                    : '✏️ Click & drag on the palm to trace the line — release to plot aging scale'}
                </span>
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
              : mode === 'pan'
                ? `✋ Pan & Zoom Mode (Default): Drag to pan around the image. Scroll wheel to zoom in/out.`
                : mode === 'pin'
                  ? `📍 Pin Mode: Click on the ${HAND_VIEW_LAB_ATTR(activeView)} to drop an analytical marker pin.`
                  : mode === 'draw'
                    ? `✏️ Trace Mode: Click & drag to trace lines. Press Ctrl+Z / ⌘Z to undo mistakes anytime.`
                    : mode === 'aging'
                      ? `⏱️ Aging Ruler & Grid: Calculate age milestones along lines & axial geometry.`
                      : `📐 Measure Mode: Drag the Blue line (Palm Height) and Green line (Finger Length) endpoints.`}
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
                <span>{ageEventModal.editingIndex !== undefined ? 'Edit Age Milestone' : 'Log Age Milestone'}</span>
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

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-stone-100">
              {ageEventModal.editingIndex !== undefined ? (
                <button
                  type="button"
                  onClick={() => handleDeleteAgeEvent(ageEventModal.lineCategory, ageEventModal.editingIndex!)}
                  className="btn-outline border-rose-300 text-rose-600 hover:bg-rose-50 px-3 py-2 text-xs flex items-center gap-1.5 cursor-pointer font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Milestone</span>
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
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
                  <span>{ageEventModal.editingIndex !== undefined ? 'Save Changes' : 'Save Milestone & Place Pin'}</span>
                </button>
              </div>
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
