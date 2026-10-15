'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, X } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface ReferencePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReferencePanel({ isOpen, onClose }: ReferencePanelProps) {
  const [activeTab, setActiveTab] = useState<'mounts' | 'lines' | 'signs' | 'timing' | 'lectures'>('mounts');
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
        {(['mounts', 'lines', 'signs', 'timing', 'lectures'] as const).map((tab) => (
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
                <strong className="text-stone-900 font-bold">Sun / Apollo Line (Sūrya Rekhā)</strong>
                <p className="text-stone-600 text-xs mt-1">Vertical line under ring finger. Confirms creative talent, sudden fortune, artistic achievements, and public recognition.</p>
              </div>
              <div>
                <strong className="text-stone-900 font-bold">Mercury Line (Budha Rekhā / Healer Line)</strong>
                <p className="text-stone-600 text-xs mt-1">Runs upward toward Mercury Mount. Absence is favorable for vitality; starting above Heart Line denotes natural healing/commercial gifts (Note 27).</p>
              </div>
              <div className="p-2 bg-pink-50/60 rounded-lg border border-pink-200/60">
                <strong className="text-pink-950 font-bold flex items-center gap-1.5 text-xs">
                  💍 Marriage Line (Vivāha Rekhā / Śīla-guṇa Rekhā) — Lecture 28
                </strong>
                <p className="text-stone-700 text-xs mt-1 leading-relaxed">
                  Located on Mercury Mount, enters inward from percussion edge. Calibrated on <strong>0–56 year scale</strong> (Heart Line = 0, base joint of little finger = 56).<br />
                  • <strong>Quality:</strong> Balanced = healthy; Faint = emotionally detached; Dark/Heavy = orthodox/burdened (check Life Line for parasite line).<br />
                  • <strong>Upward Hook:</strong> Lifelong aversion / no marriage.<br />
                  • <strong>Down toward Heart:</strong> Emotional burden / sorrow (worst if cutting Heart Line).<br />
                  • <strong>Heart Line Link:</strong> Terminating under Saturn = arranged / practical; reaching Jupiter = love / devotional.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'signs' && (
          <div className="space-y-4">
            <h3 className="text-accent-gold font-bold uppercase tracking-wider text-xs border-b border-stone-200 pb-1">Special Signs &amp; Sacred Geometry (Lectures 13–27)</h3>

            <div className="space-y-3.5">
              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
                  Cross (Krośa / Catuṣkoṇa)
                </strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  <strong>Jupiter Mount:</strong> Exceptionally auspicious — happy marriage, noble education, blessed spousal connection.<br />
                  <strong>Anywhere else:</strong> Inauspicious — sudden obstacle, accident, surgery, or health affliction.
                </p>
              </div>

              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Star (Nakṣatra / Tārā)
                </strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Not specifically taught on the Jupiter, Sun, or Mercury mounts in these lectures (the dedicated Jupiter Mount Signs table lists only Ring of Solomon, Line of Sympathy, Cross, Square, and Triangle).<br />
                  <strong>Lower Mars:</strong> Hot temper, teenage injuries or accident-prone.<br />
                  <strong>Moon:</strong> Danger near water bodies, psychological melancholy.<br />
                  <strong>Saturn:</strong> Mixed — accident or sudden event (read with Fate line).
                </p>
              </div>

              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Square (Samacatuṣkoṇa / Rakṣā Kavaca)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  <strong>Universal Rule:</strong> Protection shield. Protects whichever mount or line it appears on. On Jupiter: "Teacher\'s Square" — teaching ability and protection from defamation. On Life line: miraculous recovery from hospitalization.
                </p>
              </div>

              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Trident (Triśūla)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Taught as a line-ending sign (end of Sun Line or Fate Line) — strong drive for and success in one's work/fame, increasing the line's overall strength. Not taught as a Jupiter Mount sign in these lectures.
                </p>
              </div>

              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Diamond Chain (Hīra Śṛṅkhalā)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Appears at the terminus of Fate or Sun line. Classical "wish-fulfilment" symbol — doubles the line\'s vitality and ensures realization of core life desires.
                </p>
              </div>

              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Canopy (Note 24 §1.2)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  A circle at the end of a line — a protection sign, like the square. The transcript's worked example is the Life Line: "however many ups and downs occur, the whole life is protected."
                </p>
              </div>

              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Fish Sign (Matsya) — Note 20 §2.4</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Power, name/fame, spiritual growth, and researcher-type insight — the teacher is explicit that the fish's first quality is that it does <strong>not</strong> give money.
                </p>
              </div>

              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Triangle (Trikoṇa &amp; Dhana kī Koṭhī)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  <strong>Dhana kī Koṭhī (Money Room):</strong> Closed triangle formed between Fate, Head, and Mercury lines. Capacity to retain and accumulate savings.<br />
                  <strong>Moon Mount:</strong> Esoteric intuition, occult depth.<br />
                  <strong>Mars Mount:</strong> Military or surgical strategic precision.
                </p>
              </div>

              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Island (Dvīpa) &amp; Chain (Śṛṅkhalā)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Weakness, illness, depletion, or mental agony during the corresponding age period on that line.
                </p>
              </div>

              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Supportive Line (Mars Line) — Note 19 §8, Note 21 §2</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Runs parallel to the Life Line without touching it. Meaning: someone (a person/relationship) provides real support through a difficult period, for as long as the line runs alongside. (No Sanskrit name was used for this in class — "Devatā Rakṣā" was an invented label and has been removed.)
                </p>
              </div>

              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Dot / Spot (Note 19 §3.1)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  "Spot" or "dot" — either word is used. <strong>Colour matters:</strong> white is not a permanent mark (can be digestion or incomplete sleep — disregard it); black, blue, or red <em>is</em> considered. A coloured dot is a <strong>negative sign</strong>, generally indicating ill health — which age and which mount it sits on decides the specific issue. A fully filled-in dot can also be a mole or deep mark (treated the same, negative).
                </p>
              </div>

              <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-200/60">
                <strong className="text-stone-900 font-bold text-xs">Circle (Note 19 §3.1 — "Dot vs Circle")</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  The teacher explicitly separates this from Dot: a circle is <strong>empty inside</strong> (not filled), and unlike a dot it is a <strong>positive sign</strong> — "leave the circle out of the dot rule." A circle on the <strong>Sun Mount</strong> specifically is called very good, and rare.
                </p>
              </div>

              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Net / Jālī (Note 20 §2.3)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  A lattice of crossing lines — to count, the vertical and horizontal lines must look similarly clear/visible, with at least three of each. Found <strong>mostly on the Venus Mount</strong> ("in everyone's Venus"), also seen on Mercury. A jālī is <strong>always bad</strong> — a cause of misfortune (durbhāgya). On Venus specifically (which governs married/family life): trouble in marriage, family life, childbirth, and a great deal of anxiety. More cuts/crosses/nets on Venus = more trouble.
                </p>
              </div>

              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Conch / Śaṅkha (Note 21 §1.1)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Very rare — "if 1% get it, they get it," and even when present it's often hard to recognise. Drawn as a conch with a circle on top (other forms are possible but weren't fully described in class). Indicates a <strong>spiritual journey</strong> (seen in hands at a very high spiritual level) and <strong>sudden money gain</strong>. Can appear anywhere on the palm, but mostly in the <strong>Ketu Parvata</strong> area — the same zone the fish sign generally appears in.
                </p>
              </div>

              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Flag / Dhvaja (Note 21 §1.2)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Shaped like a "T," or a line with a flag-like shape attached. <strong>Do not confuse with a Square:</strong> a flag is closed on three sides and open on one; a square is closed on all sides. Can form on a line or on its own. Meaning: famous name, fame, increases willpower. Located mostly on the <strong>Sun Mount</strong> or the <strong>Saturn Mount</strong>.
                </p>
              </div>

              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Tree / Vṛkṣa (Note 21 §1.3)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Appears at the <strong>very end of a line</strong> (whichever line), branching like a tree — any number of branches on either side. Meaning: growth, prosperity, name and fame; the teacher noted that a longer formation increases the strength of the sign, though the exact meaning was left unclear in class.
                </p>
              </div>

              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Temple / Mandira (Note 21 §1.4)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Can form in many shapes (several were drawn in class). <strong>No meaning was stated for this sign</strong> — the teacher said her own hand isn't quite a temple either, though it sometimes resembles one. Left here for identification only, not interpretation.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timing' && (
          <div className="space-y-4">
            <h3 className="text-accent-gold font-bold uppercase tracking-wider text-xs border-b border-stone-200 pb-1">Aging & Life-Timing Methods (Lectures 20, 21, 22, 23, 27)</h3>

            <div className="space-y-3">
              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">30-Midpoint Method (current class method)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Life Line midpoint = age 30. Upper half halves again to mark 15; lower half spans 30→75 (halving to ~52-53). Fate Line uses the same scale starting at the wrist (age 0). Heart Line (Method A): count from the little-finger side in a repeating 18-year section + 6-year gap pattern.
                </p>
              </div>
              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Cheiro / Saptāṁśa Method</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Treats full life span as 98 years, divided into 14 equal 7-year parts along the Life Line.
                </p>
              </div>
              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Ṣaḍaṁśa Method</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Treats full life span as 72 years, divided into 12 equal 6-year parts along the Life Line.
                </p>
              </div>
              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Three-Line Average Method</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Life, Head, and Heart lines are each independently treated as spanning 100 years; a given life-event's age is the average of the percentage-position reading across all three lines.
                </p>
              </div>
              <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-200/70">
                <strong className="text-stone-900 font-bold text-xs">Life × Fate Line Junction Timing (Note 21 §4)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Wherever the Fate Line and Life Line join, draw the connection between the two points — that stretch is the duration being read. The Life Line's age at that point and the Fate Line's age at that same point are normally <em>different</em> numbers, because the two lines have different origin points/scales — e.g. the teacher's own example reads ~35–40 on the Life Line against ~25 (or earlier, 15–20) on the Fate Line at the same junction, not matching ages. Up to the point the lines separate = family support; from that point on = self/independent. This reading depends on what question is being asked — it is one technique among several, not a universal rule.
                </p>
              </div>
              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Mercury / Health Line (Svasthya Rekhā, Note 27 §9)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Absent: the teacher states "it is good that it is not [there]" — presence (not absence) is linked to health/liver issues ("also called the liver line"). Starting below the Heart Line: more health problems in general. Starting above the Heart Line: the "healer line" — business indications in later ages, found in doctors/healers/counsellors (Mercury governs speech). Reaching the Moon Mount: "Line of Intuition" — strong gut instinct, prophetic dreams. A single clean vertical line on the Mercury Mount: sudden money gain.
                </p>
              </div>
              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70">
                <strong className="text-stone-900 font-bold text-xs">Diamond Chain &amp; Canopy — where they're actually taught (Note 24)</strong>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Diamond Chain is "mostly seen at the end of the fate line or the sun line" — Note 24 does not apply it to the Head/Brain Line. Canopy's one worked example in the transcript is the Life Line: "however many ups and downs occur, the whole life is protected." If either is observed at the end of the Head Line, treat the meaning as unconfirmed/not stated rather than asserting intellectual-achievement or reputation-protection claims.
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
