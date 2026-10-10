'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HandProfile, saveDemoProfile, deleteDemoProfile } from '@/lib/supabase';
import {
  loadHandProfiles,
  getCachedProfiles,
  setCachedProfiles,
  removeProfileFromCache,
  subscribeProfilesCache,
} from '@/lib/profilesCache';
import Dashboard from '@/components/Dashboard';
import PageLayout from '@/components/PageLayout';

export default function Home() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<HandProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Initialize and load profiles using SWR cache
  useEffect(() => {
    const cached = getCachedProfiles();
    if (cached && cached.length > 0) {
      setProfiles(cached);
      setIsLoading(false);
    }

    // Subscribe to cross-component cache updates
    const unsubscribe = subscribeProfilesCache((updated) => {
      setProfiles(updated);
    });

    async function loadData() {
      if (!getCachedProfiles()) {
        setIsLoading(true);
      }
      const res = await loadHandProfiles();
      setProfiles(res.profiles);
      setIsSupabaseConnected(res.isSupabaseConnected);
      setIsLoading(false);
    }

    loadData();
    return () => unsubscribe();
  }, []);

  const handleSelectProfile = (id: string) => {
    router.push(`/analysis/${id}`);
  };

  const handleCreateNew = () => {
    router.push('/analysis/new');
  };

  const handleDeleteProfile = async (id: string) => {
    // Keep snapshot for rollback if deletion fails
    const previousProfiles = [...profiles];
    removeProfileFromCache(id);
    setProfiles((prev) => prev.filter((p) => p.id !== id));

    try {
      if (isSupabaseConnected) {
        const res = await fetch(`/api/hands?id=${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Server rejected deletion');
        }
      } else {
        deleteDemoProfile(id);
      }
    } catch (e: any) {
      console.error('Delete profile error:', e);
      // Roll back optimistic delete
      setCachedProfiles(previousProfiles);
      setProfiles(previousProfiles);
      alert(`Could not delete profile: ${e.message || 'Unknown error'}`);
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
        const res = await loadHandProfiles({ force: true });
        setProfiles(res.profiles);
      } else {
        imported.forEach((p) => saveDemoProfile(p));
        setCachedProfiles(imported);
        setProfiles(imported);
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
        <div className="flex justify-start gap-4 border-b border-stone-200 pb-px mb-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden whitespace-nowrap">
          <button
            className="pb-2.5 px-1 font-serif text-sm font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer border-accent-gold text-accent-gold shrink-0"
          >
            Hand Profiles
          </button>
          <button
            onClick={() => router.push('/all-hands')}
            className="pb-2.5 px-1 font-serif text-sm font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer border-transparent text-stone-500 hover:text-stone-850 shrink-0"
          >
            All Hands
          </button>
          <button
            onClick={() => router.push('/study')}
            className="pb-2.5 px-1 font-serif text-sm font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer border-transparent text-stone-500 hover:text-stone-850 shrink-0"
          >
            Study Guide & Lectures
          </button>
        </div>

        <Dashboard
          profiles={profiles}
          onSelectProfile={handleSelectProfile}
          onCreateNew={handleCreateNew}
          onDeleteProfile={handleDeleteProfile}
          onImportData={handleImportData}
          isSupabaseConnected={isSupabaseConnected}
          isLoading={isLoading}
        />
      </div>
    </PageLayout>
  );
}
