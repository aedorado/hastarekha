'use client';

import React, { useState } from 'react';
import {
  Printer,
  Copy,
  CheckCircle2,
  X,
  Sparkles,
  Award,
  Activity,
  FileText,
  Calendar,
  Shield,
  Layers,
} from 'lucide-react';
import {
  HandProfile,
  VedicData,
  MountSignData,
  LineAnalysisData,
} from '@/lib/supabase';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: HandProfile;
  vedicData: VedicData;
  detectedYogas: Array<{ name: string; icon: string; desc: string }>;
  generateReportMarkdown: (profile: HandProfile, vedic: VedicData) => string;
}

export default function PrintReportModal({
  isOpen,
  onClose,
  profile,
  vedicData,
  detectedYogas,
  generateReportMarkdown,
}: PrintReportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    document.body.classList.add('printing-report');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-report');
    }, 1000);
  };

  const handleCopyMarkdown = () => {
    const text = generateReportMarkdown(profile, vedicData);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const hasNotes = Boolean(vedicData.notes && vedicData.notes.trim());

  // Aggregate Age Events
  const allEvents: Array<{ line: string; age: number; event: string }> = [];
  (['line_life', 'line_fate', 'line_head', 'line_heart', 'line_sun'] as const).forEach((k) => {
    const ld = vedicData[k] as LineAnalysisData | null;
    if (ld && ld.age_events) {
      ld.age_events.forEach((ev) => {
        allEvents.push({ line: k.replace('line_', '').toUpperCase(), age: ev.age, event: ev.event });
      });
    }
  });
  allEvents.sort((a, b) => a.age - b.age);

  // Mounts list
  const mounts = [
    { name: 'Jupiter (Guru)', key: 'mount_jupiter', mount: vedicData.mount_jupiter },
    { name: 'Saturn (Śani)', key: 'mount_saturn', mount: vedicData.mount_saturn },
    { name: 'Sun (Sūrya)', key: 'mount_sun', mount: vedicData.mount_sun },
    { name: 'Mercury (Budha)', key: 'mount_mercury', mount: vedicData.mount_mercury },
    { name: 'Upper Mars (Defensive)', key: 'mount_mars_upper', mount: vedicData.mount_mars_upper },
    { name: 'Lower Mars (Aggressive)', key: 'mount_mars_lower', mount: vedicData.mount_mars_lower },
    { name: 'Moon (Chandra)', key: 'mount_moon', mount: vedicData.mount_moon },
    { name: 'Venus (Śukra)', key: 'mount_venus', mount: vedicData.mount_venus },
  ].filter((m) => m.mount && (m.mount.height || (m.mount.signs && m.mount.signs.length > 0) || m.mount.notes));

  // Lines list
  const lines = [
    { name: 'Life Line (Āyu Rekhā)', line: vedicData.line_life },
    { name: 'Head Line (Mastiṣka Rekhā)', line: vedicData.line_head },
    { name: 'Heart Line (Hṛdaya Rekhā)', line: vedicData.line_heart },
    { name: 'Fate Line (Bhāgya Rekhā)', line: vedicData.line_fate },
    { name: 'Sun Line (Sūrya Rekhā)', line: vedicData.line_sun },
  ].filter((l) => l.line && (l.line.quality || l.line.origin || l.line.terminus || (l.line.signs && l.line.signs.length > 0)));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 no-print">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-stone-200">
        {/* Modal Action Header (Excluded from Print) */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between gap-4 border-b border-stone-800 no-print">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-gold" />
            <h3 className="text-sm font-bold tracking-wide">Official Consultation Reading Dossier</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="btn-gold px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-stone-100/60">
          {/* THE PRINTABLE DOSSIER (Targeted by #printable-consultation-report) */}
          <div
            id="printable-consultation-report"
            className="bg-white mx-auto max-w-3xl p-8 sm:p-12 rounded-xl border border-stone-200/80 shadow-md text-stone-900 font-sans print:shadow-none print:border-none print:p-0 print:m-0 space-y-6"
          >
            {/* Elegant Vedic Header */}
            <div className="border-b-2 border-stone-800 pb-5 text-center space-y-1.5">
              <div className="text-[10px] tracking-[0.25em] text-amber-700 font-bold uppercase font-serif">
                Śrī Gaṇeśāya Namaḥ • Vedic Sāmudrika Śāstra
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-wide text-stone-900 uppercase">
                Hasta Sāmudrika Reading Report
              </h1>
              <p className="text-xs text-stone-600 font-serif italic max-w-md mx-auto">
                Comprehensive Palmistry Analysis &amp; Remedial Observations
              </p>
            </div>

            {/* Subject Profile Particulars Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Subject Name</span>
                <span className="font-bold text-stone-900 text-sm">{profile.name || 'Anonymous Subject'}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Age / Gender</span>
                <span className="font-semibold text-stone-800">
                  {profile.age ? `${profile.age} yrs` : 'Not recorded'} • {profile.gender || 'Unspecified'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Dominant Hand</span>
                <span className="font-semibold text-stone-800">{profile.dominant_hand || 'Right'} Hand</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Consultation Date</span>
                <span className="font-semibold text-stone-800">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Attached Hand Photos (if available) */}
            {(profile.images.right_palm || profile.images.left_palm) && (
              <div className="print-avoid-break space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 border-b border-stone-200 pb-1">
                  Documented Hand Photographs
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {profile.images.right_palm && (
                    <div className="border border-stone-200 rounded-lg p-2 bg-stone-50 text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={profile.images.right_palm}
                        alt="Right Palm"
                        className="max-h-56 mx-auto object-contain rounded"
                      />
                      <span className="text-[10px] text-stone-500 font-medium mt-1 block">
                        Right Palm (Front View)
                      </span>
                    </div>
                  )}
                  {profile.images.left_palm && (
                    <div className="border border-stone-200 rounded-lg p-2 bg-stone-50 text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={profile.images.left_palm}
                        alt="Left Palm"
                        className="max-h-56 mx-auto object-contain rounded"
                      />
                      <span className="text-[10px] text-stone-500 font-medium mt-1 block">
                        Left Palm (Front View)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Auspicious Formations & Vedic Yogas */}
            {detectedYogas.length > 0 && (
              <div className="print-avoid-break space-y-2 bg-amber-500/5 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900">
                  <Award className="w-4 h-4 text-amber-600" />
                  Auspicious Formations &amp; Classical Yogas Detected ({detectedYogas.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {detectedYogas.map((y, idx) => (
                    <div key={idx} className="bg-white p-2 rounded-lg border border-amber-200/60 shadow-2xs">
                      <div className="font-bold text-stone-900 flex items-center gap-1">
                        <span>{y.icon}</span>
                        <span>{y.name}</span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">{y.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 1. Prakṛti, Tattva & Measurements */}
            <div className="print-avoid-break space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 border-b border-stone-200 pb-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-600" />
                1. Core Hand Prakṛti &amp; Dimensional Balance
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-stone-50 rounded-lg border border-stone-150">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Elemental Tattva</span>
                  <span className="font-bold text-stone-800">{vedicData.hand_tattva || 'Not configured'}</span>
                </div>
                <div className="p-2 bg-stone-50 rounded-lg border border-stone-150">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Palm Shape &amp; Type</span>
                  <span className="font-bold text-stone-800">
                    {vedicData.palm_shape || 'Standard'} • {vedicData.hand_type || 'Classic'}
                  </span>
                </div>
                <div className="p-2 bg-stone-50 rounded-lg border border-stone-150">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Finger / Palm Ratio</span>
                  <span className="font-mono font-bold text-stone-800">
                    {vedicData.palm_length && vedicData.finger_length
                      ? (Number(vedicData.finger_length) / Number(vedicData.palm_length)).toFixed(2)
                      : 'N/A'}
                  </span>
                </div>
                <div className="p-2 bg-stone-50 rounded-lg border border-stone-150">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Thumb Will &amp; Logic</span>
                  <span className="font-semibold text-stone-800">
                    {vedicData.thumb_willpower || 'Average'} Will • {vedicData.thumb_second_phalange || 'Normal'} Logic
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Planetary Mounts (Sapta Graha) */}
            {mounts.length > 0 && (
              <div className="print-avoid-break space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 border-b border-stone-200 pb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  2. Planetary Mounts (Sapta Graha Parvata)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {mounts.map((m) => {
                    const data = m.mount as MountSignData;
                    return (
                      <div key={m.key} className="p-2 bg-stone-50 rounded-lg border border-stone-200">
                        <span className="font-bold text-stone-900 block text-xs">{m.name}</span>
                        <div className="text-[11px] text-stone-600 space-y-0.5 mt-1">
                          {data.height && <div>Height: <strong>{data.height}</strong></div>}
                          {data.signs && data.signs.length > 0 && (
                            <div className="text-amber-800 font-medium">Signs: {data.signs.join(', ')}</div>
                          )}
                          {data.notes && <div className="text-[10px] text-stone-500 italic mt-1">{data.notes}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Primary Rekhās (Lines) */}
            {lines.length > 0 && (
              <div className="print-avoid-break space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 border-b border-stone-200 pb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  3. Primary &amp; Secondary Rekhās (Palm Lines)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {lines.map((l, idx) => {
                    const d = l.line as LineAnalysisData;
                    return (
                      <div key={idx} className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                        <span className="font-bold text-stone-900 block text-xs">{l.name}</span>
                        <div className="text-[11px] text-stone-600 grid grid-cols-2 gap-x-2">
                          {d.quality && <div>Quality: <strong>{d.quality}</strong></div>}
                          {d.origin && <div>Origin: <strong>{d.origin}</strong></div>}
                          {d.terminus && <div>Terminus: <strong>{d.terminus}</strong></div>}
                          {d.signs && d.signs.length > 0 && (
                            <div className="col-span-2 text-amber-800 font-medium">Signs: {d.signs.join(', ')}</div>
                          )}
                        </div>
                        {d.notes && <p className="text-[10px] text-stone-500 italic pt-0.5">{d.notes}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Nakh (Nail Diagnostics) */}
            {(vedicData.nail_shape || vedicData.nail_color || vedicData.nail_thickness || vedicData.nail_surface) && (
              <div className="print-avoid-break space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 border-b border-stone-200 pb-1">
                  4. Nakh (Nail) Biological Diagnostics
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {vedicData.nail_shape && (
                    <div className="p-2 bg-stone-50 rounded border border-stone-150">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">Shape</span>
                      <span className="font-medium text-stone-800">{vedicData.nail_shape}</span>
                    </div>
                  )}
                  {vedicData.nail_color && (
                    <div className="p-2 bg-stone-50 rounded border border-stone-150">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">Coloration</span>
                      <span className="font-medium text-stone-800">{vedicData.nail_color}</span>
                    </div>
                  )}
                  {vedicData.nail_thickness && (
                    <div className="p-2 bg-stone-50 rounded border border-stone-150">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">Thickness</span>
                      <span className="font-medium text-stone-800">{vedicData.nail_thickness}</span>
                    </div>
                  )}
                  {vedicData.nail_lunula && (
                    <div className="p-2 bg-stone-50 rounded border border-stone-150">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">Lunula (Moons)</span>
                      <span className="font-medium text-stone-800">{vedicData.nail_lunula}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. Chronological Age Milestones Timeline */}
            {allEvents.length > 0 && (
              <div className="print-avoid-break space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 border-b border-stone-200 pb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  5. Chronological Life Timeline &amp; Age Milestones
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {allEvents.map((ev, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-stone-50 rounded border border-stone-200">
                      <span className="font-mono font-bold text-accent-gold bg-amber-500/10 px-2 py-0.5 rounded text-[11px]">
                        Age {ev.age}
                      </span>
                      <span className="text-stone-700 text-xs">
                        <strong>[{ev.line}]</strong> {ev.event}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Practitioner's Consultation Notes & Remedial Observations */}
            {hasNotes && (
              <div className="print-avoid-break space-y-2 bg-stone-50 border border-stone-200 rounded-xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-stone-700" />
                  6. Practitioner&apos;s Consultation Notes &amp; Remedial Observations
                </h3>
                <p className="text-xs text-stone-800 whitespace-pre-wrap leading-relaxed font-serif">
                  {vedicData.notes}
                </p>
              </div>
            )}

            {/* Verification Footer / Stamp */}
            <div className="print-avoid-break pt-6 border-t-2 border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
              <div className="text-[11px] text-stone-400 font-serif">
                Generated via HastaRekhā Databank System • Classical Vedic Sāmudrika Lineage
              </div>
              <div className="text-center sm:text-right">
                <div className="w-32 border-b border-stone-400 mx-auto sm:ml-auto mb-1" />
                <span className="text-[10px] uppercase font-bold text-stone-600 tracking-wider">
                  Authorized Practitioner Signature
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
