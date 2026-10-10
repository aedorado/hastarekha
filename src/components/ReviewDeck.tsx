'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  Sparkles,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Flame,
  Shuffle,
  BookOpen,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  Award,
  Download,
  Upload,
} from 'lucide-react';
import {
  Flashcard,
  extractFlashcardsFromNote,
  getSrsProgress,
  saveCardRating,
  ReviewProgress,
  getSrsStats,
  getSrsQueue,
  formatDueTime,
} from '@/lib/flashcards';

interface Note {
  id: string;
  title: string;
  content: string;
}

interface ReviewDeckProps {
  activeNote: Note;
  allNotes: Note[];
}

export default function ReviewDeck({ activeNote, allNotes }: ReviewDeckProps) {
  const [scope, setScope] = useState<'current' | 'all'>('current');
  const [mode, setMode] = useState<'due' | 'all' | 'learning' | 'mastered'>('due');
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progressMap, setProgressMap] = useState<Record<string, ReviewProgress>>({});

  // Sync SRS progress from localStorage
  useEffect(() => {
    setProgressMap(getSrsProgress());
  }, []);

  // Dynamically extract raw cards from either current note or all notes combined
  const allCards = useMemo(() => {
    if (scope === 'current') {
      return extractFlashcardsFromNote(activeNote.id, activeNote.title, activeNote.content);
    }
    return allNotes.flatMap((note) =>
      extractFlashcardsFromNote(note.id, note.title, note.content)
    );
  }, [scope, activeNote, allNotes]);

  // Overall statistics for current scope
  const stats = useMemo(() => {
    return getSrsStats(allCards, progressMap);
  }, [allCards, progressMap]);

  // Queue of cards filtered by selected mode and sorted by SM-2 priority
  const queue = useMemo(() => {
    return getSrsQueue(allCards, progressMap, mode);
  }, [allCards, progressMap, mode]);

  // Reset index and flipped state when scope, note, or mode changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [activeNote.id, scope, mode]);

  // Keep index within bounds if queue size changes
  useEffect(() => {
    if (currentIndex >= queue.length && queue.length > 0) {
      setCurrentIndex(queue.length - 1);
    }
  }, [queue.length, currentIndex]);

  const currentCard: Flashcard | undefined = queue[currentIndex];
  const currentCardProgress = currentCard ? progressMap[currentCard.id] : undefined;

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleRating = useCallback((rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentCard) return;
    const updated = saveCardRating(currentCard.id, rating);
    setProgressMap((prev) => ({ ...prev, [currentCard.id]: updated }));

    // Reset flipped state and advance queue
    setIsFlipped(false);
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Reached the end of the current queue
      setCurrentIndex(0);
    }
  }, [currentCard, currentIndex, queue.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    if (currentIndex < queue.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  const handleExportSrs = () => {
    try {
      const dataStr = JSON.stringify(progressMap, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const link = document.createElement('a');
      link.setAttribute('href', dataUri);
      link.setAttribute('download', `hastarekha-srs-progress-${new Date().toISOString().split('T')[0]}.json`);
      link.click();
    } catch (e) {
      alert('Failed to export SRS progress');
    }
  };

  const handleImportSrs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const data = parsed.srs_progress || parsed;
        if (typeof data === 'object' && data !== null) {
          const merged = { ...progressMap, ...data };
          setProgressMap(merged);
          localStorage.setItem('hastarekha_srs_progress_v1', JSON.stringify(merged));
          alert(`Imported study progress for ${Object.keys(data).length} card records.`);
        }
      } catch {
        alert('Invalid SRS progress JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setCurrentIndex(Math.floor(Math.random() * Math.max(1, queue.length)));
  };

  // Keyboard shortcut listener (Space = flip, 1-4 = rate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped) {
        if (e.key === '1') handleRating('again');
        else if (e.key === '2') handleRating('hard');
        else if (e.key === '3') handleRating('good');
        else if (e.key === '4') handleRating('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, handleRating]);

  // If no cards were extracted from notes at all
  if (allCards.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-stone-50/50 rounded-2xl border border-stone-200">
        <Sparkles className="w-10 h-10 text-stone-300 mx-auto mb-3" />
        <h3 className="font-serif text-lg font-bold text-stone-800">No Flashcards Detected Yet</h3>
        <p className="text-stone-500 text-xs mt-1 max-w-md mx-auto">
          This lecture does not contain callout rules or tables yet. Switch to another lecture or choose "All Lectures".
        </p>
        <button
          onClick={() => setScope('all')}
          className="mt-4 btn-gold text-xs px-4 py-2"
        >
          Review Across All Lectures
        </button>
      </div>
    );
  }

  const masteryBadge = currentCardProgress?.mastery || 'new';

  return (
    <div className="space-y-6">
      {/* Scope & Mode Navigation Header */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3">
        {/* Row 1: Scope (This Lecture vs All) & Shuffle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScope('current')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scope === 'current'
                  ? 'bg-accent-gold text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              This Lecture ({activeNote.title.replace(/Hasta\s+S[aā]mudrik[aā]\s+Ś[aā]stra\s*[:(Palmistry)–-]*/i, '').slice(0, 22)})
            </button>
            <button
              onClick={() => setScope('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scope === 'all'
                  ? 'bg-accent-gold text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              All Lectures ({allNotes.length})
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs flex-wrap">
            <button
              onClick={handleShuffle}
              disabled={queue.length <= 1}
              className="btn-outline px-2.5 py-1 text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
              title="Randomize card"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Shuffle
            </button>
            <button
              onClick={handleExportSrs}
              className="btn-outline px-2.5 py-1 text-xs flex items-center gap-1 cursor-pointer"
              title="Backup SRS progress to JSON"
            >
              <Download className="w-3.5 h-3.5" />
              Backup
            </button>
            <label
              className="btn-outline px-2.5 py-1 text-xs flex items-center gap-1 cursor-pointer"
              title="Restore SRS progress from JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              Restore
              <input type="file" accept=".json" onChange={handleImportSrs} className="hidden" />
            </label>
            {queue.length > 0 && (
              <span className="text-stone-400 font-mono text-[11px] font-semibold ml-1">
                {currentIndex + 1} / {queue.length}
              </span>
            )}
          </div>
        </div>

        {/* Row 2: SRS Queue Mode Tabs with Live Counts */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setMode('due')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === 'due'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span>🎯 Due for Review</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              mode === 'due' ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'
            }`}>
              {stats.due}
            </span>
          </button>

          <button
            onClick={() => setMode('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === 'all'
                ? 'bg-stone-800 text-white font-bold shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span>📚 Browse All</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              mode === 'all' ? 'bg-stone-700 text-white' : 'bg-stone-200 text-stone-800'
            }`}>
              {stats.total}
            </span>
          </button>

          <button
            onClick={() => setMode('learning')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === 'learning'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span>⏳ Learning</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              mode === 'learning' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800'
            }`}>
              {stats.learning}
            </span>
          </button>

          <button
            onClick={() => setMode('mastered')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === 'mastered'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span>🎓 Mastered</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              mode === 'mastered' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {stats.mastered}
            </span>
          </button>
        </div>
      </div>

      {/* When Due Queue is Complete / Empty */}
      {queue.length === 0 ? (
        <div className="text-center py-16 px-6 bg-gradient-to-b from-emerald-50/50 to-white rounded-2xl border border-emerald-200/80 shadow-xs space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-stone-900">
              {mode === 'due' ? "All Caught Up for Today! 🎉" : "No Cards in this Category"}
            </h3>
            <p className="text-stone-500 text-xs max-w-md mx-auto">
              {mode === 'due'
                ? `You have zero cards due for review right now in ${scope === 'current' ? 'this lecture' : 'all lectures'}. Next interval due dates have been scheduled according to your SM-2 ratings.`
                : `There are currently no cards marked as ${mode}. Switch back to "Due for Review" or "Browse All".`}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => setMode('all')}
              className="btn-gold text-xs px-4 py-2 font-bold cursor-pointer"
            >
              Browse All Cards ({stats.total})
            </button>
            {scope === 'current' && (
              <button
                onClick={() => { setScope('all'); setMode('due'); }}
                className="btn-outline text-xs px-4 py-2 cursor-pointer"
              >
                Check Other Lectures
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Main Flashcard Container */}
          <div
            onClick={handleFlip}
            className="cursor-pointer select-none perspective-1000 min-h-[300px] sm:min-h-[340px] flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-br from-white to-amber-50/20 border-2 border-stone-200 rounded-2xl shadow-sm hover:border-accent-gold/60 transition-all duration-300 relative group"
          >
            {/* Top Badges */}
            <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                  {currentCard?.tag}
                </span>

                {masteryBadge === 'mastered' ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-1.5 py-0.5 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Mastered
                  </span>
                ) : masteryBadge === 'review' ? (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-1.5 py-0.5">
                    Reviewing
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-1.5 py-0.5">
                    Learning
                  </span>
                )}

                {/* SRS Due Date Timing Indicator */}
                <span className="text-[10px] font-medium text-stone-500 bg-stone-50 border border-stone-200 rounded-md px-1.5 py-0.5 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-stone-400" />
                  {formatDueTime(currentCardProgress)}
                </span>
              </div>

              <span className="text-[10px] text-stone-400 font-semibold truncate max-w-[200px]" title={currentCard?.sourceTitle}>
                {currentCard?.sourceTitle.replace(/Hasta\s+S[aā]mudrik[aā]\s+Ś[aā]stra\s*[:(Palmistry)–-]*/i, '')}
              </span>
            </div>

            {/* Card Body */}
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              {!isFlipped ? (
                /* Front side */
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-accent-gold uppercase tracking-widest flex items-center justify-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" /> Prompt / Question
                  </span>
                  <p className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-relaxed max-w-xl">
                    {currentCard?.front}
                  </p>
                  {currentCard?.tip && (
                    <p className="text-xs text-stone-500 italic mt-1">{currentCard.tip}</p>
                  )}
                </div>
              ) : (
                /* Back side (revealed answer) */
                <div className="space-y-3 animate-fade-in w-full max-w-xl mx-auto">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest flex items-center justify-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Classical Rule / Verdict
                  </span>
                  <div className="text-base sm:text-lg text-stone-850 font-medium leading-relaxed text-left bg-stone-50/80 p-4 rounded-xl border border-stone-200">
                    {currentCard?.back}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Hint or Quick Navigation */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs text-stone-400">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-1.5 hover:text-stone-800 disabled:opacity-20 cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              <span className="font-medium text-[11px]">
                {isFlipped ? 'Rate your recall below (or press 1-4)' : 'Click card or press Space to flip'}
              </span>

              <button
                onClick={handleNext}
                disabled={currentIndex === queue.length - 1}
                className="p-1.5 hover:text-stone-800 disabled:opacity-20 cursor-pointer flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SRS Self-Rating Bar (Shown after flip) */}
          {isFlipped && (
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  How easily did you recall this rule?
                </p>
                <span className="text-[10px] text-stone-400 font-medium">
                  Keyboard: keys 1 to 4
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleRating('again')}
                  className="py-2.5 px-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all cursor-pointer flex flex-col items-center"
                >
                  <span>1. Forgot (Again)</span>
                  <span className="text-[10px] text-rose-500 font-normal">Repeat in 1 day</span>
                </button>
                <button
                  onClick={() => handleRating('hard')}
                  className="py-2.5 px-2 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 text-xs font-bold transition-all cursor-pointer flex flex-col items-center"
                >
                  <span>2. Hard</span>
                  <span className="text-[10px] text-amber-600 font-normal">Repeat in ~2 days</span>
                </button>
                <button
                  onClick={() => handleRating('good')}
                  className="py-2.5 px-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-all cursor-pointer flex flex-col items-center"
                >
                  <span>3. Good</span>
                  <span className="text-[10px] text-blue-500 font-normal">Normal interval</span>
                </button>
                <button
                  onClick={() => handleRating('easy')}
                  className="py-2.5 px-2 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-all cursor-pointer flex flex-col items-center"
                >
                  <span>4. Easy</span>
                  <span className="text-[10px] text-emerald-600 font-normal">Mastered (bonus)</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
