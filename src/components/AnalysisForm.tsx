'use client';

import React, { useState, useEffect } from 'react';
import { HandProfile, Pin, HandView, HAND_VIEW_LABELS, parseVedicData, serializeVedicData, VedicData, calculateAge, MountSignData, LineAnalysisData } from '@/lib/supabase';
import { Trash2, Check, UploadCloud, Timer, CheckSquare, Info, Sparkles, Smile, HelpCircle, Activity, FileText, Eye, Heart, Clock, Copy, Printer, Share2, BookOpen, CheckCircle2, Award, User, Mountain, Compass, MapPin, Tag } from 'lucide-react';

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

import { HAND_TYPES, HAND_TYPE_DETAILS } from '@/lib/content/handTypes';

const generateReportMarkdown = (profile: HandProfile, vedic: VedicData): string => {
  let md = `# Hasta Sāmudrika Śāstra — Consultation & Reading Report\n\n`;
  md += `**Subject Name:** ${profile.name || 'Anonymous'}\n`;
  if (profile.age) md += `**Age:** ${profile.age} years | `;
  if (profile.gender) md += `**Gender:** ${profile.gender} | `;
  md += `**Active (Dominant) Hand:** ${profile.dominant_hand || 'Right'}\n`;
  if (profile.dob) md += `**DOB:** ${profile.dob} `;
  if (profile.tob) md += `| **TOB:** ${profile.tob} `;
  if (profile.pob) md += `| **POB:** ${profile.pob}\n`;
  md += `**Report Generated:** ${new Date().toLocaleDateString()}\n\n`;
  md += `---\n\n`;

  md += `## 1. Core Hand Prakṛti & Tattva\n`;
  md += `- **Elemental Tattva:** ${vedic.hand_tattva || 'Not specified'}\n`;
  md += `- **Classical Hand Type:** ${vedic.hand_type || 'Not specified'}\n`;
  md += `- **Palm Color:** ${vedic.palm_color || 'Not specified'}\n`;
  if (vedic.texture !== undefined && vedic.texture !== null) {
    md += `- **Palm Soil (Firmness):** ${vedic.texture}/100 (${vedic.texture < 45 ? 'Hard/Stiff Soil — high effort required' : vedic.texture > 60 ? 'Soft & Supple — fertile ground' : 'Balanced medium'})\n`;
  }
  if (vedic.skin_texture) md += `- **Dorsal Skin Texture:** ${vedic.skin_texture}\n`;
  if (vedic.line_depth) md += `- **Line Depth:** ${vedic.line_depth}\n`;
  md += `\n`;

  md += `## 2. Thumb & Willpower Analysis (Icchā vs. Tarka)\n`;
  if (vedic.thumb_type) md += `- **Thumb Type:** ${vedic.thumb_type}\n`;
  if (vedic.thumb_angle) md += `- **Thumb Angle:** ${vedic.thumb_angle}\n`;
  if (vedic.thumb_willpower) md += `- **Willpower Rating:** ${vedic.thumb_willpower}\n`;
  if (vedic.thumb_first_phalange_length) md += `- **1st Phalanx Length (Willpower / Icchā):** ${vedic.thumb_first_phalange_length}\n`;
  if (vedic.thumb_first_phalange_condition) md += `- **1st Phalanx Condition:** ${vedic.thumb_first_phalange_condition}\n`;
  if (vedic.thumb_second_phalange) md += `- **2nd Phalanx (Logic / Tarka):** ${vedic.thumb_second_phalange}\n`;
  if (vedic.has_clubbed_thumb) md += `- **Clubbed Thumb:** Present — intense temper potential; requires emotional balance\n`;
  md += `\n`;

  md += `## 3. Four Planetary Fingers & Phalanges\n`;
  md += `### Jupiter (Guru) Finger\n`;
  md += `- Length: ${vedic.jupiter_length || 'Normal'} | Tilt: ${vedic.jupiter_tilt || 'Straight'}\n`;
  if (vedic.jupiter_phalange_1) md += `- 1st Phalanx (Spirituality/Mentality): ${vedic.jupiter_phalange_1}\n`;
  if (vedic.jupiter_phalange_2) md += `- 2nd Phalanx (Logic/Application): ${vedic.jupiter_phalange_2}\n`;
  if (vedic.jupiter_phalange_3) md += `- 3rd Phalanx (Results): ${vedic.jupiter_phalange_3}\n`;

  md += `### Saturn (Śani) Finger\n`;
  md += `- Length: ${vedic.saturn_length || 'Normal'} | Tilt: ${vedic.saturn_tilt || 'Straight'}\n`;
  if (vedic.saturn_phalange_1) md += `- 1st Phalanx (Discipline): ${vedic.saturn_phalange_1}\n`;
  if (vedic.saturn_phalange_2) md += `- 2nd Phalanx (Work Logic): ${vedic.saturn_phalange_2}\n`;
  if (vedic.saturn_phalange_3) md += `- 3rd Phalanx (Material Return): ${vedic.saturn_phalange_3}\n`;

  md += `### Sun (Sūrya) Finger\n`;
  md += `- Length: ${vedic.sun_length || 'Normal'} | Tilt: ${vedic.sun_tilt || 'Straight'}${vedic.sun_crooked ? ' | Crooked' : ''}\n`;
  if (vedic.sun_phalange_1) md += `- 1st Phalanx (Creative Vision): ${vedic.sun_phalange_1}\n`;
  if (vedic.sun_phalange_2) md += `- 2nd Phalanx (Aesthetic Logic): ${vedic.sun_phalange_2}\n`;
  if (vedic.sun_phalange_3) md += `- 3rd Phalanx (Fame/Acclaim): ${vedic.sun_phalange_3}\n`;

  md += `### Mercury (Budh) Finger\n`;
  md += `- Length: ${vedic.mercury_length || 'Normal'} | Tilt: ${vedic.mercury_tilt || 'Straight'}${vedic.mercury_low_set ? ' | Low-set base' : ''}\n`;
  if (vedic.mercury_phalange_1) md += `- 1st Phalanx (Speech/Eloquence): ${vedic.mercury_phalange_1}\n`;
  if (vedic.mercury_phalange_2) md += `- 2nd Phalanx (Commercial Logic): ${vedic.mercury_phalange_2}\n`;
  if (vedic.mercury_phalange_3) md += `- 3rd Phalanx (Trade Results): ${vedic.mercury_phalange_3}\n`;
  md += `\n`;

  md += `## 4. Nails (Nakh) & Health Diagnostics\n`;
  if (vedic.nail_shape_detail) md += `- **Shape:** ${vedic.nail_shape_detail}\n`;
  if (vedic.nail_color) md += `- **Color:** ${vedic.nail_color}\n`;
  if (vedic.nail_surface) md += `- **Surface:** ${vedic.nail_surface}\n`;
  if (vedic.nail_lunula) md += `- **Lunulae (Moons):** ${vedic.nail_lunula}\n`;
  if (vedic.nail_biting) md += `- **Nail Biting:** Present (nervous tension / suppressed restlessness)\n`;
  if (vedic.nail_health_flag) md += `- **Health Diagnostic Alert:** ${vedic.nail_health_flag}\n`;
  md += `\n`;

  md += `## 5. Seven Planetary Mounts & Sacred Signs\n`;
  const mountDefs: Array<{ key: keyof VedicData; name: string }> = [
    { key: 'mount_jupiter', name: 'Jupiter Mount (Guru)' },
    { key: 'mount_saturn', name: 'Saturn Mount (Śani)' },
    { key: 'mount_sun', name: 'Sun Mount (Sūrya)' },
    { key: 'mount_mercury', name: 'Mercury Mount (Budh)' },
    { key: 'mount_moon', name: 'Moon Mount (Chandra)' },
    { key: 'mount_venus', name: 'Venus Mount (Śukra)' },
    { key: 'mount_mars_upper', name: 'Upper Mars (Mental Courage)' },
    { key: 'mount_mars_lower', name: 'Lower Mars (Physical Aggression)' },
    { key: 'mount_mars_plain', name: 'Plain of Mars (Rāhu / Ketu)' },
  ];
  mountDefs.forEach(({ key, name }) => {
    const data = vedic[key] as MountSignData | null;
    if (data && (data.height || (data.signs && data.signs.length > 0) || data.notes)) {
      md += `### ${name}\n`;
      if (data.height) md += `- Height: ${data.height}\n`;
      if (data.apex) md += `- Apex Displacement: ${data.apex}\n`;
      if (data.signs && data.signs.length > 0) md += `- Sacred Signs: ${data.signs.join(', ')}\n`;
      if (data.quality) md += `- Tissue Quality: ${data.quality}\n`;
      if (data.notes) md += `- Observations: ${data.notes}\n`;
    }
  });
  md += `\n`;

  md += `## 6. Primary Lines (Rekhā) Analysis\n`;
  const lineDefs: Array<{ key: keyof VedicData; name: string }> = [
    { key: 'line_life', name: 'Life Line (Āyur Rekhā / Jīvana Rekhā)' },
    { key: 'line_head', name: 'Head / Brain Line (Mastiṣka Rekhā)' },
    { key: 'line_heart', name: 'Heart Line (Hṛdaya Rekhā)' },
    { key: 'line_fate', name: 'Fate Line (Bhāgya Rekhā / Śani Rekhā)' },
    { key: 'line_sun', name: 'Sun Line (Sūrya Rekhā / Kīrti Rekhā)' },
  ];
  lineDefs.forEach(({ key, name }) => {
    const data = vedic[key] as LineAnalysisData | null;
    if (data && (data.quality || data.origin || data.terminus || (data.features && data.features.length > 0) || (data.signs && data.signs.length > 0))) {
      md += `### ${name}\n`;
      if (data.quality) md += `- Quality: ${data.quality}\n`;
      if (data.origin) md += `- Origin: ${data.origin}\n`;
      if (data.terminus) md += `- Terminus: ${data.terminus}\n`;
      if (data.features && data.features.length > 0) md += `- Features: ${data.features.join(', ')}\n`;
      if (data.signs && data.signs.length > 0) md += `- Signs on Line: ${data.signs.join(', ')}\n`;
      if (data.notes) md += `- Notes: ${data.notes}\n`;
    }
  });

  if (vedic.line_mercury_present !== null && vedic.line_mercury_present !== undefined) {
    md += `### Mercury / Health Line (Budha Rekhā / Svasthya Rekhā)\n`;
    md += `- Status: ${vedic.line_mercury_present ? 'Present' : 'Absent (classical indicator of robust vitality)'}\n`;
    if (vedic.line_mercury_starts_below_heart) md += `- Origin: Below Heart Line (digestive/hepatic attention required)\n`;
    if (vedic.line_mercury_starts_above_heart) md += `- Starts above Heart Line (healer / counselor / trade acumen)\n`;
    if (vedic.line_mercury_joins_moon) md += `- Line of Intuition: Reaches Moon Mount (prophetic dreams, strong gut instinct)\n`;
    if (vedic.line_mercury_single_vertical) md += `- Single Vertical Line on Mount: Dhana Lābha (sudden windfall sign)\n`;
  }
  md += `\n`;

  // Age events
  const allEvents: Array<{ line: string; age: number; event: string }> = [];
  (['line_life', 'line_fate', 'line_head', 'line_heart', 'line_sun'] as const).forEach((k) => {
    const ld = vedic[k] as LineAnalysisData | null;
    if (ld && ld.age_events) {
      ld.age_events.forEach((ev) => {
        allEvents.push({ line: k.replace('line_', '').toUpperCase(), age: ev.age, event: ev.event });
      });
    }
  });
  if (allEvents.length > 0) {
    allEvents.sort((a, b) => a.age - b.age);
    md += `## 7. Chronological Life Timeline & Milestones\n`;
    allEvents.forEach((ev) => {
      md += `- **Age ${ev.age}** [${ev.line} Line]: ${ev.event}\n`;
    });
    md += `\n`;
  }

  if (vedic.life_fate_junctions && vedic.life_fate_junctions.length > 0) {
    md += `## 7b. Life × Fate Line Junction Timing\n`;
    vedic.life_fate_junctions.forEach((j) => {
      md += `- **Life age ${j.life_age} / Fate age ${j.fate_age}:** ${j.reading || 'Support/independence window'}\n`;
    });
    md += `\n`;
  }

  if (vedic.lh_vs_rh_notes) {
    md += `## 8. Left vs. Right Hand Karmic Synthesis\n`;
    md += `${vedic.lh_vs_rh_notes}\n\n`;
  }

  if (profile.general_notes) {
    md += `## 9. General Consultation Notes & Remedial Guidance\n`;
    md += `${profile.general_notes}\n\n`;
  }

  return md;
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
  const [activeTab, setActiveTab] = useState<'profile' | 'samudrika' | 'nails' | 'mounts' | 'lines' | 'age' | 'pins' | 'tags' | 'report'>('profile');
  const [newTag, setNewTag] = useState('');
  const [copiedReport, setCopiedReport] = useState(false);

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

  // Auto-switch to markers tab if user clicks a marker pin on canvas
  useEffect(() => {
    if (selectedPin) {
      setActiveTab('pins');
    }
  }, [selectedPin]);

  // Tab evaluation metrics for smart badges
  const mountsEvaluatedCount = [
    vedicData.mount_jupiter,
    vedicData.mount_saturn,
    vedicData.mount_sun,
    vedicData.mount_mercury,
    vedicData.mount_moon,
    vedicData.mount_venus,
    vedicData.mount_mars_upper,
    vedicData.mount_mars_lower,
  ].filter(Boolean).length ||
    Object.keys(profile.mounts_data || {}).filter(
      (k) => profile.mounts_data[k] && profile.mounts_data[k].trim() !== ''
    ).length;

  const linesEvaluatedCount = [
    vedicData.line_life,
    vedicData.line_fate,
    vedicData.line_head,
    vedicData.line_heart,
    vedicData.line_sun,
    vedicData.line_mercury_data,
  ].filter(Boolean).length ||
    Object.keys(profile.lines_data || {}).filter(
      (k) => profile.lines_data[k] && profile.lines_data[k].trim() !== ''
    ).length;

  const pinsCount = profile.pins?.length || 0;
  const tagsCount = profile.tags?.length || 0;

  const isSamudrikaActive = Boolean(
    vedicData.hand_tattva ||
    vedicData.palm_shape ||
    vedicData.palm_color ||
    vedicData.thumb_type ||
    vedicData.skin_texture ||
    vedicData.finger_length
  );

  const isNailsActive = Boolean(
    vedicData.nail_shape ||
    vedicData.nail_color ||
    vedicData.nail_lunula ||
    vedicData.nail_surface ||
    vedicData.nail_length
  );

  const isAgeActive = Boolean(profile.dob || vedicData.age_method);

  const tabsConfig = [
    {
      id: 'profile' as const,
      label: 'Profile',
      icon: User,
      hasDot: Boolean(profile.name && profile.name.trim() !== ''),
    },
    {
      id: 'samudrika' as const,
      label: 'Sāmudrika',
      icon: Sparkles,
      hasDot: isSamudrikaActive,
    },
    {
      id: 'nails' as const,
      label: 'Nails',
      icon: Activity,
      hasDot: isNailsActive,
    },
    {
      id: 'mounts' as const,
      label: 'Mounts',
      icon: Mountain,
      count: mountsEvaluatedCount > 0 ? mountsEvaluatedCount : null,
    },
    {
      id: 'lines' as const,
      label: 'Lines',
      icon: Compass,
      count: linesEvaluatedCount > 0 ? linesEvaluatedCount : null,
    },
    {
      id: 'age' as const,
      label: 'Age',
      icon: Clock,
      hasDot: isAgeActive,
    },
    {
      id: 'pins' as const,
      label: selectedPin ? 'Marker (Edit)' : 'Pins',
      icon: MapPin,
      count: pinsCount > 0 ? pinsCount : null,
      highlight: Boolean(selectedPin),
    },
    {
      id: 'tags' as const,
      label: 'Tags',
      icon: Tag,
      count: tagsCount > 0 ? tagsCount : null,
    },
    {
      id: 'report' as const,
      label: 'Synthesis Report',
      icon: FileText,
      isSpecial: true,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-md">
      {/* Save Action Bar */}
      <div className="px-6 py-5 bg-gradient-to-r from-stone-50/80 to-stone-50/40 border-b border-stone-200/60 flex items-center justify-between gap-4">
        <h3 className="mystic-title text-sm tracking-wider uppercase font-bold">Analysis Details</h3>
        <button
          onClick={onSave}
          disabled={isSaving || !hasChanges || !profile.name}
          title="Save Profile (Cmd+S or Ctrl+S)"
          className="btn-gold px-5 py-2.5 text-sm flex items-center gap-2 shadow-md disabled:opacity-55 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Profile'}
          <kbd className="hidden sm:inline-block text-[10px] bg-stone-900/20 px-1 py-0.5 rounded font-mono font-normal">
            ⌘S
          </kbd>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 bg-stone-50/70 border-b border-stone-200/80 px-3 py-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabsConfig.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer select-none whitespace-nowrap ${
                isActive
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200/90 font-semibold ring-1 ring-amber-500/20'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/70 border border-transparent font-medium'
              } ${t.highlight ? 'ring-2 ring-amber-500/50 bg-amber-50/50' : ''}`}
            >
              <Icon
                className={`w-3.5 h-3.5 transition-colors ${
                  isActive
                    ? 'text-accent-gold'
                    : t.isSpecial
                    ? 'text-amber-600/80'
                    : 'text-stone-400'
                }`}
              />
              <span>{t.label}</span>

              {/* Count badge */}
              {typeof t.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                    isActive
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-stone-200/80 text-stone-600'
                  }`}
                >
                  {t.count}
                </span>
              )}

              {/* Data presence dot */}
              {t.hasDot && typeof t.count !== 'number' && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? 'bg-accent-gold' : 'bg-emerald-500'
                  }`}
                  title="Completed / Active"
                />
              )}

              {/* Special badge for Synthesis Report */}
              {t.isSpecial && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 uppercase tracking-wider rounded font-bold ${
                    isActive
                      ? 'bg-amber-100 text-amber-900 border border-amber-300/40'
                      : 'bg-stone-200/70 text-stone-600'
                  }`}
                >
                  Vedic
                </span>
              )}
            </button>
          );
        })}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

                <div className="form-group">
                  <label className="form-label text-xs">Palm Color (Lecture 04)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs text-stone-850"
                    value={vedicData.palm_color || ''}
                    onChange={(e) => updateVedicField('palm_color', e.target.value)}
                  >
                    <option value="">Select Color...</option>
                    <option value="Pinkish (Healthy)">🌸 Pinkish (Healthy baseline)</option>
                    <option value="Pale/Whitish">⚪ Pale / Whitish (Low vitality)</option>
                    <option value="Yellow (health/liver)">🟡 Yellow (Liver/Pitta indicator)</option>
                    <option value="Reddish (heat/aggression)">🔴 Reddish (High heat / Agni)</option>
                    <option value="Blue/Purple tinge (serious illness)">🟣 Blue / Purple (Circulatory alert)</option>
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

              {/* Thumb Type, 2nd Phalange, Tip Element — Lecture 07 */}
              <div className="grid grid-cols-3 gap-3 border-t border-stone-100 pt-4">
                <div className="form-group">
                  <label className="form-label text-xs">Thumb Type / Shape</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.thumb_type || ''}
                    onChange={(e) => updateVedicField('thumb_type', e.target.value)}
                  >
                    <option value="">Select Thumb Type...</option>
                    <option value="Waist-like">Waist-like (Best — social, diplomatic)</option>
                    <option value="Middle Type">Middle Type (2nd best — practical, polite)</option>
                    <option value="Slight Bend">Slight Backward Bend (Conditional/dominating)</option>
                    <option value="Stiff">Stiff / Straight (Stubborn, plain-spoken)</option>
                    <option value="Very Flexible">Very Flexible / Bends Back (Follower/spendthrift)</option>
                    <option value="Elementary">Elementary (Procrastinating, aimless)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">2nd Phalange (Logic Parva)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.thumb_second_phalange || ''}
                    onChange={(e) => updateVedicField('thumb_second_phalange', e.target.value)}
                  >
                    <option value="">Select Logic Condition...</option>
                    <option value="Normal">Normal (Balanced logic &amp; action)</option>
                    <option value="Long (over-thinker)">Long (Excessive analysis, paralysis)</option>
                    <option value="Short (impulsive)">Short (Acts without thinking)</option>
                    <option value="Half-cut line">Half-cut line (Logic not sustained long)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Tip Element Shape</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.thumb_tip_element || ''}
                    onChange={(e) => updateVedicField('thumb_tip_element', e.target.value)}
                  >
                    <option value="">Select Tip Element...</option>
                    <option value="Square (Earth)">Square — Earth (Practical, stubborn)</option>
                    <option value="Round (Air)">Round — Air (Investigative, Ketu-driven)</option>
                    <option value="Conical (Water)">Conical — Water (Emotional, artistic)</option>
                    <option value="Spatulate (Fire)">Spatulate — Fire (Energetic, action-first)</option>
                  </select>
                </div>
              </div>

              {/* Thumb Type + 2nd Phalange + Tip Element Interpretations */}
              {(vedicData.thumb_type || vedicData.thumb_second_phalange || vedicData.thumb_tip_element) && (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2 leading-relaxed">
                  <span className="font-bold text-stone-800 uppercase tracking-wider block text-[9px]">Thumb Reading:</span>
                  <div className="space-y-1.5 text-[11px] text-stone-700 font-semibold">

                    {/* Thumb Type */}
                    {vedicData.thumb_type === 'Waist-like' && <p>✨ <strong>Waist-like (Best Type):</strong> Very social, brings everyone along, maintains self-respect while respecting others. Diplomatic — responds appropriately to others' emotional states without envy or complaint. Good sense of humor.</p>}
                    {vedicData.thumb_type === 'Middle Type' && <p>✨ <strong>Middle Type (2nd Best):</strong> Practical and polite. Very good at adjusting and compromising. If combined with tool-use bone trait → resourceful/jugadu — good results even with limited resources.</p>}
                    {vedicData.thumb_type === 'Slight Bend' && <p>⚡ <strong>Slight Backward Bend:</strong> Mildly dominating — adjusts, but with certain conditions ("you do this for me, and I'll do that for you"). Comfort-seeking; life is relatively easy. Enforcement of conditions depends on willpower strength.</p>}
                    {vedicData.thumb_type === 'Stiff' && <p>⚠️ <strong>Stiff / Straight:</strong> Stubborn, rigid, set in their ways. Anger expressed indirectly (slamming doors, venting to others). Plain-spoken — states things exactly as they are. Life involves more hard work/struggle.</p>}
                    {vedicData.thumb_type === 'Very Flexible' && <p>⚠️ <strong>Very Flexible (Bends Back):</strong> If willpower (1st phalange) is small → pure follower. If willpower is good → adjusts but still presents own view. Tends toward wasteful spending and overthinking. Avoids physical labor.</p>}
                    {vedicData.thumb_type === 'Elementary' && <p>⚠️ <strong>Elementary Thumb:</strong> Habit of postponing tasks. Can be aimless, lacking clear life goals. If also stiff → stubborn and aimless together — refuses advice, does only what they've decided.</p>}

                    {/* 2nd Phalange (Logic) */}
                    {vedicData.thumb_second_phalange === 'Normal' && <p>🧠 <strong>2nd Phalange — Normal:</strong> Balanced logic and action. Thinks adequately before doing; neither over-analyses nor acts blindly.</p>}
                    {vedicData.thumb_second_phalange === 'Long (over-thinker)' && <p>⚠️ <strong>2nd Phalange — Long:</strong> Over-thinker / analysis paralysis. Spends excessive time reasoning and second-guessing before any decision. Can delay action indefinitely.</p>}
                    {vedicData.thumb_second_phalange === 'Short (impulsive)' && <p>⚠️ <strong>2nd Phalange — Short:</strong> Impulsive. Acts without thinking through consequences. Strong willpower but weak logic filter — says or does things they later regret.</p>}
                    {vedicData.thumb_second_phalange === 'Half-cut line' && <p>⚡ <strong>2nd Phalange — Half-cut line:</strong> Logic is present but not sustained. Reasoning starts strong, then cuts off — decisions are partially thought through but abandoned mid-way.</p>}

                    {/* Tip Element */}
                    {vedicData.thumb_tip_element === 'Square (Earth)' && <p>🟫 <strong>Tip — Square (Earth / Pṛthvī):</strong> Practical, stubborn, and grounded. Executes decisions in a stable, methodical way. Values tangible results over ideas.</p>}
                    {vedicData.thumb_tip_element === 'Round (Air)' && <p>🔵 <strong>Tip — Round (Air / Vāyu / Ketu):</strong> Investigative and philosophical. Curious mind that questions everything. Prefers understanding the "why" before acting.</p>}
                    {vedicData.thumb_tip_element === 'Conical (Water)' && <p>💧 <strong>Tip — Conical (Water / Jala):</strong> Emotionally driven decisions. Artistic and sensitive. Willpower is shaped by mood and emotional state rather than pure logic.</p>}
                    {vedicData.thumb_tip_element === 'Spatulate (Fire)' && <p>🔥 <strong>Tip — Spatulate (Fire / Agni):</strong> Action-first, energy-first. High physical drive. Gets things done through force of personality and enthusiasm rather than careful planning.</p>}

                  </div>
                </div>
              )}

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

            {/* ─── FINGERS — Jupiter (Guru / Index) — Lecture 08 ─── */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                Jupiter Finger (Guru / Index) — Aṅguli Analysis
              </h4>
              <p className="text-[10px] text-stone-500 leading-normal">Read length vs. Sun finger first, then tilt direction, then all three phalanges from tip downward.</p>

              {/* All 6 Jupiter fields in one compact grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="form-group">
                  <label className="form-label text-xs">Length vs. Sun (Ring)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.jupiter_length || ''}
                    onChange={(e) => updateVedicField('jupiter_length', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Short">Short (Below Sun)</option>
                    <option value="Normal">Normal / Equal</option>
                    <option value="Long">Long (Above Sun)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Tilt Direction</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.jupiter_tilt || ''}
                    onChange={(e) => updateVedicField('jupiter_tilt', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Toward Saturn">→ Saturn (philosophical)</option>
                    <option value="Straight">Straight (balanced)</option>
                    <option value="Toward Thumb">→ Thumb (own terms)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Tip Element</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.jupiter_tip_element || ''}
                    onChange={(e) => updateVedicField('jupiter_tip_element', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Square (Earth)">Square — Earth</option>
                    <option value="Round (Air)">Round — Air</option>
                    <option value="Conical (Water)">Conical — Water</option>
                    <option value="Spatulate (Fire)">Spatulate — Fire</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">1st Phalange (Mentality)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.jupiter_phalange_1 || ''}
                    onChange={(e) => updateVedicField('jupiter_phalange_1', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Short">Short</option>
                    <option value="Normal">Normal</option>
                    <option value="Long & Bulged">Long &amp; Bulged</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">2nd Phalange (Logic)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.jupiter_phalange_2 || ''}
                    onChange={(e) => updateVedicField('jupiter_phalange_2', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Normal">Normal</option>
                    <option value="Horizontal line (reduced logic)">Horizontal line</option>
                    <option value="Vertical line (stress)">Vertical line (stress)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">3rd Phalange (Results)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.jupiter_phalange_3 || ''}
                    onChange={(e) => updateVedicField('jupiter_phalange_3', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Open/Full">Open / Full (good)</option>
                    <option value="Thin">Thin (low results)</option>
                    <option value="Has marks/lines">Has marks / lines</option>
                  </select>
                </div>
              </div>

              {/* Jupiter Interpretation */}
              {(vedicData.jupiter_length || vedicData.jupiter_tilt || vedicData.jupiter_phalange_1 || vedicData.jupiter_phalange_3) && (
                <div className="p-3 bg-indigo-50/50 border border-indigo-200/40 rounded-xl text-xs space-y-1.5 leading-relaxed">
                  <span className="font-bold text-indigo-900 flex items-center gap-1 text-[9px] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Jupiter Sāmudrika Significations
                  </span>
                  <div className="space-y-1 text-[11px] text-stone-700 font-semibold">
                    {vedicData.jupiter_length === 'Normal' && <p>⚖️ <strong>Normal Jupiter:</strong> Good listener, absorbs more than shares. Spiritually inclined but not showy. High morality. Guru-like qualities. Contented/satisfied. Balanced between materialistic and emotional.</p>}
                    {vedicData.jupiter_length === 'Long' && <p>📖 <strong>Long Jupiter:</strong> Stronger knowledge drive. Can become dominating, argumentative ("fighter"). Philosophy-inclined. May lecture everyone around them. Ego in knowledge domain.</p>}
                    {vedicData.jupiter_length === 'Short' && <p>⚠️ <strong>Short Jupiter:</strong> Lower self-confidence. Relies on others for direction in knowledge matters. May be less willing to teach or guide.</p>}
                    {vedicData.jupiter_tilt === 'Toward Saturn' && <p>🪐 <strong>Tilt → Saturn:</strong> Respects social norms and does not break society\'s rules. Philosophical inclination increases if finger also has knots. May not impose personal rules on others.</p>}
                    {vedicData.jupiter_tilt === 'Toward Thumb' && <p>💪 <strong>Tilt → Self/Thumb:</strong> Works on their own terms. May impose conditions on others. Whether they can enforce this depends on willpower (1st phalange) strength.</p>}
                    {vedicData.jupiter_phalange_1 === 'Long & Bulged' && <p>✨ <strong>1st Phalange (Long &amp; Bulged):</strong> Strong spiritual inclination (may show as worship, charity, or dharmic service). Good ancestral inheritance in thinking/mentality.</p>}
                    {vedicData.jupiter_phalange_2 === 'Horizontal line (reduced logic)' && <p>⚠️ <strong>2nd Phalange (Horizontal):</strong> Implementation of knowledge is reduced. Person accepts things without fully reasoning them through.</p>}
                    {vedicData.jupiter_phalange_2 === 'Vertical line (stress)' && <p>⚠️ <strong>2nd Phalange (Vertical):</strong> Stress accompanies implementation. Excessive worry about applying what was learned.</p>}
                    {vedicData.jupiter_phalange_3 === 'Thin' && <p>⚠️ <strong>3rd Phalange (Thin):</strong> Results in Jupiter matters (knowledge, wisdom, leadership) are not proportionate to effort/mentality put in.</p>}
                    {vedicData.jupiter_phalange_3 === 'Open/Full' && <p>✨ <strong>3rd Phalange (Full):</strong> Good results flow from Jupiter matters. Knowledge translates into real outcomes.</p>}
                  </div>
                </div>
              )}
            </div>

            {/* ─── FINGERS — Saturn (Śani / Middle) — Lecture 09 ─── */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Activity className="w-4 h-4 text-slate-500" />
                Saturn Finger (Śani / Middle) — Aṅguli Analysis
              </h4>
              <p className="text-[10px] text-stone-500 leading-normal">Saturn is the longest finger. Read its natural tilt to understand the person\'s relationship with work, rules, and society.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="form-group">
                  <label className="form-label text-xs">Saturn Length</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.saturn_length || ''}
                    onChange={(e) => updateVedicField('saturn_length', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Short">Short</option>
                    <option value="Normal">Normal</option>
                    <option value="Long">Long</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Tilt Direction</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.saturn_tilt || ''}
                    onChange={(e) => updateVedicField('saturn_tilt', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Toward Jupiter">→ Jupiter (philosophical)</option>
                    <option value="Straight">Straight (balanced)</option>
                    <option value="Toward Sun">→ Sun (fame-seeking)</option>
                  </select>
                </div>
              </div>

              {/* Saturn Phalanges (Notes 09) */}
              <div className="border-t border-stone-100 pt-3">
                <span className="text-[11px] font-bold text-stone-700 block mb-2">Saturn Phalanges (Notes 09)</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="form-group">
                    <label className="form-label text-xs">1st Phalange (Discipline)</label>
                    <select
                      className="form-input bg-white border border-stone-200 text-xs"
                      value={vedicData.saturn_phalange_1 || ''}
                      onChange={(e) => updateVedicField('saturn_phalange_1', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="Short">Short (low discipline)</option>
                      <option value="Normal">Normal</option>
                      <option value="Long">Long (deep solitude/research)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">2nd Phalange (Work Logic)</label>
                    <select
                      className="form-input bg-white border border-stone-200 text-xs"
                      value={vedicData.saturn_phalange_2 || ''}
                      onChange={(e) => updateVedicField('saturn_phalange_2', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="Normal">Normal</option>
                      <option value="Horizontal line">Horizontal line (delayed logic)</option>
                      <option value="Vertical line (stress)">Vertical line (career stress)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">3rd Phalange (Material Results)</label>
                    <select
                      className="form-input bg-white border border-stone-200 text-xs"
                      value={vedicData.saturn_phalange_3 || ''}
                      onChange={(e) => updateVedicField('saturn_phalange_3', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="Open/Full">Open / Full (solid returns)</option>
                      <option value="Thin">Thin (high effort, low return)</option>
                      <option value="Has marks/lines">Has marks / stress lines</option>
                    </select>
                  </div>
                </div>
              </div>

              {(vedicData.saturn_length || vedicData.saturn_tilt || vedicData.saturn_phalange_1 || vedicData.saturn_phalange_2 || vedicData.saturn_phalange_3) && (
                <div className="p-3 bg-slate-50 border border-slate-200/40 rounded-xl text-xs space-y-1 leading-relaxed">
                  <span className="font-bold text-slate-800 uppercase tracking-wider block text-[9px]">Saturn Reading:</span>
                  <div className="space-y-1 text-[11px] text-stone-700 font-semibold">
                    {vedicData.saturn_length === 'Short' && <p>⚠️ <strong>Short Saturn:</strong> May indicate challenges with karma and life\'s responsibilities. Difficulty sustaining long-term commitments.</p>}
                    {vedicData.saturn_length === 'Normal' && <p>✨ <strong>Normal Saturn:</strong> Balanced relationship with work and duty. Karma unfolds steadily without extremes.</p>}
                    {vedicData.saturn_length === 'Long' && <p>📌 <strong>Long Saturn:</strong> Dominant Saturn influence — strong sense of duty, discipline, philosophical nature, or increased life obstacles (read with mount).</p>}
                    {vedicData.saturn_tilt === 'Toward Jupiter' && <p>📖 <strong>Tilt → Jupiter:</strong> The person seeks to learn before acting. Knowledge and wisdom shape their sense of duty.</p>}
                    {vedicData.saturn_tilt === 'Toward Sun' && <p>⚡ <strong>Tilt → Sun:</strong> Strong desire for name/fame through work (karma). Can bring anxiety related to self-confidence or health of the nervous system when combined with Sun tilting toward Saturn.</p>}
                    {vedicData.saturn_phalange_1 === 'Long' && <p>🪐 <strong>1st Phalange (Long):</strong> Deep contemplation, philosophical discipline, endurance in solitary work.</p>}
                    {vedicData.saturn_phalange_2 === 'Horizontal line' && <p>⚠️ <strong>2nd Phalange (Horizontal line):</strong> Execution of karmic responsibility encounters intellectual delay or obstacles.</p>}
                    {vedicData.saturn_phalange_2 === 'Vertical line (stress)' && <p>⚠️ <strong>2nd Phalange (Vertical line):</strong> High career stress and anxiety around delivering duties.</p>}
                    {vedicData.saturn_phalange_3 === 'Open/Full' && <p>✨ <strong>3rd Phalange (Full):</strong> Solid material fruits and lasting stability earned from career labor.</p>}
                    {vedicData.saturn_phalange_3 === 'Thin' && <p>⚠️ <strong>3rd Phalange (Thin):</strong> Person labors hard, but financial or tangible returns remain modest.</p>}
                  </div>
                </div>
              )}
            </div>

            {/* ─── FINGERS — Sun (Sūrya / Ring) — Lecture 09 ─── */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Activity className="w-4 h-4 text-amber-500" />
                Sun Finger (Sūrya / Ring) — Aṅguli Analysis
              </h4>
              <p className="text-[10px] text-stone-500 leading-normal">Sun controls fame, ego, risk-taking, and vitality. Compare to Jupiter to assess ego type.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                <div className="form-group">
                  <label className="form-label text-xs">Length vs. Jupiter</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.sun_length || ''}
                    onChange={(e) => updateVedicField('sun_length', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Short">Short</option>
                    <option value="Normal">Normal / Equal</option>
                    <option value="Long">Long (risk-taker)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Tilt Direction</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.sun_tilt || ''}
                    onChange={(e) => updateVedicField('sun_tilt', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Toward Saturn">→ Saturn (fame via work)</option>
                    <option value="Straight">Straight (balanced)</option>
                    <option value="Toward Mercury">→ Mercury (creative blend)</option>
                  </select>
                </div>
                <div className="form-group col-span-2 md:col-span-2 flex items-end pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-xs text-stone-700">
                    <input
                      type="checkbox"
                      className="rounded text-accent-gold focus:ring-accent-gold"
                      checked={vedicData.sun_crooked || false}
                      onChange={(e) => updateVedicField('sun_crooked', e.target.checked)}
                    />
                    <span>Sun Finger is Crooked / Bent</span>
                  </label>
                </div>
              </div>

              {/* Sun Phalanges (Notes 09) */}
              <div className="border-t border-stone-100 pt-3">
                <span className="text-[11px] font-bold text-stone-700 block mb-2">Sun Phalanges (Notes 09)</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="form-group">
                    <label className="form-label text-xs">1st Phalange (Creative Vision)</label>
                    <select
                      className="form-input bg-white border border-stone-200 text-xs"
                      value={vedicData.sun_phalange_1 || ''}
                      onChange={(e) => updateVedicField('sun_phalange_1', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="Short">Short</option>
                      <option value="Normal">Normal</option>
                      <option value="Long">Long (high artistic genius)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">2nd Phalange (Aesthetic Logic)</label>
                    <select
                      className="form-input bg-white border border-stone-200 text-xs"
                      value={vedicData.sun_phalange_2 || ''}
                      onChange={(e) => updateVedicField('sun_phalange_2', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="Normal">Normal</option>
                      <option value="Horizontal line">Horizontal line (ego clash)</option>
                      <option value="Vertical line (stress)">Vertical line (reputation anxiety)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">3rd Phalange (Fame & Luxury)</label>
                    <select
                      className="form-input bg-white border border-stone-200 text-xs"
                      value={vedicData.sun_phalange_3 || ''}
                      onChange={(e) => updateVedicField('sun_phalange_3', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="Open/Full">Open / Full (luxury & acclaim)</option>
                      <option value="Thin">Thin (modest material gain)</option>
                      <option value="Has marks/lines">Has marks / blemishes</option>
                    </select>
                  </div>
                </div>
              </div>

              {(vedicData.sun_length || vedicData.sun_tilt || vedicData.sun_crooked || vedicData.sun_phalange_1 || vedicData.sun_phalange_2 || vedicData.sun_phalange_3) && (
                <div className="p-3 bg-amber-50/60 border border-amber-200/40 rounded-xl text-xs space-y-1 leading-relaxed">
                  <span className="font-bold text-amber-900 uppercase tracking-wider block text-[9px]">Sun Reading:</span>
                  <div className="space-y-1 text-[11px] text-stone-700 font-semibold">
                    {vedicData.sun_length === 'Long' && <p>⚡ <strong>Long Sun:</strong> Greater risk-taking ability — tends to act before thinking. Strong creative energy and drive for recognition.</p>}
                    {vedicData.sun_length === 'Normal' && <p>✨ <strong>Normal/Equal Sun:</strong> Balanced ego. Ego is expressed harmoniously, neither dominating nor submissive.</p>}
                    {vedicData.sun_length === 'Short' && <p>⚠️ <strong>Short Sun:</strong> Lower risk appetite and less assertive about fame/recognition.</p>}
                    {vedicData.sun_tilt === 'Toward Saturn' && <p>🪐 <strong>Tilt → Saturn:</strong> Increases desire for fame through one\'s karma/work, but can bring anxiety (self-confidence dips). If Saturn also tilts toward Sun → yoga for defamation possible alongside career prominence. Typically good at balancing personal and professional life.</p>}
                    {vedicData.sun_crooked && <p>⚡ <strong>Crooked/Bent:</strong> Amplifies Sun energy in an intense or distorted way. If crookedness is from the knuckle, the effect shows in the entire field governed by the Sun.</p>}
                    {vedicData.sun_phalange_1 === 'Long' && <p>☀️ <strong>1st Phalange (Long):</strong> Heightened creative vision, dramatic/artistic instincts, appreciation for visual grandeur.</p>}
                    {vedicData.sun_phalange_2 === 'Horizontal line' && <p>⚠️ <strong>2nd Phalange (Horizontal line):</strong> Clashes of ego and difficulty turning aesthetic concepts into tangible execution.</p>}
                    {vedicData.sun_phalange_2 === 'Vertical line (stress)' && <p>⚠️ <strong>2nd Phalange (Vertical line):</strong> Sensitive to social reputation; persistent stress about status.</p>}
                    {vedicData.sun_phalange_3 === 'Open/Full' && <p>✨ <strong>3rd Phalange (Full):</strong> Enjoyment of luxurious comfort, high social standing and visible material prestige.</p>}
                    {vedicData.sun_phalange_3 === 'Thin' && <p>⚠️ <strong>3rd Phalange (Thin):</strong> Public recognition achieved, but with modest material accumulation.</p>}
                  </div>
                </div>
              )}
            </div>

            {/* ─── FINGERS — Mercury (Budh / Little) — Lecture 10 ─── */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Activity className="w-4 h-4 text-teal-500" />
                Mercury Finger (Budh / Little) — Aṅguli Analysis
              </h4>
              <p className="text-[10px] text-stone-500 leading-normal">Mercury controls communication, business acumen, speech, writing, and diplomacy. Normal = reaches 1st joint of Sun finger.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                <div className="form-group">
                  <label className="form-label text-xs">Length (ref: 1st joint of Sun)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.mercury_length || ''}
                    onChange={(e) => updateVedicField('mercury_length', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Short">Short</option>
                    <option value="Average">Normal</option>
                    <option value="Long">Long</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Tilt / Position</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.mercury_tilt || ''}
                    onChange={(e) => updateVedicField('mercury_tilt', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Attached to Sun">Attached (norm-seeking)</option>
                    <option value="Straight">Straight</option>
                    <option value="Separated from Sun">Separated (independent)</option>
                  </select>
                </div>
                <div className="form-group col-span-2 md:col-span-2 flex items-end pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-xs text-stone-700">
                    <input
                      type="checkbox"
                      className="rounded text-accent-gold focus:ring-accent-gold"
                      checked={vedicData.mercury_low_set || false}
                      onChange={(e) => updateVedicField('mercury_low_set', e.target.checked)}
                    />
                    <span>Mercury base is low-set (starts lower than other fingers)</span>
                  </label>
                </div>
              </div>

              {/* Mercury Phalanges (Notes 10) */}
              <div className="border-t border-stone-100 pt-3">
                <span className="text-[11px] font-bold text-stone-700 block mb-2">Mercury Phalanges (Notes 10)</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="form-group">
                    <label className="form-label text-xs">1st Phalange (Speech/Eloquence)</label>
                    <select
                      className="form-input bg-white border border-stone-200 text-xs"
                      value={vedicData.mercury_phalange_1 || ''}
                      onChange={(e) => updateVedicField('mercury_phalange_1', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="Short">Short (speech hesitations)</option>
                      <option value="Normal">Normal</option>
                      <option value="Long">Long (silver-tongued orator)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">2nd Phalange (Commercial Logic)</label>
                    <select
                      className="form-input bg-white border border-stone-200 text-xs"
                      value={vedicData.mercury_phalange_2 || ''}
                      onChange={(e) => updateVedicField('mercury_phalange_2', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="Normal">Normal</option>
                      <option value="Horizontal line">Horizontal line (financial misstep)</option>
                      <option value="Vertical line (stress)">Vertical line (business stress)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">3rd Phalange (Trade Results)</label>
                    <select
                      className="form-input bg-white border border-stone-200 text-xs"
                      value={vedicData.mercury_phalange_3 || ''}
                      onChange={(e) => updateVedicField('mercury_phalange_3', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="Open/Full">Open / Full (profitable trade)</option>
                      <option value="Thin">Thin (thin margins)</option>
                      <option value="Has marks/lines">Has marks / leaks</option>
                    </select>
                  </div>
                </div>
              </div>

              {(vedicData.mercury_length || vedicData.mercury_tilt || vedicData.mercury_low_set || vedicData.mercury_phalange_1 || vedicData.mercury_phalange_2 || vedicData.mercury_phalange_3) && (
                <div className="p-3 bg-teal-50/50 border border-teal-200/40 rounded-xl text-xs space-y-1.5 leading-relaxed">
                  <span className="font-bold text-teal-900 uppercase tracking-wider block text-[9px]">Mercury Reading:</span>
                  <div className="space-y-1 text-[11px] text-stone-700 font-semibold">
                    {vedicData.mercury_length === 'Long' && <p>✨ <strong>Long Mercury:</strong> Excellent logical ability, persuasion, and research capacity. Good at last-minute preparation and still succeeding. Strong diplomacy — "snake dies, stick intact" communication style. Scientist-level analytical capacity.</p>}
                    {vedicData.mercury_length === 'Average' && <p>✨ <strong>Normal Mercury:</strong> Multi-talented, quick-witted, good at speaking and social interaction. Love of arts. All Mercury qualities present in balanced measure.</p>}
                    {vedicData.mercury_length === 'Short' && <p>⚠️ <strong>Short Mercury:</strong> Dull intellect indicator (mand buddhi). Difficulty with logic and grasping concepts. Possible nervous system issues. Indecisive. May be timid in speech. Can indicate complications related to childbirth/reproduction (read with lines).</p>}
                    {vedicData.mercury_tilt === 'Attached to Sun' && <p>📌 <strong>Attached to Sun:</strong> Speech has commanding quality. Desires recognition and praise. Craves name/fame. Tends not to break social norms — fears disapproval from others. In astrology: like Mercury-Sun conjunction (yuti).</p>}
                    {vedicData.mercury_tilt === 'Separated from Sun' && <p>🌟 <strong>Separated/Gap:</strong> Will do what they\'ve decided regardless of others\' opinion. Prefers to work outside conventional norms. Not afraid of criticism. Open-minded and freedom-loving. Does not necessarily do anything bad — may simply take paths their family never considered.</p>}
                    {vedicData.mercury_low_set && <p>📏 <strong>Low-set base:</strong> Mercury base sits lower than other fingers on most hands (this is common). The mount below gets less space as the finger takes more area. Read mount condition separately to compensate.</p>}
                    {vedicData.mercury_phalange_1 === 'Long' && <p>☿ <strong>1st Phalange (Long):</strong> Supreme eloquence, convincing speaker, magnetic vocal resonance.</p>}
                    {vedicData.mercury_phalange_2 === 'Horizontal line' && <p>⚠️ <strong>2nd Phalange (Horizontal line):</strong> Vulnerable to contractual misunderstandings or flawed business arithmetic.</p>}
                    {vedicData.mercury_phalange_2 === 'Vertical line (stress)' && <p>⚠️ <strong>2nd Phalange (Vertical line):</strong> Commercial stress and anxiety surrounding financial negotiations.</p>}
                    {vedicData.mercury_phalange_3 === 'Open/Full' && <p>✨ <strong>3rd Phalange (Full):</strong> Shrewd commercial instincts with substantial wealth retention from business.</p>}
                    {vedicData.mercury_phalange_3 === 'Thin' && <p>⚠️ <strong>3rd Phalange (Thin):</strong> Commercial ideas exist, but leak profit or struggle to build accumulated savings.</p>}
                  </div>
                </div>
              )}
            </div>

            {/* ─── GENERAL FINGER PROFILE — Lecture 10 ─── */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Eye className="w-4 h-4 text-rose-500" />
                General Finger Profile
              </h4>
              <p className="text-[10px] text-stone-500 leading-normal">Overall finger build, spacing between fingers, and depth of lines — all reveal core temperament and life difficulty.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="form-group">
                  <label className="form-label text-xs">Finger Spacing</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.finger_gaps || ''}
                    onChange={(e) => updateVedicField('finger_gaps', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="None">None — fingers touch</option>
                    <option value="Small gaps (generous)">Small — generous</option>
                    <option value="Wide gaps (free spirit)">Wide — free spirit</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Overall Finger Build</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.finger_build || ''}
                    onChange={(e) => updateVedicField('finger_build', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Normal">Normal</option>
                    <option value="Long & thin (creative)">Long &amp; thin — creative</option>
                    <option value="Short & thick (stubborn + anger)">Short &amp; thick — stubborn</option>
                    <option value="Thick base (food lover / lazy)">Thick base — food lover</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Palm Line Depth</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.line_depth || ''}
                    onChange={(e) => updateVedicField('line_depth', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Light lines">Light / faint (easier)</option>
                    <option value="Normal">Normal depth</option>
                    <option value="Deep / dark lines (tough life)">Deep / dark (tough life)</option>
                  </select>
                </div>
              </div>
              {(vedicData.finger_gaps || vedicData.finger_build || vedicData.line_depth) && (
                <div className="p-3 bg-rose-50/40 border border-rose-200/30 rounded-xl text-xs space-y-1 leading-relaxed">
                  <span className="font-bold text-rose-900 uppercase tracking-wider block text-[9px]">General Profile Reading:</span>
                  <div className="space-y-1 text-[11px] text-stone-700 font-semibold">
                    {vedicData.finger_gaps === 'Small gaps (generous)' && <p>🤲 <strong>Small gaps:</strong> Generous — quick to help when someone asks. Gap is caused by one finger\'s base phalanx being sunken on one side. Also indicates spending (generosity and spending go together).</p>}
                    {vedicData.finger_gaps === 'Wide gaps (free spirit)' && <p>🌬️ <strong>Wide gaps:</strong> Works outside conventional social norms. Independent and unafraid of criticism. Free-spirited — does what they\'ve decided regardless of others\' opinions.</p>}
                    {vedicData.finger_build === 'Long & thin (creative)' && <p>🎨 <strong>Long &amp; thin:</strong> Creative individual. Less hard labor required — natural ability allows easier achievement.</p>}
                    {vedicData.finger_build === 'Short & thick (stubborn + anger)' && <p>⚠️ <strong>Short &amp; thick:</strong> Both stubbornness and anger increase together. Hasty/impulsive. Requires more hard work in life.</p>}
                    {vedicData.finger_build === 'Thick base (food lover / lazy)' && <p>🍲 <strong>Thick base:</strong> Enjoys cooking and eating well. Good at hospitality. Per classical texts, food-loving but may lean toward laziness.</p>}
                    {vedicData.line_depth === 'Deep / dark lines (tough life)' && <p>⚠️ <strong>Deep / dark lines:</strong> A hand with many deep lines is not considered favorable — it indicates a tough life. Deep portions along a single line correspond to phases of significant pressure in that area/timeframe.</p>}
                    {vedicData.line_depth === 'Light lines' && <p>✨ <strong>Light lines:</strong> Light portions along lines correspond to relatively easier phases of life. Generally a favorable indicator.</p>}
                  </div>
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

            {/* ─── DUAL HAND COMPARATIVE ANALYSIS — Lectures 01, 06, 22 ─── */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Activity className="w-4 h-4 text-purple-500" />
                Left vs. Right Hand Karmic Synthesis (Pūrvārjita vs. Gocara)
              </h4>
              <div className="p-3 bg-purple-50/70 border border-purple-200/50 rounded-xl text-xs space-y-1.5 leading-relaxed">
                <span className="font-bold text-purple-900 uppercase tracking-wider block text-[9px]">Classical Vedic Principle:</span>
                <p className="text-stone-700 text-[11px]">
                  <strong>Left Hand:</strong> Pūrvārjita Karma (Destiny brought at birth, genetic potential, unconscious foundation).<br />
                  <strong>Right Hand:</strong> Present Actions (Gocara &amp; Daśā, conscious choices, free will, self-effort).<br />
                  <span className="italic text-stone-500 text-[10px]">When lines/signs on the right hand are clearer or protected compared to the left, the individual is consciously overcoming past karmic burdens.</span>
                </p>
              </div>
              <div className="form-group">
                <label className="form-label text-xs">Comparative Observations &amp; Karmic Evolution</label>
                <textarea
                  className="form-input h-24 resize-none text-xs"
                  placeholder="e.g. Left hand shows broken fate line at age 28, but right hand shows continuous protective square and clear line. Self-effort overcame early domestic obstacles..."
                  value={vedicData.lh_vs_rh_notes || ''}
                  onChange={(e) => updateVedicField('lh_vs_rh_notes', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            NAILS TAB — Lectures 11 & 12 (full nail analysis)
        ═══════════════════════════════════════════════════════ */}
        {activeTab === 'nails' && (
          <div className="space-y-5">
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-3.5 text-xs leading-relaxed text-violet-800 font-medium">
              <span className="font-bold flex items-center gap-1.5 mb-1 text-sm">💅 Nails (Nakh) Analysis — Lectures 11 &amp; 12</span>
              Nails are the primary indicator of <strong>health</strong> in palmistry. Teachers method: combine nail length, width, and thickness — three independent axes — to build a combined reading. Use palm hand-type to modify nail reading.
            </div>

            {/* Nail Dimensions */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Activity className="w-4 h-4 text-violet-500" />
                Nail Dimensions (Three Independent Axes)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="form-group">
                  <label className="form-label text-xs">Length (Axis 1)</label>
                  <select className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.nail_length || ''}
                    onChange={(e) => updateVedicField('nail_length', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="Small/Short">Small/Short — Researcher, nitpicking</option>
                    <option value="Large/Long">Large/Long — Water-element, creative</option>
                    <option value="Medium">Medium — Balanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Width (Axis 2)</label>
                  <select className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.nail_width || ''}
                    onChange={(e) => updateVedicField('nail_width', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="Wide (Chauṛā)">Wide (Chauṛā) — Hardworking, assertive</option>
                    <option value="Narrow/Tight (Sankrā)">Narrow/Tight (Sankrā) — Timid, health issues</option>
                    <option value="Normal">Normal Width</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Thickness (Axis 3)</label>
                  <select className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.nail_thickness || ''}
                    onChange={(e) => updateVedicField('nail_thickness', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="Thick (Earth)">Thick (Earth) — Best type, stable</option>
                    <option value="Thin/Papery">Thin/Papery — Curls/breaks, low hemoglobin</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
              </div>

              {/* Combined reading */}
              {(vedicData.nail_length || vedicData.nail_width || vedicData.nail_thickness) && (
                <div className="p-3 bg-violet-50 border border-violet-200 rounded-xl text-xs space-y-1.5 leading-relaxed">
                  <span className="font-bold text-violet-900 uppercase tracking-wider block text-[9px]">Combined Nail Reading:</span>
                  <div className="space-y-1 text-[11px] text-stone-700 font-semibold">
                    {vedicData.nail_length === 'Small/Short' && <p>🔍 <strong>Small nail:</strong> Researcher/investigative mindset. Goes deep into subjects. Can become nitpicking. Alert/cautious, hardworking, blunt. May show impatience. Health: immune system concerns.</p>}
                    {vedicData.nail_length === 'Large/Long' && <p>💧 <strong>Long nail:</strong> Water-element — emotional, caring, sensitive, creative. Relaxed working pace. Prone to anxiety (harder to manage than small-nail anxiety).</p>}
                    {vedicData.nail_width === 'Wide (Chauṛā)' && <p>💪 <strong>Wide nail:</strong> Hardworking, sharp-minded but short-tempered, plain-spoken, adjustable. Tends to be thicker.</p>}
                    {vedicData.nail_width === 'Narrow/Tight (Sankrā)' && <p>⚠️ <strong>Narrow nail:</strong> Timidity, poor self-expression, high anxiety/stress. Strong health issue indicator — particularly immunity concerns.</p>}
                    {vedicData.nail_thickness === 'Thick (Earth)' && <p>🌍 <strong>Thick nail:</strong> Best overall type. Earth-element stability, discipline, responsibility, practicality. Values routine. Best when combined with wide nail.</p>}
                    {vedicData.nail_thickness === 'Thin/Papery' && <p>⚠️ <strong>Thin/Papery nail:</strong> Curls downward/upward or breaks repeatedly. Linked to low hemoglobin. Sensitivity (water hand) or irritability/temper (fire hand).</p>}
                    {/* Combinations */}
                    {vedicData.nail_length === 'Small/Short' && vedicData.nail_width === 'Wide (Chauṛā)' && <p>🔬 <strong>Small+Wide:</strong> Researcher + hardworking. Increased temper. Very determined.</p>}
                    {vedicData.nail_length === 'Small/Short' && vedicData.nail_thickness === 'Thin/Papery' && <p>🫁 <strong>Small+Thin (ALERT):</strong> Teacher observed this combination repeatedly with <em>throat disease, respiratory disease, TB, and lung issues</em>. Watch closely.</p>}
                    {vedicData.nail_length === 'Small/Short' && vedicData.nail_width === 'Narrow/Tight (Sankrā)' && <p>😶 <strong>Small+Narrow:</strong> Researcher who cannot present findings. Poor immunity. Timidity. If also clubbed thumb → dangerous aggression combination.</p>}
                    {vedicData.nail_length === 'Large/Long' && vedicData.nail_thickness === 'Thin/Papery' && <p>🩸 <strong>Long+Thin (WORST combination):</strong> Blood-related and hormonal issues. High irritability and emotional disturbance. Water element doubled.</p>}
                    {vedicData.nail_length === 'Large/Long' && vedicData.nail_thickness === 'Thick (Earth)' && <p>⚖️ <strong>Long+Thick:</strong> Methodical, stable, practical, disciplined. Balances emotional and practical. Increases emotional intensity in relationships (traditional texts).</p>}
                    {vedicData.nail_length === 'Small/Short' && vedicData.nail_thickness === 'Thick (Earth)' && <p>📋 <strong>Small+Thick:</strong> Physical labor + discipline + research depth. Sets timetables. Balances well with fire or airy hands.</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Nail Shape (from Lecture 12) */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Eye className="w-4 h-4 text-violet-500" />
                Nail Shape (Element Classification — Lecture 12)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label text-xs">Nail Shape Detail</label>
                  <select className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.nail_shape_detail || ''}
                    onChange={(e) => updateVedicField('nail_shape_detail', e.target.value)}>
                    <option value="">Select Shape...</option>
                    <option value="Square">Square (Earth — practical, stubborn)</option>
                    <option value="Round">Round (Air — investigative, philosophical)</option>
                    <option value="Conical/Tapered">Conical/Tapered (Water — emotional, sensitive)</option>
                    <option value="Spatulate">Spatulate (Fire — action-first, energetic)</option>
                    <option value="Spoon-shaped (Concave)">Spoon-shaped/Concave — health concern: thyroid, heart, anemia, liver</option>
                    <option value="Clubbed nail">Clubbed nail — severe disease indicator</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Nail Surface (Health)</label>
                  <select className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.nail_surface || ''}
                    onChange={(e) => updateVedicField('nail_surface', e.target.value)}>
                    <option value="">Select Surface...</option>
                    <option value="Smooth">Smooth — healthy</option>
                    <option value="Ridged/Vertical lines">Ridged/Vertical lines — check Jupiter sub-period</option>
                    <option value="Horizontal ridges (protein def)">Horizontal ridges — protein deficiency</option>
                    <option value="Spotted">Spotted / uneven</option>
                    <option value="Brittle/Breaks easily">Brittle/Breaks — thin papery type</option>
                  </select>
                </div>
              </div>
              {vedicData.nail_shape_detail === 'Spoon-shaped (Concave)' && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-900 font-semibold leading-relaxed">
                  ⚠️ <strong>Spoon-shaped nail:</strong> Not a good health sign. Indicates possible thyroid issues, heart disease, anemia, or liver conditions. Teacher recommends getting a liver check done. Timing of issue: confirm with heart line and life line islands.
                </div>
              )}
              {vedicData.nail_shape_detail === 'Clubbed nail' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 font-semibold leading-relaxed">
                  🚨 <strong>Clubbed nail:</strong> Serious disease indicator. Associated with severe diseases (including sexual diseases), lung problems/TB, stomach infection/inflammation, constipation, weak immunity, autoimmune diseases.
                </div>
              )}
            </div>

            {/* Nail Color & Chandramā (Lecture 12) */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Nail Color &amp; Chandramā (Health Indicators)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label text-xs">Nail Color (compare against palm skin)</label>
                  <select className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.nail_color || ''}
                    onChange={(e) => updateVedicField('nail_color', e.target.value)}>
                    <option value="">Select Color...</option>
                    <option value="Pink/Normal (Healthy)">Pink/Normal — Healthy baseline</option>
                    <option value="Pale/White">Pale/White — Possible anaemia</option>
                    <option value="Yellow (Liver/Health)">Yellow — Liver/health concern</option>
                    <option value="Blue/Purple (Serious)">Blue/Purple — Serious illness concern</option>
                    <option value="Reddish">Reddish — Heat/aggression</option>
                    <option value="White spots present">White spots — Wealth sign (traditional)</option>
                    <option value="Dark discoloration">Dark discoloration — Injury/cooking damage</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Chandramā (Lunula / Half-Moon)</label>
                  <select className="form-input bg-white border border-stone-200 text-xs"
                    value={vedicData.nail_lunula || ''}
                    onChange={(e) => updateVedicField('nail_lunula', e.target.value)}>
                    <option value="">Select Lunula...</option>
                    <option value="Visible on all fingers">Visible on all fingers — Good health</option>
                    <option value="Visible on some fingers">Visible on some fingers</option>
                    <option value="Absent (health concern)">Absent/Reduced — Health impact, possible stomach issues</option>
                  </select>
                </div>
              </div>
              {vedicData.nail_lunula === 'Absent (health concern)' && (
                <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg text-[11px] text-orange-800 font-semibold">
                  ⚠️ Lunula absence: generally associated with health impact. Teacher specifically noted stomach issues (not necessarily liver) in one case with Moon-sign Cancer and absent lunula.
                </div>
              )}
              <div className="form-group">
                <label className="form-label text-xs">Nail-biting habit?</label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-xs text-stone-700 mt-1">
                  <input type="checkbox" className="rounded text-accent-gold focus:ring-accent-gold"
                    checked={vedicData.nail_biting || false}
                    onChange={(e) => updateVedicField('nail_biting', e.target.checked)} />
                  <span>Nail-biting present (driven by tension — weakens root chakra: bone problems, security fears, lower back pain)</span>
                </label>
              </div>
              <div className="form-group">
                <label className="form-label text-xs">Specific Health Notes / Observations</label>
                <textarea className="form-input h-16 resize-none text-xs"
                  placeholder="e.g. vertical lines on Jupiter nail, Saturn nail looks square, thin nails on ring finger..."
                  value={vedicData.nail_health_flag || ''}
                  onChange={(e) => updateVedicField('nail_health_flag', e.target.value)} />
              </div>
            </div>

            {/* Palm Color (Note 04) */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <Smile className="w-4 h-4 text-pink-500" />
                Palm Skin Color (Note 04 — Diagnostic Sign)
              </h4>
              <div className="form-group">
                <label className="form-label text-xs">Palm Color</label>
                <select className="form-input bg-white border border-stone-200 text-xs"
                  value={vedicData.palm_color || ''}
                  onChange={(e) => updateVedicField('palm_color', e.target.value)}>
                  <option value="">Select Palm Color...</option>
                  <option value="Pinkish (Healthy)">Pinkish — Healthy baseline</option>
                  <option value="Pale/Whitish">Pale/Whitish — Low energy</option>
                  <option value="Yellow (health/liver)">Yellow tinge — Liver/health concern (get tested)</option>
                  <option value="Reddish (heat/aggression)">Reddish — Heat/aggression/Mars influence</option>
                  <option value="Blue/Purple tinge (serious illness)">Blue/Purple tinge — Serious illness concern</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            MOUNTS TAB — Lectures 13-18 (fully structured)
        ═══════════════════════════════════════════════════════ */}
        {activeTab === 'mounts' && (() => {
          const ALL_SIGNS = ['Star ⭐', 'Cross ✝', 'Square □', 'Triangle △', 'Island ◯', 'Dot •', 'Grille #', 'Mole', 'Fish 🐟', 'Flag', 'Trident ψ', 'Circle', 'Diamond Chain', 'Canopy (Circle at end)'];

          const MOUNT_CONFIGS = [
            {
              key: 'mount_jupiter' as const,
              label: 'Jupiter Mount (Guru Parvat)',
              emoji: '♃',
              color: 'indigo',
              location: 'Below index finger',
              normal: 'Knowledge, discernment, patience, spirituality, respect for elders, generosity, justice-loving, fortunate.',
              over: 'Over-developed: arrogance, repeated self-praise, belittles others, too-opinionated.',
              under: 'Under-developed: low ambition, poor self-confidence, avoids teaching or guiding.',
              signMeanings: {
                'Star ⭐': '⭐ Star on Jupiter: Good sign — multiple channels of name/fame arriving together.',
                'Cross ✝': '✝ Cross on Jupiter: Marriage sign (auspicious here). Also indicates education gains.',
                'Square □': '□ Square on Jupiter: Teaching capacity / strong protection from downfall.',
                'Triangle △': '△ Triangle on Jupiter: Scientific, research-oriented, diplomatic.',
                'Island ◯': '◯ Island on Jupiter: Struggle in knowledge/career for that period.',
                'Grille #': '# Grille: Excess ambition to the point of stress.',
                'Trident ψ': 'ψ Trident: Multiple paths of success coming together at Jupiter.',
              },
            },
            {
              key: 'mount_saturn' as const,
              label: 'Saturn Mount (Śani Parvat)',
              emoji: '♄',
              color: 'slate',
              location: 'Below middle finger',
              normal: 'Discipline, responsibility, karmic work, research, deep focus, solitude. Loves solitary, focused work.',
              over: 'Over-developed: excessive seriousness, melancholy, accident-prone, rigid.',
              under: 'Under-developed: irresponsible, avoids commitments, poor perseverance.',
              signMeanings: {
                'Star ⭐': '⭐ Star on Saturn: Mixed — accident or sudden event (read with fate line).',
                'Cross ✝': '✝ Cross on Saturn: Accident sign. Disease sign. Not auspicious here.',
                'Square □': '□ Square on Saturn: Protection from accidents/downfall.',
                'Triangle △': '△ Triangle on Saturn: Research/occult/metaphysical talent.',
              },
            },
            {
              key: 'mount_sun' as const,
              label: 'Sun Mount (Sūrya / Apollo Parvat)',
              emoji: '☀️',
              color: 'amber',
              location: 'Below ring finger',
              normal: 'Creative ability, fame, vivek (discernment), artistic talent, love of beauty, success in arts/media.',
              over: 'Over-developed: arrogance around fame, waste of creativity, showoff.',
              under: 'Under-developed: poor taste, lack of creative drive, difficulty gaining recognition.',
              signMeanings: {
                'Star ⭐': '⭐ Star on Sun: Sudden fame, unexpected recognition — auspicious.',
                'Cross ✝': '✝ Cross on Sun: Obstacle to fame/recognition, defamation risk.',
                'Square □': '□ Square on Sun: Protection of reputation/name.',
                'Triangle △': '△ Triangle on Sun: Scientific/artistic fame through structured work.',
                'Trident ψ': 'ψ Trident on Sun: Fame in 2+ domains (Sun + Saturn + Mercury streams).',
              },
            },
            {
              key: 'mount_mercury' as const,
              label: 'Mercury Mount (Budha Parvat)',
              emoji: '☿',
              color: 'teal',
              location: 'Below little finger',
              normal: 'Communication, business, diplomacy, speech, writing, science, trade, medicine.',
              over: 'Over-developed: dishonesty, cunning speech, deception for gain.',
              under: 'Under-developed: poor communication, business failures, difficulty with logic.',
              signMeanings: {
                'Star ⭐': '⭐ Star on Mercury: Mixed — clever speaker/researcher, but can indicate trickery.',
                'Cross ✝': '✝ Cross on Mercury: Business failure or communication trouble.',
                'Square □': '□ Square on Mercury: Protection in business/trade.',
                'Triangle △': '△ Triangle on Mercury: Scientific, medical, or diplomatic talent.',
                'Single vertical line': '| Single vertical line on Mercury: Sudden money gain sign.',
              },
            },
            {
              key: 'mount_moon' as const,
              label: 'Moon Mount (Chandra Parvat / Luna)',
              emoji: '🌙',
              color: 'blue',
              location: 'Inner lower base (percussion side)',
              normal: 'Imagination, intuition, creativity, emotional sensitivity, love of travel, poetry, music.',
              over: 'Over-developed: excessive fantasy, emotional instability, restlessness.',
              under: 'Under-developed: lack of imagination, rigid thinking, poor adaptability.',
              signMeanings: {
                'Star ⭐': '⭐ Star on Moon: Suicidal tendency or severe emotional crisis — serious warning.',
                'Cross ✝': '✝ Cross on Moon: Emotional turmoil, depression risk.',
                'Square □': '□ Square on Moon: Protection from drowning/emotional crises.',
                'Triangle △': '△ Triangle on Moon: Intuitive, psychic, or travel-related talent.',
              },
            },
            {
              key: 'mount_venus' as const,
              label: 'Venus Mount (Śukra Parvat)',
              emoji: '♀️',
              color: 'pink',
              location: 'Thumb base / thenar eminence',
              normal: 'Love, passion, vitality, generosity, beauty, family warmth, attraction, music, luxury.',
              over: 'Over-developed: excess sensuality, indulgence, possessiveness in relationships.',
              under: 'Under-developed: coldness, poor family bonds, lack of physical vitality.',
              signMeanings: {
                'Star ⭐': '⭐ Star on Venus: Multiple love affairs or fame connected to personal charisma.',
                'Cross ✝': '✝ Cross on Venus: Complicated love affair or relationship trouble.',
                'Square □': '□ Square on Venus: Protection in relationships.',
                'Triangle △': '△ Triangle on Venus: Cautious, controlled love life — diplomacy in relationships.',
                'Grille #': '# Grille on Venus: Excessive desires, multiple unfulfilled relationships.',
              },
            },
          ] as const;

          const getMount = (key: keyof typeof vedicData): MountSignData => {
            const existing = vedicData[key] as MountSignData | null;
            return existing || { height: '', apex: '', signs: [], quality: '', notes: '' };
          };

          const updateMount = (key: keyof typeof vedicData, field: keyof MountSignData, value: any) => {
            const current = getMount(key);
            updateVedicField(key, { ...current, [field]: value });
          };

          const toggleMountSign = (key: keyof typeof vedicData, sign: string) => {
            const current = getMount(key);
            const signs = current.signs.includes(sign)
              ? current.signs.filter((s) => s !== sign)
              : [...current.signs, sign];
            updateVedicField(key, { ...current, signs });
          };

          return (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 font-medium leading-relaxed">
                ⛰️ <strong>Mount reading order (teacher's method):</strong> Check height (raised/flat/over-built) → Find Apex → Check Apex direction → Read signs/symbols on mount → Cross-reference with lines.
              </div>

              {MOUNT_CONFIGS.map((mount) => {
                const mountData = getMount(mount.key as keyof typeof vedicData);
                const hasData = mountData.height || mountData.apex || mountData.signs.length > 0;
                return (
                  <div key={mount.key} className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
                    <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                      <span>{mount.emoji}</span>
                      {mount.label}
                      <span className="text-[10px] text-stone-400 font-normal ml-auto">{mount.location}</span>
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="form-group">
                        <label className="form-label text-xs">Height / Development</label>
                        <select className="form-input bg-white border border-stone-200 text-xs"
                          value={mountData.height}
                          onChange={(e) => updateMount(mount.key as any, 'height', e.target.value)}>
                          <option value="">Select...</option>
                          <option value="Raised">Raised / Normal-good</option>
                          <option value="Normal">Normal (average)</option>
                          <option value="Flat">Flat / Under-developed</option>
                          <option value="Very High / Overbuilt">Very High / Overbuilt</option>
                          <option value="Displaced/Shifted">Displaced / Shifted</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label text-xs">Apex Direction</label>
                        <select className="form-input bg-white border border-stone-200 text-xs"
                          value={mountData.apex}
                          onChange={(e) => updateMount(mount.key as any, 'apex', e.target.value)}>
                          <option value="">Select...</option>
                          <option value="Centered">Centered — Dominant planet</option>
                          <option value="Toward Jupiter">→ Jupiter</option>
                          <option value="Toward Saturn">→ Saturn</option>
                          <option value="Toward Sun">→ Sun</option>
                          <option value="Toward Mercury">→ Mercury</option>
                          <option value="Toward Moon">→ Moon</option>
                          <option value="Toward Venus">→ Venus</option>
                          <option value="Toward Mars">→ Mars</option>
                          <option value="Toward Thumb">→ Thumb (self)</option>
                          <option value="Toward Head Line">→ Head Line (intellect)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label text-xs">Mount Quality</label>
                        <select className="form-input bg-white border border-stone-200 text-xs"
                          value={mountData.quality}
                          onChange={(e) => updateMount(mount.key as any, 'quality', e.target.value)}>
                          <option value="">Select...</option>
                          <option value="Firm/Healthy">Firm/Healthy — springs back immediately</option>
                          <option value="Spongy (poor)">Spongy — returns slowly (poor sign)</option>
                          <option value="Flat/Pressed">Flat/Pressed — undeveloped</option>
                        </select>
                      </div>
                    </div>

                    {/* Signs checkboxes */}
                    <div>
                      <label className="form-label text-xs mb-1.5 block">Signs &amp; Symbols on Mount</label>
                      <div className="flex flex-wrap gap-2">
                        {ALL_SIGNS.map((sign) => (
                          <label key={sign} className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded-lg border text-[10px] font-semibold transition-all ${mountData.signs.includes(sign) ? 'bg-accent-gold text-white border-accent-gold' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-accent-gold/40'}`}>
                            <input type="checkbox" className="sr-only"
                              checked={mountData.signs.includes(sign)}
                              onChange={() => toggleMountSign(mount.key as any, sign)} />
                            {sign}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Mount interpretation */}
                    {(hasData || mountData.notes) && (
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-[11px] space-y-1.5 leading-relaxed">
                        {mountData.height === 'Raised' && <p className="text-stone-700 font-semibold">✨ <strong>Normal/Raised:</strong> {mount.normal}</p>}
                        {mountData.height === 'Very High / Overbuilt' && <p className="text-orange-700 font-semibold">⚠️ <strong>Over-developed:</strong> {mount.over}</p>}
                        {mountData.height === 'Flat' && <p className="text-rose-700 font-semibold">📉 <strong>Under-developed:</strong> {mount.under}</p>}
                        {mountData.apex === 'Centered' && <p className="text-stone-600 font-semibold">🎯 <strong>Centered Apex:</strong> This planet is the dominant influence on personality.</p>}
                        {mountData.quality === 'Spongy (poor)' && <p className="text-orange-700 font-semibold">⚠️ <strong>Spongy quality:</strong> Teacher says this is a poor sign — mount should return immediately like a mattress. Slow return = poor results from this mount.</p>}
                        {mountData.signs.map((sign) => {
                          const meaning = (mount.signMeanings as any)[sign];
                          return meaning ? <p key={sign} className="text-stone-600 font-semibold">{meaning}</p> : null;
                        })}
                      </div>
                    )}

                    <div className="form-group">
                      <textarea className="form-input h-16 resize-none text-xs"
                        placeholder="Additional mount observations..."
                        value={mountData.notes}
                        onChange={(e) => updateMount(mount.key as any, 'notes', e.target.value)} />
                    </div>
                  </div>
                );
              })}

              {/* Mars Mounts (Upper, Lower, Plain) */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                  ♂️ Mars Mounts &amp; Plain of Mars
                </h4>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium leading-relaxed">
                  <strong>Upper Mars</strong> (between Heart and Head lines, inner): Moral courage, mental fortitude, ability to withstand pressure.<br />
                  <strong>Lower Mars</strong> (outer, between Life and Head lines): Physical courage, aggression, action-taking.<br />
                  <strong>Plain of Mars</strong> (center of palm): The &quot;field&quot; where all planetary energies meet and play out in daily life.
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {(['mount_mars_upper', 'mount_mars_lower', 'mount_mars_plain'] as const).map((marsKey) => {
                    const label = marsKey === 'mount_mars_upper' ? 'Upper Mars (inner, moral courage)' : marsKey === 'mount_mars_lower' ? 'Lower Mars (outer, physical courage)' : 'Plain of Mars (center palm)';
                    const marsData = getMount(marsKey);
                    return (
                      <div key={marsKey} className="border border-stone-100 rounded-xl p-3 space-y-2">
                        <label className="form-label text-xs">{label}</label>
                        <div className="grid grid-cols-2 gap-2">
                          <select className="form-input bg-white border border-stone-200 text-xs"
                            value={marsData.height}
                            onChange={(e) => updateMount(marsKey, 'height', e.target.value)}>
                            <option value="">Height...</option>
                            <option value="Raised">Raised</option>
                            <option value="Normal">Normal</option>
                            <option value="Flat">Flat</option>
                            <option value="Very High / Overbuilt">Very High</option>
                          </select>
                          <div className="flex flex-wrap gap-1">
                            {['Star ⭐', 'Cross ✝', 'Square □', 'Triangle △', 'Island ◯'].map((sign) => (
                              <label key={sign} className={`flex items-center gap-0.5 cursor-pointer px-1.5 py-0.5 rounded border text-[9px] font-semibold transition-all ${marsData.signs.includes(sign) ? 'bg-rose-500 text-white border-rose-500' : 'bg-stone-50 text-stone-600 border-stone-200'}`}>
                                <input type="checkbox" className="sr-only"
                                  checked={marsData.signs.includes(sign)}
                                  onChange={() => toggleMountSign(marsKey, sign)} />
                                {sign}
                              </label>
                            ))}
                          </div>
                        </div>
                        {marsKey === 'mount_mars_lower' && marsData.signs.includes('Star ⭐') && (
                          <p className="text-[10px] text-rose-700 font-semibold">⭐ Star on Lower Mars: Accident risk or teenage/aggressive love affairs.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ═══════════════════════════════════════════════════════
            LINES TAB — Lectures 19-27 (fully structured)
        ═══════════════════════════════════════════════════════ */}
        {activeTab === 'lines' && (() => {
          const LINE_SIGNS = ['Star ⭐', 'Cross ✝', 'Square □', 'Triangle △', 'Island ◯', 'Dot •', 'Fish 🐟', 'Trident ψ', 'Diamond Chain', 'Canopy (Circle at end)', 'Flag', 'Mole', 'Grille #'];
          const LINE_FEATURES = ['Supportive parallel line', 'Parasite line (draining)', 'Upward branch', 'Downward branch', 'Fork at start', 'Fork at end (Trident)', 'Break', 'Chain section', 'Influence lines merging in', 'Cutting cross-line', 'Double line', 'Frayed/multiple threads'];

          const getLine = (key: keyof typeof vedicData): LineAnalysisData => {
            const existing = vedicData[key] as LineAnalysisData | null;
            return existing || { quality: '', origin: '', terminus: '', signs: [], features: [], age_events: [], notes: '' };
          };
          const updateLine = (key: keyof typeof vedicData, field: keyof LineAnalysisData, value: any) => {
            const current = getLine(key);
            updateVedicField(key, { ...current, [field]: value });
          };
          const toggleLineSign = (key: keyof typeof vedicData, sign: string) => {
            const current = getLine(key);
            const signs = current.signs.includes(sign) ? current.signs.filter((s) => s !== sign) : [...current.signs, sign];
            updateVedicField(key, { ...current, signs });
          };
          const toggleLineFeature = (key: keyof typeof vedicData, feat: string) => {
            const current = getLine(key);
            const features = current.features.includes(feat) ? current.features.filter((f) => f !== feat) : [...current.features, feat];
            updateVedicField(key, { ...current, features });
          };

          const LINE_CONFIGS = [
            {
              key: 'line_life' as const,
              label: 'Life Line (Jīvana Rekhā)',
              emoji: '❤️',
              origin_options: ['Starts from Jupiter mount area', 'Starts from between thumb and Jupiter', 'Starts very low (near wrist)'],
              terminus_options: ['Ends at Venus mount', 'Ends toward Moon mount', 'Ends mid-palm', 'Curves around thumb base', 'Short (ends at mid-palm)'],
              hint: 'All events of life show on the Life Line. Age counted from top (near Jupiter) downward — midpoint = age 30 (teacher\'s method).',
              signMeanings: {
                'Square □': '□ Square on Life Line: Protection period — square marks where the person was protected from an obstacle.',
                'Island ◯': '◯ Island on Life Line: Struggle for that entire duration of island.',
                'Star ⭐': '⭐ Star on Life Line: Sudden event or shock at that age.',
                'Cross ✝': '✝ Cross on Life Line: Obstacle, disease, or difficult event.',
                'Fish 🐟': '🐟 Fish on Life Line: Spiritual sign. Two-symbol indicator — very auspicious.',
                'Canopy (Circle at end)': '◯ Canopy at Life Line end: Whole life is protected, however many ups and downs occur.',
              },
            },
            {
              key: 'line_fate' as const,
              label: 'Fate Line (Bhāgya Rekhā / Dhana Rekhā)',
              emoji: '⚡',
              origin_options: ['From wrist/maṇibandha', 'From Moon mount', 'From Venus mount', 'From Life Line (mid-life start)', 'From Head Line (late start)', 'From Heart Line (very late)'],
              terminus_options: ['Ends at Saturn mount', 'Ends at Jupiter mount (ambition)', 'Ends at Head Line', 'Ends at Heart Line', 'Runs full length'],
              hint: 'Also called career line, wealth line. Age always counted from wrist (maṇibandha = age 0) upward, even if line starts higher. Late-starting fate line = career starts late.',
              signMeanings: {
                'Diamond Chain': '💎 Diamond Chain at end of Fate Line: Wish fulfilment — doubles the power of the fate line throughout life.',
                'Island ◯': '◯ Island: Career struggle / financial difficulty for that duration.',
                'Cross ✝': '✝ Cross: Career obstacle or sudden change.',
                'Square □': '□ Square: Protection — business/career protected during that phase.',
                'Star ⭐': '⭐ Star: Sudden career success or sudden downfall (read with other lines).',
                'Trident ψ': 'ψ Trident at end: Three channels of career success.',
              },
            },
            {
              key: 'line_head' as const,
              label: 'Head / Brain Line (Mastiṣka Rekhā)',
              emoji: '🧠',
              origin_options: ['Starts from Life Line (joined)', 'Starts independently from Jupiter area', 'Starts from Mars (inner)'],
              terminus_options: ['Ends at Saturn mount', 'Ends at Sun mount', 'Ends at Mercury mount', 'Ends at Moon mount (creative/imaginative)', 'Ends mid-palm'],
              hint: 'The base of the whole hand — manifestation tool. If thought process is strong, lines form. Also called: Mātṛ rekhā, Śīrṣa rekhā, Bhoga rekhā.',
              signMeanings: {
                'Island ◯': '◯ Island on Head Line: Mental struggle, tension, stress for that duration.',
                'Square □': '□ Square: Mental protection — thought process stabilized.',
                'Star ⭐': '⭐ Star: Sudden mental shock or breakthrough.',
                'Cross ✝': '✝ Cross: Mental conflict, accident, or head injury.',
              },
            },
            {
              key: 'line_heart' as const,
              label: 'Heart Line (Hṛidaya Rekhā)',
              emoji: '💖',
              origin_options: ['From Jupiter mount', 'From between Jupiter and Saturn', 'From Saturn mount', 'From upper Mars'],
              terminus_options: ['Ends at Mercury mount', 'Ends at Moon mount', 'Ends at percussion (outer edge)', 'Short (ends at Saturn)'],
              hint: 'Shows emotional life, relationships, and heart health. Age counted from Mercury side (little finger base) leftward: 18+6+18+6… method (teacher Method A).',
              signMeanings: {
                'Island ◯': '◯ Island: Emotional struggle or broken relationship for that duration.',
                'Cross ✝': '✝ Cross: Heartbreak or serious relationship obstacle.',
                'Square □': '□ Square: Emotional protection.',
                'Star ⭐': '⭐ Star: Sudden emotional event — can be positive or negative.',
              },
            },
            {
              key: 'line_sun' as const,
              label: 'Sun / Apollo Line (Sūrya Rekhā)',
              emoji: '☀️',
              origin_options: ['From Moon mount', 'From upper Mars', 'From Head Line', 'From Heart Line', 'From Life Line', 'From wrist/maṇibandha'],
              terminus_options: ['Ends at Sun mount', 'Short — ends before Sun mount', 'Reaches Heart Line only'],
              hint: 'Fame, recognition, success in creative fields. A Sun line starting from Moon mount = fame from public/mass appeal. Trident at end = 2+ domains of fame.',
              signMeanings: {
                'Diamond Chain': '💎 Diamond Chain at end of Sun Line: Wish fulfilment and doubled fame power.',
                'Trident ψ': 'ψ Trident at Sun Line end: Fame in 2+ ways simultaneously (Mercury + Saturn channels).',
                'Island ◯': '◯ Island: Setback/scandal in reputation for that period.',
                'Cross ✝': '✝ Cross: Obstacle or defamation in career/fame.',
                'Star ⭐': '⭐ Star: Sudden fame or recognition.',
                'Square □': '□ Square: Protection of reputation.',
              },
            },
          ] as const;

          return (
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 font-medium leading-relaxed">
                📖 <strong>Key Sign Rules (Notes 19-27):</strong> Cross on Jupiter = marriage/education (good). Cross elsewhere = disease/obstacle. Star on Moon = suicidal tendency. Square anywhere = protection. Island on any line = struggle for that duration. Diamond Chain at line end = wish fulfilment (doubles power).
              </div>

              {LINE_CONFIGS.map((line) => {
                const lineData = getLine(line.key as keyof typeof vedicData);
                return (
                  <div key={line.key} className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
                    <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                      <span>{line.emoji}</span>
                      {line.label}
                    </h4>
                    <p className="text-[10px] text-stone-500 leading-relaxed italic">{line.hint}</p>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="form-group">
                        <label className="form-label text-xs">Line Quality</label>
                        <select className="form-input bg-white border border-stone-200 text-xs"
                          value={lineData.quality}
                          onChange={(e) => updateLine(line.key as any, 'quality', e.target.value)}>
                          <option value="">Select...</option>
                          <option value="Normal">Normal / Good</option>
                          <option value="Faint/Thin">Faint/Thin</option>
                          <option value="Dark/Bleeding">Dark/Bleeding (difficult)</option>
                          <option value="Broken">Broken</option>
                          <option value="Wavy/Uneven">Wavy/Uneven</option>
                          <option value="Chain-like">Chain-like (struggle throughout)</option>
                          <option value="Double">Double line (very strong)</option>
                          <option value="Absent">Absent</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label text-xs">Origin Point</label>
                        <select className="form-input bg-white border border-stone-200 text-xs"
                          value={lineData.origin}
                          onChange={(e) => updateLine(line.key as any, 'origin', e.target.value)}>
                          <option value="">Select origin...</option>
                          {line.origin_options.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label text-xs">Terminus (Ending)</label>
                        <select className="form-input bg-white border border-stone-200 text-xs"
                          value={lineData.terminus}
                          onChange={(e) => updateLine(line.key as any, 'terminus', e.target.value)}>
                          <option value="">Select terminus...</option>
                          {line.terminus_options.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Signs */}
                    <div>
                      <label className="form-label text-xs mb-1.5 block">Signs on this Line</label>
                      <div className="flex flex-wrap gap-1.5">
                        {LINE_SIGNS.map((sign) => (
                          <label key={sign} className={`flex items-center gap-0.5 cursor-pointer px-2 py-1 rounded-lg border text-[10px] font-semibold transition-all ${lineData.signs.includes(sign) ? 'bg-accent-gold text-white border-accent-gold' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-accent-gold/40'}`}>
                            <input type="checkbox" className="sr-only"
                              checked={lineData.signs.includes(sign)}
                              onChange={() => toggleLineSign(line.key as any, sign)} />
                            {sign}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Structural features */}
                    <div>
                      <label className="form-label text-xs mb-1.5 block">Structural Features</label>
                      <div className="flex flex-wrap gap-1.5">
                        {LINE_FEATURES.map((feat) => (
                          <label key={feat} className={`flex items-center gap-0.5 cursor-pointer px-2 py-1 rounded-lg border text-[10px] font-semibold transition-all ${lineData.features.includes(feat) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-emerald-400'}`}>
                            <input type="checkbox" className="sr-only"
                              checked={lineData.features.includes(feat)}
                              onChange={() => toggleLineFeature(line.key as any, feat)} />
                            {feat}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Interpretation */}
                    {(lineData.quality || lineData.signs.length > 0 || lineData.features.length > 0) && (
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-[11px] space-y-1 leading-relaxed">
                        {lineData.quality === 'Absent' && <p className="text-rose-700 font-semibold">⚠️ <strong>Line Absent:</strong> {line.key === 'line_fate' ? 'No defined career path or life direction. Person lives without clear karma drive.' : line.key === 'line_sun' ? 'Fame and recognition do not come easily. Success still possible via other lines.' : 'Unusual — note other compensating factors.'}</p>}
                        {lineData.quality === 'Double' && <p className="text-emerald-700 font-semibold">✨ <strong>Double line:</strong> Very strong energy in this area. Acts as a sister/support line.</p>}
                        {lineData.quality === 'Chain-like' && <p className="text-orange-700 font-semibold">⚠️ <strong>Chain-like:</strong> Struggle throughout the entire duration represented by this line.</p>}
                        {lineData.features.includes('Supportive parallel line') && <p className="text-emerald-700 font-semibold">✨ <strong>Supportive parallel line:</strong> Strength and recovery available. Doubles the energy of the main line.</p>}
                        {lineData.features.includes('Parasite line (draining)') && <p className="text-rose-700 font-semibold">⚠️ <strong>Parasite line:</strong> Energy being drained from this line. Indicates obligations or relationships that take more than they give.</p>}
                        {lineData.features.includes('Fork at end (Trident)') && <p className="text-emerald-700 font-semibold">✨ <strong>Fork/Trident at end:</strong> Energy divides into 2-3 channels — multiple areas of success or achievement.</p>}
                        {lineData.signs.map((sign) => {
                          const meaning = (line.signMeanings as any)[sign];
                          return meaning ? <p key={sign} className="text-stone-700 font-semibold">{meaning}</p> : null;
                        })}
                      </div>
                    )}

                    <div className="form-group">
                      <textarea className="form-input h-16 resize-none text-xs"
                        placeholder="Additional observations for this line..."
                        value={lineData.notes}
                        onChange={(e) => updateLine(line.key as any, 'notes', e.target.value)} />
                    </div>
                  </div>
                );
              })}

              {/* Mercury / Health Line (Note 27) */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                  ☿ Mercury / Health Line (Budha Rekhā — Note 27 dedicated lecture)
                </h4>
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 font-medium leading-relaxed">
                  <strong>Key rule:</strong> Absence of Mercury line = better than its presence. Its presence shows health/business fluctuation. When present, character depends entirely on its origin and path.
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Mercury Line Present?</label>
                  <div className="flex gap-3 mt-1">
                    {(['Absent (better)', 'Present'] as const).map((opt) => {
                      const isAbsent = opt === 'Absent (better)';
                      const current = vedicData.line_mercury_present;
                      const isSelected = isAbsent ? current === false : current === true;
                      return (
                        <label key={opt} className={`flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${isSelected ? (isAbsent ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-orange-500 text-white border-orange-500') : 'bg-stone-50 text-stone-600 border-stone-200'}`}>
                          <input type="radio" className="sr-only"
                            checked={isSelected}
                            onChange={() => updateVedicField('line_mercury_present', isAbsent ? false : true)} />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {vedicData.line_mercury_present === true && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="form-label text-xs">Mercury Line Characteristics (check all that apply)</label>
                      {[
                        { key: 'line_mercury_starts_below_heart' as const, label: 'Starts below Heart Line → health problems', color: 'rose' },
                        { key: 'line_mercury_starts_above_heart' as const, label: 'Starts only above Heart Line → healer / business line (good)', color: 'emerald' },
                        { key: 'line_mercury_joins_moon' as const, label: 'Runs Moon → Mercury mount = Intuition Line (premonition ability)', color: 'blue' },
                        { key: 'line_mercury_single_vertical' as const, label: 'Single vertical line on Mercury mount only = sudden money gain', color: 'amber' },
                      ].map(({ key, label, color }) => (
                        <label key={key} className={`flex items-start gap-2 cursor-pointer font-medium text-xs text-stone-700 p-2 rounded-lg border ${(vedicData[key] as boolean) ? `bg-${color}-50 border-${color}-200 text-${color}-800` : 'bg-stone-50 border-stone-200'}`}>
                          <input type="checkbox" className="rounded text-accent-gold focus:ring-accent-gold mt-0.5"
                            checked={(vedicData[key] as boolean) || false}
                            onChange={(e) => updateVedicField(key, e.target.checked)} />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="form-group">
                      <textarea className="form-input h-16 resize-none text-xs"
                        placeholder="Mercury line notes — path, signs, any cuts or islands..."
                        value={(vedicData.line_mercury_data as LineAnalysisData | null)?.notes || ''}
                        onChange={(e) => {
                          const current = (vedicData.line_mercury_data as LineAnalysisData | null) || { quality: '', origin: '', terminus: '', signs: [], features: [], age_events: [], notes: '' };
                          updateVedicField('line_mercury_data', { ...current, notes: e.target.value });
                        }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Special Yogas (Notes 19-27) */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                  ✨ Special Yogas &amp; Combined Signs (Notes 19-27)
                </h4>
                <div className="space-y-2 text-xs">
                  {[
                    { label: 'Mahābhāgya Yoga', desc: 'Life + Fate + Mercury + Sun lines all connect / come from one origin point — everything in life.' },
                    { label: 'Money Room (Dhana Koṭhī)', desc: 'Triangle formed by Fate Line + Head Line + Mercury Line — wealth accumulation sign.' },
                    { label: 'Pūrva-puṇya Rekhā', desc: 'Mars area → Sun line = courage, creativity, research from past-life merits.' },
                    { label: 'Mystic Cross', desc: 'Cross in Plain of Mars between Head and Heart lines = occult/spiritual wisdom.' },
                  ].map(({ label, desc }) => {
                    const tagKey = label.toLowerCase().replace(/[^a-z0-9]/g, '-');
                    const isPresent = profile.tags.includes(tagKey);
                    return (
                      <label key={label} className={`flex items-start gap-2 cursor-pointer p-2 rounded-lg border transition-all ${isPresent ? 'bg-amber-50 border-accent-gold/60 text-stone-800' : 'bg-stone-50 border-stone-200 text-stone-600'}`}>
                        <input type="checkbox" className="rounded text-accent-gold focus:ring-accent-gold mt-0.5"
                          checked={isPresent}
                          onChange={(e) => {
                            const newTags = e.target.checked
                              ? [...profile.tags, tagKey]
                              : profile.tags.filter((t) => t !== tagKey);
                            updateProfileField('tags', newTags);
                          }} />
                        <div>
                          <span className="font-bold text-stone-800">{label}:</span>
                          <span className="ml-1 text-stone-600">{desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Left vs Right comparison */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-sm">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                  🤲 Left vs Right Hand Comparison (Notes 01, 06, 22)
                </h4>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 font-medium leading-relaxed">
                  <strong>Left hand (pūrvārjita karma):</strong> What was brought at birth — destiny, inherited patterns.<br />
                  <strong>Right hand (active/gocara):</strong> What effort produces — current karma, what is changing (rekhā changes every 2-3 months with active use).
                </div>
                <div className="form-group">
                  <textarea className="form-input h-20 resize-none text-xs"
                    placeholder="Note key differences between left and right hands. e.g. 'Left has fate line from moon mount, right has fate line from life line — destiny shifted through own effort.'"
                    value={vedicData.lh_vs_rh_notes || ''}
                    onChange={(e) => updateVedicField('lh_vs_rh_notes', e.target.value)} />
                </div>
              </div>
            </div>
          );
        })()}

        {/* ═══════════════════════════════════════════════════════
            AGE CALCULATOR TAB — Lectures 20, 22, 27
        ═══════════════════════════════════════════════════════ */}
        {activeTab === 'age' && (
          <div className="space-y-5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 font-medium leading-relaxed">
              🕒 <strong>Age Calculation — 4 Methods (Lectures 20, 22, 27)</strong><br />
              The teacher teaches four distinct methods. The <strong>30-midpoint</strong> method is currently used in class.
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
                    label: '30-Midpoint Method (Current class method)',
                    desc: 'Midpoint of Life Line = age 30. Upper half: 0→30 (halved again for 15). Lower half: 30→75 (halved for 52.5). Fate Line: same scale from wrist (age 0). Heart Line: Method A — 18+6+18+6…',
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
                    {[['Wrist (maṇibandha)', '0'], ['Head Line crossing', '~35'], ['Heart Line crossing', '~50'], ['Saturn mount', '~70+']].map(([pos, age]) => (
                      <div key={pos} className="flex justify-between text-stone-700 font-semibold">
                        <span>{pos}</span><span className="text-blue-600">{age}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
                  <strong>Heart Line (Method A):</strong> Start counting from little finger side. First section = 18 years. Gap = 6 years. Next section = 18 years. Continue: 18+6+18+6… until end of line.
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
                return (
                  <div key={lineKey} className="border border-stone-100 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-700">{lineLabels[lineKey]}</span>
                      <button type="button"
                        className="text-[10px] btn-gold px-2 py-0.5 shadow-sm"
                        onClick={() => {
                          const events = [...(lineData.age_events || []), { age: 0, event: '' }];
                          updateVedicField(lineKey, { ...lineData, age_events: events });
                        }}>
                        + Add Event
                      </button>
                    </div>
                    {(lineData.age_events || []).map((evt, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input type="number" min="0" max="120"
                          className="form-input text-xs w-20 shrink-0"
                          placeholder="Age"
                          value={evt.age || ''}
                          onChange={(e) => {
                            const events = [...lineData.age_events];
                            events[idx] = { ...events[idx], age: parseInt(e.target.value) || 0 };
                            updateVedicField(lineKey, { ...lineData, age_events: events });
                          }} />
                        <input type="text"
                          className="form-input text-xs flex-1"
                          placeholder="Event / sign observed (e.g. island 25-32, star at 40)"
                          value={evt.event || ''}
                          onChange={(e) => {
                            const events = [...lineData.age_events];
                            events[idx] = { ...events[idx], event: e.target.value };
                            updateVedicField(lineKey, { ...lineData, age_events: events });
                          }} />
                        <button type="button"
                          className="text-rose-500 hover:text-rose-700 text-xs p-1 shrink-0"
                          onClick={() => {
                            const events = lineData.age_events.filter((_, i) => i !== idx);
                            updateVedicField(lineKey, { ...lineData, age_events: events });
                          }}>✕</button>
                      </div>
                    ))}
                    {(lineData.age_events || []).length === 0 && (
                      <p className="text-[10px] text-stone-400 italic">No events logged. Click &quot;+ Add Event&quot; to begin.</p>
                    )}
                  </div>
                );
              })}
            </div>
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
              <button type="submit" className="btn-gold px-3 text-xs shadow-sm cursor-pointer">
                Add
              </button>
            </form>

            {/* Suggested Tags based on Sāmudrika rules */}
            {(() => {
              const suggestions: string[] = [];
              if (vedicData.hand_tattva) {
                if (vedicData.hand_tattva.includes('Agni')) suggestions.push('fire-hand', 'mars-sun-traits');
                if (vedicData.hand_tattva.includes('Jala')) suggestions.push('water-hand', 'sensitive-mind');
                if (vedicData.hand_tattva.includes('Pṛthvī')) suggestions.push('earth-hand', 'generational-planner');
                if (vedicData.hand_tattva.includes('Vāyu')) suggestions.push('air-hand', 'investigator');
              }
              if (vedicData.thumb_type) {
                if (vedicData.thumb_type === 'Waist-like') suggestions.push('diplomat', 'waist-like-thumb');
                if (vedicData.thumb_type === 'Stiff') suggestions.push('rigid-thumb', 'plain-spoken');
                if (vedicData.thumb_type === 'Very Flexible') suggestions.push('flexible-thumb', 'spendthrift');
              }
              if (vedicData.thumb_second_phalange === 'Long (over-thinker)') {
                suggestions.push('over-thinker');
              }
              if (vedicData.has_clubbed_thumb) {
                suggestions.push('clubbed-thumb', 'quick-temper');
              }
              if (vedicData.has_six_fingers) {
                suggestions.push('polydactyly', 'struggle-filled');
              }
              if (vedicData.jupiter_length === 'Long') {
                suggestions.push('authoritative-ego', 'teacher-profile');
              }
              if (vedicData.mercury_length === 'Long') {
                suggestions.push('diplomatic-speech', 'researcher');
              }
              if (vedicData.mercury_tilt === 'Separated from Sun') {
                suggestions.push('independent-mind', 'rule-breaker');
              }
              if (vedicData.finger_knots === 'Fully Philosophical (Knotty)') {
                suggestions.push('philosophical', 'message-deliverer');
              }
              if (vedicData.line_depth && vedicData.line_depth.includes('Deep')) {
                suggestions.push('struggle-lines');
              }

              const filteredSuggestions = suggestions.filter(s => !profile.tags.includes(s));
              if (filteredSuggestions.length === 0) return null;

              return (
                <div className="space-y-1.5 border-t border-stone-100 pt-3">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Suggested Tags (Click to Add):</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {filteredSuggestions.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => updateProfileField('tags', [...profile.tags, tag])}
                        className="bg-stone-50 hover:bg-amber-500/10 text-stone-600 hover:text-accent-gold px-2 py-0.5 rounded text-[10px] font-semibold border border-stone-200 hover:border-amber-500/20 transition-all cursor-pointer"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

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
                    className="hover:text-rose-600 font-bold transition-colors ml-1 text-xs cursor-pointer"
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

        {/* ═══════════════════════════════════════════════════════
            SYNTHESIS REPORT TAB — Comprehensive Consultation Summary
        ═══════════════════════════════════════════════════════ */}
        {activeTab === 'report' && (() => {
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

          // Identify classical Vedic yogas
          const detectedYogas: Array<{ name: string; icon: string; desc: string }> = [];
          if (vedicData.line_life?.features?.includes('Supportive / Mars Line (Devata Raksha)')) {
            detectedYogas.push({ name: 'Devatā Rakṣā Yoga', icon: '🛡️', desc: 'Mars guardian line shields the native from grave physical injury and life crises.' });
          }
          if (vedicData.line_head?.features?.includes('Writer\'s Fork (Fork at end)')) {
            detectedYogas.push({ name: 'Lekhaka / Kalā Yoga', icon: '✍️', desc: 'Writer\'s fork on head line harmonizes creative moon imagination with practical mars logic.' });
          }
          if (vedicData.mount_jupiter?.signs?.includes('Cross')) {
            detectedYogas.push({ name: 'Bṛhaspati Vivāha Yoga', icon: '💍', desc: 'Cross on Jupiter mount — noble education, harmonious marriage and spousal support.' });
          }
          if (vedicData.mount_jupiter?.signs?.includes('Square')) {
            detectedYogas.push({ name: 'Guru Upadeśaka Yoga', icon: '🏫', desc: 'Teacher\'s square on Jupiter — instructional authority and protection from slander.' });
          }
          if (vedicData.mount_sun?.signs?.includes('Trident')) {
            detectedYogas.push({ name: 'Sūrya Triśūla Yoga', icon: '🔱', desc: 'Trident on Sun mount — three-fold fame across arts, commerce, and relentless effort.' });
          }
          if (vedicData.mount_sun?.signs?.includes('Diamond Chain') || vedicData.line_fate?.signs?.includes('Diamond Chain at end')) {
            detectedYogas.push({ name: 'Manokāmanā Pūrti Yoga', icon: '💎', desc: 'Diamond chain — doubles line energy and guarantees realization of cherished ambitions.' });
          }
          if (vedicData.mount_sun?.signs?.includes('Canopy / Circle')) {
            detectedYogas.push({ name: 'Chatra Yoga (Canopy of Honor)', icon: '👑', desc: 'Circle / canopy on Sun — lifetime immunity against public disgrace and regal protection.' });
          }
          if (vedicData.line_mercury_present === true && vedicData.line_mercury_joins_moon) {
            detectedYogas.push({ name: 'Aindriyā Jñāna Yoga', icon: '👁️', desc: 'Line of Intuition to Moon — heightened prophetic dreams, sharp sixth sense.' });
          }
          if (vedicData.line_mercury_single_vertical) {
            detectedYogas.push({ name: 'Dhana Lābha Rekhā', icon: '💰', desc: 'Single vertical line on Mercury mount indicates sudden windfalls and commercial profit.' });
          }
          if (vedicData.line_fate && vedicData.line_head && vedicData.line_mercury_present === true) {
            detectedYogas.push({ name: 'Dhana kī Koṭhī (Money Room)', icon: '🏛️', desc: 'Triangle formed by Fate, Head, and Mercury lines — supreme capacity to store and multiply wealth.' });
          }

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
                      onClick={handlePrint}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-semibold shadow-sm hover:bg-stone-50 transition-all cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-stone-500" />
                      <span>Print / PDF</span>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {detectedYogas.map((y, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-amber-200/50 shadow-sm flex items-start gap-2.5">
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
                    { key: 'mount_mars_upper', label: 'Upper Mars (Inner Courage)' },
                    { key: 'mount_mars_lower', label: 'Lower Mars (Aggression)' },
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
                        Status: <strong>{vedicData.line_mercury_present ? 'Present' : 'Absent (classical indicator of robust stamina & health)'}</strong>
                      </p>
                      {vedicData.line_mercury_starts_below_heart && <p className="text-[11px] text-amber-700">• Starts below Heart Line (digestive/liver focus advised)</p>}
                      {vedicData.line_mercury_starts_above_heart && <p className="text-[11px] text-teal-700">• Starts above Heart Line (healer / counselor / business acuity)</p>}
                      {vedicData.line_mercury_joins_moon && <p className="text-[11px] text-purple-700">• Line of Intuition: Reaches Moon Mount</p>}
                      {vedicData.line_mercury_single_vertical && <p className="text-[11px] text-emerald-700">• Single vertical line: Dhana Lābha (sudden windfall sign)</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 6: Chronological Life Timeline */}
              {chronologicalEvents.length > 0 && (
                <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3 shadow-sm">
                  <h4 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    6. Chronological Life Timeline &amp; Age Milestones (Lectures 20, 22, 27)
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
              {profile.general_notes && (
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-2 shadow-sm">
                  <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-stone-600" />
                    8. Practitioner&apos;s Consultation Notes &amp; Remedial Observations
                  </h4>
                  <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-wrap">{profile.general_notes}</p>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
