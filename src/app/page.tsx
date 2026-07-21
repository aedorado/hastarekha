'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HandProfile, getDemoProfiles, saveDemoProfile, deleteDemoProfile, isSupabaseConfigured } from '@/lib/supabase';
import Dashboard from '@/components/Dashboard';
import PageLayout from '@/components/PageLayout';

export default function Home() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<HandProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

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
