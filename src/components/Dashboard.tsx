'use client';

import React, { useState, useMemo } from 'react';
import { HandProfile, parseVedicData } from '@/lib/supabase';
import { Search, Plus, Calendar, Download, Upload, Trash2, Eye, HelpCircle, ImageIcon } from 'lucide-react';

interface DashboardProps {
  profiles: HandProfile[];
  onSelectProfile: (id: string) => void;
  onCreateNew: () => void;
  onDeleteProfile: (id: string) => void;
  onImportData: (imported: HandProfile[]) => void;
  isSupabaseConnected: boolean;
  isLoading: boolean;
}

export default function Dashboard({
  profiles,
  onSelectProfile,
  onCreateNew,
  onDeleteProfile,
  onImportData,
  isSupabaseConnected,
  isLoading,
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHandType, setSelectedHandType] = useState('');
  const [selectedHandTattva, setSelectedHandTattva] = useState('');
  const [selectedDominant, setSelectedDominant] = useState('');

  // Filter profiles based on search/filters
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const vedic = parseVedicData(p.general_notes);
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        vedic.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vedic.hand_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vedic.hand_tattva.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesHandType = !selectedHandType || vedic.hand_type === selectedHandType;
      const matchesHandTattva = !selectedHandTattva || vedic.hand_tattva === selectedHandTattva;
      const matchesDominant = !selectedDominant || p.dominant_hand === selectedDominant;

      return matchesSearch && matchesHandType && matchesHandTattva && matchesDominant;
    });
  }, [profiles, searchQuery, selectedHandType, selectedHandTattva, selectedDominant]);

  // Classical Hand types present in data
  const handTypes = useMemo(() => {
    const types = new Set<string>();
    profiles.forEach((p) => {
      const vedic = parseVedicData(p.general_notes);
      if (vedic.hand_type) types.add(vedic.hand_type);
    });
    return Array.from(types).sort();
  }, [profiles]);

  // Hand Tattvas present in data
  const handTattvas = useMemo(() => {
    const tattvas = new Set<string>();
    profiles.forEach((p) => {
      const vedic = parseVedicData(p.general_notes);
      if (vedic.hand_tattva) tattvas.add(vedic.hand_tattva);
    });
    return Array.from(tattvas).sort();
  }, [profiles]);

  // JSON export backup
  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(profiles, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `hastarekha-databank-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (e) {
      alert('Failed to export data');
    }
  };

  // JSON import restore
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            if (confirm(`Import ${parsed.length} hand profiles? Existing records with matching IDs will be overwritten.`)) {
              onImportData(parsed);
            }
          } else {
            alert('Invalid file format. Must be a JSON array of hand profiles.');
          }
        } catch (error) {
          alert('Failed to parse JSON file.');
        }
      };
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-2xl border border-stone-200/80 shadow-md">
        <div className="flex-1">
          <h1 className="mystic-title text-4xl font-bold mb-2">Hasta-Rekhā Databank</h1>
          <p className="text-stone-600 text-base mb-3">
            Analyze, annotate, and catalog hand profiles for your Sāmudrika Śāstra course.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            {isSupabaseConnected ? 'Connected to Cloud DB' : 'Offline Demo Mode (Local Storage)'}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap justify-end">
          <button
            onClick={onCreateNew}
            className="btn-gold text-sm shadow"
          >
            <Plus className="w-4 h-4" />
            Analyze New Hand
          </button>
          
          <button
            onClick={handleExport}
            className="btn-outline text-xs px-3 py-2"
            title="Download DB Backup"
          >
            <Download className="w-4 h-4" />
            Backup DB
          </button>

          <label
            className="btn-outline text-xs px-3 py-2 cursor-pointer"
            title="Restore DB Backup"
          >
            <Upload className="w-4 h-4" />
            Import DB
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5 bg-stone-50/60 p-6 rounded-xl border border-stone-200/60 shadow-sm backdrop-blur-sm">
        <div className="md:col-span-2 search-input-wrapper">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            className="form-input search-input-field text-sm"
            placeholder="Search by name, tag (e.g. #fish-sign) or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div>
          <select
            className="form-input bg-white border border-stone-200 text-sm text-stone-850"
            value={selectedHandType}
            onChange={(e) => setSelectedHandType(e.target.value)}
          >
            <option value="">All Classical Types</option>
            {handTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            className="form-input bg-white border border-stone-200 text-sm text-stone-850"
            value={selectedHandTattva}
            onChange={(e) => setSelectedHandTattva(e.target.value)}
          >
            <option value="">All Tattvas</option>
            {handTattvas.map((tattva) => (
              <option key={tattva} value={tattva}>
                {tattva}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            className="form-input bg-white border border-stone-200 text-sm text-stone-850"
            value={selectedDominant}
            onChange={(e) => setSelectedDominant(e.target.value)}
          >
            <option value="">All Dominance</option>
            <option value="Right">Right Handed</option>
            <option value="Left">Left Handed</option>
          </select>
        </div>
      </div>

      {/* Hand Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProfiles.map((p) => {
          const vedic = parseVedicData(p.general_notes);
          const handType = vedic.hand_type || 'Unspecified';
          const description = vedic.notes || 'No description provided';
          const dateStr = p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recently';

          // Extract first available image url
          const thumbnailUrl = p.images.right_palm || p.images.left_palm || p.images.right_back || p.images.left_back || '';
          // Count total uploaded photos
          const totalPhotos = Object.keys(p.images).length;

          return (
            <div
              key={p.id}
              className="glass-panel glass-panel-hover flex flex-row overflow-hidden group border border-stone-200/80 bg-white cursor-pointer hover:shadow-lg transition-all duration-300"
              onClick={() => onSelectProfile(p.id)}
            >
              {/* Small Square Thumbnail */}
              <div className="w-28 h-28 shrink-0 relative bg-stone-100/50 overflow-hidden self-center mx-4 my-3 rounded-lg border border-stone-200/60">
                {thumbnailUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={thumbnailUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-stone-50 flex flex-col items-center justify-center text-stone-300 gap-1">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
              </div>

              {/* Card Metadata Details */}
              <div className="flex-1 py-4 pr-4 pl-2 flex flex-col justify-between min-w-0">
                <div className="space-y-0.5">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm text-stone-900 group-hover:text-accent-gold transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                    <span className="text-[10px] text-stone-400 flex items-center gap-1 font-medium shrink-0">
                      <Calendar className="w-3 h-3" />
                      {dateStr}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-semibold">
                    <span>{p.dominant_hand} Hand</span>
                    <span>·</span>
                    <span>Age {p.age || 'N/A'}</span>
                    <span>·</span>
                    <span>{p.gender || 'N/A'}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 py-0.5">
                    {vedic.hand_type && (
                      <span className="text-[9px] bg-purple-50 text-purple-700 border border-purple-200/50 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider">
                        🤚 {vedic.hand_type}
                      </span>
                    )}
                    {vedic.hand_tattva && (
                      <span className="text-[9px] bg-amber-50 text-accent-gold border border-amber-200/50 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider">
                        ✨ {vedic.hand_tattva}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-stone-500 text-[11px] line-clamp-2 leading-normal">
                    {description}
                  </p>
                </div>

                {/* Bottom Badges and Actions */}
                <div className="flex items-center justify-between pt-1.5">
                  <div className="flex gap-1 flex-wrap">
                    {totalPhotos > 0 && (
                      <span className="bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                        📸 {totalPhotos}
                      </span>
                    )}
                    {p.pins.length > 0 && (
                      <span className="bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                        📍 {p.pins.length}
                      </span>
                    )}
                    {p.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="bg-amber-500/10 text-accent-gold border border-amber-500/20 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectProfile(p.id)}
                      className="text-[10px] font-bold text-accent-gold hover:text-stone-950 flex items-center gap-0.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View & Edit
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete analysis profile for "${p.name}"?`)) {
                          onDeleteProfile(p.id);
                        }
                      }}
                      className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                      title="Delete profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading or Empty State Centering */}
      {isLoading ? (
        <div className="text-center py-32 bg-gradient-to-b from-stone-50/80 to-stone-50/40 rounded-2xl border border-stone-200/60 shadow-sm flex flex-col items-center justify-center space-y-6">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-stone-200/60"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-accent-gold animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-stone-850 text-base font-serif tracking-wider">Connecting to Databank</h3>
            <p className="text-stone-500 text-sm">Retrieving secure analysis profiles...</p>
          </div>
        </div>
      ) : filteredProfiles.length === 0 && (
        <div className="text-center py-28 bg-white rounded-2xl border-2 border-dashed border-stone-300/60 shadow-sm flex flex-col items-center justify-center space-y-5">
          <HelpCircle className="w-14 h-14 text-stone-300 block" />
          <div className="space-y-2">
            <h3 className="font-bold text-stone-850 text-xl font-serif">No Profiles Found</h3>
            <p className="text-stone-500 text-sm max-w-sm mx-auto leading-relaxed">
              Try adjusting your search query, selecting different filters, or create your first hand analysis profile!
            </p>
          </div>
          <button
            onClick={onCreateNew}
            className="btn-gold text-sm px-6 py-2.5 mt-2 shadow-md"
          >
            + Create New Profile
          </button>
        </div>
      )}
    </div>
  );
}
