import { HandProfile, getDemoProfiles, isSupabaseConfigured } from '@/lib/supabase';

const CACHE_KEY = 'hastarekha_profiles_cache_v1';
const CACHE_TIMESTAMP_KEY = 'hastarekha_profiles_cache_time';
const CACHE_TTL_MS = 60 * 1000; // 60 seconds stale-while-revalidate threshold

let inMemoryProfiles: HandProfile[] | null = null;
let inMemoryTimestamp = 0;
const subscribers = new Set<(profiles: HandProfile[]) => void>();

function notifySubscribers(profiles: HandProfile[]) {
  subscribers.forEach((cb) => {
    try {
      cb(profiles);
    } catch (e) {
      console.error('Error notifying cache subscriber:', e);
    }
  });
}

export function subscribeProfilesCache(callback: (profiles: HandProfile[]) => void): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

export function getCachedProfiles(): HandProfile[] | null {
  if (inMemoryProfiles) return inMemoryProfiles;

  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(CACHE_KEY) || localStorage.getItem(CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          inMemoryProfiles = parsed;
          const time = Number(sessionStorage.getItem(CACHE_TIMESTAMP_KEY) || localStorage.getItem(CACHE_TIMESTAMP_KEY) || '0');
          inMemoryTimestamp = time;
          return parsed;
        }
      }
    } catch (e) {
      // ignore JSON parse errors
    }
  }

  return null;
}

export function setCachedProfiles(profiles: HandProfile[]) {
  inMemoryProfiles = profiles;
  inMemoryTimestamp = Date.now();

  if (typeof window !== 'undefined') {
    try {
      const serialized = JSON.stringify(profiles);
      sessionStorage.setItem(CACHE_KEY, serialized);
      sessionStorage.setItem(CACHE_TIMESTAMP_KEY, String(inMemoryTimestamp));
    } catch (e) {
      // storage full or disabled
    }
  }

  notifySubscribers(profiles);
}

export function updateProfileInCache(updated: HandProfile) {
  const current = getCachedProfiles() || [];
  const idx = current.findIndex((p) => p.id === updated.id);
  const next = idx >= 0
    ? [...current.slice(0, idx), updated, ...current.slice(idx + 1)]
    : [updated, ...current];

  setCachedProfiles(next);
}

export function removeProfileFromCache(id: string) {
  const current = getCachedProfiles() || [];
  const next = current.filter((p) => p.id !== id);
  setCachedProfiles(next);
}

export async function loadHandProfiles(options?: { force?: boolean }): Promise<{
  profiles: HandProfile[];
  isSupabaseConnected: boolean;
}> {
  const cached = getCachedProfiles();
  const isFresh = inMemoryTimestamp > 0 && Date.now() - inMemoryTimestamp < CACHE_TTL_MS;

  // If we have fresh cached data and no force refresh requested, return immediately
  if (cached && isFresh && !options?.force) {
    return {
      profiles: cached,
      isSupabaseConnected: isSupabaseConfigured,
    };
  }

  if (isSupabaseConfigured) {
    try {
      const res = await fetch('/api/hands');
      if (res.ok) {
        const data = await res.json();
        if (!data.isDemo) {
          setCachedProfiles(data);
          return { profiles: data, isSupabaseConnected: true };
        }
      }
    } catch (e) {
      console.warn('Network fetch failed, falling back to local cache/demo profiles', e);
    }
  }

  // Fallback to cached or demo profiles
  if (cached && cached.length > 0) {
    return { profiles: cached, isSupabaseConnected: false };
  }

  const demo = getDemoProfiles();
  setCachedProfiles(demo);
  return { profiles: demo, isSupabaseConnected: false };
}
