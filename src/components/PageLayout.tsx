'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Lock, Unlock, LogOut } from 'lucide-react';
import ReferencePanel from '@/components/ReferencePanel';
import Footer from '@/components/Footer';
import AdminModal from '@/components/AdminModal';
import { useAdmin } from '@/context/AdminContext';

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);
  const { isAdmin, remainingSeconds, openLoginModal, logout } = useAdmin();

  const minutesRemaining = Math.floor(remainingSeconds / 60);
  const secondsRemaining = (remainingSeconds % 60).toString().padStart(2, '0');

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
          {/* Admin Mode Status / Toggle */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5 bg-amber-50/90 border border-amber-300 text-amber-900 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs">
              <Unlock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span className="hidden sm:inline">Admin Mode</span>
              <span className="font-mono text-[11px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                {minutesRemaining}:{secondsRemaining}
              </span>
              <button
                type="button"
                onClick={logout}
                title="Lock / Exit Admin Mode"
                className="ml-1 text-amber-700 hover:text-rose-600 hover:bg-amber-100 p-1 rounded transition cursor-pointer"
                aria-label="Exit Admin Mode"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openLoginModal}
              title="Enter Admin Mode (Requires Passcode)"
              className="px-2.5 sm:px-3 py-1.5 text-xs flex items-center gap-1.5 text-stone-600 hover:text-stone-900 border border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-stone-100 rounded-xl font-medium transition cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              <span>Admin</span>
            </button>
          )}

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

      {/* Admin Passcode Modal */}
      <AdminModal />

      {/* Main Content + Drawer Shifting Wrapper */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Main Body */}
        <main className={`flex-1 px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-8 max-w-7xl mx-auto w-full transition-all duration-300 pb-8 sm:pb-10 ${isReferenceOpen ? 'lg:pr-[384px]' : ''
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
