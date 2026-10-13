'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Filter,
  Award,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Check,
  FileQuestion,
  GraduationCap,
  Layers,
  ArrowRight,
  RefreshCw,
  Eye,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { QuizQuestion, QuestionType } from '@/lib/learningTypes';
import { getCuratedDeckForNote } from '@/data/learning';

interface QuizEngineProps {
  noteId: string;
  noteTitle: string;
}

export default function QuizEngine({ noteId, noteTitle }: QuizEngineProps) {
  const curatedDeck = useMemo(() => getCuratedDeckForNote(noteId), [noteId]);
  const allQuestions: QuizQuestion[] = useMemo(() => curatedDeck?.quizzes || [], [curatedDeck]);

  // Filters & State
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showOnlyMissed, setShowOnlyMissed] = useState<boolean>(false);
  const [showOnlyFlagged, setShowOnlyFlagged] = useState<boolean>(false);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedMultiple, setSelectedMultiple] = useState<number[]>([]);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);

  // Persistence for user answers & flags
  const storageKey = `hastarekha_quiz_progress_${noteId}`;
  const [answerMap, setAnswerMap] = useState<Record<string, { selected: number | number[]; isCorrect: boolean }>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        // ignore storage error
      }
    }
    return {};
  });

  const [flaggedIds, setFlaggedIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`${storageKey}_flags`);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [];
  });

  // Save progress changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(answerMap));
    }
  }, [answerMap, storageKey]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${storageKey}_flags`, JSON.stringify(flaggedIds));
    }
  }, [flaggedIds, storageKey]);

  // Extract distinct subtopics
  const subtopics = useMemo(() => {
    const set = new Set<string>();
    allQuestions.forEach((q) => {
      if (q.subtopic) set.add(q.subtopic);
    });
    return Array.from(set).sort();
  }, [allQuestions]);

  // Filtered Questions Queue
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      if (selectedSubtopic !== 'all' && q.subtopic !== selectedSubtopic) return false;
      if (selectedType !== 'all' && q.type !== selectedType) return false;
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
      if (showOnlyFlagged && !flaggedIds.includes(q.id)) return false;
      if (showOnlyMissed) {
        const record = answerMap[q.id];
        if (!record || record.isCorrect) return false;
      }
      return true;
    });
  }, [allQuestions, selectedSubtopic, selectedType, selectedDifficulty, showOnlyFlagged, showOnlyMissed, flaggedIds, answerMap]);

  // Active question
  const currentQ: QuizQuestion | undefined = filteredQuestions[currentIndex];

  // Sync answer state when current question changes
  useEffect(() => {
    if (!currentQ) {
      setSelectedOption(null);
      setSelectedMultiple([]);
      setIsAnswerChecked(false);
      return;
    }

    const previousRecord = answerMap[currentQ.id];
    if (previousRecord) {
      if (Array.isArray(previousRecord.selected)) {
        setSelectedMultiple(previousRecord.selected);
        setSelectedOption(null);
      } else {
        setSelectedOption(previousRecord.selected);
        setSelectedMultiple([]);
      }
      setIsAnswerChecked(true);
    } else {
      setSelectedOption(null);
      setSelectedMultiple([]);
      setIsAnswerChecked(false);
    }
  }, [currentQ, answerMap]);

  // Reset index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedSubtopic, selectedType, selectedDifficulty, showOnlyFlagged, showOnlyMissed]);

  // Statistics
  const stats = useMemo(() => {
    const total = allQuestions.length;
    let answeredCount = 0;
    let correctCount = 0;
    let incorrectCount = 0;

    allQuestions.forEach((q) => {
      const rec = answerMap[q.id];
      if (rec) {
        answeredCount++;
        if (rec.isCorrect) correctCount++;
        else incorrectCount++;
      }
    });

    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

    return { total, answeredCount, correctCount, incorrectCount, accuracy };
  }, [allQuestions, answerMap]);

  // Toggle flag
  const toggleFlag = (id: string) => {
    setFlaggedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Option selection
  const handleSelectOption = (idx: number) => {
    if (isAnswerChecked) return; // Prevent changing after checked

    if (currentQ?.type === 'multiple') {
      setSelectedMultiple((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
      );
    } else {
      setSelectedOption(idx);
    }
  };

  // Check answer
  const handleCheckAnswer = () => {
    if (!currentQ) return;

    let isCorrect = false;
    let recordedAnswer: number | number[];

    if (currentQ.type === 'multiple') {
      const correctArr = Array.isArray(currentQ.correctAnswer) ? currentQ.correctAnswer : [currentQ.correctAnswer];
      const selectedSorted = [...selectedMultiple].sort();
      const correctSorted = [...correctArr].sort();
      isCorrect =
        selectedSorted.length === correctSorted.length &&
        selectedSorted.every((val, index) => val === correctSorted[index]);
      recordedAnswer = selectedMultiple;
    } else {
      isCorrect = selectedOption === currentQ.correctAnswer;
      recordedAnswer = selectedOption !== null ? selectedOption : -1;
    }

    setIsAnswerChecked(true);
    setAnswerMap((prev) => ({
      ...prev,
      [currentQ.id]: {
        selected: recordedAnswer,
        isCorrect,
      },
    }));
  };

  // Reset current question to retry
  const handleRetryQuestion = () => {
    if (!currentQ) return;
    setIsAnswerChecked(false);
    setSelectedOption(null);
    setSelectedMultiple([]);
    setAnswerMap((prev) => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  // Clear all progress
  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset all quiz progress for this lecture?')) {
      setAnswerMap({});
      setFlaggedIds([]);
      setIsAnswerChecked(false);
      setSelectedOption(null);
      setSelectedMultiple([]);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!isAnswerChecked && currentQ && currentQ.type !== 'multiple') {
        if (e.key === '1' && currentQ.options[0]) handleSelectOption(0);
        if (e.key === '2' && currentQ.options[1]) handleSelectOption(1);
        if (e.key === '3' && currentQ.options[2]) handleSelectOption(2);
        if (e.key === '4' && currentQ.options[3]) handleSelectOption(3);
      }

      if (e.key === 'Enter') {
        if (!isAnswerChecked) {
          if (currentQ?.type === 'multiple' ? selectedMultiple.length > 0 : selectedOption !== null) {
            handleCheckAnswer();
          }
        } else {
          handleNext();
        }
      }

      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswerChecked, currentQ, selectedOption, selectedMultiple, currentIndex, filteredQuestions.length]);

  if (!curatedDeck || allQuestions.length === 0) {
    return (
      <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-12 text-center max-w-2xl mx-auto my-8">
        <GraduationCap className="w-12 h-12 text-accent-gold mx-auto mb-4 opacity-70" />
        <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">Quiz Module Coming Soon</h3>
        <p className="text-stone-600 text-sm max-w-md mx-auto">
          A dedicated interactive quiz for this chapter is being compiled. You can explore the active recall flashcards in the review tab!
        </p>
      </div>
    );
  }

  const isCurrentFlagged = currentQ ? flaggedIds.includes(currentQ.id) : false;
  const currentRecord = currentQ ? answerMap[currentQ.id] : undefined;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Sleek Unified Mastery & Filter Bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-2 sm:p-3 shadow-xs flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs">
        {/* Left: Progress & Metrics Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <div className="flex items-center gap-1 font-bold text-stone-800 bg-stone-100/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-stone-200/80 text-[11px] sm:text-xs">
            <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent-gold" />
            <span>Answered:</span>
            <span className="text-accent-gold font-bold">{stats.answeredCount}</span>
            <span className="text-stone-400">/</span>
            <span>{stats.total}</span>
          </div>

          <div className="flex items-center gap-1 font-semibold text-stone-700 bg-stone-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-stone-200 text-[11px] sm:text-xs">
            <span>Accuracy:</span>
            <span className={`font-bold ${stats.accuracy >= 70 ? 'text-emerald-600' : stats.accuracy > 0 ? 'text-amber-600' : 'text-stone-600'}`}>
              {stats.accuracy}%
            </span>
          </div>

          {/* Mini Progress Bar */}
          <div className="hidden sm:flex items-center gap-2 pl-1">
            <div className="w-24 h-2 bg-stone-100 border border-stone-200 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 transition-all duration-300"
                style={{ width: `${(stats.correctCount / stats.total) * 100}%` }}
                title={`Correct: ${stats.correctCount}`}
              />
              <div
                className="bg-rose-500 transition-all duration-300"
                style={{ width: `${(stats.incorrectCount / stats.total) * 100}%` }}
                title={`Incorrect: ${stats.incorrectCount}`}
              />
            </div>
            <span className="text-[11px] text-stone-400 font-medium">
              {Math.round((stats.answeredCount / stats.total) * 100)}%
            </span>
          </div>
        </div>

        {/* Right: Quick Topic & Type Filters */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Subtopic Filter */}
          <select
            value={selectedSubtopic}
            onChange={(e) => setSelectedSubtopic(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-stone-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-accent-gold text-[11px] sm:text-xs max-w-[130px] sm:max-w-[160px] truncate"
          >
            <option value="all">All Topics ({allQuestions.length})</option>
            {subtopics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Question Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-stone-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-accent-gold text-[11px] sm:text-xs"
          >
            <option value="all">All Types</option>
            <option value="single">Single Choice</option>
            <option value="multiple">Multi-Select</option>
            <option value="true_false">True / False</option>
            <option value="scenario">Case Scenarios</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-stone-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-accent-gold text-[11px] sm:text-xs"
          >
            <option value="all">All Levels</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {/* Missed Only Toggle */}
          <button
            onClick={() => setShowOnlyMissed((prev) => !prev)}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 text-[11px] sm:text-xs ${showOnlyMissed
              ? 'bg-rose-100 text-rose-800 border border-rose-300'
              : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            title="Filter by missed questions only"
          >
            <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Missed</span>
            <span>({stats.incorrectCount})</span>
          </button>

          {/* Flagged Toggle */}
          <button
            onClick={() => setShowOnlyFlagged((prev) => !prev)}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 text-[11px] sm:text-xs ${showOnlyFlagged
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            title="Filter by flagged questions"
          >
            <Bookmark className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Flagged</span>
            <span>({flaggedIds.length})</span>
          </button>

          {/* Reset All Record */}
          <button
            onClick={handleResetAll}
            title="Reset Quiz Progress"
            className="p-1 sm:p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Question Arena */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
          <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-stone-400 mx-auto mb-2 sm:mb-3" />
          <h4 className="font-serif text-base sm:text-lg font-bold text-stone-800 mb-1">No Questions Match Filter</h4>
          <p className="text-xs text-stone-500 mb-4">Try clearing active filters to see all available questions.</p>
          <button
            onClick={() => {
              setSelectedSubtopic('all');
              setSelectedType('all');
              setSelectedDifficulty('all');
              setShowOnlyMissed(false);
              setShowOnlyFlagged(false);
            }}
            className="btn-gold text-xs px-3 sm:px-4 py-1.5 sm:py-2 font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : currentQ ? (
        <div className="bg-white border border-stone-200 rounded-xl sm:rounded-2xl shadow-xs overflow-hidden">
          {/* Card Top Header */}
          <div className="bg-stone-50/80 border-b border-stone-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-stone-700 bg-stone-200/80 px-3 py-1 rounded-md">
                Q {currentIndex + 1} of {filteredQuestions.length}
              </span>
              <span className="text-xs font-medium text-stone-600 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-md truncate max-w-[140px] sm:max-w-none">
                {currentQ.subtopic}
              </span>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${currentQ.difficulty === 'easy'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : currentQ.difficulty === 'medium'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
              >
                {currentQ.difficulty}
              </span>
              <span className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold">
                {currentQ.type === 'multiple'
                  ? 'Multi-Select'
                  : currentQ.type === 'true_false'
                    ? 'True/False'
                    : currentQ.type === 'scenario'
                      ? 'Case Scenario'
                      : 'Single Choice'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isAnswerChecked && (
                <button
                  type="button"
                  onClick={handleRetryQuestion}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  title="Try this question again"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-accent-gold" />
                  <span>Retry</span>
                </button>
              )}

              <button
                onClick={() => toggleFlag(currentQ.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${isCurrentFlagged
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100 border border-transparent'
                  }`}
                title={isCurrentFlagged ? 'Remove bookmark' : 'Bookmark question for review'}
              >
                {isCurrentFlagged ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5 text-amber-700" />
                    <span>Flagged</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Flag</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            {/* Practical Scenario Vignette (If applicable) */}
            {currentQ.scenario && (
              <div className="bg-amber-50/60 border-l-4 border-accent-gold p-3 sm:p-4 rounded-r-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5 text-accent-gold" /> Practical Client Vignette
                </div>
                <p className="text-xs sm:text-sm md:text-base text-stone-850 italic font-serif leading-relaxed">
                  "{currentQ.scenario}"
                </p>
              </div>
            )}

            {/* Question Text */}
            <div className="space-y-1">
              <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-stone-900 leading-snug">
                {currentQ.question}
              </h3>
              {currentQ.type === 'multiple' && (
                <p className="text-xs text-stone-500 font-medium">
                  💡 Select all options that apply, then click "Submit Answer".
                </p>
              )}
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-1">
              {currentQ.options.map((option, idx) => {
                const isSelected =
                  currentQ.type === 'multiple'
                    ? selectedMultiple.includes(idx)
                    : selectedOption === idx;

                const isCorrectOption =
                  currentQ.type === 'multiple'
                    ? Array.isArray(currentQ.correctAnswer) && currentQ.correctAnswer.includes(idx)
                    : currentQ.correctAnswer === idx;

                let optionClass =
                  'border-stone-200 bg-white hover:border-accent-gold/60 hover:bg-stone-50/50 text-stone-800';

                if (!isAnswerChecked) {
                  if (isSelected) {
                    optionClass = 'border-accent-gold bg-amber-50/40 text-stone-900 shadow-xs ring-1 ring-accent-gold';
                  }
                } else {
                  // After checked: highlight truth and mistakes
                  if (isCorrectOption) {
                    optionClass = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                  } else if (isSelected && !isCorrectOption) {
                    optionClass = 'border-rose-400 bg-rose-50/80 text-rose-950 ring-1 ring-rose-400';
                  } else {
                    optionClass = 'border-stone-200 bg-stone-50/50 opacity-60 text-stone-600';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswerChecked}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left py-3 px-4 sm:py-3.5 sm:px-5 rounded-xl border sm:border-2 transition-all flex items-start gap-3 sm:gap-4 cursor-pointer disabled:cursor-default ${optionClass}`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {currentQ.type === 'multiple' ? (
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected
                            ? 'bg-accent-gold border-accent-gold text-white'
                            : 'border-stone-300 bg-white'
                            }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      ) : (
                        <div
                          className={`w-5 h-5 rounded-full border sm:border-2 flex items-center justify-center transition-colors ${isSelected
                            ? 'border-accent-gold'
                            : 'border-stone-300 bg-white'
                            }`}
                        >
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-accent-gold" />}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-xs sm:text-sm md:text-base leading-relaxed">
                      {option}
                    </div>

                    {isAnswerChecked && (
                      <div className="shrink-0 mt-0.5">
                        {isCorrectOption ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : isSelected && !isCorrectOption ? (
                          <XCircle className="w-5 h-5 text-rose-500" />
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Check / Submit Button Bar */}
            {!isAnswerChecked && (
              <div className="pt-3 sm:pt-4 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-stone-400 hidden sm:inline">
                    Select your choice and click Submit (or press Enter)
                  </span>
                  {(selectedOption !== null || selectedMultiple.length > 0) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOption(null);
                        setSelectedMultiple([]);
                      }}
                      className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                    >
                      Reset selection
                    </button>
                  )}
                </div>
                <button
                  onClick={handleCheckAnswer}
                  disabled={
                    currentQ.type === 'multiple'
                      ? selectedMultiple.length === 0
                      : selectedOption === null
                  }
                  className="btn-gold w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-bold shadow-xs cursor-pointer disabled:opacity-40 ml-auto flex items-center justify-center gap-2"
                >
                  <span>Submit Answer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Detailed Explanation & Practical Takeaway Banner (Revealed after answer) */}
            {isAnswerChecked && currentRecord && (
              <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-stone-200 animate-fade-in">
                {/* Result Status Banner */}
                <div
                  className={`p-3 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-3 border ${currentRecord.isCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                >
                  {currentRecord.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-xs sm:text-sm">
                      {currentRecord.isCorrect ? 'Correct! Well reasoned.' : 'Not quite right. Let’s review the classical rule:'}
                    </div>
                    <div className="text-[11px] sm:text-xs opacity-90">
                      {currentRecord.isCorrect
                        ? 'Your mental model aligns precisely with the śāstric parameters of this lecture.'
                        : 'Review the detailed rationale below to strengthen this concept.'}
                    </div>
                  </div>
                </div>

                {/* Pedagogical Explanation */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 sm:p-5 space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider">
                    <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-gold" /> Classical Rationale & Nuance
                  </div>
                  <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>

                {/* Practical Takeaway Diagnostic Note */}
                {currentQ.practicalTakeaway && (
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-gold shrink-0 mt-0.5" />
                    <div className="text-[11px] sm:text-xs text-stone-850">
                      <strong className="text-amber-900 font-bold block mb-0.5">Practical Diagnostic Rule:</strong>
                      {currentQ.practicalTakeaway}
                    </div>
                  </div>
                )}

                {/* Retry Button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleRetryQuestion}
                    className="px-4 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-accent-gold" /> Try this question again
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Navigation Toolbar */}
          <div className="bg-stone-50/90 border-t border-stone-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <span className="text-xs text-stone-400 font-medium hidden sm:inline">
              Use number keys (1–4) & Enter for speedy learning
            </span>

            <div className="flex items-center gap-2">
              {isAnswerChecked && (
                <button
                  type="button"
                  onClick={handleRetryQuestion}
                  className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Try this question again"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-accent-gold" />
                  <span>Retry Question</span>
                </button>
              )}

              <button
                onClick={handleNext}
                disabled={currentIndex >= filteredQuestions.length - 1}
                className="px-4 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-30 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
