'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { HandProfile, getDemoProfiles, isSupabaseConfigured } from '@/lib/supabase';
import AnalysisEditor from '@/components/AnalysisEditor';
import PageLayout from '@/components/PageLayout';

export default function AnalysisPage() {
  const params = useParams();
  const id = params.id as string;
  const [profile, setProfile] = useState<HandProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      if (isSupabaseConfigured) {
        try {
          const res = await fetch('/api/hands');
          if (res.ok) {
            const data = await res.json();
            if (!data.isDemo) {
              const found = data.find((p: HandProfile) => p.id === id);
              if (found) {
                setProfile(found);
                setIsLoading(false);
                return;
              }
            }
          }
        } catch (e) {
          console.warn('Supabase fetch failed, falling back to local storage.');
        }
      }
      const demoProfiles = getDemoProfiles();
      const found = demoProfiles.find((p) => p.id === id);
      if (found) {
        setProfile(found);
      }
      setIsLoading(false);
    }
    loadProfile();
  }, [id]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-stone-200 border-t-accent-gold rounded-full animate-spin"></div>
          <p className="text-stone-500 text-xs mt-3 font-semibold">Loading Profile Analysis...</p>
        </div>
      </PageLayout>
    );
  }

  if (!profile) {
    return (
      <PageLayout>
        <div className="text-center py-20 space-y-4">
          <p className="text-stone-600 text-sm font-semibold">Profile not found.</p>
          <Link href="/" className="btn-outline px-4 py-2 text-xs text-accent-gold border-accent-gold/40 hover:bg-accent-gold/5 font-semibold inline-block">
            Return to Dashboard
          </Link>
        </div>
      </PageLayout>
    );
  }

  return <AnalysisEditor initialProfile={profile} />;
}
