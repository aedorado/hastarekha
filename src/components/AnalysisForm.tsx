'use client';

import React, { useState, useEffect } from 'react';
import {
  HandProfile,
  Pin,
  HandView,
  VedicData,
} from '@/types/palmistry';
import { parseVedicData, serializeVedicData } from '@/lib/vedicSerializer';
import { getDetectedYogas } from '@/lib/yogaDetector';
import { generateReportMarkdown } from '@/lib/reportGenerator';
import PrintReportModal from './PrintReportModal';

// Re-export helpers for backwards compatibility
export { getDetectedYogas } from '@/lib/yogaDetector';
export { generateReportMarkdown } from '@/lib/reportGenerator';

// Modular Tabs
import ProfileTab from './analysis/tabs/ProfileTab';
import SamudrikaTab from './analysis/tabs/SamudrikaTab';
import NailsTab from './analysis/tabs/NailsTab';
import MountsTab from './analysis/tabs/MountsTab';
import LinesTab from './analysis/tabs/LinesTab';
import AgeTab from './analysis/tabs/AgeTab';
import PinsTab from './analysis/tabs/PinsTab';
import TagsTab from './analysis/tabs/TagsTab';
import ReportTab from './analysis/tabs/ReportTab';

import {
  Check,
  Sparkles,
  Activity,
  FileText,
  Clock,
  User,
  Mountain,
  Compass,
  MapPin,
  Tag,
} from 'lucide-react';

export type AnalysisTabId =
  | 'profile'
  | 'samudrika'
  | 'nails'
  | 'mounts'
  | 'lines'
  | 'age'
  | 'pins'
  | 'tags'
  | 'report';

export interface AnalysisFormProps {
  profile: HandProfile;
  onChangeProfile: (profile: HandProfile) => void;
  selectedPin: Pin | null;
  onSelectPin?: (pin: Pin | null) => void;
  onUpdatePin: (pin: Pin) => void;
  onDeletePin: (pinId: string) => void;
  onSave: () => void;
  isSaving: boolean;
  onUploadImageForView: (view: HandView | 'd1_chart', file: File) => Promise<void>;
  isUploading: boolean;
  hasChanges: boolean;
  onChangeActiveView?: (view: HandView) => void;
  activeView?: HandView;
}

export default function AnalysisForm({
  profile,
  onChangeProfile,
  selectedPin,
  onSelectPin,
  onUpdatePin,
  onDeletePin,
  onSave,
  isSaving,
  onUploadImageForView,
  isUploading,
  hasChanges,
  onChangeActiveView,
  activeView,
}: AnalysisFormProps) {
  const [activeTab, setActiveTab] = useState<AnalysisTabId>('profile');
  const [newTag, setNewTag] = useState('');
  const [copiedReport, setCopiedReport] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Parse current VedicData
  const vedicData = parseVedicData(profile.general_notes);

  const updateVedicField = (key: keyof VedicData, value: any) => {
    const updatedVedic = {
      ...vedicData,
      [key]: value,
    };

    // Auto-classify Hand Type if palm_shape, palm_length, palm_width, or finger_length changes
    if (
      key === 'palm_shape' ||
      key === 'palm_length' ||
      key === 'palm_width' ||
      key === 'finger_length'
    ) {
      const palmLen = key === 'palm_length' ? value : vedicData.palm_length || 10.0;
      const palmWidth = key === 'palm_width' ? value : vedicData.palm_width || 0.0;
      const fingerLen = key === 'finger_length' ? value : vedicData.finger_length || 0.0;

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
        } else {
          // Square
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
  const mountsEvaluatedCount =
    [
      vedicData.mount_jupiter,
      vedicData.mount_saturn,
      vedicData.mount_sun,
      vedicData.mount_mercury,
      vedicData.mount_moon,
      vedicData.mount_venus,
      vedicData.mount_mars_upper,
      vedicData.mount_mars_lower,
      vedicData.mount_ketu,
    ].filter(Boolean).length ||
    Object.keys(profile.mounts_data || {}).filter(
      (k) => profile.mounts_data[k] && profile.mounts_data[k].trim() !== ''
    ).length;

  const linesEvaluatedCount =
    [
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

  const detectedYogas = getDetectedYogas(vedicData);

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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer ${
                isActive
                  ? t.isSpecial
                    ? 'bg-amber-500 text-white shadow-sm ring-1 ring-amber-600/30 font-bold'
                    : 'bg-white text-stone-900 shadow-sm border border-stone-200/80 font-bold'
                  : t.isSpecial
                  ? 'bg-amber-500/10 text-accent-gold hover:bg-amber-500/20 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              } ${t.highlight ? 'ring-2 ring-accent-gold ring-offset-1 font-bold' : ''}`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive && !t.isSpecial ? 'text-accent-gold' : ''}`} />
              <span>{t.label}</span>
              {t.hasDot && !t.count && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold inline-block" />
              )}
              {typeof t.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? t.isSpecial
                        ? 'bg-white text-amber-600'
                        : 'bg-accent-gold text-white'
                      : 'bg-stone-200/80 text-stone-600'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {activeTab === 'profile' && (
          <ProfileTab
            profile={profile}
            onChangeProfile={onChangeProfile}
            vedicData={vedicData}
            updateVedicField={updateVedicField}
            updateProfileField={updateProfileField}
            onUploadImageForView={onUploadImageForView}
            isUploading={isUploading}
            activeView={activeView}
            onChangeActiveView={onChangeActiveView}
          />
        )}

        {activeTab === 'samudrika' && (
          <SamudrikaTab
            profile={profile}
            updateProfileField={updateProfileField}
            vedicData={vedicData}
            updateVedicField={updateVedicField}
          />
        )}

        {activeTab === 'nails' && (
          <NailsTab
            vedicData={vedicData}
            updateVedicField={updateVedicField}
          />
        )}

        {activeTab === 'mounts' && (
          <MountsTab
            vedicData={vedicData}
            updateVedicField={updateVedicField}
            profile={profile}
            updateMountField={updateMountField}
          />
        )}

        {activeTab === 'lines' && (
          <LinesTab
            vedicData={vedicData}
            updateVedicField={updateVedicField}
            profile={profile}
            updateLineField={updateLineField}
            updateProfileField={updateProfileField}
          />
        )}

        {activeTab === 'age' && (
          <AgeTab
            vedicData={vedicData}
            updateVedicField={updateVedicField}
            profile={profile}
          />
        )}

        {activeTab === 'pins' && (
          <PinsTab
            profile={profile}
            selectedPin={selectedPin}
            onSelectPin={onSelectPin}
            onUpdatePin={onUpdatePin}
            onDeletePin={onDeletePin}
            onChangeActiveView={onChangeActiveView}
          />
        )}

        {activeTab === 'tags' && (
          <TagsTab
            profile={profile}
            updateProfileField={updateProfileField}
            vedicData={vedicData}
            updateVedicField={updateVedicField}
            newTag={newTag}
            setNewTag={setNewTag}
            handleAddTag={handleAddTag}
            handleRemoveTag={handleRemoveTag}
            detectedYogas={detectedYogas}
          />
        )}

        {activeTab === 'report' && (
          <ReportTab
            profile={profile}
            vedicData={vedicData}
            detectedYogas={detectedYogas}
            generateReportMarkdown={generateReportMarkdown}
            copiedReport={copiedReport}
            setCopiedReport={setCopiedReport}
            onOpenPrintModal={() => setShowPrintModal(true)}
          />
        )}
      </div>

      {/* Official Printable Consultation Report Modal */}
      <PrintReportModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        profile={profile}
        vedicData={vedicData}
        detectedYogas={detectedYogas}
        generateReportMarkdown={generateReportMarkdown}
      />
    </div>
  );
}
