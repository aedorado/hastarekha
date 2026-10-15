import { createClient as createBrowserClient } from '@/utils/supabase/client';
import { HandProfile } from '@/types/palmistry';

export const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export const supabase = isSupabaseConfigured ? createBrowserClient() : null;

// Re-export domain types for backward compatibility
export * from '@/types/palmistry';

// Re-export serializer and interpretations for backward compatibility
export * from '@/lib/vedicSerializer';
export * from '@/lib/vedicInterpretations';

export function calculateAge(dobString: string): number | '' {
  if (!dobString) return '';
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : '';
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
  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    current[existingIndex] = {
      ...profile,
      created_at: current[existingIndex].created_at || now,
      updated_at: now,
    };
  } else {
    current.push({ ...profile, created_at: now, updated_at: now });
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
