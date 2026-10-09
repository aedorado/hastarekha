'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, X } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface ReferencePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReferencePanel({ isOpen, onClose }: ReferencePanelProps) {
  const [activeTab, setActiveTab] = useState<'mounts' | 'lines' | 'signs' | 'lectures'>('mounts');
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>('');

  useEffect(() => {
    if (activeTab === 'lectures' && notes.length === 0) {
      fetch('/api/notes')
        .then(res => res.json())
        .then(data => {
          setNotes(data);
          if (data.length > 0) {
            setSelectedNoteId(data[0].id);
          }
        })
        .catch(err => console.error(err));
    }
  }, [activeTab, notes.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-[73px] bottom-0 right-0 w-96 bg-white z-50 flex flex-col border-l border-stone-200 shadow-2xl p-6 transition-all duration-300 transform translate-x-0">
      <div className="flex justify-between items-center mb-6 border-b border-stone-200 pb-4">
        <h2 className="mystic-title text-xl flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent-gold" />
          Sāmudrika Guide
        </h2>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-accent-gold transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-1 mb-4 bg-stone-100 p-1 rounded-lg border border-stone-200">
        {(['mounts', 'lines', 'signs', 'lectures'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 px-1 text-[10px] font-bold rounded-md uppercase tracking-wider transition-all text-center cursor-pointer ${activeTab === tab
              ? 'bg-accent-gold text-white shadow-sm'
              : 'text-stone-500 hover:text-stone-850'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-sm leading-relaxed">
        {activeTab === 'mounts' && (
          <div className="space-y-4">
            <h3 className="text-accent-gold font-bold uppercase tracking-wider text-xs border-b border-stone-200 pb-1">Mounts of the Hand</h3>

            <div className="space-y-3">
              <div>
                <strong className="text-stone-900 font-bold">Jupiter (Bṛhaspati)</strong>
                <span className="text-xs text-stone-500 block font-semibold">Base of Index Finger</span>
                <p className="text-stone-600 text-xs mt-1">Ambition, leadership, self-worth, spiritual inclination, and wisdom.</p>
              </div>
              <div>
                <strong className="text-stone-900 font-bold">Saturn (Śani)</strong>
                <span className="text-xs text-stone-500 block font-semibold">Base of Middle Finger</span>
                <p className="text-stone-600 text-xs mt-1">Discipline, duty, philosophy, career destiny, obstacles, and introspection.</p>
              </div>
              <div>
                <strong className="text-stone-900 font-bold">Apollo / Sun (Sūrya)</strong>
                <span className="text-xs text-stone-500 block font-semibold">Base of Ring Finger</span>
                <p className="text-stone-600 text-xs mt-1">Creativity, fame, success, artistic sense, vitality, and public status.</p>
              </div>
              <div>
                <strong className="text-stone-900 font-bold">Mercury (Budha)</strong>
                <span className="text-xs text-stone-500 block font-semibold">Base of Little Finger</span>
                <p className="text-stone-600 text-xs mt-1">Communication, business acumen, science, wit, intelligence, and relationships.</p>
              </div>
              <div>
                <strong className="text-stone-900 font-bold">Venus (Śukra)</strong>
                <span className="text-xs text-stone-500 block font-semibold">Base of Thumb</span>
                <p className="text-stone-600 text-xs mt-1">Love, beauty, passion, physical vitality, music, luxury, and general energy.</p>
              </div>
              <div>
                <strong className="text-stone-900 font-bold">Moon (Candra)</strong>
                <span className="text-xs text-stone-500 block font-semibold">Lower Mount opposite Thumb</span>
                <p className="text-stone-600 text-xs mt-1">Imagination, subconscious, travel, emotional nature, intuition, and dreams.</p>
              </div>
              <div>
                <strong className="text-stone-900 font-bold">Mars (Maṅgala)</strong>
                <span className="text-xs text-stone-500 block font-semibold">Inner Mars (courage), Outer Mars (resilience), Plain of Mars (temper)</span>
                <p className="text-stone-600 text-xs mt-1">Aggression, physical strength, mental endurance, and conflict handling.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lines' && (
          <div className="space-y-4">
            <h3 className="text-accent-gold font-bold uppercase tracking-wider text-xs border-b border-stone-200 pb-1">Major & Minor Lines</h3>

            <div className="space-y-3">
              <div>
                <strong className="text-stone-900 font-bold">Heart Line (Āyuṣya Rekhā)</strong>
                <p className="text-stone-600 text-xs mt-1">Starts under pinky or ring finger, curves toward index finger. Represents emotions, romance, heart health, and capacity to love.</p>
              </div>
              <div>
                <strong className="text-stone-900 font-bold">Head Line (Matṛ Rekhā)</strong>
                <p className="text-stone-600 text-xs mt-1">Runs horizontally across center. Indicates intelligence, mental focus, critical thinking style, and concentration ability.</p>
              </div>
              <div>
                <strong className="text-stone-900 font-bold">Life Line (Pītṛ Rekhā)</strong>
                <p className="text-stone-600 text-xs mt-1">Curves around Mount of Venus. Represents physical vitality, strength, life path disruptions, and overall wellness (not lifespan length).</p>
              </div>
              <div>
                <strong className="text-stone-900 font-bold">Fate Line (Bhāgya Rekhā)</strong>
                <p className="text-stone-600 text-xs mt-1">Vertical line from base towards middle finger. Signifies destiny, career success, external influences, and major adjustments in life direction.</p>
              </div>
              <div>
                <strong className="text-stone-900 font-bold">Sun/Apollo Line</strong>
                <p className="text-stone-600 text-xs mt-1">Vertical line parallel to Fate line under ring finger. Confirms talent, sudden fortune, artistic achievements, and public recognition.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'signs' && (
          <div className="space-y-4">
            <h3 className="text-accent-gold font-bold uppercase tracking-wider text-xs border-b border-stone-200 pb-1">Special Signs &amp; Sacred Geometry (Lectures 13–27)</h3>

            <div className="space-y-3.5">
              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
                  Cross (Krośa / Catuṣkoṇa)
                </strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  <strong>Jupiter Mount:</strong> Exceptionally auspicious — happy marriage, noble education, blessed spousal connection.<br />
                  <strong>Anywhere else:</strong> Inauspicious — sudden obstacle, accident, surgery, or health affliction.
                </p>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Star (Nakṣatra / Tārā)
                </strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  <strong>Jupiter:</strong> High political or administrative power, sudden rise.<br />
                  <strong>Sun:</strong> Extraordinary celebrity fame or artistic genius.<br />
                  <strong>Mercury:</strong> Oratorical and research agility.<br />
                  <strong>Lower Mars:</strong> Hot temper, teenage injuries or accident-prone.<br />
                  <strong>Moon:</strong> Danger near water bodies, psychological melancholy.<br />
                  <strong>Saturn:</strong> Fatalistic karmic burden or historic endurance test.
                </p>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Square (Samacatuṣkoṇa / Rakṣā Kavaca)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  <strong>Universal Rule:</strong> Divine protection shield (talisman). Protects whichever mount or line it appears on. On Jupiter: "Teacher\'s Square" — pedagogical skill and immunity to defamation. On Life line: miraculous recovery from hospitalization.
                </p>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Trident (Triśūla)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  <strong>Sun Line end:</strong> Tri-fold renown — status (Sun), commerce (Mercury), perseverance (Saturn).<br />
                  <strong>Jupiter Mount:</strong> Supreme dharmic leadership, wisdom, and royal respect.
                </p>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Diamond Chain (Hīra Śṛṅkhalā)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Appears at the terminus of Fate or Sun line. Classical "wish-fulfilment" symbol — doubles the line\'s vitality and ensures realization of core life desires.
                </p>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Canopy / Circle (Chatra / Cakravarti)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  A circular halo capping the end of a major line. Bestows lifetime umbrella of divine protection against public disgrace and humiliation.
                </p>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Fish Sign (Matsya Rekhā)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Spiritual mastery, philanthropic wealth, and divine grace. At Life line terminus: peaceful spiritual transition and mokṣa inclination.
                </p>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Triangle (Trikoṇa &amp; Dhana kī Koṭhī)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  <strong>Dhana kī Koṭhī (Money Room):</strong> Closed triangle formed between Fate, Head, and Mercury lines. Capacity to retain and accumulate savings.<br />
                  <strong>Moon Mount:</strong> Esoteric intuition, occult depth.<br />
                  <strong>Mars Mount:</strong> Military or surgical strategic precision.
                </p>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Island (Dvīpa) &amp; Chain (Śṛṅkhalā)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Weakness, illness, depletion, or mental agony during the corresponding age period on that line.
                </p>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Supportive Line vs. Parasite Line</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  <strong>Supportive (Mars Line):</strong> Runs parallel on inner side of Life line — acts as an energetic guardian angel (Devatā Rakṣā).<br />
                  <strong>Parasite Line:</strong> Feeds off and drains the parent line\'s vitality.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lectures' && (
          <div className="space-y-4">
            <h3 className="text-accent-gold font-bold uppercase tracking-wider text-xs border-b border-stone-200 pb-1">Lecture Notes</h3>
            {notes.length === 0 ? (
              <div className="text-center py-4 text-xs text-stone-400">Loading lectures...</div>
            ) : (
              <div className="space-y-4">
                <select
                  value={selectedNoteId}
                  onChange={(e) => setSelectedNoteId(e.target.value)}
                  className="w-full p-2 text-xs border border-stone-200 rounded-lg bg-stone-50 text-stone-800 focus:outline-none focus:border-accent-gold font-semibold"
                >
                  {notes.map((n, i) => (
                    <option key={n.id} value={n.id}>
                      {(i + 1) + " - " + n.title.replace(/Hasta Sāmudrika Śāstra (Palmistry) –\s*/, '')}
                    </option>
                  ))}
                </select>

                {notes.find(n => n.id === selectedNoteId) && (
                  <div className="mt-4 border-t border-stone-100 pt-3 prose prose-sm max-w-none text-xs">
                    <MarkdownRenderer
                      content={notes.find(n => n.id === selectedNoteId)!.content}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-stone-200 pt-4 text-[10px] text-stone-400 text-center italic">
        Hasta Sāmudrika Śāstra Study Material
      </div>
    </div>
  );
}
