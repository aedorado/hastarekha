'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HandProfile } from '@/lib/supabase';
import {
  loadHandProfiles,
  getCachedProfiles,
  subscribeProfilesCache,
} from '@/lib/profilesCache';
import AllHandsView from '@/components/AllHandsView';
import PageLayout from '@/components/PageLayout';

export default function AllHandsPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<HandProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cached = getCachedProfiles();
    if (cached && cached.length > 0) {
      setProfiles(cached);
      setIsLoading(false);
    }

    // Listen for updates from other tabs/actions
    const unsubscribe = subscribeProfilesCache((updated) => {
      setProfiles(updated);
    });

    async function loadData() {
      if (!getCachedProfiles()) {
        setIsLoading(true);
      }
      const res = await loadHandProfiles();
      setProfiles(res.profiles);
      setIsLoading(false);
    }

    loadData();
    return () => unsubscribe();
  }, []);

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Tab Selector */}
        <div className="flex justify-start gap-4 border-b border-stone-200 pb-px mb-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden whitespace-nowrap">
          <button
            onClick={() => router.push('/')}
            className="pb-2.5 px-1 font-serif text-sm font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer border-transparent text-stone-500 hover:text-stone-850 shrink-0"
          >
            Hand Profiles
          </button>
          <button
            className="pb-2.5 px-1 font-serif text-sm font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer border-accent-gold text-accent-gold shrink-0"
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

        <AllHandsView
          profiles={profiles}
          isLoading={isLoading}
        />
      </div>
    </PageLayout>
  );
}
