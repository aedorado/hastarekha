'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import LectureNotes from '@/components/LectureNotes';
import ErrorBoundary from '@/components/ErrorBoundary';

function StudyPageContent() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <div className="flex items-center gap-6 border-b border-stone-200 mb-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden whitespace-nowrap">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="-mb-px pb-3 px-1 font-serif text-xs sm:text-sm font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer border-transparent text-stone-500 hover:text-stone-850 shrink-0"
        >
          Hand Profiles
        </button>
        <button
          type="button"
          onClick={() => router.push('/all-hands')}
          className="-mb-px pb-3 px-1 font-serif text-xs sm:text-sm font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer border-transparent text-stone-500 hover:text-stone-850 shrink-0"
        >
          All Hands
        </button>
        <button
          type="button"
          className="-mb-px pb-3 px-1 font-serif text-xs sm:text-sm font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer border-accent-gold text-accent-gold shrink-0"
        >
          Study Guide &amp; Lectures
        </button>
      </div>

      <ErrorBoundary title="Failed to load study guide view">
        <LectureNotes />
      </ErrorBoundary>
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
