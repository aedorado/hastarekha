'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import ReferencePanel from '@/components/ReferencePanel';
import Footer from '@/components/Footer';

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 py-3 sm:py-4 px-4 sm:px-6 md:px-12 flex justify-between items-center shadow-xs">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 cursor-pointer">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-accent-gold to-amber-700 flex items-center justify-center shadow-md">
            <span className="font-serif font-bold text-white text-base sm:text-lg">H</span>
          </div>
          <span className="mystic-title text-base sm:text-lg md:text-xl font-bold">HastaRekhā</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsReferenceOpen(!isReferenceOpen)}
            className="btn-outline px-3 sm:px-4 py-1.5 text-xs flex items-center gap-1.5 border-accent-gold/40 text-accent-gold hover:bg-accent-gold/5 font-semibold"
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Quick</span> Lookup
          </button>
        </div>
      </header>

      {/* Main Content + Drawer Shifting Wrapper */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Main Body */}
        <main className={`flex-1 px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-8 max-w-7xl mx-auto w-full transition-all duration-300 pb-12 sm:pb-16 ${isReferenceOpen ? 'lg:pr-[384px]' : ''
          }`}>
          {children}
        </main>

        {/* Slide-out Reference Sheet Guide */}
        <ReferencePanel isOpen={isReferenceOpen} onClose={() => setIsReferenceOpen(false)} />
      </div>

      {/* Portal Footer */}
      <Footer 
        isReferenceOpen={isReferenceOpen} 
        onOpenQuickLookup={() => setIsReferenceOpen(true)} 
      />
    </div>
  );
}
