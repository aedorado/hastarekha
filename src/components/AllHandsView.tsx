'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { HandProfile, parseVedicData, HAND_VIEW_LABELS, HandView } from '@/lib/supabase';
import { ChevronLeft, ChevronRight, ExternalLink, Hand, ImageOff } from 'lucide-react';

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

function buildEntries(profiles: HandProfile[], showD1: boolean): HandEntry[] {
  const entries: HandEntry[] = [];

  const viewOrder = showD1
    ? (['right_palm', 'right_back', 'left_palm', 'left_back', 'd1_chart'] as const)
    : (['right_palm', 'right_back', 'left_palm', 'left_back'] as const);

  // Sort profiles by created_at ascending
  const sorted = [...profiles].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return ta - tb;
  });

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

    const hasImages = viewOrder.some((v) => !!profile.images[v]);

    if (!hasImages) {
      entries.push({
        ...base,
        view: null,
        viewLabel: 'No Images',
        imageUrl: null,
        isPlaceholder: true,
      });
    } else {
      for (const view of viewOrder) {
        const url = profile.images[view];
        if (url) {
          entries.push({
            ...base,
            view: view,
            viewLabel: HAND_VIEW_LABELS[view] || view,
            imageUrl: url,
            isPlaceholder: false,
          });
        }
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
  const [entries, setEntries] = useState<HandEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const thumbStripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const [showD1, setShowD1] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hastarekha_show_d1_gallery') === 'true';
    }
    return false;
  });

  const handleToggleShowD1 = (val: boolean) => {
    setShowD1(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hastarekha_show_d1_gallery', String(val));
    }
  };

  // Build entries whenever profiles change or showD1 toggles
  useEffect(() => {
    const built = buildEntries(profiles, showD1);
    setEntries(built);
    setCurrentIndex(0);
  }, [profiles, showD1]);

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

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goPrev, goNext]);

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

  // Touch swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only register horizontal swipes where horizontal motion dominates
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

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

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-4 text-stone-400">
        <Hand className="w-14 h-14 text-stone-300" />
        <p className="text-base font-semibold text-stone-500">No profiles yet</p>
        <p className="text-sm text-stone-400">Create a hand profile to get started.</p>
      </div>
    );
  }

  const current = entries[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < entries.length - 1;

  return (
    <div className="space-y-4 w-full">
      {/* Gallery Controls Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-stone-50 border border-stone-200/80 px-4 py-3 rounded-xl gap-3 shadow-sm">
        <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
          All Hands Gallery
        </h4>
        <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-600 hover:text-stone-850 transition-colors select-none">
          <input
            type="checkbox"
            checked={showD1}
            onChange={(e) => handleToggleShowD1(e.target.checked)}
            className="rounded border-stone-300 text-accent-gold focus:ring-accent-gold/45 w-4 h-4 cursor-pointer"
          />
          <span className="font-semibold flex items-center gap-1 text-stone-750">
            <span>☸️</span> Include D-1 Rasi Charts
          </span>
        </label>
      </div>

      <div className="flex flex-col w-full h-[520px] sm:h-[600px] md:h-[680px] lg:h-[720px]">

        {/* ── Top label bar ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-white border border-stone-200/80 rounded-t-2xl shadow-sm p-2">
          {/* Prev button */}
          <button
            onClick={goPrev}
            disabled={!hasPrev}
            aria-label="Previous"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-stone-200 bg-stone-50 text-stone-500 hover:bg-accent-gold hover:text-white hover:border-accent-gold disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Center label */}
          <div className="flex flex-col items-center gap-0.5 min-w-0 px-3 text-center">
            <span className="font-bold text-stone-900 text-sm sm:text-base leading-tight truncate max-w-[200px] sm:max-w-none">
              {current.profileName}
            </span>
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
            className="flex items-center justify-center w-9 h-9 rounded-full border border-stone-200 bg-stone-50 text-stone-500 hover:bg-accent-gold hover:text-white hover:border-accent-gold disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ── Main image area ────────────────────────────────────────────── */}
        <div
          className="relative flex-1 bg-stone-950 overflow-hidden select-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
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
            /* Actual hand image */
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={current.imageUrl!}
              src={current.imageUrl!}
              alt={`${current.profileName} — ${current.viewLabel}`}
              className="absolute inset-0 w-full h-full object-contain"
              draggable={false}
            />
          )}

          {/* ── Info overlay (bottom-left) ─── */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none z-10">
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
              <div className="flex flex-col items-end gap-1.5 pointer-events-auto shrink-0">
                <span className="text-[11px] text-white/60 font-mono tabular-nums">
                  {currentIndex + 1} / {entries.length}
                </span>
                <button
                  onClick={() => router.push(`/analysis/${current.profileId}`)}
                  className="flex items-center gap-1 text-[10px] font-bold text-amber-300 hover:text-white bg-white/10 hover:bg-accent-gold rounded px-2 py-1 transition-all duration-150 border border-white/10 backdrop-blur-sm cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open Profile
                </button>
              </div>
            </div>
          </div>

          {/* ── Desktop side-click zones (invisible large hit areas) ─── */}
          <button
            onClick={goPrev}
            disabled={!hasPrev}
            aria-label="Previous image"
            className="absolute left-0 top-0 bottom-0 w-1/4 opacity-0 cursor-pointer disabled:cursor-default"
          />
          <button
            onClick={goNext}
            disabled={!hasNext}
            aria-label="Next image"
            className="absolute right-0 top-0 bottom-0 w-1/4 opacity-0 cursor-pointer disabled:cursor-default"
          />
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
                className={`relative shrink-0 w-12 h-14 sm:w-14 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-150 ${idx === currentIndex
                  ? 'border-accent-gold shadow-[0_0_8px_rgba(163,127,26,0.6)] scale-105'
                  : 'border-stone-700 hover:border-stone-500 opacity-60 hover:opacity-90'
                  }`}
              >
                {entry.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={entry.imageUrl}
                    alt={entry.viewLabel}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-stone-800 flex items-center justify-center">
                    <ImageOff className="w-4 h-4 text-stone-600" />
                  </div>
                )}
                {/* Active indicator pip */}
                {idx === currentIndex && (
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
    </div>
  );
}
