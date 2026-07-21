'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HandProfile, getDemoProfiles, isSupabaseConfigured } from '@/lib/supabase';
import AllHandsView from '@/components/AllHandsView';
import PageLayout from '@/components/PageLayout';

export default function AllHandsPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<HandProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      if (isSupabaseConfigured) {
        try {
          const res = await fetch('/api/hands');
          const data = await res.json();
          if (res.ok && !data.isDemo) {
            setProfiles(data);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase fetch failed, falling back to local storage.');
        }
      }
      setProfiles(getDemoProfiles());
      setIsLoading(false);
    }
    loadData();
  }, []);

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Tab Selector */}
        <div className="flex justify-start gap-4 border-b border-stone-200 pb-px mb-2">
          <button
            onClick={() => router.push('/')}
            className="pb-2.5 px-1 font-serif text-sm font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer border-transparent text-stone-500 hover:text-stone-850"
          >
            Hand Profiles
          </button>
          <button
            className="pb-2.5 px-1 font-serif text-sm font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer border-accent-gold text-accent-gold"
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

        <AllHandsView
          profiles={profiles}
          isLoading={isLoading}
        />
      </div>
    </PageLayout>
  );
}
