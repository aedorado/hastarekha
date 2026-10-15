'use client';

import React, { useState, useEffect } from 'react';
import { HandProfile, HandView, HAND_VIEW_LABELS, VedicData } from '@/types/palmistry';
import { calculateAge } from '@/lib/supabase';
import { UploadCloud, Timer, CheckSquare, Info } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import { useAdmin } from '@/context/AdminContext';

interface ProfileTabProps {
  profile: HandProfile;
  onChangeProfile: (profile: HandProfile) => void;
  vedicData: VedicData;
  updateVedicField: (key: keyof VedicData, value: any) => void;
  updateProfileField: (key: keyof HandProfile, value: any) => void;
  onUploadImageForView: (view: HandView | 'd1_chart', file: File) => Promise<void>;
  isUploading: boolean;
  activeView?: HandView;
  onChangeActiveView?: (view: HandView) => void;
}

export default function ProfileTab({
  profile,
  onChangeProfile,
  vedicData,
  updateVedicField,
  updateProfileField,
  onUploadImageForView,
  isUploading,
  activeView,
  onChangeActiveView,
}: ProfileTabProps) {
  const { isAdmin } = useAdmin();
  const [photoToRemove, setPhotoToRemove] = useState<HandView | null>(null);

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
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev !== null ? prev - 1 : 0));
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
      setTimerSeconds(null);
      setChecklist((prev) => ({ ...prev, restingWaited: true }));
      alert(
        '⏱️ Resting period complete! Hands have returned to their natural resting state. Skin color and temperature can now be examined accurately without false indicators.'
      );
    }
    return () => {
      if (interval) clearInterval(interval);
    };
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

  const handleConfirmRemovePhoto = () => {
    if (photoToRemove) {
      const newImages = { ...profile.images };
      delete newImages[photoToRemove];
      onChangeProfile({
        ...profile,
        images: newImages,
      });
      setPhotoToRemove(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="form-group">
        <label className="form-label">
          Subject Identifier / Name <span className="text-rose-500">*</span>
        </label>
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
            <span className="font-bold">Sāmudrika Rule:</span> Do not read the hand of a child below 12 years. The
            thought process is still developing, and patterns have not settled.
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
          {(['right_palm', 'right_back', 'left_palm', 'left_back'] as const).map((view) => {
            const url = profile.images[view];
            const isActive = activeView === view;
            return (
              <div
                key={view}
                onClick={() => {
                  if (url && onChangeActiveView) {
                    onChangeActiveView(view);
                  }
                }}
                className={`border rounded-lg p-2 text-center flex flex-col justify-between h-28 relative transition-all ${
                  isActive
                    ? 'border-accent-gold ring-2 ring-accent-gold/30 bg-amber-50/40 shadow-xs'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100/80'
                } ${url && onChangeActiveView ? 'cursor-pointer' : ''}`}
              >
                <span
                  className={`text-[10px] font-bold block truncate mb-1 ${
                    isActive ? 'text-accent-gold' : 'text-stone-500'
                  }`}
                >
                  {HAND_VIEW_LABELS[view]}
                </span>
                {url ? (
                  <div className="flex-1 relative flex items-center justify-center overflow-hidden rounded bg-stone-100 border border-stone-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={view} className="max-h-full max-w-full object-contain" />
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPhotoToRemove(view);
                        }}
                        className="absolute -top-1 -right-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold transition-all shadow cursor-pointer z-10"
                        title="Delete photo (Admin Only)"
                      >
                        ×
                      </button>
                    )}
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
              className="btn-gold text-[9px] px-2 py-1 shadow-sm font-semibold rounded"
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
              <button
                type="button"
                onClick={() => setTimerDuration(5)}
                className={`text-[9px] px-1.5 py-0.25 rounded ${
                  timerDuration === 5 ? 'bg-accent-gold text-white font-bold' : 'bg-stone-200 text-stone-600'
                }`}
              >
                5m
              </button>
              <button
                type="button"
                onClick={() => setTimerDuration(10)}
                className={`text-[9px] px-1.5 py-0.25 rounded ${
                  timerDuration === 10 ? 'bg-accent-gold text-white font-bold' : 'bg-stone-200 text-stone-600'
                }`}
              >
                10m
              </button>
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
              { key: 'noMorningSwelling', label: 'No Morning Swelling (distorts shape)' },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center gap-1.5 text-[9px] font-semibold text-stone-600 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={(checklist as any)[item.key]}
                  onChange={(e) => setChecklist({ ...checklist, [item.key]: e.target.checked })}
                  className="rounded border-stone-300 text-accent-gold focus:ring-accent-gold/30 w-3 h-3"
                />
                <span className={(checklist as any)[item.key] ? 'line-through text-stone-400' : ''}>
                  {item.label}
                </span>
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

      {/* Confirmation modal for deleting photos */}
      <ConfirmModal
        isOpen={photoToRemove !== null}
        title="Remove Photo"
        message={
          photoToRemove
            ? `Are you sure you want to remove the photo for ${HAND_VIEW_LABELS[photoToRemove]}? This action cannot be undone.`
            : ''
        }
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmRemovePhoto}
        onCancel={() => setPhotoToRemove(null)}
      />
    </div>
  );
}
