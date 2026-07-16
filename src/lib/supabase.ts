import { createClient as createBrowserClient } from '@/utils/supabase/client';

export const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export const supabase = isSupabaseConfigured ? createBrowserClient() : null;


export type HandView = 'right_palm' | 'right_back' | 'left_palm' | 'left_back';

export const HAND_VIEW_LABELS: Record<HandView, string> = {
  right_palm: 'Right Palm (Front)',
  right_back: 'Right Hand (Back)',
  left_palm: 'Left Palm (Front)',
  left_back: 'Left Hand (Back)',
};

export interface Pin {
  id: string;
  view: HandView;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  label: string;
  description: string;
  color: string;
}

export interface Drawing {
  id: string;
  view: HandView;
  points: Array<{ x: number; y: number }>;
  color: string;
  thickness: number;
  label?: string;
}

export interface VedicData {
  palm_length: number | '';
  finger_length: number | '';
  palm_width: number | '';
  palm_shape: 'Square' | 'Rectangular' | '';
  texture: number; // 0-100 (stiff to soft)
  thumb_willpower: 'Strong' | 'Weak' | 'Average';
  jupiter_sun_relation: 'Jupiter Longer' | 'Sun Longer' | 'Equal' | '';
  mercury_length: 'Short' | 'Average' | 'Long' | '';
  manibandha_lines: number | '';
  notes: string;
  hand_type: string;
  hand_tattva: string;
  nail_shape: 'Wide/Small' | 'Long/Small' | 'Wide/Big' | 'Square' | 'Beautiful' | '';
  skin_texture: 'Soft/Moisturized' | 'Medium' | 'Hard/Stiff' | 'Rough' | 'Thin-skinned (Nerves visible)' | '';
  finger_knots: 'Smooth' | 'Jupiter & Saturn Knots' | 'Fully Philosophical (Knotty)' | 'Crooked Fingers' | '';
  measurements: {
    palm_start: { x: number; y: number };
    palm_end: { x: number; y: number };
    finger_start: { x: number; y: number };
    finger_end: { x: number; y: number };
    width_start: { x: number; y: number };
    width_end: { x: number; y: number };
  } | null;
}

export const parseVedicData = (notesField: string): VedicData => {
  const defaultData: VedicData = {
    palm_length: '',
    finger_length: '',
    palm_width: '',
    palm_shape: '',
    texture: 50,
    thumb_willpower: 'Average',
    jupiter_sun_relation: '',
    mercury_length: '',
    manibandha_lines: '',
    notes: '',
    hand_type: '',
    hand_tattva: '',
    nail_shape: '',
    skin_texture: '',
    finger_knots: '',
    measurements: null,
  };

  if (!notesField) return defaultData;

  const trimmed = notesField.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      return { ...defaultData, ...JSON.parse(trimmed) };
    } catch (e) {
      // fallback to normal text parsing if JSON parsing fails
    }
  }

  // Fallback for old format: handType|description
  const parts = notesField.split('|');
  if (parts.length > 1) {
    return {
      ...defaultData,
      hand_type: parts[0] || '',
      notes: parts[1] || '',
    };
  }

  return {
    ...defaultData,
    notes: notesField,
  };
};

export const serializeVedicData = (data: VedicData): string => {
  return JSON.stringify(data);
};

export interface HandProfile {
  id: string;
  name: string;
  age: number | '';
  gender: string;
  dominant_hand: 'Left' | 'Right';
  images: Record<string, string>; // e.g. { right_palm: "url", right_back: "url"... }
  general_notes: string;
  mounts_data: Record<string, string>; // mounts details
  lines_data: Record<string, string>;  // lines details
  pins: Pin[];
  drawings: Drawing[];
  tags: string[];
  created_at?: string;
}


const DEMO_STORAGE_KEY = 'hastarekha_demo_db';

export const getDemoProfiles = (): HandProfile[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(DEMO_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveDemoProfile = (profile: HandProfile): HandProfile[] => {
  if (typeof window === 'undefined') return [];
  const current = getDemoProfiles();
  const existingIndex = current.findIndex(p => p.id === profile.id);
  
  if (existingIndex >= 0) {
    current[existingIndex] = { ...profile, created_at: current[existingIndex].created_at || new Date().toISOString() };
  } else {
    current.push({ ...profile, created_at: new Date().toISOString() });
  }
  
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(current));
  return current;
};

export const deleteDemoProfile = (id: string): HandProfile[] => {
  if (typeof window === 'undefined') return [];
  const current = getDemoProfiles();
  const filtered = current.filter(p => p.id !== id);
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
};
