'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Sparkles, 
  ChevronUp, 
  Hand, 
  Layers, 
  GraduationCap, 
  Compass, 
  ExternalLink,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface FooterProps {
  isReferenceOpen?: boolean;
  onOpenQuickLookup?: () => void;
}

export default function Footer({ isReferenceOpen = false, onOpenQuickLookup }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <footer 
      id="portal-footer"
      className={`border-t border-stone-200/90 bg-white/85 backdrop-blur-md transition-all duration-300 relative z-30 mt-auto ${
        isReferenceOpen ? 'lg:pr-[384px]' : ''
      }`}
    >
      {/* Decorative top accent gold gradient line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-accent-gold/45 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-10 sm:py-14">
        {/* Top Branding & Main Action Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-10 border-b border-stone-200/70">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-gold via-amber-600 to-amber-800 flex items-center justify-center shadow-md shadow-accent-gold/25 text-white font-serif font-bold text-lg select-none">
                H
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="mystic-title text-xl sm:text-2xl font-bold tracking-wide">HastaRekhā</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-accent-gold border border-amber-200/70">
                    Sāmudrika Shāstra
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium tracking-wide">
                  सामुद्रिक लक्षण विज्ञान • Vedic Palmistry Research &amp; Classification Portal
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              A specialized repository for classical palmistry cataloging, dermatoglyphic analysis, 
              landmarks classification, and empirical cross-reference of hands across Vedic traditions.
            </p>
            <div className="flex items-center gap-4 pt-1 text-xs">
              <div className="flex items-center gap-2 text-stone-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Vedic Research Engine Active</span>
              </div>
              <span className="text-stone-300">•</span>
              <div className="flex items-center gap-1.5 text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-accent-gold" />
                <span>Supabase Sāmudrika Databank</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onOpenQuickLookup && (
              <button
                type="button"
                id="footer-quick-lookup-btn"
                onClick={onOpenQuickLookup}
                className="btn-outline text-xs px-4 py-2 border-accent-gold/40 text-accent-gold hover:bg-accent-gold/10 font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-accent-gold" />
                <span>Quick Reference Guide</span>
              </button>
            )}
            <Link
              href="/analysis/new"
              id="footer-new-analysis-btn"
              className="btn-gold text-xs px-4 py-2 flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Hand Analysis</span>
            </Link>
          </div>
        </div>

        {/* Navigation & Research Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-b border-stone-200/70 text-xs">
          {/* Column 1: Portal Navigation */}
          <div className="space-y-3.5">
            <h4 className="font-serif font-bold text-stone-850 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-accent-gold" />
              Portal Directory
            </h4>
            <ul className="space-y-2.5 text-stone-600">
              <li>
                <Link href="/" className="hover:text-accent-gold transition-colors flex items-center gap-1.5">
                  <span className="text-accent-gold/70">›</span> Hand Profiles Dashboard
                </Link>
              </li>
              <li>
                <Link href="/all-hands" className="hover:text-accent-gold transition-colors flex items-center gap-1.5">
                  <span className="text-accent-gold/70">›</span> All Hands Visual Gallery
                </Link>
              </li>
              <li>
                <Link href="/study" className="hover:text-accent-gold transition-colors flex items-center gap-1.5">
                  <span className="text-accent-gold/70">›</span> Study Guide &amp; Lectures
                </Link>
              </li>
              <li>
                <Link href="/analysis/new" className="hover:text-accent-gold transition-colors flex items-center gap-1.5">
                  <span className="text-accent-gold/70">›</span> Create New Hand Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Sapta Parvata (Mounts) */}
          <div className="space-y-3.5">
            <h4 className="font-serif font-bold text-stone-850 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-accent-gold" />
              Sapta Parvata (Mounts)
            </h4>
            <ul className="space-y-2.5 text-stone-600">
              <li>
                <Link href="/study" className="hover:text-accent-gold transition-colors flex items-center gap-1.5">
                  <span className="text-accent-gold/70">›</span> Guru (Jupiter) • Wisdom &amp; Ambition
                </Link>
              </li>
              <li>
                <Link href="/study" className="hover:text-accent-gold transition-colors flex items-center gap-1.5">
                  <span className="text-accent-gold/70">›</span> Śani (Saturn) • Karma &amp; Discipline
                </Link>
              </li>
              <li>
                <Link href="/study" className="hover:text-accent-gold transition-colors flex items-center gap-1.5">
                  <span className="text-accent-gold/70">›</span> Sūrya (Apollo) • Fame, Art &amp; Vitality
                </Link>
              </li>
              <li>
                <Link href="/study" className="hover:text-accent-gold transition-colors flex items-center gap-1.5">
                  <span className="text-accent-gold/70">›</span> Budha (Mercury) • Intellect &amp; Commerce
                </Link>
              </li>
              <li>
                <Link href="/study" className="hover:text-accent-gold transition-colors flex items-center gap-1.5">
                  <span className="text-accent-gold/70">›</span> Śukra &amp; Candra (Venus &amp; Moon)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Mukhya Rekhā (Lines) */}
          <div className="space-y-3.5">
            <h4 className="font-serif font-bold text-stone-850 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Hand className="w-3.5 h-3.5 text-accent-gold" />
              Mukhya Rekhā (Lines)
            </h4>
            <ul className="space-y-2.5 text-stone-600">
              <li>
                <Link href="/study" className="hover:text-accent-gold transition-colors flex items-center gap-1.5">
                  <span className="text-accent-gold/70">›</span> Jīvana Rekhā (Life &amp; Timing)
                </Link>
              </li>
              <li>
                <Link href="/study" className="hover:text-accent-gold transition-colors flex items-center gap-1.5">
                  <span className="text-accent-gold/70">›</span> Mastaka Rekhā (Head &amp; Intellect)
                </Link>
              </li>
              <li>
                <Link href="/study" className="hover:text-accent-gold transition-colors flex items-center gap-1.5">
                  <span className="text-accent-gold/70">›</span> Hṛdaya Rekhā (Heart &amp; Emotion)
                </Link>
              </li>
              <li>
                <Link href="/study" className="hover:text-accent-gold transition-colors flex items-center gap-1.5">
                  <span className="text-accent-gold/70">›</span> Bhāgya Rekhā (Fate &amp; Career)
                </Link>
              </li>
              <li>
                <Link href="/study" className="hover:text-accent-gold transition-colors flex items-center gap-1.5">
                  <span className="text-accent-gold/70">›</span> Devatā Rakṣā Rekhā (Protection)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Classical Shāstras & Learning */}
          <div className="space-y-3.5">
            <h4 className="font-serif font-bold text-stone-850 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-accent-gold" />
              Classical Learning
            </h4>
            <ul className="space-y-2.5 text-stone-600">
              <li>
                <Link href="/study" className="hover:text-accent-gold transition-colors flex items-center gap-1.5">
                  <span className="text-accent-gold/70">›</span> 4 Tattvas (Fire, Air, Earth, Water)
                </Link>
              </li>
              <li>
                <Link href="/study" className="hover:text-accent-gold transition-colors flex items-center gap-1.5">
                  <span className="text-accent-gold/70">›</span> Sacred Signs (Matsya, Triśūla, Vajra)
                </Link>
              </li>
              <li>
                <Link href="/study" className="hover:text-accent-gold transition-colors flex items-center gap-1.5">
                  <span className="text-accent-gold/70">›</span> SRS Flashcard Revision Deck
                </Link>
              </li>
              <li>
                <Link href="/study" className="hover:text-accent-gold transition-colors flex items-center gap-1.5">
                  <span className="text-accent-gold/70">›</span> Sāmudrika Mastery Quiz Engine
                </Link>
              </li>
              <li>
                <Link href="/study" className="hover:text-accent-gold transition-colors flex items-center gap-1.5">
                  <span className="text-accent-gold/70">›</span> Printable Lecture Handbook
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Classical Vedic Shloka Card */}
        <div className="mt-8 rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-50/70 via-stone-50/80 to-amber-50/40 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-gold" />
                <span className="text-[11px] font-serif font-bold text-accent-gold uppercase tracking-wider">
                  Classical Karadarśanam Stotram (हस्तदर्शन श्लोक)
                </span>
              </div>
              <p className="font-serif text-sm sm:text-base text-stone-850 font-semibold tracking-wide">
                कराग्रे वसते लक्ष्मीः करमध्ये सरस्वती । करमूले तु गोविन्दः प्रभाते करदर्शनम् ॥
              </p>
              <p className="text-xs text-stone-600 leading-relaxed italic max-w-3xl">
                &ldquo;At the tips of the fingers dwells Mahālakṣmī (Prosperity); in the palm&rsquo;s center resides Sarasvatī (Wisdom &amp; Knowledge); at the wrist base rests Govinda (Preservation). Behold your palms each morning with reverent clarity.&rdquo;
              </p>
            </div>
            {onOpenQuickLookup && (
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={onOpenQuickLookup}
                  className="btn-outline text-xs px-3.5 py-2 border-accent-gold/40 text-accent-gold hover:bg-accent-gold/10 font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open Quick Lookup</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="mt-8 pt-6 border-t border-stone-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2 text-center sm:text-left flex-wrap">
            <span>&copy; {currentYear} <strong className="text-stone-700 font-semibold">HastaRekhā Databank</strong>.</span>
            <span className="hidden sm:inline text-stone-300">•</span>
            <span>Rooted in Classical Sāmudrika Shāstra &amp; Modern Dermatoglyphics.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] font-medium text-stone-400">
              v1.4.2 • Next.js
            </span>
            <button
              type="button"
              id="footer-back-to-top-btn"
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-accent-gold/50 bg-white hover:bg-amber-50/50 text-stone-600 hover:text-accent-gold transition-all text-xs font-semibold cursor-pointer shadow-2xs"
              title="Back to Top"
            >
              <span>Back to Top</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
