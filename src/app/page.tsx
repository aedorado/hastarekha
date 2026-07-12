'use client';

import React, { useState, useEffect } from 'react';
import { HandProfile, getDemoProfiles, saveDemoProfile, deleteDemoProfile, isSupabaseConfigured, HandView } from '@/lib/supabase';
import Dashboard from '@/components/Dashboard';
import HandCanvas from '@/components/HandCanvas';
import AnalysisForm from '@/components/AnalysisForm';
import ReferencePanel from '@/components/ReferencePanel';
import LectureNotes from '@/components/LectureNotes';
import { ChevronLeft, BookOpen } from 'lucide-react';

const INITIAL_PROFILE = (id: string): HandProfile => ({
  id,
  name: '',
  age: '',
  gender: '',
  dominant_hand: 'Right',
  images: {},
  general_notes: '',
  mounts_data: { jupiter: '', saturn: '', apollo: '', mercury: '', venus: '', moon: '', mars: '' },
  lines_data: { heart: '', head: '', life: '', fate: '', sun: '', other: '' },
  pins: [],
  drawings: [],
  tags: [],
});

export default function Home() {
  const [profiles, setProfiles] = useState<HandProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<HandProfile | null>(null);
  const [activeView, setActiveView] = useState<HandView>('right_palm');
  
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'profiles' | 'study'>('profiles');

  // Initialize and load profiles
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      if (isSupabaseConfigured) {
        try {
          const res = await fetch('/api/hands');
          const data = await res.json();
          if (res.ok && !data.isDemo) {
            setProfiles(data);
            setIsSupabaseConnected(true);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase fetch failed, falling back to local storage.');
        }
      }
      setProfiles(getDemoProfiles());
      setIsSupabaseConnected(false);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Fetch single profile details when editing
  const handleSelectProfile = (id: string) => {
    const prof = profiles.find((p) => p.id === id);
    if (prof) {
      setActiveProfileId(id);
      setActiveProfile(JSON.parse(JSON.stringify(prof))); // Deep copy
      setActiveView('right_palm');
      setSelectedPinId(null);
    }
  };

  // Create new profile trigger
  const handleCreateNew = () => {
    const uuid = crypto.randomUUID();
    setActiveProfileId(uuid);
    setActiveProfile(INITIAL_PROFILE(uuid));
    setActiveView('right_palm');
    setSelectedPinId(null);
  };

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

  // Handle image upload specifically for a selected view (Right Palm, Left Back, etc.)
  const handleUploadImageForView = async (view: HandView, file: File) => {
    if (!activeProfile) return;
    
    setIsUploading(true);
    try {
      const compressedDataUrl = await compressAndResizeImage(file);
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
    if (!activeProfile) return;
    const newImages = { ...activeProfile.images };
    delete newImages[view];
    setActiveProfile({
      ...activeProfile,
      images: newImages,
    });
  };

  // Save changes (Save to SQLite/Postgres or LocalStorage)
  const handleSave = async () => {
    if (!activeProfile || !activeProfile.name) return;

    setIsSaving(true);
    try {
      if (isSupabaseConnected) {
        const res = await fetch('/api/hands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(activeProfile),
        });
        
        if (res.ok) {
          const savedData = await res.json();
          setProfiles((prev) => {
            const index = prev.findIndex((p) => p.id === savedData.id);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = savedData;
              return updated;
            }
            return [savedData, ...prev];
          });
          alert('Analysis Profile Saved Successfully!');
          setActiveProfileId(null);
          setActiveProfile(null);
        } else {
          throw new Error('API save failed');
        }
      } else {
        const updatedList = saveDemoProfile(activeProfile);
        setProfiles(updatedList);
        alert('Saved locally to browser storage!');
        setActiveProfileId(null);
        setActiveProfile(null);
      }
    } catch (e) {
      alert('Error saving profile. Saving locally to browser fallback...');
      const updatedList = saveDemoProfile(activeProfile);
      setProfiles(updatedList);
      setActiveProfileId(null);
      setActiveProfile(null);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete profile
  const handleDeleteProfile = async (id: string) => {
    try {
      if (isSupabaseConnected) {
        const res = await fetch(`/api/hands?id=${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setProfiles(profiles.filter((p) => p.id !== id));
        } else {
          throw new Error('API delete failed');
        }
      } else {
        const updated = deleteDemoProfile(id);
        setProfiles(updated);
      }
    } catch (e) {
      const updated = deleteDemoProfile(id);
      setProfiles(updated);
    }
  };

  // Import JSON profiles back in
  const handleImportData = async (imported: HandProfile[]) => {
    try {
      if (isSupabaseConnected) {
        for (const item of imported) {
          await fetch('/api/hands', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          });
        }
        const res = await fetch('/api/hands');
        const data = await res.json();
        if (res.ok) setProfiles(data);
      } else {
        imported.forEach((p) => saveDemoProfile(p));
        setProfiles(getDemoProfiles());
      }
      alert('Database imported successfully!');
    } catch (e) {
      alert('Failed to import database entries.');
    }
  };

  const activePin = activeProfile?.pins.find((p) => p.id === selectedPinId) || null;

  const handleUpdatePin = (updatedPin: any) => {
    if (!activeProfile) return;
    const updatedPins = activeProfile.pins.map((p) =>
      p.id === updatedPin.id ? updatedPin : p
    );
    setActiveProfile({
      ...activeProfile,
      pins: updatedPins,
    });
  };

  const handleDeletePin = (pinId: string) => {
    if (!activeProfile) return;
    setActiveProfile({
      ...activeProfile,
      pins: activeProfile.pins.filter((p) => p.id !== pinId),
    });
    setSelectedPinId(null);
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 py-4 px-6 md:px-12 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveProfileId(null); setActiveProfile(null); }}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-gold to-amber-700 flex items-center justify-center shadow-md">
            <span className="font-serif font-bold text-white text-lg">H</span>
          </div>
          <span className="mystic-title text-lg md:text-xl font-bold">HastaRekhā</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsReferenceOpen(!isReferenceOpen)}
            className="btn-outline px-3.5 py-1.5 text-xs flex items-center gap-1.5 border-accent-gold/40 text-accent-gold hover:bg-accent-gold/5 font-semibold"
          >
            <BookOpen className="w-4 h-4" />
            Quick Lookup
          </button>
        </div>
      </header>

      {/* Main Content + Drawer Shifting Wrapper */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Main Body */}
        <main className={`flex-1 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full transition-all duration-300 pb-20 ${
          isReferenceOpen ? 'lg:pr-[384px]' : ''
        }`}>
          {activeProfileId === null ? (
            /* Dashboard Mode */
            <div className="space-y-6">
              {/* Tab Selector */}
              <div className="flex justify-start gap-4 border-b border-stone-200 pb-px mb-2">
                <button
                  onClick={() => setDashboardTab('profiles')}
                  className={`pb-2.5 px-1 font-serif text-sm font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                    dashboardTab === 'profiles'
                      ? 'border-accent-gold text-accent-gold'
                      : 'border-transparent text-stone-500 hover:text-stone-850'
                  }`}
                >
                  Hand Profiles
                </button>
                <button
                  onClick={() => setDashboardTab('study')}
                  className={`pb-2.5 px-1 font-serif text-sm font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                    dashboardTab === 'study'
                      ? 'border-accent-gold text-accent-gold'
                      : 'border-transparent text-stone-500 hover:text-stone-850'
                  }`}
                >
                  Study Guide & Lectures
                </button>
              </div>

              {dashboardTab === 'profiles' ? (
                <Dashboard
                  profiles={profiles}
                  onSelectProfile={handleSelectProfile}
                  onCreateNew={handleCreateNew}
                  onDeleteProfile={handleDeleteProfile}
                  onImportData={handleImportData}
                  isSupabaseConnected={isSupabaseConnected}
                  isLoading={isLoading}
                />
              ) : (
                <LectureNotes />
              )}
            </div>
          ) : (
            /* Analysis Editor Mode */
            activeProfile && (
              <div className="space-y-6">
                {/* Editor Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (confirm('Discard unsaved modifications and return to dashboard?')) {
                          setActiveProfileId(null);
                          setActiveProfile(null);
                        }
                      }}
                      className="p-2 rounded-lg bg-white hover:bg-stone-50 text-stone-600 hover:text-accent-gold border border-stone-200 transition-colors shadow-sm"
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Canvas Workspace Column */}
                  <div className="lg:col-span-7 h-full flex flex-col">
                    <div className="glass-panel p-4 flex-1 bg-white border border-stone-200">
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
                  <div className="lg:col-span-5">
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
            )
          )}
        </main>

        {/* Slide-out Reference Sheet Guide */}
        <ReferencePanel isOpen={isReferenceOpen} onClose={() => setIsReferenceOpen(false)} />
      </div>
    </div>
  );
}
