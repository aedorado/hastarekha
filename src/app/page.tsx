'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HandProfile, getDemoProfiles, saveDemoProfile, deleteDemoProfile, isSupabaseConfigured } from '@/lib/supabase';
import Dashboard from '@/components/Dashboard';
import AllHandsView from '@/components/AllHandsView';
import PageLayout from '@/components/PageLayout';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profiles, setProfiles] = useState<HandProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  const activeTab = (searchParams.get('tab') as 'profiles' | 'all-hands') || 'profiles';

  const setActiveTab = (tab: 'profiles' | 'all-hands') => {
    const params = new URLSearchParams(window.location.search);
    if (tab === 'profiles') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    const search = params.toString();
    router.replace(search ? `/?${search}` : '/');
  };

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

  const handleSelectProfile = (id: string) => {
    router.push(`/analysis/${id}`);
  };

  const handleCreateNew = () => {
    router.push('/analysis/new');
  };

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

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Tab Selector */}
        <div className="flex justify-start gap-4 border-b border-stone-200 pb-px mb-2">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`pb-2.5 px-1 font-serif text-sm font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
              activeTab === 'profiles'
                ? 'border-accent-gold text-accent-gold'
                : 'border-transparent text-stone-500 hover:text-stone-850'
            }`}
          >
            Hand Profiles
          </button>
          <button
            onClick={() => setActiveTab('all-hands')}
            className={`pb-2.5 px-1 font-serif text-sm font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
              activeTab === 'all-hands'
                ? 'border-accent-gold text-accent-gold'
                : 'border-transparent text-stone-500 hover:text-stone-850'
            }`}
          >
            All Hands
          </button>
          <button
            onClick={() => router.push('/study')}
            className="pb-2.5 px-1 font-serif text-sm font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer border-transparent text-stone-500 hover:text-stone-850"
          >
            Study Guide & Lectures
          </button>
        </div>

        {activeTab === 'profiles' ? (
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
          <AllHandsView
            profiles={profiles}
            isLoading={isLoading}
          />
        )}
      </div>
    </PageLayout>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <PageLayout>
        <div className="flex flex-col items-center justify-center h-72 gap-4 text-stone-400">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-stone-200/60" />
            <div className="absolute inset-0 rounded-full border-4 border-t-accent-gold animate-spin" />
          </div>
          <p className="text-sm font-medium">Loading Databank...</p>
        </div>
      </PageLayout>
    }>
      <HomeContent />
    </Suspense>
  );
}
