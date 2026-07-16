'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import LectureNotes from '@/components/LectureNotes';

function StudyPageContent() {
  const router = useRouter();

  return (
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
          Study Guide & Lectures
        </button>
      </div>

      <LectureNotes />
    </div>
  );
}

export default function StudyPage() {
  return (
    <PageLayout>
      <Suspense fallback={
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-stone-200 border-t-accent-gold rounded-full animate-spin"></div>
          <p className="text-stone-500 text-xs mt-3 font-semibold">Loading Study Guide...</p>
        </div>
      }>
        <StudyPageContent />
      </Suspense>
    </PageLayout>
  );
}
