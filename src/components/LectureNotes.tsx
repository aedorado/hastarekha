'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, GraduationCap, X, ChevronRight, Bookmark } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface Note {
  id: string;
  fileName: string;
  title: string;
  content: string;
}

export default function LectureNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const res = await fetch('/api/notes');
        if (res.ok) {
          const data = await res.json();
          setNotes(data);
          if (data.length > 0) {
            setActiveNoteId(data[0].id);
          }
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
          // Extract up to 3 short snippets (e.g. 60 chars around match)
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
    // If a wikilink like [[Fiery Hand]] is clicked, search for it
    setSearchQuery(target);
  };

  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

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
          <p className="text-stone-600 text-sm mt-1">
            Browse structured transcripts, explore hand elements, and search cross-reference terms.
          </p>
        </div>
        
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1"
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Sidebar with Search and Notes List */}
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            <div className="search-input-wrapper">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                className="form-input search-input-field text-sm pl-9"
                placeholder="Search transcript text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Note Cards List */}
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {searchResults.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                  <p className="text-stone-400 text-xs font-medium">No matches found.</p>
                </div>
              ) : (
                searchResults.map(({ note, matchesCount, snippets }) => {
                  const isActive = note.id === activeNoteId;
                  // Get readable index/number from title or filename (e.g. 01)
                  const lecNum = note.fileName.match(/^\d+/)?.[0] || '•';

                  return (
                    <div
                      key={note.id}
                      onClick={() => setActiveNoteId(note.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                        isActive
                          ? 'bg-amber-500/5 border-accent-gold shadow-sm'
                          : 'bg-white border-stone-200 hover:bg-stone-50/50 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                          isActive ? 'bg-accent-gold text-white' : 'bg-stone-100 text-stone-600'
                        }`}>
                          L{lecNum}
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-xs md:text-sm font-bold leading-snug line-clamp-2 ${
                            isActive ? 'text-stone-900' : 'text-stone-800'
                          }`}>
                            {note.title.replace(/Hasta Sāmudrika Śāstra (Palmistry) –\s*/, '')}
                          </h4>
                        </div>
                      </div>

                      {/* Display Search Status / Snippets */}
                      {searchQuery.trim() ? (
                        <div className="space-y-1.5 pt-1 border-t border-stone-100">
                          <div className="text-[10px] font-bold text-accent-gold uppercase tracking-wider">
                            ✨ {matchesCount} {matchesCount === 1 ? 'match' : 'matches'}
                          </div>
                          {snippets.map((snip, index) => (
                            <p key={index} className="text-[10px] leading-relaxed text-stone-500 italic font-medium">
                              {renderHighlightedSnippet(snip, searchQuery)}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-1">
                          <span className="flex items-center gap-0.5">
                            <Bookmark className="w-3 h-3 text-accent-gold/40" />
                            Reference Guide
                          </span>
                          <ChevronRight className="w-3 h-3 text-stone-300" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Reading Pane */}
          <div className="md:col-span-8 lg:col-span-9">
            {activeNote ? (
              <div className="bg-stone-50/30 rounded-2xl border border-stone-200/60 p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin">
                <div className="border-b border-stone-200 pb-4 flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-accent-gold uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                      Lecture Material
                    </span>
                    <h2 className="mystic-title text-xl md:text-2xl mt-2 leading-snug">
                      {activeNote.title}
                    </h2>
                  </div>
                </div>

                <div className="prose max-w-none text-stone-850">
                  <MarkdownRenderer 
                    content={activeNote.content} 
                    onWikilinkClick={handleWikilinkClick}
                  />
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
        </div>
      )}
    </div>
  );
}
