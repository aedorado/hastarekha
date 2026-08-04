'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, GraduationCap, X, List } from 'lucide-react';
import MarkdownRenderer, { createSlugger } from './MarkdownRenderer';
import { useRouter, useSearchParams } from 'next/navigation';

interface Note {
  id: string;
  fileName: string;
  title: string;
  content: string;
}


export default function LectureNotes() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Custom reading experience states
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif'>('serif');
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isOutlineCollapsed, setIsOutlineCollapsed] = useState<boolean>(false);
  const [completedNotes, setCompletedNotes] = useState<string[]>([]);
  const [studyMode, setStudyMode] = useState<'read' | 'annotate' | 'review'>('read');
  const [bookmarkedNotes, setBookmarkedNotes] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<Record<string, Array<{ id: string; text: string; color: string; note?: string }>>>({});
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [isTocOpen, setIsTocOpen] = useState(false);

  const activeNoteId = searchParams.get('note') || (notes.length > 0 ? notes[0].id : null);
  const searchQuery = searchParams.get('q') || '';

  const setActiveNoteId = (id: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set('note', id);
    } else {
      params.delete('note');
    }
    router.replace(`/study?${params.toString()}`);
  };

  const setSearchQuery = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    router.replace(`/study?${params.toString()}`);
  };

  // Load custom reading configurations from LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCompleted = localStorage.getItem('completed_lectures');
      if (savedCompleted) {
        try {
          setCompletedNotes(JSON.parse(savedCompleted));
        } catch (e) {
          console.error('Failed to load completed lectures', e);
        }
      }

      const savedFontSize = localStorage.getItem('study_font_size');
      if (savedFontSize && ['sm', 'base', 'lg', 'xl'].includes(savedFontSize)) {
        setFontSize(savedFontSize as any);
      }

      const savedFontFamily = localStorage.getItem('study_font_family');
      if (savedFontFamily && ['sans', 'serif'].includes(savedFontFamily)) {
        setFontFamily(savedFontFamily as any);
      }

      const savedBookmarks = localStorage.getItem('bookmarked_lectures');
      if (savedBookmarks) {
        try {
          setBookmarkedNotes(JSON.parse(savedBookmarks));
        } catch (e) {
          console.error('Failed to load bookmarks', e);
        }
      }

      const savedHighlights = localStorage.getItem('lecture_highlights');
      if (savedHighlights) {
        try {
          setHighlights(JSON.parse(savedHighlights));
        } catch (e) {
          console.error('Failed to load highlights', e);
        }
      }
    }
  }, []);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const res = await fetch('/api/notes');
        if (res.ok) {
          const data = await res.json();
          setNotes(data);
        }
      } catch (err) {
        console.error('Failed to load notes', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchNotes();
  }, []);

  // Filter notes and compute search results/snippets
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return notes.map(note => ({
        note,
        matchesCount: 0,
        snippets: [] as string[],
      }));
    }

    const query = searchQuery.toLowerCase();

    return notes
      .map(note => {
        const titleMatch = note.title.toLowerCase().includes(query);

        // Find all occurrences in content and extract snippets
        const content = note.content;
        const matchesCount = (content.toLowerCase().match(new RegExp(escapeRegExp(query), 'g')) || []).length;

        const snippets: string[] = [];
        if (matchesCount > 0) {
          // Extract up to 2 short snippets (e.g. 60 chars around match)
          let index = content.toLowerCase().indexOf(query);
          while (index !== -1 && snippets.length < 2) {
            const start = Math.max(0, index - 25);
            const end = Math.min(content.length, index + query.length + 35);
            let snippet = content.slice(start, end).replace(/\n/g, ' ').trim();
            if (start > 0) snippet = '...' + snippet;
            if (end < content.length) snippet = snippet + '...';

            snippets.push(snippet);
            index = content.toLowerCase().indexOf(query, index + 1);
          }
        }

        return {
          note,
          matchesCount: matchesCount + (titleMatch ? 5 : 0), // boost title matches
          snippets,
        };
      })
      .filter(res => res.matchesCount > 0 || !searchQuery.trim())
      .sort((a, b) => b.matchesCount - a.matchesCount);
  }, [notes, searchQuery]);

  const activeNote = useMemo(() => {
    return notes.find(n => n.id === activeNoteId) || null;
  }, [notes, activeNoteId]);

  const handleWikilinkClick = (target: string) => {
    setSearchQuery(target);
  };

  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Toggle lecture completed status
  const toggleCompleted = (id: string) => {
    const updated = completedNotes.includes(id)
      ? completedNotes.filter(n => n !== id)
      : [...completedNotes, id];
    setCompletedNotes(updated);
    localStorage.setItem('completed_lectures', JSON.stringify(updated));
  };

  // Toggle bookmark
  const toggleBookmark = (id: string) => {
    const updated = bookmarkedNotes.includes(id)
      ? bookmarkedNotes.filter(n => n !== id)
      : [...bookmarkedNotes, id];
    setBookmarkedNotes(updated);
    localStorage.setItem('bookmarked_lectures', JSON.stringify(updated));
  };

  // Add highlight
  const addHighlight = (text: string, color: 'gold' | 'blue' | 'green') => {
    if (!activeNote) return;
    const highlightId = Date.now().toString();
    const updated = {
      ...highlights,
      [activeNote.id]: [
        ...(highlights[activeNote.id] || []),
        { id: highlightId, text, color, note: '' }
      ]
    };
    setHighlights(updated);
    localStorage.setItem('lecture_highlights', JSON.stringify(updated));
    setSelectedText('');
    setShowHighlightMenu(false);
  };

  // Handle text selection
  const handleTextSelection = () => {
    const selected = window.getSelection()?.toString() || '';
    if (selected.length > 0) {
      setSelectedText(selected);
      setShowHighlightMenu(true);
    }
  };

  // Extract dynamic outline (Table of Contents) from headings in the markdown content.
  // Many lectures reuse generic subheadings ("Physical Description", "Character", ...) under
  // every section, so ids must be de-duplicated the same way MarkdownRenderer does when it
  // assigns anchor ids — otherwise every TOC link for a repeated heading would jump to the
  // first occurrence. We walk ALL heading levels (# through ####) in document order through
  // one shared slugger, just like the renderer does, but only list ## and ### in the outline.
  const toc = useMemo(() => {
    if (!activeNote) return [];
    const lines = activeNote.content.split('\n');
    const headers: { level: number; text: string; id: string }[] = [];
    const getUniqueId = createSlugger();

    lines.forEach(line => {
      const trimmed = line.trim();
      const match = trimmed.match(/^(#{1,4})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const rawText = match[2].trim();
        const id = getUniqueId(rawText);

        if (level === 2 || level === 3) {
          // Clean markdown styling tags for display in outline index
          const text = rawText
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/\[\[([^|\]]+)(?:\|[^\]]+)?\]\]/g, '$1');

          headers.push({ level, text, id });
        }
      }
    });
    return headers;
  }, [activeNote]);

  // Focus Mode hides both side panels for distraction-free reading; isOutlineCollapsed lets
  // the outline be hidden on its own while keeping the lecture list visible.
  const showOutline = !isFocusMode && !isOutlineCollapsed && toc.length > 0;

  // Jump to a heading by id. Headings live inside the reading pane's own overflow-y-auto
  // container, and native `<a href="#id">` fragment scrolling into nested scroll containers
  // is inconsistent across browsers — so we scroll explicitly instead of relying on it.
  const jumpToHeading = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsTocOpen(false);
  };

  // Find adjacent notes for linear navigation
  const currentNoteIndex = useMemo(() => {
    if (!activeNote) return -1;
    return notes.findIndex(n => n.id === activeNote.id);
  }, [notes, activeNote]);

  const prevNote = currentNoteIndex > 0 ? notes[currentNoteIndex - 1] : null;
  const nextNote = currentNoteIndex !== -1 && currentNoteIndex < notes.length - 1 ? notes[currentNoteIndex + 1] : null;

  // Helper to highlight matched search text in snippets
  const renderHighlightedSnippet = (snippet: string, query: string) => {
    if (!query) return snippet;
    const parts = snippet.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-amber-100 text-amber-900 font-bold px-0.5 rounded">{part}</mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <h1 className="mystic-title text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-accent-gold" />
            Hasta-Sāmudrika Study Guide
          </h1>
        </div>

        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Clear Search
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-stone-200 border-t-accent-gold rounded-full animate-spin"></div>
          <p className="text-stone-500 text-xs mt-3 font-semibold">Loading Lecture Notes...</p>
        </div>
      ) : (
        <>
          {/* Full-width Search Bar */}
          <div className="search-input-wrapper">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              className="form-input search-input-field text-sm pl-9"
              placeholder="Search lecture text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid max-lg:grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Left Column: Clean vertical list of Lectures */}
            {!isFocusMode && (
              <div className="lg:col-span-1 space-y-2 lg:sticky lg:top-6">
                <div className="flex items-center justify-between px-0.5">
                  <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Lectures</h4>
                  <button
                    onClick={() => setIsFocusMode(true)}
                    className="p-1 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-all cursor-pointer"
                    title="Hide lecture list"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-col gap-0 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1 scrollbar-thin">
                  {searchResults.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-stone-200 rounded-lg bg-stone-50/50">
                      <p className="text-stone-400 text-xs font-medium">No matches found.</p>
                    </div>
                  ) : (
                    searchResults.map(({ note, matchesCount, snippets }) => {
                      const isActive = note.id === activeNoteId;
                      const isCompleted = completedNotes.includes(note.id);
                      const isBookmarked = bookmarkedNotes.includes(note.id);
                      const lecNum = note.fileName.match(/^\d+/)?.[0] || '•';
                      const shortTitle = note.title
                        .replace(/Hasta\s+S[aā]mudrik[aā]\s+Ś[aā]stra\s*[:(Palmistry)–-]*\s*/i, '')
                        .replace(/^–\s*/, '')
                        .trim();

                      return (
                        <div
                          key={note.id}
                          onClick={() => setActiveNoteId(note.id)}
                          className={`group border-b transition-all cursor-pointer flex items-center justify-between px-2.5 py-2 min-h-[2.5rem] ${isActive
                            ? 'bg-amber-500/8 border-amber-300 border-l-2 border-l-accent-gold'
                            : 'bg-white border-stone-100 hover:bg-stone-50/80'
                            }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${isActive
                              ? 'bg-accent-gold text-white'
                              : isCompleted
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-stone-100 text-stone-500 group-hover:bg-stone-200'
                              }`}>
                              {lecNum}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className={`text-xs font-semibold leading-tight truncate ${isActive ? 'text-stone-900' : 'text-stone-700 group-hover:text-stone-800'
                                }`}>
                                {shortTitle}
                              </p>
                              {searchQuery.trim() && snippets && snippets.length > 0 && (
                                <p className="text-[9px] text-stone-500 italic leading-tight truncate mt-0.5">
                                  {renderHighlightedSnippet(snippets[0], searchQuery)}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            {isBookmarked && <span className="text-xs">📌</span>}
                            {isCompleted && (
                              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                                <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Right Column: Reading Pane & Sticky TOC outline */}
            <div className={`${isFocusMode ? 'lg:col-span-4 max-w-none mx-auto w-full' : 'lg:col-span-3'} grid max-lg:grid-cols-1 lg:grid-cols-3 gap-6`}>
              {/* Reading Content Pane */}
              <div className={`col-span-1 ${showOutline ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
                {activeNote ? (
                  <div className="bg-stone-50/30 rounded-2xl border border-stone-200/60 p-6 md:p-8 space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin prose-p:leading-relaxed prose-p:text-[17px]">
                    {/* Note Title & Reading controls toolbar */}
                    <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-accent-gold uppercase tracking-wider">
                          Lecture Note
                        </span>
                        <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-900 mt-0.5 leading-snug">
                          {activeNote.title
                            .replace(/Hasta\s+S[aā]mudrik[aā]\s+Ś[aā]stra\s*(\(Palmistry\))?\s*[–\-:]?\s*/i, '')
                            .replace(/^[–\-]\s*/, '')
                            .trim()}
                        </h2>
                      </div>

                      {/* Study Mode Buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 p-1 rounded-xl shrink-0 self-start sm:self-auto max-w-full">
                        <button
                          onClick={() => setStudyMode('read')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${studyMode === 'read'
                            ? 'bg-white text-stone-900 shadow-sm'
                            : 'text-stone-600 hover:bg-white/50'
                          }`}
                          title="Read Mode"
                        >
                          📖
                        </button>
                        <button
                          onClick={() => setStudyMode('annotate')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${studyMode === 'annotate'
                            ? 'bg-white text-stone-900 shadow-sm'
                            : 'text-stone-600 hover:bg-white/50'
                          }`}
                          title="Annotate Mode"
                        >
                          ✍️
                        </button>
                        <button
                          onClick={() => setStudyMode('review')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${studyMode === 'review'
                            ? 'bg-white text-stone-900 shadow-sm'
                            : 'text-stone-600 hover:bg-white/50'
                          }`}
                          title="Review Mode"
                        >
                          🎯
                        </button>

                        <div className="h-4 w-px bg-stone-200 mx-0.5" />

                        <button
                          onClick={() => toggleBookmark(activeNote.id)}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer text-xs font-bold ${bookmarkedNotes.includes(activeNote.id)
                            ? 'bg-accent-gold text-white'
                            : 'text-stone-600 hover:bg-white'
                          }`}
                          title="Bookmark this lecture"
                        >
                          📌
                        </button>

                        <div className="h-4 w-px bg-stone-200 mx-0.5" />

                        <button
                          onClick={() => {
                            const newFamily = fontFamily === 'sans' ? 'serif' : 'sans';
                            setFontFamily(newFamily);
                            localStorage.setItem('study_font_family', newFamily);
                          }}
                          className="p-1.5 rounded-lg text-stone-650 hover:bg-white transition-all cursor-pointer text-xs font-bold flex items-center gap-1"
                          title="Toggle Font Family (Serif / Sans)"
                        >
                          <span className={fontFamily === 'serif' ? 'font-serif' : 'font-sans'}>Aa</span>
                        </button>

                        <div className="h-4 w-px bg-stone-200 mx-0.5" />

                        <button
                          onClick={() => {
                            const sizes: ('sm' | 'base' | 'lg' | 'xl')[] = ['sm', 'base', 'lg', 'xl'];
                            const idx = sizes.indexOf(fontSize);
                            if (idx > 0) {
                              setFontSize(sizes[idx - 1]);
                              localStorage.setItem('study_font_size', sizes[idx - 1]);
                            }
                          }}
                          disabled={fontSize === 'sm'}
                          className="p-1.5 rounded-lg text-stone-650 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer text-xs font-bold"
                          title="Decrease Font Size"
                        >
                          A-
                        </button>

                        <span className="text-[10px] font-bold text-stone-500 w-8 text-center uppercase">
                          {fontSize}
                        </span>

                        <button
                          onClick={() => {
                            const sizes: ('sm' | 'base' | 'lg' | 'xl')[] = ['sm', 'base', 'lg', 'xl'];
                            const idx = sizes.indexOf(fontSize);
                            if (idx < sizes.length - 1) {
                              setFontSize(sizes[idx + 1]);
                              localStorage.setItem('study_font_size', sizes[idx + 1]);
                            }
                          }}
                          disabled={fontSize === 'xl'}
                          className="p-1.5 rounded-lg text-stone-650 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer text-xs font-bold"
                          title="Increase Font Size"
                        >
                          A+
                        </button>

                        <div className="h-4 w-px bg-stone-200 mx-0.5" />

                        <button
                          onClick={() => setIsFocusMode(!isFocusMode)}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer text-xs font-semibold flex items-center gap-1 ${isFocusMode
                            ? 'bg-accent-gold text-white shadow-sm hover:bg-amber-600'
                            : 'text-stone-650 hover:bg-white'
                            }`}
                          title="Toggle Focus Mode"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Focus</span>
                        </button>

                        {toc.length > 0 && (
                          <>
                            <div className="h-4 w-px bg-stone-200 mx-0.5" />
                            <button
                              onClick={() => {
                                // On desktop the outline lives in a sticky column — re-show it if
                                // collapsed. On mobile that column never renders, so open the drawer.
                                if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
                                  setIsOutlineCollapsed(false);
                                } else {
                                  setIsTocOpen(true);
                                }
                              }}
                              className={`p-1.5 rounded-lg transition-all cursor-pointer text-xs font-semibold flex items-center gap-1 ${showOutline
                                ? 'bg-white text-stone-900 shadow-sm'
                                : 'text-stone-650 hover:bg-white'
                                }`}
                              title="Show Outline"
                            >
                              <List className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Outline</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Highlight Menu (Annotate Mode) */}
                    {showHighlightMenu && studyMode === 'annotate' && (
                      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                        <span className="text-xs text-amber-900 font-medium flex-1 truncate">"{selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}"</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => addHighlight(selectedText, 'gold')}
                            className="w-5 h-5 rounded bg-yellow-300 hover:bg-yellow-400 border border-yellow-500 transition-all cursor-pointer"
                            title="Important"
                          />
                          <button
                            onClick={() => addHighlight(selectedText, 'blue')}
                            className="w-5 h-5 rounded bg-blue-300 hover:bg-blue-400 border border-blue-500 transition-all cursor-pointer"
                            title="Question"
                          />
                          <button
                            onClick={() => addHighlight(selectedText, 'green')}
                            className="w-5 h-5 rounded bg-green-300 hover:bg-green-400 border border-green-500 transition-all cursor-pointer"
                            title="Action Item"
                          />
                          <button
                            onClick={() => setShowHighlightMenu(false)}
                            className="text-xs font-bold text-amber-900 hover:text-amber-950 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Content Rendering */}
                    <div
                      className={`${studyMode === 'review' ? 'hidden' : ''} prose max-w-none text-stone-850 leading-relaxed`}
                      onMouseUp={studyMode === 'annotate' ? handleTextSelection : undefined}
                    >
                      <MarkdownRenderer
                        content={activeNote.content}
                        onWikilinkClick={handleWikilinkClick}
                        fontSize={fontSize}
                        fontFamily={fontFamily}
                      />
                    </div>

                    {/* Review Mode - Show Highlights Only */}
                    {studyMode === 'review' && (
                      <div className="space-y-4">
                        {highlights[activeNote.id] && highlights[activeNote.id].length > 0 ? (
                          <>
                            <h3 className="font-bold text-stone-900 text-lg">Your Highlights & Notes</h3>
                            <div className="space-y-3">
                              {highlights[activeNote.id].map((hl) => (
                                <div key={hl.id} className={`p-3 rounded-lg border-l-4 ${
                                  hl.color === 'gold' ? 'bg-yellow-50 border-yellow-400' :
                                  hl.color === 'blue' ? 'bg-blue-50 border-blue-400' :
                                  'bg-green-50 border-green-400'
                                }`}>
                                  <p className="text-sm text-stone-800 italic mb-2">"{hl.text}"</p>
                                  {hl.note && <p className="text-xs text-stone-600">Note: {hl.note}</p>}
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8 text-stone-500">
                            <p className="text-sm">No highlights yet. Switch to <span className="font-bold">Annotate Mode</span> to add highlights.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Footer */}
                    <div className="border-t border-stone-200 pt-6 mt-8 space-y-6">
                      {/* Learning Stats Section */}
                      <div className="grid grid-cols-2 gap-3 bg-gradient-to-r from-stone-50 to-amber-50/30 p-4 rounded-xl border border-stone-200/60">
                        <div>
                          <p className="text-xs text-stone-500 font-medium">Highlights</p>
                          <p className="text-2xl font-bold text-stone-900">{highlights[activeNote.id]?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-500 font-medium">Study Mode</p>
                          <p className="text-sm font-bold text-stone-900 capitalize">{studyMode === 'read' ? '📖 Reading' : studyMode === 'annotate' ? '✍️ Annotating' : '🎯 Reviewing'}</p>
                        </div>
                      </div>

                      {/* Mark Completed Section */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200/60">
                        <div>
                          <h4 className="text-sm font-bold text-stone-800">Completed this lecture?</h4>
                          <p className="text-stone-500 text-xs mt-0.5 font-medium">Mark it to track your progress and review later.</p>
                        </div>
                        <button
                          onClick={() => toggleCompleted(activeNote.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border shrink-0 ${completedNotes.includes(activeNote.id)
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm hover:bg-emerald-600'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300'
                            }`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {completedNotes.includes(activeNote.id) ? 'Completed' : 'Mark Completed'}
                        </button>
                      </div>

                      {/* Next / Prev Lecture Navigation */}
                      <div className="flex items-center justify-between gap-4 pt-2">
                        {prevNote ? (
                          <button
                            onClick={() => setActiveNoteId(prevNote.id)}
                            className="flex-1 text-left p-3 rounded-xl border border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-all group max-w-[48%] cursor-pointer"
                          >
                            <span className="text-[10px] font-bold text-stone-400 uppercase block tracking-wider mb-0.5">Previous Lecture</span>
                            <span className="text-xs font-bold text-stone-700 group-hover:text-stone-900 line-clamp-1">
                              {prevNote.title
                                .replace(/Hasta\s+S[aā]mudrik[aā]\s+Ś[aā]stra\s*(\(Palmistry\))?\s*[–\-:]?\s*/i, '')
                                .replace(/^[–\-]\s*/, '')
                                .trim()}
                            </span>
                          </button>
                        ) : (
                          <div className="flex-1 max-w-[48%]" />
                        )}

                        {nextNote ? (
                          <button
                            onClick={() => setActiveNoteId(nextNote.id)}
                            className="flex-1 text-right p-3 rounded-xl border border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-all group max-w-[48%] cursor-pointer"
                          >
                            <span className="text-[10px] font-bold text-stone-400 uppercase block tracking-wider mb-0.5">Next Lecture</span>
                            <span className="text-xs font-bold text-stone-700 group-hover:text-accent-gold line-clamp-1">
                              {nextNote.title
                                .replace(/Hasta\s+S[aā]mudrik[aā]\s+Ś[aā]stra\s*(\(Palmistry\))?\s*[–\-:]?\s*/i, '')
                                .replace(/^[–\-]\s*/, '')
                                .trim()}
                            </span>
                          </button>
                        ) : (
                          <div className="flex-1 max-w-[48%]" />
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-24 bg-stone-50/50 rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center">
                    <BookOpen className="w-12 h-12 text-stone-300 mb-3" />
                    <h3 className="font-bold text-stone-800 text-lg">No Lecture Selected</h3>
                    <p className="text-stone-500 text-xs mt-1.5 max-w-sm text-center leading-relaxed">
                      Select a lecture from the sidebar to begin reading. You can search for specific terminology to jump directly to references.
                    </p>
                  </div>
                )}
              </div>

              {/* Sticky TOC Outline Column on Large Screens */}
              {activeNote && showOutline && (
                <div className="hidden lg:block lg:col-span-1 sticky top-6 self-start max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 border-l border-stone-200 pl-4 py-1 scrollbar-thin">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Outline</h4>
                    <button
                      onClick={() => setIsOutlineCollapsed(true)}
                      className="p-1 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-all cursor-pointer"
                      title="Hide outline"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <ul className="space-y-2 text-xs">
                    {toc.map((item, idx) => (
                      <li
                        key={idx}
                        className={`transition-colors leading-normal ${item.level === 3
                          ? 'pl-3 text-stone-500 hover:text-stone-800'
                          : 'font-semibold text-stone-600 hover:text-accent-gold'
                          }`}
                      >
                        <a href={`#${item.id}`} onClick={(e) => jumpToHeading(e, item.id)} className="block py-0.5 hover:underline">
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Outline Drawer — works at any screen size, primary access on mobile/tablet */}
          {activeNote && toc.length > 0 && isTocOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/30 z-40"
                onClick={() => setIsTocOpen(false)}
              />
              <div className="fixed inset-y-0 right-0 w-72 max-w-[85vw] bg-white shadow-xl z-50 flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Outline</h4>
                  <button
                    onClick={() => setIsTocOpen(false)}
                    className="p-1 rounded-lg text-stone-500 hover:bg-stone-100 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <ul className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-2 text-xs">
                  {toc.map((item, idx) => (
                    <li
                      key={idx}
                      className={`transition-colors leading-normal ${item.level === 3
                        ? 'pl-3 text-stone-500 hover:text-stone-800'
                        : 'font-semibold text-stone-600 hover:text-accent-gold'
                        }`}
                    >
                      <a
                        href={`#${item.id}`}
                        onClick={(e) => jumpToHeading(e, item.id)}
                        className="block py-0.5 hover:underline"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
