'use client';

import React, { useState, useEffect } from 'react';
import { HandProfile, Pin, HandView, HAND_VIEW_LABELS, parseVedicData, serializeVedicData, VedicData, calculateAge } from '@/lib/supabase';
import { Trash2, Check, UploadCloud, Timer, CheckSquare, Info, Sparkles, Smile, HelpCircle, Activity, FileText, Eye } from 'lucide-react';

interface AnalysisFormProps {
  profile: HandProfile;
  onChangeProfile: (profile: HandProfile) => void;
  selectedPin: Pin | null;
  onUpdatePin: (pin: Pin) => void;
  onDeletePin: (pinId: string) => void;
  onSave: () => void;
  isSaving: boolean;
  onUploadImageForView: (view: HandView | 'd1_chart', file: File) => Promise<void>;
  isUploading: boolean;
  hasChanges: boolean;
  onChangeActiveView?: (view: HandView) => void;
}

const HAND_TYPES = [
  'Elementary Hand (Primitive/Labor Hand)',
  'Spatulate Hand (Spoon Hand)',
  'Square Hand (Vertical Hand)',
  'Conical Hand (Conic Hand)',
  'Philosophical Hand (Knotty Hand)',
  'Psychic Hand',
  'Mixed Hand',
];

interface HandTypeDetail {
  title: string;
  identification: string;
  mentality: string;
  struggleOrStrength: string;
  modifiers: string;
}

const HAND_TYPE_DETAILS: Record<string, HandTypeDetail> = {
  'Elementary Hand (Primitive/Labor Hand)': {
    title: 'Elementary Hand (Primitive/Labor Hand)',
    identification: 'Looks thick, heavy, and stiff. Palm appears highly prominent, resembling a square (Mars-driven). Fingers look short and less prominent compared to the massive palm space. Wrist is thick and wide. Nails are typically small.',
    mentality: 'Core focus on short-term survival ("Work, eat, drink, sleep"). Refuses self-investment, lacks ambition, and declines training opportunities. Low emotional sensitivity and creativity appreciation.',
    struggleOrStrength: 'Success requires grueling physical labor. Stiff skin blocks positive yogas from bearing fruit easily without massive struggle.',
    modifiers: 'Skin texture is usually hard, rough, and stiff. Nails are small.',
  },
  'Spatulate Hand (Spoon Hand)': {
    title: 'Spatulate Hand (Spoon Hand)',
    identification: 'Shaped like a spatula or spoon (flares out wider at the top or bottom). Similar to the Elementary hand, but the wrist is noticeably thinner and the nails are not as small.',
    mentality: 'Hardworking and practical, but fiercely independent and highly disciplined with strict boundaries. Formula: "Learn first, then make money from that learning."',
    struggleOrStrength: 'One of the best categories. Combines extreme physical capacity/action with mental sharpness. Highly organized and time-sensitive.',
    modifiers: 'Skin is less rough than Elementary; nails are larger. Willpower is heavily tied to the strength of the Thumb.',
  },
  'Square Hand (Vertical Hand)': {
    title: 'Square Hand (Vertical Hand)',
    identification: 'The entire hand (palm + fingers combined) visually forms a square. Nails often naturally take a square shape as well.',
    mentality: 'Innate, natural business acumen. Can figure out how to make money and run businesses without prior formal training. Excellent long-term planner, highly determined but flexible enough to pivot.',
    struggleOrStrength: 'Extremely good category for prosperity. Possesses excellent social etiquette and grace, and often works/donates for social welfare.',
    modifiers: 'Small nails on a Square hand indicate a researcher/investigative mindset but may bring minor health issues.',
  },
  'Conical Hand (Conic Hand)': {
    title: 'Conical Hand (Conic Hand)',
    identification: 'Long and thin hand. Fingers are long and taper smoothly forward, with a notably long middle finger. Beautiful fingernails.',
    mentality: 'Deeply desires a luxurious, comfortable life. Highly moody with rapidly fluctuating emotions and low patience. Sun/Mercury creativity (ambiguous clever communication, managing networks, hosting beautifully).',
    struggleOrStrength: 'Attains luxury but struggles to "settle" in foreign environments. Dislikes staying in other people\'s houses (prefers neutral spaces like hotels).',
    modifiers: 'Tapering fingers and beautiful nails. Associated with Sun/Mercury planetary lines.',
  },
  'Philosophical Hand (Knotty Hand)': {
    title: 'Philosophical Hand (Knotty Hand)',
    identification: 'Long and tapering hand similar to Conical, but features prominent, visible knots at the finger joints.',
    mentality: 'Deep analytical/philosophical mind. Abhors mindless entertainment. Message deliverers found in character actors, stand-up comedians, and motivational speakers. Particular about comfort and secretive.',
    struggleOrStrength: 'Very intellectual and precise. Limits their space, preferring quiet corners to remain calm.',
    modifiers: 'Knots do not need to be on all fingers—traits apply specifically to the planet of the knotted finger (e.g., Jupiter or Saturn). Thin-skinned (visible nerves) adds extreme sensitivity. Crooked fingers amplify planetary energy intensely.',
  },
  'Psychic Hand': {
    title: 'Psychic Hand',
    identification: 'Extremely long, delicate, and "super soft." Looks fragile, like the hand of a royal princess or a newborn baby.',
    mentality: 'Highly sensitive, physically and emotionally fragile. Catch colds/coughs easily and have weak digestion. Break easily under pressure if not praised.',
    struggleOrStrength: 'With finger knots: can ascend to the absolute highest levels of spiritual healing. Without finger knots: prone to comfort zone traps, extreme laziness, and chaos under minor routine changes.',
    modifiers: 'Should have very light, fine lines. If a super soft hand has thick, dark lines, it indicates a tragic paradox of a delicate person forced into a harsh, struggling life.',
  },
  'Mixed Hand': {
    title: 'Mixed Hand',
    identification: 'A blend that does not fit one category (e.g. Square palm with Conical fingers).',
    mentality: 'Ultimate multitaskers and full of diverse ideas. Seamlessly blend practicality, emotion, and creativity.',
    struggleOrStrength: 'Versatile and adaptable, but career path cannot be determined by shape alone.',
    modifiers: 'Must identify the major type first, then blend traits. Rely heavily on palm lines and fingerprints for specific career predictions.',
  },
};

export default function AnalysisForm({
  profile,
  onChangeProfile,
  selectedPin,
  onUpdatePin,
  onDeletePin,
  onSave,
  isSaving,
  onUploadImageForView,
  isUploading,
  hasChanges,
  onChangeActiveView,
}: AnalysisFormProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'samudrika' | 'mounts' | 'lines' | 'pins' | 'tags'>('profile');
  const [newTag, setNewTag] = useState('');

  // 10-Minute Resting State Timer
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState(5); // default 5 mins

  // Photography checklist
  const [checklist, setChecklist] = useState({
    bothHands: false,
    allAngles: false,
    thumbSeparate: false,
    nailsSeparate: false,
    relaxedPosture: false,
    restingWaited: false,
    noNailPolish: false,
    noMorningSwelling: false,
  });

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev !== null ? prev - 1 : 0));
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
      setTimerSeconds(null);
      setChecklist(prev => ({ ...prev, restingWaited: true }));
      alert("⏱️ Resting period complete! Hands have returned to their natural resting state. Skin color and temperature can now be examined accurately without false indicators.");
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const toggleTimer = () => {
    if (timerActive) {
      setTimerActive(false);
    } else {
      if (timerSeconds === null || timerSeconds === 0) {
        setTimerSeconds(timerDuration * 60);
      }
      setTimerActive(true);
    }
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimerSeconds(null);
  };

  const formatTimer = () => {
    if (timerSeconds === null) return `${timerDuration}:00`;
    const m = Math.floor(timerSeconds / 60);
    const s = timerSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Parse current VedicData
  const vedicData = parseVedicData(profile.general_notes);

  const updateVedicField = (key: keyof VedicData, value: any) => {
    const updatedVedic = {
      ...vedicData,
      [key]: value,
    };

    // Auto-classify Hand Type if palm_shape, palm_length, palm_width, or finger_length changes!
    if (key === 'palm_shape' || key === 'palm_length' || key === 'palm_width' || key === 'finger_length') {
      const palmLen = key === 'palm_length' ? value : (vedicData.palm_length || 10.0);
      const palmWidth = key === 'palm_width' ? value : (vedicData.palm_width || 0.0);
      const fingerLen = key === 'finger_length' ? value : (vedicData.finger_length || 0.0);

      // Auto-update palm shape based on width to length ratio
      let palmShape = key === 'palm_shape' ? value : vedicData.palm_shape;
      if (palmLen && palmWidth && key !== 'palm_shape') {
        const shapeRatio = palmWidth / palmLen;
        palmShape = shapeRatio >= 0.9 ? 'Square' : 'Rectangular';
        updatedVedic.palm_shape = palmShape;
      }

      if (palmLen && fingerLen && palmShape) {
        const ratio = fingerLen / palmLen;
        let computedType = '';
        if (palmShape === 'Rectangular') {
          if (ratio < 0.85) computedType = 'Agni Tattva (Fiery Hand)';
          else if (ratio >= 0.9) computedType = 'Jala Tattva (Watery Hand)';
          else computedType = 'Mixed Hand (Agni-Jala Blend)';
        } else { // Square
          if (ratio < 0.85) computedType = 'Pṛthvī Tattva (Earthy Hand)';
          else if (ratio >= 0.9) computedType = 'Vāyu Tattva (Airy Hand)';
          else computedType = 'Mixed Hand (Air-Earth Blend)';
        }
        updatedVedic.hand_tattva = computedType;
      }
    }

    onChangeProfile({
      ...profile,
      general_notes: serializeVedicData(updatedVedic),
    });
  };

  const updateProfileField = (key: keyof HandProfile, value: any) => {
    onChangeProfile({
      ...profile,
      [key]: value,
    });
  };

  const updateMountField = (mount: string, value: string) => {
    onChangeProfile({
      ...profile,
      mounts_data: {
        ...profile.mounts_data,
        [mount]: value,
      },
    });
  };

  const updateLineField = (line: string, value: string) => {
    onChangeProfile({
      ...profile,
      lines_data: {
        ...profile.lines_data,
        [line]: value,
      },
    });
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    const cleanTag = newTag.trim().toLowerCase();
    if (!profile.tags.includes(cleanTag)) {
      updateProfileField('tags', [...profile.tags, cleanTag]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateProfileField(
      'tags',
      profile.tags.filter((t) => t !== tagToRemove)
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-md">
      {/* Save Action Bar */}
      <div className="px-6 py-5 bg-gradient-to-r from-stone-50/80 to-stone-50/40 border-b border-stone-200/60 flex items-center justify-between gap-4">
        <h3 className="mystic-title text-sm tracking-wider uppercase font-bold">Analysis Details</h3>
        <button
          onClick={onSave}
          disabled={isSaving || !hasChanges || !profile.name}
          className="btn-gold px-5 py-2.5 text-sm flex items-center gap-2 shadow-md disabled:opacity-55 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-stone-50/40 border-b border-stone-200/60 text-sm overflow-x-auto">
        {(['profile', 'samudrika', 'mounts', 'lines', 'pins', 'tags'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-center font-semibold capitalize transition-all border-b-2 whitespace-nowrap px-4 text-sm ${activeTab === tab
                ? 'border-accent-gold text-accent-gold bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
          >
            {tab === 'pins' && selectedPin
              ? '📍 Marker'
              : tab === 'samudrika'
                ? '☸️ Sāmudrika'
                : tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Subject Identifier / Name <span className="text-rose-500">*</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Subject A, Course Assignment 1"
                value={profile.name}
                onChange={(e) => updateProfileField('name', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <div className="flex justify-between items-center">
                  <label className="form-label">Date of Birth</label>
                  {profile.age !== '' && (
                    <span className="text-[10px] bg-amber-500/10 text-accent-gold px-2 py-0.5 rounded-full font-bold">
                      Age: {profile.age} years
                    </span>
                  )}
                </div>
                <input
                  type="date"
                  className="form-input text-stone-850"
                  value={profile.dob || ''}
                  onChange={(e) => {
                    const dobVal = e.target.value;
                    const computedAge = calculateAge(dobVal);
                    onChangeProfile({
                      ...profile,
                      dob: dobVal,
                      age: computedAge,
                    });
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="form-input bg-white border border-stone-200 text-stone-850"
                  value={profile.gender}
                  onChange={(e) => updateProfileField('gender', e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Time of Birth</label>
                <input
                  type="time"
                  className="form-input text-stone-850"
                  value={profile.tob || ''}
                  onChange={(e) => updateProfileField('tob', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Place of Birth</label>
                <input
                  type="text"
                  className="form-input text-stone-850"
                  placeholder="e.g. New Delhi, India"
                  value={profile.pob || ''}
                  onChange={(e) => updateProfileField('pob', e.target.value)}
                />
              </div>
            </div>



            {profile.age !== '' && Number(profile.age) < 12 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2 shadow-sm">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Sāmudrika Rule:</span> Do not read the hand of a child below 12 years. The thought process is still developing, and patterns have not settled.
                </div>
              </div>
            )}



            {/* Hand Pictures Catalog Grid */}
            <div className="sidebar-section">
              <label className="form-label mb-2">Subject Photos</label>
              {isUploading && (
                <div className="text-center py-1 text-xs text-accent-gold font-bold animate-pulse">
                  Uploading image view...
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 mt-1">
                {(['right_palm', 'right_back', 'left_palm', 'left_back'] as const).map((view) => {
                  const url = profile.images[view];
                  return (
                    <div key={view} className="border border-stone-200 rounded-lg p-2 bg-stone-50 text-center flex flex-col justify-between h-28 relative">
                      <span className="text-[10px] font-bold text-stone-500 block truncate mb-1">
                        {HAND_VIEW_LABELS[view]}
                      </span>
                      {url ? (
                        <div className="flex-1 relative flex items-center justify-center overflow-hidden rounded bg-stone-100 border border-stone-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={view} className="max-h-full max-w-full object-contain" />
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove photo for ${HAND_VIEW_LABELS[view]}?`)) {
                                const newImages = { ...profile.images };
                                delete newImages[view];
                                updateProfileField('images', newImages);
                              }
                            }}
                            className="absolute -top-1 -right-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold transition-all shadow"
                            title="Delete photo"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label className="flex-1 border border-dashed border-stone-300 rounded cursor-pointer flex flex-col items-center justify-center hover:bg-stone-100 hover:border-accent-gold/40 transition-colors">
                          <UploadCloud className="w-5 h-5 text-stone-400" />
                          <span className="text-[9px] text-stone-500 font-semibold mt-1">Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) await onUploadImageForView(view, file);
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resting state Timer and Photography Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-stone-200 rounded-xl p-4 bg-stone-50/50 shadow-inner">
              {/* Timer */}
              <div className="space-y-2">
                <label className="form-label flex items-center gap-1.5 text-stone-700 font-bold">
                  <Timer className="w-4 h-4 text-accent-gold" />
                  Resting State Timer
                </label>
                <p className="text-[9px] text-stone-500 leading-normal">
                  Wait 5-10 mins for client hands to settle to resting state. Prevents false redness/temperature readings.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <div className="font-mono text-sm font-bold bg-white border border-stone-200 px-2 py-0.5 rounded shadow-sm text-stone-850">
                    {formatTimer()}
                  </div>
                  <button
                    type="button"
                    onClick={toggleTimer}
                    className={`btn-gold text-[9px] px-2 py-1 shadow-sm font-semibold rounded`}
                  >
                    {timerActive ? 'Pause' : 'Start'}
                  </button>
                  <button
                    type="button"
                    onClick={resetTimer}
                    className="btn-outline text-[9px] px-2 py-1 hover:bg-stone-100 rounded"
                  >
                    Reset
                  </button>
                </div>
                {!timerActive && timerSeconds === null && (
                  <div className="flex gap-2 pt-1 items-center">
                    <span className="text-[9px] text-stone-500 font-semibold">Set:</span>
                    <button type="button" onClick={() => setTimerDuration(5)} className={`text-[9px] px-1.5 py-0.25 rounded ${timerDuration === 5 ? 'bg-accent-gold text-white font-bold' : 'bg-stone-200 text-stone-600'}`}>5m</button>
                    <button type="button" onClick={() => setTimerDuration(10)} className={`text-[9px] px-1.5 py-0.25 rounded ${timerDuration === 10 ? 'bg-accent-gold text-white font-bold' : 'bg-stone-200 text-stone-600'}`}>10m</button>
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <label className="form-label flex items-center gap-1.5 text-stone-700 font-bold">
                  <CheckSquare className="w-4 h-4 text-accent-gold" />
                  Photo Checklist
                </label>
                <div className="space-y-1">
                  {[
                    { key: 'bothHands', label: 'Both hands fully' },
                    { key: 'allAngles', label: 'Front & back profiles' },
                    { key: 'thumbSeparate', label: 'Thumb separately' },
                    { key: 'nailsSeparate', label: 'Nails separately' },
                    { key: 'relaxedPosture', label: 'Relaxed natural gaps' },
                    { key: 'restingWaited', label: 'Wait 5-10m resting' },
                    { key: 'noNailPolish', label: 'No Nail Polish (needs vertical/horizontal lines)' },
                    { key: 'noMorningSwelling', label: 'No Morning Swelling (distorts shape)' }
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-1.5 text-[9px] font-semibold text-stone-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={(checklist as any)[item.key]}
                        onChange={(e) => setChecklist({ ...checklist, [item.key]: e.target.checked })}
                        className="rounded border-stone-300 text-accent-gold focus:ring-accent-gold/30 w-3 h-3"
                      />
                      <span className={(checklist as any)[item.key] ? 'line-through text-stone-400' : ''}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group pt-2">
              <label className="form-label">General Observations</label>
              <textarea
                className="form-input h-28 resize-none text-xs"
                placeholder="Skin texture, color, flexibility, fingernail shapes, palm flexibility..."
                value={vedicData.notes}
                onChange={(e) => {
                  updateVedicField('notes', e.target.value);
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'samudrika' && (
          <div className="space-y-6">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 shadow-sm text-xs leading-normal">
              <span className="font-bold flex items-center gap-1.5 text-accent-gold text-sm mb-1">
                <Sparkles className="w-4 h-4 text-accent-gold" />
                Hasta Sāmudrika Śāstra (Vedic Palmistry)
              </span>
              Analyze the structural elements of the hand: shape, measurements, texture, and finger ratios before examining lines and mounts.
            </div>

            {/* Core Hand Classification */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Activity className="w-4 h-4 text-amber-500" />
                Core Hand Classification
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label text-xs">Dominant Hand (Active)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs text-stone-850"
                    value={profile.dominant_hand}
                    onChange={(e) => updateProfileField('dominant_hand', e.target.value)}
                  >
                    <option value="Right">Right Handed</option>
                    <option value="Left">Left Handed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Classical Hand Type</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs text-stone-850"
                    value={vedicData.hand_type || ''}
                    onChange={(e) => {
                      updateVedicField('hand_type', e.target.value);
                    }}
                  >
                    <option value="">Select Classic Type...</option>
                    {HAND_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Elemental Hand (Tattva)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs text-stone-850"
                    value={vedicData.hand_tattva || ''}
                    onChange={(e) => {
                      updateVedicField('hand_tattva', e.target.value);
                    }}
                  >
                    <option value="">Select Tattva...</option>
                    <option value="Agni Tattva (Fiery Hand)">Agni Tattva (Fiery Hand)</option>
                    <option value="Jala Tattva (Watery Hand)">Jala Tattva (Watery Hand)</option>
                    <option value="Pṛthvī Tattva (Earthy Hand)">Pṛthvī Tattva (Earthy Hand)</option>
                    <option value="Vāyu Tattva (Airy Hand)">Vāyu Tattva (Airy Hand)</option>
                    <option value="Mixed Hand (Agni-Jala Blend)">Mixed Hand (Agni-Jala Blend)</option>
                    <option value="Mixed Hand (Air-Earth Blend)">Mixed Hand (Air-Earth Blend)</option>
                    <option value="Mixed Hand">Mixed Hand</option>
                  </select>
                </div>
              </div>
            </div>

            {vedicData.hand_type && HAND_TYPE_DETAILS[vedicData.hand_type] && (
              <div className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/50 shadow-sm text-xs space-y-2.5 transition-all duration-300">
                <div className="flex items-center gap-2 border-b border-stone-200/40 pb-2">
                  <Sparkles className="w-4 h-4 text-accent-gold" />
                  <span className="font-bold text-stone-900 text-xs tracking-wide">
                    {HAND_TYPE_DETAILS[vedicData.hand_type].title} Details
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 leading-relaxed">
                  <div>
                    <span className="font-bold uppercase tracking-wider block text-[8px] text-stone-400">Core Identification:</span>
                    <p className="text-stone-600 font-medium mt-0.5 text-[11px]">{HAND_TYPE_DETAILS[vedicData.hand_type].identification}</p>
                  </div>
                  <div>
                    <span className="font-bold uppercase tracking-wider block text-[8px] text-stone-400">Core Mentality:</span>
                    <p className="text-stone-600 font-medium mt-0.5 text-[11px]">{HAND_TYPE_DETAILS[vedicData.hand_type].mentality}</p>
                  </div>
                  <div>
                    <span className="font-bold uppercase tracking-wider block text-[8px] text-stone-400">Prosperity & Struggle:</span>
                    <p className="text-stone-600 font-medium mt-0.5 text-[11px]">{HAND_TYPE_DETAILS[vedicData.hand_type].struggleOrStrength}</p>
                  </div>
                  <div>
                    <span className="font-bold uppercase tracking-wider block text-[8px] text-stone-400">Nail/Skin Modifiers:</span>
                    <p className="text-stone-600 font-medium mt-0.5 text-[11px]">{HAND_TYPE_DETAILS[vedicData.hand_type].modifiers}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Hand Tattva Calculator */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Hand Tattva (Element) Calculator
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label text-xs">Palm Shape</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.palm_shape}
                    onChange={(e) => updateVedicField('palm_shape', e.target.value)}
                  >
                    <option value="">Select Shape...</option>
                    <option value="Square">Square</option>
                    <option value="Rectangular">Rectangular</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Elemental Hand Tattva (Computed)</label>
                  <div className="form-input bg-stone-50 text-xs font-bold flex items-center h-9 px-3 border border-stone-200 text-stone-850 truncate">
                    {vedicData.hand_tattva || 'Set shape & lengths...'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="form-group">
                  <label className="form-label text-xs">Palm Length (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input text-xs"
                    placeholder="e.g. 10"
                    value={vedicData.palm_length}
                    onChange={(e) => updateVedicField('palm_length', e.target.value ? parseFloat(e.target.value) : '')}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Palm Width (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input text-xs"
                    placeholder="e.g. 9.5"
                    value={vedicData.palm_width || ''}
                    onChange={(e) => updateVedicField('palm_width', e.target.value ? parseFloat(e.target.value) : '')}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Finger Length (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input text-xs"
                    placeholder="e.g. 8.5"
                    value={vedicData.finger_length}
                    onChange={(e) => updateVedicField('finger_length', e.target.value ? parseFloat(e.target.value) : '')}
                  />
                </div>
              </div>

              {vedicData.measurements && (
                <div className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-250 rounded-lg p-2 font-medium leading-relaxed">
                  📏 Hand Canvas measurements are active: Palm baseline is set to {vedicData.palm_length || 10.0}cm. Finger scales to {vedicData.finger_length || '0.0'}cm (Ratio: {vedicData.palm_length && vedicData.finger_length ? (Number(vedicData.finger_length) / Number(vedicData.palm_length)).toFixed(2) : '0.00'}) and Palm Width scales to {vedicData.palm_width || '0.0'}cm.
                </div>
              )}

              {/* Tattva details display */}
              {vedicData.hand_tattva && (
                <div className="p-3.5 rounded-xl border space-y-2.5 shadow-sm text-xs transition-all duration-300" style={{
                  backgroundColor:
                    vedicData.hand_tattva.includes('Agni') ? '#fef2f2' :
                      vedicData.hand_tattva.includes('Jala') ? '#eff6ff' :
                        vedicData.hand_tattva.includes('Pṛthvī') ? '#fff7ed' :
                          vedicData.hand_tattva.includes('Vāyu') ? '#f0fdfa' : '#fffbeb',
                  borderColor:
                    vedicData.hand_tattva.includes('Agni') ? '#fee2e2' :
                      vedicData.hand_tattva.includes('Jala') ? '#dbeafe' :
                        vedicData.hand_tattva.includes('Pṛthvī') ? '#ffedd5' :
                          vedicData.hand_tattva.includes('Vāyu') ? '#ccfbf1' : '#fef3c7',
                  color:
                    vedicData.hand_tattva.includes('Agni') ? '#991b1b' :
                      vedicData.hand_tattva.includes('Jala') ? '#1e40af' :
                        vedicData.hand_tattva.includes('Pṛthvī') ? '#9a3412' :
                          vedicData.hand_tattva.includes('Vāyu') ? '#115e59' : '#854d0e'
                }}>
                  <div>
                    <span className="font-bold uppercase tracking-wider block text-[10px]">
                      {vedicData.hand_tattva} Profile
                    </span>
                    <p className="mt-1 font-semibold leading-relaxed">
                      {vedicData.hand_tattva.includes('Agni') ? '🔥 Agni Tattva (Fire): rectangular palm + short fingers. Energetic, impulsive, social. Horizontal learner (skims topics), wedding/party coordinator potential, instant decider. Strong Mars/Sun traits.' :
                        vedicData.hand_tattva.includes('Jala') ? '💧 Jala Tattva (Water): rectangular palm + long fingers. Sensitive, imaginative, feminine. Adapts to shape of surroundings. Suppresses anger if thumb is weak. Craves stability/routine.' :
                          vedicData.hand_tattva.includes('Pṛthvī') ? '🪵 Pṛthvī Tattva (Earth): square palm + short fingers. Highly stubborn, stable, generational planner (secures future children). Rigid rituals. Prefers fixed/guaranteed income.' :
                            vedicData.hand_tattva.includes('Vāyu') ? '💨 Vāyu Tattva (Air): square palm + long fingers. Fact-finder, investigator. Micro-manages, notices tiny flaws. Ketu-driven deep learning (learns topics to roots). Job over business.' :
                              '✨ Mixed Hand Tattva: Blended temperament. Synthesize dominant mounts to resolve career and relationship patterns.'}
                    </p>
                  </div>
                  <div className="border-t border-stone-200/20 pt-2 space-y-1">
                    <span className="font-bold uppercase tracking-wider block text-[9px]">Vedic Remedial Guidance (Upāyas):</span>
                    <p className="italic leading-normal font-medium">
                      {vedicData.hand_tattva.includes('Agni') ? '• Must finish one task fully before starting another. Practice self-discipline (waking to 4 AM alarms). Engage in Ketu-like deep research to calm the fire.' :
                        vedicData.hand_tattva.includes('Jala') ? '• Practice saying "no" to guard boundaries. Drastically lower expectations of others to prevent stomach stress. Seek counsel from elder relatives before decisions.' :
                          vedicData.hand_tattva.includes('Pṛthvī') ? '• Intentionally enjoy life, step out of rigid routines. Try doing random selfless tasks outside of standard ancestral rulebooks.' :
                            vedicData.hand_tattva.includes('Vāyu') ? '• Regulate Din Charya (daily routines). Practice deep active listening rather than cross-examination. Step-by-step build trust with close relatives.' :
                              '• Synthesize multiple elements and mounts. Ground with routine and regular meditation.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Active Hand Instinct Decider */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <HelpCircle className="w-4 h-4 text-purple-500" />
                Active Hand Selector
              </h4>
              <p className="text-[10px] text-stone-500 leading-normal">
                Determine the Active (dominant) hand representing current karma and mental changes (rekhā changes every 2-3 months).
              </p>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2 text-stone-700">
                <span className="font-bold block text-[10px] text-accent-gold uppercase tracking-wider">Instinct Test (For Ambidextrous Clients):</span>
                <p className="leading-relaxed font-medium">
                  Throw an object (e.g. ball) at the client unexpectedly. The hand they instinctively raise first to block/catch is their active hand, deeply connected to their neural patterns.
                </p>
              </div>
            </div>

            {/* Soil Texture & Stiffness */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Smile className="w-4 h-4 text-orange-500" />
                Soil Texture & Stiffness
              </h4>
              <p className="text-[10px] text-stone-500 leading-normal">
                The stiffness of the hand acts as the soil (ground). A stiff hand (hard ground) blocks successful yogas from bearing fruit easily, requiring extreme labor. Soft hands represent fertile ease.
              </p>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-700">Hand Stiffness (Soil Ground)</span>
                  <span className="font-mono text-accent-gold font-bold">{vedicData.texture < 40 ? 'Stiff / Stiff soil' : vedicData.texture > 70 ? 'Soft / Fertile soil' : 'Average'}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full accent-accent-gold"
                  value={vedicData.texture}
                  onChange={(e) => updateVedicField('texture', parseInt(e.target.value, 10))}
                />
              </div>

              {/* Dynamic soil calculation */}
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-xs space-y-1.5">
                <span className="font-bold text-amber-800 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-accent-gold" />
                  Soil Signification
                </span>
                <p className="text-[11px] text-stone-700 leading-relaxed font-semibold">
                  {vedicData.texture < 45
                    ? '⚠️ Stiff Hand (Hard Ground): Success combinations (Rajyoga seeds) are blocked. The subject has to struggle and put in double the labor to get results.'
                    : vedicData.texture > 60
                      ? '✨ Fertile Ground: High creative desire and potential ease of progress. Active willpower is needed to override general lazy soft-hand traits.'
                      : '✨ Normal Soil: Average balance of practical action and mental flexibility.'
                  }
                </p>
              </div>
            </div>

            {/* Thumb (Angūṭhā) Analysis Profile */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Thumb (Angūṭhā) Analysis Profile
              </h4>
              <p className="text-[10px] text-stone-500 leading-normal">
                Read the thumb length, natural angle of opening, and parva (phalange) details to gauge willpower, independence, and receptivity to advice.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label text-xs">Thumb Base Willpower</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.thumb_willpower}
                    onChange={(e) => updateVedicField('thumb_willpower', e.target.value)}
                  >
                    <option value="Average">Average Willpower</option>
                    <option value="Strong">Strong / Swollen Base</option>
                    <option value="Weak">Weak / Flat Base</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Thumb Length (Index Base Ref)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.thumb_length || ''}
                    onChange={(e) => updateVedicField('thumb_length', e.target.value)}
                  >
                    <option value="">Select Length...</option>
                    <option value="Short">Short (reaches below index base midpoint)</option>
                    <option value="Average">Average / Mediocre (reaches index base midpoint)</option>
                    <option value="Long">Long (reaches above index base midpoint)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Thumb natural Angle</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.thumb_angle || ''}
                    onChange={(e) => updateVedicField('thumb_angle', e.target.value)}
                  >
                    <option value="">Select Angle...</option>
                    <option value="Below 30°">Below 30° (Completely Dependent)</option>
                    <option value="30°-45°">30°-45° (Mostly Dependent/Private)</option>
                    <option value="45°-70°">45°-70° (Imaginative/Daydreamer)</option>
                    <option value="70°-90°">70°-90° (Independent but Receptive)</option>
                    <option value="Exactly 90°">Exactly 90° (Pillar/Foundation)</option>
                    <option value="Above 90°">Above 90° (Struggle-Built/Logical)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">First Phalange (Parva) Length</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.thumb_first_phalange_length || ''}
                    onChange={(e) => updateVedicField('thumb_first_phalange_length', e.target.value)}
                  >
                    <option value="">Select Phalange Length...</option>
                    <option value="Short">Short (Lower immunity, dependent)</option>
                    <option value="Average">Average / Middle (Self-Made, credit sharing)</option>
                    <option value="Long">Long (Dominant, high ego, confident)</option>
                  </select>
                </div>

                <div className="form-group md:col-span-2">
                  <label className="form-label text-xs">First Phalange Condition</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.thumb_first_phalange_condition || ''}
                    onChange={(e) => updateVedicField('thumb_first_phalange_condition', e.target.value)}
                  >
                    <option value="">Select Surface Condition...</option>
                    <option value="Smooth">Smooth (Listens politely, does what they planned)</option>
                    <option value="Sunken/Flattened">Sunken / Flattened (Seeks & follows advice)</option>
                    <option value="Cut marks/lines">Cut marks / Creases (Seeks & follows advice)</option>
                    <option value="Bulged">Bulged / Puffy tip (Firm/stubborn, short temper)</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-stone-100 pt-3 space-y-2">
                <span className="font-bold text-xs text-stone-700 block">Special Indicators</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                    <input
                      type="checkbox"
                      className="rounded text-accent-gold focus:ring-accent-gold"
                      checked={vedicData.has_clubbed_thumb || false}
                      onChange={(e) => updateVedicField('has_clubbed_thumb', e.target.checked)}
                    />
                    Clubbed Thumb ("Murderer's Thumb" - Bulged tip / Pent-up energy)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                    <input
                      type="checkbox"
                      className="rounded text-accent-gold focus:ring-accent-gold"
                      checked={vedicData.has_six_fingers || false}
                      onChange={(e) => updateVedicField('has_six_fingers', e.target.checked)}
                    />
                    Six Digits (Polydactyly - Excess digit / Struggle-filled life)
                  </label>
                </div>
              </div>

              {/* Dynamic Thumb Interpretation */}
              {(vedicData.thumb_length || vedicData.thumb_angle || vedicData.thumb_first_phalange_length || vedicData.thumb_first_phalange_condition || vedicData.has_clubbed_thumb || vedicData.has_six_fingers) && (
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-xs space-y-2">
                  <span className="font-bold text-amber-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
                    Thumb Sāmudrika Significations
                  </span>
                  
                  <div className="space-y-1.5 text-[11px] text-stone-700 leading-relaxed font-semibold">
                    {/* Willpower & Core Personality Readings based on Angle */}
                    {vedicData.thumb_angle === 'Exactly 90°' && (
                      <p>✨ <strong className="text-amber-900">Foundation-Type Personality:</strong> Practical, stable, and highly dependable. Acts as the pillar (nīv) of the family or workplace—the person without whom things do not run smoothly. Intense self-respect and willpower.</p>
                    )}
                    {vedicData.thumb_angle === 'Above 90°' && (
                      <p>✨ <strong className="text-amber-900">Struggle-built Independence:</strong> Likely had a struggle-filled childhood, but carries immense inner strength and independent thinking to turn circumstances in their favor. Deep logic and questioning mindset. Success often comes post-age 40.</p>
                    )}
                    {vedicData.thumb_angle === '45°-70°' && (
                      <p>⚠️ <strong className="text-amber-900">Imaginative / Daydreamer:</strong> Prone to elaborate daydreaming ("Khyālī Pulāv").
                        {vedicData.hand_tattva && vedicData.hand_tattva.includes('Jala') && ' (Especially pronounced on Watery Hands: maximum fantasy/daydreaming).'}
                        {vedicData.hand_tattva && vedicData.hand_tattva.includes('Agni') && ' (On Fiery Hands, they quickly discard the idea if it isn\'t actionable).'}
                        {vedicData.hand_tattva && (vedicData.hand_tattva.includes('Pṛthvī') || vedicData.hand_tattva.includes('Vāyu')) && ' (On Earthy/Airy hands, they work it out practically/analytically without getting lost in fantasy).'}
                        {" Risk of frustration when dreams and resolutions fail to manifest. Practical action steps or team support is required."}
                      </p>
                    )}
                    {vedicData.thumb_angle === 'Below 30°' && (
                      <p>⚠️ <strong className="text-amber-900">High Dependency:</strong> Completely dependent on others' validation and direction. Cannot make independent decisions easily.</p>
                    )}
                    {vedicData.thumb_angle === '30°-45°' && (
                      <p>⚠️ <strong className="text-amber-900">Advice-reliant:</strong> Will express slight opinions in private but ultimately won't act without others' guidance and validation.</p>
                    )}
                    {vedicData.thumb_angle === '70°-90°' && (
                      <p>✨ <strong className="text-amber-900">Balanced Independence:</strong> Independent thinking is present, but values and incorporates others' input before executing plans.</p>
                    )}

                    {/* First Phalange Length */}
                    {vedicData.thumb_first_phalange_length === 'Long' && (
                      <p>👤 <strong className="text-amber-900">First Parva (Nail Segment):</strong> Noticeably long willpower segment. Represents strong confidence, free independent thinking, but also high dominance and potential ego (taking full personal credit).</p>
                    )}
                    {vedicData.thumb_first_phalange_length === 'Average' && (
                      <p>👤 <strong className="text-amber-900">First Parva (Nail Segment):</strong> Balanced middle-length. Indicates a self-made/self-built personality who progressed through personal effort, open to credit sharing ("I can do that too").</p>
                    )}
                    {vedicData.thumb_first_phalange_length === 'Short' && (
                      <p>👤 <strong className="text-amber-900">First Parva (Nail Segment):</strong> Short segment. Indicates lower immunity power and dependency on others for willpower.</p>
                    )}

                    {/* Receptivity to advice */}
                    {vedicData.thumb_first_phalange_condition && (
                      <p>💡 <strong className="text-amber-900">Advice Receptivity:</strong> 
                        {vedicData.thumb_first_phalange_condition === 'Smooth' && ' Listens politely but ultimately does exactly what they had already decided independently.'}
                        {(vedicData.thumb_first_phalange_condition === 'Sunken/Flattened' || vedicData.thumb_first_phalange_condition === 'Cut marks/lines') && ' The sunken surface or lines/marks make them highly receptive to others\' advice, actively seeking validation.'}
                        {vedicData.thumb_first_phalange_condition === 'Bulged' && ' Bulged/puffy tip increases firmness, stubbornness, and short-tempered practicality.'}
                      </p>
                    )}

                    {/* Special warnings */}
                    {vedicData.has_clubbed_thumb && (
                      <p className="text-red-700 bg-red-500/5 border border-red-500/10 p-2 rounded-lg mt-1 font-semibold">
                        ⚠️ <strong className="font-bold text-red-900">Clubbed Thumb ("Murderer's Thumb"):</strong> Swollen thumb-tip indicates blocked/stagnant energy ("Pent-Up Energy") pooling at the tip instead of circulating. High warning indicator of sudden, explosive anger.
                      </p>
                    )}
                    {vedicData.has_six_fingers && (
                      <p className="text-red-700 bg-red-500/5 border border-red-500/10 p-2 rounded-lg mt-1 font-semibold">
                        ⚠️ <strong className="font-bold text-red-900">Structural Excess (Six Digits):</strong> Traditional Sāmudrika rules state that excess digits represent structural imbalance. Frequently associated with a life of recurring obstacles and intense personal struggle.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Ego & Communication Profile */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Ego & Communication Profile
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label text-xs">Jupiter (Index) vs Apollo (Ring) Finger</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.jupiter_sun_relation}
                    onChange={(e) => updateVedicField('jupiter_sun_relation', e.target.value)}
                  >
                    <option value="">Select Proportion...</option>
                    <option value="Jupiter Longer">Jupiter (Index) is Longer</option>
                    <option value="Sun Longer">Sun / Apollo (Ring) is Longer</option>
                    <option value="Equal">Fingers are Equal Length</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Mercury Pinky Finger Length</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.mercury_length}
                    onChange={(e) => updateVedicField('mercury_length', e.target.value)}
                  >
                    <option value="">Select Pinky Length...</option>
                    <option value="Short">Short (Below top joint of Ring)</option>
                    <option value="Average">Average (Aligns with top joint)</option>
                    <option value="Long">Long (Extends above top joint)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Ego interpretation */}
              {vedicData.jupiter_sun_relation && (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-stone-800 uppercase tracking-wider block text-[9px]">Ego & Speech Signature:</span>
                  <p className="text-stone-700 leading-relaxed font-medium">
                    {vedicData.jupiter_sun_relation === 'Jupiter Longer'
                      ? '🧠 Authoritative Ego: Highly knowledgeable, dominating, and argumentative ("fighter"). Speech style is centered on lecturing, wisdom, and strict rules. Will not bow down easily.'
                      : vedicData.jupiter_sun_relation === 'Sun Longer'
                        ? '☀️ Influential Ego: Ego is driven by responsibility, light, and leadership. Speaks with absolute force and creative energy. Will not bow down.'
                        : '⚖️ Balanced Ego: Harmonious expression. Ego is restrained, adapting to situations logically.'
                    }
                  </p>
                  {vedicData.mercury_length && (
                    <p className="text-stone-700 leading-relaxed font-medium border-t border-stone-200/50 pt-1.5 mt-1.5">
                      {vedicData.mercury_length === 'Long'
                        ? '🐍 Mercury Modifier (Snake Dies, Stick Intact): Excellent diplomacy. Can express stubbornness or deliver harsh truths elegantly without breaking relationships ("snake dies, stick intact").'
                        : '⚠️ Mercury Modifier: Struggles to communicate will/ego effectively. May struggle to say "no" or might create severe relational friction.'
                      }
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Dorsal Hand Analysis (Back Palm Modifiers) */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Activity className="w-4 h-4 text-violet-500" />
                Dorsal Hand Analysis (Back Palm Modifiers)
              </h4>
              <p className="text-[10px] text-stone-500 leading-normal">
                Nails, skin texture, and knuckle knots act as massive modifiers that alter the core readings of the palm.
              </p>

              <div className="grid grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label text-xs">Skin Texture (Dorsal)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.skin_texture || ''}
                    onChange={(e) => updateVedicField('skin_texture', e.target.value)}
                  >
                    <option value="">Select Skin...</option>
                    <option value="Soft/Moisturized">Soft & Moisturized (Fertile/Easy)</option>
                    <option value="Medium">Medium Texture</option>
                    <option value="Hard/Stiff">Hard & Stiff (Struggles/Stiff wrist)</option>
                    <option value="Rough">Rough/Labor-worn (Struggle/Raw)</option>
                    <option value="Thin-skinned (Nerves visible)">Thin-skinned (Visible nerves/Sensitive)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Nail Shape</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.nail_shape || ''}
                    onChange={(e) => updateVedicField('nail_shape', e.target.value)}
                  >
                    <option value="">Select Nail Shape...</option>
                    <option value="Wide/Small">Wide & Small (Elementary traits)</option>
                    <option value="Long/Small">Long & Small</option>
                    <option value="Wide/Big">Wide & Big</option>
                    <option value="Square">Square Nails (Square hand matches)</option>
                    <option value="Beautiful">Beautiful & Long-tapering (Conical/Psychic)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Finger Joints (Knots)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.finger_knots || ''}
                    onChange={(e) => updateVedicField('finger_knots', e.target.value)}
                  >
                    <option value="">Select Joints...</option>
                    <option value="Smooth">Smooth & Tapering</option>
                    <option value="Jupiter & Saturn Knots">Knots on Jupiter & Saturn only</option>
                    <option value="Fully Philosophical (Knotty)">Fully Knotty (Philosophical/Message deliverer)</option>
                    <option value="Crooked Fingers">Crooked Fingers (Amplified planet energy)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Modifiers interpretation based on lecture */}
              {(vedicData.skin_texture || vedicData.nail_shape || vedicData.finger_knots) && (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-1.5 leading-relaxed">
                  <span className="font-bold text-stone-800 uppercase tracking-wider block text-[9px]">Dorsal Modification Profile:</span>
                  
                  {vedicData.skin_texture && (
                    <p className="text-stone-600 font-medium">
                      <strong>Skin:</strong> {
                        vedicData.skin_texture === 'Soft/Moisturized' ? '✨ Soft & supple skin represents fertile ease and higher responsiveness to favorable yogas.' :
                        vedicData.skin_texture === 'Hard/Stiff' ? '⚠️ Hard, stiff skin blocks flexibility and implies high physical struggle. Represents a lack of pampered care.' :
                        vedicData.skin_texture === 'Rough' ? '⚠️ Rough skin indicates a mindset centered on raw struggle and manual routine. Prone to rejecting self-improvement.' :
                        vedicData.skin_texture === 'Thin-skinned (Nerves visible)' ? '🧠 Thin skin with visible nerves indicates extreme mental/emotional sensitivity and vulnerability.' :
                        'Standard skin elasticity and texture.'
                      }
                    </p>
                  )}

                  {vedicData.nail_shape && (
                    <p className="text-stone-600 font-medium border-t border-stone-200/50 pt-1.5">
                      <strong>Nails:</strong> {
                        vedicData.nail_shape === 'Wide/Small' ? '🔍 Small nails indicate low ambition, short-term planning, or focus on manual tasks.' :
                        vedicData.nail_shape === 'Square' ? '💼 Square nails complement natural business acumen and support strong determination.' :
                        vedicData.nail_shape === 'Beautiful' ? '🎨 Beautiful tapering nails align with creative Sun/Mercury energy or high psychic sensitivity.' :
                        'Nails act as modifiers to determine physical details and health patterns.'
                      }
                    </p>
                  )}

                  {vedicData.finger_knots && (
                    <p className="text-stone-600 font-medium border-t border-stone-200/50 pt-1.5">
                      <strong>Finger Joints:</strong> {
                        vedicData.finger_knots === 'Fully Philosophical (Knotty)' ? '📖 Knotty joints add an analytical filter, showing a Message Deliverer who abhors mindless entertainment.' :
                        vedicData.finger_knots === 'Jupiter & Saturn Knots' ? '🪐 Knots localized on Jupiter and Saturn restrict philosophical contemplation specifically to wisdom, ambition, and focus.' :
                        vedicData.finger_knots === 'Crooked Fingers' ? '⚡ Crooked fingers amplify the energy of their respective planets in an intense or distorted way (e.g. Sage Ashtavakra).' :
                        'Smooth joints indicate swift, intuitive thinking without heavy analytical filters.'
                      }
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Manibandha Wrist Lines */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <FileText className="w-4 h-4 text-amber-500" />
                Maṇibandha (Wrist Lines)
              </h4>
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="form-group">
                  <label className="form-label text-xs">Number of Wrist Lines (Rāsettes)</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    className="form-input text-xs"
                    placeholder="1 to 4 lines"
                    value={vedicData.manibandha_lines}
                    onChange={(e) => updateVedicField('manibandha_lines', e.target.value ? parseInt(e.target.value, 10) : '')}
                  />
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 leading-normal font-medium shadow-sm">
                  ⚠️ Observation Rule: Tilt the client\'s hand at a 30-degree angle toward the palm. The wrist lines become visible at this angle. Counts 1 to 4 lines.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mounts' && (
          <div className="space-y-4">
            <p className="text-xs text-stone-500 leading-normal mb-2 italic">
              Analyze the elevation, color, firmness, and any markings on the mounts below the fingers.
            </p>
            {[
              { id: 'jupiter', label: 'Mount of Jupiter (Index Finger)' },
              { id: 'saturn', label: 'Mount of Saturn (Middle Finger)' },
              { id: 'apollo', label: 'Mount of Sun / Apollo (Ring Finger)' },
              { id: 'mercury', label: 'Mount of Mercury (Little Finger)' },
              { id: 'venus', label: 'Mount of Venus (Thumb Base)' },
              { id: 'moon', label: 'Mount of Moon (Luna / Inner Base)' },
              { id: 'mars', label: 'Mounts of Mars & Plain of Mars' },
            ].map((mount) => (
              <div key={mount.id} className="form-group">
                <label className="form-label text-xs">{mount.label}</label>
                <textarea
                  className="form-input h-20 resize-none text-xs"
                  placeholder="Height, signs (crosses, stars, squares), or special features..."
                  value={profile.mounts_data[mount.id] || ''}
                  onChange={(e) => updateMountField(mount.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'lines' && (
          <div className="space-y-4">
            <p className="text-xs text-stone-500 leading-normal mb-2 italic">
              Record characteristics: depth, length, branches, forks, breaks, chains, or islands.
            </p>
            {[
              { id: 'heart', label: 'Heart Line' },
              { id: 'head', label: 'Head Line' },
              { id: 'life', label: 'Life Line' },
              { id: 'fate', label: 'Fate Line' },
              { id: 'sun', label: 'Sun / Apollo Line' },
              { id: 'other', label: 'Minor / Auxiliary Lines' },
            ].map((line) => (
              <div key={line.id} className="form-group">
                <label className="form-label text-xs">{line.label}</label>
                <textarea
                  className="form-input h-20 resize-none text-xs"
                  placeholder="Structure, depth, islands, breaks, trident forks..."
                  value={profile.lines_data[line.id] || ''}
                  onChange={(e) => updateLineField(line.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'pins' && (
          <div className="space-y-4">
            {selectedPin ? (
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded uppercase" style={{ backgroundColor: selectedPin.color }}>
                    Active Pin
                  </span>
                  <button
                    onClick={() => onDeletePin(selectedPin.id)}
                    className="text-rose-600 hover:text-rose-700 transition-colors p-1"
                    title="Delete marker"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Pin Label</label>
                  <input
                    type="text"
                    className="form-input text-xs"
                    value={selectedPin.label}
                    onChange={(e) => onUpdatePin({ ...selectedPin, label: e.target.value })}
                    placeholder="e.g. Star sign, Island"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Annotation / Notes</label>
                  <textarea
                    className="form-input h-28 resize-none text-xs"
                    value={selectedPin.description}
                    onChange={(e) => onUpdatePin({ ...selectedPin, description: e.target.value })}
                    placeholder="Describe what this marking or sign indicates in your course notes..."
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-stone-500 text-xs border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                📍 Click on "Place Pins" mode above the canvas, then click on the hand picture to drop a marker pin here.
              </div>
            )}
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="space-y-4">
            <form onSubmit={handleAddTag} className="flex gap-2">
              <input
                type="text"
                className="form-input text-xs"
                placeholder="Add tags (e.g. mystic-cross, fork, fish-sign)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
              <button type="submit" className="btn-gold px-3 text-xs shadow-sm">
                Add
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-2">
              {profile.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-amber-500/10 text-accent-gold px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-500/20"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-600 font-bold transition-colors ml-1 text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
              {profile.tags.length === 0 && (
                <div className="text-stone-500 text-xs italic">No tags added yet. Tags help you search and filter study examples.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
