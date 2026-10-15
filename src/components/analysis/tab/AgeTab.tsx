'use client';

import React from 'react';
import { VedicData, HandProfile, LineAnalysisData } from '@/types/palmistry';
import { Clock, FileText } from 'lucide-react';

interface AgeTabProps {
  vedicData: VedicData;
  updateVedicField: (key: keyof VedicData, value: any) => void;
  profile: HandProfile;
}

export default function AgeTab({ vedicData, updateVedicField, profile }: AgeTabProps) {
  return (
          <div className="space-y-5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 font-medium leading-relaxed">
              🕒 <strong>Age Calculation — 4 Methods</strong><br />
              Four distinct methods. The <strong>30-midpoint</strong> method is currently used in class.
            </div>

            {/* Select age method */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Select Aging Method
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {([
                  {
                    key: '30-midpoint',
                    label: '30-Midpoint Method (Current class method / Arvind Ji Drawing)',
                    desc: 'Midpoint of Life Line = age 30. Upper half: 0→30 (halved again for 15). Lower half: 30→75 (halved for 52.5, 41.25, 47, 63.75). Fate Line: same scale from wrist (age 0). Heart Line: Method A — 18+6+18+6…',
                    color: 'amber',
                  },
                  {
                    key: 'cheiro-98',
                    label: 'Cheiro / Saptāṁśa Method (98 years, 14 parts)',
                    desc: 'Total life span = 98 years divided into 14 equal parts (each part = 7 years). Mark points at each 7-year interval along the Life Line.',
                    color: 'blue',
                  },
                  {
                    key: 'shadamsha-72',
                    label: 'Ṣaḍaṁśa Method (72 years, 12 parts)',
                    desc: 'Total life span = 72 years divided into 12 equal parts (each = 6 years). Mark points at each 6-year interval.',
                    color: 'purple',
                  },
                  {
                    key: 'three-line-avg',
                    label: 'Three-Line Average Method',
                    desc: 'Each of Life Line, Head Line, and Heart Line represents 100 years independently. Average the three readings for any given age point.',
                    color: 'teal',
                  },
                  {
                    key: '18-6-cadence',
                    label: '18 + 6 Cadence Method (Heart & Head Lines)',
                    desc: 'Heart and Head lines timed in blocks of 18 active years separated by 6-year transition gaps (18, 24, 42, 48, 66, 72). Lecture 27 §6.',
                    color: 'rose',
                  },
                ] as const).map(({ key, label, desc, color }) => (
                  <label key={key} className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all ${vedicData.age_method === key ? `border-${color}-400 bg-${color}-50` : 'border-stone-200 bg-stone-50 hover:border-stone-300'}`}>
                    <input type="radio" className="mt-0.5" name="age_method"
                      checked={vedicData.age_method === key}
                      onChange={() => updateVedicField('age_method', key)} />
                    <div>
                      <div className="font-bold text-xs text-stone-900">{label}</div>
                      <div className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Lifespan Scale (deśa-kāla) */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-xs text-stone-800">Calibrated Lifespan Scale (deśa-kāla)</div>
                  <div className="text-[11px] text-stone-500">Base scale for India is ~70-75; Western/higher longevity is 80-100.</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="50"
                    max="120"
                    className="form-input text-xs w-20 text-center font-bold"
                    value={vedicData.max_age ?? 75}
                    onChange={(e) => updateVedicField('max_age', parseInt(e.target.value, 10) || 75)}
                  />
                  <span className="text-xs text-stone-600 font-semibold">yrs</span>
                </div>
              </div>
            </div>

            {/* Life × Fate Junction Timing (Lectures 21-23) */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                Life × Fate Line Junction Timing
              </h4>
              <p className="text-[10px] text-stone-500 leading-normal">
                Where the Fate Line crosses the Life Line reveals family-support vs. independence windows (Notes 21 §4, 22 §7, 23 §7). Log the age-on-Life-Line and age-on-Fate-Line at each crossing point, with the reading.
              </p>
              {(vedicData.life_fate_junctions || []).map((junction, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input type="number" min="0" max="120"
                    className="form-input text-xs w-20 shrink-0"
                    placeholder="Life age"
                    title="Age on Life Line at junction"
                    value={junction.life_age || ''}
                    onChange={(e) => {
                      const junctions = [...vedicData.life_fate_junctions];
                      junctions[idx] = { ...junctions[idx], life_age: parseInt(e.target.value) || 0 };
                      updateVedicField('life_fate_junctions', junctions);
                    }} />
                  <input type="number" min="0" max="120"
                    className="form-input text-xs w-20 shrink-0"
                    placeholder="Fate age"
                    title="Age on Fate Line at junction"
                    value={junction.fate_age || ''}
                    onChange={(e) => {
                      const junctions = [...vedicData.life_fate_junctions];
                      junctions[idx] = { ...junctions[idx], fate_age: parseInt(e.target.value) || 0 };
                      updateVedicField('life_fate_junctions', junctions);
                    }} />
                  <input type="text"
                    className="form-input text-xs flex-1"
                    placeholder="Reading (e.g. end of family financial support, independent career begins)"
                    value={junction.reading || ''}
                    onChange={(e) => {
                      const junctions = [...vedicData.life_fate_junctions];
                      junctions[idx] = { ...junctions[idx], reading: e.target.value };
                      updateVedicField('life_fate_junctions', junctions);
                    }} />
                  <button type="button"
                    className="text-rose-500 hover:text-rose-700 text-xs p-1 shrink-0"
                    onClick={() => {
                      const junctions = vedicData.life_fate_junctions.filter((_, i) => i !== idx);
                      updateVedicField('life_fate_junctions', junctions);
                    }}>✕</button>
                </div>
              ))}
              <button type="button"
                className="text-[10px] btn-gold px-2 py-0.5 shadow-sm"
                onClick={() => {
                  const junctions = [...(vedicData.life_fate_junctions || []), { life_age: 0, fate_age: 0, reading: '' }];
                  updateVedicField('life_fate_junctions', junctions);
                }}>
                + Add Junction
              </button>
            </div>

            {/* Method-specific reference calculator */}
            {vedicData.age_method === '30-midpoint' && (
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
                <h4 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">📏 30-Midpoint Reference Guide</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
                    <span className="font-bold text-amber-900 block">Life Line Age Markers</span>
                    {[['Top (Jupiter area)', '0 (Birth)'], ['¼ point from top', '15'], ['Midpoint', '30'], ['¾ point', '52-53'], ['End', '~75']].map(([pos, age]) => (
                      <div key={pos} className="flex justify-between text-stone-700 font-semibold">
                        <span>{pos}</span><span className="text-accent-gold">{age}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5">
                    <span className="font-bold text-blue-900 block">Fate Line Age (from Wrist)</span>
                    <div className="flex justify-between text-stone-700 font-semibold">
                      <span>Wrist (maṇibandha)</span><span className="text-blue-600">0</span>
                    </div>
                    <div className="flex justify-between text-stone-700 font-semibold">
                      <span>Midpoint</span><span className="text-blue-600">30</span>
                    </div>
                    <div className="flex justify-between text-stone-700 font-semibold">
                      <span>Top</span><span className="text-blue-600">~75</span>
                    </div>
                    <p className="text-[9px] text-stone-500 italic pt-0.5">Note 27 only gives wrist=0, midpoint=30, top=~75 for this method — it does not give fixed ages for where the line crosses the Head/Heart line.</p>
                  </div>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
                  <strong>Heart Line (Method A):</strong> Start counting from little finger side. First section = 18 years. Gap = 6 years. Next section = 18 years. Continue: 18+6+18+6… until end of line.
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-stone-700 font-medium leading-relaxed">
                  <strong>Alternate theory (Note 23 §7, hedged by the teacher as "one theory," not part of this method):</strong> Fate Line passing between the Head Line and Heart Line ≈ ages 40–50 zone; below that zone = under 40; above it = over 50.
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 font-medium">
                  <strong>Important (Note 27):</strong> Fate Line age is ALWAYS counted from the wrist, even if the line starts higher up the palm. A line starting at the Head Line still has wrist = age 0 for the scale.
                </div>
              </div>
            )}

            {vedicData.age_method === 'cheiro-98' && (
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
                <h4 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">📏 Cheiro / Saptāṁśa 7-Year Markers (98 years ÷ 14)</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {Array.from({ length: 14 }, (_, i) => ({ part: i + 1, age: (i + 1) * 7 })).map(({ part, age }) => (
                    <div key={part} className="flex justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg font-semibold">
                      <span className="text-stone-600">Part {part}</span>
                      <span className="text-blue-700">Age {age}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {vedicData.age_method === 'shadamsha-72' && (
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
                <h4 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">📏 Ṣaḍaṁśa 6-Year Markers (72 years ÷ 12)</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {Array.from({ length: 12 }, (_, i) => ({ part: i + 1, age: (i + 1) * 6 })).map(({ part, age }) => (
                    <div key={part} className="flex justify-between p-2 bg-purple-50 border border-purple-200 rounded-lg font-semibold">
                      <span className="text-stone-600">Part {part}</span>
                      <span className="text-purple-700">Age {age}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {vedicData.age_method === 'three-line-avg' && (
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
                <h4 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">📏 Three-Line Average Method</h4>
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 font-medium leading-relaxed">
                  Each line is treated as representing 100 years. For a given point on a line:<br />
                  1. Measure position as % of line length<br />
                  2. Age = percentage × 100 for each line<br />
                  3. Average the three results = final age estimate
                </div>
              </div>
            )}

            {vedicData.age_method === '18-6-cadence' && (
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
                <h4 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">📏 18 + 6 Cadence Method (Heart & Head Lines)</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 leading-relaxed">
                    <strong>Lecture 27 §6:</strong> Start counting from little finger side (Heart Line) or thumb side (Head Line).
                    Alternates blocks of 18 active years with 6-year transition gaps:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { span: '0 → 18 yrs', type: 'Active block (18y)' },
                      { span: '18 → 24 yrs', type: 'Transition gap (6y)' },
                      { span: '24 → 42 yrs', type: 'Active block (18y)' },
                      { span: '42 → 48 yrs', type: 'Transition gap (6y)' },
                      { span: '48 → 66 yrs', type: 'Active block (18y)' },
                      { span: '66 → 72 yrs', type: 'Transition gap (6y)' },
                    ].map(({ span, type }, i) => (
                      <div key={i} className={`flex justify-between p-2 rounded-lg border font-semibold ${type.includes('gap') ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                        <span>{span}</span>
                        <span className="text-[11px] font-normal">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Age Event Log */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <FileText className="w-4 h-4 text-stone-500" />
                Age-Event Log (per line)
              </h4>
              <p className="text-[10px] text-stone-500 leading-normal">Record events visible on each line at specific ages. Use this to cross-reference client's life events with what the lines show.</p>
              {(['line_life', 'line_fate', 'line_head', 'line_heart', 'line_sun'] as const).map((lineKey) => {
                const lineData = (vedicData[lineKey] as LineAnalysisData | null) || { quality: '', origin: '', terminus: '', signs: [], features: [], age_events: [], notes: '' };
                const lineLabels: Record<string, string> = {
                  line_life: '❤️ Life Line', line_fate: '⚡ Fate Line', line_head: '🧠 Head Line', line_heart: '💖 Heart Line', line_sun: '☀️ Sun Line',
                };
                const events = lineData.age_events || [];
                return (
                  <div key={lineKey} className="border border-stone-200/80 rounded-xl p-3 space-y-2.5 bg-stone-50/40">
                    <div className="flex items-center justify-between pb-1 border-b border-stone-200/60">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-800">{lineLabels[lineKey]}</span>
                        <span className="text-[10px] bg-stone-200/80 text-stone-600 px-1.5 py-0.2 rounded font-semibold">
                          {events.length} {events.length === 1 ? 'event' : 'events'}
                        </span>
                      </div>
                      <button type="button"
                        className="text-[11px] btn-gold px-2.5 py-1 shadow-xs font-semibold flex items-center gap-1 cursor-pointer"
                        onClick={() => {
                          const nextEvents = [...events, { age: 0, event: '' }];
                          updateVedicField(lineKey, { ...lineData, age_events: nextEvents });
                        }}>
                        + Add Event
                      </button>
                    </div>

                    {events.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500 uppercase tracking-wider px-1">
                          <span className="shrink-0 text-center" style={{ width: '5.5rem' }}>Age (Yrs)</span>
                          <span className="flex-1">Palmistry Sign / Life Event Notes</span>
                          <span className="w-7 shrink-0 text-center"></span>
                        </div>
                        {events.map((evt, idx) => (
                          <div key={idx} className="flex gap-2 items-center bg-white p-1.5 rounded-lg border border-stone-200/80 shadow-2xs">
                            <input
                              type="number"
                              min="0"
                              max="120"
                              step="0.5"
                              style={{ width: '5.5rem', minWidth: '5.5rem', maxWidth: '5.5rem' }}
                              className="form-input text-xs shrink-0 text-center font-bold text-stone-900 !py-1 !px-2 bg-stone-50/80"
                              placeholder="Age"
                              value={evt.age !== undefined && evt.age !== null ? evt.age : ''}
                              onChange={(e) => {
                                const nextEvents = [...events];
                                nextEvents[idx] = { ...nextEvents[idx], age: parseFloat(e.target.value) || 0 };
                                updateVedicField(lineKey, { ...lineData, age_events: nextEvents });
                              }}
                            />
                            <input
                              type="text"
                              className="form-input text-xs flex-1 min-w-0 !py-1 !px-2.5 text-stone-850"
                              placeholder="e.g. Triangle △ Property purchase, Star, Island, Break, Marriage"
                              value={evt.event || ''}
                              onChange={(e) => {
                                const nextEvents = [...events];
                                nextEvents[idx] = { ...nextEvents[idx], event: e.target.value };
                                updateVedicField(lineKey, { ...lineData, age_events: nextEvents });
                              }}
                            />
                            <button
                              type="button"
                              title="Delete milestone"
                              className="w-7 h-7 flex items-center justify-center text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md text-xs shrink-0 cursor-pointer transition-colors"
                              onClick={() => {
                                const nextEvents = events.filter((_, i) => i !== idx);
                                updateVedicField(lineKey, { ...lineData, age_events: nextEvents });
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {events.length === 0 && (
                      <p className="text-[10px] text-stone-400 italic py-1">
                        No events logged for this line yet. Click &quot;+ Add Event&quot; or click directly along the line on the hand canvas in Aging mode.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
  );
}
