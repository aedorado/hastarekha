import { HandProfile, getDemoProfiles, isSupabaseConfigured } from '@/lib/supabase';

const CACHE_KEY = 'hastarekha_profiles_cache_v1';
const CACHE_TIMESTAMP_KEY = 'hastarekha_profiles_cache_time';
const CACHE_IS_FULL_KEY = 'hastarekha_profiles_cache_is_full';
const SINGLE_PROFILE_PREFIX = 'hastarekha_profile_';
const CACHE_TTL_MS = 60 * 1000; // 60 seconds stale-while-revalidate threshold

let inMemoryProfiles: HandProfile[] | null = null;
let inMemoryIsFull = false;
let inMemoryTimestamp = 0;
const singleProfilesMap = new Map<string, HandProfile>();
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

export function isFullListCached(): boolean {
  if (inMemoryProfiles && inMemoryProfiles.length > 0 && inMemoryIsFull) {
    return true;
  }
  if (typeof window !== 'undefined') {
    try {
      return sessionStorage.getItem(CACHE_IS_FULL_KEY) === 'true';
    } catch {
      return false;
    }
  }
  return false;
}

export function getCachedProfiles(): HandProfile[] | null {
  // Only return full catalog list, never partial 1-profile lists
  if (inMemoryProfiles && inMemoryProfiles.length > 0 && inMemoryIsFull) {
    return inMemoryProfiles;
  }

  if (typeof window !== 'undefined') {
    try {
      const isFull = sessionStorage.getItem(CACHE_IS_FULL_KEY) === 'true';
      if (!isFull) {
        return null;
      }
      const stored = sessionStorage.getItem(CACHE_KEY) || localStorage.getItem(CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemoryProfiles = parsed;
          inMemoryIsFull = true;
          const time = Number(
            sessionStorage.getItem(CACHE_TIMESTAMP_KEY) ||
            localStorage.getItem(CACHE_TIMESTAMP_KEY) ||
            '0'
          );
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

export function getCachedProfile(id: string): HandProfile | null {
  if (!id) return null;

  // 1. Check in-memory full list
  if (inMemoryProfiles && inMemoryProfiles.length > 0) {
    const found = inMemoryProfiles.find((p) => p.id === id);
    if (found) return found;
  }

  // 2. Check in-memory single profile map
  if (singleProfilesMap.has(id)) {
    return singleProfilesMap.get(id)!;
  }

  if (typeof window !== 'undefined') {
    // 3. Check single profile in sessionStorage
    try {
      const singleStored = sessionStorage.getItem(SINGLE_PROFILE_PREFIX + id);
      if (singleStored) {
        const parsed = JSON.parse(singleStored);
        if (parsed && parsed.id === id) {
          singleProfilesMap.set(id, parsed);
          return parsed;
        }
      }
    } catch {}

    // 4. Check cached full list in storage
    try {
      const stored = sessionStorage.getItem(CACHE_KEY) || localStorage.getItem(CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const found = parsed.find((p: HandProfile) => p.id === id);
          if (found) return found;
        }
      }
    } catch {}

    // 5. Check demo storage
    try {
      const demo = getDemoProfiles();
      const found = demo.find((p) => p.id === id);
      if (found) return found;
    } catch {}
  }

  return null;
}

export function setCachedProfiles(profiles: HandProfile[], isFullList = true) {
  if (!profiles || profiles.length === 0) {
    inMemoryProfiles = null;
    inMemoryIsFull = false;
    inMemoryTimestamp = 0;
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(CACHE_KEY);
        sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
        sessionStorage.removeItem(CACHE_IS_FULL_KEY);
      } catch (e) {
        // ignore
      }
    }
    notifySubscribers([]);
    return;
  }

  inMemoryProfiles = profiles;
  inMemoryIsFull = isFullList;
  inMemoryTimestamp = Date.now();

  // Also cache individual profiles in map
  for (const p of profiles) {
    if (p.id) {
      singleProfilesMap.set(p.id, p);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const serialized = JSON.stringify(profiles);
      sessionStorage.setItem(CACHE_KEY, serialized);
      sessionStorage.setItem(CACHE_TIMESTAMP_KEY, String(inMemoryTimestamp));
      sessionStorage.setItem(CACHE_IS_FULL_KEY, isFullList ? 'true' : 'false');
    } catch (e) {
      // storage full or disabled
    }
  }

  notifySubscribers(profiles);
}

export function updateProfileInCache(updated: HandProfile) {
  if (!updated || !updated.id) return;

  // Always update single profile cache so /analysis/[id] has immediate access
  singleProfilesMap.set(updated.id, updated);
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(SINGLE_PROFILE_PREFIX + updated.id, JSON.stringify(updated));
    } catch {}
  }

  // If the full list is already in memory or storage, update or prepend in-place
  if (isFullListCached()) {
    const current = inMemoryProfiles || getCachedProfiles() || [];
    const idx = current.findIndex((p) => p.id === updated.id);
    const next = idx >= 0
      ? [...current.slice(0, idx), updated, ...current.slice(idx + 1)]
      : [updated, ...current];

    setCachedProfiles(next, true);
  }
}

export function removeProfileFromCache(id: string) {
  if (!id) return;
  singleProfilesMap.delete(id);
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(SINGLE_PROFILE_PREFIX + id);
    } catch {}
  }

  const current = getCachedProfiles();
  if (current) {
    const next = current.filter((p) => p.id !== id);
    setCachedProfiles(next, isFullListCached());
  }
}

export async function loadHandProfiles(options?: { force?: boolean }): Promise<{
  profiles: HandProfile[];
  isSupabaseConnected: boolean;
}> {
  const cached = getCachedProfiles();
  const isFresh = inMemoryTimestamp > 0 && Date.now() - inMemoryTimestamp < CACHE_TTL_MS;

  // Only skip network if we actually have the complete list in cache and it is fresh
  if (isFullListCached() && cached && cached.length > 0 && isFresh && !options?.force) {
    return {
      profiles: cached,
      isSupabaseConnected: isSupabaseConfigured,
    };
  }

  if (isSupabaseConfigured) {
    try {
      const res = await fetch('/api/hands', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCachedProfiles(data, true);
          return { profiles: data, isSupabaseConnected: true };
        }
      }
    } catch (e) {
      console.warn('Network fetch failed, falling back to local cache/demo profiles', e);
    }
  }

  // Fallback to cached full list
  if (isFullListCached() && cached && cached.length > 0) {
    return { profiles: cached, isSupabaseConnected: false };
  }

  const demo = getDemoProfiles();
  if (demo && demo.length > 0) {
    setCachedProfiles(demo, true);
    return { profiles: demo, isSupabaseConnected: false };
  }

  return { profiles: [], isSupabaseConnected: isSupabaseConfigured };
}
