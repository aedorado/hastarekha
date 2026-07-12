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
  const [selectedDominant, setSelectedDominant] = useState('');

  // Filter profiles based on search/filters
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const vedic = parseVedicData(p.general_notes);
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        vedic.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vedic.hand_type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesHandType = !selectedHandType || vedic.hand_type === selectedHandType;
      
      const matchesDominant = !selectedDominant || p.dominant_hand === selectedDominant;

      return matchesSearch && matchesHandType && matchesDominant;
    });
  }, [profiles, searchQuery, selectedHandType, selectedDominant]);

  // Hand shape types present in data
  const handTypes = useMemo(() => {
    const types = new Set<string>();
    profiles.forEach((p) => {
      const vedic = parseVedicData(p.general_notes);
      if (vedic.hand_type) types.add(vedic.hand_type);
    });
    return Array.from(types);
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
    <div className="space-y-6">
      {/* Top Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="mystic-title text-3xl font-bold">Hasta-Rekhā Databank</h1>
          <p className="text-stone-600 text-sm mt-1">
            Analyze, annotate, and catalog hand profiles for your Sāmudrika Śāstra course.
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {isSupabaseConnected ? 'Connected to Cloud DB' : 'Offline Demo Mode (Local Storage)'}
          </div>
        </div>
        
        <div className="flex gap-2">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200 shadow-sm">
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
            <option value="">All Hand Shapes</option>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              className="glass-panel glass-panel-hover flex flex-col h-[400px] overflow-hidden group border border-stone-200 bg-white"
            >
              {/* Image Preview Thumbnail */}
              <div 
                className="h-44 relative bg-stone-100 cursor-pointer overflow-hidden flex justify-center items-center border-b border-stone-200"
                onClick={() => onSelectProfile(p.id)}
              >
                {thumbnailUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={thumbnailUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-stone-50 flex flex-col items-center justify-center text-stone-400 gap-1.5">
                    <ImageIcon className="w-8 h-8 text-stone-300" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">No Photo Uploaded</span>
                  </div>
                )}
                
                {/* Image overlay badge */}
                <div className="absolute top-3 left-3 bg-stone-900/90 backdrop-blur px-2.5 py-0.5 rounded text-[10px] font-bold text-white shadow-sm">
                  {p.dominant_hand} Hand
                </div>

                <div className="absolute bottom-3 left-3 flex gap-1.5">
                  {totalPhotos > 0 && (
                    <div className="bg-stone-900/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm">
                      📸 {totalPhotos} {totalPhotos === 1 ? 'Photo' : 'Photos'}
                    </div>
                  )}
                  {p.pins.length > 0 && (
                    <div className="bg-stone-900/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm">
                      📍 {p.pins.length} Markers
                    </div>
                  )}
                </div>
              </div>

              {/* Card Metadata Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 
                      onClick={() => onSelectProfile(p.id)}
                      className="font-bold text-lg text-stone-900 hover:text-accent-gold transition-colors cursor-pointer line-clamp-1"
                    >
                      {p.name}
                    </h3>
                    <span className="text-xs text-stone-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {dateStr}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-stone-500 font-semibold">
                    <span>Age: {p.age || 'N/A'}</span>
                    <span>•</span>
                    <span>Gender: {p.gender || 'N/A'}</span>
                  </div>

                  <p className="text-[11px] font-bold text-accent-gold uppercase tracking-wider mt-1">{handType}</p>
                  
                  <p className="text-stone-600 text-xs line-clamp-3 mt-1 leading-normal">
                    {description}
                  </p>
                </div>

                {/* Bottom Tags and Actions */}
                <div className="pt-3 border-t border-stone-200 space-y-3">
                  {/* Tag List */}
                  <div className="flex flex-wrap gap-1 h-6 overflow-hidden">
                    {p.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-amber-500/10 text-accent-gold border border-amber-500/20 px-2 py-0.2 rounded text-[10px] font-semibold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-1">
                    <button
                      onClick={() => onSelectProfile(p.id)}
                      className="text-xs font-bold text-accent-gold hover:text-stone-950 flex items-center gap-1 transition-colors"
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
        <div className="text-center py-28 bg-stone-50/50 rounded-2xl border border-stone-200/60 shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-stone-200/80"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-accent-gold animate-spin"></div>
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-stone-850 text-sm font-serif tracking-wider animate-pulse">Connecting to Databank</h3>
            <p className="text-stone-400 text-[10px]">Retrieving secure analysis profiles...</p>
          </div>
        </div>
      ) : filteredProfiles.length === 0 && (
        <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-stone-200 shadow-sm flex flex-col items-center justify-center">
          <HelpCircle className="w-12 h-12 text-stone-400 mb-3 block" />
          <h3 className="font-bold text-stone-850 text-lg">No Profiles Found</h3>
          <p className="text-stone-500 text-xs mt-1.5 max-w-sm mx-auto text-center leading-relaxed">
            Try adjusting your search query, selecting different filters, or upload your first hand analysis card!
          </p>
          <button
            onClick={onCreateNew}
            className="btn-gold mt-6 text-xs shadow-sm"
          >
            Create New Profile
          </button>
        </div>
      )}
    </div>
  );
}
