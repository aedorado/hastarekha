'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { HandProfile, parseVedicData, HAND_VIEW_LABELS, HandView } from '@/lib/supabase';
import { ChevronLeft, ChevronRight, ExternalLink, Hand, ImageOff, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import OptimizedHandImage from '@/components/OptimizedHandImage';

interface HandEntry {
  profileId: string;
  profileName: string;
  age: number | '';
  gender: string;
  dominantHand: string;
  handType: string;
  handTattva: string;
  view: HandView | 'd1_chart' | null; // null = placeholder (no images)
  viewLabel: string;
  imageUrl: string | null;
  isPlaceholder: boolean;
}

export type DominanceScope = 'all' | 'dominant' | 'non_dominant';

export interface ViewFilterState {
  right_palm: boolean;
  left_palm: boolean;
  right_back: boolean;
  left_back: boolean;
  d1_chart: boolean;
}

const DEFAULT_VIEW_FILTERS: ViewFilterState = {
  right_palm: true,
  left_palm: true,
  right_back: true,
  left_back: true,
  d1_chart: false,
};

function buildEntries(
  profiles: HandProfile[],
  viewFilters: ViewFilterState,
  dominanceFilter: DominanceScope
): HandEntry[] {
  const entries: HandEntry[] = [];
  const viewOrder: (HandView | 'd1_chart')[] = [
    'right_palm',
    'left_palm',
    'right_back',
    'left_back',
    'd1_chart',
  ];

  // Sort profiles by created_at ascending
  const sorted = [...profiles].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return ta - tb;
  });

  const isDefaultFilter =
    dominanceFilter === 'all' &&
    viewFilters.right_palm &&
    viewFilters.left_palm &&
    viewFilters.right_back &&
    viewFilters.left_back;

  for (const profile of sorted) {
    const vedic = parseVedicData(profile.general_notes);
    const base = {
      profileId: profile.id,
      profileName: profile.name,
      age: profile.age,
      gender: profile.gender,
      dominantHand: profile.dominant_hand,
      handType: vedic.hand_type,
      handTattva: vedic.hand_tattva,
    };

    const isLeftDominant = (profile.dominant_hand || '').toLowerCase() === 'left';
    const dominantSide = isLeftDominant ? 'left' : 'right';

    let profileAddedCount = 0;

    for (const view of viewOrder) {
      if (!viewFilters[view]) continue;

      // Filter by dominance for hand views
      if (view !== 'd1_chart') {
        const isRightView = view.startsWith('right');
        const isDominantView = isRightView ? dominantSide === 'right' : dominantSide === 'left';

        if (dominanceFilter === 'dominant' && !isDominantView) continue;
        if (dominanceFilter === 'non_dominant' && isDominantView) continue;
      }

      const url = profile.images[view];
      if (url) {
        entries.push({
          ...base,
          view: view,
          viewLabel: HAND_VIEW_LABELS[view] || view,
          imageUrl: url,
          isPlaceholder: false,
        });
        profileAddedCount++;
      }
    }

    // Only show placeholder if profile has no images anywhere and user is on default view
    if (profileAddedCount === 0 && isDefaultFilter) {
      const anyImagesEver = viewOrder.some((v) => !!profile.images[v]);
      if (!anyImagesEver) {
        entries.push({
          ...base,
          view: null,
          viewLabel: 'No Images',
          imageUrl: null,
          isPlaceholder: true,
        });
      }
    }
  }

  return entries;
}

interface AllHandsViewProps {
  profiles: HandProfile[];
  isLoading: boolean;
}

export default function AllHandsView({ profiles, isLoading }: AllHandsViewProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const thumbStripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // ─── Filter State ──────────────────────────────────────────────
  const [dominanceFilter, setDominanceFilter] = useState<DominanceScope>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hastarekha_allhands_dominance');
      if (saved === 'all' || saved === 'dominant' || saved === 'non_dominant') {
        return saved;
      }
    }
    return 'all';
  });

  const [viewFilters, setViewFilters] = useState<ViewFilterState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('hastarekha_allhands_views');
        if (saved) {
          return { ...DEFAULT_VIEW_FILTERS, ...JSON.parse(saved) };
        }
        const legacyD1 = localStorage.getItem('hastarekha_show_d1_gallery') === 'true';
        if (legacyD1) {
          return { ...DEFAULT_VIEW_FILTERS, d1_chart: true };
        }
      } catch {
        // ignore parse errors
      }
    }
    return DEFAULT_VIEW_FILTERS;
  });

  const handleSetDominance = (val: DominanceScope) => {
    setDominanceFilter(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hastarekha_allhands_dominance', val);
    }
  };

  const handleToggleView = (viewKey: keyof ViewFilterState) => {
    setViewFilters((prev) => {
      const next = { ...prev, [viewKey]: !prev[viewKey] };
      if (typeof window !== 'undefined') {
        localStorage.setItem('hastarekha_allhands_views', JSON.stringify(next));
        if (viewKey === 'd1_chart') {
          localStorage.setItem('hastarekha_show_d1_gallery', String(next.d1_chart));
        }
      }
      return next;
    });
  };

  const handleApplyPreset = (preset: 'all' | 'palms' | 'backs' | 'right' | 'left' | 'd1') => {
    let next: ViewFilterState;
    if (preset === 'all') {
      next = { right_palm: true, left_palm: true, right_back: true, left_back: true, d1_chart: viewFilters.d1_chart };
    } else if (preset === 'palms') {
      next = { right_palm: true, left_palm: true, right_back: false, left_back: false, d1_chart: false };
    } else if (preset === 'backs') {
      next = { right_palm: false, left_palm: false, right_back: true, left_back: true, d1_chart: false };
    } else if (preset === 'right') {
      next = { right_palm: true, left_palm: false, right_back: true, left_back: false, d1_chart: false };
    } else if (preset === 'left') {
      next = { right_palm: false, left_palm: true, right_back: false, left_back: true, d1_chart: false };
    } else if (preset === 'd1') {
      next = { right_palm: false, left_palm: false, right_back: false, left_back: false, d1_chart: true };
    } else {
      next = DEFAULT_VIEW_FILTERS;
    }
    setViewFilters(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hastarekha_allhands_views', JSON.stringify(next));
      localStorage.setItem('hastarekha_show_d1_gallery', String(next.d1_chart));
    }
  };

  const handleResetFilters = () => {
    handleSetDominance('all');
    setViewFilters(DEFAULT_VIEW_FILTERS);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hastarekha_allhands_dominance', 'all');
      localStorage.setItem('hastarekha_allhands_views', JSON.stringify(DEFAULT_VIEW_FILTERS));
      localStorage.setItem('hastarekha_show_d1_gallery', 'false');
    }
  };

  // ─── Zoom & Pan state ──────────────────────────────────────────
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [prevIndex, setPrevIndex] = useState(0);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchDistanceRef = useRef<number | null>(null);
  const touchMidpointRef = useRef<{ x: number; y: number } | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const scrollHintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Derive entries dynamically from profiles, viewFilters & dominanceFilter
  const entries = useMemo(
    () => buildEntries(profiles, viewFilters, dominanceFilter),
    [profiles, viewFilters, dominanceFilter]
  );

  const clampedIndex = entries.length === 0 ? 0 : Math.min(currentIndex, entries.length - 1);

  // Adjust zoom & pan whenever the active hand/entry changes
  if (prevIndex !== clampedIndex) {
    setPrevIndex(clampedIndex);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsPanning(false);
  }

  const goTo = useCallback(
    (idx: number) => {
      if (entries.length === 0) return;
      const clamped = Math.max(0, Math.min(idx, entries.length - 1));
      setCurrentIndex(clamped);
    },
    [entries.length],
  );

  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);
  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);

  // ─── Clamping Pan Boundaries ────────────────────────────────────
  const clampPan = useCallback((newPanX: number, newPanY: number, currentZoom: number) => {
    if (!imageContainerRef.current) return { x: newPanX, y: newPanY };
    const rect = imageContainerRef.current.getBoundingClientRect();
    if (currentZoom <= 1.02) return { x: 0, y: 0 };

    const maxPanX = rect.width * 0.85;
    const minPanX = -rect.width * (currentZoom - 0.15);
    const maxPanY = rect.height * 0.85;
    const minPanY = -rect.height * (currentZoom - 0.15);

    return {
      x: Math.min(maxPanX, Math.max(minPanX, newPanX)),
      y: Math.min(maxPanY, Math.max(minPanY, newPanY)),
    };
  }, []);

  const handleZoomIn = useCallback(() => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
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
  }, [clampPan, pan, zoom]);

  const handleZoomOut = useCallback(() => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
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
  }, [clampPan, pan, zoom]);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsPanning(false);
  }, []);

  // Wheel zoom towards cursor (Only when holding Cmd/Ctrl, or trackpad pinching)
  const handleWheel = (e: React.WheelEvent) => {
    const isPinchOrCmd = e.ctrlKey || e.metaKey;

    if (!isPinchOrCmd) {
      // Allow natural page scrolling! Show quick helper hint
      if (!showScrollHint && zoom === 1) {
        setShowScrollHint(true);
        if (scrollHintTimeoutRef.current) clearTimeout(scrollHintTimeoutRef.current);
        scrollHintTimeoutRef.current = setTimeout(() => setShowScrollHint(false), 1600);
      }
      return;
    }

    e.preventDefault();
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
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

  // Double click to zoom in to 2.4x or reset to 1x
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!imageContainerRef.current) return;
    if (zoom > 1.05) {
      handleResetZoom();
      return;
    }
    const rect = imageContainerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const targetZoom = 2.4;
    const scaleChange = targetZoom / 1;
    const nextPan = clampPan(
      offsetX - offsetX * scaleChange,
      offsetY - offsetY * scaleChange,
      targetZoom
    );
    setZoom(targetZoom);
    setPan(nextPan);
  };

  // Mouse drag to pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    if (zoom <= 1.02 && e.button === 0) return;

    e.preventDefault();
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const nextX = e.clientX - panStartRef.current.x;
    const nextY = e.clientY - panStartRef.current.y;
    setPan(clampPan(nextX, nextY, zoom));
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }
  };

  // Touch handlers (Pinch-to-zoom + 1-finger pan when zoomed, swipe next/prev when 1x)
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      touchDistanceRef.current = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchMidpointRef.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
      return;
    }

    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      if (zoom > 1.02) {
        setIsPanning(true);
        panStartRef.current = {
          x: e.touches[0].clientX - pan.x,
          y: e.touches[0].clientY - pan.y,
        };
      }
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    // Two-finger pinch-zoom & pan
    if (e.touches.length === 2 && touchDistanceRef.current !== null && touchMidpointRef.current !== null) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const newDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const newMid = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };

      if (!imageContainerRef.current) return;
      const rect = imageContainerRef.current.getBoundingClientRect();
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

    // Single finger pan when zoomed
    if (e.touches.length === 1 && zoom > 1.02 && isPanning) {
      e.preventDefault();
      const nextX = e.touches[0].clientX - panStartRef.current.x;
      const nextY = e.touches[0].clientY - panStartRef.current.y;
      setPan(clampPan(nextX, nextY, zoom));
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    touchDistanceRef.current = null;
    touchMidpointRef.current = null;
    if (isPanning) {
      setIsPanning(false);
    }

    // Only swipe to next/prev hand when not zoomed in
    if (zoom <= 1.05 && touchStartX.current !== null && touchStartY.current !== null) {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartX.current;
      const dy = touch.clientY - touchStartY.current;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        if (dx < 0) goNext();
        else goPrev();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Keyboard navigation & zoom shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      }
      if (e.key === '0' || e.key === 'Escape') {
        e.preventDefault();
        handleResetZoom();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goPrev, goNext, handleZoomIn, handleZoomOut, handleResetZoom]);

  // Auto-scroll thumbnail strip to keep active thumb visible
  useEffect(() => {
    const thumb = thumbRefs.current[currentIndex];
    if (thumb && thumbStripRef.current) {
      thumb.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentIndex]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-4 text-stone-400">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-stone-200/60" />
          <div className="absolute inset-0 rounded-full border-4 border-t-accent-gold animate-spin" />
        </div>
        <p className="text-sm font-medium">Loading hand images…</p>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-4 text-stone-400">
        <Hand className="w-14 h-14 text-stone-300" />
        <p className="text-base font-semibold text-stone-500">No profiles yet</p>
        <p className="text-sm text-stone-400">Create a hand profile to get started.</p>
      </div>
    );
  }

  const current = entries[clampedIndex];
  const hasPrev = clampedIndex > 0;
  const hasNext = clampedIndex < entries.length - 1;

  return (
    <div className="space-y-4 w-full">
      {/* ─── Gallery Filter & Controls Card ─── */}
      <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-4 shadow-xs space-y-3.5">
        {/* Top row: Title + Image Count + Presets */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2.5 border-b border-stone-200/80 pb-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>🔎</span> Gallery Filters
            </h4>
            <span className="text-[11px] font-mono font-medium text-stone-600 bg-stone-200/80 px-2 py-0.5 rounded-full">
              {entries.length} {entries.length === 1 ? 'image' : 'images'}
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider mr-0.5">Presets:</span>
            <button
              type="button"
              onClick={() => handleApplyPreset('all')}
              className="px-2.5 py-1 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300 bg-white font-medium shadow-2xs transition active:scale-95 cursor-pointer"
            >
              All Views
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('palms')}
              className="px-2.5 py-1 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300 bg-white font-medium shadow-2xs transition active:scale-95 cursor-pointer"
            >
              Palms Only
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('backs')}
              className="px-2.5 py-1 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300 bg-white font-medium shadow-2xs transition active:scale-95 cursor-pointer"
            >
              Backs Only
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('right')}
              className="px-2.5 py-1 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300 bg-white font-medium shadow-2xs transition active:scale-95 cursor-pointer"
            >
              Right Hand
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('left')}
              className="px-2.5 py-1 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300 bg-white font-medium shadow-2xs transition active:scale-95 cursor-pointer"
            >
              Left Hand
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset all filters to default"
              className="px-2 py-1 rounded-lg border border-stone-200 text-amber-700 hover:bg-amber-50 bg-white font-semibold shadow-2xs transition active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs select-none">
          {/* Radio Group: Hand Dominance Scoping */}
          <div className="flex items-center gap-1 bg-stone-200/60 p-1 rounded-xl border border-stone-200 flex-wrap">
            <span className="text-[10px] font-bold text-stone-500 uppercase px-2 tracking-wider">
              Hand:
            </span>
            <label
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${dominanceFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
                }`}
            >
              <input
                type="radio"
                name="dominanceFilter"
                value="all"
                checked={dominanceFilter === 'all'}
                onChange={() => handleSetDominance('all')}
                className="accent-accent-gold cursor-pointer"
              />
              <span>All Hands</span>
            </label>

            <label
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${dominanceFilter === 'dominant'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
                }`}
            >
              <input
                type="radio"
                name="dominanceFilter"
                value="dominant"
                checked={dominanceFilter === 'dominant'}
                onChange={() => handleSetDominance('dominant')}
                className="accent-accent-gold cursor-pointer"
              />
              <span>✋ Dominant Only</span>
            </label>

            <label
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${dominanceFilter === 'non_dominant'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
                }`}
            >
              <input
                type="radio"
                name="dominanceFilter"
                value="non_dominant"
                checked={dominanceFilter === 'non_dominant'}
                onChange={() => handleSetDominance('non_dominant')}
                className="accent-accent-gold cursor-pointer"
              />
              <span>Non-Dominant</span>
            </label>
          </div>

          {/* Checkboxes Group: Views to Include */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              Include:
            </span>

            <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 hover:text-stone-950 font-medium transition">
              <input
                type="checkbox"
                checked={viewFilters.right_palm}
                onChange={() => handleToggleView('right_palm')}
                className="rounded border-stone-300 text-accent-gold focus:ring-accent-gold/45 w-4 h-4 cursor-pointer"
              />
              <span>Right Palm</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 hover:text-stone-950 font-medium transition">
              <input
                type="checkbox"
                checked={viewFilters.left_palm}
                onChange={() => handleToggleView('left_palm')}
                className="rounded border-stone-300 text-accent-gold focus:ring-accent-gold/45 w-4 h-4 cursor-pointer"
              />
              <span>Left Palm</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 hover:text-stone-950 font-medium transition">
              <input
                type="checkbox"
                checked={viewFilters.right_back}
                onChange={() => handleToggleView('right_back')}
                className="rounded border-stone-300 text-accent-gold focus:ring-accent-gold/45 w-4 h-4 cursor-pointer"
              />
              <span>Right Back</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 hover:text-stone-950 font-medium transition">
              <input
                type="checkbox"
                checked={viewFilters.left_back}
                onChange={() => handleToggleView('left_back')}
                className="rounded border-stone-300 text-accent-gold focus:ring-accent-gold/45 w-4 h-4 cursor-pointer"
              />
              <span>Left Back</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 hover:text-stone-950 font-semibold transition ml-0.5">
              <input
                type="checkbox"
                checked={viewFilters.d1_chart}
                onChange={() => handleToggleView('d1_chart')}
                className="rounded border-stone-300 text-accent-gold focus:ring-accent-gold/45 w-4 h-4 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <span>☸️</span> D-1 Chart
              </span>
            </label>
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 gap-3 text-stone-400 bg-stone-50 border border-stone-200/80 rounded-2xl p-6 text-center">
          <Hand className="w-12 h-12 text-stone-300" />
          <p className="text-sm font-semibold text-stone-700">No hand images match the current filters</p>
          <p className="text-xs text-stone-500 max-w-md">
            Try checking additional views above or setting the hand scope to &ldquo;All Hands&rdquo;.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent-gold text-white hover:bg-accent-gold-dark shadow-xs transition cursor-pointer"
          >
            Reset Filters to Default
          </button>
        </div>
      ) : (
        <div className="flex flex-col w-full h-[520px] sm:h-[600px] md:h-[680px] lg:h-[720px]">
          {/* ── Top label bar ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-white border border-stone-200/80 rounded-t-2xl shadow-sm">
            {/* Prev button */}
            <button
              onClick={goPrev}
              disabled={!hasPrev}
              aria-label="Previous"
              className="flex items-center justify-center w-9 h-9 rounded-full border border-stone-200 bg-stone-50 text-stone-500 hover:bg-accent-gold hover:text-white hover:border-accent-gold disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Center label with profile name as link */}
            <div className="p-2 flex flex-col items-center gap-0.5 min-w-0 px-2 text-center">
              <button
                type="button"
                onClick={() => router.push(`/analysis/${current.profileId}${current.view ? `?view=${current.view}` : ''}`)}
                title={`Open ${current.profileName}'s profile in editor`}
                className="group inline-flex items-center gap-1.5 font-bold text-stone-900 hover:text-accent-gold text-sm sm:text-base leading-tight transition-colors cursor-pointer"
              >
                <span className="truncate group-hover:underline underline-offset-3">
                  {current.profileName}
                </span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-accent-gold shrink-0" />
              </button>

              {!current.isPlaceholder && (
                <span className="text-[11px] text-stone-500 font-medium tracking-wide">
                  {current.viewLabel}
                </span>
              )}
            </div>

            {/* Next button */}
            <button
              onClick={goNext}
              disabled={!hasNext}
              aria-label="Next"
              className="flex items-center justify-center w-9 h-9 rounded-full border border-stone-200 bg-stone-50 text-stone-500 hover:bg-accent-gold hover:text-white hover:border-accent-gold disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shrink-0 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* ── Main image area ────────────────────────────────────────────── */}
          <div
            ref={imageContainerRef}
            className={`relative flex-1 bg-stone-950 overflow-hidden select-none transition-colors ${zoom > 1.02 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
              }`}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchEnd}
          >
            {showScrollHint && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-stone-900/90 text-amber-200 border border-amber-500/30 text-[11px] px-3 py-1 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1.5 animate-pulse">
                <span>💡</span> Hold <kbd className="px-1 py-0.5 bg-black/40 rounded text-[10px] font-mono border border-white/10">⌘ / Ctrl</kbd> or pinch trackpad to zoom
              </div>
            )}

            {!current.isPlaceholder && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-stone-900/85 hover:bg-stone-900 backdrop-blur-md text-white p-1 rounded-xl border border-stone-700 shadow-xl z-20 transition-all select-none">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoom <= 1.02}
                  title="Zoom Out (-)"
                  aria-label="Zoom Out"
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/15 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed transition text-stone-300 hover:text-white cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleResetZoom}
                  title="Click to reset zoom (0 / Esc)"
                  aria-label="Reset zoom"
                  className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded hover:bg-white/10 text-stone-200 transition cursor-pointer"
                >
                  {Math.round(zoom * 100)}%
                </button>

                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoom >= 4.5}
                  title="Zoom In (+)"
                  aria-label="Zoom In"
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/15 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed transition text-stone-300 hover:text-white cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                {zoom > 1.05 && (
                  <>
                    <div className="w-px h-4 bg-stone-700 mx-0.5" />
                    <button
                      type="button"
                      onClick={handleResetZoom}
                      title="Reset to Fit (0 / Esc)"
                      aria-label="Reset to Fit"
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent-gold/20 text-accent-gold hover:text-accent-gold-light transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            )}

            {current.isPlaceholder ? (
              /* Placeholder for profiles with no images */
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-stone-600">
                <div className="w-20 h-20 rounded-full bg-stone-800 flex items-center justify-center">
                  <ImageOff className="w-9 h-9 text-stone-500" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-bold text-stone-300 text-lg">{current.profileName}</p>
                  <p className="text-stone-500 text-sm">No images uploaded yet</p>
                </div>
              </div>
            ) : (
              /* Actual hand image with pan & zoom transform */
              <div
                className="w-full h-full relative"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: '0 0',
                  transition: isPanning ? 'none' : 'transform 120ms cubic-bezier(0.2, 0, 0, 1)',
                }}
              >
                <OptimizedHandImage
                  key={current.imageUrl!}
                  src={current.imageUrl!}
                  alt={`${current.profileName} — ${current.viewLabel}`}
                  fill
                  priority={true}
                  sizes="(max-width: 1024px) 100vw, 85vw"
                  className="object-contain pointer-events-none"
                  draggable={false}
                />
              </div>
            )}

            {/* ── Info overlay (bottom-left) ─── */}
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-30">
              <div className="flex items-end justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  {/* Badges row */}
                  <div className="flex flex-wrap gap-1.5">
                    {current.handType && (
                      <span className="text-[10px] bg-purple-900/60 text-purple-200 border border-purple-500/30 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider backdrop-blur-sm">
                        🤚 {current.handType}
                      </span>
                    )}
                    {current.handTattva && (
                      <span className="text-[10px] bg-amber-900/60 text-amber-200 border border-amber-500/30 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider backdrop-blur-sm">
                        ✨ {current.handTattva}
                      </span>
                    )}
                  </div>
                  {/* Meta row */}
                  <p className="text-white/80 text-[11px] font-medium truncate">
                    {[
                      current.dominantHand && `${current.dominantHand}-handed`,
                      current.age && `Age ${current.age}`,
                      current.gender,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>

                {/* Counter + open profile button */}
                <div className="flex flex-col items-end gap-1.5 pointer-events-auto shrink-0 z-30">
                  <span className="text-[11px] text-white/70 font-mono tabular-nums">
                    {clampedIndex + 1} / {entries.length}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/analysis/${current.profileId}${current.view ? `?view=${current.view}` : ''}`);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white bg-black/60 hover:bg-accent-gold rounded-lg px-2.5 py-1.5 transition-all duration-150 border border-white/20 hover:border-accent-gold backdrop-blur-md cursor-pointer shadow-md pointer-events-auto"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Profile
                  </button>
                </div>
              </div>
            </div>

            {/* ── Desktop side-click zones (invisible large hit areas) - only middle vertical area ─── */}
            {zoom <= 1.05 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={!hasPrev}
                  aria-label="Previous image"
                  className="absolute left-0 top-14 bottom-24 w-1/4 opacity-0 cursor-pointer disabled:cursor-default z-10"
                />
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!hasNext}
                  aria-label="Next image"
                  className="absolute right-0 top-14 bottom-24 w-1/4 opacity-0 cursor-pointer disabled:cursor-default z-10"
                />
              </>
            )}
          </div>

          {/* ── Thumbnail strip ────────────────────────────────────────────── */}
          <div className="bg-stone-900 border-t border-stone-700 rounded-b-2xl px-2 py-2 overflow-hidden relative group/thumbs">
            {/* Left scroll button */}
            <button
              type="button"
              onClick={() => {
                if (thumbStripRef.current) {
                  thumbStripRef.current.scrollBy({ left: -200, behavior: 'smooth' });
                }
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-accent-gold/90 transition-all opacity-0 group-hover/thumbs:opacity-100 shadow-md cursor-pointer border border-stone-700"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              ref={thumbStripRef}
              className="flex gap-1.5 overflow-x-auto pb-1 px-8 scroll-smooth"
              style={{ scrollbarWidth: 'none' }}
            >
              {entries.map((entry, idx) => (
                <button
                  key={`${entry.profileId}-${entry.view ?? 'placeholder'}-${idx}`}
                  ref={(el) => { thumbRefs.current[idx] = el; }}
                  onClick={() => goTo(idx)}
                  aria-label={`${entry.profileName} — ${entry.viewLabel}`}
                  className={`relative shrink-0 w-12 h-14 sm:w-14 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-150 ${idx === clampedIndex
                    ? 'border-accent-gold shadow-[0_0_8px_rgba(163,127,26,0.6)] scale-105'
                    : 'border-stone-700 hover:border-stone-500 opacity-60 hover:opacity-90'
                    }`}
                >
                  {entry.imageUrl ? (
                    <OptimizedHandImage
                      src={entry.imageUrl}
                      alt={entry.viewLabel}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-800 flex items-center justify-center">
                      <ImageOff className="w-4 h-4 text-stone-600" />
                    </div>
                  )}
                  {/* Active indicator pip */}
                  {idx === clampedIndex && (
                    <div className="absolute inset-0 ring-1 ring-inset ring-accent-gold/40 rounded-lg" />
                  )}
                </button>
              ))}
            </div>

            {/* Right scroll button */}
            <button
              type="button"
              onClick={() => {
                if (thumbStripRef.current) {
                  thumbStripRef.current.scrollBy({ left: 200, behavior: 'smooth' });
                }
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-accent-gold/90 transition-all opacity-0 group-hover/thumbs:opacity-100 shadow-md cursor-pointer border border-stone-700"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
