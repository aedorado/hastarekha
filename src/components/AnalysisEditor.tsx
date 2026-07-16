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
  const [pendingUpload, setPendingUpload] = useState<{ view: HandView; file: File } | null>(null);

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
  const handleUploadImageForView = async (view: HandView, file: File) => {
    setPendingUpload({ view, file });
  };

  // Process the file after user crops/rotates it in the modal
  const handleUploadImageAfterCrop = async (view: HandView, croppedFile: File) => {
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
  const handleRemoveImageForView = (view: HandView) => {
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
      alert('Please enter a profile name.');
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
                if (confirm('Discard unsaved modifications and return to dashboard?')) {
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
            />
          </div>
        </div>
      </div>
      {pendingUpload && (
        <ImageCropperModal
          file={pendingUpload.file}
          onConfirm={(croppedFile) => handleUploadImageAfterCrop(pendingUpload.view, croppedFile)}
          onCancel={() => setPendingUpload(null)}
        />
      )}
    </PageLayout>
  );
}
