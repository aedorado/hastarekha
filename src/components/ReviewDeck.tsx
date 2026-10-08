'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
} from 'lucide-react';
import {
  Flashcard,
  extractFlashcardsFromNote,
  getSrsProgress,
  saveCardRating,
  ReviewProgress,
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
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progressMap, setProgressMap] = useState<Record<string, ReviewProgress>>({});

  // Sync SRS progress from localStorage
  useEffect(() => {
    setProgressMap(getSrsProgress());
  }, []);

  // Dynamically extract cards from either the current note or all notes combined
  const cards = useMemo(() => {
    if (scope === 'current') {
      return extractFlashcardsFromNote(activeNote.id, activeNote.title, activeNote.content);
    }
    return allNotes.flatMap((note) =>
      extractFlashcardsFromNote(note.id, note.title, note.content)
    );
  }, [scope, activeNote, allNotes]);

  // Reset index and flipped state when active note or scope changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [activeNote.id, scope]);

  const currentCard: Flashcard | undefined = cards[currentIndex];
  const currentCardProgress = currentCard ? progressMap[currentCard.id] : undefined;

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleRating = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentCard) return;
    const updated = saveCardRating(currentCard.id, rating);
    setProgressMap((prev) => ({ ...prev, [currentCard.id]: updated }));

    // Move to next card
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Loop or finish
      setCurrentIndex(0);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setCurrentIndex(Math.floor(Math.random() * Math.max(1, cards.length)));
  };

  if (cards.length === 0) {
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
      {/* Scope Selector & Stats Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScope('current')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              scope === 'current'
                ? 'bg-accent-gold text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            This Lecture ({cards.length})
          </button>
          <button
            onClick={() => setScope('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              scope === 'all'
                ? 'bg-accent-gold text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            All Lectures Combined
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleShuffle}
            className="btn-outline px-2.5 py-1 text-xs flex items-center gap-1 cursor-pointer"
            title="Randomize card"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Shuffle
          </button>
          <span className="text-stone-400 font-mono text-[11px] font-semibold">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
      </div>

      {/* Main Flashcard Container */}
      <div
        onClick={handleFlip}
        className="cursor-pointer select-none perspective-1000 min-h-[300px] sm:min-h-[340px] flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-br from-white to-amber-50/20 border-2 border-stone-200 rounded-2xl shadow-sm hover:border-accent-gold/60 transition-all duration-300 relative group"
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
              {currentCard.tag}
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
          </div>

          <span className="text-[10px] text-stone-400 font-semibold truncate max-w-[200px]">
            {currentCard.sourceTitle.replace(/Hasta\s+S[aā]mudrik[aā]\s+Ś[aā]stra\s*[:(Palmistry)–-]*/i, '')}
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
                {currentCard.front}
              </p>
              {currentCard.tip && (
                <p className="text-xs text-stone-500 italic mt-1">{currentCard.tip}</p>
              )}
            </div>
          ) : (
            /* Back side (revealed answer) */
            <div className="space-y-3 animate-fade-in">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest flex items-center justify-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Classical Rule / Verdict
              </span>
              <p className="text-base sm:text-lg text-stone-850 font-medium leading-relaxed max-w-xl text-left bg-stone-50/80 p-4 rounded-xl border border-stone-200">
                {currentCard.back}
              </p>
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
            {isFlipped ? 'Rate difficulty below to schedule next review' : 'Click card or tap to flip'}
          </span>

          <button
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            className="p-1.5 hover:text-stone-800 disabled:opacity-20 cursor-pointer flex items-center gap-1"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SRS Self-Rating Bar (Shown after flip) */}
      {isFlipped && (
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-2">
          <p className="text-[11px] font-bold text-stone-500 text-center uppercase tracking-wider">
            How well did you recall this rule?
          </p>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleRating('again')}
              className="py-2.5 px-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all cursor-pointer flex flex-col items-center"
            >
              <span>Forgot (Again)</span>
              <span className="text-[10px] text-rose-500 font-normal">Repeat now</span>
            </button>
            <button
              onClick={() => handleRating('hard')}
              className="py-2.5 px-2 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 text-xs font-bold transition-all cursor-pointer flex flex-col items-center"
            >
              <span>Hard</span>
              <span className="text-[10px] text-amber-600 font-normal">Soon</span>
            </button>
            <button
              onClick={() => handleRating('good')}
              className="py-2.5 px-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-all cursor-pointer flex flex-col items-center"
            >
              <span>Good</span>
              <span className="text-[10px] text-blue-500 font-normal">Normal</span>
            </button>
            <button
              onClick={() => handleRating('easy')}
              className="py-2.5 px-2 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-all cursor-pointer flex flex-col items-center"
            >
              <span>Easy</span>
              <span className="text-[10px] text-emerald-600 font-normal">Mastered</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
