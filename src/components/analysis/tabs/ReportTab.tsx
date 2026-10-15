'use client';

import React from 'react';
import { HandProfile, VedicData, LineAnalysisData, MountSignData } from '@/types/palmistry';
import { DetectedYoga } from '@/lib/yogaDetector';
import { getVedicInterpretations } from '@/lib/vedicInterpretations';
import { Sparkles, CheckCircle2, Copy, Printer, Award, Activity, Clock, FileText } from 'lucide-react';

interface ReportTabProps {
  profile: HandProfile;
  vedicData: VedicData;
  detectedYogas: DetectedYoga[];
  generateReportMarkdown: (profile: HandProfile, vedic: VedicData) => string;
  copiedReport: boolean;
  setCopiedReport: (copied: boolean) => void;
  onOpenPrintModal: () => void;
}

export default function ReportTab({
  profile,
  vedicData,
  detectedYogas,
  generateReportMarkdown,
  copiedReport,
  setCopiedReport,
  onOpenPrintModal,
}: ReportTabProps) {
            // Gather chronological events across all lines
          const chronologicalEvents: Array<{ line: string; age: number; event: string }> = [];
          (['line_life', 'line_fate', 'line_head', 'line_heart', 'line_sun'] as const).forEach((key) => {
            const lData = vedicData[key] as LineAnalysisData | null;
            if (lData && lData.age_events) {
              lData.age_events.forEach((ev) => {
                chronologicalEvents.push({
                  line: key.replace('line_', '').toUpperCase(),
                  age: ev.age,
                  event: ev.event,
                });
              });
            }
          });
          chronologicalEvents.sort((a, b) => a.age - b.age);

          const handleCopyReport = () => {
            const text = generateReportMarkdown(profile, vedicData);
            if (navigator.clipboard) {
              navigator.clipboard.writeText(text);
              setCopiedReport(true);
              setTimeout(() => setCopiedReport(false), 2500);
            }
          };

          const handlePrint = () => {
            window.print();
          };

          return (
            <div className="space-y-6">
              {/* Report Header Card */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-accent-gold/30 rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-accent-gold uppercase tracking-widest flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Hasta Sāmudrika Śāstra Synthesis
                    </span>
                    <h3 className="text-lg font-bold text-stone-900">
                      {profile.name ? `${profile.name}'s Reading Report` : 'Comprehensive Consultation Synthesis'}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Synthesized analysis covering Hand Type, Nails, 7 Mounts, Rekhās, Signs &amp; Timeline.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyReport}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold shadow hover:bg-stone-800 transition-all cursor-pointer"
                    >
                      {copiedReport ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white" />}
                      <span>{copiedReport ? 'Copied to Clipboard!' : 'Copy Clean Report'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={onOpenPrintModal}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent-gold text-white text-xs font-bold shadow-md hover:bg-amber-600 transition-all cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-white" />
                      <span>Official Report / Print PDF</span>
                    </button>
                  </div>
                </div>

                {/* Key Summary Badges */}
                <div className="flex flex-wrap gap-2 pt-4 mt-3 border-t border-amber-500/20 text-xs">
                  {profile.age && (
                    <span className="bg-white/80 border border-stone-200 px-2.5 py-1 rounded-lg text-[11px] font-medium text-stone-700">
                      🎂 <strong>Age:</strong> {profile.age} yrs
                    </span>
                  )}
                  <span className="bg-white/80 border border-stone-200 px-2.5 py-1 rounded-lg text-[11px] font-medium text-stone-700">
                    ✋ <strong>Dominant:</strong> {profile.dominant_hand}
                  </span>
                  {vedicData.hand_tattva && (
                    <span className="bg-white/80 border border-stone-200 px-2.5 py-1 rounded-lg text-[11px] font-medium text-stone-700">
                      🔥 <strong>Tattva:</strong> {vedicData.hand_tattva.split(' ')[0]}
                    </span>
                  )}
                  {vedicData.hand_type && (
                    <span className="bg-white/80 border border-stone-200 px-2.5 py-1 rounded-lg text-[11px] font-medium text-stone-700">
                      📐 <strong>Type:</strong> {vedicData.hand_type.split(' ')[0]}
                    </span>
                  )}
                  {vedicData.palm_color && (
                    <span className="bg-white/80 border border-stone-200 px-2.5 py-1 rounded-lg text-[11px] font-medium text-stone-700">
                      🎨 <strong>Color:</strong> {vedicData.palm_color.split(' ')[0]}
                    </span>
                  )}
                  {vedicData.texture !== undefined && vedicData.texture !== null && (
                    <span className="bg-white/80 border border-stone-200 px-2.5 py-1 rounded-lg text-[11px] font-medium text-stone-700">
                      🌱 <strong>Soil:</strong> {vedicData.texture < 45 ? 'Stiff / Struggle' : vedicData.texture > 60 ? 'Soft / Fertile' : 'Medium'}
                    </span>
                  )}
                </div>
              </div>

              {/* Classical Vedic Yogas Detected */}
              {detectedYogas.length > 0 && (
                <div className="bg-amber-500/5 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    Classical Vedic Yogas &amp; Auspicious Formations Detected ({detectedYogas.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {detectedYogas.map((y, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-amber-200/50 shadow-sm flex items-start gap-2">
                        <span className="text-xl">{y.icon}</span>
                        <div>
                          <span className="font-bold text-xs text-stone-900 block">{y.name}</span>
                          <p className="text-[11px] text-stone-600 leading-snug mt-0.5">{y.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 1: Core Prakṛti & Thumb Willpower */}
              <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-sm">
                <h4 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-500" />
                  1. Core Prakṛti, Tattva &amp; Thumb Willpower Matrix
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Elemental Constitution</span>
                    <p className="font-semibold text-stone-800">{vedicData.hand_tattva || 'Not configured'}</p>
                    <p className="text-[11px] text-stone-500">{vedicData.hand_type || 'Classic type unset'}</p>
                    <p className="text-[11px] text-stone-500">Palm color: {vedicData.palm_color || 'Unset'}</p>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Thumb Will &amp; Logic</span>
                    <p className="font-semibold text-stone-800">{vedicData.thumb_type || 'Standard thumb'}</p>
                    <p className="text-[11px] text-stone-600">Will: {vedicData.thumb_willpower || 'Average'} ({vedicData.thumb_first_phalange_length || 'Normal'} length)</p>
                    <p className="text-[11px] text-stone-600">Logic (2nd Phalanx): {vedicData.thumb_second_phalange || 'Normal'}</p>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Special Physical Markers</span>
                    <p className="text-[11px] text-stone-700 font-medium">1st Phalanx Surface: {vedicData.thumb_first_phalange_condition || 'Smooth'}</p>
                    <p className="text-[11px] text-stone-700 font-medium">Clubbed Thumb: {vedicData.has_clubbed_thumb ? '⚠️ Present' : 'Normal'}</p>
                    <p className="text-[11px] text-stone-700 font-medium">Spacing: {vedicData.finger_gaps || 'Normal'}</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Nails & Health Diagnostics */}
              <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3 shadow-sm">
                <h4 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-violet-500" />
                  2. Nakh (Nail) Biological &amp; Health Diagnostics (Lectures 11–12)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-violet-50/40 rounded-xl">
                    <span className="text-[10px] text-violet-700 font-bold uppercase block">Nail Shape &amp; Size</span>
                    <p className="font-semibold text-stone-800 mt-1">{vedicData.nail_shape_detail || vedicData.nail_shape || 'Normal'}</p>
                    <p className="text-[10px] text-stone-500">{vedicData.nail_length || 'Medium length'} • {vedicData.nail_width || 'Normal width'}</p>
                  </div>
                  <div className="p-3 bg-violet-50/40 rounded-xl">
                    <span className="text-[10px] text-violet-700 font-bold uppercase block">Nail Color</span>
                    <p className="font-semibold text-stone-800 mt-1">{vedicData.nail_color || 'Pink/Healthy'}</p>
                  </div>
                  <div className="p-3 bg-violet-50/40 rounded-xl">
                    <span className="text-[10px] text-violet-700 font-bold uppercase block">Surface &amp; Ridges</span>
                    <p className="font-semibold text-stone-800 mt-1">{vedicData.nail_surface || 'Smooth'}</p>
                  </div>
                  <div className="p-3 bg-violet-50/40 rounded-xl">
                    <span className="text-[10px] text-violet-700 font-bold uppercase block">Lunulae (Moons)</span>
                    <p className="font-semibold text-stone-800 mt-1">{vedicData.nail_lunula || 'Visible'}</p>
                  </div>
                </div>
                {vedicData.nail_health_flag && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                    <span>⚠️</span>
                    <div>
                      <strong className="block text-[11px]">Health Advisory Flag:</strong>
                      <span>{vedicData.nail_health_flag}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Four Planetary Fingers & Phalanges */}
              <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-sm">
                <h4 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  3. Four Planetary Pillars — Finger &amp; Phalange Breakdown (Lectures 08–10)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Jupiter */}
                  <div className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-indigo-900">♃ Jupiter (Guru) Finger</span>
                      <span className="text-[10px] text-stone-500">{vedicData.jupiter_length || 'Normal'} length • {vedicData.jupiter_tilt || 'Straight'}</span>
                    </div>
                    <p className="text-[11px] text-stone-600">Phalange 1 (Spirituality): {vedicData.jupiter_phalange_1 || 'Normal'}</p>
                    <p className="text-[11px] text-stone-600">Phalange 2 (Logic): {vedicData.jupiter_phalange_2 || 'Normal'}</p>
                    <p className="text-[11px] text-stone-600">Phalange 3 (Results): {vedicData.jupiter_phalange_3 || 'Normal'}</p>
                  </div>

                  {/* Saturn */}
                  <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">🪐 Saturn (Śani) Finger</span>
                      <span className="text-[10px] text-stone-500">{vedicData.saturn_length || 'Normal'} length • {vedicData.saturn_tilt || 'Straight'}</span>
                    </div>
                    <p className="text-[11px] text-stone-600">Phalange 1 (Discipline): {vedicData.saturn_phalange_1 || 'Normal'}</p>
                    <p className="text-[11px] text-stone-600">Phalange 2 (Work Logic): {vedicData.saturn_phalange_2 || 'Normal'}</p>
                    <p className="text-[11px] text-stone-600">Phalange 3 (Material Results): {vedicData.saturn_phalange_3 || 'Normal'}</p>
                  </div>

                  {/* Sun */}
                  <div className="p-3 bg-amber-50/40 border border-amber-200/50 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-900">☀️ Sun (Sūrya) Finger</span>
                      <span className="text-[10px] text-stone-500">{vedicData.sun_length || 'Normal'} • {vedicData.sun_tilt || 'Straight'}{vedicData.sun_crooked ? ' • Crooked' : ''}</span>
                    </div>
                    <p className="text-[11px] text-stone-600">Phalange 1 (Artistic Vision): {vedicData.sun_phalange_1 || 'Normal'}</p>
                    <p className="text-[11px] text-stone-600">Phalange 2 (Ego &amp; Logic): {vedicData.sun_phalange_2 || 'Normal'}</p>
                    <p className="text-[11px] text-stone-600">Phalange 3 (Fame &amp; Luxury): {vedicData.sun_phalange_3 || 'Normal'}</p>
                  </div>

                  {/* Mercury */}
                  <div className="p-3 bg-teal-50/40 border border-teal-200/50 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-teal-900">☿ Mercury (Budh) Finger</span>
                      <span className="text-[10px] text-stone-500">{vedicData.mercury_length || 'Normal'} • {vedicData.mercury_tilt || 'Straight'}{vedicData.mercury_low_set ? ' • Low base' : ''}</span>
                    </div>
                    <p className="text-[11px] text-stone-600">Phalange 1 (Speech/Eloquence): {vedicData.mercury_phalange_1 || 'Normal'}</p>
                    <p className="text-[11px] text-stone-600">Phalange 2 (Commercial Logic): {vedicData.mercury_phalange_2 || 'Normal'}</p>
                    <p className="text-[11px] text-stone-600">Phalange 3 (Trade Returns): {vedicData.mercury_phalange_3 || 'Normal'}</p>
                  </div>
                </div>
              </div>

              {/* Section 4: Planetary Mounts & Sacred Signs */}
              <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3 shadow-sm">
                <h4 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-500" />
                  4. Planetary Mounts &amp; Sacred Geometry (Lectures 13–18)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {[
                    { key: 'mount_jupiter', label: 'Jupiter Mount (Guru)' },
                    { key: 'mount_saturn', label: 'Saturn Mount (Śani)' },
                    { key: 'mount_sun', label: 'Sun Mount (Sūrya)' },
                    { key: 'mount_mercury', label: 'Mercury Mount (Budh)' },
                    { key: 'mount_moon', label: 'Moon Mount (Chandra)' },
                    { key: 'mount_venus', label: 'Venus Mount (Śukra)' },
                    { key: 'mount_mars_lower', label: 'Lower Mars / Nimna (Inner Courage & Vitality)' },
                    { key: 'mount_mars_upper', label: 'Upper Mars / Ucca (Outer Courage & Retaliation)' },
                    { key: 'mount_ketu', label: 'Ketū Parvata (Base-Palm / Moksha)' },
                  ].map(({ key, label }) => {
                    const mData = vedicData[key as keyof VedicData] as MountSignData | null;
                    if (!mData || (!mData.height && (!mData.signs || mData.signs.length === 0) && !mData.notes)) return null;
                    return (
                      <div key={key} className="p-3 bg-stone-50 rounded-xl space-y-1 border border-stone-100">
                        <span className="font-bold text-stone-800 block text-xs">{label}</span>
                        <div className="text-[11px] text-stone-600 space-y-0.5">
                          {mData.height && <p>• Elevation: <span className="font-medium text-stone-700">{mData.height}</span></p>}
                          {mData.apex && <p>• Apex: <span className="font-medium text-stone-700">{mData.apex}</span></p>}
                          {mData.signs && mData.signs.length > 0 && (
                            <p>• Signs: <span className="font-semibold text-accent-gold">{mData.signs.join(', ')}</span></p>
                          )}
                          {mData.notes && <p className="italic text-stone-500 text-[10px]">Note: {mData.notes}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 5: Primary Lines (Rekhā) Deep-Dive */}
              <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-sm">
                <h4 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  5. Primary Rekhā Deep-Dive (Lectures 19–27)
                </h4>
                <div className="space-y-3 text-xs">
                  {vedicData.simian_type && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                      <span className="font-bold text-xs text-amber-900 block">⚡ Simian Formation: {vedicData.simian_type}</span>
                      {vedicData.simian_notes && <p className="text-[11px] text-stone-700 italic">{vedicData.simian_notes}</p>}
                    </div>
                  )}

                  {[
                    { key: 'line_life', name: 'Life Line (Āyur Rekhā)' },
                    { key: 'line_head', name: 'Head Line (Mastiṣka Rekhā)' },
                    { key: 'line_heart', name: 'Heart Line (Hṛdaya Rekhā)' },
                    { key: 'line_fate', name: 'Fate Line (Bhāgya Rekhā)' },
                    { key: 'line_sun', name: 'Sun Line (Sūrya Rekhā)' },
                  ].map(({ key, name }) => {
                    const lData = vedicData[key as keyof VedicData] as LineAnalysisData | null;
                    if (!lData || (!lData.quality && !lData.origin && !lData.terminus && (!lData.features || lData.features.length === 0) && (!lData.signs || lData.signs.length === 0) && !lData.notes)) return null;
                    return (
                      <div key={key} className="p-3 bg-stone-50 rounded-xl space-y-1.5 border border-stone-100">
                        <span className="font-bold text-xs text-stone-800">{name}</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-stone-600">
                          {lData.quality && <p>• Quality: <span className="font-medium text-stone-800">{lData.quality}</span></p>}
                          {lData.origin && <p>• Origin: <span className="font-medium text-stone-800">{lData.origin}</span></p>}
                          {lData.terminus && <p>• Terminus: <span className="font-medium text-stone-800">{lData.terminus}</span></p>}
                          {lData.features && lData.features.length > 0 && <p>• Features: <span className="font-semibold text-emerald-700">{lData.features.join(', ')}</span></p>}
                          {lData.signs && lData.signs.length > 0 && <p>• Markings: <span className="font-semibold text-accent-gold">{lData.signs.join(', ')}</span></p>}
                        </div>
                        {lData.notes && <p className="italic text-stone-500 text-[10px] pt-1">Notes: {lData.notes}</p>}
                      </div>
                    );
                  })}

                  {/* Mercury / Health line summary */}
                  {vedicData.line_mercury_present !== null && vedicData.line_mercury_present !== undefined && (
                    <div className="p-3 bg-stone-50 rounded-xl space-y-1 border border-stone-100">
                      <span className="font-bold text-xs text-stone-800">Mercury / Health Line (Budha Rekhā — Lecture 27)</span>
                      <p className="text-[11px] text-stone-700">
                        Status: <strong>{vedicData.line_mercury_present ? 'Present' : 'Absent ("it is good that it is not" — Note 27 §9)'}</strong>
                      </p>
                      {vedicData.line_mercury_starts_below_heart && <p className="text-[11px] text-amber-700">• Starts below Heart Line (more health problems; also called the liver line)</p>}
                      {vedicData.line_mercury_starts_above_heart && <p className="text-[11px] text-teal-700">• Starts above Heart Line (the "healer line" — doctors, healers, counsellors; business indications in later ages)</p>}
                      {vedicData.line_mercury_joins_moon && <p className="text-[11px] text-purple-700">• Line of Intuition: Reaches Moon Mount</p>}
                      {vedicData.line_mercury_single_vertical && <p className="text-[11px] text-emerald-700">• Single vertical line: sudden money gain</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 6: Chronological Life Timeline */}
              {chronologicalEvents.length > 0 && (
                <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3 shadow-sm">
                  <h4 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    6. Chronological Life Timeline &amp; Age Milestones
                  </h4>
                  <div className="divide-y divide-stone-100">
                    {chronologicalEvents.map((ev, i) => (
                      <div key={i} className="py-2.5 flex items-start gap-3 text-xs">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] shrink-0 border border-blue-200">
                          Age {ev.age}
                        </span>
                        <div className="flex-1">
                          <span className="font-bold text-stone-500 text-[10px] mr-2">[{ev.line} LINE]</span>
                          <span className="text-stone-800 font-medium text-[11px]">{ev.event}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 7: Left Hand vs Right Hand Karmic Synthesis */}
              {vedicData.lh_vs_rh_notes && (
                <div className="bg-purple-50/50 border border-purple-200/50 rounded-2xl p-5 space-y-2 shadow-sm">
                  <h4 className="font-bold text-sm text-purple-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                    7. Karmic Path: Destiny vs. Present Deeds (Pūrvārjita vs. Gocara)
                  </h4>
                  <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-wrap">{vedicData.lh_vs_rh_notes}</p>
                </div>
              )}

              {/* Section 8: General Consultation Notes */}
              {vedicData.notes && vedicData.notes.trim() && (
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-2 shadow-sm">
                  <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-stone-600" />
                    8. Practitioner&apos;s Consultation Notes &amp; Remedial Observations
                  </h4>
                  <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-wrap">{vedicData.notes}</p>
                </div>
              )}
            </div>
          );
}
