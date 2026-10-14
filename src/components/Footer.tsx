'use client';

import React from 'react';
import Link from 'next/link';

interface FooterProps {
  isReferenceOpen?: boolean;
  onOpenQuickLookup?: () => void;
}

export default function Footer({ isReferenceOpen = false, onOpenQuickLookup }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="portal-footer"
      className={`border-t border-stone-200/80 bg-white/70 backdrop-blur-xs transition-all duration-300 relative z-30 mt-auto ${
        isReferenceOpen ? 'lg:pr-[384px]' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
        {/* Left: Brand & Copyright */}
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-accent-gold to-amber-700 flex items-center justify-center text-white font-serif font-bold text-[11px] shadow-2xs select-none">
            H
          </div>
          <span className="font-serif font-bold text-stone-800 tracking-wide text-xs">
            HastaRekhā
          </span>
          <span className="text-stone-300">·</span>
          <span>&copy; {currentYear} Sāmudrika Databank</span>
        </div>

        {/* Right: Clean Navigation Links */}
        <nav className="flex items-center gap-5 text-stone-600 font-medium">
          <Link href="/" className="hover:text-accent-gold transition-colors">
            Profiles
          </Link>
          <Link href="/all-hands" className="hover:text-accent-gold transition-colors">
            All Hands
          </Link>
          <Link href="/study" className="hover:text-accent-gold transition-colors">
            Study Guide
          </Link>
          <Link href="/analysis/new" className="hover:text-accent-gold transition-colors">
            New Analysis
          </Link>
          {onOpenQuickLookup && (
            <button
              type="button"
              onClick={onOpenQuickLookup}
              className="hover:text-accent-gold transition-colors cursor-pointer text-stone-500"
            >
              Quick Lookup
            </button>
          )}
        </nav>
      </div>
    </footer>
  );
}
