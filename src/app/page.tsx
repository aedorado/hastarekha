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
  const cachedInitial = getCachedProfiles();
  const [profiles, setProfiles] = useState<HandProfile[]>(cachedInitial || []);
  const [isLoading, setIsLoading] = useState(!cachedInitial);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Initialize and load profiles using SWR cache
  useEffect(() => {
    // Subscribe to cross-component cache updates
    const unsubscribe = subscribeProfilesCache((updated) => {
      setProfiles(updated);
    });

    async function loadData() {
      // If we don't have cached data yet, show loading
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
    // Optimistic UI update via cache
    removeProfileFromCache(id);

    try {
      if (isSupabaseConnected) {
        const res = await fetch(`/api/hands?id=${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          throw new Error('API delete failed');
        }
      } else {
        deleteDemoProfile(id);
      }
    } catch (e) {
      console.error('Delete profile error:', e);
      deleteDemoProfile(id);
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
        <div className="flex justify-start gap-4 border-b border-stone-200 pb-px mb-2">
          <button
            className="pb-2.5 px-1 font-serif text-sm font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer border-accent-gold text-accent-gold"
          >
            Hand Profiles
          </button>
          <button
            onClick={() => router.push('/all-hands')}
            className="pb-2.5 px-1 font-serif text-sm font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer border-transparent text-stone-500 hover:text-stone-850"
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
