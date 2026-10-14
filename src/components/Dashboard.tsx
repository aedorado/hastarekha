'use client';

import React, { useState, useMemo } from 'react';
import { HandProfile, parseVedicData, getVedicInterpretations } from '@/lib/supabase';
import { Search, Plus, Calendar, Download, Upload, Trash2, Eye, HelpCircle, ImageIcon, SlidersHorizontal, ChevronDown, ChevronUp, X, Sparkles, RotateCcw } from 'lucide-react';
import OptimizedHandImage from '@/components/OptimizedHandImage';
import ConfirmModal from '@/components/ConfirmModal';
import { useAdmin } from '@/context/AdminContext';

// ─── Canonical lecture categories (Notes 01–27) ───
const CANONICAL_TATTVAS = [
  { value: 'Agni Tattva', label: 'Agni Tattva (Fire Hand)' },
  { value: 'Jala Tattva', label: 'Jala Tattva (Water Hand)' },
  { value: 'Pṛthvī Tattva', label: 'Pṛthvī Tattva (Earth Hand)' },
  { value: 'Vāyu Tattva', label: 'Vāyu Tattva (Air Hand)' },
];

const CANONICAL_HAND_TYPES = [
  { value: 'Elementary Hand', label: 'Elementary Hand (श्रमिक हाथ)' },
  { value: 'Square Hand', label: 'Square (Useful) Hand (वर्गाकार)' },
  { value: 'Spatulate Hand', label: 'Spatulate (Active) Hand (चमचाकार)' },
  { value: 'Philosophic Hand', label: 'Philosophic (Knotty) Hand (दार्शनिक)' },
  { value: 'Conic Hand', label: 'Conic (Artistic) Hand' },
  { value: 'Psychic Hand', label: 'Psychic (Idealistic) Hand' },
  { value: 'Mixed Hand', label: 'Mixed Hand (मिश्रित हाथ)' },
];

const PARVATAS = [
  { key: 'all', label: 'Any Mount (सभी पर्वत)' },
  { key: 'mount_jupiter', label: 'Guru (Jupiter Mount)' },
  { key: 'mount_saturn', label: 'Śani (Saturn Mount)' },
  { key: 'mount_sun', label: 'Sūrya (Sun Mount)' },
  { key: 'mount_mercury', label: 'Budha (Mercury Mount)' },
  { key: 'mount_mars_upper', label: 'Upper Mars (उच्च मंगल)' },
  { key: 'mount_mars_lower', label: 'Lower Mars (निम्न मंगल)' },
  { key: 'mount_mars_plain', label: 'Plain of Mars (मंगल मैदान)' },
  { key: 'mount_moon', label: 'Candra (Moon Mount)' },
  { key: 'mount_venus', label: 'Śukra (Venus Mount)' },
  { key: 'mount_ketu', label: 'Ketu Parvata (Wrist Base)' },
];

const CIHNAS = [
  { value: 'all', label: 'Any Sign (सभी चिह्न)' },
  { value: 'Star', label: 'Star ⭐ (Tārā)' },
  { value: 'Cross', label: 'Cross ✝' },
  { value: 'Square', label: 'Square □ (Caturbhuja / Teacher’s Square)' },
  { value: 'Trident', label: 'Trident ψ (Triśūla)' },
  { value: 'Triangle', label: 'Triangle △ (Trikoṇa)' },
  { value: 'Fish', label: 'Fish 🐟 (Matsya)' },
  { value: 'Canopy', label: 'Canopy / Circle (Chatra)' },
  { value: 'Diamond Chain', label: 'Diamond Chain (Vajra Śṛṅkhalā)' },
  { value: 'Grille', label: 'Net / Grille # (Jālī)' },
  { value: 'Mole', label: 'Mole / Spot • (Til / Bindu)' },
];

const LINE_FORMATIONS = [
  { value: '', label: 'All Line Formations' },
  { value: 'supportive_life', label: 'Supportive Line on Life (Devatā Rakṣā — Note 20 §4.4)' },
  { value: 'fate_moon', label: 'Fate Line from Moon (Candra — Note 22 §2)' },
  { value: 'fate_life', label: 'Fate Line from Life Line (Self-made — Note 22 §2)' },
  { value: 'writers_fork', label: 'Writer’s Fork on Mind Line (Note 24/25)' },
  { value: 'guru_fork', label: 'Guru Fork on Heart Line (Note 25/26)' },
  { value: 'simian', label: 'Full / Semi-Simian Formation (Note 24/25)' },
];

const BUDHA_REKHA_OPTIONS = [
  { value: '', label: 'Any Mercury Line State' },
  { value: 'absent', label: 'Absent (Considered good — healthy constitution, Note 27 §9)' },
  { value: 'above_heart', label: 'Starts above Heart (Healer / Speech / Vāṇī, Note 27 §9)' },
  { value: 'below_heart', label: 'Starts below Heart (Liver / Digestive issues, Note 27 §9)' },
  { value: 'intuition', label: 'Joined to Moon (Intuition Line, Note 27 §9)' },
];

const PALM_COLORS = [
  { value: '', label: 'Any Palm Color' },
  { value: 'Pinkish', label: 'Pinkish (Healthy baseline — Note 04)' },
  { value: 'Pale', label: 'Pale / Whitish (Low vitality / Anemia — Note 04)' },
  { value: 'Yellow', label: 'Yellow (Liver / Pitta alert — Note 04)' },
  { value: 'Reddish', label: 'Reddish (Heat / Mars influence — Note 04)' },
  { value: 'Blu', label: 'Bluish (Kidney / Renal alert — Note 04)' },
  { value: 'Purple', label: 'Purple / Aubergine (Critical condition alert — Note 04)' },
];

const NAIL_SURFACES = [
  { value: '', label: 'Any Nail Surface' },
  { value: 'Vertical', label: 'Vertical lines (Father inheritance / stress — Note 12 §7)' },
  { value: 'Fluted', label: 'Fluted ridges (Severe arthritis / vascular alert — Note 12 §7)' },
  { value: 'Horizontal', label: 'Horizontal ridges (Mother inheritance / acute shock — Note 12 §8)' },
  { value: 'Brittle', label: 'Brittle / Breaks easily (Note 12)' },
];

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
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'name'>('updated');
  const [expandedReadings, setExpandedReadings] = useState<Record<string, boolean>>({});
  const { isAdmin } = useAdmin();
  const [profileToDelete, setProfileToDelete] = useState<HandProfile | null>(null);
  const [pendingImport, setPendingImport] = useState<{ profiles: HandProfile[]; srs: Record<string, any> | null } | null>(null);
  const [isDumpingDb, setIsDumpingDb] = useState(false);

  // Sāstra Dimensions state (Notes 01–27)
  const [showSastraPanel, setShowSastraPanel] = useState(false);
  const [filterMount, setFilterMount] = useState('all');
  const [filterSign, setFilterSign] = useState('all');
  const [filterLineFormation, setFilterLineFormation] = useState('');
  const [filterBudhaRekha, setFilterBudhaRekha] = useState('');
  const [filterPalmColor, setFilterPalmColor] = useState('');
  const [filterNailSurface, setFilterNailSurface] = useState('');
  const [filterLunula, setFilterLunula] = useState('');

  // Active filter count calculations
  const activeSastraCount = useMemo(() => {
    let count = 0;
    if (filterMount !== 'all' || filterSign !== 'all') count++;
    if (filterLineFormation) count++;
    if (filterBudhaRekha) count++;
    if (filterPalmColor) count++;
    if (filterNailSurface) count++;
    if (filterLunula) count++;
    return count;
  }, [filterMount, filterSign, filterLineFormation, filterBudhaRekha, filterPalmColor, filterNailSurface, filterLunula]);

  const totalActiveFiltersCount = useMemo(() => {
    let count = activeSastraCount;
    if (selectedHandType) count++;
    if (selectedHandTattva) count++;
    if (selectedDominant) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [activeSastraCount, selectedHandType, selectedHandTattva, selectedDominant, searchQuery]);

  const resetSastraFilters = () => {
    setFilterMount('all');
    setFilterSign('all');
    setFilterLineFormation('');
    setFilterBudhaRekha('');
    setFilterPalmColor('');
    setFilterNailSurface('');
    setFilterLunula('');
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedHandType('');
    setSelectedHandTattva('');
    setSelectedDominant('');
    resetSastraFilters();
  };

  // Memoized Vedic analysis per profile: parsed once when profiles update, 0ms re-renders
  const profileVedicMap = useMemo(() => {
    const map = new Map<string, { vedic: ReturnType<typeof parseVedicData>; readings: string[] }>();
    for (const p of profiles) {
      const vedic = parseVedicData(p.general_notes);
      const readings = getVedicInterpretations(vedic);
      map.set(p.id, { vedic, readings });
    }
    return map;
  }, [profiles]);

  // Filter profiles based on search/filters
  const filteredProfiles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return profiles.filter((p) => {
      const analysis = profileVedicMap.get(p.id);
      const vedic = analysis?.vedic || parseVedicData(p.general_notes);
      const readings = analysis?.readings || [];
      const matchesReadings = readings.some((r) => r.toLowerCase().includes(q));

      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        vedic.notes.toLowerCase().includes(q) ||
        vedic.hand_type.toLowerCase().includes(q) ||
        vedic.hand_tattva.toLowerCase().includes(q) ||
        matchesReadings;

      // 1. Canonical Hand Type (Lecture 05)
      const matchesHandType =
        !selectedHandType ||
        (vedic.hand_type &&
          (vedic.hand_type.toLowerCase().includes(selectedHandType.toLowerCase()) ||
            selectedHandType.toLowerCase().includes(vedic.hand_type.toLowerCase())));

      // 2. Canonical Hand Tattva (Lectures 02–04)
      const matchesHandTattva =
        !selectedHandTattva ||
        (vedic.hand_tattva && vedic.hand_tattva.includes(selectedHandTattva));

      // 3. Dominant Hand
      const matchesDominant = !selectedDominant || p.dominant_hand === selectedDominant;

      // 4. Parvatas & Cihnas (Mounts & Signs — Lectures 13–18, 19–21)
      let matchesMountSign = true;
      if (filterMount !== 'all' || filterSign !== 'all') {
        const ALL_MOUNTS_LIST = [
          vedic.mount_jupiter,
          vedic.mount_saturn,
          vedic.mount_sun,
          vedic.mount_mercury,
          vedic.mount_mars_upper,
          vedic.mount_mars_lower,
          vedic.mount_mars_plain,
          vedic.mount_moon,
          vedic.mount_venus,
          vedic.mount_ketu,
        ];

        if (filterMount === 'all') {
          // Check if any mount has the requested sign
          matchesMountSign = ALL_MOUNTS_LIST.some((m) =>
            m?.signs?.some((s) => s.toLowerCase().includes(filterSign.toLowerCase()))
          );
        } else {
          const targetMountData = (vedic as any)[filterMount];
          if (filterSign === 'all') {
            matchesMountSign = (targetMountData?.signs?.length ?? 0) > 0;
          } else {
            matchesMountSign = (targetMountData?.signs ?? []).some((s: string) =>
              s.toLowerCase().includes(filterSign.toLowerCase())
            );
          }
        }
      }

      // 5. Line Formations (Lectures 19–27)
      let matchesLineFormation = true;
      if (filterLineFormation === 'supportive_life') {
        matchesLineFormation = !!(
          vedic.line_life?.features?.some((f) =>
            f.toLowerCase().includes('supportive') || f.toLowerCase().includes('mars line')
          )
        );
      } else if (filterLineFormation === 'fate_moon') {
        matchesLineFormation = !!(
          vedic.line_fate?.origin?.toLowerCase().includes('moon') ||
          vedic.line_fate?.origin?.toLowerCase().includes('candra')
        );
      } else if (filterLineFormation === 'fate_life') {
        matchesLineFormation = !!(
          vedic.line_fate?.origin?.toLowerCase().includes('life')
        );
      } else if (filterLineFormation === 'writers_fork') {
        matchesLineFormation = !!(
          vedic.line_head?.features?.some((f) => f.toLowerCase().includes('writer'))
        );
      } else if (filterLineFormation === 'guru_fork') {
        matchesLineFormation = !!(
          vedic.line_heart?.features?.some((f) =>
            f.toLowerCase().includes('guru') || f.toLowerCase().includes('fork')
          )
        );
      } else if (filterLineFormation === 'simian') {
        matchesLineFormation = !!(
          vedic.simian_type && vedic.simian_type !== 'None'
        );
      }

      // 6. Budha Rekhā / Health Line (Lecture 27 §9)
      let matchesBudhaRekha = true;
      if (filterBudhaRekha === 'absent') {
        matchesBudhaRekha = vedic.line_mercury_present === false;
      } else if (filterBudhaRekha === 'above_heart') {
        matchesBudhaRekha = vedic.line_mercury_starts_above_heart === true;
      } else if (filterBudhaRekha === 'below_heart') {
        matchesBudhaRekha = vedic.line_mercury_starts_below_heart === true;
      } else if (filterBudhaRekha === 'intuition') {
        matchesBudhaRekha = vedic.line_mercury_joins_moon === true;
      }

      // 7. Palm Color (Lecture 04)
      let matchesPalmColor = true;
      if (filterPalmColor) {
        matchesPalmColor = !!(
          vedic.palm_color &&
          vedic.palm_color.toLowerCase().includes(filterPalmColor.toLowerCase())
        );
      }

      // 8. Nail Surface (Lecture 12)
      let matchesNailSurface = true;
      if (filterNailSurface) {
        matchesNailSurface = !!(
          vedic.nail_surface &&
          vedic.nail_surface.toLowerCase().includes(filterNailSurface.toLowerCase())
        );
      }

      // 9. Chandramā / Lunulae (Lecture 12 §14)
      let matchesLunula = true;
      if (filterLunula === 'absent') {
        matchesLunula = !!(
          vedic.nail_lunula &&
          vedic.nail_lunula.toLowerCase().includes('absent')
        );
      } else if (filterLunula === 'present') {
        matchesLunula = !!(
          vedic.nail_lunula &&
          !vedic.nail_lunula.toLowerCase().includes('absent')
        );
      }

      return (
        matchesSearch &&
        matchesHandType &&
        matchesHandTattva &&
        matchesDominant &&
        matchesMountSign &&
        matchesLineFormation &&
        matchesBudhaRekha &&
        matchesPalmColor &&
        matchesNailSurface &&
        matchesLunula
      );
    }).sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'created') {
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        return timeB - timeA;
      }
      // default 'updated': most recently updated or created first
      const timeA = new Date(a.updated_at || a.created_at || 0).getTime();
      const timeB = new Date(b.updated_at || b.created_at || 0).getTime();
      return timeB - timeA;
    });
  }, [
    profiles,
    profileVedicMap,
    searchQuery,
    selectedHandType,
    selectedHandTattva,
    selectedDominant,
    sortBy,
    filterMount,
    filterSign,
    filterLineFormation,
    filterBudhaRekha,
    filterPalmColor,
    filterNailSurface,
    filterLunula,
  ]);

  // Live DB dump for Admins (freshly pulls from Supabase if connected)
  const handleDbDump = async () => {
    setIsDumpingDb(true);
    try {
      let exportProfiles = profiles;
      if (isSupabaseConnected) {
        try {
          const res = await fetch('/api/hands', { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              exportProfiles = data;
            }
          }
        } catch {
          // fallback to loaded profiles
        }
      }

      let srsProgress = {};
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('hastarekha_srs_progress_v1');
          if (raw) srsProgress = JSON.parse(raw);
        } catch {}
      }

      const backupBundle = {
        version: 2,
        exported_at: new Date().toISOString(),
        profiles_count: exportProfiles.length,
        profiles: exportProfiles,
        srs_progress: srsProgress,
      };

      const dataStr = JSON.stringify(backupBundle, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `hastarekha-full-db-dump-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (e) {
      alert('Failed to generate DB dump');
    } finally {
      setIsDumpingDb(false);
    }
  };

  // JSON import restore (supports both v2 bundle and legacy flat array)
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          let importedProfiles: HandProfile[] = [];
          let importedSrs: Record<string, any> | null = null;

          if (Array.isArray(parsed)) {
            // Legacy format: raw array of profiles
            importedProfiles = parsed;
          } else if (parsed && Array.isArray(parsed.profiles)) {
            // v2 bundle format: object with profiles & srs_progress
            importedProfiles = parsed.profiles;
            if (parsed.srs_progress && typeof parsed.srs_progress === 'object') {
              importedSrs = parsed.srs_progress;
            }
          } else {
            alert('Invalid backup format. Must be a JSON array or HastaRekhā backup bundle.');
            return;
          }

          if (importedProfiles.length === 0) {
            alert('No valid hand profiles found in the uploaded file.');
            return;
          }

          setPendingImport({ profiles: importedProfiles, srs: importedSrs });
        } catch (error) {
          alert('Failed to parse JSON file.');
        }
      };
    }
  };

  const handleConfirmImport = () => {
    if (!pendingImport) return;
    const { profiles: importedProfiles, srs: importedSrs } = pendingImport;
    if (importedSrs && typeof window !== 'undefined') {
      try {
        const existingRaw = localStorage.getItem('hastarekha_srs_progress_v1');
        const existing = existingRaw ? JSON.parse(existingRaw) : {};
        const merged = { ...existing, ...importedSrs };
        localStorage.setItem('hastarekha_srs_progress_v1', JSON.stringify(merged));
      } catch (storageErr) {
        console.warn('Could not restore SRS progress into localStorage', storageErr);
      }
    }
    onImportData(importedProfiles);
    setPendingImport(null);
  };

  return (
    <div className="space-y-8">
      {/* Top Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-2xl border border-stone-200/80 shadow-md">
        <div className="flex-1">
          <h1 className="mystic-title text-4xl font-bold mb-2">Hasta-Rekhā Databank</h1>
          <p className="text-stone-600 text-base mb-3">
            Analyze, annotate, and catalog hand profiles for your Sāmudrika Śāstra study.
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

          {/* Admin Database Tools: Full Live Dump & Import */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 bg-amber-50/80 p-1 rounded-xl border border-amber-200 shadow-xs">
              <button
                type="button"
                onClick={handleDbDump}
                disabled={isDumpingDb}
                className="btn-outline text-xs px-2.5 sm:px-3 py-1.5 border-amber-300 text-amber-900 hover:bg-amber-100 flex items-center gap-1.5 font-semibold transition cursor-pointer"
                title="Download full live database dump (JSON)"
              >
                <Download className="w-3.5 h-3.5 text-amber-700" />
                {isDumpingDb ? 'Dumping DB...' : 'DB Dump'}
              </button>

              <label
                className="btn-outline text-xs px-2.5 sm:px-3 py-1.5 border-amber-300 text-amber-900 hover:bg-amber-100 flex items-center gap-1.5 font-semibold cursor-pointer transition"
                title="Restore DB from backup JSON"
              >
                <Upload className="w-3.5 h-3.5 text-amber-700" />
                Import DB
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4 bg-stone-50/60 p-6 rounded-xl border border-stone-200/60 shadow-sm backdrop-blur-sm">
        {/* Search input (full width) */}
        <div className="search-input-wrapper w-full relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            className="form-input search-input-field text-sm w-full pl-10"
            placeholder="Search by name, tag (e.g. #fish-sign) or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Dropdowns Row (4 canonical responsive columns) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <select
              className="form-input bg-white border border-stone-200 text-xs sm:text-sm text-stone-850 w-full"
              value={selectedHandType}
              onChange={(e) => setSelectedHandType(e.target.value)}
            >
              <option value="">All 7 Hand Types (Note 05)</option>
              {CANONICAL_HAND_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="form-input bg-white border border-stone-200 text-xs sm:text-sm text-stone-850 w-full"
              value={selectedHandTattva}
              onChange={(e) => setSelectedHandTattva(e.target.value)}
            >
              <option value="">All 4 Tattvas (Notes 02–04)</option>
              {CANONICAL_TATTVAS.map((tattva) => (
                <option key={tattva.value} value={tattva.value}>
                  {tattva.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="form-input bg-white border border-stone-200 text-xs sm:text-sm text-stone-850 w-full"
              value={selectedDominant}
              onChange={(e) => setSelectedDominant(e.target.value)}
            >
              <option value="">All Dominance</option>
              <option value="Right">Right Handed</option>
              <option value="Left">Left Handed</option>
            </select>
          </div>

          <div>
            <select
              className="form-input bg-white border border-stone-200 text-xs sm:text-sm text-stone-850 w-full font-medium"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="updated">Sort: Recently Edited</option>
              <option value="created">Sort: Recently Created</option>
              <option value="name">Sort: Name (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Sāstra Dimensions Toggle Button & Active Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-200/50">
          <button
            type="button"
            onClick={() => setShowSastraPanel((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
              showSastraPanel || activeSastraCount > 0
                ? 'bg-amber-100/70 border-amber-300 text-amber-900 shadow-2xs'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
            <span>Sāstra Dimensions (Notes 01–27)</span>
            {activeSastraCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-600 text-white rounded-full text-[10px] font-bold">
                {activeSastraCount}
              </span>
            )}
            {showSastraPanel ? (
              <ChevronUp className="w-3.5 h-3.5 ml-0.5 text-stone-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-stone-500" />
            )}
          </button>

          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span>
              Showing <strong className="text-stone-800">{filteredProfiles.length}</strong> of{' '}
              {profiles.length} hands
            </span>
            {totalActiveFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset all filters
              </button>
            )}
          </div>
        </div>

        {/* Expandable Sāstra Dimensions Panel (Notes 01–27) */}
        {showSastraPanel && (
          <div className="bg-white/95 border border-amber-200/80 rounded-xl p-4 shadow-xs space-y-4 animate-fade-in text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="font-serif font-bold text-stone-900 tracking-wide text-sm">
                  Sāstra Research Dimensions (Lectures 01–27)
                </span>
                <span className="hidden sm:inline text-[11px] text-stone-500">
                  — Filter directly against structured lecture parameters
                </span>
              </div>
              {activeSastraCount > 0 && (
                <button
                  type="button"
                  onClick={resetSastraFilters}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 transition cursor-pointer"
                >
                  Clear Sāstra Filters ({activeSastraCount})
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1: Parvatas & Cihnas (Mounts & Signs) */}
              <div className="space-y-2 bg-stone-50/60 p-3 rounded-lg border border-stone-200/70">
                <span className="font-bold text-[11px] text-stone-800 uppercase tracking-wider block">
                  1. Parvatas &amp; Cihnas (Notes 13–21)
                </span>
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block mb-1">Target Mount (पर्वत)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs w-full"
                    value={filterMount}
                    onChange={(e) => setFilterMount(e.target.value)}
                  >
                    {PARVATAS.map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block mb-1">Auspicious/Inauspicious Sign (चिह्न)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs w-full"
                    value={filterSign}
                    onChange={(e) => setFilterSign(e.target.value)}
                  >
                    {CIHNAS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Column 2: Pradhāna Rekhās (Major Lines) */}
              <div className="space-y-2 bg-stone-50/60 p-3 rounded-lg border border-stone-200/70">
                <span className="font-bold text-[11px] text-stone-800 uppercase tracking-wider block">
                  2. Rekhā Formations (Notes 19–27)
                </span>
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block mb-1">Line Formations &amp; Yogas</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs w-full"
                    value={filterLineFormation}
                    onChange={(e) => setFilterLineFormation(e.target.value)}
                  >
                    {LINE_FORMATIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block mb-1">Budha Rekhā / Health Line (Note 27 §9)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs w-full"
                    value={filterBudhaRekha}
                    onChange={(e) => setFilterBudhaRekha(e.target.value)}
                  >
                    {BUDHA_REKHA_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Column 3: Nakha & Karatala (Nails & Color) */}
              <div className="space-y-2 bg-stone-50/60 p-3 rounded-lg border border-stone-200/70">
                <span className="font-bold text-[11px] text-stone-800 uppercase tracking-wider block">
                  3. Nakha &amp; Karatala (Notes 04, 11–12)
                </span>
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block mb-1">Karatala Varṇa (Palm Color — Note 04)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs w-full"
                    value={filterPalmColor}
                    onChange={(e) => setFilterPalmColor(e.target.value)}
                  >
                    {PALM_COLORS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block mb-1">Nakha Surface (Nail Health — Note 12)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs w-full"
                    value={filterNailSurface}
                    onChange={(e) => setFilterNailSurface(e.target.value)}
                  >
                    {NAIL_SURFACES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block mb-1">Chandramā (Lunulae — Note 12 §14)</label>
                  <select
                    className="form-input bg-white border border-stone-200 text-xs w-full"
                    value={filterLunula}
                    onChange={(e) => setFilterLunula(e.target.value)}
                  >
                    <option value="">Any Lunula State</option>
                    <option value="present">Visible (Normal crescent)</option>
                    <option value="absent">Absent / Vanishing (Low metabolic fire)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Dismissible Pills Bar */}
        {totalActiveFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-stone-500 mr-1 uppercase tracking-wider">Active:</span>

            {selectedHandType && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-amber-50 border border-amber-200 text-amber-900 font-medium shadow-2xs">
                Hand Type: {selectedHandType.split(' ')[0]}
                <button
                  type="button"
                  onClick={() => setSelectedHandType('')}
                  className="hover:text-amber-950 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedHandTattva && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-amber-50 border border-amber-200 text-amber-900 font-medium shadow-2xs">
                Tattva: {selectedHandTattva.split(' ')[0]}
                <button
                  type="button"
                  onClick={() => setSelectedHandTattva('')}
                  className="hover:text-amber-950 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedDominant && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-stone-100 border border-stone-300 text-stone-800 font-medium shadow-2xs">
                Dominance: {selectedDominant}
                <button
                  type="button"
                  onClick={() => setSelectedDominant('')}
                  className="hover:text-stone-950 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {(filterMount !== 'all' || filterSign !== 'all') && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium shadow-2xs">
                Mount/Sign: {PARVATAS.find((m) => m.key === filterMount)?.label.split(' ')[0]} + {filterSign}
                <button
                  type="button"
                  onClick={() => {
                    setFilterMount('all');
                    setFilterSign('all');
                  }}
                  className="hover:text-indigo-950 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterLineFormation && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-purple-50 border border-purple-200 text-purple-900 font-medium shadow-2xs">
                Formation: {LINE_FORMATIONS.find((f) => f.value === filterLineFormation)?.label.split('(')[0]}
                <button
                  type="button"
                  onClick={() => setFilterLineFormation('')}
                  className="hover:text-purple-950 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterBudhaRekha && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-teal-50 border border-teal-200 text-teal-900 font-medium shadow-2xs">
                Budha Rekhā: {BUDHA_REKHA_OPTIONS.find((b) => b.value === filterBudhaRekha)?.label.split('(')[0]}
                <button
                  type="button"
                  onClick={() => setFilterBudhaRekha('')}
                  className="hover:text-teal-950 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterPalmColor && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-rose-50 border border-rose-200 text-rose-900 font-medium shadow-2xs">
                Color: {PALM_COLORS.find((c) => c.value === filterPalmColor)?.label.split('(')[0]}
                <button
                  type="button"
                  onClick={() => setFilterPalmColor('')}
                  className="hover:text-rose-950 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterNailSurface && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-amber-50 border border-amber-200 text-amber-900 font-medium shadow-2xs">
                Nail: {NAIL_SURFACES.find((s) => s.value === filterNailSurface)?.label.split('(')[0]}
                <button
                  type="button"
                  onClick={() => setFilterNailSurface('')}
                  className="hover:text-amber-950 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterLunula && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-blue-50 border border-blue-200 text-blue-900 font-medium shadow-2xs">
                Lunulae: {filterLunula === 'absent' ? 'Absent' : 'Present'}
                <button
                  type="button"
                  onClick={() => setFilterLunula('')}
                  className="hover:text-blue-950 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hand Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProfiles.map((p) => {
          const analysis = profileVedicMap.get(p.id);
          const vedic = analysis?.vedic || parseVedicData(p.general_notes);
          const readings = analysis?.readings || [];
          const handType = vedic.hand_type || 'Unspecified';
          const description = vedic.notes || 'No description provided';
          const dateStr = p.updated_at
            ? `Edited ${new Date(p.updated_at).toLocaleDateString()}`
            : p.created_at
            ? new Date(p.created_at).toLocaleDateString()
            : 'Recently';

          // Extract first available image url
          const thumbnailUrl = p.images.right_palm || p.images.left_palm || p.images.right_back || p.images.left_back || '';
          // Count total uploaded photos
          const totalPhotos = Object.keys(p.images).length;

          return (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              aria-label={`Open profile for ${p.name}`}
              className="glass-panel glass-panel-hover flex flex-row overflow-hidden group border border-stone-200/80 bg-white cursor-pointer hover:shadow-lg focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:outline-hidden transition-all duration-300"
              onClick={() => onSelectProfile(p.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectProfile(p.id);
                }
              }}
            >
              {/* Small Square Thumbnail */}
              <div className="w-28 h-28 shrink-0 relative bg-stone-100/50 overflow-hidden self-center mx-4 my-3 rounded-lg border border-stone-200/60">
                {thumbnailUrl ? (
                  <OptimizedHandImage
                    key={thumbnailUrl}
                    src={thumbnailUrl}
                    alt={p.name}
                    fill
                    sizes="112px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
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
                    {p.dob && (
                      <>
                        <span>·</span>
                        <span>🎂 {p.dob}</span>
                      </>
                    )}
                    {p.pob && (
                      <>
                        <span>·</span>
                        <span>📍 {p.pob}</span>
                      </>
                    )}
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
                    {vedic.thumb_type && (
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200/50 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider">
                        👍 {vedic.thumb_type}
                      </span>
                    )}
                    {vedic.jupiter_length && (
                      <span className="text-[9px] bg-teal-50 text-teal-700 border border-teal-200/50 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider">
                        ♃ {vedic.jupiter_length}
                      </span>
                    )}
                    {vedic.mercury_length && (
                      <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200/50 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider">
                        ☿ {vedic.mercury_length}
                      </span>
                    )}
                  </div>

                  <p className="text-stone-500 text-[11px] line-clamp-2 leading-normal">
                    {description}
                  </p>

                  {readings.length > 0 && (() => {
                    const isExpanded = !!expandedReadings[p.id];
                    return (
                      <div className="mt-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setExpandedReadings(prev => ({ ...prev, [p.id]: !isExpanded }))}
                          className="text-[9px] font-bold text-accent-gold hover:text-stone-900 flex items-center gap-1 transition-colors uppercase tracking-wider bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 cursor-pointer"
                        >
                          📖 {isExpanded ? 'Hide Readings' : `Show Sāmudrika Readings (${readings.length})`}
                        </button>
                        
                        {isExpanded && (
                          <div className="mt-1.5 p-2 bg-stone-50/80 border border-stone-200 rounded-lg text-[10px] space-y-1 max-h-24 overflow-y-auto">
                            {readings.map((r, index) => (
                              <p key={index} className="text-stone-700 font-semibold leading-normal">• {r}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
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

                    {/* Admin Delete Action */}
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProfileToDelete(p);
                        }}
                        className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        title="Delete profile (Admin Only)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading or Empty State Centering */}
      {isLoading ? (
        <div className="text-center py-32 px-6 bg-gradient-to-b from-stone-50/80 to-stone-50/40 rounded-2xl border border-stone-200/60 shadow-sm flex flex-col items-center justify-center space-y-6 p-8">
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
        <div className="text-center py-28 px-6 bg-white rounded-2xl border-2 border-dashed border-stone-300/60 shadow-sm flex flex-col items-center justify-center space-y-5 p-8">
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!profileToDelete}
        title="Delete Analysis Profile?"
        message={
          profileToDelete ? (
            <span>
              Are you sure you want to permanently delete the profile for{' '}
              <strong className="text-stone-900 font-semibold">{profileToDelete.name}</strong>? All associated markings, pins, drawings, and notes will be removed.
            </span>
          ) : ''
        }
        confirmText="Delete Profile"
        variant="danger"
        onConfirm={() => {
          if (profileToDelete) {
            const id = profileToDelete.id;
            setProfileToDelete(null);
            onDeleteProfile(id);
          }
        }}
        onCancel={() => setProfileToDelete(null)}
      />

      {/* Import Database Confirmation Modal */}
      <ConfirmModal
        isOpen={!!pendingImport}
        title="Import Hand Profiles?"
        message={
          pendingImport ? (
            <span>
              Import <strong className="text-stone-900 font-semibold">{pendingImport.profiles.length}</strong> hand profiles
              {pendingImport.srs ? ' and flashcard study history' : ''}? Existing records with matching IDs will be overwritten with the imported versions.
            </span>
          ) : ''
        }
        confirmText="Proceed with Import"
        variant="warning"
        onConfirm={handleConfirmImport}
        onCancel={() => setPendingImport(null)}
      />
    </div>
  );
}
