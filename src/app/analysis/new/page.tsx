'use client';

import React, { useState, useEffect } from 'react';
import { HandProfile } from '@/lib/supabase';
import AnalysisEditor from '@/components/AnalysisEditor';
import PageLayout from '@/components/PageLayout';

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
  dob: '',
  tob: '',
  pob: '',
});

export default function NewAnalysisPage() {
  const [profile, setProfile] = useState<HandProfile | null>(null);

  useEffect(() => {
    setProfile(INITIAL_PROFILE(crypto.randomUUID()));
  }, []);

  if (!profile) {
    return (
      <PageLayout>
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-stone-200 border-t-accent-gold rounded-full animate-spin"></div>
          <p className="text-stone-500 text-xs mt-3 font-semibold">Creating New Profile...</p>
        </div>
      </PageLayout>
    );
  }

  return <AnalysisEditor initialProfile={profile} />;
}
