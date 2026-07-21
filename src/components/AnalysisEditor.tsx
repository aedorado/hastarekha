'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HandProfile, HandView, saveDemoProfile, isSupabaseConfigured } from '@/lib/supabase';
import HandCanvas from '@/components/HandCanvas';
import AnalysisForm from '@/components/AnalysisForm';
import PageLayout from '@/components/PageLayout';
import { ChevronLeft } from 'lucide-react';
import ImageCropperModal from './ImageCropperModal';

interface AnalysisEditorProps {
  initialProfile: HandProfile;
}

export default function AnalysisEditor({ initialProfile }: AnalysisEditorProps) {
  const router = useRouter();
  const [activeProfile, setActiveProfile] = useState<HandProfile>(initialProfile);
  const [activeView, setActiveView] = useState<HandView>('right_palm');
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{ view: HandView | 'd1_chart'; file: File } | null>(null);

  // Check Supabase connection on mount
  useEffect(() => {
    async function checkConnection() {
      if (isSupabaseConfigured) {
        try {
          const res = await fetch('/api/hands');
          const data = await res.json();
          if (res.ok && !data.isDemo) {
            setIsSupabaseConnected(true);
            return;
          }
        } catch (e) {
          console.warn('Supabase connection check failed, using fallback.');
        }
      }
      setIsSupabaseConnected(false);
    }
    checkConnection();
  }, []);

  // Warn user on window unload if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isProfileChanged(initialProfile, activeProfile)) {
        e.preventDefault();
        e.returnValue = 'Discard unsaved modifications and return to dashboard?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [initialProfile, activeProfile]);

  // Local client-side image compression/resizing
  const compressAndResizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Intercept raw image upload to trigger the crop/rotate modal
  const handleUploadImageForView = async (view: HandView | 'd1_chart', file: File) => {
    setPendingUpload({ view, file });
  };

  // Process the file after user crops/rotates it in the modal
  const handleUploadImageAfterCrop = async (view: HandView | 'd1_chart', croppedFile: File) => {
    setPendingUpload(null);
    setIsUploading(true);
    try {
      const compressedDataUrl = await compressAndResizeImage(croppedFile);
      let finalUrl = compressedDataUrl;

      if (isSupabaseConnected) {
        try {
          const blobRes = await fetch(compressedDataUrl);
          const imageBlob = await blobRes.blob();

          const res = await fetch(`/api/upload?filename=palm-${activeProfile.id}-${view}.jpg`, {
            method: 'POST',
            body: imageBlob,
          });
          const blobData = await res.json();
          if (res.ok && blobData.url) {
            finalUrl = blobData.url;
          }
        } catch (uploadErr) {
          console.warn('Vercel Blob upload failed, utilizing local base64 instead.', uploadErr);
        }
      }

      // Update state for active profile
      setActiveProfile({
        ...activeProfile,
        images: {
          ...activeProfile.images,
          [view]: finalUrl,
        },
      });
    } catch (err) {
      alert('Failed to process image file.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle image removal specifically for a selected view (Right Palm, Left Back, etc.)
  const handleRemoveImageForView = (view: HandView | 'd1_chart') => {
    const newImages = { ...activeProfile.images };
    delete newImages[view];
    setActiveProfile({
      ...activeProfile,
      images: newImages,
    });
  };

  // Save changes (Save to SQLite/Postgres or LocalStorage)
  const handleSave = async () => {
    if (!activeProfile.name) {
      alert('Please fill out the Subject Identifier / Name.');
      return;
    }

    setIsSaving(true);
    try {
      if (isSupabaseConnected) {
        const res = await fetch('/api/hands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(activeProfile),
        });

        if (res.ok) {
          alert('Analysis Profile Saved Successfully!');
          router.push('/');
        } else {
          throw new Error('API save failed');
        }
      } else {
        saveDemoProfile(activeProfile);
        alert('Saved locally to browser storage!');
        router.push('/');
      }
    } catch (e) {
      alert('Error saving profile. Saving locally to browser fallback...');
      saveDemoProfile(activeProfile);
      router.push('/');
    } finally {
      setIsSaving(false);
    }
  };

  const activePin = activeProfile.pins.find((p) => p.id === selectedPinId) || null;

  const handleUpdatePin = (updatedPin: any) => {
    const updatedPins = activeProfile.pins.map((p) =>
      p.id === updatedPin.id ? updatedPin : p
    );
    setActiveProfile({
      ...activeProfile,
      pins: updatedPins,
    });
  };

  const handleDeletePin = (pinId: string) => {
    setActiveProfile({
      ...activeProfile,
      pins: activeProfile.pins.filter((p) => p.id !== pinId),
    });
    setSelectedPinId(null);
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Editor Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!isProfileChanged(initialProfile, activeProfile) || confirm('Discard unsaved modifications and return to dashboard?')) {
                  router.push('/');
                }
              }}
              className="p-2 rounded-lg bg-white hover:bg-stone-50 text-stone-600 hover:text-accent-gold border border-stone-200 transition-colors shadow-sm cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-bold text-lg text-stone-900">
                {activeProfile.name || 'New Profile Analysis'}
              </h2>
              <p className="text-stone-500 text-xs font-semibold">
                📍 Select views, draw highlights, and place markers.
              </p>
            </div>
          </div>
        </div>

        {/* Editor Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          {/* Canvas Workspace Column */}
          <div className="lg:col-span-7 w-full h-full flex flex-col">
            <div className="flex flex-col h-full w-full bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-md">
              <HandCanvas
                images={activeProfile.images}
                activeView={activeView}
                onChangeActiveView={setActiveView}
                pins={activeProfile.pins}
                drawings={activeProfile.drawings}
                onChangePins={(pins) => setActiveProfile({ ...activeProfile, pins })}
                onChangeDrawings={(drawings) => setActiveProfile({ ...activeProfile, drawings })}
                onSelectPin={(pin) => setSelectedPinId(pin ? pin.id : null)}
                selectedPinId={selectedPinId}
                onUploadImageForView={handleUploadImageForView}
                onRemoveImageForView={handleRemoveImageForView}
                isUploading={isUploading}
                profile={activeProfile}
                onChangeProfile={setActiveProfile}
              />
            </div>
          </div>

          {/* Form Metadata Column */}
          <div className="lg:col-span-7 w-full">
            <AnalysisForm
              profile={activeProfile}
              onChangeProfile={(prof) => setActiveProfile(prof)}
              selectedPin={activePin}
              onUpdatePin={handleUpdatePin}
              onDeletePin={handleDeletePin}
              onSave={handleSave}
              isSaving={isSaving}
              onUploadImageForView={handleUploadImageForView}
              isUploading={isUploading}
              hasChanges={isProfileChanged(initialProfile, activeProfile)}
              onChangeActiveView={setActiveView}
            />
          </div>
        </div>
      </div>
      {pendingUpload && (
        <ImageCropperModal
          file={pendingUpload.file}
          view={pendingUpload.view}
          onConfirm={(croppedFile) => handleUploadImageAfterCrop(pendingUpload.view, croppedFile)}
          onCancel={() => setPendingUpload(null)}
        />
      )}
    </PageLayout>
  );
}

function isProfileChanged(initial: HandProfile, active: HandProfile): boolean {
  const normStr = (val: any) => (val === null || val === undefined ? '' : String(val).trim());
  const normNum = (val: any) => (val === null || val === undefined || val === '' ? '' : Number(val));

  if (normStr(initial.name) !== normStr(active.name)) return true;
  if (normNum(initial.age) !== normNum(active.age)) return true;
  if (normStr(initial.gender) !== normStr(active.gender)) return true;
  if (normStr(initial.dominant_hand) !== normStr(active.dominant_hand)) return true;
  if (normStr(initial.general_notes) !== normStr(active.general_notes)) return true;
  if (normStr(initial.dob) !== normStr(active.dob)) return true;
  if (normStr(initial.tob) !== normStr(active.tob)) return true;
  if (normStr(initial.pob) !== normStr(active.pob)) return true;

  // Compare images keys & values
  const initImages = initial.images || {};
  const activeImages = active.images || {};
  const allImageKeys = Array.from(new Set([...Object.keys(initImages), ...Object.keys(activeImages)]));
  for (const k of allImageKeys) {
    if (normStr(initImages[k]) !== normStr(activeImages[k])) return true;
  }

  // Compare mounts_data
  const initMounts = initial.mounts_data || {};
  const activeMounts = active.mounts_data || {};
  const allMountsKeys = Array.from(new Set([...Object.keys(initMounts), ...Object.keys(activeMounts)]));
  for (const k of allMountsKeys) {
    if (normStr(initMounts[k]) !== normStr(activeMounts[k])) return true;
  }

  // Compare lines_data
  const initLines = initial.lines_data || {};
  const activeLines = active.lines_data || {};
  const allLinesKeys = Array.from(new Set([...Object.keys(initLines), ...Object.keys(activeLines)]));
  for (const k of allLinesKeys) {
    if (normStr(initLines[k]) !== normStr(activeLines[k])) return true;
  }

  // Compare tags
  const initTags = (initial.tags || []).map((t) => normStr(t)).filter(Boolean);
  const activeTags = (active.tags || []).map((t) => normStr(t)).filter(Boolean);
  if (initTags.length !== activeTags.length) return true;
  for (let i = 0; i < initTags.length; i++) {
    if (initTags[i] !== activeTags[i]) return true;
  }

  // Compare pins
  const initPins = initial.pins || [];
  const activePins = active.pins || [];
  if (initPins.length !== activePins.length) return true;
  for (let i = 0; i < initPins.length; i++) {
    const ip = initPins[i];
    const ap = activePins[i];
    if (
      ip.id !== ap.id ||
      ip.view !== ap.view ||
      ip.x !== ap.x ||
      ip.y !== ap.y ||
      normStr(ip.label) !== normStr(ap.label) ||
      normStr(ip.description) !== normStr(ap.description) ||
      normStr(ip.color) !== normStr(ap.color)
    ) {
      return true;
    }
  }

  // Compare drawings
  const initDrawings = initial.drawings || [];
  const activeDrawings = active.drawings || [];
  if (initDrawings.length !== activeDrawings.length) return true;
  for (let i = 0; i < initDrawings.length; i++) {
    const id = initDrawings[i];
    const ad = activeDrawings[i];
    if (
      id.id !== ad.id ||
      id.view !== ad.view ||
      normStr(id.color) !== normStr(ad.color) ||
      id.thickness !== ad.thickness ||
      normStr(id.label) !== normStr(ad.label)
    ) {
      return true;
    }
    const ip = id.points || [];
    const ap = ad.points || [];
    if (ip.length !== ap.length) return true;
    for (let j = 0; j < ip.length; j++) {
      if (ip[j].x !== ap[j].x || ip[j].y !== ap[j].y) return true;
    }
  }

  return false;
}
